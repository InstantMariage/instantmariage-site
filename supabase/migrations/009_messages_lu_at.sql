-- Ajout colonne lu_at à la table messages (timestamp de lecture)
alter table public.messages
  add column if not exists lu_at timestamptz;

-- Index pour accélérer les lookups par destinataire + statut lu
create index if not exists idx_messages_lu_at
  on public.messages(destinataire_id, lu_at)
  where lu_at is not null;
