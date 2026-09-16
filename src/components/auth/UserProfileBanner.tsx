import React from 'react';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { UserProfile, VerifiedKycData } from '../../lib/firebase';
import { KycCard } from '../kyc/KycCard';

interface UserProfileBannerProps {
  user: UserProfile;
  onSignOut: () => void;
  onKycUpdated: (kyc: VerifiedKycData | null) => void;
}

export const UserProfileBanner: React.FC<UserProfileBannerProps> = ({
  user,
  onSignOut,
  onKycUpdated
}) => {
  const isKycVerified = Boolean(user.kyc && user.kyc.status === 'verified');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div
        className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl border transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(17,22,34,0.9) 100%)',
          borderColor: isKycVerified ? 'rgba(16,185,129,0.25)' : 'rgba(255,106,0,0.2)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: User Identity Info (Req 4: Welcome, {actualUserName}, email, photoURL, uid) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/40 shadow-lg shrink-0"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF6A00 0%, #CC5500 100%)',
                    color: '#fff'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/25">
                    {user.authProvider === 'google' ? 'Google Authenticated' : 'Phone Verified'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    UID: {user.uid.slice(0, 10)}...
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-1 truncate">
                  Welcome, {user.name || 'Rider'}
                </h2>
                <div className="flex flex-col gap-0.5 text-xs text-slate-400 mt-1">
                  {user.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onSignOut}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right: DigiLocker KYC Card (Req 6 & 14) */}
          <div className="lg:col-span-7">
            <KycCard
              user={user}
              onKycUpdated={onKycUpdated}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfileBanner;
