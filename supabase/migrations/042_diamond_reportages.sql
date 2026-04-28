-- Migration 042 : Pack Diamond — reportages + champ expiration

-- 1. Ajouter 'diamond' à la contrainte plan de prestataires
ALTER TABLE public.prestataires
  DROP CONSTRAINT IF EXISTS prestataires_plan_check;

ALTER TABLE public.prestataires
  ADD CONSTRAINT prestataires_plan_check
  CHECK (plan IN ('gratuit', 'essentiel', 'premium', 'pro', 'starter', 'diamond'));

-- 2. Ajouter la date d'expiration Diamond
ALTER TABLE public.prestataires
  ADD COLUMN IF NOT EXISTS diamond_expire_at TIMESTAMPTZ;

-- 3. Table des reportages Diamond
CREATE TABLE public.diamond_reportages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id UUID NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'planifie', 'filme', 'monte', 'livre')),
  date_reportage DATE,
  lien_video TEXT,
  lien_article TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.diamond_reportages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gère reportages" ON public.diamond_reportages FOR ALL USING (true);

CREATE TRIGGER diamond_reportages_updated_at
  BEFORE UPDATE ON public.diamond_reportages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
