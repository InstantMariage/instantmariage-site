export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { PlanAbonnement } from "@/lib/supabase";
import { renderInvitationVideo } from "../../../../../lib/remotion-lambda";
import { sendInvitationConfirmationEmail } from "@/lib/emails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// ── Invitation payment handler ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvitationPayment(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const invitationId = session.metadata?.invitation_id ?? null;
  const pack = session.metadata?.pack ?? "digital";
  const montantCts = session.amount_total ?? 0;
  const stripeSessionId = session.id;
  const stripePaymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : null;

  // Récupère la config de l'invitation et l'id du marié
  let marieId: string | null = null;
  let invitationConfig: Record<string, unknown> = {};
  let templateId: string | null = null;

  if (invitationId) {
    const { data: inv, error: invErr } = await supabase
      .from("invitations")
      .select("marie_id, config, template_id")
      .eq("id", invitationId)
      .single();

    if (invErr) {
      console.error("[webhook/invitation] Erreur lecture invitation:", invErr);
    } else if (inv) {
      marieId = inv.marie_id;
      invitationConfig = (inv.config ?? {}) as Record<string, unknown>;
      templateId = inv.template_id;
    }
  }

  // Crée l'invitation_order
  const { data: order, error: orderErr } = await supabase
    .from("invitation_orders")
    .insert({
      marie_id: marieId,
      invitation_id: invitationId,
      template_id: templateId,
      stripe_session_id: stripeSessionId,
      stripe_payment_intent: stripePaymentIntent,
      montant_cts: montantCts,
      devise: "eur",
      statut: "paye",
      pack,
      render_statut: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("[webhook/invitation] Erreur INSERT invitation_order:", orderErr);
    return;
  }

  // Déclenche le rendu Lambda
  const renderParams = {
    coupleNames: String(invitationConfig.coupleNames ?? ""),
    date: String(invitationConfig.date ?? ""),
    lieu: String(invitationConfig.lieu ?? ""),
    message: invitationConfig.message ? String(invitationConfig.message) : undefined,
    accentColor: invitationConfig.accentColor ? String(invitationConfig.accentColor) : undefined,
  };

  let renderId: string | null = null;
  let renderBucket: string | null = null;

  try {
    const result = await renderInvitationVideo(renderParams);
    renderId = result.renderId;
    renderBucket = result.bucketName;

    await supabase
      .from("invitation_orders")
      .update({ render_id: renderId, render_bucket: renderBucket, render_statut: "processing" })
      .eq("id", order.id);
  } catch (renderErr) {
    console.error("[webhook/invitation] Erreur déclenchement rendu Lambda:", renderErr);
    await supabase
      .from("invitation_orders")
      .update({ render_statut: "error" })
      .eq("id", order.id);
  }

  // Email de confirmation au marié
  if (marieId) {
    const { data: marie } = await supabase
      .from("maries")
      .select("user_id")
      .eq("id", marieId)
      .single();

    if (marie?.user_id) {
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", marie.user_id)
        .single();

      if (user?.email) {
        try {
          await sendInvitationConfirmationEmail({
            recipientEmail: user.email,
            coupleNames: String(invitationConfig.coupleNames ?? "Votre mariage"),
            pack,
            montantEuros: montantCts / 100,
          });
        } catch (emailErr) {
          console.error("[webhook/invitation] Erreur envoi email confirmation:", emailErr);
        }
      }
    }
  }
}

// Map Price ID → plan name
const PRICE_TO_PLAN: Record<string, PlanAbonnement> = {
  "price_1TJbkIKKBs85XtqBrD4MvZDu": "starter",
  "price_1TJblgKKBs85XtqBUD5euLaF": "pro",
  "price_1TJbmfKKBs85XtqBN57D6Z5U": "premium",
};

