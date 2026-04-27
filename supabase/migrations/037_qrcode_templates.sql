-- Migration 037 : Templates QR Code payants pour les mariés
-- Ajoute le template acheté et sa date d'expiration (12 mois)

ALTER TABLE public.maries
  ADD COLUMN IF NOT EXISTS qrcode_template_achete TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS qrcode_template_expire_at TIMESTAMPTZ DEFAULT NULL;
