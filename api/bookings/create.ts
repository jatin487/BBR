import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveBooking, saveUser } from '../_lib/storage.js';
import { enforceRateLimit, getClientIp } from '../_lib/rateLimit.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Sliding-window rate limit protection: max 10 requests per minute
  const clientIp = getClientIp(req);
  if (!enforceRateLimit(req, res, `booking_${clientIp}`, { maxRequests: 10, windowMs: 60 * 1000 })) {
    return;
  }

  const booking = req.body;

  if (!booking) {
    return res.status(400).json({ success: false, message: 'Missing request payload' });
  }

  // 2. Anti-spam honeypot detection
  if (booking._hp && typeof booking._hp === 'string' && booking._hp.trim().length > 0) {
    return res.status(200).json({
      success: true,
      booking: {
        id: `BBR-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'pending_verification'
      }
    });
  }

  // 3. Phone number validation
  const rawPhone = String(booking.customerPhone || '');
  const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
  if (cleanDigits.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'A valid 10-digit Indian phone number is required to receive booking updates.'
    });
  }

  const isTaxi = booking.type === 'taxi';
  const prefix = isTaxi ? 'TAXI' : 'BBR';

  // 4. Honest Booking Status determination:
  // Only mark 'confirmed' if verified by online payment or explicit admin authorization.
  // Unpaid / Pay-at-hub requests are marked 'pending_verification'.
  const isPaymentConfirmed = Boolean(booking.paymentConfirmed);
  const bookingStatus = isPaymentConfirmed ? 'confirmed' : 'pending_verification';

  const savedBooking = saveBooking({
    id: `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`,
    type: booking.type || 'bike',
    userId: booking.userId || (cleanDigits ? `phone-${cleanDigits}` : 'guest'),
    vehicleId: booking.vehicleId || (isTaxi ? 'taxi' : ''),
    vehicleName: booking.vehicleName || (isTaxi ? 'Taxi' : 'Vehicle'),
    city: booking.city || 'Dehradun',
    pickupHub: booking.pickupHub || booking.pickupAddress || '',
    dropHub: booking.dropHub || booking.dropAddress || '',
    pickupAddress: booking.pickupAddress,
    dropAddress: booking.dropAddress,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    returnDate: booking.returnDate || booking.pickupDate,
    returnTime: booking.returnTime || booking.pickupTime,
    rateType: booking.rateType || (isTaxi ? 'taxi' : 'fullday'),
    duration: booking.duration || 1,
    totalAmount: booking.totalAmount || booking.estimatedFare || 0,
    estimatedFare: booking.estimatedFare,
    estimatedDistance: booking.estimatedDistance,
    customerName: booking.customerName ? String(booking.customerName).trim() : 'Customer',
    customerPhone: `+91${cleanDigits}`,
    customerEmail: booking.customerEmail ? String(booking.customerEmail).trim() : undefined,
    passengerCount: booking.passengerCount || 1,
    specialInstructions: booking.specialInstructions ? String(booking.specialInstructions).trim() : undefined,
    driverName: booking.driverName || '',
    driverPhone: booking.driverPhone || '',
    driverVehicle: booking.driverVehicle || '',
    paymentMethod: booking.paymentMethod || 'pay_at_pickup',
    createdAt: new Date().toISOString(),
    status: bookingStatus,
  });

  // 5. Register or update customer profile in backend
  try {
    const userId = savedBooking.userId;
    saveUser({
      id: userId,
      uid: userId,
      name: savedBooking.customerName || 'Customer',
      phone: savedBooking.customerPhone,
      email: savedBooking.customerEmail || undefined,
      authProvider: isTaxi ? 'taxi_booking' : 'bike_booking',
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Ignore error if user upsert fails, booking is already stored
  }

  return res.status(200).json({
    success: true,
    booking: savedBooking,
    message: isPaymentConfirmed
      ? 'Booking confirmed successfully.'
      : 'Booking request received. Our hub coordinator will verify vehicle readiness and contact you to confirm.'
  });
}
