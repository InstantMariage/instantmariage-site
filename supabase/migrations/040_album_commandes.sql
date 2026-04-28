-- Migration 040 : Commandes album photo (Prodigi)

-- Nouvelles colonnes sur commandes
ALTER TABLE public.commandes
  ADD COLUMN IF NOT EXISTS prodigi_order_id TEXT,
  ADD COLUMN IF NOT EXISTS nb_pages INTEGER,
  ADD COLUMN IF NOT EXISTS photos_selectionnees JSONB;

-- Étendre le CHECK produit pour inclure album_photo
ALTER TABLE public.commandes DROP CONSTRAINT IF EXISTS commandes_produit_check;
ALTER TABLE public.commandes
  ADD CONSTRAINT commandes_produit_check
  CHECK (produit IN ('cadre', 'chevalet', 'template_digital', 'album_photo'));

-- Étendre le CHECK statut pour inclure brouillon (utilisé avant paiement Stripe)
ALTER TABLE public.commandes DROP CONSTRAINT IF EXISTS commandes_statut_check;
ALTER TABLE public.commandes
  ADD CONSTRAINT commandes_statut_check
  CHECK (statut IN ('brouillon', 'recue', 'en_preparation', 'expediee', 'livree', 'annulee'));
