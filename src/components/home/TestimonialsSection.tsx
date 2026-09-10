import React from 'react';
import { Star, Quote, Sparkles, CheckCircle } from 'lucide-react';
import { TESTIMONIALS } from '../../data/faq';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Rider Experiences</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
          Stories from the <span className="gradient-text-orange">Open Road</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Over 5,000+ satisfied travelers explore India every month on BBR bikes, scooters & cars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TESTIMONIALS.map((review) => (
          <div
            key={review.id}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-orange-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Rating & Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-slate-700" />
              </div>

              {/* Comment */}
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed mb-6">
                "{review.comment}"
              </p>
            </div>

            {/* Rider Info */}
            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
              <img
                src={review.avatar}
                alt={review.name}
                className="w-10 h-10 rounded-full object-cover border border-orange-500/40"
              />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{review.name}</span>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </h4>
                <p className="text-[10px] text-slate-400">{review.city}</p>
                <p className="text-[10px] text-orange-400 font-semibold truncate max-w-[150px]">
                  Rented {review.vehicleRented}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
