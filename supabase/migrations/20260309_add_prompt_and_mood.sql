-- Add owner-customizable fields to the public profile page.
-- prompt_of_day:  short question displayed above the message form for visitors.
-- mood_status:    tagline displayed below the @username handle.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS prompt_of_day TEXT
    CHECK (char_length(prompt_of_day) <= 100);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mood_status TEXT
    CHECK (char_length(mood_status) <= 60);
