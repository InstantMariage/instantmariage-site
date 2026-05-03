import { Resend } from "resend";
import { calculerCommission, tauxCommission } from "./cagnotte-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "InstantMariage <contact@instantmariage.fr>";
const UNSUBSCRIBE_EMAIL = "contact@instantmariage.fr";

const REPLY_TO = "contact@instantmariage.fr";

const unsubscribeHeaders = {
  "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
};
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://instantmariage.fr";

// ─── Plain-text footer ────────────────────────────────────────────────────────

function textFooter(unsubscribe = false) {
  const lines = [
    "",
    "---",
    `Vous recevez cet email car vous êtes inscrit(e) sur InstantMariage.fr.`,
    `© ${new Date().getFullYear()} InstantMariage. Tous droits réservés.`,
  ];
  if (unsubscribe) {
    lines.push(`Pour vous désabonner : mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe`);
  }
  return lines.join("\n");
}

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

  const text = [
    `Bonjour ${recipientName},`,
    "",
    `${senderName} vous a envoyé un nouveau message sur InstantMariage.fr.`,
    "",
    `"${preview}"`,
    "",
    `Voir et répondre au message :`,
    `${SITE_URL}/messages/${conversationId}`,
    textFooter(true),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Nouveau message de ${senderName}`,
    html: baseTemplate(content),
    text,
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

  const starsText = "★".repeat(note) + "☆".repeat(5 - note);
  const text = [
    `Bonjour ${recipientName},`,
    "",
    `${reviewerName} a laissé un avis sur votre profil InstantMariage.fr.`,
    "",
    `Note : ${starsText} (${note}/5)`,
    ...(commentaire ? [`"${commentaire}"`, `— ${reviewerName}`] : []),
    "",
    `Voir votre profil :`,
    `${SITE_URL}/prestataires/${prestaireId}`,
    textFooter(true),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Nouvel avis de ${reviewerName} — ${note}/5 étoiles`,
    html: baseTemplate(content),
    text,
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

  const text = [
    `Formulaire de contact — InstantMariage.fr`,
    "",
    `Nom : ${name}`,
    `Email : ${email}`,
    `Sujet : ${subject}`,
    "",
    message,
    textFooter(),
  ].join("\n");

  const result = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact] ${subject} — ${name}`,
    html: baseTemplate(content),
    text,
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

  const text = [
    `[Signalement] ${prestataireName}`,
    "",
    `Prestataire : ${prestataireName}`,
    `Motif : ${motif}`,
    `Signalé par : ${userId ?? "Anonyme"}`,
    "",
    description,
    "",
    `Voir la fiche : ${SITE_URL}/prestataires/${prestaireId}`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Signalement] ${motif} — ${prestataireName}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 6 : Confirmation commande faire-part ───────────────────────────────

export async function sendInvitationConfirmationEmail({
  recipientEmail,
  coupleNames,
  pack,
  montantEuros,
}: {
  recipientEmail: string;
  coupleNames: string;
  pack: string;
  montantEuros: number;
}) {
  const PACK_LABELS: Record<string, string> = {
    digital: "Faire-part Numérique",
    print_50: "Impression 50 exemplaires",
    print_100: "Impression 100 exemplaires",
    print_150: "Impression 150 exemplaires",
    print_200: "Impression 200 exemplaires",
    print_250: "Impression 250 exemplaires",
    print_300: "Impression 300 exemplaires",
  };
  const packLabel = PACK_LABELS[pack] ?? pack;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Commande confirmée</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Votre faire-part est en cours de création&nbsp;✨
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour,<br/>
      Votre commande pour <strong>${coupleNames}</strong> a bien été reçue.
      Votre vidéo animée sera prête dans quelques minutes.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:140px;">Couple</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNames}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Pack</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${packLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${montantEuros.toFixed(2)} €</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir mes faire-parts", `${SITE_URL}/dashboard/marie/faire-parts`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      Vous recevrez une notification dès que votre vidéo animée sera prête à partager.
    </p>
  `;

  const text = [
    `Bonjour,`,
    "",
    `Votre commande de faire-part pour ${coupleNames} a bien été confirmée.`,
    "",
    `Pack : ${packLabel}`,
    `Montant : ${montantEuros.toFixed(2)} €`,
    "",
    `Votre vidéo animée sera prête dans quelques minutes.`,
    "",
    `Voir vos faire-parts : ${SITE_URL}/dashboard/marie/faire-parts`,
    textFooter(true),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Votre faire-part ${coupleNames} est en cours de création`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email 7 : Notification RSVP aux mariés ──────────────────────────────────

export async function sendRsvpNotificationEmail({
  coupleEmail,
  coupleNames,
  guestPrenom,
  guestNom,
  guestEmail,
  presence,
  nbPersonnes,
  regimeAlimentaire,
  message,
  invitationSlug,
}: {
  coupleEmail: string;
  coupleNames: string;
  guestPrenom: string;
  guestNom: string;
  guestEmail: string;
  presence: boolean;
  nbPersonnes: number;
  regimeAlimentaire: string | null;
  message: string | null;
  invitationSlug: string;
}) {
  const guestFullName = `${guestPrenom} ${guestNom}`;
  const presenceLabel = presence ? `✅ Présent(e) — ${nbPersonnes} personne${nbPersonnes > 1 ? 's' : ''}` : '❌ Absent(e)';
  const accentColor = presence ? '#16a34a' : '#dc2626';

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouvelle réponse RSVP</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      ${guestFullName} a répondu
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${coupleNames},<br/>
      Vous venez de recevoir une réponse à votre faire-part.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:140px;">Invité(e)</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${guestFullName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">
                <a href="mailto:${guestEmail}" style="color:#F06292;text-decoration:none;">${guestEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Réponse</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;" style="color:${accentColor};">${presenceLabel}</td>
            </tr>
            ${regimeAlimentaire ? `
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Régime</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${regimeAlimentaire}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
    ${message ? `
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;font-style:italic;">&ldquo;${message}&rdquo;</p>
        </td>
      </tr>
    </table>` : ''}
    ${ctaButton('Voir toutes les réponses', `${SITE_URL}/dashboard/marie/faire-parts`)}
  `;

  const lines = [
    `Bonjour ${coupleNames},`,
    '',
    `${guestFullName} a répondu à votre faire-part.`,
    '',
    `Réponse : ${presence ? `Présent(e) — ${nbPersonnes} personne${nbPersonnes > 1 ? 's' : ''}` : 'Absent(e)'}`,
    `Email : ${guestEmail}`,
    ...(regimeAlimentaire ? [`Régime : ${regimeAlimentaire}`] : []),
    ...(message ? ['', `Message : "${message}"`] : []),
    '',
    `Voir toutes les réponses : ${SITE_URL}/dashboard/marie/faire-parts`,
    textFooter(true),
  ];

  return resend.emails.send({
    from: FROM,
    to: coupleEmail,
    replyTo: guestEmail,
    subject: `Nouvelle réponse RSVP de ${guestFullName}`,
    html: baseTemplate(content),
    text: lines.join('\n'),
    headers: unsubscribeHeaders,
  });
}

// ─── Email 8 : Remerciement contributeur cagnotte ────────────────────────────

export async function sendCagnotteMerciEmail({
  contributeurEmail,
  contributeurNom,
  coupleNames,
  montantEuros,
  cagnotteTitre,
  invitationSlug,
}: {
  contributeurEmail: string;
  contributeurNom: string;
  coupleNames: string;
  montantEuros: number;
  cagnotteTitre: string;
  invitationSlug: string;
}) {
  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Merci pour votre cadeau</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Votre contribution a bien été reçue&nbsp;🎁
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${contributeurNom},<br/>
      Votre contribution à la cagnotte <strong>${cagnotteTitre}</strong> de <strong>${coupleNames}</strong> a bien été enregistrée.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:140px;">Bénéficiaires</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNames}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Cagnotte</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${cagnotteTitre}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${montantEuros.toFixed(2)}&nbsp;€</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton('Voir le faire-part', `${SITE_URL}/invitation/${invitationSlug}`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      Merci de partager la joie de ce beau moment avec les mariés&nbsp;💕
    </p>
  `;

  const text = [
    `Bonjour ${contributeurNom},`,
    '',
    `Votre contribution de ${montantEuros.toFixed(2)} € à la cagnotte "${cagnotteTitre}" de ${coupleNames} a bien été reçue.`,
    '',
    `Voir le faire-part : ${SITE_URL}/invitation/${invitationSlug}`,
    textFooter(false),
  ].join('\n');

  return resend.emails.send({
    from: FROM,
    to: contributeurEmail,
    replyTo: REPLY_TO,
    subject: `Merci pour votre cadeau — ${coupleNames}`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email 9 : Notification cagnotte aux mariés ───────────────────────────────

export async function sendCagnotteNotifEmail({
  coupleEmail,
  coupleNames,
  contributeurNom,
  montantEuros,
  message,
  totalCollecteEuros,
}: {
  coupleEmail: string;
  coupleNames: string;
  contributeurNom: string;
  montantEuros: number;
  message: string | null;
  totalCollecteEuros: number;
}) {
  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouveau cadeau reçu</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      ${contributeurNom} vous a offert un cadeau&nbsp;🎁
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${coupleNames},<br/>
      Vous venez de recevoir une nouvelle contribution à votre cagnotte mariage.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:160px;">Contributeur</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${contributeurNom}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#F06292;">${montantEuros.toFixed(2)}&nbsp;€</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Total collecté</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${totalCollecteEuros.toFixed(2)}&nbsp;€</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${message ? `
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
          <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;font-style:italic;">&ldquo;${message}&rdquo;</p>
        </td>
      </tr>
    </table>` : ''}
    ${ctaButton('Voir ma cagnotte', `${SITE_URL}/dashboard/marie/faire-parts`)}
  `;

  const lines = [
    `Bonjour ${coupleNames},`,
    '',
    `${contributeurNom} vous a offert ${montantEuros.toFixed(2)} € via votre cagnotte mariage.`,
    `Total collecté : ${totalCollecteEuros.toFixed(2)} €`,
    ...(message ? ['', `Message : "${message}"`] : []),
    '',
    `Voir votre cagnotte : ${SITE_URL}/dashboard/marie/faire-parts`,
    textFooter(false),
  ];

  return resend.emails.send({
    from: FROM,
    to: coupleEmail,
    replyTo: REPLY_TO,
    subject: `🎁 ${contributeurNom} vous a offert ${montantEuros.toFixed(2)} €`,
    html: baseTemplate(content),
    text: lines.join('\n'),
    headers: unsubscribeHeaders,
  });
}

// ─── Email 10 : Demande de virement cagnotte (admin) ─────────────────────────

export async function sendDemandeVirementEmail({
  cagnotteTitre,
  coupleNom,
  totalCents,
  iban,
  invitationId,
}: {
  cagnotteTitre: string;
  coupleNom: string;
  totalCents: number;
  iban: string | null;
  invitationId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";
  const commission = calculerCommission(totalCents);
  const netCents = totalCents - commission;
  const taux = tauxCommission(totalCents);

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Demande de virement</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Demande de virement cagnotte
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un couple vient de demander le virement de leur cagnotte mariage.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:180px;">Couple</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNom}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Cagnotte</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${cagnotteTitre}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Total collecté</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${(totalCents / 100).toFixed(2)}&nbsp;€</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Commission (${taux})</td>
              <td style="padding:6px 0;font-size:14px;color:#E53935;">−${(commission / 100).toFixed(2)}&nbsp;€</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Net à virer</td>
              <td style="padding:6px 0;font-size:14px;font-weight:700;color:#16a34a;">${(netCents / 100).toFixed(2)}&nbsp;€</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">IBAN</td>
              <td style="padding:6px 0;font-size:13px;font-family:monospace;color:${iban ? "#1a1a1a" : "#aaaaaa"};">${iban ?? "Non renseigné"}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton("Gérer les cagnottes", `${SITE_URL}/admin/cagnottes`)}
  `;

  const text = [
    `Demande de virement cagnotte — InstantMariage.fr`,
    "",
    `Couple : ${coupleNom}`,
    `Cagnotte : ${cagnotteTitre}`,
    `Total collecté : ${(totalCents / 100).toFixed(2)} €`,
    `Commission (${taux}) : −${(commission / 100).toFixed(2)} €`,
    `Net à virer : ${(netCents / 100).toFixed(2)} €`,
    `IBAN : ${iban ?? "Non renseigné"}`,
    "",
    `Gérer les cagnottes : ${SITE_URL}/admin/cagnottes`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Virement] ${coupleNom} — ${(netCents / 100).toFixed(2)} € à virer`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 11 : Nouveau document prestataire (admin) ─────────────────────────

export async function sendNewDocumentEmail({
  prestataireName,
  prestataireId,
  type,
  montantTTC,
  plan,
}: {
  prestataireName: string;
  prestataireId: string;
  type: "devis" | "facture" | "contrat";
  montantTTC: number | null;
  plan: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const TYPE_LABELS = { devis: "devis", facture: "facture", contrat: "contrat" };
  const typeLabel = TYPE_LABELS[type];

  const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
    gratuit: { bg: "#F3F4F6", text: "#6B7280" },
    starter: { bg: "#EFF6FF", text: "#3B82F6" },
    pro:     { bg: "#F5F3FF", text: "#8B5CF6" },
    premium: { bg: "#FFFBEB", text: "#D97706" },
    diamond: { bg: "#1C1C1E", text: "#C9A84C" },
  };
  const planColor = PLAN_COLORS[plan] ?? PLAN_COLORS.gratuit;
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const isUpgradable = plan === "gratuit" || plan === "starter" || plan === "pro";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouveau document généré</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Nouveau ${typeLabel} généré
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un prestataire vient de générer un ${typeLabel} via son dashboard.
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
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Plan actuel</td>
              <td style="padding:6px 0;">
                <span style="display:inline-block;padding:2px 10px;border-radius:100px;font-size:12px;font-weight:700;background:${planColor.bg};color:${planColor.text};">
                  ${planLabel}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Type</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}</td>
            </tr>
            ${montantTTC !== null ? `
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant TTC</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${montantTTC.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
            </tr>` : ""}
          </table>
        </td>
      </tr>
    </table>
    ${isUpgradable ? `
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#FFFBEB;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#D97706;text-transform:uppercase;letter-spacing:0.5px;">Opportunité d'upgrade</p>
          <p style="margin:0;font-size:14px;color:#78350F;line-height:1.6;">
            Ce prestataire est actif — c'est le bon moment pour lui proposer un abonnement supérieur.
          </p>
        </td>
      </tr>
    </table>` : ""}
    ${ctaButton("Voir les prestataires", `${SITE_URL}/admin/prestataires`)}
  `;

  const text = [
    `Nouveau ${typeLabel} généré — InstantMariage.fr`,
    "",
    `Prestataire : ${prestataireName} (ID: ${prestataireId})`,
    `Plan : ${planLabel}`,
    `Type : ${typeLabel}`,
    ...(montantTTC !== null ? [`Montant TTC : ${montantTTC.toFixed(2)} €`] : []),
    "",
    ...(isUpgradable
      ? ["→ Ce prestataire est actif — bon moment pour proposer un upgrade.", ""]
      : []),
    `Voir les prestataires : ${SITE_URL}/admin/prestataires`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `📄 Nouveau ${typeLabel} — ${prestataireName}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 12 : Commande cadre physique (admin) ──────────────────────────────

export async function sendCommandeCadreEmail({
  coupleNames,
  templateId,
  adresse,
  codePostal,
  ville,
  telephone,
  dateMariage,
  marieId,
}: {
  coupleNames: string;
  templateId: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  dateMariage: string;
  marieId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const TEMPLATE_LABELS: Record<string, string> = {
    "elegance-doree": "Élégance Dorée",
    "boheme-rose": "Bohème Rose",
    "moderne-minimaliste": "Moderne Minimaliste",
    "nuit-romantique": "Nuit Romantique",
  };
  const templateLabel = TEMPLATE_LABELS[templateId] ?? templateId;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Action requise — Nouvelle commande cadre</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Préparer et expédier la commande
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un couple vient de commander un cadre physique avec carte QR Code imprimée.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:160px;">Couple</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNames}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Template</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${templateLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Date du mariage</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${dateMariage}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Téléphone</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${telephone}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#FFF8F0;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#F06292;text-transform:uppercase;letter-spacing:0.5px;">Adresse de livraison</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.8;">
            ${adresse}<br/>
            ${codePostal} ${ville}
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#F0FDF4;border-left:3px solid #10B981;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;">Produit à expédier</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">
            Cadre blanc 15×20 cm + carte QR Code imprimée (design&nbsp;: ${templateLabel})<br/>
            <span style="color:#555;font-size:13px;">Délai : 5–7 jours ouvrés · Livraison incluse</span>
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir le dashboard admin", `${SITE_URL}/admin`)}
  `;

  const text = [
    `[Commande cadre] Action requise — InstantMariage.fr`,
    "",
    `Couple : ${coupleNames}`,
    `Template : ${templateLabel}`,
    `Date du mariage : ${dateMariage}`,
    `Téléphone : ${telephone}`,
    "",
    `Adresse de livraison :`,
    adresse,
    `${codePostal} ${ville}`,
    "",
    `Produit : Cadre blanc 15×20 cm + carte QR Code imprimée`,
    `Délai : 5–7 jours ouvrés · Livraison incluse`,
    "",
    `Marie ID : ${marieId}`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Cadre] Nouvelle commande — ${coupleNames} · ${ville}`,
    html: baseTemplate(content),
    text,
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

  const text = [
    `Nouveau prestataire inscrit sur InstantMariage.fr`,
    "",
    `Entreprise : ${entreprise}`,
    `Catégorie : ${categorie}`,
    `Ville : ${ville}`,
    `Email : ${email}`,
    `User ID : ${userId}`,
    "",
    `Gérer les prestataires : ${SITE_URL}/admin`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Nouveau prestataire : ${entreprise} (${categorie}, ${ville})`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email 13 : Commande chevalet physique (admin) ────────────────────────────

export async function sendCommandeChevaletEmail({
  coupleNames,
  adresse,
  codePostal,
  ville,
  telephone,
  dateMariage,
  marieId,
}: {
  coupleNames: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  dateMariage: string;
  marieId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6366F1;letter-spacing:0.5px;text-transform:uppercase;">Action requise — Nouvelle commande chevalet</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Préparer et expédier la commande
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un couple vient de commander un chevalet cartonné premium avec carte QR Code.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:160px;">Couple</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNames}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Date du mariage</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${dateMariage}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Téléphone</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${telephone}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#FFF8F0;border-left:3px solid #6366F1;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:0.5px;">Adresse de livraison</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.8;">
            ${adresse}<br/>
            ${codePostal} ${ville}
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#F0FDF4;border-left:3px solid #10B981;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;">Produit à expédier</p>
          <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">
            Chevalet cartonné premium + carte QR Code imprimée<br/>
            <span style="color:#555;font-size:13px;">Délai : 5–7 jours ouvrés · Livraison incluse · 19,90 €</span>
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir les commandes admin", `${SITE_URL}/admin/commandes`)}
  `;

  const text = [
    `[Commande chevalet] Action requise — InstantMariage.fr`,
    "",
    `Couple : ${coupleNames}`,
    `Date du mariage : ${dateMariage}`,
    `Téléphone : ${telephone}`,
    "",
    `Adresse de livraison :`,
    adresse,
    `${codePostal} ${ville}`,
    "",
    `Produit : Chevalet cartonné premium + carte QR Code`,
    `Délai : 5–7 jours ouvrés · Livraison incluse · 19,90 €`,
    "",
    `Marie ID : ${marieId}`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Chevalet] Nouvelle commande — ${coupleNames} · ${ville}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 14 : Commande expédiée (marié) ─────────────────────────────────────

export async function sendCommandeExpedieeEmail({
  userEmail,
  coupleNames,
  produit,
  nomDestinataire,
  adresse,
  codePostal,
  ville,
  numeroSuivi,
}: {
  userEmail: string;
  coupleNames: string;
  produit: string;
  nomDestinataire: string;
  adresse: string;
  codePostal: string;
  ville: string;
  numeroSuivi: string;
}) {
  const produitLabel = produit === "cadre" ? "Cadre QR Code" : produit === "chevalet" ? "Chevalet QR Code" : "Votre commande";
  const suivi = `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(numeroSuivi)}`;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#10B981;letter-spacing:0.5px;text-transform:uppercase;">Votre commande est en route !</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      ${produitLabel} expédié
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${coupleNames},<br/><br/>
      Bonne nouvelle ! Votre <strong>${produitLabel}</strong> vient d'être expédié. Vous le recevrez sous 2–3 jours ouvrés.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#F0FDF4;border-left:3px solid #10B981;border-radius:0 8px 8px 0;padding:20px 24px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;">Numéro de suivi Colissimo</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;font-family:monospace;letter-spacing:0.08em;">${numeroSuivi}</p>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.5px;">Adresse de livraison</p>
          <p style="margin:0;font-size:14px;color:#333333;line-height:1.8;">
            ${nomDestinataire}<br/>
            ${adresse}<br/>
            ${codePostal} ${ville}
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton("Suivre ma livraison Colissimo", suivi)}
    <p style="margin:24px 0 0;font-size:13px;color:#888888;line-height:1.6;text-align:center;">
      Des questions ? Répondez à cet email ou contactez-nous sur <a href="mailto:contact@instantmariage.fr" style="color:#F06292;">contact@instantmariage.fr</a>
    </p>
  `;

  const text = [
    `[InstantMariage] Votre commande est expédiée !`,
    "",
    `Bonjour ${coupleNames},`,
    "",
    `Votre ${produitLabel} vient d'être expédié.`,
    "",
    `Numéro de suivi Colissimo : ${numeroSuivi}`,
    `Suivre sur laposte.fr : ${suivi}`,
    "",
    `Adresse de livraison :`,
    `${nomDestinataire}`,
    `${adresse}`,
    `${codePostal} ${ville}`,
    "",
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: userEmail,
    subject: `Votre ${produitLabel} est en route ! Suivi : ${numeroSuivi}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 16 : Commande album photo (admin) ─────────────────────────────────

export async function sendAlbumPhotoEmail({
  coupleNames,
  format,
  nbPages,
  nbPhotos,
  adresse,
  codePostal,
  ville,
  telephone,
  marieId,
  prodigiOrderId,
}: {
  coupleNames: string;
  format: string;
  nbPages: number;
  nbPhotos: number;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  marieId: string;
  prodigiOrderId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";
  const FORMAT_PRICES: Record<string, string> = {
    "20": "29,90 €",
    "30": "39,90 €",
    "50": "59,90 €",
  };
  const prix = FORMAT_PRICES[String(format)] ?? "—";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Nouvelle commande album photo</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      📸 Album photo en impression — ${prix}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un couple vient de commander un album photo imprimé. La commande Prodigi est en cours de traitement automatique.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:160px;">Couple</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNames}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Format</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${nbPages} pages — ${nbPhotos} photos</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant</td>
              <td style="padding:6px 0;font-size:14px;font-weight:700;color:#F06292;">${prix}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Prodigi Order ID</td>
              <td style="padding:6px 0;font-size:12px;font-family:monospace;color:#888888;">${prodigiOrderId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Téléphone</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${telephone}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#FFF8F0;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#F06292;text-transform:uppercase;letter-spacing:0.5px;">Adresse de livraison</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.8;">
            ${adresse}<br/>
            ${codePostal} ${ville}
          </p>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#F0FDF4;border-left:3px solid #10B981;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
            Impression automatique via <strong>Prodigi</strong> — aucune action requise.<br/>
            Délai : 5–7 jours ouvrés · Couverture rigide A4
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton("Voir les commandes", `${SITE_URL}/admin/boutique`)}
  `;

  const text = [
    `[Album Photo] Nouvelle commande — InstantMariage.fr`,
    "",
    `Couple : ${coupleNames}`,
    `Format : ${nbPages} pages — ${nbPhotos} photos`,
    `Montant : ${prix}`,
    `Prodigi Order ID : ${prodigiOrderId}`,
    `Téléphone : ${telephone}`,
    "",
    `Adresse de livraison :`,
    adresse,
    `${codePostal} ${ville}`,
    "",
    `Impression automatique via Prodigi — 5–7 jours ouvrés.`,
    "",
    `Marie ID : ${marieId}`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `📸 Commande album photo — ${coupleNames} · ${ville}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 17 : Confirmation album photo (marié) ──────────────────────────────

export async function sendAlbumConfirmationEmail({
  recipientEmail,
  coupleNames,
  format,
  nbPages,
  adresse,
  codePostal,
  ville,
}: {
  recipientEmail: string;
  coupleNames: string;
  format: string;
  nbPages: number;
  adresse: string;
  codePostal: string;
  ville: string;
}) {
  const FORMAT_PRICES: Record<string, string> = {
    "20": "29,90 €",
    "30": "39,90 €",
    "50": "59,90 €",
  };
  const prix = FORMAT_PRICES[String(format)] ?? "—";

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Commande confirmée</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Votre album est en cours d&rsquo;impression&nbsp;📸
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${coupleNames},<br/>
      Votre album photo de mariage est en cours d&rsquo;impression. Vous le recevrez sous <strong>5 à 7 jours ouvrés</strong>.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:160px;">Album</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${nbPages} pages · Couverture rigide A4</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant réglé</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${prix}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Adresse</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${adresse}, ${codePostal} ${ville}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Délai estimé</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#059669;">5–7 jours ouvrés</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-left:3px solid #F06292;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
            Des questions sur votre commande ? Écrivez-nous à
            <a href="mailto:contact@instantmariage.fr" style="color:#F06292;text-decoration:none;">contact@instantmariage.fr</a>
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton("Mon album photo", `${SITE_URL}/dashboard/marie/album-photo`)}
  `;

  const text = [
    `Bonjour ${coupleNames},`,
    "",
    `Votre album photo de mariage est en cours d'impression.`,
    "",
    `Format : ${nbPages} pages — Couverture rigide A4`,
    `Montant réglé : ${prix}`,
    `Livraison : ${adresse}, ${codePostal} ${ville}`,
    `Délai estimé : 5–7 jours ouvrés`,
    "",
    `Des questions ? contact@instantmariage.fr`,
    "",
    `Voir votre album : ${SITE_URL}/dashboard/marie/album-photo`,
    textFooter(true),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Votre album photo est en cours d'impression — ${coupleNames}`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email Diamond J-30 : Expiration pack Diamond (prestataire) ──────────────

export async function sendDiamondExpirationEmail({
  recipientEmail,
  recipientName,
  prestataireId,
  expireAt,
}: {
  recipientEmail: string;
  recipientName: string;
  prestataireId: string;
  expireAt: string;
}) {
  const dateExpiration = new Date(expireAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const DIAMOND_MAILTO =
    "mailto:contact@instantmariage.fr?subject=Renouvellement%20Pack%20Diamond%20InstantMariage&body=Bonjour%2C%20je%20souhaite%20renouveler%20mon%20pack%20Diamond.%0AMon%20nom%20est%20%3A%20%0AMon%20profil%20%3A%20";

  const features = [
    "Reportage vidéo professionnel par notre créatrice de contenu",
    "Article de blog dédié sur InstantMariage.fr",
    "Diffusion sur nos réseaux sociaux (logo InstantMariage)",
    "Badge Diamond 💎 exclusif sur votre profil",
    "Priorité #1 dans les résultats de recherche",
    "Support prioritaire 7j/7",
  ];

  const featuresHtml = features
    .map(
      (f) =>
        `<li style="padding:4px 0;font-size:14px;color:#333333;display:flex;align-items:flex-start;gap:8px;">
          <span style="color:#C9A84C;font-weight:700;flex-shrink:0;">✦</span> ${f}
        </li>`
    )
    .join("");

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#C9A84C;letter-spacing:0.5px;text-transform:uppercase;">Pack Diamond 💎</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Votre pack Diamond expire dans 30 jours
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour ${recipientName},<br/>
      Votre pack Diamond expire le <strong>${dateExpiration}</strong>. Pour continuer à bénéficier de vos avantages exclusifs, contactez-nous dès maintenant.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#1C1C1E;border-radius:12px;padding:24px;border:1px solid #C9A84C40;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#C9A84C;text-transform:uppercase;letter-spacing:0.5px;">Vos avantages Diamond</p>
          <ul style="margin:0;padding:0;list-style:none;">
            ${featuresHtml}
          </ul>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
      <tr>
        <td align="center" style="background-color:#C9A84C;border-radius:100px;">
          <a href="${DIAMOND_MAILTO}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#1C1C1E;text-decoration:none;letter-spacing:0.1px;">
            Renouveler mon pack Diamond 💎
          </a>
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      Sans action de votre part, votre profil repassera automatiquement en plan Premium à l&rsquo;expiration.
    </p>
  `;

  const text = [
    `Bonjour ${recipientName},`,
    "",
    `Votre pack Diamond expire le ${dateExpiration}.`,
    "",
    "Vos avantages Diamond :",
    ...features.map((f) => `  ✦ ${f}`),
    "",
    `Pour renouveler, contactez-nous : contact@instantmariage.fr`,
    `Sujet : Renouvellement Pack Diamond`,
    "",
    `Sans action de votre part, votre profil repassera en plan Premium à l'expiration.`,
    "",
    `Voir votre profil : ${SITE_URL}/prestataires/${prestataireId}`,
    textFooter(true),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Votre pack Diamond expire dans 30 jours 💎`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email Elite : Bienvenue Pack Elite (prestataire) ────────────────────────

export async function sendEliteWelcomeEmail({
  recipientEmail,
}: {
  recipientEmail: string;
}) {
  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Pack Elite InstantMariage</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Votre site est en cours de création&nbsp;🎉
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour,
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.65;">
      Merci pour votre souscription au Pack Elite InstantMariage&nbsp;!
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Votre site professionnel sera créé dans les <strong>72 heures</strong> suivant la réception de votre questionnaire.
    </p>
    ${ctaButton("Compléter mon questionnaire", "https://www.instantmariage.fr/elite/questionnaire")}
    ${divider()}
    <p style="margin:0;font-size:14px;color:#555555;line-height:1.65;">
      Une fois votre questionnaire soumis, notre équipe commencera la création de votre site immédiatement.
    </p>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      À très bientôt,<br/>
      <strong style="color:#1a1a1a;">L&rsquo;équipe InstantMariage.fr</strong>
    </p>
  `;

  const text = [
    `Bonjour,`,
    "",
    `Merci pour votre souscription au Pack Elite InstantMariage !`,
    "",
    `Votre site professionnel sera créé dans les 72 heures suivant la réception de votre questionnaire.`,
    "",
    `👉 Complétez votre questionnaire ici : https://www.instantmariage.fr/elite/questionnaire`,
    "",
    `Une fois votre questionnaire soumis, notre équipe commencera la création de votre site immédiatement.`,
    "",
    `À très bientôt,`,
    `L'équipe InstantMariage.fr`,
    textFooter(false),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Bienvenue dans le Pack Elite — votre site est en cours de création 🎉`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email 15 : Nouvelle vente template digital (admin) ───────────────────────

export async function sendTemplateDigitalEmail({
  coupleNames,
  templateId,
  marieId,
}: {
  coupleNames: string;
  templateId: string;
  marieId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contact@instantmariage.fr";

  const TEMPLATE_LABELS: Record<string, string> = {
    "elegance-doree": "Élégance Dorée",
    "boheme-rose": "Bohème Rose",
    "moderne-minimaliste": "Moderne Minimaliste",
    "nuit-romantique": "Nuit Romantique",
  };
  const templateLabel = TEMPLATE_LABELS[templateId] ?? templateId;
  const dateVente = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#7C3AED;letter-spacing:0.5px;text-transform:uppercase;">Nouvelle vente — Produit digital</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      💳 Template Digital — 9,90€
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.65;">
      Un couple vient d'acheter un template digital. Aucune action requise, l'accès est automatique.
    </p>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#fafafa;border-radius:12px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;width:160px;">Couple</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1a;">${coupleNames}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Template acheté</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${templateLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Date de vente</td>
              <td style="padding:6px 0;font-size:14px;color:#333333;">${dateVente}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#aaaaaa;">Montant</td>
              <td style="padding:6px 0;font-size:14px;font-weight:700;color:#7C3AED;">9,90 €</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#F5F3FF;border-left:3px solid #7C3AED;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
            Produit digital — <strong>pas d'expédition</strong>. L'accès au template est activé automatiquement pour le couple.
          </p>
        </td>
      </tr>
    </table>
  `;

  const text = [
    `[InstantMariage] 💳 Nouvelle vente — Template Digital 9,90€`,
    "",
    `Couple : ${coupleNames}`,
    `Template : ${templateLabel}`,
    `Date : ${dateVente}`,
    `Montant : 9,90 €`,
    "",
    `Produit digital — aucune expédition requise.`,
    "",
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `💳 Nouvelle vente — Template Digital 9,90€ — ${coupleNames}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 16 : Nouvelle demande Elite (admin) ────────────────────────────────

export async function sendEliteNewRequestAdminEmail({
  nomProfessionnel,
  domaine,
  typeActivite,
  telephone,
  emailContact,
  plan,
}: {
  nomProfessionnel: string;
  domaine: string;
  typeActivite: string;
  telephone: string;
  emailContact: string;
  plan: string;
}) {
  const adminEmail = "adel.bendj@icloud.com";
  const adminLink = `${SITE_URL}/admin/elite`;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#7C3AED;letter-spacing:0.5px;text-transform:uppercase;">Nouvelle demande Elite</p>
    <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      🔔 ${nomProfessionnel}
    </h1>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
      ${[
        ["Nom professionnel", nomProfessionnel],
        ["Domaine", domaine],
        ["Activité", typeActivite],
        ["Téléphone", telephone || "—"],
        ["Email de contact", emailContact || "—"],
        ["Plan", plan],
      ].map(([label, value], i) => `
      <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
        <td style="padding:10px 12px;font-size:13px;color:#888888;width:40%;">${label}</td>
        <td style="padding:10px 12px;font-size:13px;color:#1a1a1a;font-weight:600;">${value}</td>
      </tr>`).join("")}
    </table>
    ${ctaButton("Voir dans le dashboard admin →", adminLink)}
  `;

  const text = [
    `🔔 Nouvelle demande Elite — ${nomProfessionnel}`,
    "",
    `Nom professionnel : ${nomProfessionnel}`,
    `Domaine : ${domaine}`,
    `Activité : ${typeActivite}`,
    `Téléphone : ${telephone || "—"}`,
    `Email de contact : ${emailContact || "—"}`,
    `Plan : ${plan}`,
    "",
    `Dashboard admin : ${adminLink}`,
    textFooter(),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `🔔 Nouvelle demande Elite — ${nomProfessionnel}`,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email 17 : Site Elite en ligne (client) ──────────────────────────────────

export async function sendEliteSiteOnlineEmail({
  recipientEmail,
  domaine,
}: {
  recipientEmail: string;
  domaine: string;
}) {
  const dashboardUrl = `${SITE_URL}/dashboard/prestataire/elite`;
  const siteUrl = `https://${domaine}`;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#16A34A;letter-spacing:0.5px;text-transform:uppercase;">Pack Elite InstantMariage</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      🎉 Votre site est en ligne !
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.65;">
      Bonjour,
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.65;">
      Votre site professionnel est maintenant en ligne ! Vous pouvez le consulter ici :
    </p>
    <p style="margin:0 0 24px;">
      <a href="${siteUrl}" style="color:#7C3AED;font-weight:700;font-size:16px;text-decoration:none;">${siteUrl}</a>
    </p>
    ${ctaButton("Voir les stats dans mon dashboard →", dashboardUrl)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      À très bientôt,<br/>
      <strong style="color:#1a1a1a;">L&rsquo;équipe InstantMariage.fr</strong>
    </p>
  `;

  const text = [
    `🎉 Votre site est en ligne !`,
    "",
    `Bonjour,`,
    "",
    `Votre site professionnel est maintenant en ligne ! Vous pouvez le consulter ici : ${siteUrl}`,
    "",
    `Connectez-vous à votre dashboard pour voir les stats : ${dashboardUrl}`,
    "",
    `À très bientôt,`,
    `L'équipe InstantMariage.fr`,
    textFooter(false),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `🎉 Votre site est en ligne — ${domaine}`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}

// ─── Email 18 : Bienvenue mariés ──────────────────────────────────────────────

export async function sendWelcomeMarieEmail({
  recipientEmail,
  prenomMarie1,
  prenomMarie2,
}: {
  recipientEmail: string;
  prenomMarie1: string;
  prenomMarie2?: string | null;
}) {
  const titleNames = prenomMarie2
    ? `${prenomMarie1} &amp; ${prenomMarie2}`
    : prenomMarie1;

  const content = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#F06292;letter-spacing:0.5px;text-transform:uppercase;">Bienvenue sur InstantMariage.fr</p>
    <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
      Bienvenue, ${titleNames}&nbsp;! 💍
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.65;">
      Votre compte est créé&nbsp;! Voici ce que vous pouvez faire dès maintenant&nbsp;:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      ${[
        ["Parcourir les prestataires vérifiés", "#F06292"],
        ["Contacter directement les pros qui vous plaisent", "#F06292"],
        ["Utiliser nos outils gratuits (checklist, budget, rétroplanning…)", "#F06292"],
        ["Créer votre album photo collaboratif", "#F06292"],
      ].map(([label]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #fce4ec;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:28px;vertical-align:top;padding-top:1px;">
                <span style="display:inline-block;width:20px;height:20px;background-color:#fce4ec;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#F06292;">✓</span>
              </td>
              <td style="font-size:14px;color:#333333;line-height:1.5;">${label}</td>
            </tr>
          </table>
        </td>
      </tr>`).join("")}
    </table>
    ${ctaButton("Commencer ma recherche →", "https://www.instantmariage.fr/annuaire")}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;text-align:center;">
      À très bientôt,<br/>
      <strong style="color:#1a1a1a;">L&rsquo;équipe InstantMariage.fr</strong>
    </p>
    <p style="margin:12px 0 0;font-size:11px;color:#cccccc;line-height:1.5;text-align:center;">
      Pour vous désabonner : <a href="mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe" style="color:#cccccc;">cliquez ici</a>
    </p>
  `;

  const coupleLabel = prenomMarie2 ? `${prenomMarie1} & ${prenomMarie2}` : prenomMarie1;

  const text = [
    `Bienvenue sur InstantMariage.fr, ${coupleLabel} !`,
    "",
    `Votre compte est créé ! Voici ce que vous pouvez faire dès maintenant :`,
    "",
    `✓ Parcourir les prestataires vérifiés`,
    `✓ Contacter directement les pros qui vous plaisent`,
    `✓ Utiliser nos outils gratuits (checklist, budget, rétroplanning...)`,
    `✓ Créer votre album photo collaboratif`,
    "",
    `👉 Commencer ma recherche : https://www.instantmariage.fr/annuaire`,
    "",
    `À très bientôt,`,
    `L'équipe InstantMariage.fr`,
    textFooter(true),
  ].join("\n");

  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    replyTo: REPLY_TO,
    subject: `Bienvenue sur InstantMariage.fr, ${coupleLabel} 💍`,
    html: baseTemplate(content),
    text,
    headers: unsubscribeHeaders,
  });
}