// Plans payants → badge vérifié automatique
function planGrantsVerifie(plan: PlanAbonnement): boolean {
  return plan === "pro" || plan === "premium";
}

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

      // ── Faire-part : paiement one-time ────────────────────────────────
      if (session.metadata?.product_type === "invitation") {
        await handleInvitationPayment(supabase, session);
        return NextResponse.json({ received: true });
      }

      const prestataireId = session.metadata?.prestataire_id;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!prestataireId) {
        return NextResponse.json({ received: true });
      }
      if (!subscriptionId) {
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = PRICE_TO_PLAN[priceId] ?? "starter";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end;
      const dateFin = (periodEnd != null && Number.isFinite(Number(periodEnd)))
        ? new Date(Number(periodEnd) * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // fallback +30j
      const prix = (subscription.items.data[0]?.price.unit_amount ?? 0) / 100;

      // Chercher l'abonnement existant pour ce prestataire
      const { data: existing, error: selectError } = await supabase
        .from("abonnements")
        .select("id, stripe_subscription_id")
        .eq("prestataire_id", prestataireId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows found (normal pour un nouveau prestataire)
        console.error("[webhook] Erreur SELECT abonnement:", selectError);
      }

      // Annuler l'ancien abonnement Stripe si différent du nouveau
      const oldSubId = existing?.stripe_subscription_id;
      if (oldSubId && oldSubId !== subscriptionId) {
        try {
          await stripe.subscriptions.cancel(oldSubId);
        } catch {
          // S'il est déjà annulé ou introuvable, on continue sans bloquer
        }
      }

      if (existing) {
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
        }
      } else {
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
        }
      }

      // Activer le flag abonnement_actif + badge vérifié selon le plan
      const verifie = planGrantsVerifie(plan);
      const { error: updatePrestErr } = await supabase
        .from("prestataires")
        .update({ abonnement_actif: true, verifie })
        .eq("id", prestataireId);

      if (updatePrestErr) {
        console.error("[webhook] Erreur UPDATE prestataires.abonnement_actif/verifie:", JSON.stringify(updatePrestErr));
      }
    }

    // ─── Upgrade / downgrade (plan modifié sans nouvelle session) ─────────
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = PRICE_TO_PLAN[priceId] ?? "starter";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (subscription as any).current_period_end;
      const dateFin = periodEnd != null && Number.isFinite(Number(periodEnd))
        ? new Date(Number(periodEnd) * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const prix = (subscription.items.data[0]?.price.unit_amount ?? 0) / 100;

      // On met à jour par stripe_subscription_id, sans dépendre de la présence
      // de prestataire_id dans les métadonnées (robustesse si metadata absente).
      const { data: updatedAbo, error } = await supabase
        .from("abonnements")
        .update({ plan, statut: "actif", date_fin: dateFin, prix })
        .eq("stripe_subscription_id", subscription.id)
        .select("prestataire_id")
        .single();

      if (error) {
        console.error("[webhook] Erreur UPDATE abonnement (upgrade):", JSON.stringify(error));
      } else if (updatedAbo?.prestataire_id) {
        const verifie = planGrantsVerifie(plan);
        const { error: verifieErr } = await supabase
          .from("prestataires")
          .update({ verifie })
          .eq("id", updatedAbo.prestataire_id);

        if (verifieErr) {
          console.error("[webhook] Erreur UPDATE prestataires.verifie (upgrade):", JSON.stringify(verifieErr));
        }
      }
    }

    // ─── Abonnement annulé ─────────────────────────────────────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const prestataireId = subscription.metadata?.prestataire_id;
      const subscriptionId = subscription.id;

      if (!prestataireId) {
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
      }

      const { error: updatePrestErr } = await supabase
        .from("prestataires")
        .update({ abonnement_actif: false, verifie: false })
        .eq("id", prestataireId);

      if (updatePrestErr) {
        console.error("[webhook] Erreur UPDATE prestataires.abonnement_actif/verifie (annulation):", JSON.stringify(updatePrestErr));
      }
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[webhook] Erreur non capturée:", err);
    return NextResponse.json(
      { error: "Erreur interne du webhook", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
