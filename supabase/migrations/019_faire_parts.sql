-- ============================================================
-- Migration 019 : Faire-part animés
-- Tables : invitations, invitation_orders, rsvp_responses
-- ============================================================

-- ============================================================
-- TABLE: invitation_templates
-- Templates animés gérés par les admins
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitation_templates (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        NOT NULL UNIQUE,
  nom           TEXT        NOT NULL,
  description   TEXT,
  apercu_url    TEXT,
  video_url     TEXT,
  categorie     TEXT        NOT NULL DEFAULT 'classique'
                            CHECK (categorie IN ('classique', 'champetre', 'moderne', 'boheme', 'luxe')),
  plan_requis   TEXT        NOT NULL DEFAULT 'gratuit'
                            CHECK (plan_requis IN ('gratuit', 'premium')),
  config_defaut JSONB       NOT NULL DEFAULT '{}',
  actif         BOOLEAN     NOT NULL DEFAULT true,
  ordre         INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lecture publique des templates (pour la page de choix)
ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates visibles par tous"
  ON public.invitation_templates FOR SELECT
  USING (actif = true);

CREATE POLICY "Admin gère les templates"
  ON public.invitation_templates FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

-- ============================================================
-- TABLE: invitations
-- Faire-part créé et personnalisé par le couple marié
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  marie_id         UUID        NOT NULL REFERENCES public.maries(id) ON DELETE CASCADE,
  template_id      UUID        REFERENCES public.invitation_templates(id) ON DELETE SET NULL,
  slug             TEXT        NOT NULL UNIQUE,
  titre            TEXT        NOT NULL DEFAULT 'Notre Mariage',

  -- Personnalisation (noms, date, lieu, couleurs, polices, textes)
  config           JSONB       NOT NULL DEFAULT '{}',

  -- Paramètres RSVP
  rsvp_actif       BOOLEAN     NOT NULL DEFAULT true,
  rsvp_deadline    DATE,
  nb_invites_max   INTEGER,

  -- État
  statut           TEXT        NOT NULL DEFAULT 'brouillon'
                               CHECK (statut IN ('brouillon', 'publie', 'archive')),

  -- URL de l'image de prévisualisation générée
  apercu_url       TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_marie_id
  ON public.invitations(marie_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug
  ON public.invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_statut
  ON public.invitations(marie_id, statut);

CREATE TRIGGER set_updated_at_invitations
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Le couple voit et gère ses propres faire-part
CREATE POLICY "Marié voit ses invitations"
  ON public.invitations FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.maries WHERE id = marie_id)
  );

CREATE POLICY "Marié crée ses invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.maries WHERE id = marie_id)
  );

CREATE POLICY "Marié modifie ses invitations"
  ON public.invitations FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM public.maries WHERE id = marie_id)
  );

CREATE POLICY "Marié supprime ses invitations"
  ON public.invitations FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM public.maries WHERE id = marie_id)
  );

-- Les invitations publiées sont lisibles sans authentification (lien de partage)
CREATE POLICY "Invitation publiée accessible publiquement"
  ON public.invitations FOR SELECT
  USING (statut = 'publie');

-- ============================================================
-- TABLE: invitation_guests
-- Liste des invités enregistrés par le couple (optionnel)
-- Permet de générer des liens RSVP personnalisés par invité
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitation_guests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  UUID        NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  prenom         TEXT,
  nom            TEXT,
  email          TEXT,
  telephone      TEXT,
  -- Token unique envoyé dans le lien RSVP de cet invité
  token          TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  nb_places      INTEGER     NOT NULL DEFAULT 1,
  groupe         TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitation_guests_invitation_id
  ON public.invitation_guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_guests_token
  ON public.invitation_guests(token);

ALTER TABLE public.invitation_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marié voit ses invités"
  ON public.invitation_guests FOR SELECT
  USING (
    auth.uid() = (
      SELECT m.user_id FROM public.maries m
      JOIN public.invitations i ON i.marie_id = m.id
      WHERE i.id = invitation_id
    )
  );

CREATE POLICY "Marié gère ses invités"
  ON public.invitation_guests FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT m.user_id FROM public.maries m
      JOIN public.invitations i ON i.marie_id = m.id
      WHERE i.id = invitation_id
    )
  );

