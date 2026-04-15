import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function DELETE(req: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
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

    // ── Récupérer l'ID de la vidéo ─────────────────────────────────────────
    const { videoId } = await req.json() as { videoId: string };
    if (!videoId) {
      return NextResponse.json({ error: "videoId manquant" }, { status: 400 });
    }

    // ── Vérifier que la vidéo appartient au prestataire connecté ──────────
    const { data: prestataire } = await supabaseAdmin
      .from("prestataires")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!prestataire) {
      return NextResponse.json({ error: "Prestataire introuvable" }, { status: 404 });
    }

    const { data: video } = await supabaseAdmin
      .from("prestataire_videos")
      .select("id, bunny_video_id")
      .eq("id", videoId)
      .eq("prestataire_id", prestataire.id)
      .single();

    if (!video) {
      return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
    }

    // ── Supprimer sur Bunny Stream ─────────────────────────────────────────
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      return NextResponse.json(
        { error: "Configuration Bunny Stream manquante" },
        { status: 500 }
      );
    }

    const bunnyRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${video.bunny_video_id}`,
      {
        method: "DELETE",
        headers: { AccessKey: apiKey },
      }
    );

    // On tolère un 404 Bunny (la vidéo n'existe peut-être plus côté CDN)
    if (!bunnyRes.ok && bunnyRes.status !== 404) {
      console.error("Bunny delete error:", bunnyRes.status, await bunnyRes.text());
      return NextResponse.json(
        { error: "Erreur lors de la suppression sur Bunny Stream" },
        { status: 502 }
      );
    }

    // ── Supprimer en base ─────────────────────────────────────────────────
    const { error: dbError } = await supabaseAdmin
      .from("prestataire_videos")
      .delete()
      .eq("id", videoId);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression en base de données" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Video delete error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
