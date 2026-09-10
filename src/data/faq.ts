import { FAQItem, ReviewItem } from '../types';

export const FAQS: FAQItem[] = [
  {
    category: 'booking',
    question: 'Where is Bharat Bike and Car Rentals located in Dehradun?',
    answer: 'Our main registered office & hub is located at Bhauwala, Uttarakhand 248007 (near Suddhowala / UPES route). We also provide doorstep delivery & pickup across ISBT Dehradun, Dehradun Railway Station, Jolly Grant Airport (DED), and Rajpur Road.'
  },
  {
    category: 'booking',
    question: 'What are your operational timings and opening hours?',
    answer: 'We are Open 7 Days a week from 8:00 AM to 9:00 PM (Closes 9 PM). Drop-offs and emergency roadside assistance operate 24/7 on call.'
  },
  {
    category: 'documents',
    question: 'What documents are required to rent a vehicle from BBR Dehradun?',
    answer: 'An Original Driving License (valid for 2-wheelers or 4-wheelers) and one Government ID proof (Aadhaar Card, Passport, or Voter ID). DigiLocker and mParivahan digital verified documents are also accepted.'
  },
  {
    category: 'payment',
    question: 'What is the security deposit policy and how soon is it refunded?',
    answer: 'Our security deposit is among the lowest in Dehradun — starting from just ₹500 for commuter scooties, ₹1,000–₹2,000 for Royal Enfields & TVS bikes, and ₹2,500–₹5,000 for cars. Deposit is refunded instantly to your GPay/UPI/Bank within 30 minutes after return.'
  },
  {
    category: 'trip',
    question: 'Can I take BBR bikes & cars to Mussoorie, Dhanaulti, Rishikesh, or Chakrata?',
    answer: 'Yes, absolutely! All our bikes, scooters, and 4x4 Thar/cars have all-Uttarakhand commercial tourist permits and are perfectly tuned for hill climbs, hairpin bends, and highway cruising.'
  },
  {
    category: 'trip',
    question: 'Are ISI helmets provided with two-wheeler rentals?',
    answer: 'Yes! Every bike and scooter rental includes 1 complimentary sanitized ISI-certified helmet. An extra pillion helmet is available for just ₹100 or free on special student offers.'
  },
  {
    category: 'trip',
    question: 'What happens in case of a breakdown or puncture?',
    answer: 'We provide 24/7 Roadside Assistance across Dehradun and uphill routes. Simply dial 0135 416 4070 or 8507067716 / 7091431158 and our mechanic team will assist or replace the vehicle immediately.'
  }
];

export const TESTIMONIALS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Aman Rawat',
    city: 'Google Verified Review',
    rating: 5,
    date: 'Recent Google Review',
    comment: 'Excellent service offer. Bike and scooty condition too good and price also reasonable. Best rental in Bhauwala, Dehradun!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    vehicleRented: 'Royal Enfield Classic 350'
  },
  {
    id: 'rev-2',
    name: 'Priyanshu Negi',
    city: 'Google Verified Review',
    rating: 5,
    date: 'Recent Google Review',
    comment: 'Good work nice person. Hired an Activa 125 for 3 days to explore Mussoorie and Sahastradhara. Very smooth handover and instant deposit refund.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    vehicleRented: 'Honda Activa 125'
  },
  {
    id: 'rev-3',
    name: 'UPES Student Rider',
    city: 'Bidholi, Dehradun',
    rating: 5,
    date: 'Recent Google Review',
    comment: 'Super convenient for UPES Bidholi & Kandoli students. The TVS Ronin & Ntorq 125 were in mint condition with great pickup. 10/10 recommend BBR!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    vehicleRented: 'TVS Ronin 225cc'
  },
  {
    id: 'rev-4',
    name: 'Rajat Chauhan',
    city: 'Dehradun Resident',
    rating: 5,
    date: 'Recent Google Review',
    comment: 'Took the Mahindra Thar 4x4 for Dhanaulti snow trip. Engine was powerful, tyres had great grip, and the staff in Bhauwala was extremely polite.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    vehicleRented: 'Mahindra Thar 4x4'
  }
];
