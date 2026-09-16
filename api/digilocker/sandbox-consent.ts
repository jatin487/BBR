import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyDigiLockerState } from '../_lib/digilocker.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const uid = typeof req.query.uid === 'string' ? req.query.uid : '';

  const verifiedState = verifyDigiLockerState(state);
  if (!verifiedState) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Invalid State - DigiLocker OAuth</title></head>
      <body style="font-family: sans-serif; background: #0B0F19; color: #fff; text-align: center; padding: 40px;">
        <h2>Invalid or Expired Authorization State</h2>
        <p style="color: #94a3b8;">The session token has expired. Please return to BBR and initiate DigiLocker verification again.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #FF6A00; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Return to BBR</a>
      </body>
      </html>
    `);
  }

  const callbackUrl = `/api/digilocker/callback?code=sandbox_code_${Date.now()}&state=${encodeURIComponent(state)}`;
  const cancelUrl = `/?kyc_error=consent_denied`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MeriPehchan / DigiLocker — Partner Authorization</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0d1527;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #111d38;
      border: 1px solid #1e3a8a;
      border-radius: 20px;
      max-width: 520px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .emblem {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #003566;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: #fff;
      font-size: 10px;
      border: 2px solid #0284c7;
    }
    .emblem span { color: #f59e0b; }
    .title { font-size: 18px; font-weight: 800; color: #fff; }
    .subtitle { font-size: 12px; color: #94a3b8; }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(14, 165, 233, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(14, 165, 233, 0.3);
      margin-top: 4px;
    }
    .notice {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 12px;
      color: #fcd34d;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .scope-box {
      background: #0b1324;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .scope-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    .scope-item:last-child { margin-bottom: 0; }
    .check {
      color: #10b981;
      font-weight: 900;
      font-size: 16px;
      margin-top: 2px;
    }
    .scope-title { font-size: 13px; font-weight: 700; color: #f1f5f9; }
    .scope-desc { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .actions {
      display: flex;
      gap: 12px;
    }
    .btn {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
    }
    .btn-allow {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #fff;
      box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.3);
    }
    .btn-allow:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-cancel {
      background: #1e293b;
      color: #94a3b8;
    }
    .btn-cancel:hover { color: #fff; background: #334155; }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="emblem">
        DIGI
        <span>INDIA</span>
      </div>
      <div>
        <div class="title">DigiLocker Consent Gateway</div>
        <div class="subtitle">MeriPehchan • National Single Sign-On (NSSO)</div>
        <span class="badge">Rule 9A IT Rules 2016 Compliant</span>
      </div>
    </div>

    <div class="notice">
      <strong>Sandbox Mode Notice:</strong> To connect live production MoRTH Parivahan records, configure <code>DIGILOCKER_CLIENT_ID</code> & <code>DIGILOCKER_CLIENT_SECRET</code> in Vercel settings.
    </div>

    <p style="font-size: 13px; margin-bottom: 16px; color: #cbd5e1;">
      <strong>Bharat Bike & Car Rental (BBR)</strong> is requesting authorization to access your official documents:
    </p>

    <div class="scope-box">
      <div class="scope-item">
        <div class="check">✓</div>
        <div>
          <div class="scope-title">Driving Licence (DRVLC)</div>
          <div class="scope-desc">MoRTH Parivahan National Register — DL validity & vehicle class eligibility (MCWG / LMV).</div>
        </div>
      </div>
      <div class="scope-item">
        <div class="check">✓</div>
        <div>
          <div class="scope-title">Aadhaar Identity Proof</div>
          <div class="scope-desc">UIDAI — Age confirmation (18+) for vehicle rental clearance.</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <a href="${cancelUrl}" class="btn btn-cancel">Deny & Cancel</a>
      <a href="${callbackUrl}" class="btn btn-allow">Allow & Authorize BBR</a>
    </div>

    <div class="footer">
      Official Government of India DigiLocker Gateway • UID: ${verifiedState.uid.slice(0, 10)}...
    </div>
  </div>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
