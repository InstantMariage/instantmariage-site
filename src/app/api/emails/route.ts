import { NextRequest, NextResponse } from "next/server";
import {
  sendNewMessageEmail,
  sendNewAvisEmail,
  sendNewPrestaireAdminEmail,
  sendContactEmail,
  sendSignalementEmail,
} from "@/lib/emails";

export async function POST(req: NextRequest) {
  console.log("[emails] POST received");

  if (!process.env.RESEND_API_KEY) {
    console.error("[emails] RESEND_API_KEY is missing — email service not configured");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  console.log("[emails] RESEND_API_KEY présente (longueur:", process.env.RESEND_API_KEY.length, ")");

  const body = await req.json();
  const { type } = body;
  console.log("[emails] type:", type, "| body keys:", Object.keys(body));

  try {
    if (type === "new_message") {
      const { recipientEmail, recipientName, senderName, messagePreview, conversationId } = body;
      await sendNewMessageEmail({ recipientEmail, recipientName, senderName, messagePreview, conversationId });
    } else if (type === "new_avis") {
      const { recipientEmail, recipientName, reviewerName, note, commentaire, prestaireId } = body;
      await sendNewAvisEmail({ recipientEmail, recipientName, reviewerName, note, commentaire, prestaireId });
    } else if (type === "new_prestataire") {
      const { entreprise, categorie, ville, email, userId } = body;
      await sendNewPrestaireAdminEmail({ entreprise, categorie, ville, email, userId });
    } else if (type === "contact") {
      const { name, email, subject, message } = body;
      console.log("[emails] contact — name:", name, "| email:", email, "| subject:", subject);
      await sendContactEmail({ name, email, subject, message });
    } else if (type === "signalement") {
      const { prestaireId, prestataireName, motif, description, userId } = body;
      await sendSignalementEmail({ prestaireId, prestataireName, motif, description, userId });
    } else {
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    console.log("[emails] envoi réussi pour type:", type);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[emails] send error (type=" + type + "):", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
