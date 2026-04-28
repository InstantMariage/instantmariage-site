export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateAlbumPdf } from "@/lib/generate-album-pdf";

export async function POST(req: NextRequest) {
  try {
    const { photoUrls, marieId } = await req.json();

    if (!Array.isArray(photoUrls) || photoUrls.length === 0) {
      return NextResponse.json({ error: "photoUrls requis" }, { status: 400 });
    }
    if (!marieId) {
      return NextResponse.json({ error: "marieId requis" }, { status: 400 });
    }

    const pdfUrl = await generateAlbumPdf(photoUrls as string[], marieId as string);

    return NextResponse.json({ pdfUrl });
  } catch (err) {
    console.error("[generate-pdf] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur génération PDF", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
