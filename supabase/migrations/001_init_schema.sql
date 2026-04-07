-- ============================================
-- InstantMariage - Schéma initial Supabase
-- ============================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: users (profils liés à auth.users)
-- ============================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  role text not null check (role in ('marie', 'prestataire', 'admin')) default 'marie',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Les utilisateurs voient leur propre profil"
  on public.users for select
  using (auth.uid() = id);

create policy "Les utilisateurs modifient leur propre profil"
  on public.users for update
  using (auth.uid() = id);

-- ============================================
-- TABLE: prestataires
-- ============================================
create table public.prestataires (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  nom_entreprise text not null,
  categorie text not null,
  description text,
  ville text,
  departement text,
  telephone text,
  site_web text,
  photos text[] default '{}',
  note_moyenne numeric(3,2) default 0,
  nb_avis integer default 0,
  abonnement_actif boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prestataires enable row level security;

create policy "Prestataires visibles par tous"
  on public.prestataires for select
  using (true);

create policy "Prestataire modifie son propre profil"
  on public.prestataires for update
  using (auth.uid() = user_id);

create policy "Prestataire crée son propre profil"
  on public.prestataires for insert
  with check (auth.uid() = user_id);

-- ============================================
-- TABLE: maries
-- ============================================
create table public.maries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  prenom_marie1 text not null,
  prenom_marie2 text,
  date_mariage date,
  lieu_mariage text,
  budget_total numeric(10,2),
  nb_invites integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.maries enable row level security;

create policy "Marié voit son propre profil"
  on public.maries for select
  using (auth.uid() = user_id);

create policy "Marié modifie son propre profil"
  on public.maries for update
  using (auth.uid() = user_id);

create policy "Marié crée son propre profil"
  on public.maries for insert
  with check (auth.uid() = user_id);

-- ============================================
-- TABLE: abonnements
-- ============================================
create table public.abonnements (
  id uuid default uuid_generate_v4() primary key,
  prestataire_id uuid references public.prestataires(id) on delete cascade not null,
  plan text not null check (plan in ('gratuit', 'essentiel', 'premium')) default 'gratuit',
  statut text not null check (statut in ('actif', 'inactif', 'expire')) default 'actif',
  date_debut timestamptz not null default now(),
  date_fin timestamptz,
  prix numeric(8,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.abonnements enable row level security;

create policy "Prestataire voit ses abonnements"
  on public.abonnements for select
  using (
    auth.uid() = (select user_id from public.prestataires where id = prestataire_id)
  );

-- ============================================
-- TABLE: messages
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  expediteur_id uuid references public.users(id) on delete cascade not null,
  destinataire_id uuid references public.users(id) on delete cascade not null,
  sujet text,
  contenu text not null,
  lu boolean default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Utilisateur voit ses messages envoyés et reçus"
  on public.messages for select
  using (auth.uid() = expediteur_id or auth.uid() = destinataire_id);

create policy "Utilisateur envoie un message"
  on public.messages for insert
  with check (auth.uid() = expediteur_id);

create policy "Destinataire marque comme lu"
  on public.messages for update
  using (auth.uid() = destinataire_id);

-- ============================================
-- TABLE: avis
-- ============================================
create table public.avis (
  id uuid default uuid_generate_v4() primary key,
  prestataire_id uuid references public.prestataires(id) on delete cascade not null,
  marie_id uuid references public.maries(id) on delete cascade not null,
  note integer not null check (note between 1 and 5),
  commentaire text,
  reponse_prestataire text,
  created_at timestamptz not null default now(),
  unique(prestataire_id, marie_id)
);

alter table public.avis enable row level security;

create policy "Avis visibles par tous"
  on public.avis for select
  using (true);

create policy "Marié dépose un avis"
  on public.avis for insert
  with check (
    auth.uid() = (select user_id from public.maries where id = marie_id)
  );

create policy "Prestataire répond à un avis"
  on public.avis for update
  using (
    auth.uid() = (select user_id from public.prestataires where id = prestataire_id)
  );

-- ============================================
-- TRIGGER: mise à jour note_moyenne prestataire
-- ============================================
create or replace function update_note_moyenne()
returns trigger as $$
begin
  update public.prestataires
  set
    note_moyenne = (select avg(note) from public.avis where prestataire_id = new.prestataire_id),
    nb_avis = (select count(*) from public.avis where prestataire_id = new.prestataire_id)
  where id = new.prestataire_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_update_note
  after insert or update on public.avis
  for each row execute function update_note_moyenne();

-- ============================================
-- TRIGGER: création automatique du profil user
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'marie'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- TRIGGER: updated_at automatique
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_prestataires
  before update on public.prestataires
  for each row execute function update_updated_at();

create trigger set_updated_at_maries
  before update on public.maries
  for each row execute function update_updated_at();
