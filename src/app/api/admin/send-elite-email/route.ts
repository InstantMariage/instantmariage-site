import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "InstantMariage <contact@instantmariage.fr>";

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

function buildEliteHtml(nomEntreprise: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Pack Elite — InstantMariage.fr</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F4FF;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F4FF;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#F06292,#E91E8C);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 10px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">&#128141; InstantMariage.fr</p>
              <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#ffffff;font-size:13px;padding:4px 16px;border-radius:20px;letter-spacing:0.5px;">&#10024; Nouveauté exclusive</span>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 16px;font-size:16px;color:#888888;">Bonjour <strong style="color:#1a1a1a;">${nomEntreprise}</strong>,</p>
              <h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#1a1a1a;line-height:1.2;">Votre site pro mariage en 72h</h1>
              <p style="margin:0 0 28px;font-size:16px;color:#666666;line-height:1.6;">Créé sur mesure par notre équipe — à partir de <strong>149€/mois</strong></p>
              <a href="https://www.instantmariage.fr/elite" style="display:inline-block;background:linear-gradient(135deg,#F06292,#E91E8C);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 32px;border-radius:50px;letter-spacing:0.3px;">Découvrir le Pack Elite →</a>
            </td>
          </tr>

          <!-- FEATURES -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="text-align:center;padding:20px 8px;border-radius:12px;background-color:#F8F4FF;">
                    <p style="margin:0 0 6px;font-size:28px;">&#127912;</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1a1a1a;">100% sur mesure</p>
                    <p style="margin:0;font-size:12px;color:#888888;line-height:1.5;">Design adapté à votre activité</p>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="33%" style="text-align:center;padding:20px 8px;border-radius:12px;background-color:#F8F4FF;">
                    <p style="margin:0 0 6px;font-size:28px;">&#9889;</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1a1a1a;">Livraison en 72h</p>
                    <p style="margin:0;font-size:12px;color:#888888;line-height:1.5;">Site en ligne rapidement</p>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="33%" style="text-align:center;padding:20px 8px;border-radius:12px;background-color:#F8F4FF;">
                    <p style="margin:0 0 6px;font-size:28px;">&#127760;</p>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1a1a1a;">Domaine inclus</p>
                    <p style="margin:0;font-size:12px;color:#888888;line-height:1.5;">Votre propre nom de domaine</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EXEMPLES DE SITES -->
          <tr>
            <td style="background-color:#F8F4FF;padding:32px 40px;">
              <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1a1a1a;text-align:center;">Nos réalisations</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:22px;">&#128247;</p>
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a1a1a;">Léa Martin Photographie</p>
                    <a href="https://instantmariage.fr/demo/photographe" style="font-size:12px;color:#7C3AED;text-decoration:none;font-weight:600;">Voir le site →</a>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:22px;">&#128248;</p>
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a1a1a;">Maison Blanche Bridal</p>
                    <a href="https://instantmariage.fr/demo/boutique" style="font-size:12px;color:#7C3AED;text-decoration:none;font-weight:600;">Voir le site →</a>
                  </td>
                </tr>
                <tr><td colspan="3" style="height:12px;"></td></tr>
                <tr>
                  <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:22px;">&#128664;</p>
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a1a1a;">Prestige Wedding Cars</p>
                    <a href="https://instantmariage.fr/demo/chauffeur" style="font-size:12px;color:#7C3AED;text-decoration:none;font-weight:600;">Voir le site →</a>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background:#ffffff;border-radius:12px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:22px;">&#127984;</p>
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a1a1a;">Domaine des Lumières</p>
                    <a href="https://instantmariage.fr/demo/salle" style="font-size:12px;color:#7C3AED;text-decoration:none;font-weight:600;">Voir le site →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRICING -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px;">
              <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1a1a1a;text-align:center;">Choisissez votre formule</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="background-color:#F3E8FF;border:2px solid #7C3AED;border-radius:16px;padding:24px;text-align:center;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#7C3AED;letter-spacing:1px;text-transform:uppercase;">Elite Vitrine</p>
                    <p style="margin:0 0 16px;font-size:32px;font-weight:800;color:#1a1a1a;line-height:1;">149€<span style="font-size:14px;font-weight:400;color:#888888;">/mois</span></p>
                    <p style="margin:0 0 6px;font-size:13px;color:#444444;">&#10003; Site vitrine sur mesure</p>
                    <p style="margin:0 0 6px;font-size:13px;color:#444444;">&#10003; Domaine personnalisé</p>
                    <p style="margin:0;font-size:13px;color:#444444;">&#10003; Livraison en 72h</p>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color:#FCE7F3;border:2px solid #F06292;border-radius:16px;padding:24px;text-align:center;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#E91E8C;letter-spacing:1px;text-transform:uppercase;">Elite Shop</p>
                    <p style="margin:0 0 16px;font-size:32px;font-weight:800;color:#1a1a1a;line-height:1;">199€<span style="font-size:14px;font-weight:400;color:#888888;">/mois</span></p>
                    <p style="margin:0 0 6px;font-size:13px;color:#444444;">&#10003; Boutique en ligne</p>
                    <p style="margin:0 0 6px;font-size:13px;color:#444444;">&#10003; Paiement en ligne intégré</p>
                    <p style="margin:0;font-size:13px;color:#444444;">&#10003; Catalogue produits illimité</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA FINAL -->
          <tr>
            <td style="background:linear-gradient(135deg,#F06292,#E91E8C);padding:40px;text-align:center;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Prêt à booster votre activité mariage ?</h2>
              <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.85);">Rejoignez les professionnels qui font confiance à InstantMariage</p>
              <a href="https://www.instantmariage.fr/elite" style="display:inline-block;background:#ffffff;color:#E91E8C;text-decoration:none;font-size:16px;font-weight:700;padding:16px 32px;border-radius:50px;">Réserver mon domaine maintenant →</a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f3f4f6;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#999999;">© 2026 InstantMariage.fr — Tous droits réservés</p>
              <p style="margin:0 0 8px;font-size:12px;color:#999999;">Vous recevez cet email car vous êtes prestataire sur <a href="https://www.instantmariage.fr" style="color:#F06292;text-decoration:none;">InstantMariage.fr</a></p>
              <p style="margin:0;font-size:12px;"><a href="mailto:contact@instantmariage.fr?subject=unsubscribe" style="color:#cccccc;text-decoration:underline;">Se désabonner</a></p>
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

      const sujetPersonnalise = sujet.replace(/\[nom_entreprise\]/g, p.nom_entreprise);
      const corpsPersonnalise = corps.replace(/\[nom_entreprise\]/g, p.nom_entreprise);

      await resend.emails.send({
        from: FROM,
        to: p.email,
        subject: sujetPersonnalise,
        html: buildEliteHtml(p.nom_entreprise),
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
