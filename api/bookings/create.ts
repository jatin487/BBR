import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveBooking } from '../_lib/storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const booking = req.body;

  if (!booking || !booking.userId || !booking.vehicleId || !booking.customerPhone) {
    return res.status(400).json({ message: 'Missing booking information' });
  }

  const savedBooking = saveBooking({
    id: `BBR-${Math.floor(100000 + Math.random() * 900000)}`,
    userId: booking.userId,
    vehicleId: booking.vehicleId,
    vehicleName: booking.vehicleName,
    city: booking.city,
    pickupHub: booking.pickupHub,
    dropHub: booking.dropHub,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    returnDate: booking.returnDate,
    returnTime: booking.returnTime,
    rateType: booking.rateType,
    duration: booking.duration,
    totalAmount: booking.totalAmount,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    paymentMethod: booking.paymentMethod,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  });

  return res.status(200).json({ success: true, booking: savedBooking });
}
