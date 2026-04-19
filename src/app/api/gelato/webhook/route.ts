export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import type { GelatoOrderStatus } from "@/lib/gelato";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key);
}

// Vérifie la signature HMAC-SHA256 envoyée par Gelato
function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expBuffer = Buffer.from(expected, "hex");
    if (sigBuffer.length !== expBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expBuffer);
  } catch {
    return false;
  }
}

// Mappage statut Gelato → colonne gelato_statut
const VALID_STATUSES: GelatoOrderStatus[] = [
  "created",
  "passed",
  "failed",
  "canceled",
  "printed",
  "shipped",
  "delivered",
];

interface GelatoWebhookPayload {
  id: string;
  event: string;
  order?: {
    id: string;
    orderReferenceId?: string;
    status: GelatoOrderStatus;
    shipments?: Array<{
      trackingCode?: string;
      trackingUrl?: string;
      shippedAt?: string;
    }>;
    metadata?: Record<string, string>;
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Vérification de la signature si le secret est configuré
  const webhookSecret = process.env.GELATO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("x-gelato-signature") ?? "";
    if (!verifySignature(body, signature, webhookSecret)) {
      console.error("[gelato/webhook] Signature invalide");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }
  }

  let payload: GelatoWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const { event, order } = payload;

  if (!order) {
    return NextResponse.json({ received: true });
  }

  if (!VALID_STATUSES.includes(order.status)) {
    return NextResponse.json({ received: true });
  }

  const invitationOrderId =
    order.metadata?.invitation_order_id ?? order.orderReferenceId ?? null;

  if (!invitationOrderId) {
    console.warn("[gelato/webhook] Pas d'invitation_order_id dans metadata:", order.id);
    return NextResponse.json({ received: true });
  }

  const supabase = getSupabaseAdmin();

  const update: Record<string, unknown> = {
    gelato_statut: order.status,
    gelato_updated_at: new Date().toISOString(),
  };

  // Ajout des infos de tracking si l'ordre est expédié
  if (order.status === "shipped" && order.shipments?.length) {
    const shipment = order.shipments[0];
    update.gelato_tracking_code = shipment.trackingCode ?? null;
    update.gelato_tracking_url = shipment.trackingUrl ?? null;
    update.gelato_shipped_at = shipment.shippedAt ?? new Date().toISOString();
  }

  const { error } = await supabase
    .from("invitation_orders")
    .update(update)
    .eq("id", invitationOrderId);

  if (error) {
    console.error("[gelato/webhook] Erreur UPDATE invitation_orders:", event, error);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
