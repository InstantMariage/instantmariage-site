export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const PACK_PRICE_IDS: Record<string, string | undefined> = {
  digital:    process.env.STRIPE_PRICE_INVITE_DIGITAL,
  print_50:   process.env.STRIPE_PRICE_INVITE_PRINT_50,
  print_100:  process.env.STRIPE_PRICE_INVITE_PRINT_100,
  print_150:  process.env.STRIPE_PRICE_INVITE_PRINT_150,
  print_200:  process.env.STRIPE_PRICE_INVITE_PRINT_200,
  print_250:  process.env.STRIPE_PRICE_INVITE_PRINT_250,
  print_300:  process.env.STRIPE_PRICE_INVITE_PRINT_300,
};

export async function POST(req: NextRequest) {
  try {
    const { pack, isPremium, invitationId } = await req.json();

    const priceId = PACK_PRICE_IDS[pack];
    if (!priceId) {
      return NextResponse.json({ error: "Pack invalide ou non configuré" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const isPrint = pack !== "digital";

    const lineItems = [{ price: priceId, quantity: 1 }];

    if (isPremium) {
      const premiumPriceId = process.env.STRIPE_PRICE_INVITE_PREMIUM;
      if (!premiumPriceId) {
        return NextResponse.json({ error: "Option Premium non configurée" }, { status: 400 });
      }
      lineItems.push({ price: premiumPriceId, quantity: 1 });
    }

    const metadata: Record<string, string> = {
      pack,
      is_premium: isPremium ? "true" : "false",
    };
    if (invitationId) metadata.invitation_id = String(invitationId);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/faire-part/commander/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/faire-part/commander`,
      locale: "fr",
      metadata,
      payment_intent_data: { metadata },
      ...(isPrint && {
        shipping_address_collection: {
          allowed_countries: ["FR", "BE", "CH", "LU", "MC"],
        },
      }),
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[invitations/checkout]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
