import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  console.log('[COMPLETE] ENV CHECK:', {
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
    apiKeyPresent: !!process.env.BUNNY_STREAM_API_KEY,
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME,
  });
  try {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;

    if (!libraryId || !cdnHostname) {
      return NextResponse.json({ error: "Configuration Bunny Stream manquante" }, { status: 500 });
    }

    // ── Auth ──────────────────────────────────────────────────────────────
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

    // ── Prestataire ───────────────────────────────────────────────────────
    const { data: prestataire } = await supabaseAdmin
      .from("prestataires")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!prestataire) {
      return NextResponse.json({ error: "Prestataire introuvable" }, { status: 404 });
    }

    // ── Sauvegarder en base ───────────────────────────────────────────────
    const { bunnyVideoId, title } = await req.json() as { bunnyVideoId: string; title: string };

    if (!bunnyVideoId) {
      return NextResponse.json({ error: "bunnyVideoId manquant" }, { status: 400 });
    }

    const thumbnailUrl = `https://${cdnHostname}/${bunnyVideoId}/thumbnail.jpg`;
    const playUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}`;

    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from("prestataire_videos")
      .insert({
        prestataire_id: prestataire.id,
        bunny_video_id: bunnyVideoId,
        title,
        thumbnail_url: thumbnailUrl,
        play_url: playUrl,
        url: playUrl,
        platform: "bunny",
      })
      .select()
      .single();

    if (dbError) {
      console.error("[COMPLETE] DB insert error:", {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        prestataire_id: prestataire.id,
        bunnyVideoId,
      });
      console.log('[COMPLETE] FULL supabase_error:', JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        {
          error: "Erreur lors de la sauvegarde en base de données",
          supabase_error: {
            code: dbError.code,
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: videoRecord.id,
      bunny_video_id: bunnyVideoId,
      title: videoRecord.title,
      thumbnail_url: thumbnailUrl,
      play_url: playUrl,
      created_at: videoRecord.created_at,
    });
  } catch (err) {
    console.error("[COMPLETE] Error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
