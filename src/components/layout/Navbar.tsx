import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LOCATIONS } from '../../data/locations';
import type { VerifiedKycData } from '../../lib/firebase';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenAuth: () => void;
  onOpenPriceList: () => void;
  onOpenDigiLocker?: () => void;
  onSignOut?: () => void;
  user: {
    name: string;
    phone: string;
    email?: string;
    photoURL?: string;
    kyc?: VerifiedKycData | null;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  selectedCity,
  onSelectCity,
  onOpenAuth,
  onOpenPriceList,
  onOpenDigiLocker,
  onSignOut,
  user
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const isKycVerified = user?.kyc?.status === 'verified';

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div
        className="hidden md:block text-xs py-1.5 px-4"
        style={{ backgroundColor: '#0A0A0A', borderBottom: '1px solid #2A2A2A' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-5">
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

      {/* ── Main Sticky Navbar ── */}
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
                className="absolute top-full mt-2 left-0 w-64 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in"
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
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:border-orange-500/40"
                  style={{
                    backgroundColor: 'rgba(26,26,26,0.85)',
                    border: isKycVerified ? '1px solid rgba(16,185,129,0.3)' : '1px solid #2A2A2A',
                    color: '#F4F5F2'
                  }}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.name.split(' ')[0]}</span>
                  {isKycVerified ? (
                    <span title="DigiLocker Verified">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in space-y-3"
                    style={{ backgroundColor: '#111622', border: '1px solid rgba(255,106,0,0.2)' }}
                  >
                    {/* User Info */}
                    <div className="pb-2.5 border-b border-white/10">
                      <div className="font-bold text-sm text-white">{user.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{user.phone}</div>
                      {user.email && (
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Firebase Auth Active
                        </span>
                      </div>
                    </div>

                    {/* DigiLocker KYC Status Section */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">DigiLocker KYC:</span>
                        {isKycVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      {isKycVerified && user.kyc?.dlNumber && (
                        <div className="text-[11px] font-mono text-slate-400">
                          DL: <span className="text-white font-bold">{user.kyc.dlNumber}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenDigiLocker) onOpenDigiLocker();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        style={{
                          backgroundColor: isKycVerified ? 'rgba(16,185,129,0.1)' : 'rgba(0,116,228,0.2)',
                          color: isKycVerified ? '#34D399' : '#38BDF8',
                          border: isKycVerified
                            ? '1px solid rgba(16,185,129,0.25)'
                            : '1px solid rgba(0,116,228,0.35)'
                        }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isKycVerified ? 'View DigiLocker Pass' : 'Verify with DigiLocker'}</span>
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
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
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(26,26,26,0.7)',
                  border: isKycVerified ? '1px solid rgba(16,185,129,0.4)' : '1px solid #2A2A2A',
                  color: '#9BA1A5'
                }}
              >
                <User className="w-4 h-4" style={{ color: '#FF6A00' }} />
                <span className="max-w-[60px] truncate">{user.name.split(' ')[0]}</span>
                {isKycVerified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
              </button>
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
            className="xl:hidden px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200"
            style={{
              borderTop: '1px solid rgba(255,106,0,0.1)',
              backgroundColor: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* User Profile in Mobile Drawer */}
            {user && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{user.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{user.phone}</div>
                  </div>
                  {isKycVerified ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      DigiLocker Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      KYC Pending
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenDigiLocker) onOpenDigiLocker();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isKycVerified ? 'View DigiLocker' : 'Verify DigiLocker'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

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
                  <span>Sign In with Firebase</span>
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
