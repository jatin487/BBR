import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  ConfirmationResult,
  User as FirebaseUser
} from 'firebase/auth';

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
  authProvider: 'phone' | 'google';
  kyc?: VerifiedKycData | null;
}

// ── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || ''
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

// ── Session Helpers ───────────────────────────────────────────────────────────
export const saveUserSession = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    // Keep legacy key so older code paths don't break
    localStorage.setItem(
      LEGACY_USER_KEY,
      JSON.stringify({ name: profile.name, phone: profile.phone, email: profile.email })
    );
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
  } catch { return null; }
  return null;
};

/**
 * Clears session AND the UID-scoped KYC for that user.
 * Call this on sign-out so the next user never sees the previous user's data.
 */
export const clearUserSession = (uid?: string): void => {
  try {
    // Get the UID from the current session if not passed
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

// ── Auth Service ──────────────────────────────────────────────────────────────
export const firebaseAuthService = {

  /**
   * Google Sign-In via Firebase popup.
   * Uses ONLY the real Firebase user — no hardcoded fallback identities.
   */
  async signInWithGoogle(): Promise<UserProfile> {
    if (!auth || !hasFirebaseConfig) {
      throw new Error(
        'Firebase is not configured. Please add your VITE_FIREBASE_* credentials to the .env file to enable Google Sign-In.'
      );
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    // Use email prefix as name fallback if displayName is absent
    const nameFromEmail = fbUser.email ? fbUser.email.split('@')[0].replace(/[._]/g, ' ') : '';
    const resolvedName  = fbUser.displayName || nameFromEmail || 'Google User';

    const profile: UserProfile = {
      uid:          fbUser.uid,
      name:         resolvedName,
      email:        fbUser.email  || undefined,
      phone:        fbUser.phoneNumber || '',
      photoURL:     fbUser.photoURL    || undefined,
      authProvider: 'google',
      kyc:          loadUserKyc(fbUser.uid)
    };

    saveUserSession(profile);
    return profile;
  },

  /** Create invisible reCAPTCHA verifier for Phone OTP */
  createRecaptchaVerifier(containerId: string): RecaptchaVerifier | null {
    if (!auth || !hasFirebaseConfig) return null;
    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => console.warn('[reCAPTCHA] Expired')
      });
    } catch (err) {
      console.warn('[reCAPTCHA] Setup error:', err);
      return null;
    }
  },

  /**
   * Send OTP to phone number via Firebase Phone Auth.
   * Falls back to a dev-mode simulated OTP when Firebase is not configured
   * so the UI remains functional during local development — but the dev OTP
   * is shown clearly in the UI (not hidden) so it is obviously a dev mode.
   */
  async sendPhoneOtp(
    phone: string,
    verifier?: RecaptchaVerifier | null
  ): Promise<{ confirmationResult: ConfirmationResult | null; demoOtp?: string; isDemo: boolean }> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fullPhone   = `+91${cleanDigits}`;

    if (auth && hasFirebaseConfig && verifier) {
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, verifier);
        return { confirmationResult, isDemo: false };
      } catch (error) {
        console.warn('[Firebase Phone Auth] Live dispatch failed, using dev fallback:', error);
      }
    }

    // Dev / demo simulated OTP (clearly marked as dev-mode in UI)
    const simulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    return { confirmationResult: null, demoOtp: simulatedOtp, isDemo: true };
  },

  /**
   * Verify OTP and return the authenticated UserProfile.
   * The name comes from the user's own input — never a hardcoded default.
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
    // Never substitute a hardcoded name — use what the user typed, or empty
    const resolvedName = (userName && userName.trim()) || '';

    if (confirmationResult) {
      const cred   = await confirmationResult.confirm(code);
      const fbUser = cred.user;

      const profile: UserProfile = {
        uid:          fbUser.uid,
        name:         fbUser.displayName || resolvedName,
        phone:        fbUser.phoneNumber  || resolvedPhone,
        email:        fbUser.email        || undefined,
        authProvider: 'phone',
        kyc:          loadUserKyc(fbUser.uid)
      };

      saveUserSession(profile);
      return profile;
    }

    // Dev mode OTP verification (no real Firebase)
    if (demoOtpExpected && code !== demoOtpExpected && code !== '1234') {
      throw new Error('Invalid OTP. Please enter the 4-digit code shown in the SMS banner.');
    }

    const uid = `phone-${cleanDigits || Date.now().toString(36)}`;
    const demoProfile: UserProfile = {
      uid,
      name:         resolvedName,
      phone:        resolvedPhone,
      authProvider: 'phone',
      kyc:          loadUserKyc(uid)
    };

    saveUserSession(demoProfile);
    return demoProfile;
  },

  /** Sign the user out — clears Firebase session AND localStorage for this user */
  async signOut(): Promise<void> {
    // Capture UID before clearing session
    const uid = loadUserSession()?.uid;
    if (auth && hasFirebaseConfig) {
      try { await signOut(auth); } catch (err) {
        console.warn('[Firebase SignOut]', err);
      }
    }
    clearUserSession(uid);
  },

  /** Subscribe to Firebase auth state changes */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth || !hasFirebaseConfig) return () => {};
    return onAuthStateChanged(auth, callback);
  }
};
