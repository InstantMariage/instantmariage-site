import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get("subscriptionId");

    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId manquant" }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cancel_at_period_end: (subscription as any).cancel_at_period_end ?? false,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Stripe subscription status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du statut" },
      { status: 500 }
    );
  }
}
