import React, { useState } from 'react';
import {
  X,
  Star,
  Shield,
  Clock,
  SunMedium,
  Moon,
  CheckCircle,
  Phone,
  Fuel,
  Gauge,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Vehicle, RateType } from '../../types';

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onBook: (vehicle: Vehicle, rateType: RateType, durationUnits: number) => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  vehicle,
  onClose,
  onBook
}) => {
  if (!vehicle) return null;

  const [selectedRate, setSelectedRate] = useState<RateType>('fullday');
  const [durationUnits, setDurationUnits] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Price Calculation
  const getBaseRate = () => {
    if (selectedRate === 'hourly') return vehicle.hourlyRent || vehicle.fullDayRent;
    if (selectedRate === 'night') return vehicle.nightRent;
    return vehicle.fullDayRent;
  };

  const unitLabel = selectedRate === 'hourly' ? 'Hours' : selectedRate === 'night' ? 'Nights (12h)' : 'Days (24h)';
  const baseRate = getBaseRate();
  const subtotal = baseRate * durationUnits;
  const gst = Math.round(subtotal * 0.18);
  const deposit = vehicle.securityDeposit;
  const totalPayable = subtotal + gst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0B0F1A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {vehicle.category.toUpperCase()} • {vehicle.brand}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{vehicle.rating}</span>
              <span className="text-slate-400 font-normal">({vehicle.reviewCount} reviews)</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* Main Hero & Gallery + Right Tariff Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Gallery & Vehicle Showcase (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                <img
                  src={vehicle.gallery[activeImageIndex] || vehicle.image}
                  alt={vehicle.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-bike.jpg';
                  }}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                    {vehicle.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {vehicle.tagline}
                  </p>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {vehicle.gallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2">
                  {vehicle.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-orange-500 scale-105 shadow-md'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/hero-bike.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Included Perks */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included With Every BBR Rental
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{vehicle.helmetIncluded > 0 ? `${vehicle.helmetIncluded} ISI Helmets Included` : 'AC & Fast Charger'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>24/7 Roadside Assistance</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sanitized & Serviced Machine</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero Mileage Limits Options</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Tariff & Duration Calculator (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-3xl bg-slate-900/90 border border-orange-500/20 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Select Rental Plan & Duration
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official BBR transparent rates — no surge pricing
                </p>

                {/* Tariff Options */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSelectedRate('fullday');
                      setDurationUnits(1);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedRate === 'fullday'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold shadow-lg shadow-orange-500/10'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <SunMedium className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                    <div className="text-[11px] uppercase tracking-wider">Full Day</div>
                    <div className="text-sm font-black text-white mt-1">₹{vehicle.fullDayRent}</div>
                    <div className="text-[10px] text-slate-400">24 Hours</div>
                  </button>

                  <button
                    onClick={() => {
                      if (vehicle.hourlyRent) {
                        setSelectedRate('hourly');
                        setDurationUnits(4);
                      }
                    }}
                    disabled={!vehicle.hourlyRent}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      !vehicle.hourlyRent
                        ? 'opacity-40 cursor-not-allowed bg-slate-950 border-white/5'
                        : selectedRate === 'hourly'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold shadow-lg shadow-orange-500/10'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <div className="text-[11px] uppercase tracking-wider">Hourly</div>
                    <div className="text-sm font-black text-white mt-1">
                      {vehicle.hourlyRent ? `₹${vehicle.hourlyRent}` : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400">Per Hour</div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRate('night');
                      setDurationUnits(1);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedRate === 'night'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-lg shadow-purple-500/10'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    <div className="text-[11px] uppercase tracking-wider">Per Night</div>
                    <div className="text-sm font-black text-white mt-1">₹{vehicle.nightRent}</div>
                    <div className="text-[10px] text-slate-400">12 Hours (8pm-8am)</div>
                  </button>
                </div>

                {/* Duration Slider / Counter */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Rental Duration:</span>
                    <span className="text-orange-400 font-black text-sm">
                      {durationUnits} {unitLabel}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max={selectedRate === 'hourly' ? 24 : 14}
                    value={durationUnits}
                    onChange={(e) => setDurationUnits(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 {selectedRate === 'hourly' ? 'Hr' : 'Day'}</span>
                    <span>{selectedRate === 'hourly' ? '24 Hours' : '14 Days'}</span>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Rent ({durationUnits} × ₹{baseRate}):</span>
                    <span className="font-bold text-white">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Govt. GST (18%):</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Refundable Security Deposit:
                    </span>
                    <span className="font-bold">₹{deposit}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-white/10 pt-3 text-sm">
                    <div>
                      <span className="font-bold text-white">Total Payable Now:</span>
                      <p className="text-[10px] text-slate-400">Deposit is 100% refunded at return</p>
                    </div>
                    <span className="text-xl font-black text-orange-400 font-heading">
                      ₹{totalPayable + deposit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => {
                  onBook(vehicle, selectedRate, durationUnits);
                  onClose();
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Proceed to Book {vehicle.name.split(' ')[0]}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white font-heading">
              Technical Specifications & Key Features
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Engine Displacement</span>
                <p className="text-sm font-bold text-white mt-1">{vehicle.engineCC} cc</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Mileage</span>
                <p className="text-sm font-bold text-white mt-1">{vehicle.mileage}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Transmission</span>
                <p className="text-sm font-bold text-white mt-1">{vehicle.transmission}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Fuel Tank</span>
                <p className="text-sm font-bold text-white mt-1">{vehicle.fuelTank}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Power Output</span>
                <p className="text-sm font-bold text-white mt-1">{vehicle.power || 'Dynamic'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Top Speed</span>
                <p className="text-sm font-bold text-white mt-1">{vehicle.topSpeed || '100+ km/h'}</p>
              </div>
            </div>

            {/* Highlights List */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5">
              <span className="text-xs font-bold text-slate-300 block mb-2">Feature Highlights:</span>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-200 border border-white/10"
                  >
                    ✨ {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
