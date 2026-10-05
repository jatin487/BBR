import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUsers, saveUser, deleteUser, StoredUser } from '../_lib/storage.js';
import { enforceRateLimit, getClientIp } from '../_lib/rateLimit.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bbr-admin-2024';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientIp = getClientIp(req);

  // Rate limit admin attempts by IP (max 30 requests per minute)
  const allowed = enforceRateLimit(req, res, `admin_users_auth_${clientIp}`, {
    maxRequests: 30,
    windowMs: 60 * 1000,
    cooldownMs: 30 * 1000,
  });
  if (!allowed) return;

  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_SECRET) {
    enforceRateLimit(req, res, `admin_fail_${clientIp}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
    });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const users = getUsers();
    const sorted = [...users].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return res.status(200).json({ success: true, users: sorted, total: sorted.length });
  }

  if (req.method === 'POST') {
    const userData = req.body as StoredUser;
    if (!userData || (!userData.phone && !userData.email && !userData.id && !userData.uid)) {
      return res.status(400).json({ message: 'User data required' });
    }
    const saved = saveUser(userData);
    return res.status(200).json({ success: true, user: saved });
  }

  if (req.method === 'DELETE') {
    const id = (req.body?.id || req.query.id || req.body?.uid || req.query.uid) as string;
    if (!id) {
      return res.status(400).json({ message: 'Missing user id or uid' });
    }
    const ok = deleteUser(id);
    return res.status(200).json({ success: ok });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
