import React from 'react';
import { Shield, ArrowLeft, FileText, AlertTriangle, Scale, Lock, Eye } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
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
          This Privacy Policy draft outlines operational data handling practices for Bharat Bike and Car Rentals (BBR). It does not constitute legal guarantees, does not restrict your statutory consumer rights under applicable law, and must be reviewed by a qualified Indian legal practitioner before commercial execution. Specific legal entities and placeholders are marked with bracketed tags (e.g., <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">[PLACEHOLDER]</code>).
        </div>
      </div>

      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Information & Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Last Updated: October 2026 • Bharat Bike And Car Rentals (BBR Dehradun)
        </p>
      </header>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {/* Section 1: Introduction */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">1.</span> Operating Entity & Scope
          </h2>
          <p>
            This policy applies to services offered by <strong>Bharat Bike And Car Rentals</strong> (operating as "BBR Dehradun", hereinafter referred to as "the Business", "we", "us", or "our"), with operating hub at Bhauwala, Dehradun, Uttarakhand 248007, and online portal at <a href="https://bbr-dehradun.vercel.app/" className="text-orange-400 underline">https://bbr-dehradun.vercel.app/</a>.
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <p><strong>Formal Legal Entity:</strong> <code className="text-amber-300">[LEGAL_BUSINESS_ENTITY_NAME — e.g., Bharat Bike & Car Rentals LLP / Proprietorship]</code></p>
            <p><strong>Registration / CIN / MSME:</strong> <code className="text-amber-300">[REGISTRATION_OR_CIN_NUMBER]</code></p>
            <p><strong>GSTIN:</strong> <code className="text-amber-300">[GSTIN_IDENTIFICATION_NUMBER]</code></p>
            <p><strong>Registered Address:</strong> Bhauwala, Dehradun, Uttarakhand 248007 <code className="text-amber-300">[FULL_REGISTERED_OFFICE_ADDRESS]</code></p>
          </div>
        </section>

        {/* Section 2: Data Collected */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">2.</span> Categories of Information Collected & Purpose
          </h2>
          <p>
            We collect only the personal information strictly necessary to process your rental enquiries, verify statutory driving authorization, fulfill vehicle reservations, and comply with the Motor Vehicles Act, 1988:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Identity & Contact Details:</strong> Name, mobile phone number, email address. Used to correspond with you regarding vehicle availability, send booking confirmations, and coordinate pickup/drop locations.
            </li>
            <li>
              <strong>Statutory Driving License (DL) & Government ID:</strong> DL number, authorized vehicle classes (e.g. MCWG, LMV), expiration date, and optional government ID (Aadhaar/Voter ID) for identity verification under Indian road safety regulations.
            </li>
            <li>
              <strong>DigiLocker Verification Tokens:</strong> When you choose Government DigiLocker verification, we receive temporary cryptographic assertion tokens issued by MeriPehchan / DigiLocker. We do not store your DigiLocker account credentials or security PIN.
            </li>
            <li>
              <strong>Rental Schedule & Preferences:</strong> Chosen pickup hub, drop hub, start date/time, return date/time, selected add-ons (helmets, protective gear).
            </li>
            <li>
              <strong>Technical Logs & Network Identifiers:</strong> IP address, browser type, and timestamps for spam defense, fraud prevention, and rate-limiting on booking forms.
            </li>
          </ul>
        </section>

        {/* Section 3: Consent Separation */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">3.</span> Separation of Transactional vs. Marketing Consent
          </h2>
          <p>
            In accordance with digital privacy principles and India's Digital Personal Data Protection Act (DPDP Act, 2023):
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Submitting a booking request or enquiry gives consent <strong>only</strong> for processing that specific rental transaction and related operational communications (e.g., pickup directions, roadside support).
            </li>
            <li>
              Marketing updates, tourist itineraries, and promotional discount alerts require separate, voluntary opt-in consent. They are never preselected by default.
            </li>
            <li>
              You may withdraw promotional consent at any time without affecting your active or past rental bookings by clicking the unsubscribe link or messaging <a href="mailto:bharatbikerentaldehradun@gmail.com" className="text-orange-400 underline">bharatbikerentaldehradun@gmail.com</a>.
            </li>
          </ul>
        </section>

        {/* Section 4: Data Retention */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">4.</span> Retention and Deletion
          </h2>
          <p>
            Rental logs and verification records are retained for <code className="text-amber-300">[DATA_RETENTION_PERIOD_DAYS — e.g., 180 days / 1 year]</code> to fulfill tax auditing, traffic violation challan reconciliations, and regulatory compliance obligations, after which they are securely purged or anonymized. Customers may request review or deletion of non-statutory data by contacting our Grievance Officer.
          </p>
        </section>

        {/* Section 5: Third-Party Services Audit */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">5.</span> Third-Party Service Providers Audit
          </h2>
          <p>
            We do not sell, rent, or trade your personal information. The site interfaces with the following verified technical infrastructure partners:
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <strong>Vercel Inc. (Hosting & Edge Functions):</strong> Hosts web assets and executes secure API serverless functions. Collects standard HTTP access logs for reliability and DDoS defense.
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <strong>Google Firebase (Identity & App Check):</strong> Manages secure user session authentication and reCAPTCHA bot defense tokens.
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <strong>Government DigiLocker / MeriPehchan:</strong> Official government verification gateway accessed only when explicitly initiated by the user.
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <strong>Razorpay Software Pvt. Ltd. (Payment Gateway — Inactive/Pending):</strong> Will process online payments once configured. Operates under RBI regulations and PCI-DSS compliance. We never receive or store card numbers or banking passwords.
            </div>
          </div>
        </section>

        {/* Section 6: Grievance Redressal */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">6.</span> Grievance Officer & Contact Details
          </h2>
          <p>
            In accordance with the Information Technology Act, 2000 and Rule 5(9) of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011:
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <p><strong>Grievance Officer:</strong> <code className="text-amber-300">[DESIGNATED_GRIEVANCE_OFFICER_NAME]</code></p>
            <p><strong>Designation:</strong> Compliance & Operations Lead</p>
            <p><strong>Email:</strong> <a href="mailto:bharatbikerentaldehradun@gmail.com" className="text-orange-400 underline">bharatbikerentaldehradun@gmail.com</a></p>
            <p><strong>Helpline:</strong> <a href="tel:01354164070" className="text-orange-400 underline">0135 416 4070</a> / <a href="tel:8507067716" className="text-orange-400 underline">+91 8507067716</a></p>
            <p><strong>Office:</strong> Bhauwala Main Road, Dehradun, Uttarakhand 248007</p>
            <p className="text-slate-400 text-[11px] pt-1">
              Grievances are acknowledged within 48 business hours and resolved within 30 days as prescribed by law.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
