-- Migration 024 : Numéro de siège précis sur les tables
ALTER TABLE public.wedding_guests
  ADD COLUMN IF NOT EXISTS seat_number INTEGER;
