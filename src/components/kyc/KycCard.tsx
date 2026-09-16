import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Unlink,
  Loader2,
  Info
} from 'lucide-react';
import { useToast } from '../common/Toast';
import {
  UserProfile,
  VerifiedKycData,
  saveUserKyc,
  clearUserKyc
} from '../../lib/firebase';

interface KycCardProps {
  user: UserProfile | null;
  onKycUpdated?: (kycData: VerifiedKycData | null) => void;
  onOpenAuth?: () => void;
  compact?: boolean;
}

export const KycCard: React.FC<KycCardProps> = ({
  user,
  onKycUpdated,
  onOpenAuth,
  compact = false
}) => {
  const { showToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isVerified = Boolean(user?.kyc && user.kyc.status === 'verified');
  const kyc = user?.kyc;

  // Listen for DigiLocker OAuth popup completion message
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BBR_DIGILOCKER_SUCCESS') {
        const receivedKyc = event.data.kyc as VerifiedKycData;
        const targetUid = event.data.uid;

        // Security check: Only apply if it matches current user's UID
        if (user && user.uid === targetUid && receivedKyc) {
          saveUserKyc(receivedKyc, user.uid);
          if (onKycUpdated) onKycUpdated(receivedKyc);
          showToast('DigiLocker Driving Licence verified successfully!', 'success');
          setIsConnecting(false);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [user, onKycUpdated, showToast]);

  // Connect to DigiLocker OAuth flow via secure backend
  const handleConnectDigiLocker = async () => {
    if (!user) {
      showToast('Please sign in first to verify your DigiLocker KYC', 'info');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(`/api/digilocker/connect?uid=${encodeURIComponent(user.uid)}`);
      const data = await response.json();

      if (!response.ok || !data.authUrl) {
        throw new Error(data.message || 'Unable to connect to DigiLocker gateway');
      }

      // Open in secure OAuth popup or redirect
      const width = 600;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.authUrl,
        'DigiLockerConsent',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Popup was blocked by browser, redirect current window instead
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('DigiLocker connect error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to launch DigiLocker authentication';
      showToast(msg, 'error');
      setIsConnecting(false);
    }
  };

  // Disconnect DigiLocker KYC
  const handleDisconnect = async () => {
    if (!user) return;
    const confirm = window.confirm('Are you sure you want to disconnect DigiLocker and clear your verified KYC?');
    if (!confirm) return;

    setIsDisconnecting(true);
    try {
      await fetch('/api/digilocker/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });

      clearUserKyc(user.uid);
      if (onKycUpdated) onKycUpdated(null);
      showToast('DigiLocker disconnected. KYC record cleared.', 'info');
      setShowDetails(false);
    } catch (err) {
      console.error('Disconnect error:', err);
      showToast('Failed to disconnect DigiLocker', 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${
        isVerified
          ? 'bg-gradient-to-br from-[#061C14]/90 via-[#0B2A1E]/80 to-[#0F172A]/90 border-emerald-500/30 shadow-xl shadow-emerald-950/20'
          : 'bg-gradient-to-br from-[#111827]/90 via-[#0F172A]/85 to-[#0B0F19]/90 border-white/10 hover:border-orange-500/30'
      } ${compact ? 'p-4' : 'p-6 sm:p-7'}`}
    >
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white font-heading">
                {isVerified ? '✓ KYC Verified' : '🛡 KYC Verification'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                DigiLocker
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVerified
                ? 'Driving Licence officially verified with MoRTH Parivahan'
                : 'Complete your verification using DigiLocker.'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="shrink-0">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Not Verified
            </span>
          )}
        </div>
      </div>

      {/* ── State 1: Verified Card State ── */}
      {isVerified && kyc ? (
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-black/30 border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                DigiLocker Status
              </span>
              <p className="font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                DigiLocker Connected
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Document Status
              </span>
              <p className="font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Driving Licence Verified
              </p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Licence Number:</span>{' '}
                <span className="font-bold font-mono text-white">{kyc.dlNumber}</span>
              </div>
              {kyc.holderName && (
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400">Holder:</span>{' '}
                  <span className="font-bold text-white">{kyc.holderName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {kyc.validTill && (
                  <div>
                    <span className="text-slate-400">Valid Till:</span>{' '}
                    <span className="font-bold text-white">{kyc.validTill}</span>
                  </div>
                )}
                {kyc.dob && (
                  <div>
                    <span className="text-slate-400">Date of Birth:</span>{' '}
                    <span className="font-bold text-white">{kyc.dob}</span>
                  </div>
                )}
                {kyc.digilockerDocId && (
                  <div className="sm:col-span-2 font-mono text-[10px] text-slate-400">
                    Doc Reference: <span className="text-slate-200">{kyc.digilockerDocId}</span>
                  </div>
                )}
                {kyc.verificationTimestamp && (
                  <div className="sm:col-span-2 text-[10px] text-slate-400">
                    Verified On: <span className="text-slate-200">{kyc.verificationTimestamp}</span>
                  </div>
                )}
              </div>

              {kyc.vehicleClasses && kyc.vehicleClasses.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Eligible Vehicle Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {kyc.vehicleClasses.map((cls, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/5 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions: View Details & Disconnect */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              {isDisconnecting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Unlink className="w-3 h-3" />
              )}
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── State 2: Not Verified Card State ── */
        <div className="space-y-4 pt-1">
          <p className="text-xs text-slate-300 leading-relaxed">
            Verify your identity and Driving Licence securely using DigiLocker. Required for instantaneous rental booking clearance without physical photocopies or security deposit delays.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>MoRTH Sarathi Certified • 100% Encrypted</span>
            </div>

            <button
              type="button"
              onClick={handleConnectDigiLocker}
              disabled={isConnecting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Connect DigiLocker</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycCard;
