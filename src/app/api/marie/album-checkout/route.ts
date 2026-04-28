export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const FORMATS: Record<string, { pages: number; label: string; cents: number }> = {
  "20": { pages: 20, label: "Album 20 pages", cents: 2990 },
  "30": { pages: 30, label: "Album 30 pages", cents: 3990 },
  "50": { pages: 50, label: "Album 50 pages", cents: 5990 },
};

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { marieId, format, photoIds, adresseLivraison } = await req.json();

    if (!marieId || !format || !Array.isArray(photoIds) || !adresseLivraison) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const fmt = FORMATS[String(format)];
    if (!fmt) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    if (photoIds.length === 0) {
      return NextResponse.json({ error: "Aucune photo sélectionnée" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Récupère les infos du marié
    const { data: marie } = await supabase
      .from("maries")
      .select("prenom_marie1, prenom_marie2")
      .eq("id", marieId)
      .single();

    const coupleNames = marie
      ? marie.prenom_marie2
        ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
        : marie.prenom_marie1
      : "Couple";

    // Insère un brouillon de commande pour stocker les photo IDs (Stripe metadata trop court)
    const { data: commande, error: insertErr } = await supabase
      .from("commandes")
      .insert({
        marie_id: marieId,
        produit: "album_photo",
        montant: fmt.cents / 100,
        statut: "brouillon",
        nom_destinataire: `${adresseLivraison.prenom ?? ""} ${adresseLivraison.nom ?? ""}`.trim() || null,
        adresse: adresseLivraison.adresse ?? "",
        code_postal: adresseLivraison.codePostal ?? "",
        ville: adresseLivraison.ville ?? "",
        telephone: adresseLivraison.telephone ?? "",
        nb_pages: fmt.pages,
        photos_selectionnees: photoIds,
      })
      .select("id")
      .single();

    if (insertErr || !commande) {
      console.error("[album-checkout] Erreur INSERT brouillon:", insertErr);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    const origin = req.headers.get("origin") ?? "https://instantmariage.fr";

    const metadata = {
      product_type: "album_photo",
      marie_id: String(marieId),
      commande_id: String(commande.id),
      format: String(format),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: fmt.cents,
            product_data: {
              name: `Album Photo Mariage — ${coupleNames}`,
              description: `${fmt.label} · Couverture rigide · Livraison incluse · 5–7 jours ouvrés`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/marie/album-photo/commander-album?success=true`,
      cancel_url: `${origin}/dashboard/marie/album-photo/commander-album`,
      locale: "fr",
      metadata,
      payment_intent_data: { metadata },
      shipping_address_collection: undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[album-checkout] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
