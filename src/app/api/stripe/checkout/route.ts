import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const ALLOWED_PRICE_IDS = new Set([
  "price_1TJbkIKKBs85XtqBrD4MvZDu", // Starter 9,90€/mois
  "price_1TJblgKKBs85XtqBUD5euLaF", // Pro 19,90€/mois
  "price_1TJbmfKKBs85XtqBN57D6Z5U", // Premium 39,90€/mois
]);

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { priceId, prestataireId } = await req.json();

    if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
      return NextResponse.json({ error: "Price ID invalide" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    // ── Récupérer le customer Stripe existant si disponible ───────────────────
    let existingCustomerId: string | null = null;

    if (prestataireId) {
      const supabase = getSupabaseAdmin();
      const { data: existing } = await supabase
        .from("abonnements")
        .select("stripe_customer_id")
        .eq("prestataire_id", prestataireId)
        .not("stripe_customer_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      existingCustomerId = existing?.stripe_customer_id ?? null;
    }

    // ── Créer une session Checkout Stripe dans tous les cas ───────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/prestataire?success=true`,
      cancel_url: `${origin}/tarifs`,
    };

    if (prestataireId) {
      sessionParams.metadata = { prestataire_id: prestataireId };
      sessionParams.subscription_data = {
        metadata: { prestataire_id: prestataireId },
      };
    }

    // Réutiliser le customer existant pour pré-remplir le Checkout
    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 }
    );
  }
}
