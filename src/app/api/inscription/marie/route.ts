import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[api/inscription/marie] Variables manquantes:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { user_id, prenom_marie1, date_mariage } = await req.json();

    if (!user_id || !prenom_marie1) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("maries").insert({
      user_id,
      prenom_marie1,
      date_mariage: date_mariage || null,
    }).select();

    if (error) {
      console.error("[api/inscription/marie] Erreur insert:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }

    console.log("[api/inscription/marie] Insert réussi:", data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/inscription/marie] Exception:", err);
    return NextResponse.json({ error: "Erreur serveur", details: String(err) }, { status: 500 });
  }
}
