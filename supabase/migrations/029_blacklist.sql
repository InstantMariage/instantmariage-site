-- Migration 029 : Blacklist — blocage emails, domaines, téléphones, IP suspects

CREATE TABLE IF NOT EXISTS public.blacklist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text        NOT NULL CHECK (type IN ('email', 'domaine_email', 'telephone', 'ip')),
  valeur     text        NOT NULL,
  raison     text        NOT NULL,
  actif      boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Évite les doublons (même type + même valeur)
CREATE UNIQUE INDEX blacklist_type_valeur_idx ON public.blacklist (type, valeur);

-- Lookups rapides par type et statut actif
CREATE INDEX blacklist_type_actif_idx ON public.blacklist (type, actif);

-- RLS
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin uniquement — SELECT"
  ON public.blacklist FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin uniquement — INSERT"
  ON public.blacklist FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin uniquement — UPDATE"
  ON public.blacklist FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin uniquement — DELETE"
  ON public.blacklist FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));
