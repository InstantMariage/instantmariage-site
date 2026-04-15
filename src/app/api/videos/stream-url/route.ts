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
    // Utilise directPlayUrl si disponible, sinon construit l'URL MP4 depuis le CDN
    const url: string =
      meta.directPlayUrl ||
      `https://${cdnHostname}/${videoId}/play_720p.mp4`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[STREAM-URL] Error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
