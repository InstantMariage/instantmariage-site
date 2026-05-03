-- Table demandes_devis : demandes de devis envoyées par les mariés aux prestataires
CREATE TABLE demandes_devis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marie_id UUID REFERENCES maries(id) ON DELETE CASCADE,
  prestataire_id UUID REFERENCES prestataires(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  date_mariage DATE,
  budget_max INTEGER,
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'vue', 'repondue', 'refusee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(marie_id, prestataire_id)
);

ALTER TABLE demandes_devis ENABLE ROW LEVEL SECURITY;

-- Mariés : accès complet à leurs propres demandes
CREATE POLICY "Marie voit ses demandes" ON demandes_devis
  FOR ALL USING (marie_id = (SELECT id FROM maries WHERE user_id = auth.uid()));

-- Prestataires : lecture seule de leurs demandes reçues
CREATE POLICY "Prestataire voit ses demandes" ON demandes_devis
  FOR SELECT USING (prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid()));

-- Prestataires : peut modifier le statut de ses demandes reçues
CREATE POLICY "Prestataire modifie statut" ON demandes_devis
  FOR UPDATE
  USING (prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid()))
  WITH CHECK (prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid()));

GRANT ALL ON demandes_devis TO authenticated;
