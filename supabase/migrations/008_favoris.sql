-- Table favoris : prestataires sauvegardés par les mariés
CREATE TABLE IF NOT EXISTS favoris (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prestataire_id uuid NOT NULL REFERENCES prestataires(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prestataire_id)
);

-- RLS
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favoris_select_own" ON favoris
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favoris_insert_own" ON favoris
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favoris_delete_own" ON favoris
  FOR DELETE USING (auth.uid() = user_id);
