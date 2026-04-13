-- Position verticale de la photo de couverture (0 = haut, 50 = centre, 100 = bas)
ALTER TABLE prestataires
  ADD COLUMN IF NOT EXISTS cover_position INTEGER DEFAULT 50;
