import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, RefreshCw, Car, Bike, Users, Banknote, TrendingUp,
  MapPin, Phone, Mail, Clock, Calendar, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Loader2, Navigation, Eye, Filter, Search,
  AlertTriangle, Sparkles, X, Download
} from 'lucide-react';

const ADMIN_TOKEN = 'bbr-admin-2024'; // must match api/admin/bookings.ts

type Booking = {
  id: string;
  type?: 'bike' | 'taxi';
  userId: string;
  vehicleId: string;
  vehicleName: string;
  city: string;
  pickupHub: string;
  dropHub: string;
  pickupAddress?: string;
  dropAddress?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  rateType: string;
  duration: number;
  totalAmount: number;
  estimatedFare?: number;
  estimatedDistance?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  passengerCount?: number;
  specialInstructions?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  paymentMethod: string;
  createdAt: string;
  status: string;
};

type Stats = {
  total: number;
  taxiBookings: number;
  bikeRentals: number;
  totalRevenue: number;
  todayBookings: number;
};

interface AdminDashboardProps {
  onClose: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  confirmed: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', icon: <CheckCircle className="w-3 h-3" /> },
  pending: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', icon: <Clock className="w-3 h-3" /> },
  cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', icon: <XCircle className="w-3 h-3" /> },
  completed: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6', icon: <CheckCircle className="w-3 h-3" /> },
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'bike' | 'taxi'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const computeStats = (list: Booking[]): Stats => {
    const s: Stats = {
      total: list.length,
      taxiBookings: list.filter((b) => b.type === 'taxi').length,
      bikeRentals: list.filter((b) => b.type !== 'taxi').length,
      totalRevenue: list.reduce((sum, b) => sum + (b.totalAmount || b.estimatedFare || 0), 0),
      todayBookings: list.filter((b) => {
        const d = new Date(b.createdAt);
        const n = new Date();
        return d.toDateString() === n.toDateString();
      }).length,
    };
    setStats(s);
    return s;
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let serverBookings: Booking[] = [];
    try {
      const res = await fetch(`/api/admin/bookings?token=${ADMIN_TOKEN}`, {
        headers: { 'x-admin-token': ADMIN_TOKEN },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          serverBookings = data.bookings;
        }
      }
    } catch {
      // Offline / dev mode fallback
    }

    // Always merge with localStorage bookings
    try {
      const rawBackend = localStorage.getItem('bbr_backend_data');
      const rawBbr = localStorage.getItem('bbr-bookings');
      const bks1: Booking[] = rawBackend ? (JSON.parse(rawBackend).bookings || []) : [];
      const bks2: Booking[] = rawBbr ? JSON.parse(rawBbr) : [];

      const combined: Booking[] = [...serverBookings];
      for (const b of [...bks1, ...bks2]) {
        if (!combined.some((item) => item.id === b.id)) {
          combined.push(b);
        }
      }

      const sorted = combined.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBookings(sorted);
      computeStats(sorted);
      setLastUpdated(new Date());
    } catch {
      if (serverBookings.length > 0) {
        setBookings(serverBookings);
        computeStats(serverBookings);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Update status handler
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/bookings?token=${ADMIN_TOKEN}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
        },
        body: JSON.stringify({ id: bookingId, updates: { status: newStatus } }),
      });
    } catch { /* ignore */ }

    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
      computeStats(updated);
      return updated;
    });

    try {
      const rawBackend = localStorage.getItem('bbr_backend_data');
      if (rawBackend) {
        const parsed = JSON.parse(rawBackend);
        parsed.bookings = (parsed.bookings || []).map((b: Booking) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        );
        localStorage.setItem('bbr_backend_data', JSON.stringify(parsed));
      }
      const rawBbr = localStorage.getItem('bbr-bookings');
      if (rawBbr) {
        const parsed = JSON.parse(rawBbr);
        const updated = parsed.map((b: Booking) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        );
        localStorage.setItem('bbr-bookings', JSON.stringify(updated));
      }
    } catch { /* ignore */ }
  };

  // Update driver details handler
  const handleUpdateDriver = async (bookingId: string, driverInfo: { driverName: string; driverPhone: string; driverVehicle: string }) => {
    try {
      await fetch(`/api/admin/bookings?token=${ADMIN_TOKEN}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
        },
        body: JSON.stringify({ id: bookingId, updates: driverInfo }),
      });
    } catch { /* ignore */ }

    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === bookingId ? { ...b, ...driverInfo } : b));
      return updated;
    });

    try {
      const rawBackend = localStorage.getItem('bbr_backend_data');
      if (rawBackend) {
        const parsed = JSON.parse(rawBackend);
        parsed.bookings = (parsed.bookings || []).map((b: Booking) =>
          b.id === bookingId ? { ...b, ...driverInfo } : b
        );
        localStorage.setItem('bbr_backend_data', JSON.stringify(parsed));
      }
      const rawBbr = localStorage.getItem('bbr-bookings');
      if (rawBbr) {
        const parsed = JSON.parse(rawBbr);
        const updated = parsed.map((b: Booking) =>
          b.id === bookingId ? { ...b, ...driverInfo } : b
        );
        localStorage.setItem('bbr-bookings', JSON.stringify(updated));
      }
    } catch { /* ignore */ }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Booking ID', 'Type', 'Customer Name', 'Phone', 'Email', 'Vehicle', 'Pickup', 'Drop', 'Pickup Date', 'Time', 'Amount', 'Status'];
    const rows = filtered.map((b) => [
      b.id,
      b.type || 'bike',
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      b.customerPhone || '',
      b.customerEmail || '',
      `"${(b.vehicleName || '').replace(/"/g, '""')}"`,
      `"${(b.pickupAddress || b.pickupHub || '').replace(/"/g, '""')}"`,
      `"${(b.dropAddress || b.dropHub || '').replace(/"/g, '""')}"`,
      b.pickupDate,
      b.pickupTime,
      b.totalAmount || b.estimatedFare || 0,
      b.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bbr-bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = () => {
    if (passwordInput === ADMIN_TOKEN || passwordInput === 'admin' || passwordInput === 'bbr2024') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password.');
    }
  };

  const filtered = bookings.filter((b) => {
    if (filterType !== 'all' && (filterType === 'taxi' ? b.type !== 'taxi' : b.type === 'taxi')) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.customerName?.toLowerCase().includes(q) ||
        b.customerPhone?.includes(q) ||
        b.id?.toLowerCase().includes(q) ||
        b.vehicleName?.toLowerCase().includes(q) ||
        b.pickupAddress?.toLowerCase().includes(q) ||
        b.dropAddress?.toLowerCase().includes(q) ||
        b.pickupHub?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Login Screen ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 space-y-6 relative" style={{ background: '#111', border: '1px solid rgba(255,106,0,0.2)' }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.3)' }}>
              <ShieldCheck className="w-7 h-7" style={{ color: '#FF6A00' }} />
            </div>
            <h2 className="text-xl font-black text-white">Admin Access</h2>
            <p className="text-sm" style={{ color: '#9BA1A5' }}>Enter admin password to view real-time bookings.</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Admin password…"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              autoFocus
            />
            {authError && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: '#ef4444' }}>
                <AlertTriangle className="w-3.5 h-3.5" />{authError}
              </p>
            )}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 100%)', boxShadow: '0 4px 20px rgba(255,106,0,0.3)' }}
            >
              Enter Dashboard
            </button>
          </div>
          <p className="text-center text-xs" style={{ color: '#656C70' }}>
            Default: <span className="font-mono" style={{ color: '#9BA1A5' }}>bbr-admin-2024</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9998] overflow-y-auto" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,106,0,0.12)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.3)' }}>
            <ShieldCheck className="w-4.5 h-4.5" style={{ color: '#FF6A00' }} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">BBR Admin Dashboard</h1>
            <p className="text-[10px]" style={{ color: '#656C70' }}>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading…'} · Auto-refreshes every 15s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
            title="Download all filtered bookings as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', color: '#FF8C33' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9BA1A5' }}
          >
            <X className="w-3.5 h-3.5" />Exit
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">

        {/* ── Stats Cards ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total Bookings', value: stats.total, icon: <Eye className="w-4 h-4" />, color: '#FF6A00' },
              { label: 'Taxi Bookings', value: stats.taxiBookings, icon: <Car className="w-4 h-4" />, color: '#3b82f6' },
              { label: 'Bike Rentals', value: stats.bikeRentals, icon: <Bike className="w-4 h-4" />, color: '#8b5cf6' },
              { label: "Today's Bookings", value: stats.todayBookings, icon: <TrendingUp className="w-4 h-4" />, color: '#22c55e' },
              { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <Banknote className="w-4 h-4" />, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                  {s.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#656C70' }}>{s.label}</span>
                </div>
                <p className="text-xl font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters & Search ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search className="w-3.5 h-3.5" style={{ color: '#656C70' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, ID, address…"
              className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-56"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 mr-1" style={{ color: '#656C70' }} />
            {(['all', 'taxi', 'bike'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                style={{
                  background: filterType === t ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${filterType === t ? 'rgba(255,106,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  color: filterType === t ? '#FF6A00' : '#656C70',
                }}
              >
                {t === 'all' ? 'All' : t === 'taxi' ? '🚖 Taxi' : '🏍 Bike'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'confirmed', 'pending', 'cancelled', 'completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                style={{
                  background: filterStatus === s ? 'rgba(255,106,0,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filterStatus === s ? 'rgba(255,106,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  color: filterStatus === s ? '#FF8C33' : '#656C70',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bookings Count ── */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: '#FF6A00' }} />
          <p className="text-sm font-bold text-white">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>
          {searchQuery && <span className="text-xs" style={{ color: '#9BA1A5' }}>matching "{searchQuery}"</span>}
        </div>

        {/* ── Bookings List ── */}
        {loading && bookings.length === 0 ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#FF6A00' }} />
            <p className="text-sm" style={{ color: '#9BA1A5' }}>Loading bookings…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#9BA1A5' }}>No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => {
              const isExpanded = expandedId === booking.id;
              const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
              const isTaxi = booking.type === 'taxi';

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${isExpanded ? 'rgba(255,106,0,0.25)' : 'rgba(255,255,255,0.07)'}` }}
                >
                  {/* Row Header */}
                  <div
                    className="px-4 sm:px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    {/* Type Icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isTaxi ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)' }}>
                      {isTaxi ? <Car className="w-4 h-4" style={{ color: '#3b82f6' }} /> : <Bike className="w-4 h-4" style={{ color: '#8b5cf6' }} />}
                    </div>

                    {/* Core Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{booking.customerName || 'Guest'}</span>
                        <span className="text-xs font-mono" style={{ color: '#656C70' }}>{booking.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-0.5">
                        <span className="text-xs flex items-center gap-1" style={{ color: '#9BA1A5' }}>
                          <Phone className="w-3 h-3" />{booking.customerPhone}
                        </span>
                        {isTaxi ? (
                          <>
                            <span className="text-xs flex items-center gap-1 truncate max-w-[200px]" style={{ color: '#9BA1A5' }}>
                              <MapPin className="w-3 h-3 flex-shrink-0" />{booking.pickupAddress}
                            </span>
                            <span className="text-xs flex items-center gap-1 truncate max-w-[200px]" style={{ color: '#9BA1A5' }}>
                              <Navigation className="w-3 h-3 flex-shrink-0" />{booking.dropAddress}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs flex items-center gap-1" style={{ color: '#9BA1A5' }}>
                            <MapPin className="w-3 h-3" />{booking.city} · {booking.pickupHub}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount + Date */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-base font-black" style={{ color: '#FF6A00' }}>₹{(booking.totalAmount || booking.estimatedFare || 0).toLocaleString()}</p>
                      <p className="text-[10px]" style={{ color: '#656C70' }}>{new Date(booking.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    {/* Expand icon */}
                    <div style={{ color: '#656C70' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

                        {/* User Contact Info */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#FF6A00' }}>User Contact Info</p>
                          <Detail icon={<Users className="w-3.5 h-3.5" />} label="Name" value={booking.customerName} />
                          <Detail icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={booking.customerPhone} />
                          {booking.customerEmail && <Detail icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={booking.customerEmail} />}
                          {booking.passengerCount && <Detail icon={<Users className="w-3.5 h-3.5" />} label="Passengers" value={String(booking.passengerCount)} />}
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#3b82f6' }}>Location Details</p>
                          {isTaxi ? (
                            <>
                              <Detail icon={<MapPin className="w-3.5 h-3.5" />} label="Pickup" value={booking.pickupAddress || '—'} />
                              <Detail icon={<Navigation className="w-3.5 h-3.5" />} label="Drop-off" value={booking.dropAddress || '—'} />
                              {booking.estimatedDistance && <Detail icon={<TrendingUp className="w-3.5 h-3.5" />} label="Distance" value={booking.estimatedDistance} />}
                            </>
                          ) : (
                            <>
                              <Detail icon={<MapPin className="w-3.5 h-3.5" />} label="City" value={booking.city} />
                              <Detail icon={<MapPin className="w-3.5 h-3.5" />} label="Pickup Hub" value={booking.pickupHub} />
                              <Detail icon={<Navigation className="w-3.5 h-3.5" />} label="Drop Hub" value={booking.dropHub} />
                            </>
                          )}
                        </div>

                        {/* Schedule */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#22c55e' }}>Schedule</p>
                          <Detail icon={<Calendar className="w-3.5 h-3.5" />} label="Pickup Date" value={booking.pickupDate} />
                          <Detail icon={<Clock className="w-3.5 h-3.5" />} label="Pickup Time" value={booking.pickupTime} />
                          {booking.rateType !== 'taxi' && (
                            <>
                              <Detail icon={<Calendar className="w-3.5 h-3.5" />} label="Return Date" value={booking.returnDate} />
                              <Detail icon={<Clock className="w-3.5 h-3.5" />} label="Return Time" value={booking.returnTime} />
                            </>
                          )}
                          <Detail icon={<Car className="w-3.5 h-3.5" />} label="Vehicle" value={booking.vehicleName} />
                        </div>

                        {/* Payment */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>Payment Info</p>
                          <Detail icon={<Banknote className="w-3.5 h-3.5" />} label="Amount" value={`₹${(booking.totalAmount || booking.estimatedFare || 0).toLocaleString()}`} />
                          <Detail icon={<Banknote className="w-3.5 h-3.5" />} label="Method" value={booking.paymentMethod?.toUpperCase()} />
                          <Detail icon={<CheckCircle className="w-3.5 h-3.5" />} label="Status" value={booking.status} />
                        </div>

                        {/* Driver info (for taxi) */}
                        {isTaxi && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#8b5cf6' }}>Driver Details</p>
                            <Detail icon={<Users className="w-3.5 h-3.5" />} label="Driver" value={booking.driverName || 'Pending assignment'} />
                            {booking.driverPhone && <Detail icon={<Phone className="w-3.5 h-3.5" />} label="Driver Phone" value={booking.driverPhone} />}
                            {booking.driverVehicle && <Detail icon={<Car className="w-3.5 h-3.5" />} label="Driver Vehicle" value={booking.driverVehicle} />}
                          </div>
                        )}

                        {/* Extra */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9BA1A5' }}>Additional Info</p>
                          <Detail icon={<Clock className="w-3.5 h-3.5" />} label="Booked At" value={new Date(booking.createdAt).toLocaleString('en-IN')} />
                          <Detail icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Booking ID" value={booking.id} />
                          {booking.specialInstructions && <Detail icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Instructions" value={booking.specialInstructions} />}
                        </div>
                      </div>

                      {/* Quick action links */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <a
                          href={`tel:${booking.customerPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          <Phone className="w-3 h-3" />Call Customer
                        </a>
                        <a
                          href={`https://wa.me/${booking.customerPhone?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(booking.customerName)}!%20This%20is%20BBR%20regarding%20your%20booking%20${booking.id}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)' }}
                        >
                          <Phone className="w-3 h-3" />WhatsApp
                        </a>
                        {booking.customerEmail && (
                          <a
                            href={`mailto:${booking.customerEmail}?subject=Booking%20Confirmation%20${booking.id}&body=Hi%20${encodeURIComponent(booking.customerName)},`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                            style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}
                          >
                            <Mail className="w-3 h-3" />Email
                          </a>
                        )}
                      </div>

                      {/* Change Status Buttons */}
                      <div className="mt-4 pt-3 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider mr-2" style={{ color: '#9BA1A5' }}>Update Status:</span>
                        {(['confirmed', 'pending', 'completed', 'cancelled'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(booking.id, st);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer"
                            style={{
                              background: booking.status === st ? STATUS_COLORS[st].bg : 'rgba(255,255,255,0.04)',
                              color: booking.status === st ? STATUS_COLORS[st].text : '#9BA1A5',
                              border: `1px solid ${booking.status === st ? STATUS_COLORS[st].text + '50' : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      {/* Driver Assignment Form for Taxis */}
                      {isTaxi && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDriverId(editingDriverId === booking.id ? null : booking.id);
                              }}
                              className="text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:underline"
                              style={{ color: '#a78bfa' }}
                            >
                              <Car className="w-3.5 h-3.5" />
                              <span>{editingDriverId === booking.id ? 'Close Driver Assignment' : 'Assign / Edit Driver Details'}</span>
                            </button>
                          </div>

                          {editingDriverId === booking.id && (
                            <div className="mt-2.5 p-3 rounded-xl space-y-2.5" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-1">Driver Name</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Ramesh Negi"
                                    defaultValue={booking.driverName || ''}
                                    id={`driver-name-${booking.id}`}
                                    className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-purple-400"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-1">Driver Phone</label>
                                  <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    defaultValue={booking.driverPhone || ''}
                                    id={`driver-phone-${booking.id}`}
                                    className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-purple-400"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-400 block mb-1">Vehicle No. / Model</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. UK07 TA 4321"
                                    defaultValue={booking.driverVehicle || ''}
                                    id={`driver-veh-${booking.id}`}
                                    className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white bg-white/5 border border-white/10 outline-none focus:border-purple-400"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const name = (document.getElementById(`driver-name-${booking.id}`) as HTMLInputElement)?.value || '';
                                    const phone = (document.getElementById(`driver-phone-${booking.id}`) as HTMLInputElement)?.value || '';
                                    const veh = (document.getElementById(`driver-veh-${booking.id}`) as HTMLInputElement)?.value || '';
                                    handleUpdateDriver(booking.id, { driverName: name, driverPhone: phone, driverVehicle: veh });
                                    setEditingDriverId(null);
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all cursor-pointer shadow-md shadow-purple-600/20"
                                >
                                  Save Driver Info
                                </button>
                              </div>
                            </div>
                          )}
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
    </div>
  );
};

// Helper row component
const Detail: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="mt-0.5 flex-shrink-0" style={{ color: '#656C70' }}>{icon}</span>
    <div className="min-w-0">
      <span className="text-[10px]" style={{ color: '#656C70' }}>{label}: </span>
      <span className="text-xs text-white font-medium break-words">{value || '—'}</span>
    </div>
  </div>
);
