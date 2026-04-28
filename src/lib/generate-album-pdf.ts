import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function generateAlbumPdf(
  photoUrls: string[],
  marieId: string
): Promise<string> {
  const pdfDoc = await PDFDocument.create();

  // A4 en points (72 dpi) : 595.28 × 841.89
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;

  for (const url of photoUrls) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "";

    let image;
    try {
      if (contentType.includes("png")) {
        image = await pdfDoc.embedPng(bytes);
      } else {
        image = await pdfDoc.embedJpg(bytes);
      }
    } catch {
      // image non supportée, on passe
      continue;
    }

    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    // Calcul pour remplir la page en conservant les proportions
    const { width: iw, height: ih } = image;
    const scale = Math.max(PAGE_W / iw, PAGE_H / ih);
    const drawW = iw * scale;
    const drawH = ih * scale;
    const x = (PAGE_W - drawW) / 2;
    const y = (PAGE_H - drawH) / 2;

    page.drawImage(image, { x, y, width: drawW, height: drawH });
  }

  const pdfBytes = await pdfDoc.save();

  // Upload dans Supabase Storage bucket "album-mariage"
  const supabase = getSupabaseAdmin();
  const filename = `pdfs/${marieId}-${Date.now()}.pdf`;

  const { error: uploadErr } = await supabase.storage
    .from("album-mariage")
    .upload(filename, Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadErr) {
    throw new Error(`Upload PDF échoué : ${uploadErr.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("album-mariage")
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
