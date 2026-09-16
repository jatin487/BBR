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
      message: 'Firebase UID is required to fetch Driving Licence details'
    });
  }

  const kyc = getUserKyc(uid);

  if (!kyc || kyc.status !== 'verified') {
    return res.status(404).json({
      success: false,
      message: 'No verified Driving Licence found for this account. Please complete DigiLocker KYC.'
    });
  }

  return res.status(200).json({
    success: true,
    uid,
    license: {
      dlNumber: kyc.dlNumber,
      holderName: kyc.holderName,
      dob: kyc.dob,
      validTill: kyc.validTill,
      vehicleClasses: kyc.vehicleClasses,
      digilockerDocId: kyc.digilockerDocId,
      status: 'verified',
      verificationTimestamp: kyc.verificationTimestamp,
      securityHash: kyc.securityHash
    }
  });
}
