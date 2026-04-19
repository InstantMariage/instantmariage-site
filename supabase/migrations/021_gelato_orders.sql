-- Migration 021 : Colonnes Gelato sur invitation_orders (impression faire-parts)

ALTER TABLE public.invitation_orders
  ADD COLUMN IF NOT EXISTS gelato_order_id     TEXT,
  ADD COLUMN IF NOT EXISTS gelato_statut       TEXT
    CHECK (gelato_statut IN ('created','passed','failed','canceled','printed','shipped','delivered')),
  ADD COLUMN IF NOT EXISTS gelato_tracking_code TEXT,
  ADD COLUMN IF NOT EXISTS gelato_tracking_url  TEXT,
  ADD COLUMN IF NOT EXISTS gelato_shipped_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gelato_updated_at    TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_invitation_orders_gelato_order_id
  ON public.invitation_orders(gelato_order_id)
  WHERE gelato_order_id IS NOT NULL;
