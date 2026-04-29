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
  diamond: 9900,
};

async function requireAdmin(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return "Non autorisé";
  const supabase = adminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) return "Non autorisé";
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") return "Accès refusé";
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { plan } = await req.json();
  const validPlans = ["starter", "pro", "premium", "diamond"];
  if (!plan || !validPlans.includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const supabase = adminClient();

  // Récupérer l'abonnement actif Stripe s'il existe
  const { data: aboActif } = await supabase
    .from("abonnements")
    .select("id, stripe_customer_id, stripe_subscription_id, plan, prix")
    .eq("prestataire_id", params.id)
    .eq("statut", "actif")
    .not("stripe_subscription_id", "is", null)
    .maybeSingle();

  if (aboActif?.stripe_customer_id) {
    // Cas 1 : abonnement Stripe actif → crédit sur le compte Stripe
    const amount = PLAN_AMOUNTS[aboActif.plan] ?? Math.round((aboActif.prix ?? 0) * 100);
    if (amount <= 0) {
      return NextResponse.json({ error: "Montant invalide pour ce plan" }, { status: 400 });
    }
    await stripe.customers.createBalanceTransaction(aboActif.stripe_customer_id, {
      amount: -amount,
      currency: "eur",
      description: `1 mois offert par admin InstantMariage (plan ${aboActif.plan})`,
    });
    return NextResponse.json({ ok: true, mode: "stripe_credit" });
  }

  // Cas 2 : pas d'abonnement Stripe → insertion directe dans Supabase
  // Désactiver les éventuels abonnements actifs existants
  await supabase
    .from("abonnements")
    .update({ statut: "expire" })
    .eq("prestataire_id", params.id)
    .eq("statut", "actif");

  const dateFin = new Date();
  dateFin.setDate(dateFin.getDate() + 30);

  const { error: insertErr } = await supabase.from("abonnements").insert({
    prestataire_id: params.id,
    plan,
    statut: "actif",
    date_debut: new Date().toISOString(),
    date_fin: dateFin.toISOString(),
    prix: 0,
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mode: "direct" });
}
