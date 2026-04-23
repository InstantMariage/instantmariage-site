-- Migration 027 : Colonnes virement sur cagnotte + politiques RLS admin

-- 1. Colonnes virement sur invitations
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS virement_statut TEXT NOT NULL DEFAULT 'non_demande'
    CHECK (virement_statut IN ('non_demande', 'demande', 'vire')),
  ADD COLUMN IF NOT EXISTS virement_date TIMESTAMPTZ;

-- 2. Fonction helper is_admin() — vérifie le rôle dans public.users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- 3. Admin : lecture + mise à jour des invitations
CREATE POLICY "admin_select_invitations" ON public.invitations
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_invitations" ON public.invitations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Admin : contributions cagnotte
CREATE POLICY "admin_select_contributions" ON public.cagnotte_contributions
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 5. Admin : mariés
CREATE POLICY "admin_select_maries" ON public.maries
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 6. Admin : prestataires (lecture + mise à jour badge vérifié)
CREATE POLICY "admin_select_prestataires" ON public.prestataires
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_prestataires" ON public.prestataires
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Admin : lecture de tous les users (pour emails dans les listes)
CREATE POLICY "admin_select_users" ON public.users
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 8. Admin : lecture de tous les abonnements
CREATE POLICY "admin_select_abonnements" ON public.abonnements
  FOR SELECT TO authenticated
  USING (public.is_admin());
