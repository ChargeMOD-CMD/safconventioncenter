
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time_slot TEXT NOT NULL DEFAULT 'full_day'
    CHECK (event_time_slot IN ('morning','afternoon','evening','full_day')),
  expected_guests INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX bookings_date_slot_idx ON public.bookings (event_date, event_time_slot, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public can submit bookings
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read (needed for slot availability + admin demo). Sensitive PII present.
CREATE POLICY "Anyone can read bookings"
  ON public.bookings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins (any auth user or anon for demo) can manage
CREATE POLICY "Anyone can update bookings"
  ON public.bookings FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete bookings"
  ON public.bookings FOR DELETE
  TO anon, authenticated
  USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
