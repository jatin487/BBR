import { PromoOffer } from '../types';

export const OFFERS: PromoOffer[] = [
  {
    code: 'BBRFIRST',
    title: 'First Ride Welcome Gift',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 400,
    minAmount: 500,
    description: 'Get flat 15% OFF on your very first bike, scooter or car rental with BBR.',
    badge: 'Popular',
    expiresIn: 'Active All Year'
  },
  {
    code: 'WEEKENDVIBES',
    title: 'Weekend Explorer Special',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 600,
    minAmount: 1200,
    description: 'Save 20% on all Royal Enfield and Super Scooters for Friday to Sunday bookings.',
    badge: 'Weekend Deal',
    expiresIn: 'Fri-Sun'
  },
  {
    code: 'LONGTRIP',
    title: 'Extended Tourer (3+ Days)',
    discountType: 'flat',
    discountValue: 750,
    minAmount: 2500,
    description: 'Flat ₹750 instant cashback discount for road trips spanning 3 days or more.',
    badge: 'Road Trips',
    expiresIn: 'Valid on 3+ Days'
  },
  {
    code: 'STUDENTRIDE',
    title: 'Campus Youth Discount',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 300,
    minAmount: 400,
    description: 'Show student ID at pickup and get an extra 10% off on all 113cc-160cc bikes & scooters.',
    badge: 'Students',
    expiresIn: 'Valid with College ID'
  }
];
