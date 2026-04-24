import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDemandeVirementEmail } from "@/lib/emails";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { invitation_id } = await req.json();
    if (!invitation_id) return NextResponse.json({ error: "invitation_id manquant" }, { status: 400 });

    // Vérifier ownership + récupérer les infos en une seule requête
    const { data: inv, error: invErr } = await supabaseAdmin
      .from("invitations")
      .select(`
        id, cagnotte_titre, cagnotte_iban, virement_statut,
        maries!inner(user_id, prenom_marie1, prenom_marie2),
        cagnotte_contributions(montant_cents, statut)
      `)
      .eq("id", invitation_id)
      .single();

    if (invErr || !inv) return NextResponse.json({ error: "Cagnotte introuvable" }, { status: 404 });

    const marie = inv.maries as unknown as { user_id: string; prenom_marie1: string; prenom_marie2: string | null };
    if (marie.user_id !== user.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    if (inv.virement_statut !== "non_demande") {
      return NextResponse.json({ error: "Demande déjà soumise" }, { status: 409 });
    }

    // Calculer le total des contributions payées
    const contribs = inv.cagnotte_contributions as unknown as { montant_cents: number; statut: string }[];
    const totalCents = contribs
      .filter((c) => c.statut === "paye")
      .reduce((sum, c) => sum + c.montant_cents, 0);

    // Mettre à jour le statut
    const { error: updateErr } = await supabaseAdmin
      .from("invitations")
      .update({ virement_statut: "demande" })
      .eq("id", invitation_id);

    if (updateErr) return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });

    // Envoyer l'email admin
    const coupleNom = marie.prenom_marie2
      ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
      : marie.prenom_marie1;

    await sendDemandeVirementEmail({
      cagnotteTitre: inv.cagnotte_titre ?? "Cagnotte mariage",
      coupleNom,
      totalCents,
      iban: inv.cagnotte_iban ?? null,
      invitationId: invitation_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
