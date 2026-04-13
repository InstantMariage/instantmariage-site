-- Ajout de la colonne verifie sur la table prestataires
-- Par défaut false : aucun prestataire n'est vérifié à l'inscription
-- La vérification est faite manuellement par l'équipe InstantMariage

alter table public.prestataires
  add column if not exists verifie boolean not null default false;
