import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const ALLOWED_PRICE_IDS = new Set([
  "price_1TJbkIKKBs85XtqBrD4MvZDu", // Starter 9,90€/mois
  "price_1TJblgKKBs85XtqBUD5euLaF", // Pro 19,90€/mois
  "price_1TJbmfKKBs85XtqBN57D6Z5U", // Premium 39,90€/mois
]);

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();

    if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
      return NextResponse.json({ error: "Price ID invalide" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/prestataire?success=true`,
      cancel_url: `${origin}/tarifs`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la session" }, { status: 500 });
  }
}
