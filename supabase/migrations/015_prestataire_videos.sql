-- Table prestataire_videos
-- Stocke les vidéos uploadées sur Bunny.net Stream par les prestataires

create table public.prestataire_videos (
  id            uuid primary key default gen_random_uuid(),
  prestataire_id uuid not null references public.prestataires(id) on delete cascade,
  bunny_video_id text not null,
  title          text,
  thumbnail_url  text,
  play_url       text,
  created_at     timestamptz not null default now()
);

create index prestataire_videos_prestataire_id_idx
  on public.prestataire_videos(prestataire_id);

alter table public.prestataire_videos enable row level security;

-- Lecture publique (profil prestataire)
create policy "Videos lisibles par tous"
  on public.prestataire_videos for select
  to public
  using (true);

-- Les insertions et suppressions passent par le service role (API routes)
-- Aucune policy INSERT/DELETE client nécessaire
