import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  console.log('[SIGNED-URL] ENV CHECK:', {
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
    apiKeyPresent: !!process.env.BUNNY_STREAM_API_KEY,
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME,
  });
  try {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
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

    // ── Plan ──────────────────────────────────────────────────────────────
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

    // ── Quota ─────────────────────────────────────────────────────────────
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

    // ── Créer l'entrée vidéo sur Bunny ────────────────────────────────────
    const { filename } = await req.json() as { filename?: string };
    const title = filename?.replace(/\.[^.]+$/, "") || `Vidéo ${Date.now()}`;

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
      const errBody = await createRes.text();
      console.error("[SIGNED-URL] Bunny create error:", errBody);
      return NextResponse.json(
        { error: "Erreur lors de la création de la vidéo sur Bunny Stream", detail: errBody },
        { status: 502 }
      );
    }

    const { guid: videoId } = await createRes.json();

    return NextResponse.json({
      videoId,
      uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      accessKey: apiKey,
      title,
    });
  } catch (err) {
    console.error("[SIGNED-URL] Error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
