-- Bucket public pour les photos des prestataires
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Upload : chaque prestataire peut uploader dans son propre dossier
create policy "Prestataires upload leurs photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = 'prestataires'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Suppression : chaque prestataire supprime ses propres photos
create policy "Prestataires suppriment leurs photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'photos'
  and (storage.foldername(name))[1] = 'prestataires'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Lecture publique (bucket public)
create policy "Photos lisibles par tous"
on storage.objects for select
to public
using (bucket_id = 'photos');
