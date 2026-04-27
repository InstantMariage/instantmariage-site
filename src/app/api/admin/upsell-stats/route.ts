import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireAdmin(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return "Non autorisé";
  const supabase = adminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return "Non autorisé";
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") return "Accès refusé";
  return null;
}

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const supabase = adminClient();

  // Tous les prestataires non-premium via la vue prestataires_ranked
  const { data: prestataires, error: prestError } = await supabase
    .from("prestataires_ranked")
    .select("id, nom_entreprise, user_id, completeness_score, active_plan, nb_avis, created_at")
    .in("active_plan", ["gratuit", "starter", "pro"]);

  if (prestError || !prestataires) {
    return NextResponse.json({ error: "Impossible de charger les prestataires" }, { status: 500 });
  }

  const prestataireIds = prestataires.map((p) => p.id as string);
  const userIds = prestataires.map((p) => p.user_id as string);

  // Comptes documents et messages en parallèle
  const [{ data: docRows }, { data: msgRows }] = await Promise.all([
    supabase
      .from("documents_prestataire")
      .select("prestataire_id")
      .in("prestataire_id", prestataireIds),
    supabase
      .from("messages")
      .select("destinataire_id")
      .in("destinataire_id", userIds),
  ]);

  // Grouper documents par prestataire_id
  const docCounts = new Map<string, number>();
  for (const row of docRows ?? []) {
    docCounts.set(row.prestataire_id, (docCounts.get(row.prestataire_id) ?? 0) + 1);
  }

  // Grouper messages par user_id (destinataire_id)
  const msgCounts = new Map<string, number>();
  for (const row of msgRows ?? []) {
    msgCounts.set(row.destinataire_id, (msgCounts.get(row.destinataire_id) ?? 0) + 1);
  }

  const result = prestataires.map((p) => ({
    id: p.id as string,
    nom_entreprise: p.nom_entreprise as string,
    user_id: p.user_id as string,
    active_plan: p.active_plan as string,
    completeness_score: (p.completeness_score as number) ?? 0,
    nb_avis: (p.nb_avis as number) ?? 0,
    created_at: p.created_at as string,
    doc_count: docCounts.get(p.id as string) ?? 0,
    msg_count: msgCounts.get(p.user_id as string) ?? 0,
  }));

  return NextResponse.json({ prestataires: result });
}
