export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const prestataireId = req.nextUrl.searchParams.get("prestataire_id");
  if (!prestataireId) {
    return NextResponse.json({ error: "prestataire_id requis" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: abonnement } = await supabase
      .from("abonnements")
      .select("stripe_subscription_id")
      .eq("prestataire_id", prestataireId)
      .in("plan", ["elite-vitrine", "elite-shop"])
      .eq("statut", "actif")
      .not("stripe_subscription_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!abonnement?.stripe_subscription_id) {
      return NextResponse.json({ domain: null });
    }

    const subscription = await stripe.subscriptions.retrieve(
      abonnement.stripe_subscription_id
    );

    const domain = subscription.metadata?.domain ?? null;
    return NextResponse.json({ domain });
  } catch (error) {
    console.error("[subscription-domain]", error);
    return NextResponse.json({ domain: null });
  }
}
