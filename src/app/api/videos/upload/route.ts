import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300; // 5 minutes max pour les gros fichiers

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key, { auth: { persistSession: false } });
}

const VIDEO_LIMITS: Record<string, number> = {
  gratuit: 0,
  starter: 3,
  pro: Infinity,
  premium: Infinity,
};

export async function POST(req: NextRequest) {
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

    // ── Récupérer le prestataire ───────────────────────────────────────────
    const { data: prestataire } = await supabaseAdmin
      .from("prestataires")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!prestataire) {
      return NextResponse.json({ error: "Prestataire introuvable" }, { status: 404 });
    }

    // ── Vérifier le plan ───────────────────────────────────────────────────
    const { data: abo } = await supabaseAdmin
      .from("abonnements")
      .select("plan")
      .eq("prestataire_id", prestataire.id)
      .eq("statut", "actif")
      .maybeSingle();

    const plan = abo?.plan ?? "gratuit";
    const limit = VIDEO_LIMITS[plan] ?? 0;

    if (limit === 0) {
      return NextResponse.json(
        { error: "Votre plan ne permet pas l'upload de vidéos. Passez au plan Starter ou supérieur." },
        { status: 403 }
      );
    }

    // ── Vérifier le quota ─────────────────────────────────────────────────
    if (limit !== Infinity) {
      const { count } = await supabaseAdmin
        .from("prestataire_videos")
        .select("*", { count: "exact", head: true })
        .eq("prestataire_id", prestataire.id);

      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: `Limite de ${limit} vidéo${limit > 1 ? "s" : ""} atteinte pour votre plan ${plan.toUpperCase()}.` },
          { status: 403 }
        );
      }
    }

    // ── Lire le fichier ────────────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Format invalide. Utilisez MP4 ou MOV." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 500 * 1024 * 1024; // 500 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Maximum 500 Mo." },
        { status: 400 }
      );
    }

    // ── Env Bunny Stream ──────────────────────────────────────────────────
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;
    const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;

    if (!libraryId || !apiKey || !cdnHostname) {
      return NextResponse.json(
        { error: "Configuration Bunny Stream manquante" },
        { status: 500 }
      );
    }

    // ── Étape 1 : créer l'entrée vidéo sur Bunny ──────────────────────────
    const title = file.name.replace(/\.[^.]+$/, "") || `Vidéo ${Date.now()}`;

    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!createRes.ok) {
      console.error("Bunny create error:", await createRes.text());
      return NextResponse.json(
        { error: "Erreur lors de la création de la vidéo sur Bunny Stream" },
        { status: 502 }
      );
    }

    const { guid: videoId } = await createRes.json();

    // ── Étape 2 : uploader les bytes ──────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();

    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: arrayBuffer,
      }
    );

    if (!uploadRes.ok) {
      console.error("Bunny upload error:", await uploadRes.text());
      // Nettoyage : supprimer l'entrée créée
      await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        { method: "DELETE", headers: { AccessKey: apiKey } }
      );
      return NextResponse.json(
        { error: "Erreur lors de l'upload de la vidéo" },
        { status: 502 }
      );
    }

    // ── Construire les URLs ────────────────────────────────────────────────
    const thumbnailUrl = `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
    const playUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;

    // ── Sauvegarder en base ────────────────────────────────────────────────
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from("prestataire_videos")
      .insert({
        prestataire_id: prestataire.id,
        bunny_video_id: videoId,
        title,
        thumbnail_url: thumbnailUrl,
        play_url: playUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde en base de données" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: videoRecord.id,
      bunny_video_id: videoId,
      title: videoRecord.title,
      thumbnail_url: thumbnailUrl,
      play_url: playUrl,
      created_at: videoRecord.created_at,
    });
  } catch (err) {
    console.error("Video upload error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
