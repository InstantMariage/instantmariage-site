import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[api/inscription/prestataire] Variables manquantes:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { user_id, nom_entreprise, categorie, ville, telephone, ref_code } = await req.json();

    if (!user_id || !nom_entreprise || !categorie) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // Créer / mettre à jour le profil prestataire
    // Le trigger DB génère automatiquement le code_parrainage à l'insertion
    const { data, error } = await supabaseAdmin
      .from("prestataires")
      .upsert(
        { user_id, nom_entreprise, categorie, ville, telephone },
        { onConflict: "user_id", ignoreDuplicates: false }
      )
      .select("id");

    if (error) {
      console.error("[api/inscription/prestataire] Erreur insert DÉTAILLÉE:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }

    const newPrestataireId: string | undefined = data?.[0]?.id;

    // ── Traitement du parrainage ───────────────────────────────────────────────
    if (ref_code && newPrestataireId) {
      try {
        await appliquerParrainage({
          supabaseAdmin,
          filleulId: newPrestataireId,
          refCode: String(ref_code).toUpperCase().trim(),
        });
      } catch (err) {
        // Ne pas bloquer l'inscription si le parrainage échoue
        console.error("[api/inscription/prestataire] Erreur parrainage (non bloquante):", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/inscription/prestataire] Exception:", err);
    return NextResponse.json({ error: "Erreur serveur", details: String(err) }, { status: 500 });
  }
}

// ── Fonction parrainage ────────────────────────────────────────────────────────

async function appliquerParrainage({
  supabaseAdmin,
  filleulId,
  refCode,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any;
  filleulId: string;
  refCode: string;
}) {
  // 1. Trouver le parrain via son code
  const { data: parrain, error: parrainErr } = await supabaseAdmin
    .from("prestataires")
    .select("id")
    .eq("code_parrainage", refCode)
    .maybeSingle();

  if (parrainErr || !parrain) {
    console.log(`[parrainage] Code introuvable ou invalide: ${refCode}`);
    return;
  }

  // 2. Éviter l'auto-parrainage
  if (parrain.id === filleulId) {
    console.log("[parrainage] Auto-parrainage ignoré");
    return;
  }

  // 3. Vérifier que le filleul n'a pas déjà un parrain (contrainte UNIQUE)
  const { data: existingParrainage } = await supabaseAdmin
    .from("parrainages")
    .select("id")
    .eq("filleul_id", filleulId)
    .maybeSingle();

  if (existingParrainage) {
    console.log("[parrainage] Filleul a déjà un parrain");
    return;
  }

  // 4. Chercher l'abonnement actif du parrain pour le crédit Stripe
  const { data: abo } = await supabaseAdmin
    .from("abonnements")
    .select("stripe_customer_id, plan, prix")
    .eq("prestataire_id", parrain.id)
    .eq("statut", "actif")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let stripeCreditId: string | null = null;

  // 5. Appliquer le crédit Stripe si le parrain a un abonnement payant
  if (abo?.stripe_customer_id && abo.prix > 0) {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" });
        const creditCents = Math.round(abo.prix * 100); // euros → centimes
        const txn = await stripe.customers.createBalanceTransaction(
          abo.stripe_customer_id,
          {
            amount: -creditCents, // négatif = crédit sur prochaine facture
            currency: "eur",
            description: `Parrainage – 1 mois offert (filleul inscrit via code ${abo.plan})`,
          }
        );
        stripeCreditId = txn.id;
        console.log(`[parrainage] Crédit Stripe appliqué: ${txn.id} (${creditCents} cts) → customer ${abo.stripe_customer_id}`);
      }
    } catch (stripeErr) {
      console.error("[parrainage] Erreur Stripe (crédit ignoré):", stripeErr);
    }
  }

  // 6. Enregistrer le parrainage en base
  const { error: insertErr } = await supabaseAdmin
    .from("parrainages")
    .insert({
      parrain_id: parrain.id,
      filleul_id: filleulId,
      mois_offerts: 1,
      stripe_credit_id: stripeCreditId,
    });

  if (insertErr) {
    // Conflit UNIQUE = filleul déjà parrainé, on ignore silencieusement
    if (insertErr.code !== "23505") {
      console.error("[parrainage] Erreur INSERT parrainages:", insertErr);
    }
  } else {
    console.log(`[parrainage] Parrainage créé : parrain=${parrain.id} filleul=${filleulId}`);
  }
}
