/**
 * Booking API - Webhooks for confirmation and cancel
 * URLs loaded from env
 */

import { BOOKING_WEBHOOK_URL, CANCEL_BOOKING_WEBHOOK_URL } from "./webhooks";

export interface BookingConfirmationPayload {
  busId?: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seat: string;
  bookingId: string;
  userEmail: string;
}

export async function sendBookingConfirmation(payload: BookingConfirmationPayload): Promise<void> {
  try {
    await fetch(BOOKING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently ignore - confirmation email is best-effort
  }
}
export interface CancelBookingPayload {
  busId?: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seat: string;
  bookingId: string;
  userEmail: string
}


export async function sendCancelBooking(payload: CancelBookingPayload): Promise<void> {
  try {
    await fetch(CANCEL_BOOKING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently ignore
  }
}
