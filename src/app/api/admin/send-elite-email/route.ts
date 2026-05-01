import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "InstantMariage <contact@instantmariage.fr>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://instantmariage.fr";

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

function buildHtml(corps: string): string {
  // Convertit le texte plein en HTML lisible
  const escaped = corps
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Détecte les URLs et les transforme en liens
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#7C3AED;text-decoration:none;">$1</a>'
  );

  // Paragraphes sur double saut de ligne, <br> sur simple
  const paragraphs = linked
    .split(/\n\n+/)
    .map((para) => `<p style="margin:0 0 16px;line-height:1.7;">${para.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9f9f9;">
    <tr>
      <td align="center" style="padding:48px 16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                  <span style="color:#F06292;">Instant</span><span style="color:#1a1a1a;">Mariage</span><span style="color:#F06292;">.fr</span>
                </span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.06);font-size:15px;color:#1a1a1a;">
              ${paragraphs}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.6;">
                Vous recevez cet email car vous êtes inscrit(e) sur
                <a href="${SITE_URL}" style="color:#F06292;text-decoration:none;">InstantMariage.fr</a>.<br/>
                Pour vous désabonner : <a href="mailto:contact@instantmariage.fr?subject=unsubscribe" style="color:#aaaaaa;">contact@instantmariage.fr</a><br/>
                © ${new Date().getFullYear()} InstantMariage. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type PrestataireCible = {
  id: string;
  email: string;
  nom_entreprise: string;
};

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return NextResponse.json({ error: err }, { status: 403 });

  const body = await req.json().catch(() => null);
  const prestataires: PrestataireCible[] = body?.prestataires ?? [];
  const sujet: string = body?.sujet ?? "";
  const corps: string = body?.corps ?? "";

  if (!sujet || !corps) {
    return NextResponse.json({ error: "sujet et corps sont requis" }, { status: 400 });
  }

  // Limite de sécurité anti rate-limit Resend
  const cibles = prestataires.slice(0, 50);

  const results = await Promise.allSettled(
    cibles.map(async (p) => {
      if (!p.email) throw new Error(`Email manquant pour ${p.nom_entreprise}`);

      const corpsPersonnalise = corps.replace(/\[nom_entreprise\]/g, p.nom_entreprise);
      const sujetPersonnalise = sujet.replace(/\[nom_entreprise\]/g, p.nom_entreprise);

      await resend.emails.send({
        from: FROM,
        to: p.email,
        subject: sujetPersonnalise,
        html: buildHtml(corpsPersonnalise),
        text: corpsPersonnalise,
        headers: {
          "List-Unsubscribe": "<mailto:contact@instantmariage.fr?subject=unsubscribe>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const errors = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, errors });
}
