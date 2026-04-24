-- ============================================================
-- Migration 030 : Prénoms des accompagnants RSVP
-- ============================================================

-- Colonne accompagnants_prenoms sur rsvp_responses
ALTER TABLE public.rsvp_responses
  ADD COLUMN IF NOT EXISTS accompagnants_prenoms TEXT[] NOT NULL DEFAULT '{}';

-- Supprime la contrainte unique rsvp_response_id dans wedding_guests
-- Nécessaire pour insérer plusieurs lignes (principal + accompagnants) par RSVP
DROP INDEX IF EXISTS idx_wedding_guests_rsvp_unique;
