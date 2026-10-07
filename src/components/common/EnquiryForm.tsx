import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Phone, Calendar, MapPin, Bike, HelpCircle } from 'lucide-react';
import { useToast } from './Toast';

interface EnquiryFormProps {
  initialCategory?: string;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  initialCategory = 'bike',
  onNavigateToTerms,
  onNavigateToPrivacy
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [pickupHub, setPickupHub] = useState('Bhauwala Main Hub (HQ)');
  const [travelDate, setTravelDate] = useState('');
  const [message, setMessage] = useState('');

  // Honeypot field for bot detection (must remain empty)
  const [honeypot, setHoneypot] = useState('');

  // Explicit separate consents
  const [termsConsent, setTermsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Bot honeypot verification
    if (honeypot.trim().length > 0) {
      // Silently pretend success to mislead spam bots
      setSuccessData({ id: `ENQ-${Math.floor(100000 + Math.random() * 900000)}`, name });
      return;
    }

    // 2. Client validations
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit Indian mobile number.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please provide a valid email address format.');
      return;
    }

    if (!termsConsent) {
      setErrorMessage('Please review and acknowledge the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: email.trim() || undefined,
          category,
          pickupHub,
          travelDate: travelDate || undefined,
          message: message.trim() || undefined,
          termsAccepted: true,
          marketingConsent,
          _hp: honeypot // backend honeypot verification
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to submit enquiry right now. Please try calling directly.');
      }

      setSuccessData({
        id: data.enquiryId || `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
        name: cleanName
      });
      showToast('Enquiry received! Our Dehradun hub coordinator will reach out shortly.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting enquiry';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-5 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Enquiry ID: {successData.id}
          </span>
          <h3 className="text-2xl font-black text-white mt-3 font-heading">
            Enquiry Request Submitted!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Thank you, <strong>{successData.name}</strong>. This is a non-binding rental enquiry. Our Dehradun team will check vehicle readiness and contact you via call or WhatsApp with pricing and next steps.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-400 max-w-md mx-auto space-y-1">
          <p><strong>Need an immediate answer?</strong></p>
          <p>You can also reach our Bhauwala hub desk at <a href="tel:01354164070" className="text-orange-400 font-bold underline">0135 416 4070</a> or <a href="tel:8507067716" className="text-orange-400 font-bold underline">+91 8507067716</a>.</p>
        </div>

        <button
          onClick={() => {
            setSuccessData(null);
            setName('');
            setPhone('');
            setEmail('');
            setMessage('');
            setTermsConsent(false);
            setMarketingConsent(false);
          }}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-md">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Send className="w-3.5 h-3.5" />
          <span>Non-Binding Rental Enquiry</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
          Send a Rental Enquiry or Custom Request
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Plan custom itineraries, check fleet availability for groups, or ask about hill permits. No advance payment required for enquiry.
        </p>
      </div>

      {/* Accessible Error Announcement */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Anti-spam Honeypot (Visually and Assistively Hidden) */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="bbr_website_field">Leave this empty</label>
          <input
            id="bbr_website_field"
            type="text"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label htmlFor="enquiry-name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-orange-400" aria-hidden="true">*</span>
            </label>
            <input
              id="enquiry-name"
              type="text"
              required
              placeholder="e.g. Aman Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm transition-colors"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="enquiry-phone" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              10-Digit Mobile <span className="text-orange-400" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                +91
              </span>
              <input
                id="enquiry-phone"
                type="tel"
                required
                maxLength={10}
                placeholder="8507067716"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm font-mono transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email (Optional) */}
          <div>
            <label htmlFor="enquiry-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-slate-500 text-[10px] lowercase">(optional)</span>
            </label>
            <input
              id="enquiry-email"
              type="email"
              placeholder="aman@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm transition-colors"
            />
          </div>

          {/* Vehicle Category */}
          <div>
            <label htmlFor="enquiry-category" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Interested Vehicle Category
            </label>
            <select
              id="enquiry-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm transition-colors"
            >
              <option value="bike">Motorcycle / Cruiser (Royal Enfield, TVS)</option>
              <option value="scooter">Scooter / Scooty (Activa 125, Ntorq, Jupiter)</option>
              <option value="car">Self-Drive Car / Thar 4x4</option>
              <option value="cab">Rental Cab & Outstation Taxi</option>
              <option value="group">Group / Film Shoot / Corporate Bulk Rental</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Pickup Hub */}
          <div>
            <label htmlFor="enquiry-hub" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Preferred Pickup Hub
            </label>
            <select
              id="enquiry-hub"
              value={pickupHub}
              onChange={(e) => setPickupHub(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm transition-colors"
            >
              <option value="Bhauwala Main Hub (HQ)">Bhauwala Headquarters (Main Hub)</option>
              <option value="ISBT Dehradun Delivery">ISBT Dehradun (Doorstep Delivery)</option>
              <option value="Dehradun Railway Station">Dehradun Railway Station Hub</option>
              <option value="Jolly Grant Airport (DED)">Jolly Grant Airport (DED Terminal)</option>
              <option value="Rajpur Road / Mussoorie Diversion">Rajpur Road / Mussoorie Diversion</option>
            </select>
          </div>

          {/* Travel Date */}
          <div>
            <label htmlFor="enquiry-date" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Approximate Travel Date <span className="text-slate-500 text-[10px] lowercase">(optional)</span>
            </label>
            <input
              id="enquiry-date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="enquiry-message" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Your Questions or Destination Plans <span className="text-slate-500 text-[10px] lowercase">(optional)</span>
          </label>
          <textarea
            id="enquiry-message"
            rows={3}
            placeholder="Tell us if you plan to visit Mussoorie, Dhanaulti, or need extra helmets/luggage racks..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 focus:border-orange-500 focus:outline-none text-white text-xs sm:text-sm transition-colors resize-none"
          />
        </div>

        {/* Mandatory & Optional Consents */}
        <div className="pt-2 space-y-3">
          {/* Mandatory Terms & Privacy Acknowledgement */}
          <div className="flex items-start gap-2.5">
            <input
              id="enquiry-terms-consent"
              type="checkbox"
              required
              checked={termsConsent}
              onChange={(e) => setTermsConsent(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-orange-500 accent-orange-500 cursor-pointer shrink-0"
            />
            <label htmlFor="enquiry-terms-consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
              I agree to the{' '}
              <button
                type="button"
                onClick={onNavigateToTerms}
                className="text-orange-400 hover:text-orange-300 underline font-bold"
              >
                Terms of Service
              </button>{' '}
              and acknowledge the{' '}
              <button
                type="button"
                onClick={onNavigateToPrivacy}
                className="text-orange-400 hover:text-orange-300 underline font-bold"
              >
                Privacy Policy
              </button>{' '}
              regarding communication for this enquiry.{' '}
              <span className="text-orange-400 font-bold" aria-hidden="true">*</span>
            </label>
          </div>

          {/* Separate Optional Marketing Consent */}
          <div className="flex items-start gap-2.5">
            <input
              id="enquiry-marketing-consent"
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-orange-500 accent-orange-500 cursor-pointer shrink-0"
            />
            <label htmlFor="enquiry-marketing-consent" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
              Send me occasional travel discounts and seasonal road trip offers on WhatsApp/SMS.{' '}
              <span className="text-slate-500">(Optional — you can unsubscribe at any time).</span>
            </label>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <span>
            <strong>Zero obligation:</strong> Submitting an enquiry does not charge you anything and does not confirm a booking. We verify vehicle readiness before any reservation is locked.
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 100%)'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Enquiry to Hub...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Rental Enquiry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
