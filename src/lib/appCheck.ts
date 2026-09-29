/**
 * Firebase App Check Configuration
 *
 * Configures App Check to protect backend resources against abuse, scraping,
 * and unauthorized API traffic.
 *
 * Enforcement Strategy:
 * 1. Initial State: Monitoring / Metrics Mode (Observe traffic in Firebase Console without blocking legitimate users).
 * 2. Secondary State: Enforcement Mode on:
 *    - Cloud Firestore
 *    - Cloud Storage
 *    - Firebase Authentication
 *    - Cloud Functions
 */

import { FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  CustomProvider,
  AppCheck,
  getToken,
} from 'firebase/app-check';
import { logSecurityEvent } from './securityLogger';

let appCheckInstance: AppCheck | null = null;
let appCheckMode: 'enforced' | 'metrics_mode' | 'debug_token' | 'not_configured' = 'not_configured';

// Extend window / globalThis for Firebase debug token declaration
declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

export interface AppCheckConfigOptions {
  siteKey?: string;
  isEnterprise?: boolean;
  forceDebugToken?: boolean;
  enableEnforcement?: boolean;
}

/**
 * Initializes App Check with appropriate provider based on environment
 */
export function initAppCheck(
  app: FirebaseApp,
  options?: AppCheckConfigOptions
): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  const isDev = import.meta.env.DEV || import.meta.env.VITE_SECURITY_TESTING_MODE === 'true';
  const siteKey =
    options?.siteKey ||
    import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ||
    '';

  const debugToken =
    options?.forceDebugToken ||
    import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;

  try {
    // Development & Security Testing Mode: configure debug token provider
    if (isDev) {
      if (debugToken) {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === 'true' ? true : debugToken;
      } else {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      appCheckMode = 'debug_token';

      logSecurityEvent('APPCHECK_MONITORING', 'info', {
        appCheckStatus: 'debug_token',
        details: {
          environment: 'development/testing',
          mode: 'Debug Token Provider Active',
          note: 'Copy the debug token from console into Firebase Console -> App Check -> Apps -> Debug tokens',
        },
      });
    }

    // Determine provider
    let provider: ReCaptchaV3Provider | ReCaptchaEnterpriseProvider | CustomProvider;

    if (siteKey && siteKey.length > 5) {
      if (options?.isEnterprise) {
        provider = new ReCaptchaEnterpriseProvider(siteKey);
      } else {
        provider = new ReCaptchaV3Provider(siteKey);
      }
      appCheckMode = options?.enableEnforcement ? 'enforced' : 'metrics_mode';
    } else if (isDev) {
      // In dev mode without a live reCAPTCHA key, use a safe mock custom provider for testing
      provider = new CustomProvider({
        getToken: async () => {
          return {
            token: `debug-token-${Date.now()}`,
            expireTimeMillis: Date.now() + 3600 * 1000,
          };
        },
      });
      appCheckMode = 'debug_token';
    } else {
      // Production without configured reCAPTCHA site key
      appCheckMode = 'not_configured';
      logSecurityEvent('APPCHECK_MONITORING', 'warn', {
        appCheckStatus: 'not_configured',
        details: {
          message: 'VITE_FIREBASE_APPCHECK_SITE_KEY is not defined. App Check running in unconfigured mode.',
        },
      });
      return null;
    }

    appCheckInstance = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    logSecurityEvent('APPCHECK_VERIFICATION', 'success', {
      appCheckStatus: appCheckMode,
      details: {
        providerType: provider.constructor.name,
        isTokenAutoRefreshEnabled: true,
        enforcementStatus: options?.enableEnforcement ? 'Active' : 'Metrics/Monitoring Only',
      },
    });

    return appCheckInstance;
  } catch (error) {
    console.warn('[App Check] Initialization notice:', error);
    appCheckMode = 'metrics_mode';
    return null;
  }
}

/**
 * Get current App Check instance and state
 */
export function getAppCheckState(): {
  instance: AppCheck | null;
  mode: typeof appCheckMode;
  protectedServices: string[];
} {
  return {
    instance: appCheckInstance,
    mode: appCheckMode,
    protectedServices: [
      'Cloud Firestore (Database protection against bot tampering)',
      'Cloud Storage (Media & KYC upload abuse protection)',
      'Firebase Authentication (Credential stuffing & automated signup mitigation)',
      'Cloud Functions (Backend invocation authorization)',
    ],
  };
}

/**
 * Retrieve current App Check token (for testing or diagnostic inspection)
 */
export async function fetchCurrentAppCheckToken(forceRefresh = false): Promise<string | null> {
  if (!appCheckInstance) return null;
  try {
    const result = await getToken(appCheckInstance, forceRefresh);
    return result.token ? `${result.token.slice(0, 10)}...[ACTIVE_TOKEN]` : null;
  } catch (_err) {
    return null;
  }
}
