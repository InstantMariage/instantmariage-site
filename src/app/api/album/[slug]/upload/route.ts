export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "video/mp4", "video/quicktime", "video/webm",
];
const MAX_SIZE = 52_428_800; // 50 Mo

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const supabase = serviceClient();

  // Vérifie que le slug est valide et actif
  const { data: marie, error: marieErr } = await supabase
    .from("maries")
    .select("id, prenom_marie1, prenom_marie2")
    .eq("album_slug", slug)
    .eq("album_actif", true)
    .single();

  if (marieErr || !marie) {
    return NextResponse.json({ error: "Album introuvable ou inactif" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const uploade_par = (formData.get("uploade_par") as string | null)?.trim() || null;
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const results: { url: string; type: string; nom_fichier: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name} : type non autorisé (${file.type})`);
      continue;
    }
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name} : fichier trop volumineux (max 50 Mo)`);
      continue;
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const uid = crypto.randomUUID();
    const storagePath = `${slug}/${uid}.${ext}`;

    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("album-mariage")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      errors.push(`${file.name} : erreur upload`);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("album-mariage")
      .getPublicUrl(storagePath);

    const isVideo = file.type.startsWith("video/");

    const { error: dbErr } = await supabase.from("album_photos").insert({
      marie_id: marie.id,
      url: publicUrl,
      type: isVideo ? "video" : "photo",
      nom_fichier: file.name,
      taille_fichier: file.size,
      uploade_par: uploade_par || null,
    });

    if (dbErr) {
      errors.push(`${file.name} : erreur enregistrement`);
      continue;
    }

    results.push({ url: publicUrl, type: isVideo ? "video" : "photo", nom_fichier: file.name });
  }

  return NextResponse.json({ uploaded: results, errors });
}
