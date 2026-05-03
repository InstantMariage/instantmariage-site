import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendIncompleteProfileReminderEmail } from "@/lib/emails";

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
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) return "Non autorisé";
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (data?.role !== "admin") return "Accès refusé";
  return null;
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin(req);
  if (authErr) return NextResponse.json({ error: authErr }, { status: 403 });

  const supabase = adminClient();
  const now = new Date();

  const from4 = new Date(now.getTime() - 4 * 86_400_000).toISOString();
  const from3 = new Date(now.getTime() - 3 * 86_400_000).toISOString();

  const { data: prestataires, error } = await supabase
    .from("prestataires")
    .select("id, user_id, nom_entreprise, avatar_url, description, photos, prix_depart")
    .gte("created_at", from4)
    .lte("created_at", from3);

  if (error || !prestataires) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des prestataires" },
      { status: 500 }
    );
  }

  const incomplete = prestataires.filter(
    (p) => !p.avatar_url || !p.description || p.description.trim() === ""
  );

  const skippedComplete = prestataires.length - incomplete.length;

  if (incomplete.length === 0) {
    return NextResponse.json({ sent: 0, skipped: skippedComplete });
  }

  // Récupère tous les emails auth en une seule requête
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailByUserId = new Map<string, string>();
  for (const u of authData?.users ?? []) {
    if (u.email) emailByUserId.set(u.id, u.email);
  }

  let sent = 0;
  let skipped = skippedComplete;

  for (const p of incomplete) {
    const email = emailByUserId.get(p.user_id);
    if (!email) {
      skipped++;
      continue;
    }

    const missingItems: string[] = [];
    if (!p.avatar_url) missingItems.push("Photo de profil");
    if (!p.description || p.description.trim() === "")
      missingItems.push("Description de votre activité");
    if (!p.photos || (p.photos as string[]).length === 0)
      missingItems.push("Photos de votre galerie");
    if (p.prix_depart === null) missingItems.push("Vos tarifs");

    try {
      await sendIncompleteProfileReminderEmail({
        recipientEmail: email,
        nomEntreprise: p.nom_entreprise,
        missingItems,
      });
      sent++;
    } catch (err) {
      console.error(`[send-incomplete-reminders] erreur prestataire ${p.id}:`, err);
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
