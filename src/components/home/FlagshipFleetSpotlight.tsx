import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Gauge,
  Fuel,
  ShieldCheck,
  ChevronRight,
  Volume2,
  VolumeX,
  Star,
  CheckCircle2,
  ArrowUpRight,
  PhoneCall,
  Clock,
  Layers
} from 'lucide-react';
import { Vehicle, RateType } from '../../types';
import { VEHICLES } from '../../data/vehicles';

interface FlagshipFleetSpotlightProps {
  onBookNow: (vehicle: Vehicle, rateType: RateType) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

// Available Flagship Highlights
const FLAGSHIP_VEHICLE_IDS = [
  'gt-continental-650',
  'thar-4x4',
  're-classic-350',
  'tvs-ronin-225',
  're-hunter-350',
  'activa-125'
];

interface ColorwayOption {
  name: string;
  colorHex: string;
  image: string;
}

const GT650_COLORWAYS: ColorwayOption[] = [
  { name: 'Mr Clean Chrome', colorHex: '#e2e8f0', image: '/gt650-chrome.jpg' },
  { name: 'Rocker Red', colorHex: '#ef4444', image: '/gt650-red.jpg' },
  { name: 'Apex British Black', colorHex: '#1e293b', image: '/gt650-black.jpg' }
];

export const FlagshipFleetSpotlight: React.FC<FlagshipFleetSpotlightProps> = ({
  onBookNow,
  onSelectVehicle
}) => {
  const [selectedId, setSelectedId] = useState<string>('gt-continental-650');
  const [selectedColorway, setSelectedColorway] = useState<ColorwayOption>(GT650_COLORWAYS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  // Find active vehicle data
  const currentVehicle =
    VEHICLES.find((v) => v.id === selectedId) || VEHICLES[0];

  // For GT650, support live colorway image swap
  const displayImage =
    currentVehicle.id === 'gt-continental-650'
      ? selectedColorway.image
      : currentVehicle.image;

  // Realistic engine sound generator using Web Audio API (Zero external mp3 needed)
  const toggleEngineAudio = () => {
    if (isPlayingAudio) {
      // Stop sound
      oscNodesRef.current.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // ignore if already stopped
        }
      });
      oscNodesRef.current = [];
      setIsPlayingAudio(false);
    } else {
      // Start realistic low twin-cylinder exhaust pulse
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const baseFreq = currentVehicle.engineCC > 500 ? 55 : currentVehicle.engineCC > 200 ? 80 : 110;

        // Fundamental cylinder firing oscillator
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        // Sub harmonic pulse for exhaust rumble
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq / 2, ctx.currentTime);

