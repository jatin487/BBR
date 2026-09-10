import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveUser, getUserByPhone } from '../_lib/storage';

const OTP_STORE: Record<string, { code: string; expiresAt: number }> = {};

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendBirdSms = async (phone: string, otp: string) => {
  const birdApiKey = process.env.BIRD_API_KEY;
  const birdSender = process.env.BIRD_SENDER || 'BBR';

  if (!birdApiKey) {
    return { demo: true, message: 'Bird API key not configured, OTP generated locally only' };
  }

  const response = await fetch('https://eu1.platform.bird.com/v1/sms/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${birdApiKey}`,
      'Idempotency-Key': `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: phone,
      text: `Your BBR verification code is ${otp}. Valid for 90 seconds.`,
      from: birdSender,
      category: 'transactional'
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Bird SMS failed: ${payload}`);
  }

  return { demo: false, message: 'Bird SMS sent successfully' };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone, name, otp, action } = req.body || {};

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  const normalizedPhone = normalizePhone(phone);

  if (action === 'send-otp') {
    const code = generateOtp();
    OTP_STORE[normalizedPhone] = {
      code,
      expiresAt: Date.now() + 90 * 1000
    };

    try {
      const birdResult = await sendBirdSms(normalizedPhone, code);
      return res.status(200).json({
        success: true,
        message: `OTP sent to ${normalizedPhone}`,
        otpCode: code,
        demo: !!birdResult.demo,
        expiresIn: 90
      });
    } catch (error) {
      return res.status(200).json({
        success: true,
        message: `OTP generated for ${normalizedPhone}`,
        otpCode: code,
        demo: true,
        expiresIn: 90,
        warning: error instanceof Error ? error.message : 'SMS send failed, but OTP was generated locally'
      });
    }
  }

  if (action === 'verify-otp') {
    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const record = OTP_STORE[normalizedPhone];
    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this phone number' });
    }

    if (Date.now() > record.expiresAt) {
      delete OTP_STORE[normalizedPhone];
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    if (otp !== record.code) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    delete OTP_STORE[normalizedPhone];

    const existing = getUserByPhone(normalizedPhone);
    const user = saveUser({
      id: existing?.id || `user-${Date.now()}`,
      name: (name && String(name).trim()) || existing?.name || 'Rider',
      phone: normalizedPhone,
      createdAt: existing?.createdAt || new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      user
    });
  }

  return res.status(400).json({ message: 'Invalid action' });
}
