export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { PlanAbonnement } from "@/lib/supabase";
import { renderInvitationVideo } from "../../../../../lib/remotion-lambda";
import { sendInvitationConfirmationEmail, sendCagnotteMerciEmail, sendCagnotteNotifEmail, sendCommandeCadreEmail, sendCommandeChevaletEmail, sendTemplateDigitalEmail } from "@/lib/emails";

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

// ── Cagnotte payment handler ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCagnottePayment(supabase: any, session: Stripe.Checkout.Session) {
  const stripeSessionId = session.id;
  const meta = session.metadata ?? {};

  const invitationId = meta.invitation_id ?? null;
  const marieId = meta.marie_id ?? null;
  const contributeurNom = meta.contributeur_nom ?? 'Anonyme';
  const contributeurEmail = meta.contributeur_email ?? '';
  const montantCents = Number(meta.montant_cents ?? session.amount_total ?? 0);

  // Met à jour la contribution en statut payé
  const { error: updateErr } = await supabase
    .from('cagnotte_contributions')
    .update({ statut: 'paye' })
    .eq('stripe_session_id', stripeSessionId);

  if (updateErr) {
    console.error('[webhook/cagnotte] Erreur UPDATE contribution:', updateErr);
  }

  // Calcule le total collecté pour cet invitation
  const { data: totaux } = await supabase
    .from('cagnotte_contributions')
    .select('montant_cents')
    .eq('invitation_id', invitationId)
    .eq('statut', 'paye');

  const totalCents: number = (totaux ?? []).reduce(
    (acc: number, r: { montant_cents: number }) => acc + r.montant_cents,
    0
  );

  // Récupère les infos du faire-part pour les emails
  let coupleNames = 'Les mariés';
  let cagnotteTitre = 'Cagnotte mariage';
  let invitationSlug = '';
  let coupleEmail = '';

  if (invitationId) {
    const { data: inv } = await supabase
      .from('invitations')
      .select('slug, config, cagnotte_titre')
      .eq('id', invitationId)
      .single();

    if (inv) {
      invitationSlug = inv.slug ?? '';
      cagnotteTitre = inv.cagnotte_titre ?? cagnotteTitre;
      const config = (inv.config ?? {}) as Record<string, string>;
      coupleNames = config.coupleNames ?? coupleNames;
    }
  }

  // Email du couple (via mariés → users)
  if (marieId) {
    const { data: marie } = await supabase
      .from('maries')
      .select('user_id')
      .eq('id', marieId)
      .single();

    if (marie?.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', marie.user_id)
        .single();
      coupleEmail = user?.email ?? '';
    }
  }

  // Email de remerciement au contributeur
  if (contributeurEmail) {
    try {
      await sendCagnotteMerciEmail({
        contributeurEmail,
        contributeurNom,
        coupleNames,
        montantEuros: montantCents / 100,
        cagnotteTitre,
        invitationSlug,
      });
    } catch (e) {
      console.error('[webhook/cagnotte] Erreur email merci:', e);
    }
  }

  // Notification aux mariés
  if (coupleEmail) {
    try {
      // Récupère le message de la contribution (depuis la DB car non stocké en metadata)
      const { data: contrib } = await supabase
        .from('cagnotte_contributions')
        .select('message')
        .eq('stripe_session_id', stripeSessionId)
        .maybeSingle();

      await sendCagnotteNotifEmail({
        coupleEmail,
        coupleNames,
        contributeurNom,
        montantEuros: montantCents / 100,
        message: contrib?.message ?? null,
        totalCollecteEuros: totalCents / 100,
      });
    } catch (e) {
      console.error('[webhook/cagnotte] Erreur email notif mariés:', e);
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

      // ── Cagnotte mariage ──────────────────────────────────────────────
      if (session.metadata?.product_type === "cagnotte") {
        await handleCagnottePayment(supabase, session);
        return NextResponse.json({ received: true });
      }

      // ── Template QR Code marié ────────────────────────────────────
      if (session.metadata?.product_type === "qrcode_template") {
        const marieId = session.metadata?.marie_id;
        const templateId = session.metadata?.template_id;
        if (!marieId || !templateId) {
          console.error("[webhook/qrcode_template] Metadata manquante");
          return NextResponse.json({ received: true });
        }
        const expireAt = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString();

        const { data: marie, error } = await supabase
          .from("maries")
          .update({
            qrcode_template_achete: templateId,
            qrcode_template_expire_at: expireAt,
          })
          .eq("id", marieId)
          .select("prenom_marie1, prenom_marie2")
          .single();
        if (error) {
          console.error("[webhook/qrcode_template] Erreur UPDATE maries:", error);
        }

        const coupleNames = marie
          ? marie.prenom_marie2
            ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
            : marie.prenom_marie1
          : "Couple";

        await supabase.from("commandes").insert({
          marie_id: marieId,
          produit: "template_digital",
          template_id: templateId,
          montant: 9.90,
          stripe_session_id: session.id,
          statut: "recue",
        });

        try {
          await sendTemplateDigitalEmail({ coupleNames, templateId, marieId });
        } catch (emailErr) {
          console.error("[webhook/qrcode_template] Erreur email admin:", emailErr);
        }

        return NextResponse.json({ received: true });
      }

      // ── Cadre physique ────────────────────────────────────────────
      if (session.metadata?.product_type === "cadre_physique") {
        const marieId = session.metadata?.marie_id;
        const templateId = session.metadata?.template_id;
        const adresseJson = session.metadata?.adresse_livraison ?? "{}";

        if (!marieId || !templateId) {
          console.error("[webhook/cadre_physique] Metadata manquante");
          return NextResponse.json({ received: true });
        }

        // Met à jour qrcode_template_achete si pas encore acheté
        const { data: marie } = await supabase
          .from("maries")
          .select("prenom_marie1, prenom_marie2, qrcode_template_achete")
          .eq("id", marieId)
          .single();

        if (marie && !marie.qrcode_template_achete) {
          await supabase
            .from("maries")
            .update({ qrcode_template_achete: templateId })
            .eq("id", marieId);
        }

        // Envoie l'email admin
        let adresse: Record<string, string> = {};
        try { adresse = JSON.parse(adresseJson); } catch { /* ignore */ }

        const coupleNames = marie
          ? marie.prenom_marie2
            ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
            : marie.prenom_marie1
          : "Couple";

        await supabase.from("commandes").insert({
          marie_id: marieId,
          produit: "cadre",
          template_id: templateId,
          montant: 39.90,
          nom_destinataire: `${adresse.prenom ?? ""} ${adresse.nom ?? ""}`.trim() || null,
          adresse: adresse.adresse ?? "",
          code_postal: adresse.codePostal ?? "",
          ville: adresse.ville ?? "",
          telephone: adresse.telephone ?? "",
          date_mariage: adresse.dateMariage || null,
          stripe_session_id: session.id,
          statut: "recue",
        });

        try {
          await sendCommandeCadreEmail({
            coupleNames,
            templateId,
            adresse: adresse.adresse ?? "",
            codePostal: adresse.codePostal ?? "",
            ville: adresse.ville ?? "",
            telephone: adresse.telephone ?? "",
            dateMariage: adresse.dateMariage ?? "",
            marieId,
          });
        } catch (emailErr) {
          console.error("[webhook/cadre_physique] Erreur email admin:", emailErr);
        }

        return NextResponse.json({ received: true });
      }

      // ── Chevalet physique ──────────────────────────────────────────────
      if (session.metadata?.product_type === "chevalet_physique") {
        const marieId = session.metadata?.marie_id;
        const adresseJson = session.metadata?.adresse_livraison ?? "{}";

        if (!marieId) {
          console.error("[webhook/chevalet_physique] marie_id manquant");
          return NextResponse.json({ received: true });
        }

        const { data: marie } = await supabase
          .from("maries")
          .select("prenom_marie1, prenom_marie2")
          .eq("id", marieId)
          .single();

        let adresse: Record<string, string> = {};
        try { adresse = JSON.parse(adresseJson); } catch { /* ignore */ }

        const coupleNames = marie
          ? marie.prenom_marie2
            ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
            : marie.prenom_marie1
          : "Couple";

        await supabase.from("commandes").insert({
          marie_id: marieId,
          produit: "chevalet",
          montant: 19.90,
          nom_destinataire: `${adresse.prenom ?? ""} ${adresse.nom ?? ""}`.trim() || null,
          adresse: adresse.adresse ?? "",
          code_postal: adresse.codePostal ?? "",
          ville: adresse.ville ?? "",
          telephone: adresse.telephone ?? "",
          date_mariage: adresse.dateMariage || null,
          stripe_session_id: session.id,
          statut: "recue",
        });

        try {
          await sendCommandeChevaletEmail({
            coupleNames,
            adresse: adresse.adresse ?? "",
            codePostal: adresse.codePostal ?? "",
            ville: adresse.ville ?? "",
            telephone: adresse.telephone ?? "",
            dateMariage: adresse.dateMariage ?? "",
            marieId,
          });
        } catch (emailErr) {
          console.error("[webhook/chevalet_physique] Erreur email admin:", emailErr);
        }

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
