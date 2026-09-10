import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, Search, Phone } from 'lucide-react';
import { FAQS } from '../../data/faq';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCat, setSelectedCat] = useState<'all' | 'documents' | 'payment' | 'booking' | 'trip'>('all');

  const filteredFaqs = FAQS.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = selectedCat === 'all' || f.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions? We Have Answers</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading">
          Frequently Asked <span className="gradient-text-orange">Questions</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Everything you need to know about BBR rental policies, security deposits, licenses, and roadside assistance.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          {(['all', 'documents', 'payment', 'booking', 'trip'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-slate-900/80 border-orange-500/40 shadow-lg'
                  : 'bg-slate-900/40 border-white/5 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white font-heading">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-orange-500 text-white' : 'text-slate-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Contact Support Box */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-slate-900 to-slate-900 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white font-heading">Still have a specific query?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Our 24/7 team is ready to assist with group bookings, customized touring plans & car rentals.
          </p>
        </div>

        <a
          href="tel:8507067716"
          className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-orange-500/20"
        >
          <Phone className="w-4 h-4" />
          <span>Call 8507067716</span>
        </a>
      </div>
    </section>
  );
};
