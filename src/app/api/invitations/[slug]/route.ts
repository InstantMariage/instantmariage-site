import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Récupérer l'invitation et vérifier la propriété
    const { data: invitation, error: invErr } = await supabaseAdmin
      .from("invitations")
      .select("id, slug, marie_id, maries!inner(user_id)")
      .eq("slug", params.slug)
      .single();

    if (invErr || !invitation) {
      return NextResponse.json({ error: "Faire-part introuvable" }, { status: 404 });
    }

    const marie = invitation.maries as unknown as { user_id: string };
    if (marie.user_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // 1. Récupérer les IDs des rsvp_responses liées à cette invitation
    const { data: rsvpResponses } = await supabaseAdmin
      .from("rsvp_responses")
      .select("id")
      .eq("invitation_id", invitation.id);

    const rsvpIds = (rsvpResponses ?? []).map((r: { id: string }) => r.id);

    // 2. Supprimer les wedding_guests importés depuis ce faire-part
    if (rsvpIds.length > 0) {
      await supabaseAdmin
        .from("wedding_guests")
        .delete()
        .in("rsvp_response_id", rsvpIds);
    }

    // 3. Nettoyer les assets Storage (invitation-assets)
    const { data: assetFiles } = await supabaseAdmin.storage
      .from("invitation-assets")
      .list(`${user.id}/${invitation.id}`);

    if (assetFiles && assetFiles.length > 0) {
      const paths = assetFiles.map((f) => `${user.id}/${invitation.id}/${f.name}`);
      await supabaseAdmin.storage.from("invitation-assets").remove(paths);
    }

    // 4. Nettoyer les previews Storage (invitation-previews)
    const { data: previewFiles } = await supabaseAdmin.storage
      .from("invitation-previews")
      .list(invitation.id);

    if (previewFiles && previewFiles.length > 0) {
      const paths = previewFiles.map((f) => `${invitation.id}/${f.name}`);
      await supabaseAdmin.storage.from("invitation-previews").remove(paths);
    }

    // 5. Supprimer l'invitation (cascade : rsvp_responses, invitation_guests, invitation_orders)
    const { error: deleteErr } = await supabaseAdmin
      .from("invitations")
      .delete()
      .eq("id", invitation.id);

    if (deleteErr) {
      console.error("Erreur suppression invitation:", deleteErr);
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invitation DELETE error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
