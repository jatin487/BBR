import React from 'react';
import { Bike, CalendarCheck, FileCheck, KeyRound, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Bike className="w-7 h-7 text-orange-400" />,
      title: 'Select Your Ride',
      desc: 'Pick your preferred motorcycle, scooter, or 4x4 car from our verified fleet.'
    },
    {
      num: '02',
      icon: <CalendarCheck className="w-7 h-7 text-amber-400" />,
      title: 'Choose Dates & Tariff',
      desc: 'Select hourly, 12-hour night cruising, or full 24h day plan with pickup hub.'
    },
    {
      num: '03',
      icon: <FileCheck className="w-7 h-7 text-emerald-400" />,
      title: 'Quick Paperless KYC',
      desc: 'Verify driving license & ID proof digitally in under 2 minutes.'
    },
    {
      num: '04',
      icon: <KeyRound className="w-7 h-7 text-cyan-400" />,
      title: 'Grab Keys & Throttle Up',
      desc: 'Collect your sanitized machine with complimentary helmet and hit the road!'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple 4-Step Process</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
          How BBR Rentals <span className="gradient-text-orange">Works</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Zero paperwork queues. Seamless self-drive rentals in four effortless steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="relative glass-card p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all duration-300 group flex flex-col justify-between"
          >
            {/* Step Number Background Accent */}
            <div className="absolute top-4 right-4 text-3xl sm:text-4xl font-black text-white/5 font-mono group-hover:text-orange-500/10 transition-colors select-none">
              {step.num}
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                {step.icon}
              </div>

              <h3 className="text-lg font-bold text-white font-heading group-hover:text-orange-400 transition-colors">
                {step.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {step.desc}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Step {step.num}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
