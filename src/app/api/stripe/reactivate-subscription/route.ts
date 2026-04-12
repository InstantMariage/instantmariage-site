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

    // Récupérer l'abonnement actif
    const { data: abonnement, error: fetchError } = await supabase
      .from("abonnements")
      .select("stripe_subscription_id")
      .eq("prestataire_id", prestataireId)
      .eq("statut", "actif")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !abonnement?.stripe_subscription_id) {
      return NextResponse.json({ error: "Aucun abonnement actif trouvé" }, { status: 404 });
    }

    // Annuler la résiliation programmée
    await stripe.subscriptions.update(abonnement.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stripe reactivate error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réactivation" },
      { status: 500 }
    );
  }
}
