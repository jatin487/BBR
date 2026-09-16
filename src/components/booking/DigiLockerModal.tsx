import React from 'react';
import { X, ShieldCheck, Award } from 'lucide-react';
import { KycCard } from '../kyc/KycCard';
import { UserProfile, VerifiedKycData, loadUserSession } from '../../lib/firebase';

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  riderName: string;
  riderPhone: string;
  user?: UserProfile | null;
  onVerificationSuccess?: (data: VerifiedKycData) => void;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({
  isOpen,
  onClose,
  riderName,
  riderPhone,
  user,
  onVerificationSuccess
}) => {
  if (!isOpen) return null;

  const activeUser = user || loadUserSession() || {
    uid: `guest-${(riderPhone || '').replace(/\D/g, '') || Date.now().toString(36)}`,
    name: riderName || 'Rider',
    phone: riderPhone || '',
    authProvider: 'phone' as const,
    kyc: null
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0A111F] border border-[#0074E4]/40 rounded-3xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#003B73] to-[#0074E4] flex items-center justify-center text-white shadow-lg shadow-[#003B73]/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  DigiLocker KYC Clearance
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0074E4]/20 text-cyan-300 border border-[#0074E4]/30">
                  Govt. of India
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate your Driving License & Aadhaar for instant 1-click self-drive vehicle rentals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* KycCard */}
        <KycCard
          user={activeUser}
          onKycUpdated={(kycData) => {
            if (kycData && onVerificationSuccess) {
              onVerificationSuccess(kycData);
            }
          }}
        />

        {/* Bottom Banner */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Verified documents remain securely linked to your account for all future BBR rentals.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

