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
    const { templateId, marieId } = await req.json();

    if (!templateId || !VALID_TEMPLATES.has(templateId)) {
      return NextResponse.json({ error: "Template invalide" }, { status: 400 });
    }
    if (!marieId) {
      return NextResponse.json({ error: "marieId manquant" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const metadata = {
      product_type: "qrcode_template",
      marie_id: String(marieId),
      template_id: templateId,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 990,
            product_data: {
              name: "Carte QR Code — Template premium",
              description: "Accès illimité 12 mois · Tous les designs inclus",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/marie/album-photo/templates?success=true`,
      cancel_url: `${origin}/dashboard/marie/album-photo/templates`,
      locale: "fr",
      metadata,
      payment_intent_data: { metadata },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[qrcode-checkout] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
