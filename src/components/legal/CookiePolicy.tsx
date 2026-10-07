import React from 'react';
import { ArrowLeft, Cookie, AlertTriangle, ShieldCheck, Settings, Check } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  onOpenCookieSettings?: () => void;
}

export const CookiePolicy: React.FC<LegalPageProps> = ({ onBack, onOpenCookieSettings }) => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Review Notice Banner */}
      <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="block font-bold text-amber-300 mb-1">
            Review-Ready Draft — Not Legal Advice
          </strong>
          This Cookie Policy explains how local storage and session identifiers operate on Bharat Bike and Car Rentals (BBR). It outlines strictly necessary tokens versus optional trackers and must be reviewed by legal counsel prior to formal certification.
        </div>
      </div>

      <header className="mb-10 pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Cookie className="w-3.5 h-3.5" />
            <span>Digital Storage & Tracking Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Cookie & Storage Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Last Updated: October 2026 • Bharat Bike And Car Rentals (BBR Dehradun)
          </p>
        </div>

        {onOpenCookieSettings && (
          <button
            onClick={onOpenCookieSettings}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Preferences</span>
          </button>
        )}
      </header>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {/* Section 1: What are cookies */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">1.</span> What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies and browser storage mechanisms (such as HTML5 LocalStorage and SessionStorage) are small data files stored on your device when you browse websites. They enable the portal to remember your active hub selection, preserve pending rental configurations across modal steps, and defend form endpoints from automated bot spam.
          </p>
        </section>

        {/* Section 2: Audit Table */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">2.</span> Audit of Storage Keys & Services Used
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3 sm:p-4">Key / Identifier</th>
                  <th className="p-3 sm:p-4">Category</th>
                  <th className="p-3 sm:p-4">Provider</th>
                  <th className="p-3 sm:p-4">Purpose & Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-orange-400 font-bold">bbr_cookie_consent_v1</td>
                  <td className="p-3 sm:p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">Strictly Essential</span></td>
                  <td className="p-3 sm:p-4">BBR Portal</td>
                  <td className="p-3 sm:p-4">Stores your cookie preferences (Accept/Reject/Custom). Persistent (1 year).</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-orange-400 font-bold">bbr-user / bbr-user-profile</td>
                  <td className="p-3 sm:p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">Strictly Essential</span></td>
                  <td className="p-3 sm:p-4">BBR / Firebase Auth</td>
                  <td className="p-3 sm:p-4">Retains active rider phone session so you do not need to re-verify OTP on each page refresh. Session duration.</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-orange-400 font-bold">bbr-kyc-*</td>
                  <td className="p-3 sm:p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">Strictly Essential</span></td>
                  <td className="p-3 sm:p-4">BBR / DigiLocker</td>
                  <td className="p-3 sm:p-4">Caches verified Driving License badge token for faster booking completion during the active session.</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-orange-400 font-bold">_firebase_appcheck</td>
                  <td className="p-3 sm:p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">Strictly Essential</span></td>
                  <td className="p-3 sm:p-4">Google Firebase</td>
                  <td className="p-3 sm:p-4">Protects API backend routes from scraping, denial-of-service, and fraudulent bot bookings.</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-orange-400 font-bold">analytics_consent</td>
                  <td className="p-3 sm:p-4"><span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold text-[10px]">Optional Analytics</span></td>
                  <td className="p-3 sm:p-4">BBR Diagnostics</td>
                  <td className="p-3 sm:p-4">Inactive by default. Collects anonymous page performance metrics if explicitly accepted.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Third Party Audit */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">3.</span> Advertising & Third-Party Tracking Audit
          </h2>
          <p>
            Bharat Bike and Car Rentals does <strong>not</strong> inject third-party ad retargeting pixels (e.g. Meta Pixel, TikTok Pixel, Google Ads remarketing cookies) into customer browsing experiences. We prioritize page speed, bandwidth conservation, and rider privacy.
          </p>
        </section>

        {/* Section 4: Control & Withdrawal */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">4.</span> How You Can Control Your Choices
          </h2>
          <p>
            You have full control over non-essential digital tokens at all times:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Consent Banner:</strong> You can select "Accept All", "Reject Non-Essential", or configure granular switches.
            </li>
            <li>
              <strong>Revisiting Settings:</strong> You can modify your choices at any point by clicking the "Cookie Preferences" link located in the website footer.
            </li>
            <li>
              <strong>Browser Controls:</strong> Most modern browsers (Chrome, Firefox, Safari, Edge) allow you to block or delete cookies via your browser settings. Note that disabling strictly necessary session tokens may prevent booking forms from submitting correctly.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
