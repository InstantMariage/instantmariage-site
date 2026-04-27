import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNewDocumentEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const { prestataireId } = await req.json();
  if (!prestataireId) {
    return NextResponse.json({ error: "prestataireId manquant" }, { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [{ data: prest }, { data: doc }] = await Promise.all([
    supabaseAdmin
      .from("prestataires")
      .select("id, nom_entreprise, abonnements!prestataire_id(plan, statut)")
      .eq("id", prestataireId)
      .single(),
    supabaseAdmin
      .from("documents_prestataire")
      .select("type, montant_ttc")
      .eq("prestataire_id", prestataireId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  if (!prest || !doc) {
    return NextResponse.json({ error: "Données introuvables" }, { status: 404 });
  }

  const plan =
    ((prest.abonnements ?? []) as { plan: string; statut: string }[]).find(
      (a) => a.statut === "actif"
    )?.plan ?? "gratuit";

  try {
    await sendNewDocumentEmail({
      prestataireName: prest.nom_entreprise ?? "Prestataire",
      prestataireId: prest.id,
      type: doc.type as "devis" | "facture" | "contrat",
      montantTTC: doc.montant_ttc,
      plan,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-document] Erreur envoi email:", err);
    return NextResponse.json({ error: "Échec envoi email" }, { status: 500 });
  }
}
