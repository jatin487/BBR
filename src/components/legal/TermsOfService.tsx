import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, ShieldCheck, Scale, MapPin } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<LegalPageProps> = ({ onBack }) => {
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
          This document is an operational Terms of Service draft for Bharat Bike and Car Rentals (BBR). It does not guarantee total legal immunity, does not waive statutory consumer rights under the Consumer Protection Act 2019 or the Motor Vehicles Act 1988, and must be reviewed and customized by an advocate licensed under Indian jurisdiction prior to official deployment. Missing business identifiers are marked in brackets (e.g., <code className="bg-black/30 px-1 py-0.5 rounded text-amber-100">[PLACEHOLDER]</code>).
        </div>
      </div>

      <header className="mb-10 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Rental Agreement & Service Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Last Updated: October 2026 • Bharat Bike And Car Rentals (BBR Dehradun)
        </p>
      </header>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {/* Section 1: Agreement */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">1.</span> Rental Agreement Overview
          </h2>
          <p>
            By submitting an enquiry, reserving a vehicle, or taking handover of a rental ride from <strong>Bharat Bike And Car Rentals</strong> (<code className="text-amber-300">[LEGAL_BUSINESS_ENTITY_NAME]</code>, GSTIN: <code className="text-amber-300">[GSTIN_NUMBER]</code>), the hirer ("Rider", "Customer", or "You") agrees to these Terms of Service. A physical or digitally signed vehicle inspection sheet will be counter-signed at vehicle pickup.
          </p>
        </section>

        {/* Section 2: Eligibility & Documents */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">2.</span> Rider Eligibility & Verification Requirements
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Age Requirement:</strong> Minimum 18 years of age for two-wheelers (scooties & motorcycles); minimum 21 years of age for self-drive cars and Thar 4x4.
            </li>
            <li>
              <strong>Valid Driving License:</strong> An original, government-issued Driving License valid for the category of vehicle rented (Class MCWG for gear motorcycles, MCWOG for gearless scooties, and LMV for cars). Learner licenses are strictly invalid for self-drive rentals under Indian traffic regulations.
            </li>
            <li>
              <strong>Secondary Government ID:</strong> Aadhaar Card, Passport, or Voter ID proof. DigiLocker verified digital credentials are accepted for swift paperless verification.
            </li>
          </ul>
        </section>

        {/* Section 3: Pricing, Security Deposits & GST */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">3.</span> Transparent Tariffs, Taxes & Security Deposits
          </h2>
          <p>
            BBR operates on 100% upfront transparency without hidden surcharges:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Rental Tariffs:</strong> Tariffs are charged per hourly block, 12-hour night tariff, or 24-hour day pass as selected during reservation.
            </li>
            <li>
              <strong>Applicable Taxes:</strong> Goods and Services Tax (GST @ 18%) is calculated and itemized clearly on all invoices and summaries.
            </li>
            <li>
              <strong>Refundable Security Deposit:</strong> A security deposit (starting from ₹500 for commuter scooties, ₹1,000–₹2,000 for mid-size bikes, and ₹2,500–₹5,000 for cars) is held at vehicle handover. This deposit is <strong>100% refunded</strong> via UPI or cash within 30 minutes of return, subject to vehicle inspection.
            </li>
            <li>
              <strong>Fuel Policy:</strong> Vehicles are handed over with a noted fuel level. Hirers are expected to return the vehicle with equivalent fuel. Fuel is not included in the rental tariff.
            </li>
            <li>
              <strong>Late Return Charges:</strong> A grace period of 30 minutes is provided. Delays beyond 30 minutes without prior extension notice incur an hourly fee based on the standard vehicle tariff.
            </li>
          </ul>
        </section>

        {/* Section 4: Safe Driving & Road Regulations */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">4.</span> Road Safety & Operation Rules
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Mandatory Helmets:</strong> In strict compliance with Section 129 of the Motor Vehicles Act, helmets must be worn at all times by both the rider and pillion passenger. One ISI-certified helmet is provided free of charge with every two-wheeler.
            </li>
            <li>
              <strong>Substance Prohibition:</strong> Driving under the influence of alcohol, narcotics, or intoxicating drugs is strictly forbidden and constitutes a criminal violation under Indian law.
            </li>
            <li>
              <strong>Permitted Operating Zones:</strong> Vehicles possess commercial all-Uttarakhand permits. Travel across Dehradun, Mussoorie, Dhanaulti, Rishikesh, Haridwar, Tehri, and Chakrata is permitted. Off-roading through riverbeds, racing, stunts, and commercial subleasing are strictly prohibited.
            </li>
            <li>
              <strong>Traffic Challans & Fines:</strong> Any e-challan or traffic violation fine levied during the rental period is the sole financial and legal responsibility of the hirer.
            </li>
          </ul>
        </section>

        {/* Section 5: Breakdowns & Roadside Assistance */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">5.</span> Mechanical Breakdowns & Emergency Assistance
          </h2>
          <p>
            All vehicles undergo a 25-point safety inspection before handover. In the event of an unforeseen mechanical breakdown on permitted routes:
          </p>
          <p>
            Call BBR 24/7 Roadside Assistance at <a href="tel:01354164070" className="text-orange-400 font-bold">0135 416 4070</a> or <a href="tel:8507067716" className="text-orange-400 font-bold">+91 8507067716</a>. Our mechanic team will assist or arrange a replacement vehicle as soon as feasible. Normal tyre punctures or accidental physical damage caused by rough driving are the responsibility of the hirer.
          </p>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">6.</span> Liability & Legal Boundaries
          </h2>
          <p>
            Vehicles carry statutory comprehensive commercial third-party insurance as required under Indian law. Nothing in these terms limits or excludes liability for death, personal injury caused by proven negligence, or any consumer right that cannot be lawfully waived under the Consumer Protection Act, 2019.
          </p>
        </section>

        {/* Section 7: Jurisdiction */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-orange-400">7.</span> Governing Law & Dispute Resolution
          </h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising out of or in connection with these terms that cannot be resolved amicably shall be subject to the exclusive jurisdiction of the courts of competent jurisdiction at <code className="text-amber-300">[DISPUTE_JURISDICTION_COURT — Dehradun, Uttarakhand, India]</code>.
          </p>
        </section>
      </div>
    </div>
  );
};
