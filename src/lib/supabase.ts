import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  role: "owner" | "manager";
  created_at: string;
};

export type BookingStatus = "pending" | "approved" | "declined";

export type Booking = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
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
