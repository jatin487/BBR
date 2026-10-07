import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { updateBooking } from '../_lib/storage.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId
  } = req.body || {};

  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!keySecret || keySecret.startsWith('your-')) {
    return res.status(400).json({
      success: false,
      message: 'Razorpay secret key is not configured on the server. Real payments cannot be verified.'
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing mandatory payment verification parameters.'
    });
  }

  // 1. Compute HMAC SHA-256 signature
  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(text)
    .digest('hex');

  // 2. Timing-safe comparison to prevent timing attacks
  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf-8'),
    Buffer.from(razorpay_signature, 'utf-8')
  );

  if (!isSignatureValid) {
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed: cryptographic signature mismatch.'
    });
  }

  // 3. Mark booking as confirmed & paid on the server
  if (bookingId && typeof bookingId === 'string') {
    updateBooking(bookingId, {
      status: 'confirmed',
      paymentMethod: 'razorpay_online'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully and booking confirmed.',
    paymentId: razorpay_payment_id
  });
}
