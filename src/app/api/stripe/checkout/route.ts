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

    // ── Vérifier si le prestataire a déjà un abonnement Stripe actif ──────────
    if (prestataireId) {
      const supabase = getSupabaseAdmin();
      const { data: existing } = await supabase
        .from("abonnements")
        .select("stripe_subscription_id, stripe_customer_id")
        .eq("prestataire_id", prestataireId)
        .eq("statut", "actif")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing?.stripe_subscription_id) {
        // ── Upgrade/downgrade : modifier l'abonnement existant ───────────────
        const subscription = await stripe.subscriptions.retrieve(
          existing.stripe_subscription_id,
          { expand: ["latest_invoice.payment_intent"] }
        );
        const itemId = subscription.items.data[0]?.id;

        if (itemId) {
          const updated = await stripe.subscriptions.update(existing.stripe_subscription_id, {
            items: [{ id: itemId, price: priceId }],
            proration_behavior: "create_prorations",
            payment_behavior: "pending_if_incomplete",
            metadata: { prestataire_id: prestataireId },
            expand: ["latest_invoice.payment_intent"],
          });

          const origin = req.headers.get("origin") ?? "http://localhost:3000";

          // Si la facture proratisée nécessite une authentification 3DS
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invoice = (updated as any).latest_invoice;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const paymentIntent = invoice?.payment_intent as any;
          if (
            paymentIntent?.status === "requires_action" ||
            paymentIntent?.status === "requires_payment_method"
          ) {
            // Rediriger vers une page de confirmation de paiement
            return NextResponse.json({
              url: `${origin}/paiement/confirmer?payment_intent_client_secret=${paymentIntent.client_secret}&redirect_url=/dashboard/prestataire`,
            });
          }

          // Le webhook customer.subscription.updated mettra à jour la BDD.
          return NextResponse.json({
            url: `${origin}/dashboard/prestataire?success=true`,
          });
        }
      }
    }

    // ── Nouvel abonnement : créer une session Checkout ────────────────────────
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

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

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 }
    );
  }
}
