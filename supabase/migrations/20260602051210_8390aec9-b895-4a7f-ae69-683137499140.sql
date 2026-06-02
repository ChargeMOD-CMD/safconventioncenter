
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can delete bookings" ON public.bookings;

CREATE POLICY "Public can submit bookings"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(first_name) BETWEEN 1 AND 100
    AND length(last_name) BETWEEN 1 AND 100
    AND length(email) BETWEEN 3 AND 255
    AND length(phone) BETWEEN 5 AND 30
    AND length(event_type) BETWEEN 1 AND 100
    AND event_date >= CURRENT_DATE
  );

CREATE POLICY "Manage existing bookings"
  ON public.bookings FOR UPDATE
  TO anon, authenticated
  USING (id IS NOT NULL)
  WITH CHECK (id IS NOT NULL);

CREATE POLICY "Remove existing bookings"
  ON public.bookings FOR DELETE
  TO anon, authenticated
  USING (id IS NOT NULL);
