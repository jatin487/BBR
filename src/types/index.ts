export type VehicleCategory = 'bike' | 'scooter' | 'car' | 'cab';

export type RateType = 'fullday' | 'hourly' | 'night';

export type CabTripType = 'outstation_oneway' | 'outstation_round' | 'airport' | 'local_hourly';

export interface CabPackage {
  id: string;
  title: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  durationApprox: string;
  description: string;
  startingPrice: number;
  isPopular?: boolean;
  tag: string;
  image: string;
  features: string[];
}

export interface CabVehicle {
  id: string;
  name: string;
  model: string;
  seating: string;
  luggage: string;
  ac: boolean;
  perKmRate: number;
  minKmPerDay: number;
  driverAllowance: number;
  image: string;
  category: 'sedan' | 'suv' | 'luxury' | 'tempo';
  tagline: string;
  rating: number;
  reviewCount: number;
  features: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  category: VehicleCategory;
  tagline: string;
  image: string;
  gallery: string[];
  // Pricing strictly matching BBR Price List
  fullDayRent: number; // 24 Hours
  hourlyRent: number | null; // N/A for premium cruisers, else per hour
  nightRent: number; // 12 Hours
  securityDeposit: number;
  engineCC: number;
  mileage: string;
  transmission: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'CNG' | 'Electric';
  fuelTank: string;
  topSpeed?: string;
  power?: string;
  weight?: string;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  helmetIncluded: number;
  availableCount: number;
  features: string[];
}

export interface LocationHub {
  id: string;
  city: string;
  state: string;
  landmark: string;
  address: string;
  image: string;
  vehicleCount: number;
  popularHub: boolean;
  coordinates: { lat: number; lng: number };
  branches: { id: string; name: string; address: string; phone: string }[];
}

export interface PromoOffer {
  code: string;
  title: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount?: number;
  minAmount?: number;
  description: string;
  badge: string;
  expiresIn: string;
}

export interface FilterState {
  category: 'all' | VehicleCategory;
  city: string;
  brand: string[];
  priceRange: [number, number];
  rateType: RateType;
  transmission: string[];
  fuelType: string[];
  searchQuery: string;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
}

export interface BookingState {
  step: number;
  vehicle: Vehicle | null;
  rateType: RateType;
  city: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  hoursOrDays: number;
  // Extras
  extraHelmet: boolean;
  ridingJacket: boolean;
  mobileHolder: boolean;
  roadsideAssistancePack: boolean;
  // Customer
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  emergencyContact: string;
  dlNumber: string;
  aadhaarNumber: string;
  dlFrontPreview?: string;
  aadhaarFrontPreview?: string;
  // Billing
  appliedPromo: PromoOffer | null;
  baseRent: number;
  extrasTotal: number;
  discountAmount: number;
  gstAmount: number;
  securityDeposit: number;
  grandTotal: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'pay_at_pickup';
  bookingId?: string;
  isConfirmed: boolean;
}

export interface ReviewItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
  vehicleRented: string;
  tripPhoto?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'booking' | 'documents' | 'payment' | 'trip';
}
