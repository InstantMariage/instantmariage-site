import { NextRequest, NextResponse } from "next/server";
import {
  sendEliteNewRequestAdminEmail,
  sendEliteSiteOnlineEmail,
} from "@/lib/emails";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.type) {
    return NextResponse.json({ error: "type manquant" }, { status: 400 });
  }

  if (body.type === "new_request") {
    const { nomProfessionnel, domaine, typeActivite, telephone, emailContact, plan } = body;
    if (!nomProfessionnel || !domaine) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    await sendEliteNewRequestAdminEmail({
      nomProfessionnel,
      domaine,
      typeActivite: typeActivite || "—",
      telephone: telephone || "",
      emailContact: emailContact || "",
      plan: plan || "—",
    });
    return NextResponse.json({ ok: true });
  }

  if (body.type === "site_online") {
    const { recipientEmail, domaine } = body;
    if (!recipientEmail || !domaine) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    await sendEliteSiteOnlineEmail({ recipientEmail, domaine });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type inconnu" }, { status: 400 });
}
