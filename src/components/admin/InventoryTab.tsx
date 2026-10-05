import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Bike, Car, Plus, Trash2, Download, Search, Edit2, Check, X,
  Package, ChevronDown, ChevronUp, AlertTriangle, Table, LayoutList,
  CheckCircle2, Clock, Wrench, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { Vehicle } from '../../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface VehicleUnit {
  unitId: string;
  vehicleId: string;
  regNumber: string;
  status: 'available' | 'booked' | 'maintenance' | 'retired';
  allottedTo?: string;
  notes?: string;
  addedAt: string;
}

interface InventoryEntry {
  vehicle: Vehicle;
  units: VehicleUnit[];
}

// ── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'bbr_inventory_units';

function loadUnits(): VehicleUnit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUnits(units: VehicleUnit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
}

// ── Status badge configuration ────────────────────────────────────────────────

const STATUS_CONFIG: Record<VehicleUnit['status'], { bg: string; text: string; border: string; label: string; icon: React.ReactNode }> = {
  available:   { bg: 'rgba(34,197,94,0.14)',  text: '#4ade80', border: 'rgba(34,197,94,0.3)', label: 'Available', icon: <CheckCircle2 className="w-3 h-3" /> },
  booked:      { bg: 'rgba(59,130,246,0.14)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)', label: 'Booked', icon: <Clock className="w-3 h-3" /> },
  maintenance: { bg: 'rgba(251,191,36,0.14)', text: '#fde047', border: 'rgba(251,191,36,0.3)', label: 'Maintenance', icon: <Wrench className="w-3 h-3" /> },
  retired:     { bg: 'rgba(239,68,68,0.14)',  text: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'Retired', icon: <ShieldAlert className="w-3 h-3" /> },
};

// ── Excel / CSV export with Professional Spacing ──────────────────────────────

interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  status: string;
  pickupDate: string;
}

