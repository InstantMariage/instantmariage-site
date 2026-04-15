-- ============================================================
-- Migration 018 : Table documents_prestataire
-- Générateur de Devis / Factures / Contrats
-- ============================================================

CREATE TABLE IF NOT EXISTS public.documents_prestataire (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id  UUID        NOT NULL REFERENCES public.prestataires(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN ('devis', 'facture', 'contrat')),
  numero          TEXT        NOT NULL,
  client_prenom   TEXT,
  client_nom      TEXT,
  client_email    TEXT,
  client_telephone TEXT,
  client_adresse  TEXT,
  date_mariage    DATE,
  date_emission   DATE        NOT NULL DEFAULT CURRENT_DATE,
  montant_ht      NUMERIC(10, 2),
  montant_tva     NUMERIC(10, 2),
  montant_ttc     NUMERIC(10, 2),
  statut          TEXT        NOT NULL DEFAULT 'brouillon'
                              CHECK (statut IN ('brouillon', 'envoye', 'signe', 'paye')),
  contenu         JSONB,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_documents_prestataire_id
  ON public.documents_prestataire(prestataire_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at
  ON public.documents_prestataire(prestataire_id, created_at);
CREATE INDEX IF NOT EXISTS idx_documents_type
  ON public.documents_prestataire(prestataire_id, type);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_documents
  BEFORE UPDATE ON public.documents_prestataire
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE public.documents_prestataire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prestataire voit ses documents"
  ON public.documents_prestataire FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.prestataires WHERE id = prestataire_id)
  );

CREATE POLICY "Prestataire crée ses documents"
  ON public.documents_prestataire FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.prestataires WHERE id = prestataire_id)
  );

CREATE POLICY "Prestataire modifie ses documents"
  ON public.documents_prestataire FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM public.prestataires WHERE id = prestataire_id)
  );

CREATE POLICY "Prestataire supprime ses documents"
  ON public.documents_prestataire FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM public.prestataires WHERE id = prestataire_id)
  );
