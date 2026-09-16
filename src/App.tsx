import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';

import { VehicleShowcase } from './components/home/VehicleShowcase';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { OffersSection } from './components/home/OffersSection';
import { HowItWorks } from './components/home/HowItWorks';
import { LocationsSection } from './components/home/LocationsSection';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { FaqSection } from './components/home/FaqSection';
import { PriceListModal } from './components/home/PriceListModal';
import { FlagshipFleetSpotlight } from './components/home/FlagshipFleetSpotlight';
import { CabShowcase } from './components/cabs/CabShowcase';
import { VehicleListing } from './components/vehicles/VehicleListing';
import { VehicleDetailsModal } from './components/vehicles/VehicleDetailsModal';
import { BookingModal } from './components/booking/BookingModal';
import { AuthModal } from './components/auth/AuthModal';
import { DigiLockerModal } from './components/booking/DigiLockerModal';
import { UserProfileBanner } from './components/auth/UserProfileBanner';
import {
  firebaseAuthService,
  loadUserSession,
  saveUserSession,
  clearUserSession,
  saveUserKyc,
  UserProfile,
  VerifiedKycData
} from './lib/firebase';

import { Vehicle, RateType, VehicleCategory } from './types';
import { VEHICLES } from './data/vehicles';
import {
  Bike,
  Car,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowUp
} from 'lucide-react';
import { InstagramIcon } from './components/common/Icons';

