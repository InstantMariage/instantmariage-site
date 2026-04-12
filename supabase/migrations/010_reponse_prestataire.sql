-- Migration 010 : Réponse du prestataire aux avis
-- Ajoute la colonne reponse_at (reponse_prestataire existe déjà)
-- et la politique RLS autorisant le prestataire à répondre

ALTER TABLE avis ADD COLUMN IF NOT EXISTS reponse_at TIMESTAMPTZ;

-- Politique : le prestataire peut mettre à jour la réponse sur ses propres avis
CREATE POLICY "avis_update_prestataire"
  ON avis FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM prestataires
      WHERE prestataires.id = avis.prestataire_id
        AND prestataires.user_id = auth.uid()
    )
  );
