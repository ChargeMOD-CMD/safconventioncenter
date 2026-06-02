// Re-export the auto-generated, properly configured Lovable Cloud client.
// Do NOT instantiate a second createClient here — that caused the booking
// form to silently hit a placeholder URL and fail every insert.
export { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  role: "owner" | "manager";
  created_at: string;
};

export type BookingStatus = "pending" | "approved" | "declined";
export type TimeSlot = "morning" | "afternoon" | "evening" | "full_day";

export const TIME_SLOTS: { value: TimeSlot; label: string; hours: string }[] = [
  { value: "morning", label: "Morning", hours: "8:00 AM – 12:00 PM" },
  { value: "afternoon", label: "Afternoon", hours: "1:00 PM – 5:00 PM" },
  { value: "evening", label: "Evening", hours: "6:00 PM – 11:00 PM" },
  { value: "full_day", label: "Full Day", hours: "8:00 AM – 11:00 PM" },
];

export type Booking = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_time_slot: TimeSlot;
  expected_guests: number | null;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
};

export type CalendarDate = {
  date: string;
  status: BookingStatus;
  note: string | null;
  updated_by: string | null;
  updated_at: string;
};
