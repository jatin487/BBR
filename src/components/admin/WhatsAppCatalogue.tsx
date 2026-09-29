import React, { useState } from 'react';
import {
  Phone, MessageSquare, Share2, CheckCircle2, Clock, Users,
  Search, Plus, Minus, X, ArrowUpRight
} from 'lucide-react';
import { VEHICLES } from '../../data/vehicles';
import { Vehicle } from '../../types';

export interface BookingRentalInfo {
  id: string;
  type?: 'bike' | 'taxi';
  vehicleId?: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupHub: string;
  dropHub?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface WhatsAppCatalogueProps {
  bookings: BookingRentalInfo[];
  onUpdateBookingStatus?: (id: string, status: string) => void;
}

interface ManualRental {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  returnTime: string;
  hub: string;
  notes?: string;
  createdAt: string;
}

export const WhatsAppCatalogue: React.FC<WhatsAppCatalogueProps> = ({ bookings, onUpdateBookingStatus }) => {
  // Admin WhatsApp phone configuration
  const [adminPhone, setAdminPhone] = useState<string>(() => {
    return localStorage.getItem('bbr_admin_whatsapp') || '919876543210';
  });
  const [isEditingAdminPhone, setIsEditingAdminPhone] = useState(false);
  const [adminPhoneInput, setAdminPhoneInput] = useState(adminPhone);

  // Manual rentals state persisted in localStorage
  const [manualRentals, setManualRentals] = useState<ManualRental[]>(() => {
    try {
      const saved = localStorage.getItem('bbr_manual_rentals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Stock overrides (total units per vehicle)
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bbr_fleet_stock_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'scooter' | 'bike'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'on_rent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Rent out modal state
  const [rentingVehicle, setRentingVehicle] = useState<Vehicle | null>(null);
  const [rentCustomerName, setRentCustomerName] = useState('');
  const [rentCustomerPhone, setRentCustomerPhone] = useState('');
  const [rentReturnDate, setRentReturnDate] = useState('');
  const [rentReturnTime, setRentReturnTime] = useState('18:00');
  const [rentHub, setRentHub] = useState('Dehradun Main Hub');
  const [rentNotes, setRentNotes] = useState('');

  // Share catalog toast / copied state
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Only include 2-wheelers (bikes & scooties)
  const twoWheelers = VEHICLES.filter((v) => v.category === 'bike' || v.category === 'scooter');

  // Save admin phone
  const saveAdminPhone = () => {
    const clean = adminPhoneInput.replace(/\D/g, '');
    const finalPhone = clean.length === 10 ? `91${clean}` : clean;
    setAdminPhone(finalPhone);
    localStorage.setItem('bbr_admin_whatsapp', finalPhone);
    setIsEditingAdminPhone(false);
  };

  // Save manual rentals to localStorage
  const updateManualRentals = (updated: ManualRental[]) => {
    setManualRentals(updated);
    try {
      localStorage.setItem('bbr_manual_rentals', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  // Adjust total fleet units for a vehicle
  const adjustFleetUnits = (vehicleId: string, delta: number) => {
    const currentBase = stockOverrides[vehicleId] ?? (twoWheelers.find((v) => v.id === vehicleId)?.availableCount || 3);
    const newTotal = Math.max(1, currentBase + delta);
    const updated = { ...stockOverrides, [vehicleId]: newTotal };
    setStockOverrides(updated);
    localStorage.setItem('bbr_fleet_stock_overrides', JSON.stringify(updated));
  };

  // Active bookings from online system (status confirmed or pending)
  const activeOnlineRentals = bookings.filter(
    (b) => b.type !== 'taxi' && (b.status === 'confirmed' || b.status === 'pending')
  );

  // Helper to get active rentals for a vehicle
  const getRentalsForVehicle = (vehicle: Vehicle) => {
    const online = activeOnlineRentals.filter((b) => {
      const bVehId = b.vehicleId?.toLowerCase() || '';
      const bVehName = b.vehicleName?.toLowerCase() || '';
      const targetId = vehicle.id.toLowerCase();
      const targetName = vehicle.name.toLowerCase();
      return bVehId === targetId || bVehName.includes(targetName) || targetName.includes(bVehName);
    });

    const manual = manualRentals.filter((m) => m.vehicleId === vehicle.id);

    return { online, manual, totalRented: online.length + manual.length };
  };

  // Aggregate stats computation
  const stats = React.useMemo(() => {
    let scootyTotalUnits = 0;
    let scootyOnRent = 0;
    let bikeTotalUnits = 0;
    let bikeOnRent = 0;

    twoWheelers.forEach((v) => {
      const totalUnits = stockOverrides[v.id] ?? (v.availableCount || 3);
      const { totalRented } = getRentalsForVehicle(v);

      if (v.category === 'scooter') {
        scootyTotalUnits += totalUnits;
        scootyOnRent += Math.min(totalUnits, totalRented);
      } else {
        bikeTotalUnits += totalUnits;
        bikeOnRent += Math.min(totalUnits, totalRented);
      }
    });

    const scootyInStock = Math.max(0, scootyTotalUnits - scootyOnRent);
    const bikeInStock = Math.max(0, bikeTotalUnits - bikeOnRent);
    const totalFleet = scootyTotalUnits + bikeTotalUnits;
    const totalOnRent = scootyOnRent + bikeOnRent;
    const totalInStock = scootyInStock + bikeInStock;
    const utilizationRate = totalFleet > 0 ? Math.round((totalOnRent / totalFleet) * 100) : 0;

    return {
      scootyTotalUnits,
      scootyInStock,
      scootyOnRent,
      bikeTotalUnits,
      bikeInStock,
      bikeOnRent,
      totalFleet,
      totalInStock,
      totalOnRent,
      utilizationRate,
    };
  }, [twoWheelers, stockOverrides, activeOnlineRentals, manualRentals]);

  // Handle manual rent-out submit
  const handleRentOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentingVehicle || !rentCustomerName || !rentCustomerPhone) return;

    const newRental: ManualRental = {
      id: `RENT-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: rentingVehicle.id,
      vehicleName: rentingVehicle.name,
      customerName: rentCustomerName,
      customerPhone: rentCustomerPhone.replace(/\D/g, ''),
      pickupDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      returnDate: rentReturnDate || 'Tomorrow',
      returnTime: rentReturnTime || '18:00',
      hub: rentHub,
      notes: rentNotes,
      createdAt: new Date().toISOString(),
    };

    updateManualRentals([...manualRentals, newRental]);
    setRentingVehicle(null);
    setRentCustomerName('');
    setRentCustomerPhone('');
    setRentNotes('');

    // Quick notification toast
    setCopiedNotification(`Assigned ${rentingVehicle.name} to ${newRental.customerName}. Connected to their WhatsApp!`);
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Return manual rental
  const handleReturnManualRental = (rentalId: string) => {
    updateManualRentals(manualRentals.filter((m) => m.id !== rentalId));
    setCopiedNotification('Vehicle marked as returned and restored to stock!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Return online rental
  const handleReturnOnlineRental = (bookingId: string) => {
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(bookingId, 'completed');
    }
    setCopiedNotification('Booking completed! Vehicle restored to available stock.');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // ── GENERATE WHATSAPP INVENTORY REPORT FOR ADMIN ──
  const generateAdminStockReport = () => {
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let msg = `🛵 *FREEDO / BBR FLEET INVENTORY & STOCK REPORT*\n`;
    msg += `📅 *Generated:* ${now}\n`;
    msg += `🏢 *Hubs:* Dehradun • Rishikesh • Haridwar\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *FLEET INVENTORY SUMMARY*\n`;
    msg += `• *Total Fleet:* ${stats.totalFleet} 2-Wheelers\n`;
    msg += `• 🛵 *Scooties / Scooters:* ${stats.scootyInStock} in Stock | ${stats.scootyOnRent} on Rent\n`;
    msg += `• 🏍️ *Motorbikes:* ${stats.bikeInStock} in Stock | ${stats.bikeOnRent} on Rent\n`;
    msg += `• 🟢 *Total Available in Stock:* ${stats.totalInStock} units\n`;
    msg += `• 🔴 *Total Currently on Rent:* ${stats.totalOnRent} units\n`;
    msg += `• 📈 *Fleet Utilization Rate:* ${stats.utilizationRate}%\n`;
    msg += `• 🛡️ *Deposit Policy:* ₹0 ZERO SECURITY DEPOSIT\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Active rentals detail
    msg += `🔴 *ACTIVE RENTALS (CONNECTED TO CUSTOMERS):*\n`;
    let hasRented = false;
    twoWheelers.forEach((v) => {
      const { online, manual } = getRentalsForVehicle(v);
      online.forEach((b) => {
        hasRented = true;
        msg += `• *${v.name}* (${b.pickupHub})\n`;
        msg += `   👤 Renter: ${b.customerName} (${b.customerPhone})\n`;
        msg += `   ⏳ Return: ${b.returnDate} @ ${b.returnTime} | Booking ID: ${b.id}\n`;
      });
      manual.forEach((m) => {
        hasRented = true;
        msg += `• *${v.name}* (${m.hub})\n`;
        msg += `   👤 Renter: ${m.customerName} (${m.customerPhone})\n`;
        msg += `   ⏳ Return: ${m.returnDate} @ ${m.returnTime} | Ref: ${m.id}\n`;
      });
    });

    if (!hasRented) {
      msg += `All vehicles are currently parked and ready in stock.\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🟢 *AVAILABLE IN-STOCK READY FOR BOOKING:*\n`;
    twoWheelers.forEach((v) => {
      const totalUnits = stockOverrides[v.id] ?? (v.availableCount || 3);
      const { totalRented } = getRentalsForVehicle(v);
      const inStock = Math.max(0, totalUnits - totalRented);
      if (inStock > 0) {
        msg += `• ${v.category === 'scooter' ? '🛵' : '🏍️'} *${v.name}*: ${inStock} Available (₹${v.fullDayRent}/day • ₹0 Deposit)\n`;
      }
    });

    msg += `\n_Live update from BBR Admin WhatsApp Fleet Manager_`;

    const cleanPhone = adminPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // ── GENERATE CUSTOMER-READY CATALOGUE MESSAGE ──
  const generateCustomerCatalogueShare = () => {
    let msg = `🛵 *FREEDO / BBR BIKE & SCOOTY RENTALS - LIVE CATALOGUE*\n`;
    msg += `📍 *Hubs:* Dehradun • Rishikesh • Haridwar\n`;
    msg += `🛡️ *SPECIAL POLICY: 100% ZERO SECURITY DEPOSIT!* (No security money required)\n\n`;

    msg += `🛵 *AVAILABLE SCOOTIES / SCOOTERS:*\n`;
    twoWheelers.filter((v) => v.category === 'scooter').forEach((v) => {
      const totalUnits = stockOverrides[v.id] ?? (v.availableCount || 3);
      const { totalRented } = getRentalsForVehicle(v);
      const inStock = Math.max(0, totalUnits - totalRented);
      const stockBadge = inStock > 0 ? `🟢 IN STOCK (${inStock} available)` : `🔴 BOOKED`;
      msg += `• *${v.name}* (${v.engineCC}cc, ${v.mileage})\n`;
      msg += `   Tariff: ₹${v.fullDayRent}/day | ${stockBadge} | ₹0 Deposit\n`;
    });

    msg += `\n🏍️ *AVAILABLE MOTORBIKES & CRUISERS:*\n`;
    twoWheelers.filter((v) => v.category === 'bike').forEach((v) => {
      const totalUnits = stockOverrides[v.id] ?? (v.availableCount || 3);
      const { totalRented } = getRentalsForVehicle(v);
      const inStock = Math.max(0, totalUnits - totalRented);
      const stockBadge = inStock > 0 ? `🟢 IN STOCK (${inStock} available)` : `🔴 BOOKED`;
      msg += `• *${v.name}* (${v.engineCC}cc)\n`;
      msg += `   Tariff: ₹${v.fullDayRent}/day | ${stockBadge} | ₹0 Deposit\n`;
    });

    msg += `\n🎁 *Includes:* 2 ISI Helmets, Sanitized Vehicle, Emergency Assistance\n`;
    msg += `📲 *Instant Booking / Inquiries:* Reply here or visit our portal!`;

    navigator.clipboard?.writeText(msg);
    setCopiedNotification('Customer WhatsApp Catalogue copied to clipboard! Ready to paste & send on WhatsApp.');
    setTimeout(() => setCopiedNotification(null), 4000);

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(shareUrl, '_blank');
  };

  // ── SEND SINGLE VEHICLE CARD VIA WHATSAPP ──
  const shareSingleVehicle = (v: Vehicle, inStock: number) => {
    let msg = `🛵 *FREEDO / BBR BIKE RENTAL SPECIFICATION*\n\n`;
    msg += `Model: *${v.name}*\n`;
    msg += `Brand: ${v.brand} | Category: ${v.category === 'scooter' ? 'Scooty / Scooter' : 'Motorbike'}\n`;
    msg += `Engine: ${v.engineCC}cc | Mileage: ${v.mileage}\n`;
    msg += `Transmission: ${v.transmission} | Fuel: ${v.fuelType}\n\n`;
    msg += `💰 *Daily Rent:* ₹${v.fullDayRent} / 24 Hours\n`;
    if (v.hourlyRent) msg += `⏱️ *Hourly Rent:* ₹${v.hourlyRent} / hour\n`;
    msg += `🛡️ *Security Deposit:* ₹0 (ZERO DEPOSIT POLICY!)\n`;
    msg += `🟢 *Stock Availability:* ${inStock > 0 ? `${inStock} units in stock ready for pickup` : 'Currently Booked'}\n\n`;
    msg += `⛑️ Free ISI Helmet Included • Sanitized & Serviced\n`;
    msg += `Reply to confirm your reservation instantly!`;

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(shareUrl, '_blank');
  };

  // ── DIRECT WHATSAPP LINK TO ACTIVE RENTER ──
  const chatWithRenter = (customerName: string, phone: string, vehicleName: string, returnDate: string, returnTime: string, template: 'status' | 'reminder' | 'extension') => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let text = '';
    if (template === 'status') {
      text = `Hi ${customerName}! 👋 This is BBR Fleet Management regarding your active rental of *${vehicleName}*. Hope your ride is smooth! Let us know if you need any assistance or route guidance.`;
    } else if (template === 'reminder') {
      text = `Hi ${customerName}! ⏰ Gentle reminder regarding the return of your rented *${vehicleName}* scheduled for *${returnDate} at ${returnTime}*. Please ensure the fuel level and helmet are returned in proper condition. Safe riding!`;
    } else {
      text = `Hi ${customerName}! 🛵 Would you like to extend your rental for *${vehicleName}* beyond ${returnDate}? We have special zero-deposit extension rates available today!`;
    }

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered vehicles
  const filteredVehicles = twoWheelers.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;

    const totalUnits = stockOverrides[v.id] ?? (v.availableCount || 3);
    const { totalRented } = getRentalsForVehicle(v);
    const inStock = Math.max(0, totalUnits - totalRented);

    if (statusFilter === 'in_stock' && inStock <= 0) return false;
    if (statusFilter === 'on_rent' && totalRented <= 0) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVehicle = v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
      const { online, manual } = getRentalsForVehicle(v);
      const matchRenter =
        online.some((b) => b.customerName?.toLowerCase().includes(q) || b.customerPhone?.includes(q)) ||
        manual.some((m) => m.customerName?.toLowerCase().includes(q) || m.customerPhone?.includes(q));
      return matchVehicle || matchRenter;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* ── WhatsApp Connected Hub Header Banner ── */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden border"
        style={{
          background: 'linear-gradient(135deg, rgba(37,211,102,0.08) 0%, rgba(18,140,126,0.04) 50%, rgba(255,106,0,0.05) 100%)',
          borderColor: 'rgba(37,211,102,0.25)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Live WhatsApp Fleet Connected
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                Zero Security Deposit Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              WhatsApp Fleet Catalogue & Stock Manager
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track exactly how many <span className="text-white font-bold">Bikes</span> and <span className="text-white font-bold">Scooties</span> are parked in stock vs. actively on rent. Each rented vehicle is directly linked to the customer&apos;s WhatsApp for instant status updates and return reminders.
            </p>
          </div>

          {/* Admin WhatsApp Config + Quick Broadcast Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Admin Phone Box */}
            <div
              className="px-4 py-2.5 rounded-2xl border flex items-center gap-3"
              style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              {isEditingAdminPhone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={adminPhoneInput}
                    onChange={(e) => setAdminPhoneInput(e.target.value)}
                    placeholder="e.g. 919876543210"
                    className="bg-white/10 px-2 py-1 rounded text-xs text-white outline-none w-32 font-mono"
                    autoFocus
                  />
                  <button
                    onClick={saveAdminPhone}
                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    title="Save"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingAdminPhone(false)}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Admin WhatsApp:</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">+{adminPhone}</span>
                  </div>
                  <button
                    onClick={() => {
                      setAdminPhoneInput(adminPhone);
                      setIsEditingAdminPhone(true);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline ml-1 cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Action 1: Send Stock Report to Admin */}
            <button
              onClick={generateAdminStockReport}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-102 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
              }}
              title="Send automated inventory summary to your WhatsApp"
            >
              <MessageSquare className="w-4 h-4 fill-white/20" />
              <span>Send Stock Report to WhatsApp</span>
            </button>

            {/* Action 2: Share Customer Catalogue */}
            <button
              onClick={generateCustomerCatalogueShare}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer border"
              style={{
                background: 'rgba(255,106,0,0.12)',
                borderColor: 'rgba(255,106,0,0.3)',
                color: '#FF8C33',
              }}
              title="Copy customer catalogue with 0 deposit and open WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Catalogue</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stock Counters & Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Scooties in Stock */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">🛵 Scooty Stock</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Available</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.scootyInStock} <span className="text-xs font-normal text-slate-400">units</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Ready to rent immediately</p>
        </div>

        {/* Scooties on Rent */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">🛵 Scooty Rented</span>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold">On Ride</span>
          </div>
          <p className="text-2xl font-black text-purple-300">{stats.scootyOnRent} <span className="text-xs font-normal text-slate-400">units</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Total fleet: {stats.scootyTotalUnits}</p>
        </div>

        {/* Bikes in Stock */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">🏍️ Bikes Stock</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Available</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.bikeInStock} <span className="text-xs font-normal text-slate-400">units</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Ready to rent immediately</p>
        </div>

        {/* Bikes on Rent */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">🏍️ Bikes Rented</span>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold">On Ride</span>
          </div>
          <p className="text-2xl font-black text-orange-300">{stats.bikeOnRent} <span className="text-xs font-normal text-slate-400">units</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Total fleet: {stats.bikeTotalUnits}</p>
        </div>

        {/* Total In Stock */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">🟢 Total Available</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">₹0 Deposit</span>
          </div>
          <p className="text-2xl font-black text-emerald-300">{stats.totalInStock} <span className="text-xs font-normal text-slate-400">/ {stats.totalFleet}</span></p>
          <p className="text-[10px] text-emerald-400/80 mt-1">Ready for rent</p>
        </div>

        {/* Total On Rent / Occupancy */}
        <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">📈 Fleet Occupancy</span>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold">{stats.utilizationRate}%</span>
          </div>
          <p className="text-2xl font-black text-orange-300">{stats.totalOnRent} <span className="text-xs font-normal text-slate-400">on rent</span></p>
          <p className="text-[10px] text-orange-400/80 mt-1">Connected to WhatsApp</p>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle, brand, renter, phone…"
              className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-56 sm:w-64"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
            {(['all', 'scooter', 'bike'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All 2-Wheelers' : cat === 'scooter' ? '🛵 Scooties' : '🏍️ Bikes'}
              </button>
            ))}
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
            {(['all', 'in_stock', 'on_rent'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Stock Status' : st === 'in_stock' ? '🟢 In Stock Only' : '🔴 On Rent Only'}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredVehicles.length}</span> models
        </div>
      </div>

      {/* ── Vehicle Catalogue Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => {
          const totalUnits = stockOverrides[vehicle.id] ?? (vehicle.availableCount || 3);
          const { online, manual, totalRented } = getRentalsForVehicle(vehicle);
          const inStock = Math.max(0, totalUnits - totalRented);
          const isScooty = vehicle.category === 'scooter';

          return (
            <div
              key={vehicle.id}
              className="rounded-3xl bg-[#111622] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col overflow-hidden shadow-xl"
            >
              {/* Image & Header Badges */}
              <div className="relative h-44 w-full bg-slate-900/60 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-bike.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111622] via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {isScooty ? '🛵 Scooty' : '🏍️ Bike'} • {vehicle.brand}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    ₹0 Deposit
                  </span>
                </div>

                {/* Stock Tag on Top Right */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black backdrop-blur-md border ${
                      inStock > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {inStock > 0 ? `🟢 ${inStock} IN STOCK` : '🔴 FULLY RENTED'}
                  </span>
                </div>

                {/* Bottom Title in Image */}
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-black text-white truncate drop-shadow">{vehicle.name}</h3>
                  <p className="text-[11px] text-slate-300 drop-shadow flex items-center gap-2">
                    <span>⚡ {vehicle.engineCC} cc</span>
                    <span>•</span>
                    <span>⛽ {vehicle.mileage}</span>
                    <span>•</span>
                    <span className="text-orange-400 font-bold">₹{vehicle.fullDayRent}/day</span>
                  </p>
                </div>
              </div>

              {/* Body & Inventory Counters */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                {/* Stock Controls */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fleet Management</span>
                    <span className="text-xs font-bold text-white">
                      {totalUnits} Total Units ({inStock} In Stock, {totalRented} Rented)
                    </span>
                  </div>

                  {/* Stock counter adjusters */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adjustFleetUnits(vehicle.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Decrease total fleet count"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white w-6 text-center">{totalUnits}</span>
                    <button
                      onClick={() => adjustFleetUnits(vehicle.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Increase total fleet count"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── Active Renters Section (Connected to WhatsApp) ── */}
                {totalRented > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Active Renters ({totalRented}):
                    </span>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {/* Online bookings */}
                      {online.map((b) => (
                        <div
                          key={b.id}
                          className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{b.customerName || 'Online Customer'}</span>
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded">Online</span>
                              </p>
                              <p className="text-[10px] text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-emerald-400" />
                                {b.customerPhone}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Due: {b.returnDate} @ {b.returnTime} ({b.pickupHub})
                              </p>
                            </div>

                            <button
                              onClick={() => handleReturnOnlineRental(b.id)}
                              className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 transition-all cursor-pointer"
                              title="Mark bike as returned to stock"
                            >
                              Mark Returned
                            </button>
                          </div>

                          {/* WhatsApp Connected Quick Actions */}
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                            <button
                              onClick={() =>
                                chatWithRenter(
                                  b.customerName,
                                  b.customerPhone,
                                  vehicle.name,
                                  b.returnDate,
                                  b.returnTime,
                                  'status'
                                )
                              }
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              WhatsApp Status
                            </button>

                            <button
                              onClick={() =>
                                chatWithRenter(
                                  b.customerName,
                                  b.customerPhone,
                                  vehicle.name,
                                  b.returnDate,
                                  b.returnTime,
                                  'reminder'
                                )
                              }
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              Return Reminder
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Manual rentals */}
                      {manual.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/20 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{m.customerName}</span>
                                <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1 rounded">Walk-in</span>
                              </p>
                              <p className="text-[10px] text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-emerald-400" />
                                {m.customerPhone}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Due: {m.returnDate} @ {m.returnTime}
                              </p>
                            </div>

                            <button
                              onClick={() => handleReturnManualRental(m.id)}
                              className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 transition-all cursor-pointer"
                            >
                              Mark Returned
                            </button>
                          </div>

                          {/* WhatsApp Connected Quick Actions */}
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                            <button
                              onClick={() =>
                                chatWithRenter(
                                  m.customerName,
                                  m.customerPhone,
                                  vehicle.name,
                                  m.returnDate,
                                  m.returnTime,
                                  'status'
                                )
                              }
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              WhatsApp Renter
                            </button>

                            <button
                              onClick={() =>
                                chatWithRenter(
                                  m.customerName,
                                  m.customerPhone,
                                  vehicle.name,
                                  m.returnDate,
                                  m.returnTime,
                                  'reminder'
                                )
                              }
                              className="px-2 py-1 rounded-lg text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              Return Reminder
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons for Vehicle */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
                  {/* Share Vehicle Card via WhatsApp */}
                  <button
                    onClick={() => shareSingleVehicle(vehicle, inStock)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Send vehicle card to customer on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Card</span>
                  </button>

                  {/* Rent Out / Assign to Renter */}
                  <button
                    disabled={inStock <= 0}
                    onClick={() => {
                      setRentingVehicle(vehicle);
                      setRentReturnDate(
                        new Date(Date.now() + 86400000).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      );
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      inStock > 0
                        ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{inStock > 0 ? 'Rent to Person' : 'No Stock'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Assign / Rent Out Modal ── */}
      {rentingVehicle && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 bg-[#111] border border-orange-500/30 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setRentingVehicle(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Connect Renter to WhatsApp
              </span>
              <h3 className="text-xl font-black text-white mt-1">Rent Out {rentingVehicle.name}</h3>
              <p className="text-xs text-slate-400">
                Tariff: ₹{rentingVehicle.fullDayRent}/day • Security Deposit: ₹0 (Zero Deposit Policy)
              </p>
            </div>

            <form onSubmit={handleRentOutSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Customer / Renter Name *</label>
                <input
                  type="text"
                  required
                  value={rentCustomerName}
                  onChange={(e) => setRentCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">
                  Renter WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={rentCustomerPhone}
                  onChange={(e) => setRentCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210 (10 digits)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Return Date</label>
                  <input
                    type="text"
                    value={rentReturnDate}
                    onChange={(e) => setRentReturnDate(e.target.value)}
                    placeholder="e.g. 30 Sep 2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Return Time</label>
                  <input
                    type="time"
                    value={rentReturnTime}
                    onChange={(e) => setRentReturnTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Pickup Hub</label>
                <select
                  value={rentHub}
                  onChange={(e) => setRentHub(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white outline-none focus:border-orange-500"
                >
                  <option value="Dehradun Main Hub (ISBT)">Dehradun Main Hub (ISBT)</option>
                  <option value="Dehradun Railway Station Hub">Dehradun Railway Station Hub</option>
                  <option value="Rishikesh Tapovan Hub">Rishikesh Tapovan Hub</option>
                  <option value="Haridwar Station Hub">Haridwar Station Hub</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Notes / Helmet count</label>
                <input
                  type="text"
                  value={rentNotes}
                  onChange={(e) => setRentNotes(e.target.value)}
                  placeholder="e.g. 2 helmets issued, DL verified"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRentingVehicle(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Connect WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
