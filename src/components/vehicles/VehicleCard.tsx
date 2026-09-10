import React, { useState } from 'react';
import {
  Star,
  Gauge,
  Fuel,
  Shield,
  Heart,
  ChevronRight,
  Clock,
  SunMedium,
  Moon,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { Vehicle, RateType } from '../../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
  onBookNow: (vehicle: Vehicle, rateType: RateType) => void;
  initialRateType?: RateType;
  isWishlisted?: boolean;
  onToggleWishlist?: (vehicleId: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onSelect,
  onBookNow,
  initialRateType = 'fullday',
  isWishlisted = false,
  onToggleWishlist
}) => {
  const [rateType, setRateType] = useState<RateType>(initialRateType);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getActivePrice = () => {
    switch (rateType) {
      case 'hourly':
        return vehicle.hourlyRent
          ? { amount: vehicle.hourlyRent, unit: '/ hour' }
          : { amount: vehicle.fullDayRent, unit: '/ day (Hourly N/A)' };
      case 'night':
        return { amount: vehicle.nightRent, unit: '/ night (12h)' };
      case 'fullday':
      default:
        return { amount: vehicle.fullDayRent, unit: '/ day (24h)' };
    }
  };

  const activePrice = getActivePrice();

  return (
    <div className="group relative rounded-2xl glass-card overflow-hidden flex flex-col h-full" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}>
      {/* Top Image Container */}
      <div className="relative h-56 w-full overflow-hidden" style={{ backgroundColor: '#111111' }}>
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          {vehicle.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff' }}>
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          {vehicle.isPopular && !vehicle.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: 'rgba(255,106,0,0.15)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.3)' }}>
              🔥 Popular Choice
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md" style={{ backgroundColor: 'rgba(10,10,10,0.75)', color: '#9BA1A5', border: '1px solid rgba(255,255,255,0.08)' }}>
            {vehicle.brand}
          </span>
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(vehicle.id);
            }}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isWishlisted ? 'text-white' : ''}`}
            style={isWishlisted ? { backgroundColor: '#ef4444', boxShadow: '0 0 16px rgba(239,68,68,0.35)' } : { backgroundColor: 'rgba(10,10,10,0.72)', border: '1px solid rgba(255,255,255,0.08)', color: '#9BA1A5' }}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Vehicle Main Image */}
        <img
          src={vehicle.image}
          alt={vehicle.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/hero-bike.jpg';
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

        {/* Rating Floating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md" style={{ backgroundColor: 'rgba(10,10,10,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#FF6A00' }}>
          <Star className="w-3.5 h-3.5" style={{ fill: '#FF6A00', color: '#FF6A00' }} />
          <span>{vehicle.rating}</span>
          <span className="text-[10px] font-normal" style={{ color: '#9BA1A5' }}>({vehicle.reviewCount})</span>
        </div>

        {/* Available Count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md" style={{ backgroundColor: 'rgba(10,10,10,0.8)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#34d399' }} />
          <span>{vehicle.availableCount} Available</span>
        </div>
      </div>

      {/* Vehicle Info & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Tagline */}
          <h3
            onClick={() => onSelect(vehicle)}
            className="text-lg font-bold transition-colors cursor-pointer line-clamp-1"
            style={{ color: '#F4F5F2' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF6A00')}
            onMouseLeave={e => (e.currentTarget.style.color = '#F4F5F2')}
          >
            {vehicle.name}
          </h3>
          <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#656C70' }}>
            {vehicle.tagline}
          </p>

          {/* Quick Specs Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl text-xs" style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold" style={{ color: '#656C70' }}>Engine</span>
              <span className="font-bold" style={{ color: '#F4F5F2' }}>{vehicle.engineCC} cc</span>
            </div>
            <div className="flex flex-col px-2" style={{ borderLeft: '1px solid #2A2A2A', borderRight: '1px solid #2A2A2A' }}>
              <span className="text-[10px] uppercase font-semibold" style={{ color: '#656C70' }}>Mileage</span>
              <span className="font-bold" style={{ color: '#F4F5F2' }}>{vehicle.mileage}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-semibold" style={{ color: '#656C70' }}>Type</span>
              <span className="font-bold" style={{ color: '#F4F5F2' }}>{vehicle.transmission}</span>
            </div>
          </div>

          {/* Tariff Mode Switcher */}
          <div className="mt-3.5 flex items-center gap-1 p-1 rounded-xl text-[11px]" style={{ backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A' }}>
            <button
              onClick={() => setRateType('fullday')}
              className="flex-1 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
              style={rateType === 'fullday' ? { background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff' } : { color: '#656C70' }}
            >
              <SunMedium className="w-3 h-3" /> Day (24h)
            </button>
            <button
              onClick={() => setRateType('hourly')}
              className="flex-1 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
              style={rateType === 'hourly' ? { background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff' } : { color: '#656C70' }}
            >
              <Clock className="w-3 h-3" /> Hourly
            </button>
            <button
              onClick={() => setRateType('night')}
              className="flex-1 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
              style={rateType === 'night' ? { backgroundColor: '#7c3aed', color: '#fff' } : { color: '#656C70' }}
            >
              <Moon className="w-3 h-3" /> Night (12h)
            </button>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="mt-5 pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid #2A2A2A' }}>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black" style={{ color: '#F4F5F2' }}>₹{activePrice.amount}</span>
                <span className="text-xs font-medium" style={{ color: '#656C70' }}>{activePrice.unit}</span>
              </div>
              <div className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: '#656C70' }}>
                <Shield className="w-3 h-3" style={{ color: '#34d399' }} />
                <span>Security Deposit: ₹{vehicle.securityDeposit}</span>
              </div>
            </div>

            {vehicle.helmetIncluded > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: '#FF6A00', backgroundColor: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.2)' }}>
                ⛑️ {vehicle.helmetIncluded} Helmet Free
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(vehicle)}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
              style={{ backgroundColor: '#222222', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
            >
              <Info className="w-3.5 h-3.5" />
              <span>View Specs</span>
            </button>

            <button
              onClick={() => onBookNow(vehicle, rateType)}
              className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff', boxShadow: '0 4px 12px rgba(255,106,0,0.25)' }}
            >
              <span>Rent Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
