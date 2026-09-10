import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Phone,
  Star,
  FileText,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { SearchWidget } from './SearchWidget';
import { RateType, VehicleCategory } from '../../types';

interface HeroSectionProps {
  onSearch: (params: {
    city: string;
    pickupLocation: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    category: 'all' | VehicleCategory;
    rateType: RateType;
  }) => void;
  selectedCity: string;
  onOpenPriceList: () => void;
  onNavigateToCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  selectedCity,
  onOpenPriceList,
  onNavigateToCatalog
}) => {
  return (
    <section className="relative min-h-[96vh] flex flex-col justify-between pt-6 pb-12 overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
      
      {/* ═══════════════════ DARK ATMOSPHERIC BACKGROUND ═══════════════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Hero bike image — darkened for contrast */}
        <img
          src="/hero-bike.jpg"
          alt="Royal Enfield Classic 350 Chrome Studio Showcase"
          className="w-full h-full object-cover object-center lg:object-[center_36%] transition-all duration-700"
          style={{ filter: 'brightness(0.28) contrast(1.1) saturate(0.8)', opacity: 1 }}
        />

        {/* Top gradient — fade to dark bg */}
        <div
          className="absolute inset-x-0 top-0 h-52"
          style={{ background: 'linear-gradient(to bottom, #0A0A0A 0%, rgba(10,10,10,0.6) 70%, transparent 100%)' }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-72"
          style={{ background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0.85) 60%, transparent 100%)' }}
        />

        {/* Lime glow atmosphere — top centre */}
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,106,0,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />

        {/* Horizon line */}
        <div
          className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-[900px] max-w-[95%] h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,106,0,0.18), transparent)' }}
        />
      </div>

      {/* ═══════════════════ HERO CONTENT ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col items-center justify-between text-center">

        {/* ── TOP ZONE ── */}
        <div className="flex flex-col items-center pt-2 sm:pt-4 max-w-5xl">

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08]"
            style={{ color: '#F4F5F2' }}
          >
            Your Ride.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 50%, #CC5500 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Your Freedom.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed"
            style={{ color: '#9BA1A5' }}
          >
            Welcome to{' '}
            <strong style={{ color: '#F4F5F2', fontWeight: 700 }}>Bharat Bike And Car Rentals</strong>{' '}
            in Bhauwala, Dehradun. Self-drive Royal Enfield Classic 350, GT 650, Activa &amp; Thar 4x4 for Mussoorie &amp; Himalayan road trips.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={onNavigateToCatalog}
              className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FF6A00, #FF8C33)',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(255,106,0,0.35)'
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse All 19 Vehicles</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPriceList}
              className="px-5 py-3 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-md hover:scale-[1.02]"
              style={{
                background: 'rgba(26,26,26,0.75)',
                border: '1px solid #2A2A2A',
                color: '#F4F5F2'
              }}
            >
              <FileText className="w-4 h-4" style={{ color: '#FF6A00' }} />
              <span>Official Price List</span>
            </button>

            <a
              href="tel:01354164070"
              className="px-5 py-3 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-md hover:scale-[1.02]"
              style={{
                background: 'rgba(26,26,26,0.75)',
                border: '1px solid #2A2A2A',
                color: '#F4F5F2'
              }}
            >
              <Phone className="w-4 h-4" style={{ color: '#FF6A00' }} />
              <span>0135 416 4070</span>
            </a>
          </motion.div>
        </div>

        {/* ── MID-STAGE: Glassmorphic floating feature tags ── */}
        <div className="w-full max-w-6xl my-4 sm:my-6 hidden md:flex items-center justify-between pointer-events-none px-4">
          {/* Left Tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl pointer-events-auto"
            style={{
              background: 'rgba(26,26,26,0.7)',
              border: '1px solid rgba(255,106,0,0.18)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.25)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#FF6A00' }} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: '#FF6A00' }}>
                Featured Heritage Fleet
              </span>
              <span className="text-xs font-black tracking-wide" style={{ color: '#F4F5F2' }}>
                Royal Enfield Classic 350 Chrome
              </span>
            </div>
          </motion.div>

          {/* Right Tag */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl pointer-events-auto"
            style={{
              background: 'rgba(21,25,28,0.7)',
              border: '1px solid rgba(52,211,153,0.18)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
            }}
          >
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: '#34d399' }}>
                Instant Pickup &amp; Zero Hidden Fees
              </span>
              <span className="text-xs font-black tracking-wide" style={{ color: '#F4F5F2' }}>
                Tariffs From ₹50/hr · 24/7 Roadside Assist
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: '#34d399' }} />
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM ZONE: Search Console + Trust Strip ── */}
        <div className="w-full mt-auto space-y-4">
          {/* Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full"
          >
            <SearchWidget onSearch={onSearch} selectedCity={selectedCity} />
          </motion.div>

          {/* Trust Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-5xl mx-auto w-full text-center"
          >
            {[
              {
                icon: <Star className="w-4 h-4 shrink-0" style={{ fill: '#FF6A00', color: '#FF6A00' }} />,
                label: '4.8 ★ Google',
                sub: '17 Verified Reviews',
                accent: '#FF6A00'
              },
              {
                icon: <MapPin className="w-4 h-4 shrink-0" style={{ color: '#FF6A00' }} />,
                label: 'Bhauwala Hub',
                sub: 'Dehradun 248007',
                accent: '#FF6A00'
              },
              {
                icon: <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#FF6A00' }} />,
                label: 'From ₹50/hr',
                sub: 'Transparent Tariffs',
                accent: '#FF6A00'
              },
              {
                icon: <Clock className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} />,
                label: 'Open · Closes 9 PM',
                sub: '24/7 Roadside Assist',
                accent: '#34d399'
              }
            ].map(({ icon, label, sub, accent }) => (
              <div
                key={label}
                className="py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 backdrop-blur-md"
                style={{
                  background: 'rgba(26,26,26,0.7)',
                  border: '1px solid #2A2A2A'
                }}
              >
                {icon}
                <div className="text-left">
                  <span className="text-xs font-black block" style={{ color: accent }}>{label}</span>
                  <span className="text-[10px]" style={{ color: '#656C70' }}>{sub}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
