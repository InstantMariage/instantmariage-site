-- Migration 020 : Ajout colonnes render Remotion Lambda sur invitation_orders
-- + colonne pack pour stocker le type de commande

ALTER TABLE public.invitation_orders
  ADD COLUMN IF NOT EXISTS pack          TEXT,
  ADD COLUMN IF NOT EXISTS render_id     TEXT,
  ADD COLUMN IF NOT EXISTS render_bucket TEXT,
  ADD COLUMN IF NOT EXISTS render_statut TEXT NOT NULL DEFAULT 'pending'
    CHECK (render_statut IN ('pending', 'processing', 'done', 'error')),
  ADD COLUMN IF NOT EXISTS video_url     TEXT;

CREATE INDEX IF NOT EXISTS idx_invitation_orders_render_statut
  ON public.invitation_orders(render_statut)
  WHERE render_statut IN ('pending', 'processing');
