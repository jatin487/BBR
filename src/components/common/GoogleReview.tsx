import React from 'react';
import { Star } from 'lucide-react';

const GoogleReview: React.FC = () => (
  <section className="mt-8 p-6 rounded-xl glass-card" style={{ backgroundColor: 'rgba(26,26,26,0.6)', border: '1px solid rgba(255,106,0,0.2)', backdropFilter: 'blur(12px)' }}>
    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
      <Star className="w-5 h-5 text-orange-500 fill-current" />
      4.8 ★ Google Rating (17 Reviews)
    </h3>
    <p className="text-sm text-gray-300">
      "Excellent service and well‑maintained bikes!" – Raj
    </p>
    <p className="text-sm text-gray-300">
      "Smooth booking process, love the variety." – Priya
    </p>
  </section>
);

export default GoogleReview;
