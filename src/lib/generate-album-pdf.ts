import { PDFDocument } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 20;
const GAP = 10;
const PHOTO_W = 272.5; // (595 - 20 - 10 - 20) / 2
const PHOTO_H = 380;

export async function generateAlbumPdf(
  photoUrls: string[],
  marieId: string
): Promise<string> {
  const pdfDoc = await PDFDocument.create();

  // Embed all images upfront
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images: any[] = [];
  for (const url of photoUrls) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "";
    try {
      const image = contentType.includes("png")
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);
      images.push(image);
    } catch {
      continue;
    }
  }

  // Full-bleed page: cover-scale image to fill the entire A4 page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function drawFullPage(image: any) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    const { width: iw, height: ih } = image;
    const scale = Math.max(PAGE_W / iw, PAGE_H / ih);
    page.drawImage(image, {
      x: (PAGE_W - iw * scale) / 2,
      y: (PAGE_H - ih * scale) / 2,
      width: iw * scale,
      height: ih * scale,
    });
  }

  // Two-photo page: side-by-side with margins, or single centered if only one image
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function drawTwoPhotoPage(img1: any, img2?: any) {
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    const baseY = (PAGE_H - PHOTO_H) / 2;

    if (!img2) {
      // Single photo, full-width (within outer margins), centered
      const availW = PAGE_W - 2 * MARGIN;
      const { width: iw, height: ih } = img1;
      const scale = Math.min(availW / iw, PHOTO_H / ih);
      const drawW = iw * scale;
      const drawH = ih * scale;
      page.drawImage(img1, {
        x: (PAGE_W - drawW) / 2,
        y: (PAGE_H - drawH) / 2,
        width: drawW,
        height: drawH,
      });
      return;
    }

    // Left photo
    const x1 = MARGIN;
    const { width: iw1, height: ih1 } = img1;
    const scale1 = Math.min(PHOTO_W / iw1, PHOTO_H / ih1);
    page.drawImage(img1, {
      x: x1 + (PHOTO_W - iw1 * scale1) / 2,
      y: baseY + (PHOTO_H - ih1 * scale1) / 2,
      width: iw1 * scale1,
      height: ih1 * scale1,
    });

    // Right photo
    const x2 = MARGIN + PHOTO_W + GAP;
    const { width: iw2, height: ih2 } = img2;
    const scale2 = Math.min(PHOTO_W / iw2, PHOTO_H / ih2);
    page.drawImage(img2, {
      x: x2 + (PHOTO_W - iw2 * scale2) / 2,
      y: baseY + (PHOTO_H - ih2 * scale2) / 2,
      width: iw2 * scale2,
      height: ih2 * scale2,
    });
  }

  if (images.length === 0) {
    pdfDoc.addPage([PAGE_W, PAGE_H]);
  } else if (images.length === 1) {
    drawFullPage(images[0]);
  } else if (images.length === 2) {
    drawFullPage(images[0]);
    drawFullPage(images[1]);
  } else {
    // Page 1 — Cover: full bleed
    drawFullPage(images[0]);

    // Middle pages (2 to N-1): alternate even=full, odd=2-up
    const middle = images.slice(1, images.length - 1);
    let i = 0;
    let pageNum = 2;
    while (i < middle.length) {
      if (pageNum % 2 === 0) {
        // Even page: 1 full-bleed photo
        drawFullPage(middle[i]);
        i++;
      } else {
        // Odd page: 2 photos side by side
        drawTwoPhotoPage(middle[i], middle[i + 1]);
        i += middle[i + 1] !== undefined ? 2 : 1;
      }
      pageNum++;
    }

    // Last page — full bleed
    drawFullPage(images[images.length - 1]);
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
