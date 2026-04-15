-- Ajout du ratio d'aspect natif pour chaque vidéo
-- Valeurs possibles : "16:9", "9:16", "1:1", "4:5"
alter table public.prestataire_videos
  add column if not exists aspect_ratio text;
