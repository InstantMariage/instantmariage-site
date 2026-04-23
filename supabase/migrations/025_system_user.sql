-- ─── Migration 025 : Utilisateur système InstantMariage + messages automatiques ────
--
-- Crée un utilisateur système "InstantMariage" (UUID fixe) qui envoie des
-- messages automatiques aux prestataires via la messagerie interne.
-- Cet utilisateur ne peut pas se connecter (mot de passe invalide volontairement).

-- 1. Insertion dans auth.users (ne peut pas se logger)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'systeme@instantmariage.fr',
  'SYSTEM_ACCOUNT_NO_LOGIN_ALLOWED',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false
) ON CONFLICT (id) DO NOTHING;

-- 2. Insertion dans public.users
INSERT INTO public.users (id, email, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'systeme@instantmariage.fr',
  'admin',
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Table de tracking pour éviter les doublons de messages automatiques
CREATE TABLE IF NOT EXISTS public.auto_messages_sent (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  prestataire_id uuid REFERENCES public.prestataires(id) ON DELETE CASCADE NOT NULL,
  message_type   text NOT NULL,
  sent_at        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auto_messages_prestataire_type
  ON public.auto_messages_sent (prestataire_id, message_type, sent_at DESC);

-- RLS : accessible uniquement via service role (API admin)
ALTER TABLE public.auto_messages_sent ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent lire pour debug
CREATE POLICY "Admin lit le tracking messages auto"
  ON public.auto_messages_sent FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