function exportInventoryExcel(entries: InventoryEntry[], bookings: Booking[]) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const allUnits = entries.flatMap(e => e.units);
  const totalUnits = allUnits.length;
  const totalAvail = allUnits.filter(u => u.status === 'available').length;
  const totalBooked = allUnits.filter(u => u.status === 'booked').length;
  const totalMaint = allUnits.filter(u => u.status === 'maintenance').length;
  const totalRetired = allUnits.filter(u => u.status === 'retired').length;

  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[][] = [
    // Header Block with visual spacing
    [escapeCell('BHARAT BIKE & CAR RENTALS (BBR) — OFFICIAL FLEET INVENTORY REGISTER')],
    [escapeCell(`HUB LOCATION: Dehradun (Bhauwala Main Hub) | REPORT GENERATED: ${dateFormatted} at ${timeFormatted}`)],
    [escapeCell(`FLEET STATUS SUMMARY: Total Units: ${totalUnits} | Available: ${totalAvail} | On Rent / Booked: ${totalBooked} | In Maintenance: ${totalMaint} | Retired: ${totalRetired}`)],
    [], // Blank line for Excel spacing
    // Clean Column Headers
    [
      escapeCell('S.No.'),
      escapeCell('Registration No.'),
      escapeCell('Vehicle Model'),
      escapeCell('Category'),
      escapeCell('Brand'),
      escapeCell('Daily Rent (INR)'),
      escapeCell('Current Status'),
      escapeCell('Allotment Status'),
      escapeCell('Customer Name'),
      escapeCell('Customer Phone'),
      escapeCell('Pickup Date'),
      escapeCell('Condition & Colour Notes'),
      escapeCell('Date Added'),
    ],
  ];

  let serial = 1;

  for (const { vehicle, units } of entries) {
    if (units.length === 0) continue;

    for (const unit of units) {
      const allottedB = bookings.find(b => b.id === unit.allottedTo);

      rows.push([
        escapeCell(serial++),
        escapeCell(unit.regNumber),
        escapeCell(vehicle.name),
        escapeCell(vehicle.category === 'bike' ? 'Bike (2-Wheeler)' : vehicle.category === 'scooter' ? 'Scooty (2-Wheeler)' : 'Car (4-Wheeler)'),
        escapeCell(vehicle.brand),
        escapeCell(`₹${vehicle.fullDayRent}`),
        escapeCell(unit.status.toUpperCase()),
        escapeCell(allottedB ? `ALLOTTED (#${allottedB.id.slice(-6)})` : 'UNASSIGNED / READY'),
        escapeCell(allottedB?.customerName || '—'),
        escapeCell(allottedB?.customerPhone || '—'),
        escapeCell(allottedB?.pickupDate || '—'),
        escapeCell(unit.notes || 'Good condition / Standard stock'),
        escapeCell(new Date(unit.addedAt).toLocaleDateString('en-IN')),
      ]);
    }

    // Model subtotal row for easy scanning in Excel
    const modelAvail = units.filter(u => u.status === 'available').length;
    const modelBooked = units.filter(u => u.status === 'booked').length;
    const modelMaint = units.filter(u => u.status === 'maintenance').length;

    rows.push([
      escapeCell(''),
      escapeCell(`Subtotal: ${vehicle.name}`),
      escapeCell(`${units.length} total units`),
      escapeCell(''),
      escapeCell(''),
      escapeCell(''),
      escapeCell(`${modelAvail} Available | ${modelBooked} Booked | ${modelMaint} Maint`),
      escapeCell(''),
      escapeCell(''),
      escapeCell(''),
      escapeCell(''),
      escapeCell(''),
      escapeCell(''),
    ]);
    rows.push([]); // Blank spacing line between vehicle groups in Excel
  }

  // Grand summary row at bottom
  rows.push([
    escapeCell('GRAND TOTAL'),
    escapeCell(`${totalUnits} Total Registered Vehicles`),
    escapeCell('All Categories'),
    escapeCell(''),
    escapeCell(''),
    escapeCell(''),
    escapeCell(`${totalAvail} AVAILABLE | ${totalBooked} BOOKED | ${totalMaint} MAINT | ${totalRetired} RETIRED`),
    escapeCell(''),
    escapeCell(''),
    escapeCell(''),
    escapeCell(''),
    escapeCell(''),
    escapeCell(''),
  ]);

  // Use \r\n line breaks and UTF-8 BOM so Microsoft Excel & Google Sheets open it flawlessly
  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BBR-Vehicle-Inventory-Bhauwala-${now.toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  bookings: Booking[];
}

// ── Signed-in users helper ────────────────────────────────────────────────────

interface SignedInUser {
  uid: string;
  name: string;
  phone?: string;
  email?: string;
  authProvider?: string;
}

function loadSignedInUsers(): SignedInUser[] {
  try {
    const seen = new Set<string>();
    const users: SignedInUser[] = [];

    const addUser = (raw: unknown) => {
      const u = raw as SignedInUser;
      if (u && u.uid && !seen.has(u.uid)) {
        seen.add(u.uid);
        users.push(u);
      }
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('bbr_user_session_') ||
        key === 'bbr_user_session' ||
        key === 'bbr-user-profile'
      ) {
        try { addUser(JSON.parse(localStorage.getItem(key)!)); } catch { /* skip */ }
      }
    }

    try {
      const bd = localStorage.getItem('bbr_backend_data');
      if (bd) {
        const data = JSON.parse(bd) as { users?: unknown[] };
        if (Array.isArray(data.users)) data.users.forEach(addUser);
      }
    } catch { /* skip */ }

    return users;
  } catch {
    return [];
  }
}


// ── Component ─────────────────────────────────────────────────────────────────

