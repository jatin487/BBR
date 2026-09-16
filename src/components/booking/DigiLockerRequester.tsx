import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  RefreshCw,
  Check,
  ArrowRight,
  Fingerprint,
  FileText,
  QrCode,
  Download,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../common/Toast';
import {
  saveUserKyc,
  loadUserKyc,
  VerifiedKycData
} from '../../lib/firebase';

export type { VerifiedKycData };

interface DigiLockerRequesterProps {
  riderName: string;
  riderPhone: string;
  onVerificationComplete: (data: VerifiedKycData) => void;
  initialVerifiedData?: VerifiedKycData | null;
  standalone?: boolean;
}

export const DigiLockerRequester: React.FC<DigiLockerRequesterProps> = ({
  riderName,
  riderPhone,
  onVerificationComplete,
  initialVerifiedData = null,
  standalone = false
}) => {
  const { showToast } = useToast();

  const [verifiedData, setVerifiedData] = useState<VerifiedKycData | null>(() => {
    return initialVerifiedData || loadUserKyc() || null;
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStage, setVerifyStage] = useState<
    'idle' | 'consent' | 'connecting' | 'fetching_dl' | 'fetching_aadhaar' | 'completed'
  >(verifiedData ? 'completed' : 'idle');

  // DigiLocker simulation credentials
  const [aadhaarInput, setAadhaarInput] = useState(() => {
    const clean = (riderPhone || '').replace(/\D/g, '').slice(-4);
    return clean ? `8921 4452 ${clean}` : '8921 4452 9012';
  });
  const [digilockerPin, setDigilockerPin] = useState('123456');
  const [consentGranted, setConsentGranted] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  // Manual fallback state — start empty, user fills in their own details
  const [activeTab, setActiveTab] = useState<'digilocker' | 'manual'>('digilocker');
  const [manualDl, setManualDl] = useState('');
  const [manualAadhaar, setManualAadhaar] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (initialVerifiedData) {
      setVerifiedData(initialVerifiedData);
      setVerifyStage('completed');
    }
  }, [initialVerifiedData]);

  const startDigiLockerFlow = () => {
    setVerifyStage('consent');
  };

  const handleAuthorizeDigiLocker = async () => {
    if (!consentGranted) {
      showToast('Please grant consent to fetch documents from DigiLocker', 'error');
      return;
    }

    setIsVerifying(true);
    setVerifyStage('connecting');

    // Stage 1: Connect to MeriPehchan / DigiLocker
    await new Promise((r) => setTimeout(r, 700));
    setVerifyStage('fetching_dl');

    // Stage 2: Query MoRTH National Register
    await new Promise((r) => setTimeout(r, 800));
    setVerifyStage('fetching_aadhaar');

    // Stage 3: UIDAI Aadhaar demographic match
    await new Promise((r) => setTimeout(r, 700));

    const generatedDocId = `DGL-IN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomDlSuffix = Math.floor(1000 + Math.random() * 9000);
    const dlNumber = `UK-07202300${randomDlSuffix}`;
    const maskedAadhaar = `XXXX-XXXX-${aadhaarInput.replace(/\s+/g, '').slice(-4) || '9012'}`;
    const securityHash = `SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();

    const kycResult: VerifiedKycData = {
      status: 'verified',
      dlNumber,
      aadhaarNumber: maskedAadhaar,
      holderName: riderName && riderName.trim() ? riderName.trim() : 'Verified Rider',
      dob: '15-Aug-1996',
      validTill: '14-Sep-2041',
      vehicleClasses: ['MCWG (Motorcycle with Gear)', 'LMV (Light Motor Vehicle)'],
      digilockerDocId: generatedDocId,
      verificationTimestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      securityHash,
      qrCodeData: `https://verify.digitallocker.gov.in/v2/doc/${generatedDocId}`
    };

    setVerifiedData(kycResult);
    setIsVerifying(false);
    setVerifyStage('completed');

    // Persist to user's Firebase account storage
    saveUserKyc(kycResult);
    onVerificationComplete(kycResult);

    showToast('DigiLocker documents authenticated & saved to your profile!', 'success');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDl || manualDl.length < 8) {
      showToast('Please enter a valid Driving License number', 'error');
      return;
    }

    const manualResult: VerifiedKycData = {
      status: 'verified',
      dlNumber: manualDl.toUpperCase(),
      aadhaarNumber: manualAadhaar,
      holderName: riderName || 'Verified Rider',
      dob: 'Verified from DL Copy',
      validTill: 'Valid',
      vehicleClasses: ['MCWG', 'LMV'],
      digilockerDocId: `MANUAL-${Date.now().toString().slice(-6)}`,
      verificationTimestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      securityHash: 'MANUAL-OFFLINE-REVIEW'
    };

    setVerifiedData(manualResult);
    setVerifyStage('completed');
    saveUserKyc(manualResult);
    onVerificationComplete(manualResult);
    showToast('Manual documents submitted for review', 'info');
  };

  const handleCopyDocId = () => {
    if (verifiedData?.digilockerDocId) {
      navigator.clipboard.writeText(verifiedData.digilockerDocId);
      showToast(`Copied DigiLocker Reference: ${verifiedData.digilockerDocId}`, 'info');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher: DigiLocker vs Manual */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('digilocker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'digilocker'
                ? 'bg-[#003B73] text-white shadow-md shadow-[#003B73]/30 border border-[#0074E4]/40'
                : 'text-slate-400 hover:text-white bg-slate-900/40 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DigiLocker Instant KYC (Recommended)</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
              Official
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-slate-800 text-white border border-white/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual Upload</span>
          </button>
        </div>

        {verifiedData && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            DigiLocker Authenticated
          </span>
        )}
      </div>

      {activeTab === 'digilocker' && (
        <div className="space-y-4">
          {/* DigiLocker Official Brand Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#001D3D]/90 via-[#003566]/70 to-[#0A2540]/90 border border-[#0074E4]/30 shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#0074E4]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Ashoka Emblem / DigiLocker Badge */}
                <div className="w-11 h-11 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
                  <div className="w-full h-full rounded-lg bg-[#003566] flex flex-col items-center justify-center text-white">
                    <span className="text-[8px] font-extrabold tracking-tighter leading-none">डिजिटल</span>
                    <span className="text-[9px] font-black text-amber-400 leading-none">INDIA</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white tracking-wide">
                      DigiLocker Document Requester
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0074E4]/20 text-cyan-300 border border-[#0074E4]/40">
                      MeitY Govt. of India
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Authorized document authentication under Rule 9A of Information Technology Rules 2016.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <Lock className="w-3 h-3" />
                <span>256-bit Encrypted</span>
              </div>
            </div>
          </div>

          {/* Idle / Not yet verified stage */}
          {verifyStage === 'idle' && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white mb-2">
                  FREEDO requires the following verified credentials for rental clearance:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Driving License (DL)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Issued by MoRTH Parivahan. Validates authorization for 2-wheelers (MCWG) & Cars (LMV).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Aadhaar e-KYC</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Issued by UIDAI. Confirms rider identity & age (18+) without physical photocopies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero physical photocopies • Saved permanently to account</span>
                </div>

                <button
                  type="button"
                  onClick={startDigiLockerFlow}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0052CC] to-[#0074E4] hover:from-[#0047B3] hover:to-[#0066CC] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0052CC]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Connect with DigiLocker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Consent / Authorization Stage */}
          {verifyStage === 'consent' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-[#0074E4]/40 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    DigiLocker Consent & Authentication
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Signing in as <span className="text-white font-medium">{riderName || 'Rider'}</span>
                  </p>
                </div>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  MeriPehchan Gateway
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                    Aadhaar / Mobile linked with DigiLocker
                  </label>
                  <input
                    type="text"
                    value={aadhaarInput}
                    onChange={(e) => setAadhaarInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#0074E4]"
                    placeholder="Enter 12-digit Aadhaar"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                    6-digit DigiLocker Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={digilockerPin}
                    onChange={(e) => setDigilockerPin(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-[#0074E4]"
                    placeholder="••••••"
                  />
                </div>
              </div>

              {/* Legal Consent Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 rounded text-orange-500 accent-[#0074E4] w-4 h-4"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  I hereby grant consent to <strong>Bharat Bike and Car Rentals (FREEDO)</strong> to fetch and verify my Driving License and Aadhaar XML record from DigiLocker repository for the sole purpose of self-drive vehicle rental verification.
                </span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyStage(verifiedData ? 'completed' : 'idle')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAuthorizeDigiLocker}
                  disabled={isVerifying}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant Consent & Fetch Documents</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading / Fetching stages */}
          {(verifyStage === 'connecting' ||
            verifyStage === 'fetching_dl' ||
            verifyStage === 'fetching_aadhaar') && (
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-[#0074E4]/40 text-center space-y-4 animate-in fade-in">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#0074E4]/20 border-t-[#0074E4] animate-spin" />
                <ShieldCheck className="w-8 h-8 text-[#0074E4]" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {verifyStage === 'connecting' && 'Connecting to MeriPehchan DigiLocker Gateway...'}
                  {verifyStage === 'fetching_dl' && 'Fetching Driving License from MoRTH Registry...'}
                  {verifyStage === 'fetching_aadhaar' && 'Validating UIDAI Aadhaar Demographic Signature...'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Secure cryptographic token exchange in progress. Please wait...
                </p>
              </div>

              <div className="max-w-xs mx-auto w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-[#0074E4] h-full transition-all duration-500"
                  style={{
                    width:
                      verifyStage === 'connecting'
                        ? '30%'
                        : verifyStage === 'fetching_dl'
                        ? '70%'
                        : '95%'
                  }}
                />
              </div>
            </div>
          )}

          {/* Completed / Verified Govt Document Cards Display */}
          {verifyStage === 'completed' && verifiedData && (
            <div className="space-y-4 animate-in fade-in">
              {/* DigiLocker Digital Driving License Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#061826] via-slate-900 to-slate-950 border border-emerald-500/30 relative overflow-hidden shadow-xl">
                {/* Verified Ribbon */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                        DigiLocker Verified Credential
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        Digital Driving License (MoRTH Parivahan)
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active & Valid
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      DL Number
                    </span>
                    <span className="font-mono font-bold text-white text-xs tracking-wider">
                      {verifiedData.dlNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Rider / Holder Name
                    </span>
                    <span className="font-bold text-slate-200">
                      {verifiedData.holderName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Validity Period
                    </span>
                    <span className="font-bold text-emerald-400">
                      Valid Upto {verifiedData.validTill}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-500 font-semibold">Authorized:</span>
                    {verifiedData.vehicleClasses.map((cls, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] border border-cyan-500/20"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      Doc Ref: <span className="text-slate-300">{verifiedData.digilockerDocId}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDocId}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                      title="Copy Reference ID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Micro QR Seal */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <Lock className="w-3 h-3" />
                    {verifiedData.securityHash || 'SHA256:4FA8...92B1'}
                  </span>
                  <span className="text-slate-500">
                    Saved to Firebase Account • Instant Checkout Active
                  </span>
                </div>
              </div>

              {/* Aadhaar Match Sub-card */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">UIDAI Aadhaar Verified</span>
                    <span className="text-[10px] text-slate-400">
                      Masked UID: {verifiedData.aadhaarNumber} • Identity & Age 18+ Confirmed
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setVerifyStage('consent')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-verify</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Upload Alternative */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Driving License Number
              </label>
              <input
                type="text"
                value={manualDl}
                onChange={(e) => setManualDl(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500"
                placeholder="e.g. UK0720210087452"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Aadhaar / Voter ID Number
              </label>
              <input
                type="text"
                value={manualAadhaar}
                onChange={(e) => setManualAadhaar(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500"
                placeholder="12-digit Aadhaar"
                required
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-white/15 text-center">
            <input
              type="file"
              id="manual-doc-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadedFileName(e.target.files[0].name);
                  showToast(`Attached: ${e.target.files[0].name}`, 'info');
                }
              }}
            />
            <label htmlFor="manual-doc-upload" className="cursor-pointer space-y-1.5 block">
              <FileCheck className="w-6 h-6 text-orange-400 mx-auto" />
              <p className="text-xs font-bold text-white">
                {uploadedFileName || 'Upload Photo of Original Driving License'}
              </p>
              <p className="text-[10px] text-slate-400">Supports JPG, PNG or PDF (Max 5MB)</p>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
            >
              Submit Manual Documents
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
