export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prestataireId = searchParams.get("prestataireId");

    if (!prestataireId) {
      return NextResponse.json({ error: "prestataireId manquant" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Récupérer le customer Stripe depuis Supabase
    const { data: abonnement, error: fetchError } = await supabase
      .from("abonnements")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("prestataire_id", prestataireId)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !abonnement?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    // Récupérer les factures depuis Stripe
    const invoiceList = await stripe.invoices.list({
      customer: abonnement.stripe_customer_id,
      limit: 12,
      status: "paid",
    });

    const invoices = invoiceList.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount_paid: inv.amount_paid / 100,
      currency: inv.currency,
      created: inv.created,
      pdf_url: inv.invoice_pdf,
      hosted_url: inv.hosted_invoice_url,
      period_start: inv.period_start,
      period_end: inv.period_end,
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Stripe invoices error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des factures" },
      { status: 500 }
    );
  }
}
