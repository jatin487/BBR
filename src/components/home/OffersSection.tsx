import React from 'react';
import { Tag, Copy, Sparkles, Clock, Check, ArrowRight } from 'lucide-react';
import { OFFERS } from '../../data/offers';
import { useToast } from '../common/Toast';

interface OffersSectionProps {
  onApplyOffer: (code: string) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ onApplyOffer }) => {
  const { showToast } = useToast();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Exclusive Deals & Coupons</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
            Special <span className="gradient-text-gold">Rental Discounts</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-2">
            Unlock additional instant savings on your weekend getaways, long-term tours, and campus commutes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {OFFERS.map((offer) => (
          <div
            key={offer.code}
            className="relative rounded-3xl glass-card p-6 flex flex-col justify-between border border-white/10 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/10"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {offer.badge}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {offer.expiresIn}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-lg font-bold text-white font-heading group-hover:text-amber-300 transition-colors">
                {offer.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {offer.description}
              </p>
            </div>

            {/* Promo Code Box */}
            <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-dashed border-amber-500/30">
                <div className="font-mono font-black text-sm text-amber-400 tracking-wider">
                  {offer.code}
                </div>
                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
                  title="Copy Coupon Code"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>

              <button
                onClick={() => onApplyOffer(offer.code)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
              >
                <span>Book With This Offer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
