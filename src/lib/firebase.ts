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

// Verified KYC document data structure from DigiLocker Requestor
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
  authProvider: 'phone' | 'google' | 'demo';
  kyc?: VerifiedKycData | null;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.apiKey !== 'your-firebase-api-key' &&
  !firebaseConfig.apiKey.includes('your-')
);

// Initialize Firebase App safely
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.warn('[Firebase] Initialization error, using fallback mode:', error);
    app = null;
    auth = null;
  }
}

export const firebaseApp = app;
export const firebaseAuth = auth;

const USER_SESSION_KEY = 'bbr-user-profile';
const LEGACY_USER_KEY = 'bbr-user';
const KYC_STORAGE_KEY = 'bbr-digilocker-kyc';

// Local storage session helpers
export const saveUserSession = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    // Keep legacy key for backwards compatibility
    localStorage.setItem(
      LEGACY_USER_KEY,
      JSON.stringify({ name: profile.name, phone: profile.phone, email: profile.email })
    );
  } catch {
    // LocalStorage quota or access error
  }
};

export const loadUserSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      // Sync stored KYC if not present inside profile
      if (!parsed.kyc) {
        const storedKyc = loadUserKyc();
        if (storedKyc) parsed.kyc = storedKyc;
      }
      return parsed;
    }

    // Fallback to legacy key if user logged in previously
    const legacyRaw = localStorage.getItem(LEGACY_USER_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as { name?: string; phone?: string; email?: string };
      if (legacy.name && legacy.phone) {
        const fallbackProfile: UserProfile = {
          uid: `legacy-${Date.now()}`,
          name: legacy.name,
          phone: legacy.phone,
          email: legacy.email,
          authProvider: 'demo',
          kyc: loadUserKyc()
        };
        saveUserSession(fallbackProfile);
        return fallbackProfile;
      }
    }
  } catch {
    return null;
  }
  return null;
};

export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch {
    // Ignore
  }
};

// DigiLocker KYC document persistence helpers
export const saveUserKyc = (kycData: VerifiedKycData): void => {
  try {
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(kycData));
    const current = loadUserSession();
    if (current) {
      current.kyc = kycData;
      saveUserSession(current);
    }
  } catch {
    // Ignore
  }
};

export const loadUserKyc = (): VerifiedKycData | null => {
  try {
    const raw = localStorage.getItem(KYC_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as VerifiedKycData;
    }
  } catch {
    return null;
  }
  return null;
};

export const clearUserKyc = (): void => {
  try {
    localStorage.removeItem(KYC_STORAGE_KEY);
    const current = loadUserSession();
    if (current) {
      current.kyc = null;
      saveUserSession(current);
    }
  } catch {
    // Ignore
  }
};

// Firebase Authentication Actions
export const firebaseAuthService = {
  // Sign in with Google (Firebase GoogleAuthProvider popup)
  async signInWithGoogle(): Promise<UserProfile> {
    if (auth && hasFirebaseConfig) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || 'Google Rider',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '+91 98765 43210',
        photoURL: fbUser.photoURL || undefined,
        authProvider: 'google',
        kyc: loadUserKyc()
      };

      saveUserSession(profile);
      return profile;
    }

    // Interactive Demo / Fallback mode
    await new Promise((r) => setTimeout(r, 600));
    const demoGoogleProfile: UserProfile = {
      uid: `google-${Date.now().toString(36)}`,
      name: 'Rohan Sharma',
      email: 'rohan.rider@gmail.com',
      phone: '+91 98765 43210',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      authProvider: 'google',
      kyc: loadUserKyc()
    };

    saveUserSession(demoGoogleProfile);
    return demoGoogleProfile;
  },

  // Setup reCAPTCHA verifier for Phone Auth
  createRecaptchaVerifier(containerId: string): RecaptchaVerifier | null {
    if (!auth || !hasFirebaseConfig) return null;

    try {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          console.warn('[Firebase Recaptcha] Expired');
        }
      });
    } catch (err) {
      console.warn('[Firebase Recaptcha] Setup error:', err);
      return null;
    }
  },

  // Send OTP to Phone number
  async sendPhoneOtp(
    phone: string,
    verifier?: RecaptchaVerifier | null
  ): Promise<{
    confirmationResult: ConfirmationResult | null;
    demoOtp?: string;
    isDemo: boolean;
  }> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fullPhone = `+91${cleanDigits}`;

    if (auth && hasFirebaseConfig && verifier) {
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, verifier);
        return { confirmationResult, isDemo: false };
      } catch (error) {
        console.warn('[Firebase Phone Auth] Live dispatch failed, falling back to simulated SMS:', error);
      }
    }

    // Dev / Demo Free SMS Requester fallback
    const simulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    return {
      confirmationResult: null,
      demoOtp: simulatedOtp,
      isDemo: true
    };
  },

  // Verify Phone OTP Code
  async verifyPhoneOtp(
    confirmationResult: ConfirmationResult | null,
    code: string,
    demoOtpExpected?: string,
    userName?: string,
    userPhone?: string
  ): Promise<UserProfile> {
    const cleanDigits = (userPhone || '').replace(/\D/g, '').slice(-10);
    const resolvedPhone = cleanDigits ? `+91 ${cleanDigits}` : '+91 98765 43210';
    const resolvedName = (userName && userName.trim()) || 'Verified Rider';

    if (confirmationResult) {
      const userCredential = await confirmationResult.confirm(code);
      const fbUser = userCredential.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        name: resolvedName,
        phone: fbUser.phoneNumber || resolvedPhone,
        authProvider: 'phone',
        kyc: loadUserKyc()
      };

      saveUserSession(profile);
      return profile;
    }

    // Demo / Dev verification check
    if (demoOtpExpected && code !== demoOtpExpected && code !== '1234') {
      throw new Error('Invalid OTP code. Please enter the 4-digit code sent to your mobile.');
    }

    const demoProfile: UserProfile = {
      uid: `phone-${Date.now().toString(36)}`,
      name: resolvedName,
      phone: resolvedPhone,
      authProvider: 'phone',
      kyc: loadUserKyc()
    };

    saveUserSession(demoProfile);
    return demoProfile;
  },

  // Sign out user
  async signOut(): Promise<void> {
    if (auth && hasFirebaseConfig) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('[Firebase SignOut] Error:', err);
      }
    }
    clearUserSession();
  },

  // Subscribe to Firebase Auth state change
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    if (!auth || !hasFirebaseConfig) return () => {};
    return onAuthStateChanged(auth, callback);
  }
};