export const InventoryTab: React.FC<Props> = ({ bookings }) => {
  const [units, setUnits] = useState<VehicleUnit[]>(loadUnits);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'bike' | 'scooter' | 'car'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'booked' | 'maintenance' | 'retired'>('all');
  const [viewMode, setViewMode] = useState<'sheet' | 'cards'>('sheet');

  const [expandedVehicle, setExpandedV] = useState<string | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newReg, setNewReg] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Quick unit add in spreadsheet mode
  const [sheetAddVehicleId, setSheetAddVehicleId] = useState<string>(VEHICLES[0]?.id || '');
  const [sheetAddReg, setSheetAddReg] = useState('');
  const [sheetAddNotes, setSheetAddNotes] = useState('');
  const [isSheetAddOpen, setIsSheetAddOpen] = useState(false);

  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editReg, setEditReg] = useState('');
  const [editStatus, setEditStatus] = useState<VehicleUnit['status']>('available');
  const [editNotes, setEditNotes] = useState('');

  // ── Real-time signed-in users ───────────────────────────────────────────────
  const [signedInUsers, setSignedInUsers] = useState<SignedInUser[]>(() => loadSignedInUsers());
  const [newUserUids, setNewUserUids] = useState<Set<string>>(new Set());

  const refreshUsers = useCallback(() => {
    setSignedInUsers(loadSignedInUsers());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key?.startsWith('bbr_user_session_') ||
        e.key === 'bbr-user-profile' ||
        e.key === 'bbr_backend_data'
      ) refreshUsers();
    };
    window.addEventListener('storage', onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('bbr_user_updates');
      bc.onmessage = (evt) => {
        if (evt.data?.type === 'USER_SIGNED_IN') {
          const uid = evt.data.profile?.uid as string | undefined;
          refreshUsers();
          if (uid) {
            setNewUserUids(prev => new Set([...prev, uid]));
            setTimeout(() => {
              setNewUserUids(prev => { const n = new Set(prev); n.delete(uid); return n; });
            }, 10 * 60 * 1000);
          }
        }
      };
    } catch { /* not supported */ }

    return () => {
      window.removeEventListener('storage', onStorage);
      bc?.close();
    };
  }, [refreshUsers]);
  // ───────────────────────────────────────────────────────────────────────────

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');


  const filteredVehicles = useMemo(() =>
    VEHICLES.filter(v => {
      if (catFilter !== 'all' && v.category !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
      }
      return true;
    }), [catFilter, search]);

  const entries: InventoryEntry[] = filteredVehicles.map(v => ({
    vehicle: v,
    units: units.filter(u => u.vehicleId === v.id),
  }));

  // Flattened units list for the Excel Spreadsheet table view
  const flattenedRows = useMemo(() => {
    const list: { unit: VehicleUnit; vehicle: Vehicle; allottedBooking?: Booking }[] = [];
    for (const vehicle of VEHICLES) {
      if (catFilter !== 'all' && vehicle.category !== catFilter) continue;
      const vUnits = units.filter(u => u.vehicleId === vehicle.id);
      for (const unit of vUnits) {
        if (statusFilter !== 'all' && unit.status !== statusFilter) continue;
        if (search) {
          const q = search.toLowerCase();
          const matchReg = unit.regNumber.toLowerCase().includes(q);
          const matchVehicle = vehicle.name.toLowerCase().includes(q);
          const matchNotes = (unit.notes || '').toLowerCase().includes(q);
          const allotted = activeBookings.find(b => b.id === unit.allottedTo);
          const matchCust = (allotted?.customerName || '').toLowerCase().includes(q) || (allotted?.customerPhone || '').includes(q);
          if (!matchReg && !matchVehicle && !matchNotes && !matchCust) continue;
        }
        const allottedBooking = activeBookings.find(b => b.id === unit.allottedTo);
        list.push({ unit, vehicle, allottedBooking });
      }
    }
    return list;
  }, [units, catFilter, statusFilter, search, activeBookings]);

  const persist = (updated: VehicleUnit[]) => {
    setUnits(updated);
    saveUnits(updated);
  };

  const addUnit = (vehicleId: string, regText: string, notesText?: string) => {
    const reg = regText.trim().toUpperCase();
    if (!reg) return;
    const unit: VehicleUnit = {
      unitId: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      vehicleId,
      regNumber: reg,
      status: 'available',
      notes: notesText?.trim() || undefined,
      addedAt: new Date().toISOString(),
    };
    persist([...units, unit]);
    setNewReg('');
    setNewNotes('');
    setAddingFor(null);
    setSheetAddReg('');
    setSheetAddNotes('');
    setIsSheetAddOpen(false);
  };

  const removeUnit = (unitId: string) => {
    if (!confirm('Remove this unit from inventory?')) return;
    persist(units.filter(u => u.unitId !== unitId));
  };

  const startEdit = (unit: VehicleUnit) => {
    setEditingUnit(unit.unitId);
    setEditReg(unit.regNumber);
    setEditStatus(unit.status);
    setEditNotes(unit.notes || '');
  };

  const saveEdit = (unitId: string) => {
    persist(units.map(u => u.unitId === unitId
      ? { ...u, regNumber: editReg.trim().toUpperCase(), status: editStatus, notes: editNotes.trim() || undefined }
      : u
    ));
    setEditingUnit(null);
  };

  const updateUnitStatus = (unitId: string, newStatus: VehicleUnit['status']) => {
    persist(units.map(u => u.unitId === unitId ? { ...u, status: newStatus } : u));
  };

  const allotUnit = (unitId: string, value: string) => {
    if (!value) {
      // Unassign
      persist(units.map(u => u.unitId === unitId
        ? { ...u, allottedTo: undefined, status: 'available' as const }
        : u
      ));
      return;
    }
    // value is either a booking ID or "user:<uid>"
    const id = value.startsWith('user:') ? value.slice(5) : value;
    persist(units.map(u => u.unitId === unitId
      ? { ...u, allottedTo: id, status: 'booked' as const }
      : u
    ));
  };


  const totalUnits  = units.length;
  const totalAvail  = units.filter(u => u.status === 'available').length;
  const totalBooked = units.filter(u => u.status === 'booked').length;
  const totalMaint  = units.filter(u => u.status === 'maintenance').length;

  return (
    <div className="space-y-5">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-wide">Vehicle Inventory & Registration</h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Bhauwala Hub Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time vehicle registration tracking, instant bookings allotment & clean spreadsheet reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle: Spreadsheet vs Cards */}
          <div className="flex items-center p-1 bg-white/[0.05] rounded-xl border border-white/[0.1]">
            <button
              onClick={() => setViewMode('sheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'sheet'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Spreadsheet View</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Model Cards View</span>
            </button>
          </div>

          {/* Quick Add Unit Button */}
          <button
            onClick={() => setIsSheetAddOpen(!isSheetAddOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Unit
          </button>

          {/* Export Clean Excel / CSV */}
          <button
            onClick={() => exportInventoryExcel(entries, bookings)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-emerald-500/20"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
            title="Download clean, well-spaced Excel spreadsheet file (.csv)"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* ── Summary Stats with Spacing ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fleet</span>
            <Package className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-orange-400">{totalUnits}</p>
          <p className="text-[10px] text-slate-500 mt-1">All registered units</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-300">{totalAvail}</p>
          <p className="text-[10px] text-emerald-400/70 mt-1">Ready for immediate pickup</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">On Rent / Booked</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-300">{totalBooked}</p>
          <p className="text-[10px] text-blue-400/70 mt-1">Allotted to active customers</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-300">{totalMaint}</p>
          <p className="text-[10px] text-amber-400/70 mt-1">Service & repair bay</p>
        </div>
      </div>

      {/* ── Add Unit Dropdown Drawer (Accessible Anywhere) ── */}
      {isSheetAddOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141a24] border border-orange-500/30 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Add New Vehicle Unit to Inventory</h3>
            </div>
            <button
              onClick={() => setIsSheetAddOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Select Model *
              </label>
              <select
                value={sheetAddVehicleId}
                onChange={e => setSheetAddVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs text-white bg-slate-900 border border-white/10 outline-none focus:border-orange-500 font-medium"
              >
                {VEHICLES.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.brand} · ₹{v.fullDayRent}/day)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Registration No. * (e.g. UK07 TA 1234)
              </label>
              <input
                type="text"
                value={sheetAddReg}
                onChange={e => setSheetAddReg(e.target.value.toUpperCase())}
                placeholder="UK07 TA 1234"
                className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-500 font-mono font-bold uppercase tracking-wider"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && addUnit(sheetAddVehicleId, sheetAddReg, sheetAddNotes)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Condition / Colour Notes
              </label>
              <input
                type="text"
                value={sheetAddNotes}
                onChange={e => setSheetAddNotes(e.target.value)}
                placeholder="e.g. Red, serviced, helmet attached"
                className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsSheetAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => addUnit(sheetAddVehicleId, sheetAddReg, sheetAddNotes)}
              disabled={!sheetAddReg.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Save Unit to Inventory
            </button>
          </div>
        </div>
      )}

      {/* ── Filters & Search Toolbar with Generous Spacing ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          {/* Search Box */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reg no, model, customer, notes…"
              className="bg-transparent text-xs text-white placeholder-gray-500 outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] overflow-x-auto">
            {(['all', 'bike', 'scooter', 'car'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  catFilter === c
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c === 'all' ? 'All Fleet' : c === 'bike' ? '🏍 Bikes' : c === 'scooter' ? '🛵 Scooties' : '🚗 Cars'}
              </button>
            ))}
          </div>

          {/* Status Filter (Especially handy in Spreadsheet View) */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] overflow-x-auto">
            {(['all', 'available', 'booked', 'maintenance', 'retired'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{viewMode === 'sheet' ? flattenedRows.length : entries.length}</span> {viewMode === 'sheet' ? 'registered units' : 'models'}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 1: ACCESSIBLE & CLEAN EXCEL SPREADSHEET TABLE ── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'sheet' ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/[0.08] text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Registration No.</th>
                  <th className="py-3.5 px-4">Vehicle Model</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Daily Rent</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Allotment / Customer</th>
                  <th className="py-3.5 px-4">Condition / Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {flattenedRows.map(({ unit, vehicle, allottedBooking }, index) => {
                  const isEditing = editingUnit === unit.unitId;
                  const st = STATUS_CONFIG[unit.status] || STATUS_CONFIG.available;

                  return (
                    <tr
                      key={unit.unitId}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        index % 2 === 1 ? 'bg-white/[0.01]' : 'bg-transparent'
                      }`}
                    >
                      {/* S.No */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-bold">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      {/* Registration Number */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editReg}
                            onChange={e => setEditReg(e.target.value.toUpperCase())}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 text-white border border-orange-400 outline-none uppercase w-36"
                          />
                        ) : (
                          <span className="font-black text-sm text-orange-300 tracking-wider bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 shadow-sm inline-block">
                            {unit.regNumber}
                          </span>
                        )}
                      </td>

                      {/* Vehicle Model */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{vehicle.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{vehicle.brand}</span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 inline-flex items-center gap-1">
                          {vehicle.category === 'bike' ? '🏍 Bike' : vehicle.category === 'scooter' ? '🛵 Scooty' : '🚗 Car'}
                        </span>
                      </td>

                      {/* Daily Rent */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ₹{vehicle.fullDayRent} <span className="text-[10px] text-slate-500 font-normal">/day</span>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as VehicleUnit['status'])}
                            className="px-2.5 py-1.5 rounded-lg text-xs text-white bg-slate-900 border border-white/20 outline-none"
                          >
                            <option value="available">🟢 Available</option>
                            <option value="booked">🔵 Booked</option>
                            <option value="maintenance">🟡 Maintenance</option>
                            <option value="retired">🔴 Retired</option>
                          </select>
                        ) : (
                          <select
                            value={unit.status}
                            onChange={e => updateUnitStatus(unit.unitId, e.target.value as VehicleUnit['status'])}
                            className="text-[11px] font-bold rounded-full px-2.5 py-1 outline-none border cursor-pointer transition-all"
                            style={{ background: st.bg, color: st.text, borderColor: st.border }}
                          >
                            <option value="available" className="bg-slate-900 text-green-400">🟢 Available</option>
                            <option value="booked" className="bg-slate-900 text-blue-400">🔵 Booked</option>
                            <option value="maintenance" className="bg-slate-900 text-yellow-400">🟡 Maintenance</option>
                            <option value="retired" className="bg-slate-900 text-red-400">🔴 Retired</option>
                          </select>
                        )}
                      </td>

                      {/* Allotment / Customer */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="space-y-1">
                          <select
                            value={
                              unit.allottedTo
                                ? activeBookings.some(b => b.id === unit.allottedTo)
                                  ? unit.allottedTo
                                  : `user:${unit.allottedTo}`
                                : ''
                            }
                            onChange={e => allotUnit(unit.unitId, e.target.value)}
                            className="px-2 py-1 rounded-lg text-[11px] text-white bg-slate-900 border border-white/10 outline-none w-full max-w-[230px] truncate"
                          >
                            <option value="">— Unassigned (Ready) —</option>

                            {activeBookings.length > 0 && (
                              <optgroup label="📋 Active Bookings">
                                {activeBookings.map(b => (
                                  <option key={b.id} value={b.id}>
                                    #{b.id.slice(-6)} · {b.customerName} ({b.pickupDate})
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            {signedInUsers.length > 0 && (
                              <optgroup label="👤 Signed-In Users">
                                {signedInUsers.map(u => (
                                  <option key={u.uid} value={`user:${u.uid}`}>
                                    {newUserUids.has(u.uid) ? '🆕 ' : ''}{u.name || 'Unknown'}{u.phone ? ` · ${u.phone}` : ''}{u.email ? ` · ${u.email}` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>

                          {unit.allottedTo && (() => {
                            const booking = activeBookings.find(b => b.id === unit.allottedTo);
                            const user = signedInUsers.find(u => u.uid === unit.allottedTo);
                            if (booking) return (
                              <div className="text-[10px] text-blue-300 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="font-bold">{booking.customerName}</span>
                                <span className="text-slate-400">({booking.customerPhone})</span>
                              </div>
                            );
                            if (user) return (
                              <div className="text-[10px] font-medium flex items-center gap-1.5 flex-wrap" style={{ color: newUserUids.has(user.uid) ? '#fb923c' : '#86efac' }}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: newUserUids.has(user.uid) ? '#fb923c' : '#4ade80' }} />
                                <span className="font-bold">{user.name || 'User'}</span>
                                {user.phone && <span className="text-slate-400">{user.phone}</span>}
                                {newUserUids.has(user.uid) && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}>New</span>
                                )}
                              </div>
                            );
                            return null;
                          })()}
                        </div>
                      </td>


                      {/* Notes / Condition */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNotes}
                            onChange={e => setEditNotes(e.target.value)}
                            placeholder="Condition notes…"
                            className="px-2 py-1 rounded text-xs text-white bg-white/10 border border-white/20 outline-none w-full"
                          />
                        ) : (
                          <span className="text-slate-300 text-[11px] truncate block" title={unit.notes}>
                            {unit.notes || <span className="text-slate-600 italic">None</span>}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => saveEdit(unit.unitId)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => setEditingUnit(null)}
                              className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white bg-white/5 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(unit)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                              title="Edit registration and notes"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeUnit(unit.unitId)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                              title="Remove unit from fleet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {flattenedRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-semibold">No registered units match your filter.</p>
                      <button
                        onClick={() => setIsSheetAddOpen(true)}
                        className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register First Unit
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* ── VIEW 2: GROUPED MODEL ACCORDION CARDS ── */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div className="space-y-3">
          {entries.map(({ vehicle, units: vUnits }) => {
            const isOpen = expandedVehicle === vehicle.id;
            const avail  = vUnits.filter(u => u.status === 'available').length;
            const booked = vUnits.filter(u => u.status === 'booked').length;

            return (
              <div
                key={vehicle.id}
                className="rounded-2xl overflow-hidden transition-all bg-[#0f141d] border border-white/[0.08] hover:border-white/[0.15]"
              >
                {/* Header Row */}
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-all"
                  onClick={() => setExpandedV(isOpen ? null : vehicle.id)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: vehicle.category === 'car' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)' }}
                  >
                    {vehicle.category === 'car'
                      ? <Car className="w-5 h-5 text-blue-400" />
                      : <Bike className="w-5 h-5 text-purple-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{vehicle.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{vehicle.brand} · ₹{vehicle.fullDayRent}/day · Bhauwala Hub</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap justify-end">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {avail} Available
                    </span>
                    {booked > 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {booked} Booked
                      </span>
                    )}
                    <span className="text-xs font-bold font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                      {vUnits.length} Total Units
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Unit List */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-3 border-t border-white/[0.06] pt-4">
                    {vUnits.length === 0 && (
                      <div className="flex items-center gap-2 py-4 text-xs rounded-xl px-4 text-slate-400 bg-white/[0.02]">
                        <Package className="w-4 h-4 text-slate-500" />
                        No units registered under this model yet. Add registration numbers below.
                      </div>
                    )}

                    {vUnits.map(unit => {
                      const st = STATUS_CONFIG[unit.status] || STATUS_CONFIG.available;
                      const isEditing = editingUnit === unit.unitId;
                      const allottedB = activeBookings.find(b => b.id === unit.allottedTo);

                      return (
                        <div key={unit.unitId} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-1">Registration No.</label>
                                  <input
                                    type="text"
                                    value={editReg}
                                    onChange={e => setEditReg(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono uppercase"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-1">Status</label>
                                  <select
                                    value={editStatus}
                                    onChange={e => setEditStatus(e.target.value as VehicleUnit['status'])}
                                    className="w-full px-3 py-2 rounded-lg text-xs text-white bg-gray-900 border border-white/10 outline-none"
                                  >
                                    <option value="available">🟢 Available</option>
                                    <option value="booked">🔵 Booked</option>
                                    <option value="maintenance">🟡 Maintenance</option>
                                    <option value="retired">🔴 Retired</option>
                                  </select>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                                placeholder="Notes (colour, condition…)"
                                className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(unit.unitId)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                                <button
                                  onClick={() => setEditingUnit(null)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 bg-white/5 transition-all"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="font-mono text-sm font-black text-orange-300 bg-black/40 px-2.5 py-0.5 rounded border border-white/10">
                                    {unit.regNumber}
                                  </span>
                                  <span
                                    className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border"
                                    style={{ background: st.bg, color: st.text, borderColor: st.border }}
                                  >
                                    {st.label}
                                  </span>
                                  {unit.notes && (
                                    <span className="text-xs text-slate-400">{unit.notes}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                  <span className="text-slate-500 text-[11px]">Allotment:</span>
                                  <select
                                    value={unit.allottedTo || ''}
                                    onChange={e => allotUnit(unit.unitId, e.target.value)}
                                    className="px-2.5 py-1 rounded-lg text-xs text-white bg-gray-900 border border-white/10 outline-none max-w-[260px]"
                                  >
                                    <option value="">— Unassigned (Available) —</option>
                                    {activeBookings.map(b => (
                                      <option key={b.id} value={b.id}>
                                        #{b.id.slice(-6)} · {b.customerName} · {b.pickupDate}
                                      </option>
                                    ))}
                                  </select>
                                  {allottedB && (
                                    <span className="text-xs font-bold text-blue-400">
                                      → {allottedB.customerName} ({allottedB.customerPhone})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => startEdit(unit)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeUnit(unit.unitId)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Unit to this specific vehicle model */}
                    {addingFor === vehicle.id ? (
                      <div className="p-4 rounded-xl space-y-3 bg-orange-500/10 border border-orange-500/30">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                          Register New Unit for {vehicle.name}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Registration No. *</label>
                            <input
                              type="text"
                              value={newReg}
                              onChange={e => setNewReg(e.target.value.toUpperCase())}
                              placeholder="e.g. UK07 TA 1234"
                              className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400 font-mono uppercase font-bold"
                              autoFocus
                              onKeyDown={e => e.key === 'Enter' && addUnit(vehicle.id, newReg, newNotes)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1">Notes (colour, condition)</label>
                            <input
                              type="text"
                              value={newNotes}
                              onChange={e => setNewNotes(e.target.value)}
                              placeholder="e.g. Black, new tyres, 2 helmets"
                              className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-orange-400"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addUnit(vehicle.id, newReg, newNotes)}
                            disabled={!newReg.trim()}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 transition-all disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Unit
                          </button>
                          <button
                            onClick={() => { setAddingFor(null); setNewReg(''); setNewNotes(''); }}
                            className="px-3 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-white/5 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingFor(vehicle.id); setNewReg(''); setNewNotes(''); }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold w-full transition-all hover:bg-orange-500/10 border border-dashed border-orange-500/30 text-orange-400 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Vehicle Unit / Registration No.
                      </button>
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
