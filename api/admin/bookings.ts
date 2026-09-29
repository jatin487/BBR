import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBookings, updateBooking } from '../_lib/storage.js';
import { enforceRateLimit, getClientIp } from '../_lib/rateLimit.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bbr-admin-2024';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientIp = getClientIp(req);

  // Rate limit admin attempts by IP (max 10 requests per minute)
  const allowed = enforceRateLimit(req, res, `admin_auth_${clientIp}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
    cooldownMs: 30 * 1000,
  });
  if (!allowed) return;

  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_SECRET) {
    // Punish consecutive invalid token guesses
    enforceRateLimit(req, res, `admin_fail_${clientIp}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      cooldownMs: 60 * 1000,
    });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'PATCH' || (req.method === 'POST' && req.body?.id)) {
    const { id, updates } = req.body || {};
    if (!id || !updates) {
      return res.status(400).json({ message: 'Missing id or updates in request body' });
    }
    const updated = updateBooking(id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    return res.status(200).json({ success: true, booking: updated });
  }

  if (req.method === 'GET') {
    const bookings = getBookings();

    const sorted = [...bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const stats = {
      total: sorted.length,
      taxiBookings: sorted.filter((b) => b.type === 'taxi').length,
      bikeRentals: sorted.filter((b) => b.type !== 'taxi').length,
      totalRevenue: sorted.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      todayBookings: sorted.filter((b) => {
        const d = new Date(b.createdAt);
        const now = new Date();
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
    };

    return res.status(200).json({ success: true, bookings: sorted, stats });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
