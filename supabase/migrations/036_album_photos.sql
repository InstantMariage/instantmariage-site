-- ============================================================
-- Migration 036 : Album photo collaboratif
-- Les invités uploadent sans inscription via QR Code
-- ============================================================

-- ============================================================
-- EXTENSION: table maries
-- ============================================================
ALTER TABLE public.maries
  ADD COLUMN IF NOT EXISTS album_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS album_actif BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- TABLE: album_photos
-- ============================================================
CREATE TABLE public.album_photos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  marie_id       UUID        NOT NULL REFERENCES public.maries(id) ON DELETE CASCADE,
  url            TEXT        NOT NULL,
  type           TEXT        NOT NULL DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
  nom_fichier    TEXT,
  taille_fichier INTEGER,
  uploade_par    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_album_photos_marie_id
  ON public.album_photos(marie_id);

CREATE INDEX idx_album_photos_marie_created
  ON public.album_photos(marie_id, created_at DESC);

-- ============================================================
-- RLS: album_photos
-- ============================================================
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

-- Les mariés consultent leurs propres photos
CREATE POLICY "Mariés voient leurs photos"
  ON public.album_photos FOR SELECT
  USING (
    marie_id IN (SELECT id FROM public.maries WHERE user_id = auth.uid())
  );

-- Upload ouvert à tous (invités sans inscription)
-- La validation du slug se fait côté API avant insertion
CREATE POLICY "Upload public via slug"
  ON public.album_photos FOR INSERT
  WITH CHECK (true);

-- Suppression réservée aux mariés
CREATE POLICY "Mariés suppriment leurs photos"
  ON public.album_photos FOR DELETE
  USING (
    marie_id IN (SELECT id FROM public.maries WHERE user_id = auth.uid())
  );

-- ============================================================
-- STORAGE: bucket album-mariage
-- Photos/vidéos uploadées par les invités
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'album-mariage',
  'album-mariage',
  true,
  52428800,  -- 50 Mo max par fichier
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lecture publique album"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'album-mariage');

CREATE POLICY "Upload public album"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'album-mariage');

CREATE POLICY "Mariés suppriment leurs fichiers album"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'album-mariage'
    AND auth.role() = 'authenticated'
  );
