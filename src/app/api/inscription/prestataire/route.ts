import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Vérification explicite des variables d'environnement
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[api/inscription/prestataire] Variables manquantes:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    console.log("[api/inscription/prestataire] Clé utilisée:", {
      keyType: serviceRoleKey.startsWith("eyJ") ? "JWT (service_role)" : "AUTRE (probablement anon!)",
      keyPrefix: serviceRoleKey.slice(0, 20) + "...",
    });

    // Client service role créé à chaque requête pour éviter les problèmes de cache env
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { user_id, nom_entreprise, categorie, ville, telephone } = await req.json();

    console.log("[api/inscription/prestataire] Données reçues:", {
      user_id,
      nom_entreprise,
      categorie,
      ville,
      telephone,
    });

    if (!user_id || !nom_entreprise || !categorie) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("prestataires").insert({
      user_id,
      nom_entreprise,
      categorie,
      ville,
      telephone,
    }).select();

    if (error) {
      console.error("[api/inscription/prestataire] Erreur insert DÉTAILLÉE:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }

    console.log("[api/inscription/prestataire] Insert réussi:", data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/inscription/prestataire] Exception:", err);
    return NextResponse.json({ error: "Erreur serveur", details: String(err) }, { status: 500 });
  }
}
