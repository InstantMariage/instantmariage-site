CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titre text NOT NULL,
  excerpt text,
  category text NOT NULL DEFAULT 'Conseils',
  content jsonb NOT NULL DEFAULT '[]',
  image text,
  meta_description text,
  keywords text,
  read_time text DEFAULT '5 min',
  auteur text DEFAULT 'InstantMariage',
  statut text NOT NULL DEFAULT 'brouillon'
    CHECK (statut IN ('brouillon', 'publie', 'archive')),
  date_publication timestamptz DEFAULT now(),
  nb_vues integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX articles_slug_idx ON public.articles (slug);
CREATE INDEX articles_statut_idx ON public.articles (statut);
CREATE INDEX articles_date_idx ON public.articles (date_publication DESC);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique" ON public.articles
  FOR SELECT USING (statut = 'publie');

CREATE POLICY "Admin full access" ON public.articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_articles_updated_at();
