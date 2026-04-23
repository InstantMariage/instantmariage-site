import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireAdmin(req: NextRequest): Promise<{ error: string; userId: null } | { error: null; userId: string }> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return { error: "Non autorisé", userId: null };
  const supabase = adminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return { error: "Non autorisé", userId: null };
  const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") return { error: "Accès refusé", userId: null };
  return { error: null, userId: user.id };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 403 });

  const supabase = adminClient();

  const { data, error } = await supabase
    .from("blacklist")
    .select("id, type, valeur, raison, actif, created_at, created_by")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  // Résout les emails des admins créateurs
  const seen = new Set<string>();
  const creatorIds: string[] = rows
    .map((r) => r.created_by)
    .filter((id): id is string => Boolean(id) && !seen.has(id) && (seen.add(id), true));
  let emailMap: Record<string, string> = {};
  if (creatorIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, email")
      .in("id", creatorIds);
    if (usersData) {
      emailMap = Object.fromEntries(usersData.map((u) => [u.id, u.email]));
    }
  }

  const result = rows.map((r) => ({
    ...r,
    created_by_email: r.created_by ? (emailMap[r.created_by] ?? null) : null,
  }));

  return NextResponse.json(result);
}

const TYPE_VALUES = ["email", "domaine_email", "telephone", "ip"] as const;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: 403 });

  const body = await req.json();
  const { type, valeur, raison } = body;

  if (!TYPE_VALUES.includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }
  if (!valeur?.trim()) {
    return NextResponse.json({ error: "Valeur requise" }, { status: 400 });
  }
  if (!raison?.trim()) {
    return NextResponse.json({ error: "Raison requise" }, { status: 400 });
  }

  const valeurNormalisee = valeur.trim().toLowerCase();

  const { data, error } = await adminClient()
    .from("blacklist")
    .insert({
      type,
      valeur: valeurNormalisee,
      raison: raison.trim(),
      created_by: auth.userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Cette valeur est déjà dans la blacklist" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