const AppContent: React.FC = () => {
  const { showToast } = useToast();

  // Navigation State
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCity, setSelectedCity] = useState('Dehradun (Bhauwala Main Hub)');
  const [user, setUser] = useState<UserProfile | null>(() => loadUserSession());

  // Modals State
  const [isPriceListOpen, setIsPriceListOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [bookingRateType, setBookingRateType] = useState<RateType>('fullday');
  const [bookingDuration, setBookingDuration] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    vehicle: Vehicle;
    rateType: RateType;
    duration: number;
  } | null>(null);

  // Sync Firebase Auth state — use ONLY real user data, no hardcoded fallbacks
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((fbUser) => {
      if (fbUser) {
        const current = loadUserSession();
        // Email-prefix as graceful name fallback (not a hardcoded identity)
        const nameFromEmail = fbUser.email
          ? fbUser.email.split('@')[0].replace(/[._]/g, ' ')
          : '';
        const profile: UserProfile = {
          uid:          fbUser.uid,
          name:         fbUser.displayName || current?.name || nameFromEmail || '',
          email:        fbUser.email         || current?.email    || undefined,
          phone:        fbUser.phoneNumber   || current?.phone   || '',
          photoURL:     fbUser.photoURL      || current?.photoURL|| undefined,
          authProvider: fbUser.phoneNumber ? 'phone' : 'google',
          kyc:          current?.uid === fbUser.uid ? (current?.kyc || null) : null
        };
        setUser(profile);
        saveUserSession(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    // signOut() already calls clearUserSession(uid) internally
    await firebaseAuthService.signOut();
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  // Handle DigiLocker OAuth redirect query params (?kyc_status=success or ?kyc_error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kycStatus = params.get('kyc_status');
    const kycError = params.get('kyc_error');
    const uidFromUrl = params.get('uid');

    if (kycStatus === 'success') {
      const activeUid = uidFromUrl || user?.uid || loadUserSession()?.uid;
      if (activeUid) {
        fetch(`/api/digilocker/status?uid=${encodeURIComponent(activeUid)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.verified && data.kyc) {
              saveUserKyc(data.kyc, activeUid);
              setUser((prev) => (prev ? { ...prev, kyc: data.kyc } : prev));
              showToast('DigiLocker Driving Licence verified successfully!', 'success');
            }
          })
          .catch(() => {});
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (kycError) {
      showToast(`DigiLocker Notice: ${decodeURIComponent(kycError).replace(/_/g, ' ')}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);


  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(['gt-continental-650', 'activa-125']);

  const handleToggleWishlist = (vehicleId: string) => {
    setWishlist((prev) => {
      const isSaved = prev.includes(vehicleId);
      if (isSaved) {
        showToast('Removed from saved vehicles', 'info');
        return prev.filter((id) => id !== vehicleId);
      } else {
        showToast('Added to saved vehicles!', 'success');
        return [...prev, vehicleId];
      }
    });
  };

  // Search Submit from Hero SearchWidget
  const handleHeroSearch = (params: {
    city: string;
    pickupLocation: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    category: 'all' | VehicleCategory;
    rateType: RateType;
  }) => {
    setSelectedCity(params.city);
    setBookingRateType(params.rateType);
    if (params.category === 'bike') setCurrentTab('bikes');
    else if (params.category === 'scooter') setCurrentTab('scooters');
    else if (params.category === 'car') setCurrentTab('cars');
    else if (params.category === 'cab') setCurrentTab('cabs');
    else setCurrentTab('bikes');

    showToast(`Found available rides in ${params.city}!`, 'info');
  };

  // Launch Multi-Step Booking Flow
  const handleStartBooking = (
    vehicle: Vehicle,
    rateType: RateType = 'fullday',
    duration: number = 1
  ) => {
    setBookingVehicle(vehicle);
    setBookingRateType(rateType);
    setBookingDuration(duration);

    if (!user) {
      setPendingBooking({ vehicle, rateType, duration });
      showToast('Please sign in to proceed with your rental booking.', 'info');
      setIsAuthOpen(true);
      return;
    }

    setIsBookingModalOpen(true);
  };


  // Apply Promo Offer
  const handleApplyOffer = (code: string) => {
    showToast(`Offer ${code} activated! Choose a vehicle to continue.`, 'success');
    // Preselect featured vehicle for instant booking demo
    const featured = VEHICLES[0];
    handleStartBooking(featured, 'fullday', 2);
  };

  return (
    <div className="min-h-screen text-[#F4F5F2] flex flex-col max-w-full overflow-x-hidden" style={{ backgroundColor: '#0A0A0A', fontFamily: 'Manrope, system-ui, sans-serif' }}>
      {/* Sticky Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          showToast(`Active hub updated to ${city}`, 'info');
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPriceList={() => setIsPriceListOpen(true)}
        onOpenDigiLocker={() => setIsDigiLockerModalOpen(true)}
        onSignOut={handleSignOut}
        user={user}
      />

      {/* Dynamic Authenticated User Profile & DigiLocker KYC Banner (Req 4, 6, 14) */}
      {user && (
        <UserProfileBanner
          user={user}
          onSignOut={handleSignOut}
          onKycUpdated={(kycData) => {
            const updated = { ...user, kyc: kycData };
            setUser(updated);
            saveUserSession(updated);
          }}
        />
      )}

      {/* Main App Body */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <>
            {/* Cinematic Hero */}
            <HeroSection
              onSearch={handleHeroSearch}
              selectedCity={selectedCity}
              onOpenPriceList={() => setIsPriceListOpen(true)}
              onNavigateToCatalog={() => {
                setCurrentTab('bikes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Flagship Fleet Spotlight Showcase (Clean, High-Converting, Zero 3D Lag) */}
            <FlagshipFleetSpotlight
              onBookNow={(v, rate) => handleStartBooking(v, rate)}
              onSelectVehicle={(v) => setSelectedVehicleForDetails(v)}
            />

            {/* Uttarakhand Rental Cabs & Outstation Taxi Services */}
            <CabShowcase />




            {/* Popular Vehicle Showcase */}
            <VehicleShowcase
              onSelectVehicle={(v) => setSelectedVehicleForDetails(v)}
              onBookNow={(v, rate) => handleStartBooking(v, rate)}
              onViewAll={() => {
                setCurrentTab('bikes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* Why Choose Us */}
            <WhyChooseUs />

            {/* Special Promo Offers */}
            <OffersSection onApplyOffer={handleApplyOffer} />

            {/* How It Works */}
            <HowItWorks />

            {/* Pan-India Rental Hubs */}
            <LocationsSection
              onSelectCity={(city) => {
                setSelectedCity(city);
                setCurrentTab('bikes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(`Viewing fleet for ${city} hub`, 'info');
              }}
            />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* FAQs */}
            <FaqSection />
          </>
        )}

        {/* VIEW 2: BIKES & MOTORCYCLES */}
        {currentTab === 'bikes' && (
          <VehicleListing
            initialCategory="bike"
            initialCity={selectedCity}
            onSelectVehicle={(v) => setSelectedVehicleForDetails(v)}
            onBookNow={(v, rate) => handleStartBooking(v, rate)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* VIEW 3: SCOOTERS */}
        {currentTab === 'scooters' && (
          <VehicleListing
            initialCategory="scooter"
            initialCity={selectedCity}
            onSelectVehicle={(v) => setSelectedVehicleForDetails(v)}
            onBookNow={(v, rate) => handleStartBooking(v, rate)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* VIEW 4: CARS & THAR 4X4 */}
        {currentTab === 'cars' && (
          <VehicleListing
            initialCategory="car"
            initialCity={selectedCity}
            onSelectVehicle={(v) => setSelectedVehicleForDetails(v)}
            onBookNow={(v, rate) => handleStartBooking(v, rate)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* VIEW: RENTAL CABS & OUTSTATION TAXIS */}
        {currentTab === 'cabs' && (
          <div className="py-8">
            <CabShowcase />
          </div>
        )}

        {/* VIEW 5: LOCATIONS */}
        {currentTab === 'locations' && (
          <div className="py-12">
            <LocationsSection
              onSelectCity={(city) => {
                setSelectedCity(city);
                setCurrentTab('bikes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(`Switched to ${city} hub`, 'info');
              }}
            />
          </div>
        )}

        {/* VIEW 6: OFFERS */}
        {currentTab === 'offers' && (
          <div className="py-12">
            <OffersSection onApplyOffer={handleApplyOffer} />
          </div>
        )}

        {/* VIEW 7: HOW IT WORKS */}
        {currentTab === 'how-it-works' && (
          <div className="py-12">
            <HowItWorks />
            <FaqSection />
          </div>
        )}

        {/* VIEW 8: CONTACT & SUPPORT */}
        {currentTab === 'contact' && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                style={{ backgroundColor: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)', color: '#FF6A00' }}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>We're Here for You 24/7</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black" style={{ color: '#F4F5F2' }}>
                Contact <span style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF8C33 50%, #CC5500 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BBR Support</span>
              </h1>
              <p className="text-sm sm:text-base mt-3" style={{ color: '#9BA1A5' }}>
                Reach our team anytime for custom touring plans, group bookings, mechanical assistance, or pickup details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Phone */}
              <div
                className="p-8 rounded-3xl text-center space-y-4 backdrop-blur-md transition-all hover:-translate-y-1"
                style={{ background: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: 'rgba(255,106,0,0.1)', border: '1px solid rgba(255,106,0,0.2)' }}
                >
                  <Phone className="w-7 h-7" style={{ color: '#FF6A00' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#F4F5F2' }}>Direct Helplines & Landline</h3>
                <p className="text-xs" style={{ color: '#656C70' }}>Bhauwala, Dehradun Office • Open · Closes 9 PM</p>
                <div className="space-y-1 text-sm font-bold font-mono" style={{ color: '#FF6A00' }}>
                  <p><a href="tel:01354164070" className="hover:opacity-80 transition-opacity">Landline: 0135 416 4070</a></p>
                  <p><a href="tel:8507067716" className="hover:opacity-80 transition-opacity">Mobile: +91 8507067716</a></p>
                  <p><a href="tel:7091431158" className="hover:opacity-80 transition-opacity">Mobile: +91 7091431158</a></p>
                </div>
              </div>

              {/* Card 2: Instagram */}
              <div
                className="p-8 rounded-3xl text-center space-y-4 backdrop-blur-md transition-all hover:-translate-y-1"
                style={{ background: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}
                >
                  <InstagramIcon className="w-7 h-7" style={{ color: '#ec4899' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#F4F5F2' }}>Follow on Instagram</h3>
                <p className="text-xs" style={{ color: '#656C70' }}>Tag your travel reels, photos & stories with #RideWithBBR.</p>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(236,72,153,0.12)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.25)' }}
                >
                  @bharat_bike_and_car_rental
                </a>
              </div>

              {/* Card 3: Email */}
              <div
                className="p-8 rounded-3xl text-center space-y-4 backdrop-blur-md transition-all hover:-translate-y-1"
                style={{ background: 'rgba(26,26,26,0.7)', border: '1px solid #2A2A2A' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  <Mail className="w-7 h-7" style={{ color: '#60a5fa' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#F4F5F2' }}>Email Inquiries</h3>
                <p className="text-xs" style={{ color: '#656C70' }}>For corporate tie-ups, film shoots & long-term leases.</p>
                <p className="text-sm font-bold" style={{ color: '#60a5fa' }}>bharatbikerentaldehradun@gmail.com</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modals & Dialogs */}
      <PriceListModal
        isOpen={isPriceListOpen}
        onClose={() => setIsPriceListOpen(false)}
        onSelectVehicle={(vehicle) => handleStartBooking(vehicle, 'fullday')}
      />

      <VehicleDetailsModal
        vehicle={selectedVehicleForDetails}
        onClose={() => setSelectedVehicleForDetails(null)}
        onBook={(vehicle, rateType, duration) => {
          setSelectedVehicleForDetails(null);
          handleStartBooking(vehicle, rateType, duration);
        }}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialVehicle={bookingVehicle}
        initialRateType={bookingRateType}
        initialCity={selectedCity}
        initialDuration={bookingDuration}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingBooking(null);
        }}
        pendingVehicleName={pendingBooking?.vehicle.name}
        onLoginSuccess={(userData) => {
          const stored = loadUserSession() || {
            uid: `user-${Date.now()}`,
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            authProvider: 'phone' as const,
            kyc: null
          };
          setUser(stored);
          if (pendingBooking) {
            setBookingVehicle(pendingBooking.vehicle);
            setBookingRateType(pendingBooking.rateType);
            setBookingDuration(pendingBooking.duration);
            setIsBookingModalOpen(true);
            setPendingBooking(null);
          }
        }}
      />

      <DigiLockerModal
        isOpen={isDigiLockerModalOpen}
        onClose={() => setIsDigiLockerModalOpen(false)}
        riderName={user?.name || 'Rider'}
        riderPhone={user?.phone || ''}
        user={user}
        onVerificationSuccess={(kycData) => {
          if (user) {
            const updated: UserProfile = { ...user, kyc: kycData };
            setUser(updated);
            saveUserSession(updated);
            saveUserKyc(kycData, user.uid);
          }
        }}
      />


      {/* Rich Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPriceList={() => setIsPriceListOpen(true)}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setCurrentTab('bikes');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Actions: Accessible Back to Top & Instant WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-xl transition-all hover:scale-110 active:scale-95 group"
            style={{
              backgroundColor: 'rgba(26,26,26,0.8)',
              border: '1px solid rgba(255,106,0,0.3)',
              color: '#FF6A00'
            }}
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}

        <a
          href="https://wa.me/918507067716?text=Hi%20BBR%20Rental!%20I%20want%20to%20inquire%20about%20vehicle%20rental%20in%20Dehradun."
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 border border-emerald-400/40"
          title="Chat with BBR Support on WhatsApp"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="hidden sm:inline">WhatsApp Instant Booking</span>
          <span className="sm:hidden font-mono">+91 8507067716</span>
        </a>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
