import React, { useState } from 'react';
import { X, Search, Bike, ShieldCheck, Phone } from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { Vehicle } from '../../types';
import { InstagramIcon } from '../common/Icons';

interface PriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const PriceListModal: React.FC<PriceListModalProps> = ({
  isOpen,
  onClose,
  onSelectVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'bike' | 'scooter' | 'car'>('all');

  if (!isOpen) return null;

  const filtered = VEHICLES.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === 'all' || v.category === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0F1422] border border-orange-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header with BBR Card Branding */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
                Official Tariff Sheet
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-heading uppercase tracking-wide">
                Bharat Bike and Car Rental
              </h2>
            </div>
          </div>
          <p className="text-xs text-orange-100 max-w-xl">
            Verified transparent pricing for hourly rides, 12-hour night cruising, and 24-hour full day adventures.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth">
            {(['all', 'bike', 'scooter', 'car'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Fleet (19)' : `${tab}s`}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vehicle model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="max-h-[55vh] overflow-y-auto p-4 sm:p-6">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Vehicle Name</th>
                  <th className="py-3 px-3 text-center bg-orange-500/10 text-orange-400 rounded-t-lg">
                    Full Day (24 Hr)
                  </th>
                  <th className="py-3 px-3 text-center">Hourly Rent</th>
                  <th className="py-3 px-3 text-center bg-purple-500/10 text-purple-300 rounded-t-lg">
                    Per Night (12 Hr)
                  </th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filtered.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-12 h-9 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                            {vehicle.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {vehicle.engineCC}cc • {vehicle.mileage} • {vehicle.transmission}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-orange-400 bg-orange-500/[0.03]">
                      ₹{vehicle.fullDayRent}/- <span className="text-[10px] text-slate-400 font-normal">Day</span>
                    </td>

                    <td className="py-3 px-3 text-center font-medium text-slate-300">
                      {vehicle.hourlyRent ? (
                        <span className="text-emerald-400 font-bold">₹{vehicle.hourlyRent}/hr</span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-purple-300 bg-purple-500/[0.03]">
                      ₹{vehicle.nightRent}/- <span className="text-[10px] text-slate-400 font-normal">Night</span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectVehicle(vehicle);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 transition-all"
                      >
                        Rent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer with Direct Contact */}
        <div className="bg-slate-950 p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <a
              href="tel:01354164070"
              className="flex items-center gap-1.5 text-orange-400 hover:underline font-bold"
            >
              <Phone className="w-3.5 h-3.5" /> Call: 0135 416 4070 / 8507067716 / 7091431158
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-pink-400 hover:underline font-medium"
            >
              <InstagramIcon className="w-3.5 h-3.5" /> @bharat_bike_and_car_rental
            </a>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bhauwala, Dehradun 248007 • Open · Closes 9 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
