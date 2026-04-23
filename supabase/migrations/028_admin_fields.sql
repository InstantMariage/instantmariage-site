-- Migration 028 : Champs admin — signalements, suspension prestataires, approbation avis

-- 1. Table signalements (créée si absente — l'API l'utilisait déjà via service_role)
CREATE TABLE IF NOT EXISTS public.signalements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prestataire_id UUID NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  motif          TEXT NOT NULL,
  description    TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insertion signalement public" ON public.signalements;
CREATE POLICY "Insertion signalement public"
  ON public.signalements FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin lit les signalements" ON public.signalements;
CREATE POLICY "Admin lit les signalements"
  ON public.signalements FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 2. Champ suspendu sur prestataires
ALTER TABLE public.prestataires
  ADD COLUMN IF NOT EXISTS suspendu BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Champ approuve sur avis (true = visible, false = masqué en attente de modération)
--    Défaut TRUE pour conserver la visibilité des avis existants
ALTER TABLE public.avis
  ADD COLUMN IF NOT EXISTS approuve BOOLEAN NOT NULL DEFAULT TRUE;
