import React from 'react';
import { MapPin, Bike, Sparkles, ArrowRight, Phone } from 'lucide-react';
import { LOCATIONS } from '../../data/locations';

interface LocationsSectionProps {
  onSelectCity: (city: string) => void;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({ onSelectCity }) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Bhauwala Main Hub & Dehradun Delivery Points</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
            Dehradun <span className="gradient-text-orange">Pickup Points</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-2">
            Collect your vehicle at our main headquarters in Bhauwala or choose doorstep delivery at ISBT, Railway Station, Jolly Grant Airport, and UPES campuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {LOCATIONS.map((hub) => (
          <div
            key={hub.id}
            onClick={() => onSelectCity(hub.city)}
            className="group relative rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-orange-500/40 transition-all duration-300 cursor-pointer h-72 flex flex-col justify-end p-6 hover:shadow-2xl hover:shadow-orange-500/10"
          >
            {/* Background Image */}
            <img
              src={hub.image}
              alt={hub.city}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 brightness-[0.65]"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

            {/* Top Available Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-orange-400 border border-orange-500/30 flex items-center gap-1.5 shadow-lg">
                <Bike className="w-3.5 h-3.5" />
                <span>{hub.vehicleCount}+ Rides Ready</span>
              </span>
            </div>

            {/* Hub Details Bottom */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white font-heading group-hover:text-orange-400 transition-colors">
                    {hub.city}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">{hub.landmark}</p>
                </div>

                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>{hub.branches.length} Delivery Points</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Pickup
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
