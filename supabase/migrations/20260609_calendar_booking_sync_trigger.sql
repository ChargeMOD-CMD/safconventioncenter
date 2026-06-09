-- =============================================================
-- Optional: DB-level trigger to auto-sync calendar_dates
-- when bookings are inserted, updated, or deleted.
--
-- Apply this in the Supabase Dashboard → SQL Editor
-- if you want the calendar to update even from external sources
-- (API calls, other clients, etc.)
-- =============================================================

-- Step 1: Add booking_id column to calendar_dates (if not exists)
ALTER TABLE public.calendar_dates
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;

-- Step 2: Trigger function
CREATE OR REPLACE FUNCTION public.sync_calendar_from_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Remove calendar entry linked to this booking
    DELETE FROM public.calendar_dates WHERE booking_id = OLD.id;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- New booking → mark date as pending
    INSERT INTO public.calendar_dates (date, status, booking_id, updated_at)
    VALUES (NEW.event_date, NEW.status, NEW.id, now())
    ON CONFLICT (date) DO UPDATE
      SET status     = EXCLUDED.status,
          booking_id = EXCLUDED.booking_id,
          updated_at = now();
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Status changed → update calendar entry
    IF OLD.status IS DISTINCT FROM NEW.status OR OLD.event_date IS DISTINCT FROM NEW.event_date THEN
      -- If date changed, remove old entry and upsert new one
      IF OLD.event_date IS DISTINCT FROM NEW.event_date THEN
        DELETE FROM public.calendar_dates WHERE booking_id = OLD.id;
      END IF;
      INSERT INTO public.calendar_dates (date, status, booking_id, updated_at)
      VALUES (NEW.event_date, NEW.status, NEW.id, now())
      ON CONFLICT (date) DO UPDATE
        SET status     = EXCLUDED.status,
            booking_id = EXCLUDED.booking_id,
            updated_at = now();
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 3: Attach trigger to bookings table
DROP TRIGGER IF EXISTS bookings_sync_calendar ON public.bookings;
CREATE TRIGGER bookings_sync_calendar
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_calendar_from_booking();
