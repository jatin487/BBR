import fs from 'fs';
import path from 'path';

const STORAGE_KEY = 'bbr_backend_data';
const PERSISTENT_FILE = process.env.VERCEL
  ? '/tmp/bbr_backend_data.json'
  : path.join(process.cwd(), '.bbr_backend_data.json');

export type StoredUser = {
  id: string;
  uid?: string;
  name: string;
  phone?: string;
  email?: string;
  photoURL?: string;
  authProvider?: string;
  kyc?: BackendKycRecord | null;
  createdAt?: string;
};

export type StoredBooking = {
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
  customerEmail?: string;
  paymentMethod: string;
  createdAt: string;
  status: string;
  // Taxi-specific fields
  type?: 'bike' | 'taxi';
  pickupAddress?: string;
  dropAddress?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  estimatedFare?: number;
  estimatedDistance?: string;
  passengerCount?: number;
  specialInstructions?: string;
};

export type BackendKycRecord = {
  status: 'verified' | 'pending' | 'rejected';
  uid: string;
  dlNumber: string;
  holderName: string;
  dob?: string;
  validTill?: string;
  vehicleClasses?: string[];
  digilockerDocId?: string;
  verificationTimestamp?: string;
  securityHash?: string;
  verifiedAt?: string;
};

export type StoredData = {
  users: StoredUser[];
  bookings: StoredBooking[];
  kycRecords?: Record<string, BackendKycRecord>;
};

let inMemoryData: StoredData = { users: [], bookings: [], kycRecords: {} };

const readData = (): StoredData => {
  // 1. Try file-based storage first (/tmp on Lambda/Vercel or local root in dev)
  try {
    if (fs.existsSync(PERSISTENT_FILE)) {
      const content = fs.readFileSync(PERSISTENT_FILE, 'utf-8');
      if (content) {
        const parsed = JSON.parse(content) as StoredData;
        inMemoryData = {
          users: Array.isArray(parsed.users) ? parsed.users : inMemoryData.users,
          bookings: Array.isArray(parsed.bookings) ? parsed.bookings : inMemoryData.bookings,
          kycRecords: parsed.kycRecords || inMemoryData.kycRecords || {},
        };
        return inMemoryData;
      }
    }
  } catch {
    // Ignore file read error, proceed to fallback
  }

  // 2. Try globalThis.localStorage (if present)
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      const raw = globalThis.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredData;
        inMemoryData = {
          users: Array.isArray(parsed.users) ? parsed.users : inMemoryData.users,
          bookings: Array.isArray(parsed.bookings) ? parsed.bookings : inMemoryData.bookings,
          kycRecords: parsed.kycRecords || inMemoryData.kycRecords || {},
        };
        return inMemoryData;
      }
    } catch {
      // Ignore
    }
  }

  if (!inMemoryData.kycRecords) {
    inMemoryData.kycRecords = {};
  }
  return inMemoryData;
};

const writeData = (data: StoredData) => {
  inMemoryData = data;

  // 1. Write to file system
  try {
    fs.writeFileSync(PERSISTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore write failure if disk is read-only
  }

  // 2. Write to globalThis.localStorage if available
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
};

export const getUsers = (): StoredUser[] => readData().users;
export const getBookings = (): StoredBooking[] => readData().bookings;

const normalizeDigits = (val?: string) => (val || '').replace(/\D/g, '').slice(-10);

export const saveUser = (user: StoredUser): StoredUser => {
  const data = readData();
  const userUid = user.uid || user.id;
  const userPhoneDigits = normalizeDigits(user.phone);
  const userEmail = (user.email || '').trim().toLowerCase();

  const existing = data.users.find((entry) => {
    if (entry.id && entry.id === user.id) return true;
    if (entry.uid && userUid && entry.uid === userUid) return true;
    if (userPhoneDigits && normalizeDigits(entry.phone) === userPhoneDigits) return true;
    if (userEmail && (entry.email || '').trim().toLowerCase() === userEmail) return true;
    return false;
  });

  const normalizedUser: StoredUser = {
    ...existing,
    ...user,
    id: user.id || existing?.id || userUid,
    uid: userUid || existing?.uid || user.id,
    name: user.name || existing?.name || 'Rider',
    phone: user.phone || existing?.phone || '',
    email: user.email || existing?.email || '',
    createdAt: existing?.createdAt || user.createdAt || new Date().toISOString(),
  };

  const nextUsers = existing
    ? data.users.map((entry) => (entry === existing ? normalizedUser : entry))
    : [...data.users, normalizedUser];

  const next = { ...data, users: nextUsers };
  writeData(next);
  return normalizedUser;
};

export const deleteUser = (uidOrId: string): boolean => {
  const data = readData();
  const nextUsers = data.users.filter((u) => u.id !== uidOrId && u.uid !== uidOrId);
  if (nextUsers.length !== data.users.length) {
    writeData({ ...data, users: nextUsers });
    return true;
  }
  return false;
};

export const saveBooking = (booking: StoredBooking): StoredBooking => {
  const data = readData();
  const next = { ...data, bookings: [...data.bookings, booking] };
  writeData(next);
  return booking;
};

export const updateBooking = (id: string, updates: Partial<StoredBooking>): StoredBooking | null => {
  const data = readData();
  const nextBookings = data.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
  writeData({ ...data, bookings: nextBookings });
  return nextBookings.find((b) => b.id === id) || null;
};

export const getUserByPhone = (phone: string): StoredUser | undefined => {
  const digits = normalizeDigits(phone);
  return getUsers().find((u) => normalizeDigits(u.phone) === digits);
};

export const getUserByUid = (uid: string): StoredUser | undefined => {
  return getUsers().find((u) => u.id === uid || u.uid === uid);
};

export const getUserKyc = (uid: string): BackendKycRecord | null => {
  if (!uid) return null;
  const data = readData();
  return data.kycRecords?.[uid] || null;
};

export const saveUserKyc = (uid: string, kyc: BackendKycRecord): BackendKycRecord => {
  if (!uid) throw new Error('UID is required to save KYC');
  const data = readData();
  const kycRecords = { ...(data.kycRecords || {}), [uid]: { ...kyc, uid } };
  writeData({ ...data, kycRecords });
  return kycRecords[uid];
};

export const deleteUserKyc = (uid: string): boolean => {
  if (!uid) return false;
  const data = readData();
  if (!data.kycRecords?.[uid]) return false;
  const { [uid]: _, ...rest } = data.kycRecords;
  writeData({ ...data, kycRecords: rest });
  return true;
};

export const clearData = (): void => {
  writeData({ users: [], bookings: [], kycRecords: {} });
};
