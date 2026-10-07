import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Settings2 } from 'lucide-react';

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'bbr_cookie_consent_v1';

interface CookieConsentBannerProps {
  forceOpen?: boolean;
  onCloseForceOpen?: () => void;
  onNavigateToPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  forceOpen = false,
  onCloseForceOpen,
  onNavigateToPolicy
}) => {
  const [hasConsented, setHasConsented] = useState<boolean>(true); // default true to avoid flash
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setHasConsented(false);
      } else {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setAnalyticsOptIn(Boolean(parsed.analytics));
        setMarketingOptIn(Boolean(parsed.marketing));
      }
    } catch {
      setHasConsented(false);
    }
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // ignore
    }
    setAnalyticsOptIn(analytics);
    setMarketingOptIn(marketing);
    setHasConsented(true);
    setShowCustomizeModal(false);
    if (onCloseForceOpen) onCloseForceOpen();
  };

  const handleAcceptAll = () => saveConsent(true, true);
  const handleRejectNonEssential = () => saveConsent(false, false);
  const handleSaveCustom = () => saveConsent(analyticsOptIn, marketingOptIn);

  // If forceOpen is triggered from footer button
  useEffect(() => {
    if (forceOpen) {
      setShowCustomizeModal(true);
    }
  }, [forceOpen]);

  if (hasConsented && !showCustomizeModal) return null;

  return (
    <>
      {/* ── Main Cookie Banner (Non-modal floating pill / card) ── */}
      {!hasConsented && !showCustomizeModal && (
        <div
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div
            className="p-5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10"
            style={{ backgroundColor: 'rgba(15, 18, 24, 0.96)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">
                  We Respect Your Privacy
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We use essential cookies for secure booking verification and session security. Non-essential tracking is turned off by default.
                </p>
                {onNavigateToPolicy && (
                  <button
                    onClick={onNavigateToPolicy}
                    className="text-[11px] font-bold text-orange-400 hover:text-orange-300 underline mt-1 block"
                  >
                    Read Cookie & Storage Policy
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowCustomizeModal(true)}
                className="py-2 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold transition-colors"
                title="Customize preferences"
                aria-label="Customize cookie preferences"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Customize Preferences Modal ── */}
      {showCustomizeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 bg-[#0F1218] text-[#F4F5F2] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 id="cookie-settings-title" className="text-base sm:text-lg font-black text-white font-heading">
                    Cookie Preferences
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Control which technologies are stored on your device
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCustomizeModal(false);
                  if (onCloseForceOpen) onCloseForceOpen();
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Required for core security, anti-bot form validation, maintaining rental modal steps, and preserving your login state. These cannot be switched off.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    aria-label="Strictly Necessary Cookies (Always Active)"
                    className="w-4 h-4 rounded text-orange-500 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-white">Anonymous Analytics</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Helps us understand page speed performance and fleet demand to improve our Dehradun vehicle availability. No personal identifiers are recorded.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    id="analytics-cookie-toggle"
                    checked={analyticsOptIn}
                    onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category 3: Marketing Consent */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-white">Promotional Communications</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Allows us to notify you about seasonal discounts (e.g. Mussoorie weekend specials or UPES student offers). You can withdraw this consent anytime.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    id="marketing-cookie-toggle"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={handleRejectNonEssential}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md shadow-orange-500/20"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
