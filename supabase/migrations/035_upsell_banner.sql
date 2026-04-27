-- Migration 035 : Colonne show_upsell_banner sur prestataires
-- Permet à l'admin d'activer une bannière d'upsell contextuelle
-- depuis /admin/upsell pour pousser un prestataire vers son plan supérieur.

ALTER TABLE public.prestataires
  ADD COLUMN IF NOT EXISTS show_upsell_banner boolean NOT NULL DEFAULT false;
