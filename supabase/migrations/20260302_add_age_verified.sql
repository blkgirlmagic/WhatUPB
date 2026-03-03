-- Age verification: adds age_verified flag to profiles.
-- Set to TRUE during signup after passing client + server age check.
-- The actual date of birth is never stored.

-- 1. Add age_verified column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_verified BOOLEAN NOT NULL DEFAULT false;

-- 2. Update handle_new_user() to read age_verified from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, age_verified)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'age_verified')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;
