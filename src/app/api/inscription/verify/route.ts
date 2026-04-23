import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s.\-\/()]/g, "");
  if (p.startsWith("+33")) p = "0" + p.slice(3);
  else if (p.startsWith("0033")) p = "0" + p.slice(4);
  return p;
}

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const ext = domain.split(".").pop() ?? "";
  return `${local[0] ?? ""}***@***.${ext}`;
}

function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { email: rawEmail, telephone: rawPhone } = await req.json();

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const email = normalizeEmail(rawEmail);
    const domain = email.split("@")[1] ?? "";
    const phone = rawPhone && typeof rawPhone === "string" ? normalizePhone(rawPhone) : null;
    const ip = getClientIp(req);

    // Auto-block numéros surtaxés (08xx) sans consulter la blacklist
    if (phone?.startsWith("08")) {
      console.warn(`[verify] Numéro surtaxé bloqué — ${maskEmail(email)}`);
      return NextResponse.json({ allowed: false, reason: "generic" });
    }

    // Vérifications parallèles : email exact, domaine, téléphone, IP
    const pairs: { type: string; valeur: string }[] = [
      { type: "email", valeur: email },
      { type: "domaine_email", valeur: domain },
    ];
    if (phone) pairs.push({ type: "telephone", valeur: phone });
    if (ip) pairs.push({ type: "ip", valeur: ip });

    const results = await Promise.all(
      pairs.map(({ type, valeur }) =>
        supabaseAdmin
          .from("blacklist")
          .select("type, valeur")
          .eq("actif", true)
          .eq("type", type)
          .eq("valeur", valeur)
          .maybeSingle()
          .then(({ data }) => (data ? { type, valeur } : null))
      )
    );

    const hit = results.find(Boolean);

    if (hit) {
      console.warn(`[verify] Inscription bloquée — ${maskEmail(email)} — type: ${hit.type}`);
      return NextResponse.json({ allowed: false, reason: "generic" });
    }

    return NextResponse.json({ allowed: true });
  } catch (err) {
    console.error("[verify] Exception:", err);
    // Fail open : une erreur DB ne bloque pas l'inscription
    return NextResponse.json({ allowed: true });
  }
}
