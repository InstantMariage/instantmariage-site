-- Migration 004 : Système d'avis réels
-- Table avis avec contrainte d'unicité (un avis par marie par prestataire)

CREATE TABLE IF NOT EXISTS avis (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prestataire_id      UUID NOT NULL REFERENCES prestataires(id) ON DELETE CASCADE,
  marie_id            UUID NOT NULL REFERENCES maries(id) ON DELETE CASCADE,
  note                SMALLINT NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire         TEXT,
  date_mariage_couple DATE,
  reponse_prestataire TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Un seul avis par couple (marie) par prestataire
  CONSTRAINT avis_unique_marie_prestataire UNIQUE (prestataire_id, marie_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- Lecture publique : tout le monde peut lire les avis
CREATE POLICY "avis_select_public"
  ON avis FOR SELECT
  USING (true);

-- Insertion : uniquement un marié pour son propre profil
-- (le prestataire ne peut pas insérer car son user_id ne correspond pas à un marie)
CREATE POLICY "avis_insert_marie"
  ON avis FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maries
      WHERE maries.id = marie_id
        AND maries.user_id = auth.uid()
    )
  );

-- Mise à jour : le marié peut modifier son avis
CREATE POLICY "avis_update_marie"
  ON avis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM maries
      WHERE maries.id = marie_id
        AND maries.user_id = auth.uid()
    )
  );

-- Suppression : le marié peut supprimer son avis
CREATE POLICY "avis_delete_marie"
  ON avis FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM maries
      WHERE maries.id = marie_id
        AND maries.user_id = auth.uid()
    )
  );

-- ── Trigger : mise à jour automatique note_moyenne et nb_avis ─────────────────

CREATE OR REPLACE FUNCTION update_prestataire_note()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_prestataire_id UUID;
BEGIN
  -- Identifier le prestataire concerné
  IF TG_OP = 'DELETE' THEN
    v_prestataire_id := OLD.prestataire_id;
  ELSE
    v_prestataire_id := NEW.prestataire_id;
  END IF;

  -- Recalculer note_moyenne et nb_avis
  UPDATE prestataires
  SET
    note_moyenne = COALESCE((
      SELECT ROUND(AVG(note)::NUMERIC, 1)
      FROM avis
      WHERE prestataire_id = v_prestataire_id
    ), 0),
    nb_avis = (
      SELECT COUNT(*)
      FROM avis
      WHERE prestataire_id = v_prestataire_id
    ),
    updated_at = NOW()
  WHERE id = v_prestataire_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER avis_update_prestataire_note
  AFTER INSERT OR UPDATE OR DELETE ON avis
  FOR EACH ROW EXECUTE FUNCTION update_prestataire_note();
