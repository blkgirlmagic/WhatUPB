-- Add email notification preference to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT true;
