import React, { useState, useEffect, useRef } from 'react';
import { Star, Quote, Sparkles, CheckCircle, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { TESTIMONIALS } from '../../data/faq';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = TESTIMONIALS.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    if (isPlaying && !isHovered) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, currentIndex]);

  const activeReview = TESTIMONIALS[currentIndex];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Rider Experiences</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
          Stories from the <span className="gradient-text-orange">Open Road</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Traveler reflections and community feedback from road trips across Dehradun, Mussoorie, and Uttarakhand.
        </p>
      </div>

      {/* ── Testimonials Carousel Container ── */}
      <div
        className="relative max-w-4xl mx-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Active Featured Slide */}
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all shadow-2xl relative overflow-hidden bg-gradient-to-b from-white/[0.04] to-black/40">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
            <div>
              {/* Rating, Quote Icon & Slide Counter */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5">
                  {[...Array(activeReview.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-amber-300 ml-2">5.0 / 5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-full">
                    {currentIndex + 1} / {total}
                  </span>
                  <Quote className="w-8 h-8 text-orange-500/30" />
                </div>
              </div>

              {/* Review Quote */}
              <blockquote className="text-base sm:text-xl text-slate-100 font-medium italic leading-relaxed mb-8">
                "{activeReview.comment}"
              </blockquote>
            </div>

            {/* Rider Profile Card & Controls */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  aria-hidden="true"
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-white text-sm shadow-lg border border-orange-400/40 shrink-0"
                >
                  {activeReview.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{activeReview.name}</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-bold">Rider Review</span>
                  </h4>
                  <p className="text-xs text-slate-400">{activeReview.city}</p>
                  <p className="text-xs text-orange-400 font-semibold mt-0.5">
                    Rented: <span className="text-white font-bold">{activeReview.vehicleRented}</span>
                  </p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                  title={isPlaying ? 'Pause Auto-Switch' : 'Start Auto-Switch'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-orange-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-orange-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer"
                  title="Previous Review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-orange-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer"
                  title="Next Review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators / Thumbnails Bar */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {TESTIMONIALS.map((review, idx) => (
            <button
              key={review.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/50'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Switch to review by ${review.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

