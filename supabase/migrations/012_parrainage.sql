-- 012_parrainage.sql
-- Système de parrainage prestataires

-- ── 1. Colonne code_parrainage sur prestataires ───────────────────────────────
ALTER TABLE prestataires ADD COLUMN IF NOT EXISTS code_parrainage TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS prestataires_code_parrainage_idx ON prestataires(code_parrainage);

-- ── 2. Trigger : génère automatiquement le code à l'insertion ─────────────────
CREATE OR REPLACE FUNCTION generate_code_parrainage()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne génère un code que si la colonne est NULL (nouvel enregistrement)
  IF NEW.code_parrainage IS NULL THEN
    -- 8 caractères hexadécimaux en majuscule (ex: "A3F7C8B2")
    NEW.code_parrainage := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_code_parrainage ON prestataires;
CREATE TRIGGER trigger_code_parrainage
  BEFORE INSERT ON prestataires
  FOR EACH ROW
  EXECUTE FUNCTION generate_code_parrainage();

-- ── 3. Backfill des prestataires existants ────────────────────────────────────
UPDATE prestataires
SET code_parrainage = upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE code_parrainage IS NULL;

-- ── 4. Table parrainages ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parrainages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parrain_id     UUID NOT NULL REFERENCES prestataires(id) ON DELETE CASCADE,
  filleul_id     UUID NOT NULL REFERENCES prestataires(id) ON DELETE CASCADE,
  statut         TEXT NOT NULL DEFAULT 'valide' CHECK (statut IN ('valide', 'annule')),
  mois_offerts   INTEGER NOT NULL DEFAULT 1,
  stripe_credit_id TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Un filleul ne peut avoir qu'un seul parrain
  UNIQUE(filleul_id)
);

CREATE INDEX IF NOT EXISTS parrainages_parrain_id_idx ON parrainages(parrain_id);

-- ── 5. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE parrainages ENABLE ROW LEVEL SECURITY;

-- Le parrain peut lire ses propres parrainages
CREATE POLICY "parrain_select_own" ON parrainages
  FOR SELECT
  USING (
    parrain_id IN (
      SELECT id FROM prestataires WHERE user_id = auth.uid()
    )
  );

-- Le service role peut tout faire (appels API / webhook)
CREATE POLICY "service_role_all" ON parrainages
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
