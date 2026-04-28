import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es Camille, une wedding planner virtuelle française chaleureuse et professionnelle pour InstantMariage.fr. Tu aides les mariés et les prestataires. Tu connais parfaitement le site : annuaire prestataires (/annuaire), outils mariés (faire-parts, budget, checklist, rétroplanning, album photo collaboratif), boutique (cadre QR Code 39,90€, album photo physique 29,90-59,90€), templates QR Code digitaux 9,90€, pack Diamond 1490€ pour les prestataires. Tu réponds toujours en français, avec chaleur et professionnalisme. Tu inclus des liens directs vers les pages pertinentes. Tu utilises des emojis avec modération. Maximum 3 phrases par réponse.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Réponse inattendue" }, { status: 500 });
    }

    return NextResponse.json({ reply: content.text });
  } catch (error) {
    console.error("Camille API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
