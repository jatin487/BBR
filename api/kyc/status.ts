import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserKyc } from '../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : '';

  if (!uid) {
    return res.status(400).json({
      error: 'uid_required',
      message: 'Firebase UID is required to fetch KYC status'
    });
  }

  const kyc = getUserKyc(uid);

  return res.status(200).json({
    success: true,
    uid,
    status: kyc && kyc.status === 'verified' ? 'verified' : 'not_verified',
    verified: Boolean(kyc && kyc.status === 'verified'),
    kyc: kyc || null
  });
}
