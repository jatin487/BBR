import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, Bike, Car, ArrowRight } from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { VehicleCard } from '../vehicles/VehicleCard';
import { Vehicle, RateType, VehicleCategory } from '../../types';

interface VehicleShowcaseProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBookNow: (vehicle: Vehicle, rateType: RateType) => void;
  onViewAll: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

export const VehicleShowcase: React.FC<VehicleShowcaseProps> = ({
  onSelectVehicle,
  onBookNow,
  onViewAll,
  wishlist,
  onToggleWishlist
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'bike' | 'scooter' | 'car'>('featured');

  const filtered = VEHICLES.filter((v) => {
    if (activeTab === 'featured') return v.isFeatured || v.isPopular;
    return v.category === activeTab;
  }).slice(0, 6);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Picks for Every Rider</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
            Popular <span className="gradient-text-orange">BBR Rides</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-2">
            Meticulously maintained, sanitized, and ready for pickup within minutes at your nearest hub.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'featured'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 Top Featured
          </button>
          <button
            onClick={() => setActiveTab('bike')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'bike'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏍️ Cruisers & Bikes
          </button>
          <button
            onClick={() => setActiveTab('scooter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'scooter'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛵 Scooters
          </button>
          <button
            onClick={() => setActiveTab('car')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'car'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚙 Cars & Thar 4x4
          </button>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filtered.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onSelect={onSelectVehicle}
            onBookNow={onBookNow}
            isWishlisted={wishlist.includes(vehicle.id)}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>

      {/* Bottom View All CTA */}
      <div className="mt-12 text-center">
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white text-sm font-bold border border-white/10 hover:border-orange-500/40 shadow-xl transition-all hover:scale-105"
        >
          <span>Explore All 19 Vehicles in Full Catalog</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
        </button>
      </div>
    </section>
  );
};
