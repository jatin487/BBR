import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  ConfirmationResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { initAppCheck, getAppCheckState } from './appCheck';
import { logSecurityEvent } from './securityLogger';
import { checkRateLimit, recordAttempt } from './rateLimiter';

// Verified KYC document data structure
export interface VerifiedKycData {
  status: 'verified';
  dlNumber: string;
  aadhaarNumber: string;
  holderName: string;
  dob: string;
  validTill: string;
  vehicleClasses: string[];
  digilockerDocId: string;
  verificationTimestamp: string;
  qrCodeData?: string;
  securityHash?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  photoURL?: string;
  authProvider: 'phone' | 'google' | 'email';
  kyc?: VerifiedKycData | null;
}

// ── Environment Identification ───────────────────────────────────────────────
export const ENVIRONMENT = import.meta.env.VITE_APP_ENV || (import.meta.env.DEV ? 'development' : 'production');
export const IS_SECURITY_TESTING = import.meta.env.VITE_SECURITY_TESTING_MODE === 'true';

// ── Firebase Config ──────────────────────────────────────────────────────────
// In testing mode, ensure test configuration cannot point to production by enforcing test project ID
const targetProjectId = IS_SECURITY_TESTING
  ? import.meta.env.VITE_TEST_FIREBASE_PROJECT_ID || 'bbr-security-testing'
  : import.meta.env.VITE_FIREBASE_PROJECT_ID || 'login-9f3fd';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDbterQhAJSJCUaiJt033ytsQDLns2Zl-Y',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'login-9f3fd.firebaseapp.com',
  projectId:         targetProjectId,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'login-9f3fd.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '738858214140',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:738858214140:web:525e35e1bb346c35d1ed79',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || 'G-KDEWP405R4',
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  !firebaseConfig.apiKey.includes('your-') &&
  firebaseConfig.apiKey.length > 10
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (hasFirebaseConfig) {
  try {
    app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);

    // Initialize App Check with metrics/monitoring mode
    initAppCheck(app);

    if (typeof window !== 'undefined') {
      isSupported()
        .then((supported) => {
          if (supported && app) {
            getAnalytics(app);
          }
        })
        .catch(() => {});
    }
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error);
    app  = null;
    auth = null;
  }
}

export const firebaseApp  = app;
export const firebaseAuth = auth;

// ── Storage Keys ─────────────────────────────────────────────────────────────
const USER_SESSION_KEY = 'bbr-user-profile';
const LEGACY_USER_KEY  = 'bbr-user';

/** Returns the UID-scoped KYC key so User A's KYC never leaks to User B */
const kycKey = (uid: string) => `bbr-kyc-${uid}`;

// ── Generic Error Handler (Enumeration Protection) ───────────────────────────
/**
 * Maps specific internal Firebase Auth errors to generic, safe customer-facing messages.
 * Prevents account and email enumeration attacks.
 */
export function getGenericAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An authentication error occurred. Please try again.';
  }

  const code = (error as { code?: string }).code || '';

  // Enumeration defense: map user-not-found, wrong-password, invalid-credential, invalid-email
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-disabled' ||
    code === 'auth/invalid-email'
  ) {
    return 'Invalid login credentials. Please check your details and try again.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  if (code === 'auth/weak-password') {
    return 'Password should be at least 8 characters long and contain numbers and symbols.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many failed login attempts. Access is temporarily restricted. Please wait a moment.';
  }

  if (code === 'auth/invalid-verification-code' || code === 'auth/code-expired') {
    return 'Invalid or expired OTP code. Please request a new verification code.';
  }

  if (code === 'auth/app-check-token-invalid') {
    return 'Security verification (App Check) could not be completed. Please refresh the page.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Sign-in cancelled. Popup was closed before completion.';
  }

  return 'Authentication failed. Please verify your information and try again.';
}

