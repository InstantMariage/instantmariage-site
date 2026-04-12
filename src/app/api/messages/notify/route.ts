import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNewMessageEmail } from "@/lib/emails";

// Délai minimum entre deux notifications email pour la même conversation (5 minutes)
const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const { recipientId, senderName, messagePreview, conversationId } = await req.json();

  if (!recipientId || !senderName || !conversationId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Anti-spam : vérifier si un email a déjà été envoyé récemment pour cette conversation
  const cooldownSince = new Date(Date.now() - NOTIFY_COOLDOWN_MS).toISOString();
  const { data: recentMessages } = await supabaseAdmin
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("destinataire_id", recipientId)
    .eq("lu", false)
    .gt("created_at", cooldownSince)
    .limit(2);

  // S'il y a déjà plus d'un message non lu récent, une notif a déjà été envoyée
  if (recentMessages && recentMessages.length > 1) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Récupérer l'email du destinataire via auth admin
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(recipientId);

  if (userError || !userData?.user?.email) {
    console.error("[messages/notify] Impossible de récupérer l'email:", userError?.message);
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
  }

  const recipientEmail = userData.user.email;

  // Récupérer le prénom/nom du destinataire
  let recipientName = recipientEmail.split("@")[0];

  const { data: prest } = await supabaseAdmin
    .from("prestataires")
    .select("nom_entreprise")
    .eq("user_id", recipientId)
    .maybeSingle();

  if (prest) {
    recipientName = prest.nom_entreprise;
  } else {
    const { data: marie } = await supabaseAdmin
      .from("maries")
      .select("prenom_marie1, prenom_marie2")
      .eq("user_id", recipientId)
      .maybeSingle();

    if (marie) {
      recipientName = marie.prenom_marie2
        ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
        : marie.prenom_marie1;
    }
  }

  try {
    await sendNewMessageEmail({
      recipientEmail,
      recipientName,
      senderName,
      messagePreview,
      conversationId,
    });

    console.log(`[messages/notify] Email envoyé à ${recipientEmail} pour conv ${conversationId}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[messages/notify] Erreur envoi email:", err);
    return NextResponse.json({ error: "Échec envoi email" }, { status: 500 });
  }
}
