
-- =========================================
-- profiles table (admin users)
-- =========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('owner','manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Owners can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'));

CREATE POLICY "Owners can delete profiles"
  ON public.profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'));

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'owner' ELSE 'manager' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- calendar_dates table (date availability overrides)
-- =========================================
CREATE TABLE IF NOT EXISTS public.calendar_dates (
  date DATE PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','declined')),
  note TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.calendar_dates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_dates TO authenticated;
GRANT ALL ON public.calendar_dates TO service_role;

ALTER TABLE public.calendar_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read calendar dates"
  ON public.calendar_dates FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can insert calendar dates"
  ON public.calendar_dates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update calendar dates"
  ON public.calendar_dates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete calendar dates"
  ON public.calendar_dates FOR DELETE TO authenticated USING (true);

CREATE TRIGGER calendar_dates_updated_at
  BEFORE UPDATE ON public.calendar_dates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