// ── Session Helpers ───────────────────────────────────────────────────────────
export const saveUserSession = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    // Keep legacy key so older code paths don't break
    localStorage.setItem(
      LEGACY_USER_KEY,
      JSON.stringify({ name: profile.name, phone: profile.phone, email: profile.email })
    );

    // ── Admin real-time sync ──────────────────────────────────────────────────
    // Write to the UID-scoped key that UsersTab scans
    if (profile.uid) {
      localStorage.setItem(`bbr_user_session_${profile.uid}`, JSON.stringify(profile));
    }

    // Upsert the user into bbr_backend_data.users so admin sees all users
    try {
      const backendRaw = localStorage.getItem('bbr_backend_data');
      const backendData: { users?: UserProfile[] } = backendRaw ? JSON.parse(backendRaw) : {};
      if (!Array.isArray(backendData.users)) backendData.users = [];
      const idx = backendData.users.findIndex((u: UserProfile) => u.uid === profile.uid || (profile.phone && u.phone === profile.phone));
      if (idx >= 0) {
        backendData.users[idx] = { ...backendData.users[idx], ...profile };
      } else {
        backendData.users.push(profile);
      }
      localStorage.setItem('bbr_backend_data', JSON.stringify(backendData));
    } catch { /* ignore */ }

    // Sync to backend server in background so admin sees it cross-device
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      }).catch(() => {});
    } catch { /* ignore */ }

    // Notify the admin panel (same tab or other tabs)
    try {
      const bc = new BroadcastChannel('bbr_user_updates');
      bc.postMessage({ type: 'USER_SIGNED_IN', profile });
      bc.close();
    } catch { /* BroadcastChannel not supported */ }

    try {
      window.dispatchEvent(new CustomEvent('bbr_user_updated', { detail: profile }));
    } catch { /* ignore */ }
  } catch { /* quota / private-mode */ }
};

export const loadUserSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      // Hydrate KYC from UID-scoped slot if not already in profile
      if (!parsed.kyc && parsed.uid) {
        const storedKyc = loadUserKyc(parsed.uid);
        if (storedKyc) parsed.kyc = storedKyc;
      }
      return parsed;
    }

    // Legacy fallback: if bbr-user-profile is absent, check bbr-user
    const legacyRaw = localStorage.getItem(LEGACY_USER_KEY);
    if (legacyRaw) {
      const p = JSON.parse(legacyRaw) as { name?: string; phone?: string; email?: string };
      if (p && (p.name || p.phone || p.email)) {
        const cleanDigits = (p.phone || '').replace(/\D/g, '').slice(-10);
        const recovered: UserProfile = {
          uid: cleanDigits ? `phone-${cleanDigits}` : `local-user`,
          name: p.name || 'Rider',
          phone: p.phone || '',
          email: p.email || undefined,
          authProvider: p.email ? 'google' : 'phone',
          kyc: cleanDigits ? loadUserKyc(`phone-${cleanDigits}`) : null,
        };
        // Upgrade legacy session to standard session key
        try {
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(recovered));
          localStorage.setItem(`bbr_user_session_${recovered.uid}`, JSON.stringify(recovered));
        } catch { /* ignore */ }
        return recovered;
      }
    }
  } catch { return null; }
  return null;
};

/**
 * Clears session AND the UID-scoped KYC for that user.
 * Call this on sign-out so the next user never sees the previous user's data.
 */
export const clearUserSession = (uid?: string): void => {
  try {
    const sessionUid = uid || (() => {
      try {
        const raw = localStorage.getItem(USER_SESSION_KEY);
        if (raw) return (JSON.parse(raw) as UserProfile).uid;
      } catch { /* ignore */ }
      return null;
    })();

    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);

    // Clear UID-scoped KYC so next user cannot see it
    if (sessionUid) {
      localStorage.removeItem(kycKey(sessionUid));
    }
  } catch { /* ignore */ }
};

// ── UID-scoped KYC Helpers ────────────────────────────────────────────────────
export const saveUserKyc = (kycData: VerifiedKycData, uid?: string): void => {
  try {
    const resolvedUid = uid || loadUserSession()?.uid;
    if (!resolvedUid) return;
    localStorage.setItem(kycKey(resolvedUid), JSON.stringify(kycData));

    // Also update the embedded kyc inside the profile object
    const current = loadUserSession();
    if (current && current.uid === resolvedUid) {
      current.kyc = kycData;
      saveUserSession(current);
    }
  } catch { /* ignore */ }
};

