import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enforceRateLimit, getClientIp } from './_lib/rateLimit.js';
import { saveEnquiry } from './_lib/storage.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Sliding-window rate limit: max 5 enquiries per minute per IP
  const clientIp = getClientIp(req);
  if (!enforceRateLimit(req, res, `enquiry_${clientIp}`, { maxRequests: 5, windowMs: 60 * 1000 })) {
    return; // Rate limit exceeded response sent automatically by helper
  }

  const {
    name,
    phone,
    email,
    category,
    pickupHub,
    travelDate,
    message,
    termsAccepted,
    marketingConsent,
    _hp
  } = req.body || {};

  // 2. Anti-spam honeypot detection
  if (_hp && typeof _hp === 'string' && _hp.trim().length > 0) {
    // Silently return success to mislead malicious bots
    return res.status(200).json({
      success: true,
      enquiryId: `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
      message: 'Enquiry received successfully.'
    });
  }

  // 3. Server-side field validation
  const cleanName = typeof name === 'string' ? name.trim() : '';
  if (cleanName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid full name (minimum 2 characters).'
    });
  }

  const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '').slice(-10) : '';
  if (cleanPhone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit Indian mobile number.'
    });
  }

  if (email && typeof email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }
  }

  if (!termsAccepted) {
    return res.status(400).json({
      success: false,
      message: 'Terms of Service and Privacy Policy acknowledgement is required.'
    });
  }

  // 4. Save enquiry record
  const newEnquiryId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
  const record = saveEnquiry({
    id: newEnquiryId,
    name: cleanName,
    phone: `+91${cleanPhone}`,
    email: email ? String(email).trim() : undefined,
    category: typeof category === 'string' ? category : 'bike',
    pickupHub: typeof pickupHub === 'string' ? pickupHub : 'Bhauwala Main Hub',
    travelDate: typeof travelDate === 'string' ? travelDate : undefined,
    message: typeof message === 'string' ? message.trim() : undefined,
    marketingConsent: Boolean(marketingConsent),
    termsAccepted: true,
    createdAt: new Date().toISOString(),
    status: 'new'
  });

  return res.status(200).json({
    success: true,
    enquiryId: record.id,
    message: 'Thank you! Your enquiry has been received. Our Dehradun hub coordinator will contact you shortly.'
  });
}
