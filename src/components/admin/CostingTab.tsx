import React, { useState } from 'react';
import {
  Edit2, Check, X, Download, DollarSign, Bike, Car, Search, RefreshCw
} from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { Vehicle } from '../../types';

const STORAGE_KEY = 'bbr_custom_pricing';

interface PricingOverride {
  vehicleId: string;
  fullDayRent?: number;
  hourlyRent?: number | null;
  nightRent?: number;
  securityDeposit?: number;
  updatedAt: string;
}

function loadOverrides(): Record<string, PricingOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveOverrides(map: Record<string, PricingOverride>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function getEffective(vehicle: Vehicle, overrides: Record<string, PricingOverride>): Vehicle {
  const ov = overrides[vehicle.id];
  if (!ov) return vehicle;
  return {
    ...vehicle,
    fullDayRent:    ov.fullDayRent     ?? vehicle.fullDayRent,
    hourlyRent:     ov.hourlyRent      !== undefined ? ov.hourlyRent : vehicle.hourlyRent,
    nightRent:      ov.nightRent       ?? vehicle.nightRent,
    securityDeposit: ov.securityDeposit ?? vehicle.securityDeposit,
  };
}

function exportPricingCSV(vehicles: Vehicle[], overrides: Record<string, PricingOverride>) {
  const rows: string[][] = [
    ['Vehicle Name', 'Brand', 'Category', 'Full Day (24hr)', 'Hourly', 'Night (12hr)', 'Security Deposit', 'Last Updated'],
  ];
  for (const v of vehicles) {
    const eff = getEffective(v, overrides);
    const ov  = overrides[v.id];
    rows.push([
      JSON.stringify(v.name),
      v.brand,
      v.category,
      String(eff.fullDayRent),
      eff.hourlyRent != null ? String(eff.hourlyRent) : 'N/A',
      String(eff.nightRent),
      String(eff.securityDeposit),
      ov?.updatedAt ? new Date(ov.updatedAt).toLocaleDateString('en-IN') : 'Default',
    ]);
  }
  const csv  = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const link = document.createElement('a');
  link.href  = encodeURI(csv);
  link.download = `bbr-pricing-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

export const CostingTab: React.FC = () => {
  const [overrides, setOverrides] = useState<Record<string, PricingOverride>>(loadOverrides);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PricingOverride>>({});
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'bike' | 'scooter' | 'car'>('all');

  const persist = (updated: Record<string, PricingOverride>) => {
    setOverrides(updated);
    saveOverrides(updated);
  };

  const startEdit = (vehicle: Vehicle) => {
    const eff = getEffective(vehicle, overrides);
    setEditingId(vehicle.id);
    setEditValues({
      fullDayRent:     eff.fullDayRent,
      hourlyRent:      eff.hourlyRent,
      nightRent:       eff.nightRent,
      securityDeposit: eff.securityDeposit,
    });
  };

  const saveEdit = (vehicleId: string) => {
    const updated = {
      ...overrides,
      [vehicleId]: { vehicleId, ...editValues, updatedAt: new Date().toISOString() } as PricingOverride,
    };
    persist(updated);
    setEditingId(null);
  };

  const resetToDefault = (vehicleId: string) => {
    const updated = { ...overrides };
    delete updated[vehicleId];
    persist(updated);
  };

  const filtered = VEHICLES.filter(v => {
    if (catFilter !== 'all' && v.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-black text-white">Pricing & Costing</h2>
          <p className="text-[11px]" style={{ color: '#656C70' }}>Edit rental rates per vehicle · Changes apply immediately</p>
        </div>
        <button
          onClick={() => exportPricingCSV(filtered, overrides)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
        >
          <Download className="w-3.5 h-3.5" /> Export Pricing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Vehicles',   value: VEHICLES.length, color: '#FF6A00' },
          { label: 'Custom Pricing',   value: Object.keys(overrides).length, color: '#fbbf24' },
          { label: 'Default Pricing',  value: VEHICLES.length - Object.keys(overrides).length, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#656C70' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[180px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#656C70' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicle…"
            className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(['all', 'bike', 'scooter', 'car'] as const).map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
              style={{
                background: catFilter === c ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${catFilter === c ? 'rgba(255,106,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
                color: catFilter === c ? '#FF6A00' : '#656C70',
              }}
            >
              {c === 'all' ? 'All' : c === 'bike' ? '🏍 Bikes' : c === 'scooter' ? '🛵 Scooters' : '🚗 Cars'}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Pricing List */}
      <div className="space-y-2">
        {filtered.map(vehicle => {
          const eff      = getEffective(vehicle, overrides);
          const isEditing = editingId === vehicle.id;
          const hasCustom = !!overrides[vehicle.id];

          return (
            <div
              key={vehicle.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${isEditing ? 'rgba(255,106,0,0.2)' : hasCustom ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.07)'}` }}
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: vehicle.category === 'car' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)' }}
                >
                  {vehicle.category === 'car'
                    ? <Car className="w-4 h-4" style={{ color: '#60a5fa' }} />
                    : <Bike className="w-4 h-4" style={{ color: '#a78bfa' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{vehicle.name}</p>
                    {hasCustom && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                        Custom Pricing
                      </span>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: '#656C70' }}>{vehicle.brand} · {vehicle.category}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!isEditing && (
                    <>
                      <button onClick={() => startEdit(vehicle)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', color: '#FF8C33' }}
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      {hasCustom && (
                        <button onClick={() => resetToDefault(vehicle.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}
                          title="Reset to default pricing"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Pricing Grid */}
              {!isEditing ? (
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <PriceCell label="Full Day (24hr)" value={`₹${eff.fullDayRent}`} isCustom={hasCustom && overrides[vehicle.id]?.fullDayRent !== undefined} />
                    <PriceCell label="Hourly" value={eff.hourlyRent != null ? `₹${eff.hourlyRent}/hr` : 'N/A'} isCustom={hasCustom && overrides[vehicle.id]?.hourlyRent !== undefined} />
                    <PriceCell label="Night (12hr)" value={`₹${eff.nightRent}`} isCustom={hasCustom && overrides[vehicle.id]?.nightRent !== undefined} />
                    <PriceCell label="Security Deposit" value={`₹${eff.securityDeposit}`} isCustom={hasCustom && overrides[vehicle.id]?.securityDeposit !== undefined} />
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">Full Day (24hr) ₹</label>
                      <input
                        type="number" min={0}
                        value={editValues.fullDayRent ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, fullDayRent: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">Hourly ₹ (blank = N/A)</label>
                      <input
                        type="number" min={0}
                        value={editValues.hourlyRent ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, hourlyRent: e.target.value === '' ? null : Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">Night (12hr) ₹</label>
                      <input
                        type="number" min={0}
                        value={editValues.nightRent ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, nightRent: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-1">Security Deposit ₹</label>
                      <input
                        type="number" min={0}
                        value={editValues.securityDeposit ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, securityDeposit: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => saveEdit(vehicle.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">
                      <Check className="w-3 h-3" /> Save Pricing
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: '#9BA1A5' }}>
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PriceCell: React.FC<{ label: string; value: string; isCustom?: boolean }> = ({ label, value, isCustom }) => (
  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isCustom ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
    <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#656C70' }}>{label}</p>
    <p className="text-sm font-black" style={{ color: isCustom ? '#fbbf24' : '#FF6A00' }}>{value}</p>
  </div>
);
