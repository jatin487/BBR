import React, { useState, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, Car, MapPin, Calendar,
  Clock, Users, Banknote, CheckCircle2, Phone, Mail,
  Sparkles, FileText, Navigation, AlertCircle, Loader2
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { loadUserSession } from '../../lib/firebase';
import { CAB_FLEET } from '../../data/cabs';
import { CabVehicle, CabPackage } from '../../types';
import confetti from 'canvas-confetti';

interface TaxiBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCab?: CabVehicle | null;
  initialPackage?: CabPackage | null;
}

const STEPS = ['Vehicle', 'Route', 'Schedule', 'Your Details', 'Confirm'];

const POPULAR_ROUTES = [
  { from: 'Dehradun City Centre', to: 'Jolly Grant Airport', distance: '28 km', time: '45 min' },
  { from: 'Dehradun', to: 'Mussoorie', distance: '35 km', time: '1 hr 15 min' },
  { from: 'Dehradun', to: 'Rishikesh', distance: '42 km', time: '1 hr' },
  { from: 'Rishikesh', to: 'Haridwar', distance: '24 km', time: '40 min' },
  { from: 'Dehradun', to: 'Delhi NCR', distance: '295 km', time: '6 hrs' },
];

export const TaxiBookingModal: React.FC<TaxiBookingModalProps> = ({
  isOpen,
  onClose,
  initialCab = null,
  initialPackage = null,
}) => {
  const { showToast } = useToast();
  const userProfile = loadUserSession();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Step 1 – Vehicle
  const [selectedCab, setSelectedCab] = useState<CabVehicle | null>(initialCab || CAB_FLEET[0] || null);

  // Step 2 – Route
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Step 3 – Schedule
  const today = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(today);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [returnDate, setReturnDate] = useState(today);
  const [returnTime, setReturnTime] = useState('18:00');

  // Step 4 – Customer details
  const [customerName, setCustomerName] = useState(userProfile?.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    userProfile?.phone ? String(userProfile.phone).replace(/^\+91/, '').replace(/\s+/g, '') : ''
  );
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');

  // Fare estimate (simple approximation)
  const perKmRate = selectedCab?.perKmRate || 14;
  const minKm = selectedCab?.minKmPerDay || 250;
  const routeDistanceMap: Record<string, number> = {
    'Jolly Grant Airport': 28, 'Mussoorie': 35, 'Rishikesh': 42,
    'Haridwar': 66, 'Delhi': 295, 'Dhanaulti': 65,
  };
  const guessedKm = Object.entries(routeDistanceMap).find(([k]) =>
    dropAddress.toLowerCase().includes(k.toLowerCase())
  )?.[1] || 50;
  const effectiveKm = Math.max(guessedKm, tripType === 'roundtrip' ? minKm : minKm / 2);
  const estimatedFare = Math.round(effectiveKm * perKmRate + (selectedCab?.driverAllowance || 300));
  const estimatedDistance = `~${guessedKm} km`;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBookingId('');
      setIsSubmitting(false);
      const s = loadUserSession();
      setCustomerName(s?.name || '');
      setCustomerPhone(s?.phone ? s.phone.replace(/^\+91/, '').replace(/\s+/g, '') : '');
      setCustomerEmail(s?.email || '');
      if (initialCab) setSelectedCab(initialCab);
      if (initialPackage) {
        setPickupAddress(initialPackage.fromCity || 'Dehradun City Centre');
        setDropAddress(initialPackage.toCity || initialPackage.title);
      }
    }
  }, [isOpen, initialCab, initialPackage]);

  const validateStep = () => {
    if (step === 2 && (!pickupAddress.trim() || !dropAddress.trim())) {
      showToast('Please enter pickup and drop-off addresses.', 'error');
      return false;
    }
    if (step === 4 && (!customerName.trim() || !customerPhone.trim())) {
      showToast('Please enter your name and phone number.', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    const newId = `TAXI-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      id: newId,
      userId: userProfile?.uid || 'guest',
      vehicleId: selectedCab?.id || 'taxi',
      vehicleName: selectedCab?.name || 'Taxi',
      city: 'Dehradun',
      pickupHub: pickupAddress,
      dropHub: dropAddress,
      pickupAddress,
      dropAddress,
      pickupDate,
      pickupTime,
      returnDate: tripType === 'roundtrip' ? returnDate : pickupDate,
      returnTime: tripType === 'roundtrip' ? returnTime : pickupTime,
      rateType: tripType,
      duration: 1,
      totalAmount: estimatedFare,
      estimatedFare,
      estimatedDistance,
      customerName: customerName.trim(),
      customerPhone: `+91${customerPhone.trim()}`,
      customerEmail: customerEmail.trim(),
      passengerCount,
      specialInstructions: specialInstructions.trim(),
      paymentMethod,
      type: 'taxi' as const,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    let confirmedId = newId;

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking?.id) {
          confirmedId = data.booking.id;
        }
      }
    } catch {
      // Dev / offline fallback
    }

    const finalRecord = { ...payload, id: confirmedId };

    // 1. Store in bbr-bookings
    try {
      const existingBbr = JSON.parse(localStorage.getItem('bbr-bookings') || '[]');
      existingBbr.push(finalRecord);
      localStorage.setItem('bbr-bookings', JSON.stringify(existingBbr));
    } catch { /* ignore */ }

    // 2. Store in bbr_backend_data
    try {
      const rawBackend = localStorage.getItem('bbr_backend_data');
      const backendData = rawBackend ? JSON.parse(rawBackend) : { users: [], bookings: [], kycRecords: {} };
      backendData.bookings = [...(backendData.bookings || []), finalRecord];
      localStorage.setItem('bbr_backend_data', JSON.stringify(backendData));
    } catch { /* ignore */ }

    setBookingId(confirmedId);
    setStep(6);
    showToast('Taxi booked successfully! 🎉', 'success');
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #111 0%, #181818 100%)', border: '1px solid rgba(255,106,0,0.2)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-6 pb-4" style={{ background: 'linear-gradient(180deg, #111 80%, transparent 100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,106,0,0.15)', border: '1px solid rgba(255,106,0,0.3)' }}>
                <Car className="w-5 h-5" style={{ color: '#FF6A00' }} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Book a Taxi</h2>
                <p className="text-xs" style={{ color: '#9BA1A5' }}>
                  {step <= STEPS.length ? `Step ${step} of ${STEPS.length} — ${STEPS[step - 1]}` : 'Booking Confirmed'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Progress bar */}
          {step <= STEPS.length && (
            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF6A00, #FF8C33)' }}
              />
            </div>
          )}
        </div>

        <div className="px-6 pb-8">

          {/* ── STEP 1: Vehicle Selection ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#9BA1A5' }}>Choose your taxi type for the journey.</p>
              <div className="grid grid-cols-1 gap-3">
                {CAB_FLEET.map((cab) => (
                  <button
                    key={cab.id}
                    onClick={() => setSelectedCab(cab)}
                    className="w-full text-left p-4 rounded-2xl transition-all"
                    style={{
                      background: selectedCab?.id === cab.id ? 'rgba(255,106,0,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedCab?.id === cab.id ? 'rgba(255,106,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,106,0,0.1)' }}>
                          <Car className="w-5 h-5" style={{ color: '#FF6A00' }} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{cab.name}</p>
                          <p className="text-xs" style={{ color: '#9BA1A5' }}>{cab.category} · {cab.seating} · {cab.luggage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: '#FF6A00' }}>₹{cab.perKmRate}/km</p>
                        <p className="text-xs" style={{ color: '#656C70' }}>Min {cab.minKmPerDay} km</p>
                      </div>
                    </div>
                    {selectedCab?.id === cab.id && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cab.features?.slice(0, 4).map((f, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,106,0,0.1)', color: '#FF8C33', border: '1px solid rgba(255,106,0,0.2)' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Route ── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm" style={{ color: '#9BA1A5' }}>Enter your pickup and drop-off locations.</p>

              {/* Popular routes quick-fill */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#656C70' }}>Popular Routes</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_ROUTES.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { setPickupAddress(r.from); setDropAddress(r.to); }}
                      className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,106,0,0.1)', color: '#FF8C33', border: '1px solid rgba(255,106,0,0.2)' }}
                    >
                      {r.from} → {r.to}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                    <MapPin className="w-3.5 h-3.5 inline mr-1" style={{ color: '#22c55e' }} />Pickup Address
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter full pickup address or landmark…"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', '--tw-ring-color': 'rgba(255,106,0,0.4)' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                    <Navigation className="w-3.5 h-3.5 inline mr-1" style={{ color: '#FF6A00' }} />Drop-off Address
                  </label>
                  <input
                    type="text"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    placeholder="Enter destination address or landmark…"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', '--tw-ring-color': 'rgba(255,106,0,0.4)' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                    <Users className="w-3.5 h-3.5 inline mr-1" />Passengers
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => setPassengerCount(n)}
                        className="w-10 h-10 rounded-xl font-bold text-sm transition-all"
                        style={{
                          background: passengerCount === n ? 'rgba(255,106,0,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${passengerCount === n ? 'rgba(255,106,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: passengerCount === n ? '#FF6A00' : '#9BA1A5',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                    <FileText className="w-3.5 h-3.5 inline mr-1" />Special Instructions (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any specific requests for the driver…"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              {/* Live fare estimate */}
              {pickupAddress && dropAddress && (
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,106,0,0.07)', border: '1px solid rgba(255,106,0,0.2)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#FF6A00' }}>Estimated Fare</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-white">₹{estimatedFare.toLocaleString()}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9BA1A5' }}>{estimatedDistance} · {selectedCab?.name}</p>
                    </div>
                    <div className="text-right text-xs" style={{ color: '#656C70' }}>
                      <p>₹{perKmRate}/km</p>
                      <p>Incl. driver allowance</p>
                    </div>
                  </div>
                  <p className="text-[10px] mt-2" style={{ color: '#656C70' }}>Final fare may vary based on actual distance &amp; tolls.</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Schedule ── */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm" style={{ color: '#9BA1A5' }}>When should the taxi pick you up?</p>

              {/* Trip type */}
              <div className="flex gap-3">
                {(['oneway', 'roundtrip'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTripType(t)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize"
                    style={{
                      background: tripType === t ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${tripType === t ? 'rgba(255,106,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: tripType === t ? '#FF6A00' : '#9BA1A5',
                    }}
                  >
                    {t === 'oneway' ? 'One Way' : 'Round Trip'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />Pickup Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                    <Clock className="w-3.5 h-3.5 inline mr-1" />Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {tripType === 'roundtrip' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />Return Date
                    </label>
                    <input
                      type="date"
                      min={pickupDate}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                      <Clock className="w-3.5 h-3.5 inline mr-1" />Return Time
                    </label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              )}

              {/* Schedule summary */}
              <div className="p-4 rounded-2xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#656C70' }}>Schedule Summary</p>
                <div className="flex gap-2 items-start">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                  <div>
                    <p className="text-xs text-white font-semibold">{pickupAddress || '—'}</p>
                    <p className="text-[10px]" style={{ color: '#9BA1A5' }}>{pickupDate} at {pickupTime}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Navigation className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FF6A00' }} />
                  <div>
                    <p className="text-xs text-white font-semibold">{dropAddress || '—'}</p>
                    {tripType === 'roundtrip' && <p className="text-[10px]" style={{ color: '#9BA1A5' }}>Return: {returnDate} at {returnTime}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Customer Details ── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#9BA1A5' }}>Your contact details for the booking confirmation.</p>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                  <Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number *
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-3 rounded-xl text-sm font-bold flex items-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9BA1A5' }}>+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#9BA1A5' }}>
                  <Mail className="w-3.5 h-3.5 inline mr-1" />Email (optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: '#9BA1A5' }}>
                  <Banknote className="w-3.5 h-3.5 inline mr-1" />Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'upi', 'card'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className="py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
                      style={{
                        background: paymentMethod === m ? 'rgba(255,106,0,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${paymentMethod === m ? 'rgba(255,106,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: paymentMethod === m ? '#FF6A00' : '#9BA1A5',
                      }}
                    >
                      {m === 'upi' ? 'UPI' : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Confirmation ── */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#9BA1A5' }}>Review your booking details before confirming.</p>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { label: 'Vehicle', value: selectedCab?.name || '—' },
                  { label: 'Pickup', value: pickupAddress },
                  { label: 'Drop-off', value: dropAddress },
                  { label: 'Date & Time', value: `${pickupDate} at ${pickupTime}` },
                  { label: 'Trip Type', value: tripType === 'oneway' ? 'One Way' : 'Round Trip' },
                  { label: 'Passengers', value: String(passengerCount) },
                  { label: 'Name', value: customerName },
                  { label: 'Phone', value: `+91 ${customerPhone}` },
                  ...(customerEmail ? [{ label: 'Email', value: customerEmail }] : []),
                  { label: 'Payment', value: paymentMethod.toUpperCase() },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-start px-4 py-3"
                    style={{ borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  >
                    <span className="text-xs font-semibold" style={{ color: '#656C70' }}>{row.label}</span>
                    <span className="text-xs text-white font-medium text-right max-w-[60%]">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Fare summary */}
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.25)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#FF8C33' }}>Estimated Total</p>
                    <p className="text-3xl font-black text-white mt-0.5">₹{estimatedFare.toLocaleString()}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9BA1A5' }}>{estimatedDistance} · incl. driver allowance</p>
                  </div>
                  <Sparkles className="w-8 h-8 opacity-20" style={{ color: '#FF6A00' }} />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                <p className="text-xs" style={{ color: '#9BA1A5' }}>
                  Final fare may differ based on actual distance, waiting time, and tolls. Our team will contact you to confirm driver assignment.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 6: Success ── */}
          {step === 6 && (
            <div className="py-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle2 className="w-10 h-10" style={{ color: '#22c55e' }} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Taxi Booked!</h3>
                <p className="text-sm mt-2" style={{ color: '#9BA1A5' }}>
                  Your booking <span className="font-bold" style={{ color: '#FF6A00' }}>{bookingId}</span> is confirmed.
                </p>
                <p className="text-sm mt-1" style={{ color: '#9BA1A5' }}>
                  We'll call <span className="text-white font-semibold">+91 {customerPhone}</span> to assign your driver.
                </p>
              </div>
              <div className="p-4 rounded-2xl text-left space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#656C70' }}>Trip Summary</p>
                <p className="text-sm text-white">{pickupAddress} → {dropAddress}</p>
                <p className="text-xs" style={{ color: '#9BA1A5' }}>{pickupDate} · {pickupTime} · {selectedCab?.name}</p>
                <p className="text-lg font-black" style={{ color: '#FF6A00' }}>₹{estimatedFare.toLocaleString()} est.</p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/918507067716?text=Hi%20BBR!%20My%20taxi%20booking%20ID%20is%20${bookingId}.%20Pickup:%20${encodeURIComponent(pickupAddress)}%20→%20${encodeURIComponent(dropAddress)}%20on%20${pickupDate}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center"
                  style={{ background: '#25d366' }}
                >
                  Chat on WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9BA1A5' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step <= STEPS.length && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9BA1A5' }}
                >
                  <ChevronLeft className="w-4 h-4" />Back
                </button>
              )}
              <button
                onClick={step === STEPS.length ? handleSubmit : handleNext}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 100%)', boxShadow: '0 4px 20px rgba(255,106,0,0.3)' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Confirming…</>
                ) : step === STEPS.length ? (
                  <><CheckCircle2 className="w-4 h-4" />Confirm Booking</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
