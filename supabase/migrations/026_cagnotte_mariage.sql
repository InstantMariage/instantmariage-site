-- Migration 026 : Système de cagnotte mariage
-- Colonnes cagnotte sur la table invitations
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS cagnotte_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cagnotte_titre TEXT,
  ADD COLUMN IF NOT EXISTS cagnotte_message TEXT,
  ADD COLUMN IF NOT EXISTS cagnotte_objectif_cents INTEGER,
  ADD COLUMN IF NOT EXISTS cagnotte_iban TEXT;

-- Table des contributions
CREATE TABLE IF NOT EXISTS cagnotte_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  marie_id UUID NOT NULL REFERENCES maries(id) ON DELETE CASCADE,
  contributeur_nom TEXT NOT NULL,
  contributeur_email TEXT NOT NULL,
  montant_cents INTEGER NOT NULL CHECK (montant_cents >= 500),
  message TEXT,
  stripe_session_id TEXT UNIQUE,
  statut TEXT NOT NULL DEFAULT 'pending' CHECK (statut IN ('pending', 'paye', 'annule')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cagnotte_contributions ENABLE ROW LEVEL SECURITY;

-- Les mariés lisent toutes leurs contributions
CREATE POLICY "maries_select_contributions" ON cagnotte_contributions
  FOR SELECT TO authenticated
  USING (
    marie_id IN (SELECT id FROM maries WHERE user_id = auth.uid())
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_cagnotte_inv     ON cagnotte_contributions(invitation_id);
CREATE INDEX IF NOT EXISTS idx_cagnotte_session ON cagnotte_contributions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_cagnotte_marie   ON cagnotte_contributions(marie_id);
CREATE INDEX IF NOT EXISTS idx_cagnotte_statut  ON cagnotte_contributions(statut);
