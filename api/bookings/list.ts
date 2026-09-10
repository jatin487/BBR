import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBookings } from '../_lib/storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query || {};
  const bookings = getBookings();
  const filtered = typeof userId === 'string' ? bookings.filter((booking) => booking.userId === userId) : bookings;

  return res.status(200).json({ success: true, bookings: filtered });
}