CREATE POLICY "Marié modifie ses invités"
  ON public.invitation_guests FOR UPDATE
  USING (
    auth.uid() = (
      SELECT m.user_id FROM public.maries m
      JOIN public.invitations i ON i.marie_id = m.id
      WHERE i.id = invitation_id
    )
  );

CREATE POLICY "Marié supprime ses invités"
  ON public.invitation_guests FOR DELETE
  USING (
    auth.uid() = (
      SELECT m.user_id FROM public.maries m
      JOIN public.invitations i ON i.marie_id = m.id
      WHERE i.id = invitation_id
    )
  );

-- Lecture publique via token (pour la page RSVP de l'invité)
CREATE POLICY "Invité consulte sa fiche via token"
  ON public.invitation_guests FOR SELECT
  USING (true);

-- ============================================================
-- TABLE: rsvp_responses
-- Réponses des invités (avec ou sans liste d'invités préenregistrés)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rsvp_responses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id   UUID        NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  -- Lien optionnel vers un invité préenregistré
  guest_id        UUID        REFERENCES public.invitation_guests(id) ON DELETE SET NULL,

  -- Informations de l'invité (renseignées lors du RSVP si pas de guest_id)
  prenom          TEXT,
  nom             TEXT,
  email           TEXT,
  telephone       TEXT,

  -- Réponse
  presence        BOOLEAN     NOT NULL,
  nb_personnes    INTEGER     NOT NULL DEFAULT 1 CHECK (nb_personnes >= 0 AND nb_personnes <= 20),
  regime_alimentaire TEXT,
  message         TEXT,

  -- Métadonnées
  token_utilise   TEXT,
  ip_address      INET,
  repondu_le      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvp_responses_invitation_id
  ON public.rsvp_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_guest_id
  ON public.rsvp_responses(guest_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_email
  ON public.rsvp_responses(invitation_id, email);

ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

-- Le couple voit toutes les réponses à ses invitations
CREATE POLICY "Marié voit les réponses RSVP"
  ON public.rsvp_responses FOR SELECT
  USING (
    auth.uid() = (
      SELECT m.user_id FROM public.maries m
      JOIN public.invitations i ON i.marie_id = m.id
      WHERE i.id = invitation_id
    )
  );

-- N'importe qui peut répondre à une invitation publiée (sans être connecté)
CREATE POLICY "Invité soumet sa réponse RSVP"
  ON public.rsvp_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations
      WHERE id = invitation_id AND statut = 'publie'
    )
  );

-- Pas de modification ni suppression des réponses par les invités
-- (le couple peut modifier via la policy admin ou le service role)

-- ============================================================
-- TABLE: invitation_orders
-- Commandes / accès premium pour les templates payants
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invitation_orders (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  marie_id              UUID        NOT NULL REFERENCES public.maries(id) ON DELETE CASCADE,
  invitation_id         UUID        REFERENCES public.invitations(id) ON DELETE SET NULL,
  template_id           UUID        REFERENCES public.invitation_templates(id) ON DELETE SET NULL,

  -- Stripe
  stripe_session_id     TEXT        UNIQUE,
  stripe_payment_intent TEXT,

  -- Montant
  montant_cts           INTEGER     NOT NULL DEFAULT 0,
  devise                TEXT        NOT NULL DEFAULT 'eur',

  -- État du paiement
  statut                TEXT        NOT NULL DEFAULT 'en_attente'
                                    CHECK (statut IN ('en_attente', 'paye', 'annule', 'rembourse')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitation_orders_marie_id
  ON public.invitation_orders(marie_id);
CREATE INDEX IF NOT EXISTS idx_invitation_orders_stripe_session
  ON public.invitation_orders(stripe_session_id);

CREATE TRIGGER set_updated_at_invitation_orders
  BEFORE UPDATE ON public.invitation_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.invitation_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marié voit ses commandes"
  ON public.invitation_orders FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.maries WHERE id = marie_id)
  );

CREATE POLICY "Marié crée une commande"
  ON public.invitation_orders FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.maries WHERE id = marie_id)
  );

-- Mise à jour réservée au service role (webhook Stripe)
-- Pas de policy UPDATE pour les utilisateurs normaux

