import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronRight, Gauge, Zap, Compass, Layers,
  ShieldCheck, RotateCw, ZoomIn, ZoomOut
} from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { Vehicle, RateType } from '../../types';

interface GT650SectionProps {
  onBookNow: (vehicle: Vehicle, rateType: RateType) => void;
}

const colorVariants = [
  {
    id: 'chrome',
    name: 'Mr Clean Chrome',
    tag: 'Mirror Polished Silver',
    hex: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #94a3b8 100%)',
    borderColor: '#94a3b8',
    accentColor: '#64748b',
    image: '/gt650-chrome.jpg',
    glow: 'rgba(148, 163, 184, 0.3)'
  },
  {
    id: 'black',
    name: 'Apex Black Magic',
    tag: 'Matte Black + Gold',
    hex: '#16181f',
    borderColor: '#6b7280',
    accentColor: '#f59e0b',
    image: '/gt650-black.jpg',
    glow: 'rgba(245, 158, 11, 0.2)'
  },
  {
    id: 'red',
    name: 'Rocker Racing Red',
    tag: 'Gloss Red + White',
    hex: '#dc2626',
    borderColor: '#ef4444',
    accentColor: '#fca5a5',
    image: '/gt650-red.jpg',
    glow: 'rgba(220, 38, 38, 0.3)'
  }
] as const;

const specs = [
  { label: 'Displacement', value: '648 CC', sub: 'Parallel Twin', icon: <Gauge className="w-3.5 h-3.5 text-orange-400" /> },
  { label: 'Max Power', value: '47 BHP', sub: '@ 7250 rpm', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
  { label: 'Peak Torque', value: '52 Nm', sub: '@ 5250 rpm', icon: <Compass className="w-3.5 h-3.5 text-emerald-400" /> },
  { label: 'Gearbox', value: '6 SPEED', sub: 'Slipper Clutch', icon: <Layers className="w-3.5 h-3.5 text-cyan-400" /> }
];

export const GT650Section: React.FC<GT650SectionProps> = ({ onBookNow }) => {
  const [selectedVariant, setSelectedVariant] = useState<typeof colorVariants[number]>(colorVariants[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const gt650Vehicle = VEHICLES.find((v) => v.id === 'gt-continental-650') || VEHICLES[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  // Subtle parallax tilt
  const tiltX = isHovering ? (mousePos.y - 0.5) * -6 : 0;
  const tiltY = isHovering ? (mousePos.x - 0.5) * 8 : 0;

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Ambient glow matching selected color */}
      <motion.div
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[160px] pointer-events-none -z-10"
        style={{ backgroundColor: selectedVariant.glow }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden"
        style={{ borderColor: `${selectedVariant.borderColor}40` }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col space-y-6 z-10"
          >
            {/* Brand Badge */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ROYAL ENFIELD</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight leading-none">
                CONTINENTAL
                <br />
                <span className="gradient-text-orange">GT 650</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-medium mt-4 leading-relaxed">
                Built for the open road.
              </p>
            </div>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/8 flex items-center justify-between max-w-xs shadow-xl">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Daily Rental</span>
                <span className="text-3xl font-black text-white font-heading">
                  ₹999 <span className="text-sm text-orange-400 font-medium">/ DAY</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Instant Pickup
              </span>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {specs.map((spec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 hover:border-orange-500/25 transition-colors flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                    {spec.icon}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">{spec.label}</span>
                    <span className="text-xs font-black text-slate-100 font-mono">{spec.value}</span>
                    <span className="text-[10px] text-slate-500 block">{spec.sub}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Color Selector */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2 block">
                Select Colorway
              </span>
              <div className="flex flex-wrap gap-3">
                {colorVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    title={v.name}
                    className={`relative group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                      selectedVariant.id === v.id
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/15 scale-105'
                        : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    {/* Color Swatch */}
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                      style={{ background: v.hex }}
                    />
                    <span className="text-xs font-bold text-slate-200">{v.tag}</span>
                    {selectedVariant.id === v.id && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Rent Now Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBookNow(gt650Vehicle, 'fullday');
              }}
              className="w-full sm:w-auto min-w-[220px] min-h-[48px] px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 touch-manipulation select-none cursor-pointer"
            >
              RENT NOW <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* ═══════════ RIGHT COLUMN: PHOTO SHOWCASE ═══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-7 relative"
          >
            {/* Main Photo Stage */}
            <div
              ref={imgRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative w-full rounded-3xl overflow-hidden bg-[#0a0c12] border shadow-2xl"
              style={{ borderColor: `${selectedVariant.borderColor}35` }}
            >
              {/* Photo */}
              <motion.div
                animate={{
                  rotateX: tiltX,
                  rotateY: tiltY,
                  scale: isZoomed ? 1.35 : 1
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
                className="relative aspect-[16/9]"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedVariant.id}
                    src={selectedVariant.image}
                    alt={`Royal Enfield Continental GT 650 — ${selectedVariant.name}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Subtle studio reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c12]/40 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* Top Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                {/* Active Edition Badge */}
                <motion.div
                  key={selectedVariant.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: selectedVariant.hex === '#16181f' ? '#f59e0b' : selectedVariant.hex }}
                  />
                  {selectedVariant.name} Edition
                </motion.div>

                {/* Zoom Control */}
                <button
                  onClick={() => setIsZoomed((z) => !z)}
                  className="px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 pointer-events-auto hover:border-orange-500/50 transition-colors"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  {isZoomed ? 'ZOOM OUT' : 'ZOOM IN'}
                </button>
              </div>

              {/* Bottom Glow Bar */}
              <motion.div
                key={selectedVariant.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                style={{
                  background: `linear-gradient(90deg, transparent, ${selectedVariant.borderColor}, transparent)`
                }}
              />
            </div>

            {/* Hover hint */}
            <p className="text-center text-[11px] text-slate-500 font-medium mt-3 tracking-wide">
              Hover to tilt · Click Zoom for detail · Select colorway above
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
