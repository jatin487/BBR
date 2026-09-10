import { CabVehicle, CabPackage } from '../types';

export const CAB_FLEET: CabVehicle[] = [
  {
    id: 'cab-innova-crysta',
    name: 'Toyota Innova Crysta (Luxury 7-Seater)',
    model: 'Innova Crysta 2.4 VX / ZX',
    seating: '6 or 7 Passengers + Chauffeur',
    luggage: '4 Large Bags + 2 Small Bags',
    ac: true,
    perKmRate: 18,
    minKmPerDay: 250,
    driverAllowance: 400,
    image: '/vehicles/innova-crysta.jpg',
    category: 'suv',
    tagline: 'King of Hill Touring — Unmatched Reclining Comfort & Mountain Power',
    rating: 4.9,
    reviewCount: 384,
    features: [
      'Experienced Hill-Certified Driver',
      'Dual Rear AC Vents',
      'Captain Reclining Seats',
      'Music System with Bluetooth',
      'Sanitized Clean Cabin'
    ]
  },
  {
    id: 'cab-ertiga',
    name: 'Maruti Suzuki Ertiga (Smart MPV)',
    model: 'Ertiga ZXi Hybrid',
    seating: '6 Passengers + Chauffeur',
    luggage: '3 Large Bags + 2 Duffels',
    ac: true,
    perKmRate: 14,
    minKmPerDay: 250,
    driverAllowance: 350,
    image: '/vehicles/maruti-ertiga.jpg',
    category: 'suv',
    tagline: 'Best Budget MPV for Mussoorie, Rishikesh & Dhanaulti Family Trips',
    rating: 4.8,
    reviewCount: 290,
    features: [
      'High Ground Clearance for Hills',
      'Dual AC & Fast Phone Charging',
      'Roof Luggage Carrier Option',
      'Uniformed Verified Chauffeur',
      'Transparent Per-KM Billing'
    ]
  },
  {
    id: 'cab-dzire',
    name: 'Maruti Suzuki Dzire (Prime Sedan)',
    model: 'Dzire ZXi / Tour S',
    seating: '4 Passengers + Chauffeur',
    luggage: '2 Large Bags + 2 Backpacks',
    ac: true,
    perKmRate: 11,
    minKmPerDay: 250,
    driverAllowance: 300,
    image: '/vehicles/maruti-dzire.jpg',
    category: 'sedan',
    tagline: 'Ideal for Jolly Grant Airport Transfers, Railway Station & Local Drops',
    rating: 4.8,
    reviewCount: 420,
    features: [
      'Smooth Highway Ride',
      'Luggage Boot Space',
      'Clean Air Conditioning',
      'Toll & Parking Direct Pass',
      'Guaranteed On-Time Arrival'
    ]
  },
  {
    id: 'cab-scorpio-n',
    name: 'Mahindra Scorpio-N (4x4 Beast)',
    model: 'Scorpio-N Z8L 4WD',
    seating: '6 Passengers + Chauffeur',
    luggage: '3 Large Bags',
    ac: true,
    perKmRate: 20,
    minKmPerDay: 250,
    driverAllowance: 450,
    image: '/vehicles/scorpio-n.jpg',
    category: 'luxury',
    tagline: 'All-Terrain 4WD Power for Offbeat Chopta, Auli & High Altitude Expeditions',
    rating: 4.9,
    reviewCount: 168,
    features: [
      'Electronic 4x4 Shift-on-Fly',
      'Premium Sony 3D Soundstage',
      'Extra Mountain Safety Airbags',
      'High Clearance Terrain Handling',
      'Chauffeur with 10+ Yrs Hill Experience'
    ]
  },
  {
    id: 'cab-tempo-traveller',
    name: 'Force Urbania / Tempo Traveller (12/17 Seater)',
    model: 'Force Urbania Luxury Cruiser',
    seating: '12 to 17 Passengers + Chauffeur',
    luggage: '12 Large Bags in Boot & Overhead',
    ac: true,
    perKmRate: 26,
    minKmPerDay: 250,
    driverAllowance: 500,
    image: '/vehicles/tempo-traveller.jpg',
    category: 'tempo',
    tagline: 'Grand Group & Corporate Pilgrimage Van for Char Dham, Rishikesh & Weddings',
    rating: 4.9,
    reviewCount: 115,
    features: [
      'Pushback Reclining Seats with Armrests',
      'Individual AC Vents & USB Ports',
      'High Roof Standing Room',
      'Ample Boot Space for Luggage',
      'First Aid & Hill-Safety Certified'
    ]
  }
];

