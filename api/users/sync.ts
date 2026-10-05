import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveUser, StoredUser } from '../_lib/storage.js';
import { enforceRateLimit, getClientIp } from '../_lib/rateLimit.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const allowed = enforceRateLimit(req, res, `sync_user_${clientIp}`, {
    maxRequests: 60,
    windowMs: 60 * 1000,
  });
  if (!allowed) return;

  const user = req.body as Partial<StoredUser> & { uid?: string };
  if (!user || (!user.uid && !user.id && !user.phone && !user.email)) {
    return res.status(400).json({ message: 'User profile data required' });
  }

  const cleanDigits = (user.phone || '').replace(/\D/g, '').slice(-10);
  const resolvedUid = user.uid || user.id || (cleanDigits ? `phone-${cleanDigits}` : `user-${Date.now().toString(36)}`);

  const saved = saveUser({
    id: resolvedUid,
    uid: resolvedUid,
    name: user.name || 'Rider',
    phone: user.phone || (cleanDigits ? `+91 ${cleanDigits}` : ''),
    email: user.email || '',
    photoURL: user.photoURL,
    authProvider: user.authProvider || (user.email ? 'google' : 'phone'),
    kyc: user.kyc || null,
    createdAt: user.createdAt || new Date().toISOString(),
  });

  return res.status(200).json({ success: true, user: saved });
}
