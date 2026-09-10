import React from 'react';
import {
  ShieldCheck,
  Zap,
  Clock,
  Headphones,
  Wrench,
  FileCheck2,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Zero / Lowest Security Deposit',
      desc: 'Deposit starts from just ₹500 for commuter rides. 100% refunded to your UPI/bank within 30 minutes of return.',
      tag: 'Fast Refund'
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-orange-400" />,
      title: 'Instant Paperless KYC',
      desc: 'Complete digital verification using DigiLocker or original driving license in less than 2 minutes.',
      tag: '2-Min Process'
    },
    {
      icon: <Wrench className="w-6 h-6 text-amber-400" />,
      title: '25-Point Verified Fleet',
      desc: 'Every bike, scooter, and car is thoroughly serviced, sanitized, and inspected for brake, tyre, and engine safety.',
      tag: '100% Reliable'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-400" />,
      title: 'Flexible Hourly, Night & Day Plans',
      desc: 'Pay only for what you ride! Enjoy hourly rates from ₹50/hr, 12-hour night cruising tariffs, and 24-hour day passes.',
      tag: 'BBR Transparency'
    },
    {
      icon: <Headphones className="w-6 h-6 text-cyan-400" />,
      title: '24/7 Emergency Assistance (RSA)',
      desc: 'Dedicated mechanic team on standby. Free towing or vehicle replacement on roadside breakdown across all hub cities.',
      tag: 'Toll-Free Help'
    },
    {
      icon: <Zap className="w-6 h-6 text-rose-400" />,
      title: 'Complimentary ISI Helmets',
      desc: 'Every two-wheeler rental includes sanitized, ISI-certified safety helmets for you and optional pillion rider.',
      tag: 'Rider Safety'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The BBR Advantage</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
          Why Thousands of Riders <span className="gradient-text-orange">Trust BBR</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          We combine transparent pricing, pristine machinery, and dependable on-ground support for memorable road trips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="glass-card p-6 sm:p-7 rounded-3xl transition-all duration-300 hover:translate-y-[-4px] group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  {feature.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-white/5">
                  {feature.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-heading group-hover:text-orange-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {feature.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs font-bold text-slate-500 group-hover:text-orange-400 transition-colors">
              <span>Standard with every booking</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
