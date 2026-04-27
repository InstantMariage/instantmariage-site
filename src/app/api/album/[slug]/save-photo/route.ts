export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const { data: marie, error: marieErr } = await supabase
    .from("maries")
    .select("id")
    .eq("album_slug", slug)
    .eq("album_actif", true)
    .single();

  if (marieErr || !marie) {
    return NextResponse.json({ error: "Album introuvable ou inactif" }, { status: 404 });
  }

  let body: {
    url: string;
    type: string;
    nom_fichier: string;
    taille_fichier: number;
    uploade_par?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { url, type, nom_fichier, taille_fichier, uploade_par } = body;

  if (!url || !type || !nom_fichier) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const { error: dbErr } = await supabase.from("album_photos").insert({
    marie_id: marie.id,
    url,
    type,
    nom_fichier,
    taille_fichier,
    uploade_par: uploade_par || null,
  });

  if (dbErr) {
    return NextResponse.json({ error: "Erreur enregistrement" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
