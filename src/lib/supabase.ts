import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const hasSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder-project.supabase.co'
);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

const normalizePhone = (phone: string) => phone.replace(/^\+91/, '').replace(/\D/g, '');

export const supabaseHelpers = {
  async signInWithOtp(phone: string) {
    if (!supabase) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      return { demo: true, otpCode: code };
    }

    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return { demo: false, data };
  },

  async verifyOtp(phone: string, token: string) {
    if (!supabase) {
      return { demo: true, valid: token.length === 4 };
    }

    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    return { demo: false, data };
  },

  async upsertProfile(user: { name: string; phone: string }) {
    if (!supabase) {
      const localUser = { id: `local-${Date.now()}`, ...user };
      localStorage.setItem('bbr-user', JSON.stringify({ name: user.name, phone: user.phone }));
      return localUser;
    }

    const cleanPhone = normalizePhone(user.phone);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ name: user.name, phone: cleanPhone }, { onConflict: 'phone' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createBooking(booking: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleName: string;
    city: string;
    pickupHub: string;
    dropHub: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    rateType: string;
    duration: number;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    createdAt: string;
    status: string;
  }) {
    if (!supabase) {
      const savedBookings = JSON.parse(localStorage.getItem('bbr-bookings') || '[]');
      savedBookings.push(booking);
      localStorage.setItem('bbr-bookings', JSON.stringify(savedBookings));
      return booking;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          id: booking.id,
          user_id: normalizePhone(booking.userId),
          vehicle_id: booking.vehicleId,
          vehicle_name: booking.vehicleName,
          city: booking.city,
          pickup_hub: booking.pickupHub,
          drop_hub: booking.dropHub,
          pickup_date: booking.pickupDate,
          pickup_time: booking.pickupTime,
          return_date: booking.returnDate,
          return_time: booking.returnTime,
          rate_type: booking.rateType,
          duration: booking.duration,
          total_amount: booking.totalAmount,
          customer_name: booking.customerName,
          customer_phone: normalizePhone(booking.customerPhone),
          payment_method: booking.paymentMethod,
          status: booking.status,
          created_at: booking.createdAt
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
