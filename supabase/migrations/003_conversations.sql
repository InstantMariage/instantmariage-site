-- ============================================
-- InstantMariage - Système de messagerie
-- ============================================

-- Table conversations (groupement des messages entre 2 utilisateurs)
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant1_id uuid references public.users(id) on delete cascade not null,
  participant2_id uuid references public.users(id) on delete cascade not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Participants voient leurs conversations"
  on public.conversations for select
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);

create policy "Création de conversation"
  on public.conversations for insert
  with check (auth.uid() = participant1_id or auth.uid() = participant2_id);

create policy "Mise à jour last_message_at"
  on public.conversations for update
  using (auth.uid() = participant1_id or auth.uid() = participant2_id);

-- Ajout conversation_id à messages
alter table public.messages
  add column conversation_id uuid references public.conversations(id) on delete cascade;

-- Autoriser la lecture des profils utilisateurs pour la messagerie
-- (nécessaire pour afficher le nom des interlocuteurs)
create policy "Lecture profils pour messagerie"
  on public.users for select
  using (auth.uid() is not null);

-- Autoriser la lecture des prénoms des mariés pour la messagerie
create policy "Lecture nom mariés pour messagerie"
  on public.maries for select
  using (auth.uid() is not null);

-- Index pour les performances
create index idx_conversations_participant1 on public.conversations(participant1_id);
create index idx_conversations_participant2 on public.conversations(participant2_id);
create index idx_conversations_last_message on public.conversations(last_message_at desc);
create index idx_messages_conversation on public.messages(conversation_id);
create index idx_messages_lu on public.messages(destinataire_id, lu) where lu = false;

-- Activer Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
