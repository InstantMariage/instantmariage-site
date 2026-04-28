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
  { params }: { params: { id: string } }
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

    const { data: marie } = await supabaseAdmin
      .from("maries")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!marie) {
      return NextResponse.json({ error: "Profil marié introuvable" }, { status: 403 });
    }

    const { data: photo, error: photoErr } = await supabaseAdmin
      .from("album_photos")
      .select("id, url, nom_fichier")
      .eq("id", params.id)
      .eq("marie_id", marie.id)
      .single();

    if (photoErr || !photo) {
      return NextResponse.json({ error: "Photo introuvable ou accès refusé" }, { status: 404 });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from("album_photos")
      .delete()
      .eq("id", params.id)
      .eq("marie_id", marie.id);

    if (deleteErr) {
      return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
    }

    // Extract storage path from URL
    const url = new URL(photo.url);
    const pathParts = url.pathname.split("/album-mariage/");
    if (pathParts.length > 1) {
      const storagePath = pathParts[1];
      await supabaseAdmin.storage.from("album-mariage").remove([storagePath]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[album/photo/delete]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
