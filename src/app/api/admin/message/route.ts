import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SYSTEM_USER_ID } from "@/lib/constants";

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

// GET: recherche d'utilisateurs (prestataires + mariés) par nom
export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ prestataires: [], maries: [] });

  const supabase = adminClient();

  const [{ data: prestataires }, { data: maries }] = await Promise.all([
    supabase
      .from("prestataires")
      .select("id, nom_entreprise, user_id, users!user_id(email)")
      .ilike("nom_entreprise", `%${q}%`)
      .limit(6),
    supabase
      .from("maries")
      .select("id, prenom_marie1, prenom_marie2, user_id, users!user_id(email)")
      .or(`prenom_marie1.ilike.%${q}%,prenom_marie2.ilike.%${q}%`)
      .limit(6),
  ]);

  return NextResponse.json({ prestataires: prestataires ?? [], maries: maries ?? [] });
}

// POST: envoyer un message depuis le compte système vers un utilisateur
export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const { user_id, contenu } = await req.json();
  if (!user_id || !contenu?.trim()) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const supabase = adminClient();

  // Trouver ou créer la conversation avec l'utilisateur système
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant1_id.eq.${SYSTEM_USER_ID},participant2_id.eq.${user_id}),` +
      `and(participant1_id.eq.${user_id},participant2_id.eq.${SYSTEM_USER_ID})`
    )
    .limit(1);

  let convId: string;
  if (existing && existing.length > 0) {
    convId = existing[0].id;
  } else {
    const { data: newConv, error: convErr } = await supabase
      .from("conversations")
      .insert({ participant1_id: SYSTEM_USER_ID, participant2_id: user_id })
      .select("id")
      .single();
    if (convErr || !newConv) {
      return NextResponse.json({ error: "Impossible de créer la conversation" }, { status: 500 });
    }
    convId = newConv.id;
  }

  const now = new Date().toISOString();

  const { error: msgErr } = await supabase.from("messages").insert({
    conversation_id: convId,
    expediteur_id: SYSTEM_USER_ID,
    destinataire_id: user_id,
    contenu: contenu.trim(),
    lu: false,
  });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  await supabase.from("conversations").update({ last_message_at: now }).eq("id", convId);

  return NextResponse.json({ ok: true });
}
