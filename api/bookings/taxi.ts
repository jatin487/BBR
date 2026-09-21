import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveBooking } from '../_lib/storage.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const booking = req.body;

  if (!booking || !booking.customerPhone || !booking.pickupAddress || !booking.dropAddress) {
    return res.status(400).json({ message: 'Missing required taxi booking information' });
  }

  const savedBooking = saveBooking({
    id: `TAXI-${Math.floor(100000 + Math.random() * 900000)}`,
    type: 'taxi',
    userId: booking.userId || 'guest',
    vehicleId: booking.vehicleId || 'taxi',
    vehicleName: booking.vehicleName || 'Taxi',
    city: booking.city || '',
    pickupHub: booking.pickupAddress,
    dropHub: booking.dropAddress,
    pickupAddress: booking.pickupAddress,
    dropAddress: booking.dropAddress,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    returnDate: booking.returnDate || booking.pickupDate,
    returnTime: booking.returnTime || booking.pickupTime,
    rateType: booking.rateType || 'taxi',
    duration: booking.duration || 1,
    totalAmount: booking.totalAmount || booking.estimatedFare || 0,
    estimatedFare: booking.estimatedFare,
    estimatedDistance: booking.estimatedDistance,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail || '',
    passengerCount: booking.passengerCount || 1,
    specialInstructions: booking.specialInstructions || '',
    driverName: booking.driverName || '',
    driverPhone: booking.driverPhone || '',
    driverVehicle: booking.driverVehicle || '',
    paymentMethod: booking.paymentMethod || 'cash',
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  });

  return res.status(200).json({ success: true, booking: savedBooking });
}