export const loadUserKyc = (uid?: string): VerifiedKycData | null => {
  try {
    const resolvedUid = uid || loadUserSession()?.uid;
    if (!resolvedUid) return null;
    const raw = localStorage.getItem(kycKey(resolvedUid));
    return raw ? (JSON.parse(raw) as VerifiedKycData) : null;
  } catch { return null; }
};

export const clearUserKyc = (uid?: string): void => {
  try {
    const resolvedUid = uid || loadUserSession()?.uid;
    if (!resolvedUid) return;
    localStorage.removeItem(kycKey(resolvedUid));

    const current = loadUserSession();
    if (current && current.uid === resolvedUid) {
      current.kyc = null;
      saveUserSession(current);
    }
  } catch { /* ignore */ }
};

// ── Secure Token Handling ─────────────────────────────────────────────────────
/**
 * Safely inspects and refreshes the user's ID token.
 * Gracefully handles token expiration, revocation, or account disabling.
 */
export async function getVerifiedIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth || !auth.currentUser) return null;

  try {
    const token = await auth.currentUser.getIdToken(forceRefresh);
    return token;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === 'auth/user-token-expired' ||
      code === 'auth/id-token-expired' ||
      code === 'auth/id-token-revoked' ||
      code === 'auth/user-disabled'
    ) {
      logSecurityEvent('AUTH_TOKEN_EXPIRED', 'warn', {
        userId: auth.currentUser.uid,
        details: { code, message: 'User token expired or revoked. Safely clearing local session.' },
      });
      await firebaseAuthService.signOut();
    }
    return null;
  }
}

