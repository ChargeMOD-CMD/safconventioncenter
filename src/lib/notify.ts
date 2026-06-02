import type { Booking, TimeSlot } from "./supabase";
import { TIME_SLOTS } from "./supabase";

export const slotLabel = (s: TimeSlot) =>
  TIME_SLOTS.find((t) => t.value === s)?.label ?? s;

export const slotHours = (s: TimeSlot) =>
  TIME_SLOTS.find((t) => t.value === s)?.hours ?? "";

// Normalize phone for wa.me (digits only, no +)
const normalizePhone = (raw: string) => raw.replace(/[^\d]/g, "");

const buildMessage = (
  b: Pick<Booking, "first_name" | "event_type" | "event_date" | "event_time_slot">,
  status: "approved" | "declined" | "pending",
) => {
  const slot = `${slotLabel(b.event_time_slot)} (${slotHours(b.event_time_slot)})`;
  if (status === "approved") {
    return `Dear ${b.first_name}, your booking at SAF Convention Centre for ${b.event_type} on ${b.event_date} — ${slot} has been CONFIRMED. Our concierge will reach you shortly with next steps. — SAF Celestia EventVerse`;
  }
  if (status === "declined") {
    return `Dear ${b.first_name}, unfortunately your requested slot for ${b.event_type} on ${b.event_date} — ${slot} is no longer available. Please contact us to explore alternative dates. — SAF Celestia EventVerse`;
  }
  return `Dear ${b.first_name}, your booking request for ${b.event_type} on ${b.event_date} — ${slot} is being reviewed. We'll get back to you shortly. — SAF Celestia EventVerse`;
};

export function whatsappLink(
  booking: Pick<Booking, "first_name" | "phone" | "event_type" | "event_date" | "event_time_slot">,
  status: "approved" | "declined" | "pending",
) {
  const phone = normalizePhone(booking.phone);
  const text = encodeURIComponent(buildMessage(booking, status));
  return `https://wa.me/${phone}?text=${text}`;
}

export function smsLink(
  booking: Pick<Booking, "first_name" | "phone" | "event_type" | "event_date" | "event_time_slot">,
  status: "approved" | "declined" | "pending",
) {
  const phone = booking.phone.replace(/\s/g, "");
  const body = encodeURIComponent(buildMessage(booking, status));
  return `sms:${phone}?body=${body}`;
}
