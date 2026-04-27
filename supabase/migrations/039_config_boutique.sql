-- Migration 039: Table config_boutique (prix personnalisés par produit)

CREATE TABLE public.config_boutique (
  produit TEXT PRIMARY KEY,
  prix    NUMERIC(10,2) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Valeurs par défaut (reflètent les prix actuels codés en dur)
INSERT INTO public.config_boutique (produit, prix) VALUES
  ('cadre',            39.90),
  ('template_digital',  9.90),
  ('chevalet',         19.90);

CREATE TRIGGER config_boutique_updated_at
  BEFORE UPDATE ON public.config_boutique
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.config_boutique ENABLE ROW LEVEL SECURITY;

-- Lecture publique (le checkout a besoin du prix en vigueur)
CREATE POLICY "Lecture publique config_boutique"
  ON public.config_boutique FOR SELECT
  USING (true);

-- Écriture réservée au service-role (API admin uniquement)
CREATE POLICY "Service-role gère config_boutique"
  ON public.config_boutique FOR ALL
  USING (auth.role() = 'service_role');
