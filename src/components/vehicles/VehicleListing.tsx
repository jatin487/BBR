import React, { useState, useMemo } from 'react';
import {
  Filter,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Bike,
  Car,
  Sparkles,
  ChevronDown,
  SunMedium,
  Clock,
  Moon,
  Layers
} from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { VehicleCard } from './VehicleCard';
import { Vehicle, RateType, VehicleCategory } from '../../types';

interface VehicleListingProps {
  initialCategory?: 'all' | VehicleCategory;
  initialCity?: string;
  initialRateType?: RateType;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBookNow: (vehicle: Vehicle, rateType: RateType) => void;
  wishlist: string[];
  onToggleWishlist: (vehicleId: string) => void;
}

export const VehicleListing: React.FC<VehicleListingProps> = ({
  initialCategory = 'all',
  initialCity = 'Rishikesh',
  initialRateType = 'fullday',
  onSelectVehicle,
  onBookNow,
  wishlist,
  onToggleWishlist
}) => {
  // Filter States
  const [category, setCategory] = useState<'all' | VehicleCategory>(initialCategory);
  const [rateType, setRateType] = useState<RateType>(initialRateType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [ccRange, setCcRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'popular'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available Filter Options
  const brands = Array.from(new Set(VEHICLES.map((v) => v.brand)));

  const handleBrandToggle = (b: string) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const handleTransmissionToggle = (t: string) => {
    setSelectedTransmissions((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleResetFilters = () => {
    setCategory('all');
    setRateType('fullday');
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedTransmissions([]);
    setMaxPrice(6000);
    setCcRange('all');
    setSortBy('recommended');
  };

  // Filter & Sort Pipeline
  const filteredVehicles = useMemo(() => {
    return VEHICLES.filter((vehicle) => {
      // Category
      if (category !== 'all' && vehicle.category !== category) return false;

      // Search Query
      if (
        searchQuery &&
        !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !vehicle.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(vehicle.brand)) {
        return false;
      }

      // Transmission
      if (
        selectedTransmissions.length > 0 &&
        !selectedTransmissions.includes(vehicle.transmission)
      ) {
        return false;
      }

      // Rate Plan Filter
      const priceToCompare =
        rateType === 'hourly'
          ? vehicle.hourlyRent || vehicle.fullDayRent
          : rateType === 'night'
          ? vehicle.nightRent
          : vehicle.fullDayRent;

      if (priceToCompare > maxPrice) return false;

      // CC Range
      if (ccRange === 'under-125' && vehicle.engineCC > 125) return false;
      if (ccRange === '125-250' && (vehicle.engineCC < 125 || vehicle.engineCC > 250)) return false;
      if (ccRange === '250-500' && (vehicle.engineCC < 250 || vehicle.engineCC > 500)) return false;
      if (ccRange === 'above-500' && vehicle.engineCC <= 500) return false;

      return true;
    }).sort((a, b) => {
      const getPrice = (v: Vehicle) =>
        rateType === 'hourly'
          ? v.hourlyRent || v.fullDayRent
          : rateType === 'night'
          ? v.nightRent
          : v.fullDayRent;

      if (sortBy === 'price-asc') return getPrice(a) - getPrice(b);
      if (sortBy === 'price-desc') return getPrice(b) - getPrice(a);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [category, searchQuery, selectedBrands, selectedTransmissions, maxPrice, ccRange, sortBy, rateType]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bharat Bike & Car Rental • Fleet Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Choose Your Ride in <span className="text-orange-400">{initialCity}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse our entire garage of Royal Enfields, TVS, Hondas, and 4x4 SUVs with transparent tariffs.
          </p>
        </div>

        {/* Quick Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              category === 'all'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({VEHICLES.length})
          </button>
          <button
            onClick={() => setCategory('bike')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              category === 'bike'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bikes (7)
          </button>
          <button
            onClick={() => setCategory('scooter')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              category === 'scooter'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Scooters (7)
          </button>
          <button
            onClick={() => setCategory('car')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              category === 'car'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cars (5)
          </button>
        </div>
      </div>

      {/* Main Listing Layout: Sidebar Filters + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bike, scooter or car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="px-4 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Desktop & Mobile Filter Sidebar */}
        <div
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } p-5 rounded-3xl glass-panel border border-white/10 space-y-6`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-orange-400" />
              <span>Filter Rides</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search within catalog */}
          <div className="hidden lg:block">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Search Fleet
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Continental, Thar, Activa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Tariff Mode */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Tariff Plan
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-white/10 text-[11px]">
              <button
                onClick={() => setRateType('fullday')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  rateType === 'fullday' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400'
                }`}
              >
                24h Day
              </button>
              <button
                onClick={() => setRateType('hourly')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  rateType === 'hourly' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Hourly
              </button>
              <button
                onClick={() => setRateType('night')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  rateType === 'night' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                12h Night
              </button>
            </div>
          </div>

          {/* Max Budget Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-300">Max Price:</span>
              <span className="text-orange-400 font-bold">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="6000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹500</span>
              <span>₹6,000</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Manufacturer / Brand
            </label>
            <div className="space-y-1.5">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded border-white/10 text-orange-500 focus:ring-0 accent-orange-500 cursor-pointer"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Engine Capacity */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Engine Displacement (CC)
            </label>
            <select
              value={ccRange}
              onChange={(e) => setCcRange(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All CC Ratings</option>
              <option value="under-125">Under 125 cc (Scooters)</option>
              <option value="125-250">125 cc - 250 cc (Ronin / Apache)</option>
              <option value="250-500">250 cc - 500 cc (Royal Enfield)</option>
              <option value="above-500">500+ cc (GT 650 & Cars)</option>
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Transmission
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Manual', 'Automatic'].map((trans) => (
                <button
                  key={trans}
                  onClick={() => handleTransmissionToggle(trans)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedTransmissions.includes(trans)
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {trans}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Vehicle Grid (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-white/5">
            <div className="text-xs text-slate-300">
              Showing <strong className="text-white font-bold">{filteredVehicles.length}</strong> available rides in {initialCity}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Vehicles Grid */}
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  initialRateType={rateType}
                  onSelect={onSelectVehicle}
                  onBookNow={onBookNow}
                  isWishlisted={wishlist.includes(vehicle.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 rounded-3xl glass-card border border-white/10">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Bike className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">No Vehicles Match Your Filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                Try loosening your filters or resetting to view the full BBR fleet.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
