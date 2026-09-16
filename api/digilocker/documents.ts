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
      message: 'Firebase UID is required to fetch DigiLocker documents'
    });
  }

  const kyc = getUserKyc(uid);

  if (!kyc || kyc.status !== 'verified') {
    return res.status(404).json({
      success: false,
      message: 'No verified DigiLocker documents found for this account'
    });
  }

  const documents = [
    {
      type: 'DRVLC',
      name: 'Driving Licence',
      issuer: 'Ministry of Road Transport and Highways (MoRTH)',
      docNumber: kyc.dlNumber,
      holderName: kyc.holderName,
      validTill: kyc.validTill,
      vehicleClasses: kyc.vehicleClasses,
      status: 'verified',
      verifiedAt: kyc.verifiedAt || kyc.verificationTimestamp,
      docId: kyc.digilockerDocId
    }
  ];

  return res.status(200).json({
    success: true,
    uid,
    count: documents.length,
    documents
  });
}
