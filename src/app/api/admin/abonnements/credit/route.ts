import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 990,
  pro: 1990,
  premium: 3990,
};

async function requireAdmin(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return "Non autorisé";
  const supabase = adminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return "Non autorisé";
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") return "Accès refusé";
  return null;
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { abonnementId } = await req.json();
  if (!abonnementId) return NextResponse.json({ error: "abonnementId manquant" }, { status: 400 });

  const supabase = adminClient();
  const { data: abo, error } = await supabase
    .from("abonnements")
    .select("stripe_customer_id, plan, prix")
    .eq("id", abonnementId)
    .single();

  if (error || !abo) return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
  if (!abo.stripe_customer_id) return NextResponse.json({ error: "Pas de customer Stripe associé" }, { status: 400 });

  const amount = PLAN_AMOUNTS[abo.plan] ?? Math.round((abo.prix ?? 0) * 100);
  if (amount <= 0) return NextResponse.json({ error: "Montant invalide pour ce plan" }, { status: 400 });

  await stripe.customers.createBalanceTransaction(abo.stripe_customer_id, {
    amount: -amount,
    currency: "eur",
    description: "1 mois offert par admin InstantMariage",
  });

  return NextResponse.json({ ok: true });
}
