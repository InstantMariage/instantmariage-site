-- ============================================================
-- Migration 023 : Gestionnaire d'invités & Plan de table
-- Tables : wedding_tables, wedding_guests
-- ============================================================

-- ============================================================
-- TABLE: wedding_tables
-- Tables rondes du plan de salle
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wedding_tables (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  marie_id    UUID        NOT NULL REFERENCES public.maries(id) ON DELETE CASCADE,
  nom         TEXT        NOT NULL DEFAULT 'Table 1',
  capacite    INTEGER     NOT NULL DEFAULT 10 CHECK (capacite BETWEEN 2 AND 30),
  position_x  FLOAT       NOT NULL DEFAULT 100,
  position_y  FLOAT       NOT NULL DEFAULT 100,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_tables_marie_id
  ON public.wedding_tables(marie_id);

ALTER TABLE public.wedding_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mariés gèrent leurs tables"
  ON public.wedding_tables FOR ALL
  USING (
    marie_id IN (
      SELECT id FROM public.maries WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- TABLE: wedding_guests
-- Liste complète des invités avec toutes les métadonnées
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wedding_guests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  marie_id            UUID        NOT NULL REFERENCES public.maries(id) ON DELETE CASCADE,

  -- Identité
  prenom              TEXT        NOT NULL,
  nom                 TEXT        NOT NULL DEFAULT '',
  email               TEXT,
  telephone           TEXT,

  -- Infos mariage
  regime_alimentaire  TEXT        NOT NULL DEFAULT 'normal'
                                  CHECK (regime_alimentaire IN (
                                    'normal', 'vegetarien', 'vegan',
                                    'halal', 'casher', 'sans_gluten'
                                  )),
  relation            TEXT        NOT NULL DEFAULT 'Autres'
                                  CHECK (relation IN (
                                    'Famille mariée', 'Famille marié',
                                    'Amis mariée', 'Amis marié',
                                    'Amis communs', 'Famille commune',
                                    'Collègues mariée', 'Collègues marié',
                                    'Voisins', 'Autres'
                                  )),
  table_id            UUID        REFERENCES public.wedding_tables(id) ON DELETE SET NULL,
  presence_confirmee  BOOLEAN,    -- NULL = sans réponse, TRUE = confirmé, FALSE = décliné
  notes               TEXT,

  -- Traçabilité source
  source              TEXT        NOT NULL DEFAULT 'manuel'
                                  CHECK (source IN ('manuel', 'rsvp')),
  rsvp_response_id    UUID        REFERENCES public.rsvp_responses(id) ON DELETE SET NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_guests_marie_id
  ON public.wedding_guests(marie_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_table_id
  ON public.wedding_guests(table_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wedding_guests_rsvp_unique
  ON public.wedding_guests(rsvp_response_id)
  WHERE rsvp_response_id IS NOT NULL;

ALTER TABLE public.wedding_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mariés gèrent leurs invités"
  ON public.wedding_guests FOR ALL
  USING (
    marie_id IN (
      SELECT id FROM public.maries WHERE user_id = auth.uid()
    )
  );
