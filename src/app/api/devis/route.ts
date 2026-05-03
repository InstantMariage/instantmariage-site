import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDemandeDevisEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  let body: { prestataire_id?: string; message?: string; date_mariage?: string | null; budget_max?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { prestataire_id, message, date_mariage, budget_max } = body;

  if (!prestataire_id || !message?.trim()) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const { data: marie, error: marieError } = await supabaseAdmin
    .from("maries")
    .select("id, prenom_marie1, prenom_marie2")
    .eq("user_id", user.id)
    .maybeSingle();

  if (marieError || !marie) {
    return NextResponse.json({ error: "Profil marié introuvable" }, { status: 404 });
  }

  const { data: existing } = await supabaseAdmin
    .from("demandes_devis")
    .select("id")
    .eq("marie_id", marie.id)
    .eq("prestataire_id", prestataire_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Demande déjà envoyée" }, { status: 409 });
  }

  const { error: insertError } = await supabaseAdmin.from("demandes_devis").insert({
    marie_id: marie.id,
    prestataire_id,
    message: message.trim(),
    date_mariage: date_mariage || null,
    budget_max: budget_max || null,
  });

  if (insertError) {
    console.error("[api/devis] Erreur insert:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Email au prestataire — non bloquant
  (async () => {
    try {
      const { data: prest } = await supabaseAdmin
        .from("prestataires")
        .select("nom_entreprise, user_id")
        .eq("id", prestataire_id)
        .maybeSingle();
      if (!prest?.user_id) return;
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(prest.user_id);
      if (authUser?.user?.email) {
        await sendDemandeDevisEmail({
          recipientEmail: authUser.user.email,
          nomPrestataire: prest.nom_entreprise,
          prenomMarie1: marie.prenom_marie1,
          prenomMarie2: marie.prenom_marie2 || null,
          message: message.trim(),
          dateMariage: date_mariage || null,
          budgetMax: budget_max || null,
        });
      }
    } catch (err) {
      console.error("[api/devis] Erreur envoi email:", err);
    }
  })();

  return NextResponse.json({ ok: true });
}
