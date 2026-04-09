-- Ajout du champ prix_depart sur les prestataires
-- NULL = Sur devis, valeur entière = prix de départ en euros

ALTER TABLE prestataires
  ADD COLUMN IF NOT EXISTS prix_depart integer DEFAULT NULL;
