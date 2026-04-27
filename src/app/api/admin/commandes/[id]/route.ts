export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCommandeExpedieeEmail } from "@/lib/emails";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();

    // Vérifie que l'appelant est admin
    const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { statut, numero_suivi } = await req.json();
    const commandeId = params.id;

    // Récupère la commande avant update (pour email)
    const { data: commande } = await supabase
      .from("commandes")
      .select("*, maries(prenom_marie1, prenom_marie2, user_id)")
      .eq("id", commandeId)
      .single();

    if (!commande) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const updates: Record<string, string> = {};
    if (statut !== undefined) updates.statut = statut;
    if (numero_suivi !== undefined) updates.numero_suivi = numero_suivi;

    const { error: updateErr } = await supabase
      .from("commandes")
      .update(updates)
      .eq("id", commandeId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Email marié quand statut passe à "expédiée"
    if (statut === "expediee" && commande.maries?.user_id) {
      try {
        const { data: { user: marieUser } } = await supabase.auth.admin.getUserById(
          commande.maries.user_id
        );
        if (marieUser?.email) {
          const coupleNames = commande.maries.prenom_marie2
            ? `${commande.maries.prenom_marie1} & ${commande.maries.prenom_marie2}`
            : commande.maries.prenom_marie1;

          await sendCommandeExpedieeEmail({
            userEmail: marieUser.email,
            coupleNames,
            produit: commande.produit,
            nomDestinataire: commande.nom_destinataire ?? "",
            adresse: commande.adresse ?? "",
            codePostal: commande.code_postal ?? "",
            ville: commande.ville ?? "",
            numeroSuivi: numero_suivi ?? commande.numero_suivi ?? "",
          });
        }
      } catch (emailErr) {
        console.error("[admin/commandes] Erreur email expédiée:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/commandes PATCH] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
