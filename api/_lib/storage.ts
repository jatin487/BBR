const STORAGE_KEY = 'bbr_backend_data';

let inMemoryData: { users: StoredUser[]; bookings: StoredBooking[] } = { users: [], bookings: [] };

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

export type StoredData = {
  users: StoredUser[];
  bookings: StoredBooking[];
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
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : []
      };
      return inMemoryData;
    } catch {
      return inMemoryData;
    }
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
  const existing = data.users.find((entry) => entry.phone === user.phone);
  const nextUsers = existing ? data.users.map((entry) => (entry.phone === user.phone ? user : entry)) : [...data.users, user];
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

export const clearData = () => {
  writeData({ users: [], bookings: [] });
};
