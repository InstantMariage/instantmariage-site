import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Client service role : bypass RLS pour l'inscription
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, nom_entreprise, categorie, ville, telephone } = await req.json();

    if (!user_id || !nom_entreprise || !categorie) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("prestataires").insert({
      user_id,
      nom_entreprise,
      categorie,
      ville,
      telephone,
    });

    if (error) {
      console.error("[api/inscription/prestataire] Erreur insert:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/inscription/prestataire] Erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
