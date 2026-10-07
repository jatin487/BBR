import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enforceRateLimit, getClientIp } from '../_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate limit payment creation attempts
  const clientIp = getClientIp(req);
  if (!enforceRateLimit(req, res, `pay_order_${clientIp}`, { maxRequests: 10, windowMs: 60 * 1000 })) {
    return;
  }

  const { amount, bookingId, customerPhone } = req.body || {};

  // Check if Razorpay credentials exist in server environment
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.startsWith('your-') &&
    !keySecret.startsWith('your-')
  );

  // If credentials are not configured, return clean inactive status
  // Do NOT invent fake credentials or accept unverified payments
  if (!isConfigured) {
    return res.status(200).json({
      status: 'payments_disabled',
      active: false,
      message: 'Online digital payment gateway is currently undergoing scheduled maintenance / merchant credential activation. Please select "Pay at Hub" (Cash or UPI at pickup).'
    });
  }

  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'A valid rental amount is required to create a payment order.'
    });
  }

  const amountInPaise = Math.round(parsedAmount * 100);

  try {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: (bookingId || `BBR-${Date.now()}`).slice(0, 40),
        notes: {
          hub: 'Dehradun Bhauwala',
          phone: String(customerPhone || '')
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errData = await razorpayResponse.json().catch(() => ({}));
      return res.status(502).json({
        status: 'error',
        message: 'Payment gateway communication error. Please choose Pay at Hub.',
        code: (errData as { error?: { code?: string } }).error?.code
      });
    }

    const orderData = (await razorpayResponse.json()) as { id: string; amount: number; currency: string };

    return res.status(200).json({
      status: 'ready',
      active: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to initialize payment gateway order.'
    });
  }
}
