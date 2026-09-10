import { LocationHub } from '../types';

export const LOCATIONS: LocationHub[] = [
  {
    id: 'dehradun-bhauwala',
    city: 'Dehradun (Bhauwala Main Hub)',
    state: 'Uttarakhand',
    landmark: 'Bhauwala Main Center, Near UPES / Suddhowala',
    address: 'Bhauwala, Dehradun, Uttarakhand 248007',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80',
    vehicleCount: 45,
    popularHub: true,
    coordinates: { lat: 30.3853, lng: 77.9258 },
    branches: [
      {
        id: 'ddn-main',
        name: 'BBR Bhauwala Headquarters',
        address: 'Bhauwala, Dehradun, Uttarakhand 248007 (Open · Closes 9 PM)',
        phone: '+91 8507067716 / 0135 416 4070'
      },
      {
        id: 'ddn-upes',
        name: 'UPES Bidholi & Kandoli Delivery Point',
        address: 'Bidholi Knowledge Acres / Kandoli Gate',
        phone: '+91 7091431158'
      }
    ]
  },
  {
    id: 'dehradun-isbt',
    city: 'ISBT Dehradun',
    state: 'Uttarakhand',
    landmark: 'Haridwar Bypass & ISBT Terminal Gate',
    address: 'Opposite ISBT Main Entry, Dehradun 248002',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80',
    vehicleCount: 30,
    popularHub: true,
    coordinates: { lat: 30.2858, lng: 78.0069 },
    branches: [
      {
        id: 'ddn-isbt-desk',
        name: 'ISBT Bus Stand Express Point',
        address: 'ISBT Commercial Plaza, Dehradun',
        phone: '+91 8507067716'
      }
    ]
  },
  {
    id: 'dehradun-railway',
    city: 'Dehradun Railway Station',
    state: 'Uttarakhand',
    landmark: 'Clock Tower & Station Road',
    address: 'Near Railway Station Exit & Gandhi Park, Dehradun 248001',
    image: 'https://images.unsplash.com/photo-1600684947936-22bb6bc48d7c?auto=format&fit=crop&w=1000&q=80',
    vehicleCount: 25,
    popularHub: true,
    coordinates: { lat: 30.3165, lng: 78.0322 },
    branches: [
      {
        id: 'ddn-rly',
        name: 'Railway Junction Pickup Desk',
        address: 'Station Road, Dehradun',
        phone: '+91 7091431158'
      }
    ]
  },
  {
    id: 'dehradun-jollygrant',
    city: 'Jolly Grant Airport (DED)',
    state: 'Uttarakhand',
    landmark: 'Airport Terminal Arrivals Gate',
    address: 'Dehradun Airport (DED), Rishikesh Road, Dehradun 248140',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    vehicleCount: 20,
    popularHub: true,
    coordinates: { lat: 30.1897, lng: 78.1803 },
    branches: [
      {
        id: 'ddn-airport',
        name: 'Jolly Grant Airport Desk',
        address: 'Arrivals Gate 2 Lounge',
        phone: '+91 8507067716'
      }
    ]
  },
  {
    id: 'dehradun-rajpur',
    city: 'Rajpur Road / Mussoorie Diversion',
    state: 'Uttarakhand',
    landmark: 'Pacific Mall & Mussoorie Bypass',
    address: 'Rajpur Road, Near Mussoorie Toll Diversion, Dehradun 248009',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    vehicleCount: 35,
    popularHub: true,
    coordinates: { lat: 30.3619, lng: 78.0674 },
    branches: [
      {
        id: 'ddn-rajpur-hub',
        name: 'Mussoorie Gateway Lounge',
        address: 'Rajpur Road, Dehradun',
        phone: '+91 8507067716'
      }
    ]
  }
];
