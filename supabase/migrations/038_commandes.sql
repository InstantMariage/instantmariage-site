-- Migration 038: Table commandes (cadre, chevalet, template_digital)

CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marie_id UUID REFERENCES public.maries(id),
  produit TEXT NOT NULL CHECK (produit IN ('cadre', 'chevalet', 'template_digital')),
  template_id TEXT,
  montant NUMERIC(10,2) NOT NULL,
  statut TEXT NOT NULL DEFAULT 'recue' CHECK (statut IN ('recue', 'en_preparation', 'expediee', 'livree', 'annulee')),
  nom_destinataire TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  telephone TEXT,
  date_mariage DATE,
  numero_suivi TEXT,
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mariés voient leurs commandes"
  ON public.commandes FOR SELECT
  USING (marie_id IN (
    SELECT id FROM public.maries WHERE user_id = auth.uid()
  ));

CREATE POLICY "Insert public commandes"
  ON public.commandes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin gère commandes"
  ON public.commandes FOR ALL
  USING (true);
