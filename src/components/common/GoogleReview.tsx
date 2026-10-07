import React from 'react';
import { Star, MapPin, ExternalLink } from 'lucide-react';

export const GoogleReview: React.FC = () => (
  <section
    className="mt-10 p-6 rounded-2xl backdrop-blur-md"
    style={{
      backgroundColor: 'rgba(26,26,26,0.6)',
      border: '1px solid rgba(255,106,0,0.2)'
    }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-bold text-white font-mono">Google Verified Business</span>
        </div>
        <h3 className="text-base font-bold text-white">
          Bharat Bike And Car Rentals on Google Maps
        </h3>
        <p className="text-xs text-slate-400">
          📍 Bhauwala, Dehradun, Uttarakhand 248007. Read real traveler feedback or share your road trip experience.
        </p>
      </div>

      <a
        href="https://maps.google.com/?q=Bharat+Bike+And+Car+Rentals+Bhauwala+Dehradun"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:text-white hover:bg-orange-500 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
      >
        <span>View & Review on Google Maps</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </section>
);

export default GoogleReview;
