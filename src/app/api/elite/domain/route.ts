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

    // Get the Stripe customer ID for this prestataire
    const { data: abonnement } = await supabase
      .from("abonnements")
      .select("stripe_customer_id")
      .eq("prestataire_id", prestataireId)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!abonnement?.stripe_customer_id) {
      return NextResponse.json({ domain: null });
    }

    // List completed checkout sessions for this customer, newest first
    const sessions = await stripe.checkout.sessions.list({
      customer: abonnement.stripe_customer_id,
      limit: 25,
    });

    // Find the most recent completed Elite session that carries a domain
    for (const session of sessions.data) {
      if (session.status !== "complete") continue;
      if (session.metadata?.prestataire_id !== prestataireId) continue;
      if (!session.metadata?.domain) continue;
      return NextResponse.json({ domain: session.metadata.domain });
    }

    return NextResponse.json({ domain: null });
  } catch (error) {
    console.error("[elite/domain]", error);
    return NextResponse.json({ domain: null });
  }
}
