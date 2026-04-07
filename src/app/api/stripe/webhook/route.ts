import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { PlanAbonnement } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Map Price ID → plan name
const PRICE_TO_PLAN: Record<string, PlanAbonnement> = {
  "price_1TJbkIKKBs85XtqBrD4MvZDu": "starter",
  "price_1TJblgKKBs85XtqBUD5euLaF": "pro",
  "price_1TJbmfKKBs85XtqBN57D6Z5U": "premium",
};

// Client Supabase avec service_role (bypass RLS pour les écritures du webhook)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // ─── Paiement réussi ─────────────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const prestataireId = session.metadata?.prestataire_id;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!prestataireId || !subscriptionId) {
      console.warn("Webhook checkout.session.completed: prestataire_id ou subscriptionId manquant");
      return NextResponse.json({ received: true });
    }

    // Récupérer les détails de l'abonnement Stripe (plan, date fin)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id ?? "";
    const plan = PRICE_TO_PLAN[priceId] ?? "starter";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateFin = new Date((subscription as any).current_period_end * 1000).toISOString();
    const prix = (subscription.items.data[0]?.price.unit_amount ?? 0) / 100;

    // Chercher l'abonnement existant pour ce prestataire
    const { data: existing } = await supabase
      .from("abonnements")
      .select("id")
      .eq("prestataire_id", prestataireId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Mettre à jour la ligne existante
      const { error } = await supabase
        .from("abonnements")
        .update({
          plan,
          statut: "actif",
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          date_debut: new Date().toISOString(),
          date_fin: dateFin,
          prix,
        })
        .eq("id", existing.id);

      if (error) console.error("Erreur update abonnement:", error);
    } else {
      // Insérer un nouvel enregistrement
      const { error } = await supabase.from("abonnements").insert({
        prestataire_id: prestataireId,
        plan,
        statut: "actif",
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        date_debut: new Date().toISOString(),
        date_fin: dateFin,
        prix,
      });

      if (error) console.error("Erreur insert abonnement:", error);
    }

    // Activer le flag abonnement_actif sur le prestataire
    await supabase
      .from("prestataires")
      .update({ abonnement_actif: true })
      .eq("id", prestataireId);
  }

  // ─── Abonnement annulé ───────────────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const prestataireId = subscription.metadata?.prestataire_id;
    const subscriptionId = subscription.id;

    if (!prestataireId) {
      console.warn("Webhook subscription.deleted: prestataire_id manquant dans les métadonnées");
      return NextResponse.json({ received: true });
    }

    // Repasser au plan gratuit
    const { error } = await supabase
      .from("abonnements")
      .update({
        plan: "gratuit",
        statut: "inactif",
        date_fin: new Date().toISOString(),
        prix: 0,
        stripe_subscription_id: null,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) console.error("Erreur update abonnement (annulation):", error);

    // Désactiver le flag abonnement_actif
    await supabase
      .from("prestataires")
      .update({ abonnement_actif: false })
      .eq("id", prestataireId);
  }

  return NextResponse.json({ received: true });
}
