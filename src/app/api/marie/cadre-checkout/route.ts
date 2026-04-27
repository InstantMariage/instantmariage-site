export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const VALID_TEMPLATES = new Set([
  "elegance-doree",
  "boheme-rose",
  "moderne-minimaliste",
  "nuit-romantique",
]);

export async function POST(req: NextRequest) {
  try {
    const { templateId, marieId, adresseLivraison } = await req.json();

    if (!templateId || !VALID_TEMPLATES.has(templateId)) {
      return NextResponse.json({ error: "Template invalide" }, { status: 400 });
    }
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
      product_type: "cadre_physique",
      marie_id: String(marieId),
      template_id: templateId,
      adresse_livraison: adresseJson.slice(0, 500),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 3990,
            product_data: {
              name: "Cadre photo mariage — QR Code personnalisé",
              description:
                "Cadre blanc 15×20 cm + carte QR Code imprimée · Livraison 5–7 jours ouvrés",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/marie/album-photo/commander-cadre?success=true&template=${templateId}`,
      cancel_url: `${origin}/dashboard/marie/album-photo/commander-cadre?template=${templateId}`,
      locale: "fr",
      metadata,
      payment_intent_data: { metadata },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[cadre-checkout] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
