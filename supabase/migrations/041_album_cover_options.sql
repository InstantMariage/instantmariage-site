-- Migration 041 : Options de couverture album photo

ALTER TABLE public.commandes
  ADD COLUMN IF NOT EXISTS cover_sku   TEXT,
  ADD COLUMN IF NOT EXISTS cover_title TEXT,
  ADD COLUMN IF NOT EXISTS cover_date  TEXT;
