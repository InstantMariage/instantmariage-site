-- ============================================
-- Migration 011 : Lecture publique des abonnements
-- ============================================
-- Problème : la politique RLS existante sur `abonnements` n'autorise que
-- le prestataire connecté à lire ses propres abonnements. Les visiteurs
-- anonymes ne pouvaient donc pas voir le plan (PRO/PREMIUM) lors du join
-- dans la page profil => badges invisibles.
--
-- Correctif : autoriser la lecture publique des lignes abonnements.
-- Les colonnes stripe_* ne peuvent pas être exploitées sans la clé secrète Stripe.
-- ============================================

CREATE POLICY "Plan abonnement visible par tous"
  ON public.abonnements FOR SELECT
  USING (true);
