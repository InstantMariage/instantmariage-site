import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSignalementEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  const { prestataire_id, prestataire_nom, user_id, motif, description } = await req.json();

  if (!prestataire_id || !motif || !description?.trim()) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabaseAdmin.from("signalements").insert({
    prestataire_id,
    user_id: user_id ?? null,
    motif,
    description: description.trim(),
  });

  if (error) {
    console.error("[signalements] supabase error:", error);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
  }

  // Notification email admin (fire-and-forget)
  sendSignalementEmail({
    prestaireId: prestataire_id,
    prestataireName: prestataire_nom ?? prestataire_id,
    motif,
    description: description.trim(),
    userId: user_id ?? null,
  }).catch((err) => console.error("[signalements] email error:", err));

  return NextResponse.json({ ok: true });
}