        // Periodic LFO for rhythmic idle throbbing
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(4.2, ctx.currentTime); // 4.2 Hz idle pulse

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(8, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        // Low-pass filter to give deep acoustic muffler thud
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.22, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        lfo.start();

        oscNodesRef.current = [osc1, osc2, lfo];
        setIsPlayingAudio(true);

        // Auto-stop after 8 seconds to prevent annoyance
        setTimeout(() => {
          if (oscNodesRef.current.length > 0) {
            oscNodesRef.current.forEach((node) => {
              try {
                node.stop();
              } catch {
                // ignore
              }
            });
            oscNodesRef.current = [];
            setIsPlayingAudio(false);
          }
        }, 8000);
      } catch (err) {
        console.warn('Audio context init error:', err);
      }
    }
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-full h-[500px] bg-gradient-to-tr from-orange-600/10 via-amber-500/10 to-transparent rounded-full blur-[140px] pointer-events-none overflow-hidden" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-lg shadow-orange-500/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flagship Fleet Spotlight</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white">
          Certified <span className="gradient-text-orange">Premium Fleet</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-3 font-normal">
          Explore our top-rated flagship motorcycles, iconic mountain 4x4s, and premium cruisers with transparent pricing and instant doorstep handover.
        </p>

        {/* Flagship Vehicle Switcher Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {FLAGSHIP_VEHICLE_IDS.map((id) => {
            const v = VEHICLES.find((item) => item.id === id);
            if (!v) return null;
            const isSelected = v.id === selectedId;

            return (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedId(v.id);
                  if (isPlayingAudio) toggleEngineAudio();
                }}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-xl shadow-orange-500/25 scale-105'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/30 hover:text-white backdrop-blur-md'
                }`}
              >
                <span>{v.name.replace('Royal Enfield ', 'RE ').replace('Mahindra ', '')}</span>
                {v.category === 'car' && (
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">4x4</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Spotlight Showcase Stage */}
      <div className="relative rounded-3xl bg-slate-950/70 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Subtle Background Radial Stage Highlight */}
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center relative z-10">
          
          {/* LEFT 7 COLS: Cinematic Vehicle Stage & Colorways */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Stage Tagline & Category Pill */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {currentVehicle.brand}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                  {currentVehicle.transmission}
                </span>
              </div>

              {/* Sound Synthesizer Button */}
              <button
                type="button"
                onClick={toggleEngineAudio}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isPlayingAudio
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-orange-500/40 hover:text-orange-400'
                }`}
                title="Hear realistic twin-cylinder idle exhaust thump"
              >
                {isPlayingAudio ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Stop Sound</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Hear Exhaust Sound</span>
                  </>
                )}
              </button>
            </div>

            {/* Showcase Image with Smooth Transition */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900/50 to-slate-950 flex items-center justify-center p-2 sm:p-4 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayImage}
                  src={displayImage}
                  alt={currentVehicle.name}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover object-center rounded-xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to hero bike if path has an issue
                    (e.target as HTMLImageElement).src = '/hero-bike.jpg';
                  }}
                />
              </AnimatePresence>

              {/* Studio Turntable Platform Line */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
            </div>

            {/* Optional Colorway Selector for GT 650 */}
            {currentVehicle.id === 'gt-continental-650' && (
              <div className="mt-5 flex items-center gap-3 bg-slate-900/90 border border-white/10 px-4 py-2 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400">Colorway:</span>
                {GT650_COLORWAYS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColorway(c)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                      selectedColorway.name === c.name
                        ? 'bg-white/10 border-orange-400 text-white shadow-sm'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/40 shadow-inner"
                      style={{ backgroundColor: c.colorHex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: High-Converting Details & Action HUD */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Review and Verification */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentVehicle.rating}</span>
                  <span className="text-slate-400 font-normal">({currentVehicle.reviewCount} verified trips)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Immediate Handover</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
                {currentVehicle.name}
              </h3>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {currentVehicle.tagline}
              </p>
            </div>

            {/* Spec Telemetry Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold mb-1">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Displacement</span>
                </div>
                <p className="text-base font-black text-white font-mono">{currentVehicle.engineCC} cc</p>
                <p className="text-[10px] text-slate-400">{currentVehicle.power || 'High Output'}</p>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
                  <Fuel className="w-3.5 h-3.5" />
                  <span>Mileage</span>
                </div>
                <p className="text-base font-black text-white font-mono">{currentVehicle.mileage}</p>
                <p className="text-[10px] text-slate-400">Fuel: {currentVehicle.fuelType}</p>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </div>
                <p className="text-base font-black text-white font-mono">₹{currentVehicle.securityDeposit}</p>
                <p className="text-[10px] text-slate-400">100% Refundable</p>
              </div>
            </div>

            {/* Included Perks */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Package Inclusions:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{currentVehicle.helmetIncluded > 0 ? `${currentVehicle.helmetIncluded} ISI Helmets Included` : 'Commercial Permit'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Dep Insurance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>24/7 Roadside Assist</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sanitized & Serviced</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown & Booking Buttons */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Daily Rental Rate:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">₹{currentVehicle.fullDayRent}</span>
                  <span className="text-xs text-slate-400 font-medium">/ 24 hrs</span>
                </div>
                {currentVehicle.nightRent && (
                  <span className="text-[11px] text-amber-400 font-mono">Night (12h): ₹{currentVehicle.nightRent}</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 relative z-20">
                {onSelectVehicle && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(currentVehicle);
                    }}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 cursor-pointer active:scale-95 touch-manipulation"
                  >
                    View Specs
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookNow(currentVehicle, 'fullday');
                  }}
                  className="flex-1 sm:flex-initial min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 group cursor-pointer active:scale-95 touch-manipulation select-none"
                >
                  <span>Instant Reserve</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
