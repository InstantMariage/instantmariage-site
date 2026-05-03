import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const conversationId = params.id;

  // Vérifier que l'utilisateur est bien participant
  const { data: conv, error: convError } = await supabaseAdmin
    .from("conversations")
    .select("id, participant1_id, participant2_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (convError || !conv) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
  }

  if (conv.participant1_id !== user.id && conv.participant2_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (deleteError) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
