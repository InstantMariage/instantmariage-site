import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300; // 5 minutes max pour les gros fichiers

// Désactiver le bodyParser natif de Next.js n'est pas nécessaire en App Router
// mais on s'assure que la limite n'est pas un problème via maxDuration + streaming FormData

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
  console.log("[UPLOAD] ════════════════════════════════════════");
  console.log("[UPLOAD] Début requête upload vidéo");
  console.log("[UPLOAD] Content-Type header:", req.headers.get("content-type"));

  try {
    // ── Vérification variables d'environnement Bunny ──────────────────────
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;
    const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;

    console.log("[UPLOAD] ENV BUNNY_STREAM_LIBRARY_ID :", libraryId ? `présente (${libraryId})` : "MANQUANTE ❌");
    console.log("[UPLOAD] ENV BUNNY_STREAM_API_KEY    :", apiKey ? "présente ✓" : "MANQUANTE ❌");
    console.log("[UPLOAD] ENV BUNNY_STREAM_CDN_HOSTNAME:", cdnHostname ? `présente (${cdnHostname})` : "MANQUANTE ❌");

    if (!libraryId || !apiKey || !cdnHostname) {
      const missing = [
        !libraryId && "BUNNY_STREAM_LIBRARY_ID",
        !apiKey && "BUNNY_STREAM_API_KEY",
        !cdnHostname && "BUNNY_STREAM_CDN_HOSTNAME",
      ].filter(Boolean).join(", ");
      console.error("[UPLOAD] ❌ Variables manquantes :", missing);
      return NextResponse.json(
        { error: "Configuration Bunny Stream manquante", detail: `Variables absentes : ${missing}` },
        { status: 500 }
      );
    }

    // ── Auth ───────────────────────────────────────────────────────────────
    console.log("[UPLOAD] Étape 1 : vérification auth...");
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    console.log("[UPLOAD] Token présent :", token ? "oui ✓" : "non ❌");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé", detail: "Header Authorization manquant" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    console.log("[UPLOAD] Utilisateur Supabase :", user?.id ?? "introuvable");
    if (authErr) console.error("[UPLOAD] Auth error:", authErr.message);

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Non autorisé", detail: authErr?.message ?? "Token invalide" },
        { status: 401 }
      );
    }

    // ── Récupérer le prestataire ───────────────────────────────────────────
    console.log("[UPLOAD] Étape 2 : récupération prestataire pour user_id", user.id);
    const { data: prestataire, error: prestErr } = await supabaseAdmin
      .from("prestataires")
      .select("id")
      .eq("user_id", user.id)
      .single();

    console.log("[UPLOAD] Prestataire ID :", prestataire?.id ?? "introuvable");
    if (prestErr) console.error("[UPLOAD] Prestataire error:", prestErr.message);

    if (!prestataire) {
      return NextResponse.json(
        { error: "Prestataire introuvable", detail: prestErr?.message },
        { status: 404 }
      );
    }

    // ── Vérifier le plan ───────────────────────────────────────────────────
    console.log("[UPLOAD] Étape 3 : vérification plan/quota...");
    const { data: abo, error: aboErr } = await supabaseAdmin
      .from("abonnements")
      .select("plan")
      .eq("prestataire_id", prestataire.id)
      .eq("statut", "actif")
      .maybeSingle();

    const plan = abo?.plan ?? "gratuit";
    const limit = VIDEO_LIMITS[plan] ?? 0;
    console.log("[UPLOAD] Plan :", plan, "| Limite :", limit === Infinity ? "illimitée" : limit);
    if (aboErr) console.warn("[UPLOAD] Abonnement error (non bloquant):", aboErr.message);

    if (limit === 0) {
      return NextResponse.json(
        { error: "Votre plan ne permet pas l'upload de vidéos. Passez au plan Starter ou supérieur." },
        { status: 403 }
      );
    }

    // ── Vérifier le quota ─────────────────────────────────────────────────
    if (limit !== Infinity) {
      const { count, error: countErr } = await supabaseAdmin
        .from("prestataire_videos")
        .select("*", { count: "exact", head: true })
        .eq("prestataire_id", prestataire.id);

      console.log("[UPLOAD] Vidéos existantes :", count, "/ Limite :", limit);
      if (countErr) console.error("[UPLOAD] Count error:", countErr.message);

      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: `Limite de ${limit} vidéo${limit > 1 ? "s" : ""} atteinte pour votre plan ${plan.toUpperCase()}.` },
          { status: 403 }
        );
      }
    }

    // ── Lire le fichier ────────────────────────────────────────────────────
    console.log("[UPLOAD] Étape 4 : lecture formData...");
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (formErr) {
      console.error("[UPLOAD] ❌ Erreur lecture formData:", formErr);
      return NextResponse.json(
        { error: "Impossible de lire le formData", detail: String(formErr) },
        { status: 400 }
      );
    }

    const file = formData.get("video") as File | null;
    console.log("[UPLOAD] Fichier reçu :", file ? `${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)} Mo)` : "aucun ❌");

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier reçu", detail: "Le champ 'video' est absent du formData" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Format invalide. Utilisez MP4 ou MOV.", detail: `Type reçu : ${file.type}` },
        { status: 400 }
      );
    }

    const MAX_SIZE = 500 * 1024 * 1024; // 500 Mo
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Maximum 500 Mo.", detail: `Taille reçue : ${(file.size / 1024 / 1024).toFixed(2)} Mo` },
        { status: 400 }
      );
    }

    // ── Étape 1 : créer l'entrée vidéo sur Bunny ──────────────────────────
    const title = file.name.replace(/\.[^.]+$/, "") || `Vidéo ${Date.now()}`;
    console.log("[UPLOAD] Étape 5 : création vidéo Bunny Stream...");
    console.log("[UPLOAD] URL Bunny create :", `https://video.bunnycdn.com/library/${libraryId}/videos`);
    console.log("[UPLOAD] Title :", title);

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

    console.log("[UPLOAD] Bunny create status :", createRes.status, createRes.statusText);

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error("[UPLOAD] ❌ Bunny create error body:", errBody);
      return NextResponse.json(
        {
          error: "Erreur lors de la création de la vidéo sur Bunny Stream",
          detail: errBody,
          bunny_status: createRes.status,
        },
        { status: 502 }
      );
    }

    const createBody = await createRes.json();
    console.log("[UPLOAD] Bunny create response:", JSON.stringify(createBody));
    const videoId: string = createBody.guid;
    console.log("[UPLOAD] videoId créé :", videoId);

    // ── Étape 2 : uploader les bytes ──────────────────────────────────────
    console.log("[UPLOAD] Étape 6 : upload bytes vers Bunny...");
    const arrayBuffer = await file.arrayBuffer();
    console.log("[UPLOAD] arrayBuffer size :", arrayBuffer.byteLength, "bytes");

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

    console.log("[UPLOAD] Bunny upload status :", uploadRes.status, uploadRes.statusText);

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      console.error("[UPLOAD] ❌ Bunny upload error body:", errBody);
      // Nettoyage : supprimer l'entrée créée
      console.log("[UPLOAD] Nettoyage : suppression videoId", videoId);
      await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        { method: "DELETE", headers: { AccessKey: apiKey } }
      );
      return NextResponse.json(
        {
          error: "Erreur lors de l'upload de la vidéo",
          detail: errBody,
          bunny_status: uploadRes.status,
        },
        { status: 502 }
      );
    }

    console.log("[UPLOAD] ✓ Upload Bunny réussi");

    // ── Construire les URLs ────────────────────────────────────────────────
    const thumbnailUrl = `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
    const playUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
    console.log("[UPLOAD] thumbnailUrl :", thumbnailUrl);
    console.log("[UPLOAD] playUrl :", playUrl);

    // ── Sauvegarder en base ────────────────────────────────────────────────
    console.log("[UPLOAD] Étape 7 : insert Supabase...");
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
      console.error("[UPLOAD] ❌ DB insert error:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde en base de données", detail: dbError.message, db_code: dbError.code },
        { status: 500 }
      );
    }

    console.log("[UPLOAD] ✓ Insert Supabase OK, id :", videoRecord.id);
    console.log("[UPLOAD] ════════════════════════════════════════ FIN OK");

    return NextResponse.json({
      id: videoRecord.id,
      bunny_video_id: videoId,
      title: videoRecord.title,
      thumbnail_url: thumbnailUrl,
      play_url: playUrl,
      created_at: videoRecord.created_at,
    });
  } catch (err) {
    console.error("[UPLOAD] ❌ Exception non gérée:", err);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        detail: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5).join(" | ") : undefined,
      },
      { status: 500 }
    );
  }
}