export const CAB_PACKAGES: CabPackage[] = [
  {
    id: 'pkg-airport-transfer',
    title: 'Dehradun Airport (Jolly Grant) ⇄ Dehradun / Bhauwala',
    fromCity: 'Dehradun Airport (DED)',
    toCity: 'Bhauwala / Dehradun City / UPES',
    distanceKm: 42,
    durationApprox: '1 hr 15 mins',
    description: 'Guaranteed on-time flight pickup and drop. Driver waits with name placard, zero surge pricing, flight delay tracking included.',
    startingPrice: 1299,
    isPopular: true,
    tag: 'Flight Transfer',
    image: '/vehicles/pkg-airport.jpg',
    features: [
      'No Cancellation Charge for Flight Delays',
      'Doorstep Terminal Gate Meet & Greet',
      'AC Sedan (Dzire) or SUV (Ertiga / Innova)',
      'All Highway Tolls Included'
    ]
  },
  {
    id: 'pkg-mussoorie-day',
    title: 'Dehradun ⇄ Mussoorie & Kempty Falls Sightseeing Tour',
    fromCity: 'Bhauwala / Dehradun Hub',
    toCity: 'Mussoorie • Mall Road • Kempty Falls • Lal Tibba • Company Garden',
    distanceKm: 95,
    durationApprox: 'Full Day (8-10 Hours)',
    description: 'Panoramic Queen of Hills round-trip tour covering Mall Road, Kempty Falls, George Everest peak point, and Lal Tibba sunset.',
    startingPrice: 2499,
    isPopular: true,
    tag: 'Best Selling Tour',
    image: '/vehicles/pkg-mussoorie.jpg',
    features: [
      'Flexible Sightseeing Stops & Photo Halts',
      'Experienced Mountain Hill Chauffeur',
      'Covers Kempty Falls & George Everest House',
      'Sedan / Ertiga / Innova Crysta Options'
    ]
  },
  {
    id: 'pkg-rishikesh-haridwar',
    title: 'Dehradun ⇄ Rishikesh & Haridwar Ganga Aarti Same-Day Tour',
    fromCity: 'Dehradun',
    toCity: 'Rishikesh (Ram Jhula, Lakshman Jhula, Beatles Ashram) & Haridwar Har Ki Pauri',
    distanceKm: 140,
    durationApprox: '10 to 12 Hours',
    description: 'Spiritual and adventure circuit. Experience white water rafting pickup in Shivpuri, cafe hopping in Rishikesh, and the sacred evening Har Ki Pauri Ganga Aarti.',
    startingPrice: 2999,
    isPopular: true,
    tag: 'Spiritual & Adventure',
    image: '/vehicles/pkg-rishikesh.jpg',
    features: [
      'Evening Ganga Aarti Witnessing Time Included',
      'Cafe Hopping in Tapovan & Laxman Jhula',
      'AC Highway Cruiser with Toll Receipts',
      'Night Safe Return to Bhauwala / Dehradun'
    ]
  },
  {
    id: 'pkg-dhanaulti-kanatal',
    title: 'Dehradun ⇄ Dhanaulti, Eco Park & Surkanda Devi Peak',
    fromCity: 'Dehradun',
    toCity: 'Dhanaulti Eco Park • Kanatal • Surkanda Devi Ropeway',
    distanceKm: 160,
    durationApprox: 'Full Day Expedition',
    description: 'Escape the crowds into serene deodar and pine forests. Snow-capped Himalayan panorama views and alpine nature trails.',
    startingPrice: 3499,
    tag: 'Himalayan Escape',
    image: '/vehicles/pkg-dhanaulti.jpg',
    features: [
      'High Elevation Scenic Passes',
      'Surkanda Devi Ropeway Halt',
      'Pine Forest Eco Park Visit',
      'SUV with Maximum Grip and Clearance'
    ]
  },
  {
    id: 'pkg-chardham-yatra',
    title: 'Char Dham Yatra & Do Dham Cab Package (Kedarnath / Badrinath)',
    fromCity: 'Dehradun / Haridwar',
    toCity: 'Yamunotri • Gangotri • Kedarnath (Sonprayag) • Badrinath',
    distanceKm: 1200,
    durationApprox: '6 to 11 Days Custom Pilgrimage',
    description: 'Holistic pilgrimage transport package with veteran hill drivers who know every mountain checkpoint, emergency route, and holy shrine.',
    startingPrice: 34999,
    tag: 'Pilgrimage Special',
    image: '/vehicles/pkg-chardham.jpg',
    features: [
      'Dedicated Driver Accommodation & Allowance Included',
      'Oxygen Cylinder & Emergency Hill Kit Available',
      'Innova Crysta or 12-Seater Tempo Traveller',
      'Pilgrimage Route Green Card & Permit Handled'
    ]
  },
  {
    id: 'pkg-delhi-oneway',
    title: 'Dehradun ⇄ Delhi NCR One-Way Express Cab',
    fromCity: 'Dehradun / Bhauwala',
    toCity: 'Delhi Airport (DEL) / Noida / Gurgaon / Central Delhi',
    distanceKm: 260,
    durationApprox: '4.5 to 5 Hours (Via Expressway)',
    description: 'Doorstep pickup from Dehradun directly to Delhi IGI Airport Terminal 3 or home. Fast, smooth expressway journey.',
    startingPrice: 3999,
    isPopular: true,
    tag: 'Intercity Express',
    image: '/vehicles/pkg-delhi.jpg',
    features: [
      'Direct via Delhi-Dehradun Expressway Corridor',
      'Zero Hidden Return Fare in One-Way',
      'Refreshment & Highway Dhaba Stop on Request',
      'Clean Sanitized Sedan or SUV'
    ]
  }
];