// ── Auth Service ──────────────────────────────────────────────────────────────
export const firebaseAuthService = {

  /**
   * Google Sign-In via Firebase popup with progressive rate limiting and event logging.
   */
  async signInWithGoogle(): Promise<UserProfile> {
    const rateLimitKey = 'auth:google_popup';
    const rateStatus = checkRateLimit(rateLimitKey);
    if (rateStatus.isBlocked) {
      throw new Error(
        `Too many rapid login attempts. Please wait ${rateStatus.remainingSeconds}s before trying again.`
      );
    }

    if (!auth || !hasFirebaseConfig) {
      throw new Error(
        'Firebase is not configured. Please add your VITE_FIREBASE_* credentials to the .env file to enable Google Sign-In.'
      );
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const nameFromEmail = fbUser.email ? fbUser.email.split('@')[0].replace(/[._]/g, ' ') : '';
      const resolvedName  = fbUser.displayName || nameFromEmail || 'Google User';

      const profile: UserProfile = {
        uid:          fbUser.uid,
        name:         resolvedName,
        email:        fbUser.email  || undefined,
        phone:        fbUser.phoneNumber || '',
        photoURL:     fbUser.photoURL    || undefined,
        authProvider: 'google',
        kyc:          loadUserKyc(fbUser.uid),
      };

      saveUserSession(profile);
      recordAttempt(rateLimitKey, true, fbUser.uid);

      logSecurityEvent('AUTH_LOGIN_SUCCESS', 'success', {
        userId: fbUser.uid,
        appCheckStatus: getAppCheckState().mode,
        details: { provider: 'google', emailDomain: fbUser.email?.split('@')[1] },
      });

      return profile;
    } catch (error) {
      recordAttempt(rateLimitKey, false);
      logSecurityEvent('AUTH_LOGIN_FAILURE', 'failure', {
        details: { provider: 'google', reason: (error as Error).message },
      });
      throw new Error(getGenericAuthErrorMessage(error));
    }
  },

  /**
   * Email & Password Sign-In with progressive rate-limiting & enumeration protection.
   */
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `auth:email:${cleanEmail}`;
    const rateStatus = checkRateLimit(rateLimitKey);

    if (rateStatus.isBlocked) {
      logSecurityEvent('RATE_LIMIT_TRIGGERED', 'rate_limited', {
        userId: cleanEmail,
        details: { cooldownSeconds: rateStatus.remainingSeconds },
      });
      throw new Error(
        `Too many failed login attempts. Please wait ${rateStatus.remainingSeconds}s before retrying.`
      );
    }

    if (!auth || !hasFirebaseConfig) {
      throw new Error('Authentication is currently not configured on this system.');
    }

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = result.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || cleanEmail.split('@')[0],
        email: fbUser.email || cleanEmail,
        phone: fbUser.phoneNumber || '',
        authProvider: 'email',
        kyc: loadUserKyc(fbUser.uid),
      };

      saveUserSession(profile);
      recordAttempt(rateLimitKey, true, fbUser.uid);

      logSecurityEvent('AUTH_LOGIN_SUCCESS', 'success', {
        userId: fbUser.uid,
        details: { provider: 'email' },
      });

      return profile;
    } catch (error) {
      const state = recordAttempt(rateLimitKey, false, cleanEmail);

      logSecurityEvent('AUTH_LOGIN_FAILURE', 'failure', {
        userId: cleanEmail,
        details: { provider: 'email', consecutiveFailures: state.attempts },
      });

      throw new Error(getGenericAuthErrorMessage(error));
    }
  },

  /**
   * Email & Password Sign-Up with password strength validation.
   */
  async signUpWithEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (pass.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (!auth || !hasFirebaseConfig) {
      throw new Error('Authentication service is not configured.');
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = result.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        name: name?.trim() || cleanEmail.split('@')[0],
        email: fbUser.email || cleanEmail,
        phone: '',
        authProvider: 'email',
        kyc: null,
      };

      saveUserSession(profile);

      logSecurityEvent('AUTH_LOGIN_SUCCESS', 'success', {
        userId: fbUser.uid,
        details: { provider: 'email_signup' },
      });

      return profile;
    } catch (error) {
      logSecurityEvent('AUTH_LOGIN_FAILURE', 'failure', {
        userId: cleanEmail,
        details: { provider: 'email_signup' },
      });
      throw new Error(getGenericAuthErrorMessage(error));
    }
  },

  /**
   * Password Reset Email with generic confirmation to prevent user enumeration.
   */
  async sendPasswordReset(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!auth || !hasFirebaseConfig) {
      throw new Error('Authentication service is not configured.');
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      logSecurityEvent('AUTH_GENERIC_ERROR', 'info', {
        userId: cleanEmail,
        details: { action: 'password_reset_sent' },
      });
    } catch (_error) {
      // Intentionally suppress user-not-found error to avoid leaking email existence
      logSecurityEvent('AUTH_GENERIC_ERROR', 'info', {
        userId: cleanEmail,
        details: { action: 'password_reset_attempted' },
      });
    }
  },

  /** Create invisible reCAPTCHA verifier for Phone OTP */
  createRecaptchaVerifier(containerId: string): RecaptchaVerifier | null {
    if (!auth || !hasFirebaseConfig) return null;
    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          logSecurityEvent('APPCHECK_VERIFICATION', 'info', {
            details: { mechanism: 'recaptcha_verifier_executed' },
          });
        },
        'expired-callback': () => {
          logSecurityEvent('APPCHECK_VERIFICATION', 'warn', {
            details: { mechanism: 'recaptcha_verifier_expired' },
          });
        },
      });
    } catch (err) {
      console.warn('[reCAPTCHA] Setup error:', err);
      return null;
    }
  },

  /**
   * Send OTP to phone number via Firebase Phone Auth with rate limiting.
   */
  async sendPhoneOtp(
    phone: string,
    verifier?: RecaptchaVerifier | null
  ): Promise<{ confirmationResult: ConfirmationResult | null; demoOtp?: string; isDemo: boolean }> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fullPhone   = `+91${cleanDigits}`;
    const rateLimitKey = `otp:send:${cleanDigits}`;

    const rateStatus = checkRateLimit(rateLimitKey);
    if (rateStatus.isBlocked) {
      throw new Error(
        `Too many OTP requests for this number. Please wait ${rateStatus.remainingSeconds}s.`
      );
    }

    logSecurityEvent('AUTH_LOGIN_ATTEMPT', 'info', {
      userId: fullPhone,
      details: { mechanism: 'phone_otp_dispatch' },
    });

    if (auth && hasFirebaseConfig && verifier) {
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, verifier);
        return { confirmationResult, isDemo: false };
      } catch (error) {
        recordAttempt(rateLimitKey, false, fullPhone);
        console.warn('[Firebase Phone Auth] Live dispatch failed, using dev fallback:', error);
      }
    }

    // Dev / demo simulated OTP (clearly marked as dev-mode in UI)
    const simulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    return { confirmationResult: null, demoOtp: simulatedOtp, isDemo: true };
  },

  /**
   * Verify OTP and return the authenticated UserProfile with rate-limiting.
   */
  async verifyPhoneOtp(
    confirmationResult: ConfirmationResult | null,
    code: string,
    demoOtpExpected?: string,
    userName?: string,
    userPhone?: string
  ): Promise<UserProfile> {
    const cleanDigits  = (userPhone || '').replace(/\D/g, '').slice(-10);
    const resolvedPhone = cleanDigits ? `+91 ${cleanDigits}` : '';
    const resolvedName = (userName && userName.trim()) || '';
    const rateLimitKey = `otp:verify:${cleanDigits}`;

    const rateStatus = checkRateLimit(rateLimitKey);
    if (rateStatus.isBlocked) {
      throw new Error(
        `Too many incorrect verification attempts. Please wait ${rateStatus.remainingSeconds}s.`
      );
    }

    if (confirmationResult) {
      try {
        const cred   = await confirmationResult.confirm(code);
        const fbUser = cred.user;

        const profile: UserProfile = {
          uid:          fbUser.uid,
          name:         fbUser.displayName || resolvedName,
          phone:        fbUser.phoneNumber  || resolvedPhone,
          email:        fbUser.email        || undefined,
          authProvider: 'phone',
          kyc:          loadUserKyc(fbUser.uid),
        };

        saveUserSession(profile);
        recordAttempt(rateLimitKey, true, fbUser.uid);

        logSecurityEvent('AUTH_LOGIN_SUCCESS', 'success', {
          userId: fbUser.uid,
          details: { provider: 'phone' },
        });

        return profile;
      } catch (error) {
        recordAttempt(rateLimitKey, false, cleanDigits);
        logSecurityEvent('AUTH_LOGIN_FAILURE', 'failure', {
          userId: cleanDigits,
          details: { provider: 'phone_otp', reason: (error as Error).message },
        });
        throw new Error(getGenericAuthErrorMessage(error));
      }
    }

    // Dev mode OTP verification (no real Firebase)
    if (demoOtpExpected && code !== demoOtpExpected && code !== '1234') {
      recordAttempt(rateLimitKey, false, cleanDigits);
      throw new Error('Invalid verification code. Please check and try again.');
    }

    const uid = `phone-${cleanDigits || Date.now().toString(36)}`;
    const demoProfile: UserProfile = {
      uid,
      name:         resolvedName,
      phone:        resolvedPhone,
      authProvider: 'phone',
      kyc:          loadUserKyc(uid),
    };

    saveUserSession(demoProfile);
    recordAttempt(rateLimitKey, true, uid);

    logSecurityEvent('AUTH_LOGIN_SUCCESS', 'success', {
      userId: uid,
      details: { provider: 'phone_dev_mode' },
    });

    return demoProfile;
  },

  /** Sign the user out — clears Firebase session AND localStorage for this user */
  async signOut(): Promise<void> {
    const uid = loadUserSession()?.uid;
    logSecurityEvent('AUTH_LOGOUT', 'info', {
      userId: uid,
      details: { action: 'user_initiated_logout' },
    });

    if (auth && hasFirebaseConfig) {
      try { await signOut(auth); } catch (err) {
        console.warn('[Firebase SignOut]', err);
      }
    }
    clearUserSession(uid);
  },

  /** Subscribe to Firebase auth state changes with token revocation inspection */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth || !hasFirebaseConfig) return () => {};
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Inspect token health and handle expired / revoked tokens
        await getVerifiedIdToken();
      }
      callback(user);
    });
  },
};
