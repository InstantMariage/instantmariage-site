export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createGelatoOrder,
  GelatoApiError,
  type GelatoAddress,
  type GelatoOrderItem,
} from "@/lib/gelato";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let body: {
    invitationOrderId?: string;
    shippingAddress?: GelatoAddress;
    items?: GelatoOrderItem[];
    shipmentMethodUid?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const { invitationOrderId, shippingAddress, items, shipmentMethodUid } = body;

  if (!invitationOrderId || !shippingAddress || !items?.length) {
    return NextResponse.json(
      { error: "invitationOrderId, shippingAddress et items sont requis" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Récupère la commande pour vérifier qu'elle est payée
  const { data: order, error: orderErr } = await supabase
    .from("invitation_orders")
    .select("id, marie_id, statut, gelato_order_id")
    .eq("id", invitationOrderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 }
    );
  }

  if (order.statut !== "paye") {
    return NextResponse.json(
      { error: "Commande non payée" },
      { status: 422 }
    );
  }

  if (order.gelato_order_id) {
    return NextResponse.json(
      { error: "Commande Gelato déjà créée", gelatoOrderId: order.gelato_order_id },
      { status: 409 }
    );
  }

  try {
    const gelatoOrder = await createGelatoOrder({
      orderReferenceId: invitationOrderId,
      customerReferenceId: order.marie_id,
      items,
      shippingAddress,
      shipmentMethodUid,
      metadata: { invitation_order_id: invitationOrderId },
    });

    await supabase
      .from("invitation_orders")
      .update({
        gelato_order_id: gelatoOrder.id,
        gelato_statut: gelatoOrder.status,
      })
      .eq("id", invitationOrderId);

    return NextResponse.json({
      ok: true,
      gelatoOrderId: gelatoOrder.id,
      status: gelatoOrder.status,
    });
  } catch (err) {
    if (err instanceof GelatoApiError) {
      console.error("[gelato/create-order] Erreur API Gelato:", err.statusCode, err.body);
      return NextResponse.json(
        { error: "Erreur Gelato", details: err.message, body: err.body },
        { status: err.statusCode >= 400 && err.statusCode < 500 ? 422 : 502 }
      );
    }
    console.error("[gelato/create-order] Erreur inattendue:", err);
    return NextResponse.json(
      { error: "Erreur interne", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
