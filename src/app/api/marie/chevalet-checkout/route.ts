export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { marieId, adresseLivraison } = await req.json();

    if (!marieId) {
      return NextResponse.json({ error: "marieId manquant" }, { status: 400 });
    }
    if (!adresseLivraison) {
      return NextResponse.json({ error: "Adresse manquante" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const adresseJson =
      typeof adresseLivraison === "string"
        ? adresseLivraison
        : JSON.stringify(adresseLivraison);

    const metadata: Record<string, string> = {
      product_type: "chevalet_physique",
      marie_id: String(marieId),
      adresse_livraison: adresseJson.slice(0, 500),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 1990,
            product_data: {
              name: "Chevalet QR Code mariage — Élégant et compact",
              description:
                "Chevalet cartonné premium avec carte QR Code · Livraison 5–7 jours ouvrés",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/boutique/chevalet?success=true`,
      cancel_url: `${origin}/boutique/chevalet`,
      locale: "fr",
      metadata,
      payment_intent_data: { metadata },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[chevalet-checkout] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
