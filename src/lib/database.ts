/**
 * Journey Compass - Seat Availability & Booking Database
 * Uses localStorage for persistence (client-side)
 */

export interface Bus {
  id: string;
  operatorName: string;
  busType: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: string;
  totalSeats: number;
  price: number;
  amenities: string[];
  rating: number;
}

export interface SeatAvailability {
  busId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  bookedSeatNumbers: number[];
}

export type BookingStatus = "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: string;
  busId: string;
  from?: string;
  to?: string;
  date: string;
  time?: string; // departure time e.g. "21:00"
  seatNumbers: number[];
  seatNumbersDisplay?: string[];
  userEmail: string;
  paymentMethod: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

export interface DatabaseSchema {
  buses: Bus[];
  seatAvailability: SeatAvailability[];
  bookings: Booking[];
  version: number;
}

const DB_KEY = "journey-compass-db";
const DB_VERSION = 1;

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function generateId(): string {
  return `bkg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Initialize with default structure
function getDefaultSchema(): DatabaseSchema {
  return {
    buses: [],
    seatAvailability: [],
    bookings: [],
    version: DB_VERSION,
  };
}

export function getDatabase(): DatabaseSchema {
  if (typeof window === "undefined") {
    return getDefaultSchema();
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return getDefaultSchema();
    const parsed = JSON.parse(raw) as DatabaseSchema;
    return {
      ...getDefaultSchema(),
      ...parsed,
      seatAvailability: parsed.seatAvailability ?? [],
      bookings: parsed.bookings ?? [],
    };
  } catch {
    return getDefaultSchema();
  }
}

export function saveDatabase(db: DatabaseSchema): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save database:", e);
  }
}

/**
 * Get booked seat numbers for a bus on a specific date
 */
export function getBookedSeats(busId: string, date: Date | string): number[] {
  const dateStr = typeof date === "string" ? date : getDateKey(date);
  const db = getDatabase();
  const record = db.seatAvailability.find(
    (r) => r.busId === busId && r.date === dateStr
  );
  return record?.bookedSeatNumbers ?? [];
}

/**
 * Create a new booking and update seat availability
 */
export function createBooking(
  busId: string,
  from: string,
  to: string,
  date: Date | string,
  time: string,
  seatNumbers: number[],
  seatNumbersDisplay: string[],
  userEmail: string,
  paymentMethod: string,
  totalAmount: number
): Booking {
  const dateStr = typeof date === "string" ? date : getDateKey(date);
  const db = getDatabase();

  const booked = getBookedSeats(busId, dateStr);
  const conflict = seatNumbers.some((s) => booked.includes(s));
  if (conflict) {
    throw new Error("One or more seats are no longer available");
  }

  const bookingId = generateId();
  const booking: Booking = {
    id: bookingId,
    busId,
    from,
    to,
    date: dateStr,
    time,
    seatNumbers,
    seatNumbersDisplay,
    userEmail,
    paymentMethod,
    totalAmount,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(booking);

  const existing = db.seatAvailability.find(
    (r) => r.busId === busId && r.date === dateStr
  );
  if (existing) {
    existing.bookedSeatNumbers.push(...seatNumbers);
    existing.bookedSeatNumbers.sort((a, b) => a - b);
  } else {
    db.seatAvailability.push({
      busId,
      date: dateStr,
      bookedSeatNumbers: [...seatNumbers],
    });
  }

  saveDatabase(db);
  return booking;
}

/**
 * Cancel a booking and release seats
 */
export function cancelBooking(bookingId: string, userEmail: string): void {
  const db = getDatabase();
  const booking = db.bookings.find(
    (b) => b.id === bookingId && b.userEmail.toLowerCase() === userEmail.toLowerCase()
  );
  if (!booking) {
    throw new Error("Booking not found");
  }
  const normalized = String(booking.status).toUpperCase();
  if (normalized === "CANCELLED") {
    throw new Error("Booking is already cancelled");
  }

  booking.status = "CANCELLED";

  const record = db.seatAvailability.find(
    (r) => r.busId === booking.busId && r.date === booking.date
  );
  if (record) {
    record.bookedSeatNumbers = record.bookedSeatNumbers.filter(
      (s) => !booking.seatNumbers.includes(s)
    );
  }

  saveDatabase(db);
}

/**
 * Get availability stats for a bus on a date
 */
export function getBusAvailability(
  busId: string,
  date: Date | string,
  totalSeats: number
): { occupiedSeats: number; availableSeats: number } {
  const booked = getBookedSeats(busId, date);
  return {
    occupiedSeats: booked.length,
    availableSeats: Math.max(0, totalSeats - booked.length),
  };
}

/**
 * Seed database with buses (called on first load)
 */
export function seedDatabaseIfEmpty(buses: Bus[]): void {
  const db = getDatabase();
  if (db.buses.length === 0 && buses.length > 0) {
    db.buses = buses;
    saveDatabase(db);
  }
}

/**
 * Get all buses from database (or fallback to provided buses)
 */
export function getBusesFromDb(fallbackBuses: Bus[]): Bus[] {
  const db = getDatabase();
  if (db.buses.length > 0) return db.buses;
  seedDatabaseIfEmpty(fallbackBuses);
  return fallbackBuses;
}

/**
 * Update buses in database (e.g. when seed data changes)
 */
export function setBusesInDb(buses: Bus[]): void {
  const db = getDatabase();
  db.buses = buses;
  saveDatabase(db);
}

/**
 * Get bookings for a specific user (logged-in user only)
 */
export function getUserBookings(userEmail: string): Booking[] {
  const db = getDatabase();
  return db.bookings
    .filter((b) => b.userEmail.toLowerCase() === userEmail.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
