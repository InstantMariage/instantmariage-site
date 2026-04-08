import { NextRequest, NextResponse } from "next/server";
import {
  sendNewMessageEmail,
  sendNewAvisEmail,
  sendNewPrestaireAdminEmail,
} from "@/lib/emails";

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { type } = body;

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
    } else {
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[emails] send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
