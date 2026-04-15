import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId manquant" }, { status: 400 });
  }

  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;

  if (!libraryId || !apiKey || !cdnHostname) {
    return NextResponse.json({ error: "Configuration Bunny Stream manquante" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      { headers: { AccessKey: apiKey, Accept: "application/json" } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Vidéo introuvable sur Bunny" }, { status: 404 });
    }

    const meta = await res.json();

    // Log complet pour déboguer les champs URL disponibles
    console.log("[STREAM-URL] Bunny response keys:", Object.keys(meta));
    console.log("[STREAM-URL] directPlayUrl:", meta.directPlayUrl);
    console.log("[STREAM-URL] storageSize:", meta.storageSize);
    console.log("[STREAM-URL] encodeProgress:", meta.encodeProgress);
    console.log("[STREAM-URL] status:", meta.status);
    console.log("[STREAM-URL] availableResolutions:", meta.availableResolutions);

    // Ordre de priorité pour l'URL de lecture
    const url: string =
      meta.directPlayUrl ||
      `https://${cdnHostname}/${videoId}/play_720p.mp4`;

    const fallbacks: string[] = [
      `https://${cdnHostname}/${videoId}/play_480p.mp4`,
      `https://${cdnHostname}/${videoId}/original`,
    ];

    console.log("[STREAM-URL] URL retournée:", url);
    console.log("[STREAM-URL] Fallbacks disponibles:", fallbacks);

    return NextResponse.json({ url, fallbacks });
  } catch (err) {
    console.error("[STREAM-URL] Error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
