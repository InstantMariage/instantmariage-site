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
<body style="margin:0;padding:0;background-color:#F5F3F0;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F3F0;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#FFFFFF;border-radius:12px 12px 0 0;padding:24px 48px;border-top:1px solid #E8E4DF;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="https://www.instantmariage.fr/logo.png" alt="" height="50" style="display:block;" onerror="this.style.display='none'"/>
                  </td>
                  <td style="vertical-align:middle;padding-left:12px;">
                    <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#F06292;">Instant</span><span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#1C1410;">Mariage.fr</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background-color:#ffffff;padding:48px 48px 40px;text-align:center;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#888888;">Bonjour <strong style="color:#1a1a1a;">${nomEntreprise}</strong>,</p>
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:400;color:#1C1410;line-height:1.25;letter-spacing:-0.5px;">Votre site professionnel mariage,<br/>livré en 72 heures</h1>
              <p style="margin:0 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#666666;line-height:1.7;">Conçu sur mesure par notre équipe — à partir de <strong style="color:#1C1410;">149 €/mois</strong></p>
              <a href="https://www.instantmariage.fr/elite" style="display:inline-block;background-color:#F06292;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;padding:16px 36px;border-radius:4px;letter-spacing:0.5px;">Découvrir le Pack Elite</a>
            </td>
          </tr>

          <!-- SEPARATOR -->
          <tr>
            <td style="background-color:#ffffff;padding:0 48px;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;"/>
            </td>
          </tr>

          <!-- FEATURES -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 48px 40px;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <h2 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1C1410;letter-spacing:0.2px;">Ce qui est inclus</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;border-bottom:1px solid #F0EDE9;">
                    <strong style="color:#1C1410;">Design 100% sur mesure</strong><br/>
                    <span style="color:#777777;">Identité visuelle adaptée à votre activité et votre image</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;border-bottom:1px solid #F0EDE9;">
                    <strong style="color:#1C1410;">Livraison en 72 heures</strong><br/>
                    <span style="color:#777777;">Site en ligne et opérationnel en moins de 3 jours ouvrés</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;border-bottom:1px solid #F0EDE9;">
                    <strong style="color:#1C1410;">Nom de domaine personnalisé inclus</strong><br/>
                    <span style="color:#777777;">Votre propre adresse web, enregistrée à votre nom</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;">
                    <strong style="color:#1C1410;">Référencement et hébergement compris</strong><br/>
                    <span style="color:#777777;">Optimisé pour Google dès le lancement, hébergement inclus</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEPARATOR -->
          <tr>
            <td style="background-color:#ffffff;padding:0 48px;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;"/>
            </td>
          </tr>

          <!-- EXEMPLES DE SITES -->
          <tr>
            <td style="background-color:#FAF8F6;padding:36px 48px 40px;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <h2 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1C1410;letter-spacing:0.2px;">Exemples de réalisations</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="background:#ffffff;border:1px solid #E8E4DF;border-radius:8px;vertical-align:top;overflow:hidden;">
                    <img src="https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777676591464-capture-d-ecran-2026-05-02-a-00.47.00.png" width="100%" height="160" style="display:block;object-fit:cover;border-radius:8px 8px 0 0;" alt="Léa Martin Photographie"/>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1C1410;">Léa Martin Photographie</p>
                          <a href="https://instantmariage.fr/demo/photographe" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#F06292;text-decoration:none;">Voir le site →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background:#ffffff;border:1px solid #E8E4DF;border-radius:8px;vertical-align:top;overflow:hidden;">
                    <img src="https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777676622087-capture-d-ecran-2026-05-02-a-00.50.00.png" width="100%" height="160" style="display:block;object-fit:cover;border-radius:8px 8px 0 0;" alt="Maison Blanche Bridal"/>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1C1410;">Maison Blanche Bridal</p>
                          <a href="https://instantmariage.fr/demo/boutique" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#F06292;text-decoration:none;">Voir le site →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td colspan="3" style="height:12px;"></td></tr>
                <tr>
                  <td width="48%" style="background:#ffffff;border:1px solid #E8E4DF;border-radius:8px;vertical-align:top;overflow:hidden;">
                    <img src="https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777676640884-capture-d-ecran-2026-05-02-a-00.51.34.png" width="100%" height="160" style="display:block;object-fit:cover;border-radius:8px 8px 0 0;" alt="Prestige Wedding Cars"/>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1C1410;">Prestige Wedding Cars</p>
                          <a href="https://instantmariage.fr/demo/chauffeur" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#F06292;text-decoration:none;">Voir le site →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background:#ffffff;border:1px solid #E8E4DF;border-radius:8px;vertical-align:top;overflow:hidden;">
                    <img src="https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777676659070-capture-d-ecran-2026-05-02-a-00.52.16.png" width="100%" height="160" style="display:block;object-fit:cover;border-radius:8px 8px 0 0;" alt="Domaine des Lumières"/>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:14px 16px;">
                          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1C1410;">Domaine des Lumières</p>
                          <a href="https://instantmariage.fr/demo/salle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#F06292;text-decoration:none;">Voir le site →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SEPARATOR -->
          <tr>
            <td style="background-color:#FAF8F6;padding:0 48px;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <hr style="border:none;border-top:1px solid #E8E4DF;margin:0;"/>
            </td>
          </tr>

          <!-- PRICING -->
          <tr>
            <td style="background-color:#FAF8F6;padding:36px 48px 40px;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">
              <h2 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1C1410;letter-spacing:0.2px;">Nos formules</h2>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48%" style="background-color:#ffffff;border:1px solid #F9C2D6;border-radius:6px;padding:24px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#F06292;letter-spacing:1.5px;text-transform:uppercase;">Elite Vitrine</p>
                    <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#F06292;line-height:1;">149 €<span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:400;color:#999999;">/mois</span></p>
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#444444;">- Site vitrine sur mesure</p>
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#444444;">- Domaine personnalisé</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#444444;">- Livraison en 72h</p>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color:#1C1410;border:1px solid #1C1410;border-radius:6px;padding:24px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#F06292;letter-spacing:1.5px;text-transform:uppercase;">Elite Shop</p>
                    <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#ffffff;line-height:1;">199 €<span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:400;color:#999999;">/mois</span></p>
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#cccccc;">- Boutique en ligne</p>
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#cccccc;">- Paiement en ligne intégré</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#cccccc;">- Catalogue produits illimité</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA FINAL -->
          <tr>
            <td style="background-color:#1C1410;padding:44px 48px;text-align:center;">
              <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#ffffff;letter-spacing:0.2px;">Votre site mariage professionnel vous attend</h2>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#aaaaaa;line-height:1.7;">Rejoignez les prestataires qui font confiance à InstantMariage</p>
              <a href="https://www.instantmariage.fr/elite" style="display:inline-block;background-color:#F06292;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;padding:16px 36px;border-radius:4px;letter-spacing:0.5px;">Réserver mon domaine</a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#F0EDE9;border-radius:0 0 12px 12px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#999999;">© 2026 InstantMariage.fr — Tous droits réservés</p>
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#999999;">Vous recevez cet email car vous êtes prestataire sur <a href="https://www.instantmariage.fr" style="color:#F06292;text-decoration:none;">InstantMariage.fr</a></p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;"><a href="mailto:contact@instantmariage.fr?subject=unsubscribe" style="color:#bbbbbb;text-decoration:underline;">Se désabonner</a></p>
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
