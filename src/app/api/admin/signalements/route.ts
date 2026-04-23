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

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { data, error } = await adminClient()
    .from("signalements")
    .select(`
      id, motif, description, created_at,
      prestataires!prestataire_id(id, nom_entreprise),
      users!user_id(email)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { id } = await req.json();
  const { error } = await adminClient().from("signalements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH: suspendre ou réactiver un prestataire
export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { prestataire_id, suspendu } = await req.json();
  const { error } = await adminClient()
    .from("prestataires")
    .update({ suspendu })
    .eq("id", prestataire_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
