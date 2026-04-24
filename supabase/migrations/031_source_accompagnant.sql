-- ============================================================
-- Migration 031 : Valeur source 'rsvp_accompagnant' dans wedding_guests
-- ============================================================

-- Étend la contrainte CHECK source pour autoriser les accompagnants RSVP
ALTER TABLE public.wedding_guests DROP CONSTRAINT IF EXISTS wedding_guests_source_check;
ALTER TABLE public.wedding_guests ADD CONSTRAINT wedding_guests_source_check
  CHECK (source IN ('manuel', 'rsvp', 'rsvp_accompagnant'));
