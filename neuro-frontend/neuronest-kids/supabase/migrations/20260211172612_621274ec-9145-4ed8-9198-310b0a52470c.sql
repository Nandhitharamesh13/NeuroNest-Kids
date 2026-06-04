-- Fix age constraint to allow up to 25
ALTER TABLE public.child_profiles DROP CONSTRAINT child_profiles_age_check;
ALTER TABLE public.child_profiles ADD CONSTRAINT child_profiles_age_check CHECK (age >= 1 AND age <= 25);