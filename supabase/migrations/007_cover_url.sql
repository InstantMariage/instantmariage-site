-- Ajout de la photo de couverture (bannière) sur le profil prestataire
ALTER TABLE prestataires
  ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT NULL;
