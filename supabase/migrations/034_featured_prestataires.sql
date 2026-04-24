-- Migration 034 : Champ mis_en_avant sur prestataires

ALTER TABLE public.prestataires
  ADD COLUMN IF NOT EXISTS mis_en_avant BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS prestataires_mis_en_avant_idx
  ON public.prestataires (mis_en_avant)
  WHERE mis_en_avant = TRUE;
