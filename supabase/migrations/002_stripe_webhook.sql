-- ============================================
-- Migration: Champs Stripe + mise à jour plans
-- ============================================

-- Ajout colonnes Stripe sur la table abonnements
ALTER TABLE public.abonnements
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Mise à jour de la contrainte sur les plans
-- (remplace 'essentiel' par 'starter' et 'pro')
ALTER TABLE public.abonnements
  DROP CONSTRAINT IF EXISTS abonnements_plan_check;

ALTER TABLE public.abonnements
  ADD CONSTRAINT abonnements_plan_check
  CHECK (plan IN ('gratuit', 'starter', 'pro', 'premium'));

-- Mise à jour des lignes existantes avec l'ancien plan 'essentiel'
UPDATE public.abonnements SET plan = 'starter' WHERE plan = 'essentiel';

-- Index pour lookup rapide par prestataire
CREATE INDEX IF NOT EXISTS idx_abonnements_prestataire_id
  ON public.abonnements (prestataire_id);

-- Index pour lookup par subscription Stripe (webhook)
CREATE INDEX IF NOT EXISTS idx_abonnements_stripe_sub_id
  ON public.abonnements (stripe_subscription_id);
