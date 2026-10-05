import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Phone, Mail, Shield, ShieldCheck, Search,
  Download, Eye, EyeOff, Calendar, MapPin
} from 'lucide-react';

interface UserProfile {
  uid: string;
  name: string;
  phone?: string;
  email?: string;
  photoURL?: string;
  authProvider?: string;
  kyc?: {
    name?: string;
    dob?: string;
    dlNumber?: string;
    aadhaarNumber?: string;
    address?: string;
    verifiedAt?: string;
  } | null;
  createdAt?: string;
}

function loadAllUsers(): UserProfile[] {
  try {
    const users: UserProfile[] = [];
    const addUser = (parsed: unknown) => {
      if (
        parsed &&
        typeof parsed === 'object' &&
        (parsed as UserProfile).uid &&
        !users.some(x => x.uid === (parsed as UserProfile).uid)
      ) {
        users.push(parsed as UserProfile);
      }
    };

    // Scan all localStorage keys for any matching session pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const isSessionKey =
        key.startsWith('bbr_user_session_') ||
        key === 'bbr_user_session' ||
        key === 'bbr-user-profile';       // <─ the key firebase.ts actually writes
      if (isSessionKey) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) addUser(JSON.parse(raw));
        } catch { /* skip bad entries */ }
      }
    }

    // Also pull from bbr_backend_data.users (cumulative store across sessions)
    try {
      const raw = localStorage.getItem('bbr_backend_data');
      if (raw) {
        const data = JSON.parse(raw) as { users?: unknown[] };
        if (Array.isArray(data.users)) {
          data.users.forEach(u => addUser(u));
        }
      }
    } catch { /* skip */ }

    // Sort: most-recently created first
    users.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return users;
  } catch {
    return [];
  }
}

