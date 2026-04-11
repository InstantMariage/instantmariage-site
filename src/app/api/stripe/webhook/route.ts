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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Variables Supabase manquantes: URL=${!!url} KEY=${!!key}`);
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  console.log("[webhook] Requête reçue");

  // ── Vérification de la signature ──────────────────────────────────────────
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[webhook] Signature manquante");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET non défini");
    return NextResponse.json({ error: "Config manquante" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`[webhook] Événement validé: ${event.type} (id: ${event.id})`);
  } catch (err) {
    console.error("[webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // ── Traitement des événements ─────────────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin();

    // ─── Paiement réussi ───────────────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[webhook] checkout.session.completed — session id:", session.id);
      console.log("[webhook] metadata:", JSON.stringify(session.metadata));

      const prestataireId = session.metadata?.prestataire_id;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!prestataireId) {
        console.warn("[webhook] prestataire_id manquant dans les métadonnées");
        return NextResponse.json({ received: true });
      }
      if (!subscriptionId) {
        console.warn("[webhook] subscriptionId manquant (paiement one-shot ?)");
        return NextResponse.json({ received: true });
      }

      console.log(`[webhook] Récupération abonnement Stripe: ${subscriptionId}`);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = PRICE_TO_PLAN[priceId] ?? "starter";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dateFin = new Date((subscription as any).current_period_end * 1000).toISOString();
      const prix = (subscription.items.data[0]?.price.unit_amount ?? 0) / 100;

      console.log(`[webhook] Plan détecté: ${plan} (priceId: ${priceId}), dateFin: ${dateFin}, prix: ${prix}`);

      // Chercher l'abonnement existant pour ce prestataire
      const { data: existing, error: selectError } = await supabase
        .from("abonnements")
        .select("id")
        .eq("prestataire_id", prestataireId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows found (normal pour un nouveau prestataire)
        console.error("[webhook] Erreur SELECT abonnement:", selectError);
      }

      if (existing) {
        console.log(`[webhook] Mise à jour abonnement existant id: ${existing.id}`);
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

        if (error) {
          console.error("[webhook] Erreur UPDATE abonnement:", JSON.stringify(error));
        } else {
          console.log("[webhook] Abonnement mis à jour avec succès");
        }
      } else {
        console.log(`[webhook] Insertion nouvel abonnement pour prestataire: ${prestataireId}`);
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

        if (error) {
          console.error("[webhook] Erreur INSERT abonnement:", JSON.stringify(error));
        } else {
          console.log("[webhook] Nouvel abonnement inséré avec succès");
        }
      }

      // Activer le flag abonnement_actif sur le prestataire
      const { error: updatePrestErr } = await supabase
        .from("prestataires")
        .update({ abonnement_actif: true })
        .eq("id", prestataireId);

      if (updatePrestErr) {
        console.error("[webhook] Erreur UPDATE prestataires.abonnement_actif:", JSON.stringify(updatePrestErr));
      } else {
        console.log(`[webhook] prestataire ${prestataireId} — abonnement_actif=true`);
      }
    }

    // ─── Abonnement annulé ─────────────────────────────────────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[webhook] customer.subscription.deleted — sub id:", subscription.id);
      console.log("[webhook] metadata:", JSON.stringify(subscription.metadata));

      const prestataireId = subscription.metadata?.prestataire_id;
      const subscriptionId = subscription.id;

      if (!prestataireId) {
        console.warn("[webhook] prestataire_id manquant dans les métadonnées de l'abonnement");
        return NextResponse.json({ received: true });
      }

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

      if (error) {
        console.error("[webhook] Erreur UPDATE abonnement (annulation):", JSON.stringify(error));
      } else {
        console.log("[webhook] Abonnement annulé — passage à gratuit/inactif");
      }

      const { error: updatePrestErr } = await supabase
        .from("prestataires")
        .update({ abonnement_actif: false })
        .eq("id", prestataireId);

      if (updatePrestErr) {
        console.error("[webhook] Erreur UPDATE prestataires.abonnement_actif (annulation):", JSON.stringify(updatePrestErr));
      } else {
        console.log(`[webhook] prestataire ${prestataireId} — abonnement_actif=false`);
      }
    }

    console.log(`[webhook] Événement ${event.type} traité avec succès`);
    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[webhook] Erreur non capturée:", err);
    return NextResponse.json(
      { error: "Erreur interne du webhook", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
