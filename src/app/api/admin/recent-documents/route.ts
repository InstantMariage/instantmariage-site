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

  const { data: docs } = await supabase
    .from("documents_prestataire")
    .select(`
      id, type, montant_ttc, created_at, numero, prestataire_id,
      prestataires!prestataire_id(
        id, nom_entreprise, user_id,
        abonnements!prestataire_id(plan, statut)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (docs ?? []).map((doc: any) => {
    const prest = doc.prestataires;
    const plan =
      ((prest?.abonnements ?? []) as { plan: string; statut: string }[]).find(
        (a) => a.statut === "actif"
      )?.plan ?? "gratuit";
    return {
      id: doc.id,
      type: doc.type as "devis" | "facture" | "contrat",
      montant_ttc: doc.montant_ttc as number | null,
      created_at: doc.created_at as string,
      numero: doc.numero as string,
      nom_entreprise: (prest?.nom_entreprise as string) ?? "—",
      prestataire_id: (prest?.id ?? doc.prestataire_id) as string,
      user_id: (prest?.user_id as string) ?? null,
      plan,
    };
  });

  return NextResponse.json({ docs: result });
}