// Export users as CSV
function exportUsersCSV(users: UserProfile[]) {
  const rows: string[][] = [
    ['UID', 'Name', 'Phone', 'Email', 'Auth Provider', 'KYC Verified', 'DL Number', 'Aadhaar', 'DOB', 'Address', 'KYC Date'],
  ];
  for (const u of users) {
    rows.push([
      u.uid,
      JSON.stringify(u.name || ''),
      u.phone || '',
      u.email || '',
      u.authProvider || '',
      u.kyc ? 'Yes' : 'No',
      u.kyc?.dlNumber || '',
      u.kyc?.aadhaarNumber ? '****' + u.kyc.aadhaarNumber.slice(-4) : '',
      u.kyc?.dob || '',
      JSON.stringify(u.kyc?.address || ''),
      u.kyc?.verifiedAt ? new Date(u.kyc.verifiedAt).toLocaleDateString('en-IN') : '',
    ]);
  }
  const csv = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
  const link = document.createElement('a');
  link.href = encodeURI(csv);
  link.download = `bbr-users-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface Booking {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  vehicleName: string;
  pickupDate: string;
  totalAmount?: number;
  estimatedFare?: number;
  status: string;
}

interface Props {
  bookings: Booking[];
}

export const UsersTab: React.FC<Props> = ({ bookings }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [expandedUid, setExpandedUid] = useState<string | null>(null);
  const [hideSensitive, setHideSensitive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refresh = useCallback(() => {
    setUsers(loadAllUsers());
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    refresh();

    // Cross-tab: fires when another tab writes to localStorage
    const onStorageEvent = (e: StorageEvent) => {
      if (
        e.key?.startsWith('bbr_user_session_') ||
        e.key === 'bbr_user_session' ||
        e.key === 'bbr-user-profile' ||
        e.key === 'bbr_backend_data'
      ) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorageEvent);

    // Same-tab: fires immediately when user signs in on this tab
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('bbr_user_updates');
      bc.onmessage = (evt) => {
        if (evt.data?.type === 'USER_SIGNED_IN') {
          refresh();
        }
      };
    } catch { /* not supported */ }

    return () => {
      window.removeEventListener('storage', onStorageEvent);
      bc?.close();
    };
  }, [refresh]);

  // Build user booking history from bookings list
  const getUserBookings = (user: UserProfile) =>
    bookings.filter(b =>
      b.userId === user.uid ||
      b.customerPhone === user.phone ||
      b.customerName?.toLowerCase() === user.name?.toLowerCase()
    );

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.uid?.includes(q)
    );
  });

  const mask = (val?: string, chars = 4) =>
    val ? (hideSensitive ? '*'.repeat(val.length - chars) + val.slice(-chars) : val) : 'â€”';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white">User Information</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[11px]" style={{ color: '#656C70' }}>
            {users.length} registered users &middot; updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setHideSensitive(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
          >
            {hideSensitive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {hideSensitive ? 'Show All' : 'Hide Sensitive'}
          </button>
          <button
            onClick={() => exportUsersCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Users',   value: users.length, color: '#FF6A00' },
          { label: 'KYC Verified',  value: users.filter(u => u.kyc).length, color: '#22c55e' },
          { label: 'Without KYC',   value: users.filter(u => !u.kyc).length, color: '#fbbf24' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#656C70' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#656C70' }} />
        <input
          type="text" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, email or UIDâ€¦"
          className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1"
        />
      </div>

      {/* User List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Users className="w-8 h-8 mx-auto" style={{ color: '#656C70' }} />
          <p className="text-sm" style={{ color: '#9BA1A5' }}>
            {users.length === 0
              ? 'No users found in local session data. Users appear here after signing in.'
              : 'No users match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(user => {
            const isOpen = expandedUid === user.uid;
            const userBookings = getUserBookings(user);
            const totalSpend = userBookings.reduce((s, b) => s + (b.totalAmount || b.estimatedFare || 0), 0);

            return (
              <div
                key={user.uid}
                className="rounded-2xl overflow-hidden transition-all"
                style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${isOpen ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.07)'}` }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-all"
                  onClick={() => setExpandedUid(isOpen ? null : user.uid)}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-black"
                    style={{ background: 'rgba(255,106,0,0.12)', color: '#FF6A00' }}
                  >
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{user.name || 'Unknown'}</span>
                      {user.kyc && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                          <ShieldCheck className="w-2.5 h-2.5" /> KYC
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {user.phone && <span className="text-xs flex items-center gap-1" style={{ color: '#9BA1A5' }}><Phone className="w-3 h-3" />{user.phone}</span>}
                      {user.email && <span className="text-xs flex items-center gap-1 truncate" style={{ color: '#9BA1A5' }}><Mail className="w-3 h-3" />{user.email}</span>}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black" style={{ color: '#FF6A00' }}>{userBookings.length} booking{userBookings.length !== 1 ? 's' : ''}</p>
                    {totalSpend > 0 && <p className="text-[9px]" style={{ color: '#656C70' }}>â‚¹{totalSpend.toLocaleString()} total</p>}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Basic Info */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#FF6A00' }}>Basic Info</p>
                        <InfoRow label="Name" value={user.name} />
                        <InfoRow label="Phone" value={user.phone} />
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Auth" value={user.authProvider} />
                        <InfoRow label="UID" value={mask(user.uid, 8)} />
                      </div>

                      {/* KYC Details */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#22c55e' }}>
                          KYC / Documents
                          {user.kyc && <span className="ml-1.5 font-bold" style={{ color: '#22c55e' }}>âœ“ Verified</span>}
                        </p>
                        {user.kyc ? (
                          <>
                            <InfoRow label="DL Number" value={mask(user.kyc.dlNumber)} />
                            <InfoRow label="Aadhaar" value={mask(user.kyc.aadhaarNumber)} />
                            <InfoRow label="DOB" value={user.kyc.dob} />
                            <InfoRow label="Address" value={user.kyc.address} />
                            <InfoRow label="Verified At" value={user.kyc.verifiedAt ? new Date(user.kyc.verifiedAt).toLocaleDateString('en-IN') : undefined} />
                          </>
                        ) : (
                          <p className="text-xs" style={{ color: '#fbbf24' }}>âš  KYC not completed</p>
                        )}
                      </div>

                      {/* Booking History */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#3b82f6' }}>Booking History</p>
                        {userBookings.length === 0 ? (
                          <p className="text-xs" style={{ color: '#656C70' }}>No bookings found.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {userBookings.map(b => (
                              <div key={b.id} className="p-2 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="font-bold text-white">{b.vehicleName}</p>
                                <p style={{ color: '#9BA1A5' }}>{b.pickupDate} Â· â‚¹{(b.totalAmount || b.estimatedFare || 0).toLocaleString()}</p>
                                <span className="text-[10px] font-bold" style={{ color: b.status === 'confirmed' ? '#22c55e' : b.status === 'cancelled' ? '#ef4444' : '#fbbf24' }}>
                                  {b.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {user.phone && (
                        <a
                          href={'tel:' + user.phone}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                      {user.phone && (
                        <a
                          href={`https://wa.me/${user.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${user.name || ''}! This is BBR Rental Dehradun.`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)' }}
                        >
                          <Phone className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                    </div>
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

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-start gap-1.5">
    <span className="text-[10px] min-w-[70px]" style={{ color: '#656C70' }}>{label}:</span>
    <span className="text-xs text-white font-medium break-all">{value || 'â€”'}</span>
  </div>
);

