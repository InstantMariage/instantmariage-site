import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { prestataireId } = await req.json();

    if (!prestataireId) {
      return NextResponse.json({ error: "prestataireId manquant" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: abonnement, error } = await supabase
      .from("abonnements")
      .select("stripe_customer_id")
      .eq("prestataire_id", prestataireId)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !abonnement?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun client Stripe trouvé pour ce prestataire" },
        { status: 404 }
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: abonnement.stripe_customer_id,
      return_url: `${origin}/dashboard/prestataire/abonnement`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[portal] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session portail" },
      { status: 500 }
    );
  }
}
