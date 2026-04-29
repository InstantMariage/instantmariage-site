import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Vercel cron: appelé toutes les nuits à minuit
// Expire les abonnements manuels (sans Stripe) dont date_fin est dépassée
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = adminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("abonnements")
    .update({ statut: "expire" })
    .eq("statut", "actif")
    .is("stripe_subscription_id", null)
    .lt("date_fin", now)
    .select("id, prestataire_id, plan, date_fin");

  if (error) {
    console.error("[cron/expire-abonnements]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = data?.length ?? 0;
  console.log(`[cron/expire-abonnements] ${count} abonnement(s) expiré(s)`);
  return NextResponse.json({ ok: true, expired: count, abonnements: data });
}
