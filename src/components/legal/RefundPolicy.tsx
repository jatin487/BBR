import React from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
}

export const RefundPolicy: React.FC<LegalPageProps> = ({ onBack }) => {
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
          This Refund and Cancellation Policy draft outlines standard commercial refund terms for Bharat Bike and Car Rentals (BBR). It does not waive statutory consumer rights under the Consumer Protection Act, 2019, and should be reviewed by legal counsel before formal adoption. Placeholders are indicated in brackets (e.g., <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">[PLACEHOLDER]</code>).
        </div>
      </div>

      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Transparent Cancellations & Deposit Claims</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Last Updated: October 2026 • Bharat Bike And Car Rentals (BBR Dehradun)
        </p>
      </header>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {/* Section 1: Philosophy */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">1.</span> Policy Overview
          </h2>
          <p>
            At Bharat Bike And Car Rentals (BBR Dehradun), we maintain honest and transparent cancellation and refund rules without hidden penalty clauses. Whether you reserved online or via WhatsApp/phone, the following guidelines govern booking cancellations and security deposit returns.
          </p>
        </section>

        {/* Section 2: Cancellation Terms */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">2.</span> Booking Cancellation Timeframes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                More than 6 Hours Before
              </span>
              <h3 className="text-base font-bold text-white mb-2">100% Full Refund</h3>
              <p className="text-xs text-slate-400">
                Cancel free of charge if notified 6+ hours before scheduled pickup time. Zero cancellation fees deducted.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Within 2 to 6 Hours
              </span>
              <h3 className="text-base font-bold text-white mb-2">15% Holding Fee</h3>
              <p className="text-xs text-slate-400">
                A 15% holding fee (or flat ₹150 for scooties) applies to cover vehicle prep and reserved slot holding. Remaining balance refunded immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-rose-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
                Less than 2 Hours / No-Show
              </span>
              <h3 className="text-base font-bold text-white mb-2">First Day Base Tariff</h3>
              <p className="text-xs text-slate-400">
                For last-minute no-shows without prior notice, the first day rental tariff is non-refundable. Security deposits are never forfeited for cancellations.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Security Deposit Refund */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">3.</span> Security Deposit Refund Process
          </h2>
          <p>
            Security deposits held at vehicle pickup (ranging from ₹500 to ₹3,000 depending on vehicle class) are processed as follows:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Return Inspection:</strong> A swift 5-minute visual check for tyre pressure, exterior scratches, and fuel level is conducted jointly with the rider.
            </li>
            <li>
              <strong>Instant Refund Timeline:</strong> If the vehicle is returned in the same condition, <strong>100% of the deposit is refunded via UPI (GPay/PhonePe/Paytm) or Cash within 30 minutes</strong>.
            </li>
            <li>
              <strong>Transparent Damage Settlements:</strong> In the unfortunate event of accidental body damage, only the actual manufacturer parts and repair cost are deducted. Itemized genuine repair estimates are provided to the customer. No arbitrary surcharges are applied.
            </li>
          </ul>
        </section>

        {/* Section 4: Refund Channels */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">4.</span> Mode & Timeline of Reimbursement
          </h2>
          <p>
            All refunds are credited directly back to the original source of payment:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>UPI & QR Transfers:</strong> Typically credited within 30 minutes to 4 hours.</li>
            <li><strong>Credit / Debit Card Online Payments (via Razorpay when active):</strong> Credited in 5 to 7 business banking days as per standard banking cycles.</li>
            <li><strong>Cash Handover:</strong> Immediate cash refund upon vehicle counter handover.</li>
          </ul>
        </section>

        {/* Section 5: Initiating a Cancellation */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">5.</span> How to Request a Cancellation or Refund
          </h2>
          <p>
            To cancel a reservation or dispute a deposit adjustment, contact our Bhauwala support desk directly:
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <p><strong>Call / WhatsApp:</strong> <a href="tel:8507067716" className="text-orange-400 underline">+91 8507067716</a> or <a href="tel:01354164070" className="text-orange-400 underline">0135 416 4070</a></p>
            <p><strong>Email:</strong> <a href="mailto:bharatbikerentaldehradun@gmail.com" className="text-orange-400 underline">bharatbikerentaldehradun@gmail.com</a></p>
            <p><strong>Subject Format:</strong> "Cancellation Request - [Booking ID]"</p>
          </div>
        </section>
      </div>
    </div>
  );
};
