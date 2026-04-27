export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") return null;
  return supabase;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await requireAdmin(req);
    if (!supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { data, error } = await supabase
      .from("config_boutique")
      .select("produit, prix")
      .order("produit");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/boutique/prix GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await requireAdmin(req);
    if (!supabase) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { produit, nouveauPrix } = await req.json();
    if (!produit || nouveauPrix === undefined) {
      return NextResponse.json({ error: "produit et nouveauPrix requis" }, { status: 400 });
    }

    const prix = parseFloat(String(nouveauPrix));
    if (isNaN(prix) || prix <= 0) {
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
    }

    const { error } = await supabase
      .from("config_boutique")
      .upsert({ produit, prix }, { onConflict: "produit" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, produit, prix });
  } catch (err) {
    console.error("[admin/boutique/prix PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
