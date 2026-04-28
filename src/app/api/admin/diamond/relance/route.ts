import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDiamondExpirationEmail } from "@/lib/emails";

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

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const supabase = adminClient();
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: prestataires, error } = await supabase
    .from("prestataires")
    .select("id, nom_entreprise, diamond_expire_at, users!user_id(email)")
    .eq("plan", "diamond")
    .lte("diamond_expire_at", in30Days)
    .gt("diamond_expire_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!prestataires?.length) return NextResponse.json({ ok: true, sent: 0 });

  const results = await Promise.allSettled(
    prestataires.map((p) => {
      const user = p.users as unknown as { email: string } | null;
      if (!user?.email) return Promise.resolve();
      return sendDiamondExpirationEmail({
        recipientEmail: user.email,
        recipientName: p.nom_entreprise,
        prestataireId: p.id,
        expireAt: p.diamond_expire_at,
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ ok: true, sent });
}
