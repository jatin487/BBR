import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUsers, saveUser, deleteUser, getUserByPhone, getUserByUid, StoredUser } from './_lib/storage.js';
import { enforceRateLimit, getClientIp } from './_lib/rateLimit.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bbr-admin-2024';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientIp = getClientIp(req);
  const token = req.headers['x-admin-token'] || req.query.token;
  const isAdmin = token === ADMIN_SECRET;

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (isAdmin) {
      const users = getUsers();
      const sorted = [...users].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      return res.status(200).json({ success: true, users: sorted, total: sorted.length });
    }

    // Public lookup by phone or uid with rate limit
    const allowed = enforceRateLimit(req, res, `get_user_${clientIp}`, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });
    if (!allowed) return;

    const { uid, phone } = req.query;
    if (typeof uid === 'string' && uid) {
      const user = getUserByUid(uid);
      return res.status(200).json({ success: true, user: user || null });
    }
    if (typeof phone === 'string' && phone) {
      const user = getUserByPhone(phone);
      return res.status(200).json({ success: true, user: user || null });
    }

    return res.status(401).json({ message: 'Unauthorized. Admin token required for listing all users.' });
  }

  // ── POST (Sync or Upsert) ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!isAdmin) {
      const allowed = enforceRateLimit(req, res, `sync_user_${clientIp}`, {
        maxRequests: 60,
        windowMs: 60 * 1000,
      });
      if (!allowed) return;
    }

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

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!isAdmin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const id = (req.body?.id || req.query.id || req.body?.uid || req.query.uid) as string;
    if (!id) {
      return res.status(400).json({ message: 'Missing user id or uid' });
    }
    const ok = deleteUser(id);
    return res.status(200).json({ success: ok });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