-- ============================================================
-- FONCTION: statistiques RSVP d'une invitation
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_rsvp_stats(p_invitation_id UUID)
RETURNS TABLE (
  total_reponses  BIGINT,
  nb_presences    BIGINT,
  nb_absences     BIGINT,
  nb_personnes    BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)                                    AS total_reponses,
    COUNT(*) FILTER (WHERE presence = true)    AS nb_presences,
    COUNT(*) FILTER (WHERE presence = false)   AS nb_absences,
    COALESCE(SUM(nb_personnes) FILTER (WHERE presence = true), 0) AS nb_personnes
  FROM public.rsvp_responses
  WHERE invitation_id = p_invitation_id;
$$;

-- ============================================================
-- FONCTION: génération de slug unique pour les invitations
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_invitation_slug(
  p_prenom1 TEXT,
  p_prenom2 TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base   TEXT;
  v_slug   TEXT;
  v_suffix TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Normalisation basique (sans unaccent pour la compatibilité)
  v_base := lower(
    regexp_replace(
      concat_ws('-', p_prenom1, p_prenom2),
      '[^a-z0-9]+', '-', 'g'
    )
  );
  v_base := trim(both '-' from v_base);
  v_slug := v_base;

  LOOP
    SELECT EXISTS(SELECT 1 FROM public.invitations WHERE slug = v_slug) INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_suffix := substr(md5(random()::TEXT), 1, 6);
    v_slug   := v_base || '-' || v_suffix;
  END LOOP;

  RETURN v_slug;
END;
$$;

-- ============================================================
-- STORAGE: bucket invitation-assets
-- Photos / visuels personnalisés uploadés par les mariés
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-assets',
  'invitation-assets',
  true,
  5242880,  -- 5 Mo max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (les visuels sont intégrés dans le faire-part)
CREATE POLICY "Assets invitations lisibles publiquement"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invitation-assets');

-- Upload : uniquement les utilisateurs authentifiés dans leur dossier
CREATE POLICY "Marié upload ses assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invitation-assets'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Marié supprime ses assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'invitation-assets'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================================
-- STORAGE: bucket invitation-previews
-- Aperçus PNG générés côté serveur (og:image, miniatures)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-previews',
  'invitation-previews',
  true,
  2097152,  -- 2 Mo max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Previews lisibles publiquement"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invitation-previews');

-- Écriture réservée au service role (génération serveur)
-- Pas de policy INSERT/DELETE pour les utilisateurs

-- ============================================================
-- Données initiales : quelques templates de démonstration
-- ============================================================
INSERT INTO public.invitation_templates (slug, nom, description, categorie, plan_requis, config_defaut, ordre)
VALUES
  ('boheme-floral', 'Bohème Floral', 'Aquarelles florales pastel avec animations pétales', 'boheme', 'gratuit',
   '{"couleur_primaire": "#d4a5a5", "couleur_secondaire": "#f5e6da", "police_titre": "Playfair Display", "police_corps": "Lato", "animation": "petales"}',
   1),
  ('moderne-minimaliste', 'Moderne Minimaliste', 'Lignes épurées, typographie bold, animations géométriques', 'moderne', 'gratuit',
   '{"couleur_primaire": "#1a1a1a", "couleur_secondaire": "#ffffff", "police_titre": "Montserrat", "police_corps": "Open Sans", "animation": "geometrique"}',
   2),
  ('champetre-provence', 'Champêtre Provence', 'Lavande, olivier et lumière dorée du Sud', 'champetre', 'gratuit',
   '{"couleur_primaire": "#7b6d8d", "couleur_secondaire": "#f0e6c8", "police_titre": "Cormorant Garamond", "police_corps": "Raleway", "animation": "lavande"}',
   3),
  ('luxe-dore', 'Luxe Doré', 'Or, marbre blanc et particules scintillantes', 'luxe', 'premium',
   '{"couleur_primaire": "#c9a84c", "couleur_secondaire": "#fafafa", "police_titre": "Cinzel", "police_corps": "Raleway", "animation": "particules_or"}',
   4),
  ('classique-elégant', 'Classique Élégant', 'Calligraphie, enveloppe animée, style intemporel', 'classique', 'premium',
   '{"couleur_primaire": "#4a4a6a", "couleur_secondaire": "#f8f4ef", "police_titre": "Great Vibes", "police_corps": "Lora", "animation": "enveloppe"}',
   5)
ON CONFLICT (slug) DO NOTHING;
