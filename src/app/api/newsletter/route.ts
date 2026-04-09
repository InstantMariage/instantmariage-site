import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      email,
      listIds: [2],
      updateEnabled: true,
    }),
  });

  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    // 400 avec code "duplicate_parameter" = déjà inscrit, on traite comme succès
    if (body?.code === "duplicate_parameter") {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
