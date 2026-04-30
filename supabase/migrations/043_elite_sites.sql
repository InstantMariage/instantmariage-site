-- Table for Elite plan site creation requests
CREATE TABLE IF NOT EXISTS elite_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id uuid NOT NULL REFERENCES prestataires(id) ON DELETE CASCADE,
  domaine text NOT NULL,
  statut text NOT NULL DEFAULT 'en_attente', -- en_attente | en_cours | en_ligne | suspendu
  type_activite text,
  nom_professionnel text,
  description_activite text,
  ville_principale text,
  template text,
  couleur_principale text DEFAULT '#F06292',
  couleur_secondaire text DEFAULT '#7C3AED',
  logo_url text,
  photos_urls text[] DEFAULT '{}',
  instagram text,
  facebook text,
  tiktok text,
  pinterest text,
  cgv_accepte boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(prestataire_id)
);

ALTER TABLE elite_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prestataires_own_elite_site" ON elite_sites
  FOR ALL USING (
    prestataire_id IN (
      SELECT id FROM prestataires WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "admin_all_elite_sites" ON elite_sites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Storage bucket for elite assets (logo + photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('elite-assets', 'elite-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "elite_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'elite-assets');

CREATE POLICY "elite_assets_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'elite-assets'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "elite_assets_auth_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'elite-assets'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "elite_assets_auth_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'elite-assets'
    AND auth.uid() IS NOT NULL
  );
