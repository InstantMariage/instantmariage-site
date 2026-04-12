import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "InstantMariage <contact@instantmariage.fr>";
const UNSUBSCRIBE_EMAIL = "contact@instantmariage.fr";

const unsubscribeHeaders = {
  "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
};
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://instantmariage.fr";

// ─── Base template ────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InstantMariage</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9f9f9;">
    <tr>
      <td align="center" style="padding:48px 16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                  <span style="color:#F06292;">Instant</span><span style="color:#1a1a1a;">Mariage</span><span style="color:#F06292;">.fr</span>
                </span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:48px 40px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.6;">
                Vous recevez cet email car vous êtes inscrit(e) sur
                <a href="${SITE_URL}" style="color:#F06292;text-decoration:none;">InstantMariage.fr</a>.<br/>
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

function ctaButton(label: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
    <tr>
      <td align="center" style="background-color:#F06292;border-radius:100px;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
    <tr><td style="border-top:1px solid #f0f0f0;"></td></tr>
  </table>`;
}

// ─── Email 1 : Nouveau message ────────────────────────────────────────────────

export async function sendNewMessageEmail({
  recipientEmail,
  recipientName,
  senderName,
  messagePreview,
  conversationId,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationId: string;
}) {
  const preview =
    messagePreview.length > 160
      ? messagePreview.slice(0, 160) + "…"
      : messagePreview;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouveau message</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      ${senderName} vous a écrit
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${recipientName},
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;font-style:italic;">&ldquo;${preview}&rdquo;</p>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir le message", `${SITE_URL}/messages/${conversationId}`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      Répondez directement depuis la messagerie d&rsquo;InstantMariage.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `Nouveau message de ${senderName}`,
    html: baseTemplate(content),
    headers: unsubscribeHeaders,
  });
}

// ─── Email 2 : Nouvel avis ────────────────────────────────────────────────────

export async function sendNewAvisEmail({
  recipientEmail,
  recipientName,
  reviewerName,
  note,
  commentaire,
  prestaireId,
}: {
  recipientEmail: string;
  recipientName: string;
  reviewerName: string;
  note: number;
  commentaire: string | null;
  prestaireId: string;
}) {
  const stars = "★".repeat(note) + "☆".repeat(5 - note);

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouvel avis</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      ${reviewerName} a laissé un avis
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${recipientName},<br/>
      Vous avez reçu un nouvel avis sur votre profil InstantMariage.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <p style="margin:0 0 8px;font-size:22px;color:#F9A825;letter-spacing:2px;">${stars}</p>
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1a1a1a;">${note}/5 étoiles</p>
          ${commentaire ? `<p style="margin:12px 0 0;font-size:14px;color:#555555;line-height:1.7;font-style:italic;">&ldquo;${commentaire}&rdquo;</p>` : ""}
          <p style="margin:16px 0 0;font-size:13px;color:#aaaaaa;">— ${reviewerName}</p>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir mon profil", `${SITE_URL}/prestataires/${prestaireId}`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      Les avis de qualité renforcent votre visibilité sur la plateforme.
    </p>
  `;

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `Nouvel avis de ${reviewerName} — ${note}/5 étoiles`,
    html: baseTemplate(content),
    headers: unsubscribeHeaders,
  });
}

// ─── Email 3 : Contact form (admin) ──────────────────────────────────────────

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Formulaire de contact</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Nouveau message de ${name}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un visiteur vous a contacté via le formulaire de contact du site.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:100px;">Nom</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${name}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;"><a href="mailto:${email}" style="color:#F06292;text-decoration:none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Sujet</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${subject}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;">${message.replace(/\n/g, "<br/>")}</p>
        </td>
      </tr>
    </table>
    ${ctaButton(`Répondre à ${name}`, `mailto:${email}`)}
  `;

  const result = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact] ${subject} — ${name}`,
    html: baseTemplate(content),
  });

  if (result.error) {
    console.error("[sendContactEmail] erreur Resend:", result.error);
    throw new Error(`Resend error: ${result.error.message}`);
  }

  return result;
}

// ─── Email 5 : Signalement prestataire (admin) ───────────────────────────────

export async function sendSignalementEmail({
  prestaireId,
  prestataireName,
  motif,
  description,
  userId,
}: {
  prestaireId: string;
  prestataireName: string;
  motif: string;
  description: string;
  userId: string | null;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#E53935;letter-spacing:0.5px;text-transform:uppercase;">Signalement reçu</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Un prestataire a été signalé
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un utilisateur a soumis un signalement sur la fiche prestataire suivante.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:140px;">Prestataire</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${prestataireName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Motif</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#E53935;">${motif}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Signalé par</td>
              <td style="padding:6px 0;font-size:12px;font-family:monospace;color:#888888;">${userId ?? "Anonyme"}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fff5f5;border-left:3px solid #E53935;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;">${description.replace(/\n/g, "<br/>")}</p>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir la fiche prestataire", `${SITE_URL}/prestataires/${prestaireId}`)}
  `;

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Signalement] ${motif} — ${prestataireName}`,
    html: baseTemplate(content),
  });
}

// ─── Email 4 : Nouveau prestataire (admin) ────────────────────────────────────

export async function sendNewPrestaireAdminEmail({
  entreprise,
  categorie,
  ville,
  email,
  userId,
}: {
  entreprise: string;
  categorie: string;
  ville: string;
  email: string;
  userId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouvelle inscription</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Nouveau prestataire inscrit
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un nouveau prestataire vient de créer son profil sur InstantMariage.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:120px;">Entreprise</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${entreprise}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Catégorie</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${categorie}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Ville</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${ville}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${email}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">User ID</td>
              <td style="padding:6px 0;font-size:12px;font-family:monospace;color:#888888;">${userId}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton("Gérer les prestataires", `${SITE_URL}/admin`)}
  `;

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Nouveau prestataire : ${entreprise} (${categorie}, ${ville})`,
    html: baseTemplate(content),
    headers: unsubscribeHeaders,
  });
}
