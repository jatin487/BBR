import React, { useState } from 'react';
import {
  AlertTriangle, Plus, Edit2, Check, X, Download, Search,
  Camera, Phone, Calendar, MapPin, FileText, CheckCircle, Clock
} from 'lucide-react';

interface AccidentClaim {
  claimId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  vehicleName: string;
  regNumber: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  damageEstimate: number;
  status: 'reported' | 'under_review' | 'approved' | 'rejected' | 'settled';
  photos?: string[];
  adminNotes?: string;
  createdAt: string;
  settledAt?: string;
  settlementAmount?: number;
}

const STORAGE_KEY = 'bbr_accident_claims';

function loadClaims(): AccidentClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveClaims(claims: AccidentClaim[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  reported:     { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', label: 'Reported', icon: <AlertTriangle className="w-3 h-3" /> },
  under_review: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', label: 'Under Review', icon: <Clock className="w-3 h-3" /> },
  approved:     { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', label: 'Approved', icon: <CheckCircle className="w-3 h-3" /> },
  rejected:     { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', label: 'Rejected', icon: <X className="w-3 h-3" /> },
  settled:      { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', label: 'Settled', icon: <CheckCircle className="w-3 h-3" /> },
};

function exportClaimsCSV(claims: AccidentClaim[]) {
  const rows: string[][] = [
    ['Claim ID', 'Booking ID', 'Customer', 'Phone', 'Vehicle', 'Reg No', 'Incident Date', 'Location', 'Description', 'Damage Est.', 'Status', 'Admin Notes', 'Settlement Amt', 'Created At'],
  ];
  for (const c of claims) {
    rows.push([
      c.claimId,
      c.bookingId,
      JSON.stringify(c.customerName),
      c.customerPhone,
      JSON.stringify(c.vehicleName),
      c.regNumber,
      c.incidentDate,
      JSON.stringify(c.incidentLocation),
      JSON.stringify(c.description),
      String(c.damageEstimate),
      c.status,
      JSON.stringify(c.adminNotes || ''),
      c.settlementAmount ? String(c.settlementAmount) : '',
      new Date(c.createdAt).toLocaleDateString('en-IN'),
    ]);
  }
  const csv = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
  const link = document.createElement('a');
  link.href = encodeURI(csv);
  link.download = `bbr-claims-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleName: string;
  vehicleId: string;
}

interface Props {
  bookings: Booking[];
}

const BLANK_CLAIM: Partial<AccidentClaim> = {
  bookingId: '',
  customerName: '',
  customerPhone: '',
  vehicleName: '',
  regNumber: '',
  incidentDate: '',
  incidentLocation: '',
  description: '',
  damageEstimate: 0,
  status: 'reported',
  adminNotes: '',
};

export const AccidentClaimsTab: React.FC<Props> = ({ bookings }) => {
  const [claims, setClaims] = useState<AccidentClaim[]>(loadClaims);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AccidentClaim>>(BLANK_CLAIM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<AccidentClaim['status']>('reported');
  const [editSettlement, setEditSettlement] = useState<number>(0);
  const [search, setSearch] = useState('');

  const persist = (updated: AccidentClaim[]) => {
    setClaims(updated);
    saveClaims(updated);
  };

  const addClaim = () => {
    if (!formData.customerName || !formData.incidentDate) return;
    const claim: AccidentClaim = {
      claimId: `CLM-${Date.now().toString(36).toUpperCase()}`,
      bookingId: formData.bookingId || 'WALK-IN',
      customerName: formData.customerName || '',
      customerPhone: formData.customerPhone || '',
      vehicleName: formData.vehicleName || '',
      regNumber: formData.regNumber?.toUpperCase() || '',
      incidentDate: formData.incidentDate || '',
      incidentLocation: formData.incidentLocation || '',
      description: formData.description || '',
      damageEstimate: formData.damageEstimate || 0,
      status: 'reported',
      adminNotes: formData.adminNotes,
      createdAt: new Date().toISOString(),
    };
    persist([claim, ...claims]);
    setShowNewForm(false);
    setFormData(BLANK_CLAIM);
  };

  const startEditClaim = (claim: AccidentClaim) => {
    setEditingId(claim.claimId);
    setEditNotes(claim.adminNotes || '');
    setEditStatus(claim.status);
    setEditSettlement(claim.settlementAmount || 0);
  };

  const saveEditClaim = (claimId: string) => {
    persist(claims.map(c => c.claimId === claimId
      ? {
          ...c,
          status: editStatus,
          adminNotes: editNotes,
          settlementAmount: editSettlement || undefined,
          settledAt: editStatus === 'settled' ? new Date().toISOString() : c.settledAt,
        }
      : c
    ));
    setEditingId(null);
  };

  const filtered = claims.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.customerName.toLowerCase().includes(q) ||
      c.customerPhone.includes(q) ||
      c.claimId.toLowerCase().includes(q) ||
      c.vehicleName.toLowerCase().includes(q) ||
      c.regNumber.toLowerCase().includes(q)
    );
  });

  const fillFromBooking = (bookingId: string) => {
    const b = bookings.find(x => x.id === bookingId);
    if (b) {
      setFormData(prev => ({
        ...prev,
        bookingId,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        vehicleName: b.vehicleName,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-black text-white">Accident Claims</h2>
          <p className="text-[11px]" style={{ color: '#656C70' }}>{claims.length} total claims · Bhauwala Hub</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportClaimsCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setShowNewForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 100%)' }}
          >
            <Plus className="w-3.5 h-3.5" /> New Claim
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(['reported', 'under_review', 'approved', 'rejected', 'settled'] as const).map(st => {
          const style = STATUS_STYLE[st];
          const count = claims.filter(c => c.status === st).length;
          return (
            <div key={st} className="p-2.5 rounded-xl text-center" style={{ background: style.bg, border: `1px solid ${style.text}20` }}>
              <p className="text-xl font-black" style={{ color: style.text }}>{count}</p>
              <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: style.text }}>{style.label}</p>
            </div>
          );
        })}
      </div>

      {/* New Claim Form */}
      {showNewForm && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,106,0,0.05)', border: '1px solid rgba(255,106,0,0.2)' }}>
          <p className="text-sm font-black" style={{ color: '#FF6A00' }}>New Accident Claim</p>

          {/* Link to booking */}
          <div>
            <label className="text-[9px] text-gray-500 block mb-1">Link to Booking (optional)</label>
            <select
              value={formData.bookingId || ''}
              onChange={e => fillFromBooking(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-gray-900 border border-white/10 outline-none"
            >
              <option value="">— Walk-in / No booking —</option>
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  #{b.id.slice(-6)} · {b.customerName} · {b.vehicleName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Customer Name *" value={formData.customerName || ''} onChange={v => setFormData(p => ({ ...p, customerName: v }))} placeholder="Customer full name" />
            <FormField label="Customer Phone" value={formData.customerPhone || ''} onChange={v => setFormData(p => ({ ...p, customerPhone: v }))} placeholder="Phone number" type="tel" />
            <FormField label="Vehicle Name" value={formData.vehicleName || ''} onChange={v => setFormData(p => ({ ...p, vehicleName: v }))} placeholder="e.g. Royal Enfield Classic 350" />
            <FormField label="Registration No." value={formData.regNumber || ''} onChange={v => setFormData(p => ({ ...p, regNumber: v.toUpperCase() }))} placeholder="e.g. UK07 TA 1234" mono />
            <FormField label="Incident Date *" value={formData.incidentDate || ''} onChange={v => setFormData(p => ({ ...p, incidentDate: v }))} type="date" />
            <FormField label="Damage Estimate (₹)" value={String(formData.damageEstimate || '')} onChange={v => setFormData(p => ({ ...p, damageEstimate: Number(v) }))} type="number" placeholder="0" />
          </div>
          <FormField label="Incident Location" value={formData.incidentLocation || ''} onChange={v => setFormData(p => ({ ...p, incidentLocation: v }))} placeholder="Where did the accident occur?" />
          <div>
            <label className="text-[9px] text-gray-500 block mb-1">Description *</label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the incident, damage, third party involvement etc."
              rows={3}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addClaim}
              disabled={!formData.customerName || !formData.incidentDate}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 100%)' }}
            >
              <FileText className="w-3 h-3" /> File Claim
            </button>
            <button
              onClick={() => { setShowNewForm(false); setFormData(BLANK_CLAIM); }}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#9BA1A5' }}
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#656C70' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer, vehicle, reg no, claim ID…"
          className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1"
        />
      </div>

      {/* Claims List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <AlertTriangle className="w-8 h-8 mx-auto" style={{ color: '#656C70' }} />
          <p className="text-sm" style={{ color: '#9BA1A5' }}>
            {claims.length === 0 ? 'No accident claims filed yet.' : 'No claims match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(claim => {
            const isOpen    = expandedId === claim.claimId;
            const isEditing = editingId === claim.claimId;
            const st        = STATUS_STYLE[claim.status] || STATUS_STYLE.reported;

            return (
              <div
                key={claim.claimId}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${isOpen ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.07)'}` }}
              >
                {/* Row Header */}
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all"
                  onClick={() => setExpandedId(isOpen ? null : claim.claimId)}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: st.bg }}>
                    <span style={{ color: st.text }}>{st.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{claim.customerName}</span>
                      <span className="text-xs font-mono" style={{ color: '#656C70' }}>{claim.claimId}</span>
                      <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: st.bg, color: st.text }}>
                        {st.icon}{st.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      <span className="text-xs" style={{ color: '#9BA1A5' }}>{claim.vehicleName}</span>
                      {claim.regNumber && <span className="text-xs font-mono" style={{ color: '#9BA1A5' }}>{claim.regNumber}</span>}
                      <span className="text-xs" style={{ color: '#9BA1A5' }}>{claim.incidentDate}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black" style={{ color: '#ef4444' }}>₹{claim.damageEstimate.toLocaleString()}</p>
                    <p className="text-[9px]" style={{ color: '#656C70' }}>Est. damage</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#FF6A00' }}>Incident Details</p>
                        <InfoRow label="Description" value={claim.description} />
                        <InfoRow label="Location" value={claim.incidentLocation} />
                        <InfoRow label="Booking ID" value={claim.bookingId} />
                        <InfoRow label="Damage Est." value={`₹${claim.damageEstimate.toLocaleString()}`} />
                        {claim.settlementAmount && <InfoRow label="Settlement" value={`₹${claim.settlementAmount.toLocaleString()}`} />}
                        {claim.settledAt && <InfoRow label="Settled On" value={new Date(claim.settledAt).toLocaleDateString('en-IN')} />}
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#3b82f6' }}>Customer</p>
                        <InfoRow label="Name" value={claim.customerName} />
                        <InfoRow label="Phone" value={claim.customerPhone} />
                        <InfoRow label="Filed" value={new Date(claim.createdAt).toLocaleString('en-IN')} />
                        {claim.adminNotes && (
                          <div className="mt-2">
                            <p className="text-[9px] text-gray-500 mb-1">Admin Notes:</p>
                            <p className="text-xs" style={{ color: '#9BA1A5' }}>{claim.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {!isEditing ? (
                      <div className="mt-4 pt-3 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          onClick={() => startEditClaim(claim)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', color: '#FF8C33' }}
                        >
                          <Edit2 className="w-3 h-3" /> Update Status
                        </button>
                        {claim.customerPhone && (
                          <a
                            href={`tel:${claim.customerPhone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                        )}
                        {claim.customerPhone && (
                          <a
                            href={`https://wa.me/${claim.customerPhone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(claim.customerName)}!%20This%20is%20BBR%20regarding%20your%20accident%20claim%20${claim.claimId}.`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)' }}
                          >
                            <Phone className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#FF6A00' }}>Update Claim</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-1">Status</label>
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value as AccidentClaim['status'])}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-gray-900 border border-white/10 outline-none"
                            >
                              <option value="reported">Reported</option>
                              <option value="under_review">Under Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="settled">Settled</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-1">Settlement Amount (₹)</label>
                            <input
                              type="number" min={0}
                              value={editSettlement || ''}
                              onChange={e => setEditSettlement(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-1">Admin Notes</label>
                            <input
                              type="text" value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEditClaim(claim.claimId)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: '#9BA1A5' }}>
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FormField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; mono?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', mono }) => (
  <div>
    <label className="text-[9px] text-gray-500 block mb-1">{label}</label>
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 ${mono ? 'font-mono uppercase' : ''}`}
    />
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-start gap-1.5">
    <span className="text-[10px] min-w-[80px] flex-shrink-0" style={{ color: '#656C70' }}>{label}:</span>
    <span className="text-xs text-white font-medium break-words">{value || '—'}</span>
  </div>
);
