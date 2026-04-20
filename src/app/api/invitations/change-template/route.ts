import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { invitationId, templateSlug } = await req.json();
    if (!invitationId || !templateSlug) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Vérifier que l'invitation appartient bien à ce marié
    const { data: invitation, error: invErr } = await supabaseAdmin
      .from("invitations")
      .select("id, marie_id, maries!inner(user_id)")
      .eq("id", invitationId)
      .single();

    if (invErr || !invitation) {
      return NextResponse.json({ error: "Faire-part introuvable" }, { status: 404 });
    }

    const marie = invitation.maries as unknown as { user_id: string };
    if (marie.user_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Chercher le template par slug
    const { data: template, error: tplErr } = await supabaseAdmin
      .from("invitation_templates")
      .select("id")
      .eq("slug", templateSlug)
      .maybeSingle();

    if (tplErr) {
      return NextResponse.json({ error: "Erreur lecture template", detail: tplErr.message }, { status: 500 });
    }
    if (!template) {
      return NextResponse.json({ error: `Template introuvable: ${templateSlug}` }, { status: 404 });
    }

    // Mettre à jour l'invitation
    const { error: updateErr } = await supabaseAdmin
      .from("invitations")
      .update({ template_id: template.id })
      .eq("id", invitationId);

    if (updateErr) {
      return NextResponse.json({ error: "Erreur mise à jour", detail: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, template_id: template.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
