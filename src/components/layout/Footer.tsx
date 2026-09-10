import React from 'react';
import {
  Bike,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  Star,
  Clock,
  Navigation
} from 'lucide-react';
import { InstagramIcon } from '../common/Icons';
import { LOCATIONS } from '../../data/locations';
import GoogleReview from '../common/GoogleReview';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenPriceList: () => void;
  onSelectCity: (city: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenPriceList,
  onSelectCity
}) => {
  return (
    <footer style={{ backgroundColor: '#0A0A0A', borderTop: '1px solid #2A2A2A' }} className="text-[#9BA1A5] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="mb-14 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: 'rgba(26,26,26,0.8)', border: '1px solid rgba(255,106,0,0.18)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', boxShadow: '0 0 24px rgba(255,106,0,0.3)' }}
              >
                <Phone className="w-7 h-7 animate-pulse" style={{ color: '#fff' }} />
              </div>
              <div>

                <h3 className="text-xl sm:text-2xl font-black mt-0.5" style={{ color: '#F4F5F2' }}>
                  Bharat Bike And Car Rentals (Dehradun)
                </h3>
                <p className="text-xs mt-1" style={{ color: '#9BA1A5' }}>
                  📍 Bhauwala, Uttarakhand 248007 | Landline: <strong style={{ color: '#F4F5F2' }}>0135 416 4070</strong> | Mobile: <strong style={{ color: '#F4F5F2' }}>8507067716, 7091431158</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:01354164070"
                className="px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8C33)', color: '#fff', boxShadow: '0 4px 16px rgba(255,106,0,0.25)' }}
              >
                <Phone className="w-4 h-4" />
                <span>Call Us: 0135 416 4070</span>
              </a>
              <button
                onClick={onOpenPriceList}
                className="px-5 py-3.5 rounded-full font-bold text-xs transition-all flex items-center gap-2"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#9BA1A5' }}
              >
              <FileText className="w-4 h-4" />
              <span>Official Tariff Sheet</span>
            </button>
          </div>
        </div>

        {/* 4 Columns Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12" style={{ borderBottom: '1px solid #2A2A2A' }}>
          {/* Col 1: Brand Info (2 cols width on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer group select-none">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #CC5500 100%)', boxShadow: '0 0 16px rgba(255,106,0,0.25)' }}
              >
                <Bike className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight" style={{ color: '#F4F5F2' }}>BBR</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,106,0,0.1)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)' }}>Dehradun</span>
                </div>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                  Bharat Bike And Car Rentals
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dehradun's premier self-drive motorcycle, scooter, and 4x4 car rental agency based in Bhauwala.
              Offering transparent rates, sanitized vehicles, helmet included, and instant paperless KYC for Mussoorie, Dhanaulti & Rishikesh tours.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <a href="https://maps.google.com/?q=Bharat+Bike+And+Car+Rentals+Bhauwala+Dehradun" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 font-semibold transition-colors" style={{ color: '#FF6A00' }}
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions: Bhauwala, Uttarakhand 248007</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 font-semibold transition-colors" style={{ color: '#ec4899' }}
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram: @bharat_bike_and_car_rental</span>
              </a>
              <div className="flex items-center gap-2" style={{ color: '#9BA1A5' }}>
                <Mail className="w-4 h-4" style={{ color: '#FF6A00' }} />
                <span>bharatbikerentaldehradun@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Fleet Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F4F5F2' }}>
              Dehradun Fleet
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('bikes')}
                  className="hover:text-white transition-colors text-left" style={{ color: '#9BA1A5' }}
                >
                  Royal Enfield GT Continental 650
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bikes')}
                  className="hover:text-white transition-colors text-left" style={{ color: '#9BA1A5' }}
                >
                  RE Classic 350 & Hunter 350
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bikes')}
                  className="hover:text-white transition-colors text-left" style={{ color: '#9BA1A5' }}
                >
                  TVS Ronin & Apache 160 4V
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('scooters')}
                  className="hover:text-white transition-colors text-left" style={{ color: '#9BA1A5' }}
                >
                  TVS Ntorq 150 ABS & 125
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('scooters')}
                  className="hover:text-white transition-colors text-left" style={{ color: '#9BA1A5' }}
                >
                  Honda Activa 125 & Jupiter
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cars')}
                  className="hover:text-white transition-colors text-left" style={{ color: '#9BA1A5' }}
                >
                  Mahindra Thar 4x4 & XUV 3XO
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Dehradun Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Dehradun Pickup Points
            </h4>
            <ul className="space-y-2 text-xs">
              {LOCATIONS.map((loc) => (
                <li key={loc.id}>
                  <button
                    onClick={() => onSelectCity(loc.city)}
                    className="hover:text-white transition-colors flex items-center gap-1.5 text-left" style={{ color: '#9BA1A5' }}
                  >
                    <MapPin className="w-3 h-3 shrink-0" style={{ color: '#FF6A00' }} />
                    <span>{loc.city}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Navigation & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Help
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenPriceList} className="hover:text-white transition-colors" style={{ color: '#9BA1A5' }}>
                  Official Price Menu Card
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offers')} className="hover:text-white transition-colors">
                  Discounts & Promo Codes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">
                  How It Works (4 Steps)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Security Deposit Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  24/7 Roadside Assistance
                </button>
              </li>
            </ul>
          </div>
        </div>
      <GoogleReview />
        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: '#656C70' }}>
          <div>
            © {new Date().getFullYear()} Bharat Bike And Car Rentals (BBR). Bhauwala, Dehradun, Uttarakhand 248007.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Crafted for Uttarakhand Travelers</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
