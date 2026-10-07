import React from 'react';
import { Bike, Compass, ArrowLeft, Phone, Search } from 'lucide-react';

interface NotFoundViewProps {
  onGoHome: () => void;
  onExploreFleet: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome, onExploreFleet }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto text-orange-400">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 uppercase tracking-widest">
            Error 404 • Destination Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 font-heading">
            Took a Wrong Turn?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            The page or route you are looking for does not exist on Bharat Bike and Car Rentals. Let's get you back on the scenic Uttarakhand highway!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
          <button
            onClick={onExploreFleet}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Bike className="w-4 h-4 text-orange-400" />
            <span>Browse Dehradun Fleet</span>
          </button>
        </div>

        <div className="pt-6 border-t border-white/5 text-xs text-slate-500">
          Need help? Call our Bhauwala desk directly at{' '}
          <a href="tel:01354164070" className="text-orange-400 font-bold underline">
            0135 416 4070
          </a>
        </div>
      </div>
    </div>
  );
};
