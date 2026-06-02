-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- =====================================================

-- 1. Add time slot column to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS event_time_slot TEXT NOT NULL DEFAULT 'full_day';

-- 2. Constrain to allowed slots
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_event_time_slot_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_event_time_slot_check
  CHECK (event_time_slot IN ('morning','afternoon','evening','full_day'));

-- 3. Index for fast availability lookups
CREATE INDEX IF NOT EXISTS bookings_date_slot_idx
  ON public.bookings (event_date, event_time_slot, status);
