import React, { useState, useEffect } from 'react';
import {
  Bike,
  Car,
  MapPin,
  Phone,
  User,
  Menu,
  X,
  FileText,
  ChevronDown,
  Sparkles,
  Star,
  Clock
} from 'lucide-react';
import { LOCATIONS } from '../../data/locations';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenAuth: () => void;
  onOpenPriceList: () => void;
  user: { name: string; phone: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  selectedCity,
  onSelectCity,
  onOpenAuth,
  onOpenPriceList,
  user
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'cabs', label: 'Rental Cabs' },
    { id: 'bikes', label: 'Bikes & Cruisers' },
    { id: 'scooters', label: 'Scooters' },
    { id: 'cars', label: 'Cars & Thar' },
    { id: 'locations', label: 'Dehradun Hubs' },
    { id: 'offers', label: 'Offers' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div
        className="hidden md:block text-xs py-1.5 px-4"
        style={{ backgroundColor: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold"
              style={{ color: '#FF6A00', backgroundColor: 'rgba(255,106,0,0.08)' }}
            >
              <Star className="w-3.5 h-3.5" style={{ fill: '#FF6A00', color: '#FF6A00' }} />
              <span>4.8 ★ (17 Google Reviews)</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: '#9BA1A5' }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: '#656C70' }} />
              <span>Bhauwala, Dehradun, Uttarakhand 248007</span>
            </div>
            <div className="flex items-center gap-1 font-semibold" style={{ color: '#FF6A00' }}>
              <Clock className="w-3 h-3" />
              <span>Open · Closes 9 PM</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={onOpenPriceList}
              className="flex items-center gap-1.5 font-semibold transition-colors hover:text-white"
              style={{ color: '#9BA1A5' }}
            >
              <FileText className="w-3.5 h-3.5" /> Official Price Menu
            </button>
            <a
              href="tel:01354164070"
              className="flex items-center gap-1.5 font-semibold transition-colors hover:text-white"
              style={{ color: '#9BA1A5' }}
            >
              <Phone className="w-3.5 h-3.5" /> 0135 416 4070 | 8507067716
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Sticky Navbar — Glassmorphism ── */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'glass-nav py-3' : 'py-4'}`}
        style={!isScrolled ? {
          backgroundColor: 'rgba(10,10,10,0.65)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          borderBottom: '1px solid rgba(255,106,0,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #FF6A00 0%, #CC5500 100%)',
                boxShadow: '0 0 20px rgba(255,106,0,0.25)'
              }}
            >
              <Bike className="w-5 h-5" style={{ color: '#fff' }} />
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #FF6A00' }}
              >
                <Car className="w-2.5 h-2.5" style={{ color: '#FF6A00' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight" style={{ color: '#F4F5F2' }}>BBR</span>
                <span
                  className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'rgba(255,106,0,0.1)',
                    color: '#FF6A00',
                    border: '1px solid rgba(255,106,0,0.2)'
                  }}
                >
                  Dehradun
                </span>
              </div>
              <p
                className="text-[10px] tracking-widest uppercase font-semibold"
                style={{ color: '#656C70' }}
              >
                Bharat Bike and Car Rentals
              </p>
            </div>
          </div>

          {/* City Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ backgroundColor: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A', color: '#9BA1A5', backdropFilter: 'blur(10px)' }}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: '#FF6A00' }} />
              <span className="max-w-[150px] truncate">{selectedCity}</span>
              <ChevronDown className="w-3 h-3" style={{ color: '#656C70' }} />
            </button>

            {cityDropdownOpen && (
              <div
                className="absolute top-full mt-2 left-0 w-64 rounded-2xl shadow-2xl py-2 z-50"
                style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A' }}
              >
                <div
                  className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: '#656C70', borderBottom: '1px solid #2A2A2A' }}
                >
                  Dehradun Hubs & Delivery Points
                </div>
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { onSelectCity(loc.city); setCityDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors"
                    style={{
                      color: selectedCity === loc.city ? '#FF6A00' : '#9BA1A5',
                      backgroundColor: selectedCity === loc.city ? 'rgba(255,106,0,0.06)' : 'transparent',
                      fontWeight: selectedCity === loc.city ? '700' : '400'
                    }}
                  >
                    <span className="truncate">{loc.city}</span>
                    <span className="text-[10px] shrink-0" style={{ color: '#656C70' }}>
                      {loc.vehicleCount}+ fleet
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="px-3 py-1.5 rounded-lg text-xs tracking-wide transition-all"
                style={{
                  color: currentTab === link.id ? '#FF6A00' : '#9BA1A5',
                  backgroundColor: currentTab === link.id ? 'rgba(255,106,0,0.08)' : 'transparent',
                  fontWeight: currentTab === link.id ? '700' : '600'
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons — Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenPriceList}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:border-orange-500/30"
              style={{ backgroundColor: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A', color: '#9BA1A5', backdropFilter: 'blur(10px)' }}
              title="View Complete Tariff Card"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Price Card</span>
            </button>

            {user ? (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ backgroundColor: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
              >
                <User className="w-3.5 h-3.5" style={{ color: '#FF6A00' }} />
                <span>{user.name.split(' ')[0]}</span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:text-white"
                style={{ color: '#9BA1A5' }}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('bikes')}
              className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #FF6A00, #FF8C33)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(255,106,0,0.3)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rent Now</span>
            </button>
          </div>

          {/* ── Mobile Action Buttons — Phone View ── */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Sign In / User — NOW VISIBLE ON MOBILE */}
            {user ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium"
                style={{ backgroundColor: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
              >
                <User className="w-4 h-4" style={{ color: '#FF6A00' }} />
                <span className="max-w-[60px] truncate">{user.name.split(' ')[0]}</span>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-2 rounded-lg transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FF6A00, #CC5500)',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(255,106,0,0.3)'
                }}
                title="Sign In"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenPriceList}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Slide-in Drawer ── */}
        {mobileMenuOpen && (
          <div
            className="xl:hidden px-5 py-6 space-y-4"
            style={{
              borderTop: '1px solid rgba(255,106,0,0.1)',
              backgroundColor: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Rating badge */}
            <div
              className="p-3 rounded-xl flex items-center justify-between text-xs"
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <div className="flex items-center gap-1.5 font-bold" style={{ color: '#FF6A00' }}>
                <Star className="w-4 h-4" style={{ fill: '#FF6A00', color: '#FF6A00' }} />
                <span>4.8 ★ (17 Google Reviews)</span>
              </div>
              <span className="text-[11px] font-bold" style={{ color: '#FF6A00' }}>Open · Closes 9 PM</span>
            </div>

            {/* Location picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: '#656C70' }}>
                Dehradun Pickup Point
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { onSelectCity(loc.city); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center justify-between"
                    style={{
                      backgroundColor: selectedCity === loc.city ? 'rgba(255,106,0,0.08)' : '#1A1A1A',
                      border: `1px solid ${selectedCity === loc.city ? 'rgba(255,106,0,0.3)' : '#2A2A2A'}`,
                      color: selectedCity === loc.city ? '#FF6A00' : '#9BA1A5',
                      fontWeight: selectedCity === loc.city ? '700' : '500'
                    }}
                  >
                    <span>{loc.city}</span>
                    <span className="text-[10px]" style={{ color: '#656C70' }}>{loc.vehicleCount}+ fleet</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="space-y-0.5" style={{ borderTop: '1px solid #2A2A2A', paddingTop: '1rem' }}>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between"
                  style={{
                    backgroundColor: currentTab === link.id ? 'rgba(255,106,0,0.08)' : 'transparent',
                    color: currentTab === link.id ? '#FF6A00' : '#9BA1A5'
                  }}
                >
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            {/* CTA — Sign In + Browse + Call */}
            <div className="space-y-2" style={{ borderTop: '1px solid #2A2A2A', paddingTop: '1rem' }}>
              {/* Sign In CTA in Mobile Drawer */}
              {!user && (
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(255,106,0,0.1)',
                    border: '1px solid rgba(255,106,0,0.25)',
                    color: '#FF6A00'
                  }}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}

              <a
                href="tel:01354164070"
                className="w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
              >
                <Phone className="w-4 h-4" style={{ color: '#FF6A00' }} />
                <span>Call: 0135 416 4070 / 8507067716</span>
              </a>
              <button
                onClick={() => { onNavigate('bikes'); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-full text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FF6A00, #FF8C33)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(255,106,0,0.3)'
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Browse All Vehicles</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
