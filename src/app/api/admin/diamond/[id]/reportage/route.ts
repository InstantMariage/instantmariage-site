import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { statut, date_reportage, lien_video, lien_article, notes } = await req.json();

  const supabase = adminClient();

  const { data: existing } = await supabase
    .from("diamond_reportages")
    .select("id")
    .eq("prestataire_id", params.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("diamond_reportages")
      .update({ statut, date_reportage: date_reportage || null, lien_video: lien_video || null, lien_article: lien_article || null, notes: notes || null })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("diamond_reportages")
      .insert({ prestataire_id: params.id, statut, date_reportage: date_reportage || null, lien_video: lien_video || null, lien_article: lien_article || null, notes: notes || null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
