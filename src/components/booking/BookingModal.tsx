import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileCheck,
  CreditCard,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Tag,
  Download,
  Share2,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Vehicle, RateType, PromoOffer } from '../../types';
import { LOCATIONS } from '../../data/locations';
import { OFFERS } from '../../data/offers';
import { useToast } from '../common/Toast';
import { supabaseHelpers, hasSupabaseConfig } from '../../lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle: Vehicle | null;
  initialRateType?: RateType;
  initialCity?: string;
  initialDuration?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  initialRateType = 'fullday',
  initialCity = 'Rishikesh',
  initialDuration = 1
}) => {
  const { showToast } = useToast();

  // Multi-step State (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(initialVehicle);
  const [rateType, setRateType] = useState<RateType>(initialRateType);
  const [duration, setDuration] = useState(initialDuration);

  // Step 2: Location & Dates
  const [city, setCity] = useState(initialCity);
  const currentHub = LOCATIONS.find((l) => l.city.toLowerCase() === city.toLowerCase()) || LOCATIONS[0];
  const [pickupHub, setPickupHub] = useState(currentHub.branches[0]?.name || 'Central BBR Hub');
  const [dropHub, setDropHub] = useState(currentHub.branches[0]?.name || 'Central BBR Hub');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(today);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [returnTime, setReturnTime] = useState('09:00');

  // Add-ons
  const [extraHelmet, setExtraHelmet] = useState(false);
  const [ridingJacket, setRidingJacket] = useState(false);
  const [mobileHolder, setMobileHolder] = useState(true);

  // Step 3: Customer Details
  const [customerName, setCustomerName] = useState('Rohan Sharma');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerEmail, setCustomerEmail] = useState('rohan.rider@gmail.com');
  const [emergencyPhone, setEmergencyPhone] = useState('9811223344');

  // Step 4: ID Verification / KYC
  const [dlNumber, setDlNumber] = useState('DL-1420210087452');
  const [aadhaarNumber, setAadhaarNumber] = useState('7845 9012 4432');
  const [idVerified, setIdVerified] = useState(true);
  const [uploadedDLName, setUploadedDLName] = useState('driving_license_front.jpg');

  // Step 5: Billing & Promo
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoOffer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'pay_at_pickup'>('pay_at_pickup');
  const [bookingId, setBookingId] = useState('');

  if (!isOpen || !vehicle) return null;

  // Calculation logic
  const getBaseRate = () => {
    if (rateType === 'hourly') return vehicle.hourlyRent || vehicle.fullDayRent;
    if (rateType === 'night') return vehicle.nightRent;
    return vehicle.fullDayRent;
  };

  const baseRate = getBaseRate();
  const subtotal = baseRate * duration;
  const extrasCost = (extraHelmet ? 100 : 0) + (ridingJacket ? 250 : 0) + (mobileHolder ? 50 : 0);

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discount = Math.min((subtotal * appliedPromo.discountValue) / 100, appliedPromo.maxDiscount || 500);
    } else {
      discount = appliedPromo.discountValue;
    }
  }

  const taxableAmount = Math.max(0, subtotal + extrasCost - discount);
  const gst = Math.round(taxableAmount * 0.18);
  const deposit = vehicle.securityDeposit;
  const totalAmountToPay = taxableAmount + gst + deposit;

  const handleApplyPromo = () => {
    const found = OFFERS.find((o) => o.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (found) {
      setAppliedPromo(found);
      showToast(`Promo code ${found.code} applied! Saved ₹${Math.round(discount || found.discountValue)}`, 'success');
    } else {
      showToast('Invalid promo code. Try BBRFIRST or WEEKENDVIBES', 'error');
    }
  };

  const handleConfirmBooking = async () => {
    const newId = `BBR-${Math.floor(100000 + Math.random() * 900000)}`;
    const userFromStorage = JSON.parse(localStorage.getItem('bbr-user') || 'null');
    const bookingRecord = {
      id: newId,
      userId: userFromStorage?.phone || `guest-${Date.now()}`,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      city,
      pickupHub,
      dropHub,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      rateType,
      duration,
      totalAmount: totalAmountToPay,
      customerName,
      customerPhone,
      paymentMethod,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    try {
      if (hasSupabaseConfig) {
        const saved = await supabaseHelpers.createBooking(bookingRecord);
        setBookingId(saved.id || newId);
      } else {
        const response = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bookingRecord, userId: bookingRecord.userId.replace(/^\+91/, '') })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to create booking');
        }

        const savedBookings = JSON.parse(localStorage.getItem('bbr-bookings') || '[]');
        savedBookings.push({ ...bookingRecord, id: data.booking?.id || newId });
        localStorage.setItem('bbr-bookings', JSON.stringify(savedBookings));
        setBookingId(data.booking?.id || newId);
      }
    } catch (error) {
      const savedBookings = JSON.parse(localStorage.getItem('bbr-bookings') || '[]');
      savedBookings.push(bookingRecord);
      localStorage.setItem('bbr-bookings', JSON.stringify(savedBookings));
      setBookingId(newId);
      showToast(error instanceof Error ? error.message : 'Saved locally and ready for sync', 'info');
    }

    setCurrentStep(6);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Booking ${newId} confirmed successfully!`, 'success');
  };

  const steps = [
    'Vehicle',
    'Schedule & Add-ons',
    'Rider Details',
    'KYC Verification',
    'Payment',
    'Confirmed'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0B0F1A] border border-orange-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header & Progress Bar */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-xs">
                BBR
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white font-heading">
                  {currentStep === 6 ? 'Booking Confirmed 🎉' : 'Multi-Step Instant Checkout'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {vehicle.name} • {city} Hub
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden sm:flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((label, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;

              return (
                <div key={label} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-orange-500 text-white shadow-md'
                        : isActive
                        ? 'bg-orange-500 text-white ring-4 ring-orange-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1 ${
                      isActive ? 'text-orange-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1">
          {/* STEP 1: VEHICLE & TARIFF PLAN */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-32 h-24 object-cover rounded-xl border border-white/10"
                />
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                    {vehicle.brand}
                  </span>
                  <h3 className="text-xl font-bold text-white font-heading mt-1">{vehicle.name}</h3>
                  <p className="text-xs text-slate-400">{vehicle.tagline}</p>
                  <div className="text-xs text-slate-300 mt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <span>⚡ {vehicle.engineCC} cc</span>
                    <span>⛽ {vehicle.mileage}</span>
                    <span>🛡️ Deposit: ₹{vehicle.securityDeposit}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Choose Rental Tariff Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setRateType('fullday')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      rateType === 'fullday'
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg'
                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Full Day (24h)</span>
                      <span className="text-xs text-orange-400 font-black">₹{vehicle.fullDayRent}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Best for 24-hour city & road trips</p>
                  </div>

                  <div
                    onClick={() => {
                      if (vehicle.hourlyRent) setRateType('hourly');
                    }}
                    className={`p-4 rounded-2xl border transition-all ${
                      !vehicle.hourlyRent
                        ? 'opacity-40 cursor-not-allowed bg-slate-900/20 border-white/5 text-slate-600'
                        : rateType === 'hourly'
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg cursor-pointer'
                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider">Hourly</span>
                      <span className="text-xs text-orange-400 font-black">
                        {vehicle.hourlyRent ? `₹${vehicle.hourlyRent}/hr` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Quick rides & short errands</p>
                  </div>

                  <div
                    onClick={() => setRateType('night')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      rateType === 'night'
                        ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg'
                        : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Night Ride (12h)</span>
                      <span className="text-xs text-purple-300 font-black">₹{vehicle.nightRent}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">8:00 PM to 8:00 AM night special</p>
                  </div>
                </div>
              </div>

              {/* Duration Count */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Rental Duration:</span>
                  <span className="text-[11px] text-slate-400">
                    {rateType === 'hourly' ? 'Number of hours needed' : 'Number of days'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="text-base font-black text-orange-400 min-w-[20px] text-center">
                    {duration}
                  </span>
                  <button
                    onClick={() => setDuration(duration + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE, BRANCH & ADD-ONS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Pickup Location ({city})
                  </label>
                  <select
                    value={pickupHub}
                    onChange={(e) => setPickupHub(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {currentHub.branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Drop-off Location
                  </label>
                  <select
                    value={dropHub}
                    onChange={(e) => setDropHub(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {currentHub.branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Pickup Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={pickupDate}
                      min={today}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white flex-1"
                    />
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-orange-400 w-24"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Return Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={returnDate}
                      min={pickupDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white flex-1"
                    />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-amber-400 w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Rental Add-ons */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Optional Trip Add-Ons
                </label>
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 cursor-pointer hover:border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={extraHelmet}
                        onChange={() => setExtraHelmet(!extraHelmet)}
                        className="rounded text-orange-500 accent-orange-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Pillion Extra Helmet (+₹100)</span>
                        <span className="text-[10px] text-slate-400">Sanitized ISI Certified DOT Helmet</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-300">₹100</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 cursor-pointer hover:border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={ridingJacket}
                        onChange={() => setRidingJacket(!ridingJacket)}
                        className="rounded text-orange-500 accent-orange-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Armored Riding Jacket (+₹250)</span>
                        <span className="text-[10px] text-slate-400">CE Level 2 Back and Elbow Protection</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-300">₹250</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-white/5 cursor-pointer hover:border-orange-500/30">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={mobileHolder}
                        onChange={() => setMobileHolder(!mobileHolder)}
                        className="rounded text-orange-500 accent-orange-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Vibration Dampened Mobile Mount (+₹50)</span>
                        <span className="text-[10px] text-slate-400">Secure handlebar mount for GPS navigation</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-300">₹50</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOMER DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Full Name (As on Driving License)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="10-digit number"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Email Address (For Invoice)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="name@email.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="Friend / Family contact"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Instant OTP confirmation will be delivered directly to your WhatsApp number.</span>
              </div>
            </div>
          )}

          {/* STEP 4: ID VERIFICATION / KYC */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Driving License (DL) Number
                  </label>
                  <input
                    type="text"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Aadhaar / Passport / Voter ID
                  </label>
                  <input
                    type="text"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Simulated ID Upload Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-dashed border-white/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Govt. ID Document Attached & Verified</p>
                  <p className="text-[11px] text-slate-400">{uploadedDLName} • DigiLocker Verified Status</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Paperless KYC Approved
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BILLING & PAYMENT */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Promo Code Box */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Apply Discount Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter code (e.g. BBRFIRST)"
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase flex-1 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 text-xs text-emerald-400 font-medium">
                    ✓ Promo applied: {appliedPromo.title} (-₹{Math.round(discount)})
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Rent ({duration} × ₹{baseRate}):</span>
                  <span>₹{subtotal}</span>
                </div>
                {extrasCost > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Trip Add-Ons:</span>
                    <span>₹{extrasCost}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount Savings:</span>
                    <span>-₹{Math.round(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%):</span>
                  <span>₹{gst}</span>
                </div>
                <div className="flex justify-between text-emerald-400 border-t border-white/5 pt-2 font-bold">
                  <span>Refundable Security Deposit:</span>
                  <span>₹{deposit}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-white/10 pt-2 text-sm font-black text-white">
                  <span>Grand Total (With Deposit):</span>
                  <span className="text-xl text-orange-400">₹{totalAmountToPay}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Payment Mode
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    onClick={() => setPaymentMethod('pay_at_pickup')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'pay_at_pickup'
                        ? 'bg-orange-500/15 border-orange-500 text-white'
                        : 'bg-slate-900/50 border-white/5 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                    <div className="text-xs font-bold">Pay at Hub Pickup</div>
                    <div className="text-[10px] text-slate-400">Free booking • Zero advance required</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION RECEIPT */}
          {currentStep === 6 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Ride Booked Successfully
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
                  Ready to Ride, {customerName.split(' ')[0]}!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Booking Reference ID: <strong className="text-orange-400 font-mono text-sm">{bookingId}</strong>
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-white/10 text-left space-y-4 max-w-lg mx-auto">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Assigned Vehicle</span>
                    <h4 className="text-sm font-bold text-white">{vehicle.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Pickup Hub</span>
                    <p className="font-bold text-slate-200">{pickupHub}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Pickup Time</span>
                    <p className="font-bold text-slate-200">{pickupDate} @ {pickupTime}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Total Paid / Due</span>
                    <p className="font-bold text-orange-400">₹{totalAmountToPay} (incl. deposit)</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Emergency Helpline</span>
                    <p className="font-bold text-emerald-400">+91 8507067716</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Invoice</span>
                </button>
                <a
                  href={`https://wa.me/918507067716?text=Hi%20BBR,%20my%20booking%20ID%20is%20${bookingId}.%20Please%20send%20pickup%20location%20map.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Trip Support</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between shrink-0">
          {currentStep > 1 && currentStep < 6 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 5 && (
            <button
              onClick={handleConfirmBooking}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Booking</span>
            </button>
          )}

          {currentStep === 6 && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all ml-auto"
            >
              Done & Return Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
