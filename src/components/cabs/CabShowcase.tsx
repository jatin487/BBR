import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  Users,
  Briefcase,
  ShieldCheck,
  Phone,
  Plane,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Compass,
  CheckCircle,
  Navigation,
  Calculator,
  MessageSquare
} from 'lucide-react';
import { CAB_FLEET, CAB_PACKAGES } from '../../data/cabs';
import { CabVehicle, CabPackage } from '../../types';

interface CabShowcaseProps {
  onBookPackage?: (pkg: CabPackage) => void;
  onBookCab?: (cab: CabVehicle) => void;
}

export const CabShowcase: React.FC<CabShowcaseProps> = ({ onBookPackage, onBookCab }) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'fleet' | 'calculator'>('packages');

  // Quick Fare Calculator State
  const [calcPickup, setCalcPickup] = useState('Dehradun Airport (Jolly Grant)');
  const [calcDestination, setCalcDestination] = useState('Mussoorie (Queen of Hills)');
  const [calcCabId, setCalcCabId] = useState('cab-dzire');
  const [calcDays, setCalcDays] = useState(1);

  const selectedCab = CAB_FLEET.find((c) => c.id === calcCabId) || CAB_FLEET[0];

  // Route distance estimates (KM roundtrip/single)
  const routeDistances: Record<string, { km: number; desc: string }> = {
    'Dehradun Airport (Jolly Grant)': { km: 45, desc: 'Airport Pickup/Drop' },
    'Mussoorie (Queen of Hills)': { km: 95, desc: 'Hill station day tour & return' },
    'Rishikesh & Haridwar Aarti': { km: 140, desc: 'Ganga ghats & ashrams' },
    'Dhanaulti & Surkanda Devi': { km: 160, desc: 'High alpine pine forests' },
    'Delhi NCR One-Way': { km: 260, desc: 'Expressway direct drop' },
    'Char Dham Circuit (10 Days)': { km: 1200, desc: 'Kedarnath, Badrinath, Yamunotri' }
  };

  const currentRoute = routeDistances[calcDestination] || { km: 100, desc: 'Custom Uttarakhand Tour' };
  const estimatedFare = Math.max(currentRoute.km, selectedCab.minKmPerDay * calcDays) * selectedCab.perKmRate + (selectedCab.driverAllowance * calcDays);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Car className="w-4 h-4" />
          <span>BBR Chauffeur-Driven Cabs & Taxis</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white">
          Uttarakhand <span className="gradient-text-orange">Rental Cabs & Outstation Taxis</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-3 font-normal leading-relaxed">
          Doorstep airport transfers, Mussoorie & Dhanaulti hill sightseeing, Rishikesh river tours, and sacred Char Dham pilgrimage cabs with certified mountain chauffeurs.
        </p>

        {/* Tab Toggle: Tour Packages vs Cab Fleet vs Quick Calculator */}
        <div className="mt-8 inline-flex flex-wrap justify-center p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl gap-1">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Tour & Airport Packages</span>
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'fleet'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Cab Fleet & Tariffs</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Instant Fare Calculator</span>
          </button>
        </div>
      </div>

      {/* VIEW 0: QUICK FARE CALCULATOR */}
      {activeTab === 'calculator' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto rounded-3xl bg-slate-950/90 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl mb-12"
        >
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4" />
            <span>Live Outstation Fare Estimator</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-heading mb-6">
            Calculate Trip Fare to Anywhere in Uttarakhand
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Pickup */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Pickup Point:</label>
              <select
                value={calcPickup}
                onChange={(e) => setCalcPickup(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3.5 text-sm text-white focus:border-orange-500 outline-none"
              >
                <option>Bhauwala Main Hub / UPES</option>
                <option>Dehradun Airport (Jolly Grant)</option>
                <option>Dehradun Railway Station</option>
                <option>Clock Tower / Rajpur Road</option>
                <option>ISBT Dehradun</option>
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Destination / Circuit:</label>
              <select
                value={calcDestination}
                onChange={(e) => setCalcDestination(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3.5 text-sm text-white focus:border-orange-500 outline-none"
              >
                <option>Mussoorie (Queen of Hills)</option>
                <option>Rishikesh & Haridwar Aarti</option>
                <option>Dehradun Airport (Jolly Grant)</option>
                <option>Dhanaulti & Surkanda Devi</option>
                <option>Delhi NCR One-Way</option>
                <option>Char Dham Circuit (10 Days)</option>
              </select>
            </div>

            {/* Cab Vehicle */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Vehicle Type:</label>
              <select
                value={calcCabId}
                onChange={(e) => setCalcCabId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3.5 text-sm text-white focus:border-orange-500 outline-none"
              >
                {CAB_FLEET.map((cab) => (
                  <option key={cab.id} value={cab.id}>
                    {cab.name} (₹{cab.perKmRate}/km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Calculation Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/40 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Estimated All-Inclusive Fare:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-white font-mono">₹{estimatedFare.toLocaleString()}</span>
                <span className="text-xs text-emerald-400 font-medium">approx · No Surge</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Includes: {selectedCab.name} • Certified Hill Driver • {currentRoute.km} KM allowance • Fuel & AC included
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={`https://wa.me/918507067716?text=Hi%20BBR%20Rental!%20I%20want%20to%20book%20a%20cab%20from%20${encodeURIComponent(calcPickup)}%20to%20${encodeURIComponent(calcDestination)}%20with%20${encodeURIComponent(selectedCab.name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book via WhatsApp</span>
              </a>
              <a
                href="tel:8507067716"
                className="px-5 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Hotline</span>
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEW 1: POPULAR TOUR PACKAGES */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAB_PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-slate-950/80 border border-white/10 hover:border-orange-500/40 transition-all shadow-xl overflow-hidden flex flex-col group"
            >
              {/* Image & Badge */}
              <div className="relative h-48 sm:h-52 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/vehicles/innova-crysta.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/30 text-[11px] font-bold text-amber-300">
                  {pkg.tag}
                </span>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-mono text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <Navigation className="w-3 h-3 text-orange-400" />
                    {pkg.distanceKm} KM Approx
                  </span>
                  <span className="flex items-center gap-1 font-mono text-emerald-300 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {pkg.durationApprox}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading group-hover:text-orange-400 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-3.5 space-y-1.5 border-t border-white/5 pt-3">
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Package Starting</span>
                    <span className="text-2xl font-black text-white font-heading">
                      ₹{pkg.startingPrice.toLocaleString()}
                    </span>
                  </div>

                  <a
                    href="tel:8507067716"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Book Taxi</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* VIEW 2: CAB FLEET & PER-KM TARIFFS */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAB_FLEET.map((cab) => (
            <motion.div
              key={cab.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-slate-950/80 border border-white/10 hover:border-orange-500/40 transition-all shadow-xl overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 sm:h-52 overflow-hidden">
                <img
                  src={cab.image}
                  alt={cab.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/vehicles/innova-crysta.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
                  Chauffeur Included
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {cab.name}
                  </h3>
                  <p className="text-xs text-orange-400 font-medium mt-0.5">
                    {cab.model}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {cab.tagline}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      <span>{cab.seating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                      <span>{cab.luggage}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Outstation Tariff</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ₹{cab.perKmRate}
                    </span>
                    <span className="text-xs text-slate-400 font-medium"> / km</span>
                  </div>

                  <a
                    href="tel:8507067716"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-orange-400" />
                    <span>Reserve Cab</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
