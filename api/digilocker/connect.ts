import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getDigiLockerConfig,
  createDigiLockerState,
  buildDigiLockerAuthUrl
} from '../_lib/digilocker.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : '';
  const redirect = req.query.redirect === 'true';

  if (!uid) {
    return res.status(400).json({
      error: 'firebase_uid_required',
      message: 'Firebase User UID is required to initiate DigiLocker KYC connection'
    });
  }

  // Determine redirect URI
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'bbr-dehradun.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const defaultRedirectUri = `${proto}://${host}/api/digilocker/callback`;

  const config = getDigiLockerConfig();
  const effectiveRedirectUri = config.redirectUri || defaultRedirectUri;

  const stateToken = createDigiLockerState(uid, 'bbr-web');

  if (config.isConfigured) {
    // Official DigiLocker Production Gateway
    const authUrl = buildDigiLockerAuthUrl({
      clientId: config.clientId,
      redirectUri: effectiveRedirectUri,
      state: stateToken
    });

    if (redirect) {
      return res.redirect(302, authUrl);
    }

    return res.status(200).json({
      success: true,
      mode: 'production',
      authUrl,
      state: stateToken
    });
  }

  // Sandbox / Developer Mode (when DIGILOCKER_CLIENT_ID is not configured in Vercel)
  const sandboxConsentUrl = `/api/digilocker/sandbox-consent?state=${encodeURIComponent(stateToken)}&uid=${encodeURIComponent(uid)}`;

  if (redirect) {
    return res.redirect(302, sandboxConsentUrl);
  }

  return res.status(200).json({
    success: true,
    mode: 'sandbox',
    authUrl: sandboxConsentUrl,
    state: stateToken,
    notice: 'DIGILOCKER_CLIENT_ID not configured in Vercel env. Using secure developer sandbox OAuth simulator.'
  });
}
