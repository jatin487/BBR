import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteUserKyc } from '../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { uid } = req.body || {};

  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({
      error: 'uid_required',
      message: 'Firebase UID is required to disconnect DigiLocker'
    });
  }

  const removed = deleteUserKyc(uid.trim());

  return res.status(200).json({
    success: true,
    uid,
    message: removed
      ? 'DigiLocker disconnected and KYC records cleared successfully'
      : 'No active KYC record was found for this user'
  });
}
