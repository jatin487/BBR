const STORAGE_KEY = 'bbr_backend_data';

let inMemoryData: StoredData = { users: [], bookings: [], kycRecords: {} };

export type StoredUser = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
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
  paymentMethod: string;
  createdAt: string;
  status: string;
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

const readData = (): StoredData => {
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      const raw = globalThis.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryData));
        return inMemoryData;
      }
      const parsed = JSON.parse(raw) as StoredData;
      inMemoryData = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        kycRecords: parsed.kycRecords || {}
      };
      return inMemoryData;
    } catch {
      return inMemoryData;
    }
  }

  if (!inMemoryData.kycRecords) {
    inMemoryData.kycRecords = {};
  }
  return inMemoryData;
};

const writeData = (data: StoredData) => {
  inMemoryData = data;
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const getUsers = () => readData().users;
export const getBookings = () => readData().bookings;

export const saveUser = (user: StoredUser) => {
  const data = readData();
  const existing = data.users.find((entry) => entry.phone === user.phone || entry.id === user.id);
  const nextUsers = existing
    ? data.users.map((entry) => (entry.phone === user.phone || entry.id === user.id ? user : entry))
    : [...data.users, user];
  const next = { ...data, users: nextUsers };
  writeData(next);
  return user;
};

export const saveBooking = (booking: StoredBooking) => {
  const data = readData();
  const next = { ...data, bookings: [...data.bookings, booking] };
  writeData(next);
  return booking;
};

export const getUserByPhone = (phone: string) => {
  return getUsers().find((user) => user.phone === phone);
};

export const getUserByUid = (uid: string) => {
  return getUsers().find((user) => user.id === uid);
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

export const clearData = () => {
  writeData({ users: [], bookings: [], kycRecords: {} });
};

