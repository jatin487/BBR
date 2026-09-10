import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Bike,
  Car,
  Search,
  ChevronRight,
  Shield,
  Sparkles,
  SunMedium,
  Moon
} from 'lucide-react';
import { LOCATIONS } from '../../data/locations';
import { RateType, VehicleCategory } from '../../types';

interface SearchWidgetProps {
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
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  onSearch,
  selectedCity: initialCity
}) => {
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState<'all' | VehicleCategory>('all');
  const [rateType, setRateType] = useState<RateType>('fullday');

  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(today);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState(tomorrowDate);
  const [returnTime, setReturnTime] = useState('09:00');

  const currentHub = LOCATIONS.find((l) => l.city.toLowerCase() === city.toLowerCase()) || LOCATIONS[0];
  const [pickupLocation, setPickupLocation] = useState(
    currentHub.branches[0]?.name || 'Central Delivery Hub'
  );
  const [cabDestination, setCabDestination] = useState('Mussoorie & Kempty Falls');

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const hub = LOCATIONS.find((l) => l.city.toLowerCase() === newCity.toLowerCase()) || LOCATIONS[0];
    setPickupLocation(hub.branches[0]?.name || 'Central Delivery Hub');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, pickupLocation, pickupDate, pickupTime, returnDate, returnTime, category, rateType });
  };

  const catDefs: { val: 'all' | VehicleCategory; label: string; icon: React.ReactNode }[] = [
    { val: 'all',     label: 'All Fleet',       icon: <Sparkles className="w-3.5 h-3.5" /> },
    { val: 'bike',    label: 'Bikes',            icon: <Bike className="w-3.5 h-3.5" /> },
    { val: 'scooter', label: 'Scooters',         icon: <Bike className="w-3.5 h-3.5" /> },
    { val: 'car',     label: 'Self-Drive Cars',  icon: <Car className="w-3.5 h-3.5" /> },
    { val: 'cab',     label: 'Cabs & Taxis',     icon: <Car className="w-3.5 h-3.5" /> },
  ];

  const inputBox = "p-3.5 rounded-2xl transition-all";
  const inputStyle = { backgroundColor: '#111111', border: '1px solid #2A2A2A' };
  const labelStyle = { color: '#656C70' };
  const valueStyle = { color: '#F4F5F2' };
  const accentStyle = { color: '#FF6A00' };

  return (
    <div
      className="w-full max-w-5xl mx-auto rounded-3xl p-4 sm:p-6 relative z-20 backdrop-blur-2xl overflow-hidden"
      style={{ background: 'rgba(17,17,17,0.88)', border: '1px solid rgba(255,106,0,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
    >
      {/* Top lime rim glow */}
      <div
        className="absolute top-0 inset-x-12 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,106,0,0.4), transparent)' }}
      />

      {/* ── Category Tabs & Tariff Mode ── */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 pb-4" style={{ borderBottom: '1px solid #2A2A2A' }}>
        {/* Category Pills */}
        <div
          className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 rounded-2xl w-full xl:w-auto overflow-x-auto no-scrollbar"
          style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}
        >
          {catDefs.map(({ val, label, icon }) => {
            const isActive = category === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setCategory(val)}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                style={isActive ? { background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff' } : { color: '#656C70' }}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Rate Plan Tabs */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-2xl w-full sm:w-auto"
          style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}
        >
          {category === 'cab' ? (
            <>
              {([
                { val: 'fullday' as RateType, label: 'Outstation / Tour' },
                { val: 'hourly'  as RateType, label: 'Airport Transfer' },
                { val: 'night'   as RateType, label: 'Local (8h/80km)' }
              ] as { val: RateType; label: string }[]).map(({ val, label }) => (
                <button key={val} type="button" onClick={() => setRateType(val)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={rateType === val
                    ? { backgroundColor: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.4)', color: '#FF6A00', fontWeight: 700 }
                    : { color: '#656C70' }}
                >
                  {label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button type="button" onClick={() => setRateType('fullday')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                style={rateType === 'fullday'
                  ? { backgroundColor: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.4)', color: '#FF6A00', fontWeight: 700 }
                  : { color: '#656C70' }}
              >
                <SunMedium className="w-3.5 h-3.5" /> Full Day (24h)
              </button>
              <button type="button" onClick={() => setRateType('hourly')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                style={rateType === 'hourly'
                  ? { backgroundColor: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.4)', color: '#FF6A00', fontWeight: 700 }
                  : { color: '#656C70' }}
              >
                <Clock className="w-3.5 h-3.5" /> Hourly
              </button>
              <button type="button" onClick={() => setRateType('night')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                style={rateType === 'night'
                  ? { backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)', color: '#a78bfa', fontWeight: 700 }
                  : { color: '#656C70' }}
              >
                <Moon className="w-3.5 h-3.5" /> Night (12h)
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main Search Inputs ── */}
      <form onSubmit={handleSearchSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* City & Hub */}
        <div className={inputBox} style={inputStyle}>
          <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1" style={labelStyle}>
            <MapPin className="w-3.5 h-3.5" style={accentStyle} />
            <span>Pickup City / Hub</span>
          </label>
          <select value={city} onChange={(e) => handleCityChange(e.target.value)}
            className="w-full bg-transparent font-bold text-sm focus:outline-none cursor-pointer"
            style={valueStyle}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.city} style={{ backgroundColor: '#111111', color: '#F4F5F2' }}>
                {loc.city} ({loc.state})
              </option>
            ))}
          </select>
          <div className="text-[11px] mt-1 truncate font-medium" style={labelStyle}>{currentHub.landmark}</div>
        </div>

        {/* Pickup Date & Time */}
        <div className={inputBox} style={inputStyle}>
          <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1" style={labelStyle}>
            <Calendar className="w-3.5 h-3.5" style={accentStyle} />
            <span>Pickup Schedule</span>
          </label>
          <div className="flex items-center gap-2">
            <input type="date" value={pickupDate} min={today} onChange={(e) => setPickupDate(e.target.value)}
              className="bg-transparent font-bold text-xs focus:outline-none w-full cursor-pointer font-mono"
              style={valueStyle}
            />
            <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
              className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer font-mono"
              style={accentStyle}
            />
          </div>
          <div className="text-[11px] mt-1 flex items-center gap-1 font-semibold" style={{ color: '#34d399' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#34d399' }} />
            {category === 'cab' ? 'Chauffeur arrival at doorstep' : 'Free pickup at hub'}
          </div>
        </div>

        {/* Third Input: Drop Destination (cab) or Return Date */}
        {category === 'cab' ? (
          <div className={inputBox} style={inputStyle}>
            <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1" style={labelStyle}>
              <MapPin className="w-3.5 h-3.5" style={accentStyle} />
              <span>Drop Destination / Tour</span>
            </label>
            <select value={cabDestination} onChange={(e) => setCabDestination(e.target.value)}
              className="w-full bg-transparent font-bold text-xs focus:outline-none cursor-pointer"
              style={valueStyle}
            >
              {[
                'Mussoorie & Kempty Falls',
                'Dehradun Airport (Jolly Grant)',
                'Rishikesh & Haridwar Ganga Aarti',
                'Dhanaulti & Kanatal',
                'Char Dham Yatra Package',
                'Delhi NCR Expressway',
                'Local Dehradun City (8h/80km)',
              ].map((opt) => (
                <option key={opt} value={opt} style={{ backgroundColor: '#111111', color: '#F4F5F2' }}>{opt}</option>
              ))}
            </select>
            <div className="text-[11px] mt-1 font-semibold" style={{ color: '#34d399' }}>Fixed rate • Zero surge pricing</div>
          </div>
        ) : (
          <div className={inputBox} style={inputStyle}>
            <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1" style={labelStyle}>
              <Calendar className="w-3.5 h-3.5" style={accentStyle} />
              <span>Return Schedule</span>
            </label>
            <div className="flex items-center gap-2">
              <input type="date" value={returnDate} min={pickupDate} onChange={(e) => setReturnDate(e.target.value)}
                className="bg-transparent font-bold text-xs focus:outline-none w-full cursor-pointer font-mono"
                style={valueStyle}
              />
              <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)}
                className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer font-mono"
                style={accentStyle}
              />
            </div>
            <div className="text-[11px] mt-1 font-medium" style={labelStyle}>Flexible return timings</div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full h-full min-h-[56px] rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff', boxShadow: '0 8px 32px rgba(255,106,0,0.3)' }}
          >
            <Search className="w-5 h-5" />
            <span>{category === 'cab' ? 'Search Cabs & Taxis' : 'Search Rides'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Trust Strip */}
      <div className="mt-3.5 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid #2A2A2A', color: '#656C70' }}>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
          <span>{category === 'cab' ? 'Verified Hill-Certified Chauffeurs' : 'Zero Security Deposit on Select Plans'}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium" style={{ color: '#FF6A00' }}>
          <span>{category === 'cab' ? '⚡ 24/7 Airport Emergency Dispatch' : '⚡ Instant Paperless KYC (Under 2 Mins)'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{category === 'cab' ? '🧳 Luggage & Mountain Toll Handled' : '⛑️ Free Sanitized Helmet Included'}</span>
        </div>
      </div>
    </div>
  );
};
