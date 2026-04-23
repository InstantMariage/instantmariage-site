import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SYSTEM_USER_ID } from "@/lib/constants";

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key);
}

interface Prestataire {
  id: string;
  user_id: string;
  nom_entreprise: string;
  avatar_url: string | null;
  description: string | null;
  photos: string[] | null;
  cover_url: string | null;
  ville: string | null;
  telephone: string | null;
  site_web: string | null;
  instagram: string | null;
  prix_depart: number | null;
  created_at: string;
  updated_at: string;
}

interface SentRecord {
  prestataire_id: string;
  message_type: string;
  sent_at: string;
}

const MESSAGES = {
  bienvenue: `Bienvenue sur InstantMariage ! 🎉

Votre profil est maintenant en ligne. Pour recevoir vos premiers contacts rapidement, voici les étapes clés :

• Ajoutez une photo de couverture attrayante
• Rédigez une description de vos services (au moins 100 mots)
• Publiez vos plus belles réalisations dans la galerie
• Indiquez votre tarif de départ
• Renseignez votre ville et vos coordonnées

Les profils complets obtiennent 5x plus de contacts que les profils vides. Notre équipe reste disponible si vous avez des questions.

Bonne chance pour votre lancement ! 🌸`,

  photo_profil: `📸 Ajoutez une photo — 3x plus de contacts garanti !

Votre profil n'a pas encore de photo. Les mariés accordent beaucoup d'importance à la présentation de leurs prestataires.

Ajoutez votre meilleure photo ou votre logo depuis votre tableau de bord pour vous démarquer et rassurer les futurs clients.`,

  description: `✍️ Les mariés veulent vous connaître !

Votre profil manque d'une description. Prenez 5 minutes pour raconter votre histoire, votre style, et ce qui vous rend unique.

Une description de qualité rassure les mariés et les encourage à vous contacter plutôt qu'un concurrent. 100 mots suffisent pour faire la différence.`,

  galerie: `🖼️ Montrez votre talent !

Votre galerie photos est encore vide. Les mariés passent en moyenne 2 minutes à regarder les réalisations d'un prestataire avant de décider de le contacter.

Ajoutez vos plus belles photos depuis votre tableau de bord — c'est votre meilleure vitrine !`,

  completude: `💡 Votre profil peut faire mieux !

Votre profil est actif depuis 3 jours mais il reste encore incomplet. Chaque élément manquant vous coûte des places dans les résultats de recherche.

Compléter votre profil prend moins de 15 minutes et peut doubler votre visibilité. Rendez-vous dans votre tableau de bord pour finaliser les informations manquantes.`,

  relance: `👋 Un peu de nouveauté sur votre profil ?

Votre profil n'a pas été mis à jour depuis un moment. Les mariés préfèrent les prestataires qui maintiennent leurs informations à jour et montrent qu'ils sont actifs.

Quelques idées rapides : ajoutez de nouvelles photos, actualisez votre description ou vérifiez vos coordonnées. 5 minutes peuvent faire la différence pour votre prochain contact !`,
};

function getCompletenessScore(
  p: Prestataire,
  hasVideo: boolean
): number {
  let score = 0;
  if (p.cover_url) score += 15;
  if (p.photos && p.photos.length >= 3) score += 10;
  if (p.description && p.description.length >= 100) score += 10;
  if (p.ville) score += 5;
  if (p.telephone) score += 5;
  if (p.site_web || p.instagram) score += 5;
  if (p.prix_depart !== null) score += 5;
  if (hasVideo) score += 5;
  return score; // sur 60
}

async function getOrCreateConversation(
  supabase: SupabaseClient,
  prestataireUserId: string
): Promise<string> {
  const { data: rows } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant1_id.eq.${SYSTEM_USER_ID},participant2_id.eq.${prestataireUserId}),` +
        `and(participant1_id.eq.${prestataireUserId},participant2_id.eq.${SYSTEM_USER_ID})`
    )
    .order("created_at", { ascending: true })
    .limit(1);

  if (rows && rows.length > 0) return rows[0].id;

  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({
      participant1_id: SYSTEM_USER_ID,
      participant2_id: prestataireUserId,
    })
    .select("id")
    .single();

  if (error || !newConv) {
    throw new Error(`Impossible de créer la conversation : ${error?.message}`);
  }
  return newConv.id;
}

async function sendAutoMessage(
  supabase: SupabaseClient,
  convId: string,
  prestataireUserId: string,
  prestataireId: string,
  messageType: string,
  content: string
): Promise<void> {
  const now = new Date().toISOString();

  await supabase.from("messages").insert({
    conversation_id: convId,
    expediteur_id: SYSTEM_USER_ID,
    destinataire_id: prestataireUserId,
    contenu: content,
    lu: false,
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", convId);

  await supabase.from("auto_messages_sent").insert({
    prestataire_id: prestataireId,
    message_type: messageType,
    sent_at: now,
  });
}

export async function GET(req: NextRequest) {
  // Vérification du secret cron (Vercel envoie Authorization: Bearer CRON_SECRET)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  // Récupération de tous les prestataires
  const { data: prestataires, error: prestError } = await supabase
    .from("prestataires")
    .select(
      "id, user_id, nom_entreprise, avatar_url, description, photos, cover_url, ville, telephone, site_web, instagram, prix_depart, created_at, updated_at"
    );

  if (prestError || !prestataires) {
    return NextResponse.json(
      { error: "Impossible de charger les prestataires" },
      { status: 500 }
    );
  }

  // IDs des prestataires avec au moins une vidéo
  const { data: videoRows } = await supabase
    .from("prestataire_videos")
    .select("prestataire_id");
  const withVideo = new Set((videoRows ?? []).map((r) => r.prestataire_id));

  // Historique des messages automatiques déjà envoyés
  const { data: sentRows } = await supabase
    .from("auto_messages_sent")
    .select("prestataire_id, message_type, sent_at");

  const sentByPrestataire = new Map<string, SentRecord[]>();
  for (const r of sentRows ?? []) {
    if (!sentByPrestataire.has(r.prestataire_id)) {
      sentByPrestataire.set(r.prestataire_id, []);
    }
    sentByPrestataire.get(r.prestataire_id)!.push(r);
  }

  function wasSent(prestataireId: string, type: string): boolean {
    return (
      sentByPrestataire.get(prestataireId)?.some((r) => r.message_type === type) ?? false
    );
  }

  function lastSentAt(prestataireId: string, type: string): Date | null {
    const records = (sentByPrestataire.get(prestataireId) ?? []).filter(
      (r) => r.message_type === type
    );
    if (records.length === 0) return null;
    return records.reduce<Date>((latest, r) => {
      const d = new Date(r.sent_at);
      return d > latest ? d : latest;
    }, new Date(records[0].sent_at));
  }

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const p of prestataires) {
    const createdAt = new Date(p.created_at);
    const updatedAt = new Date(p.updated_at);
    const ageHours = (now.getTime() - createdAt.getTime()) / 3_600_000;
    const ageDays = ageHours / 24;
    const inactiveDays = (now.getTime() - updatedAt.getTime()) / 86_400_000;

    const score = getCompletenessScore(p, withVideo.has(p.id));
    const messagesToSend: Array<{ type: string; content: string }> = [];

    // 1. Bienvenue — envoyé dans les 24h suivant l'inscription (une seule fois)
    if (ageHours < 24 && !wasSent(p.id, "bienvenue")) {
      messagesToSend.push({ type: "bienvenue", content: MESSAGES.bienvenue });
    }

    // 2–4. Rappels de complétion — après 24h de grâce (une seule fois chacun)
    if (ageHours >= 24) {
      if (!p.avatar_url && !wasSent(p.id, "photo_profil")) {
        messagesToSend.push({ type: "photo_profil", content: MESSAGES.photo_profil });
      }
      if (
        (!p.description || p.description.length < 100) &&
        !wasSent(p.id, "description")
      ) {
        messagesToSend.push({ type: "description", content: MESSAGES.description });
      }
      if ((!p.photos || p.photos.length === 0) && !wasSent(p.id, "galerie")) {
        messagesToSend.push({ type: "galerie", content: MESSAGES.galerie });
      }
    }

    // 5. Encouragement complétude — après 3 jours si score < 30/60 (une seule fois)
    if (ageDays >= 3 && score < 30 && !wasSent(p.id, "completude")) {
      messagesToSend.push({ type: "completude", content: MESSAGES.completude });
    }

    // 6. Relance inactivité — après 7 jours sans mise à jour (répétable toutes les 7 jours)
    if (ageDays >= 7 && inactiveDays >= 7) {
      const last = lastSentAt(p.id, "relance");
      const daysSinceLast = last
        ? (now.getTime() - last.getTime()) / 86_400_000
        : Infinity;
      if (daysSinceLast >= 7) {
        messagesToSend.push({ type: "relance", content: MESSAGES.relance });
      }
    }

    if (messagesToSend.length === 0) {
      results.skipped++;
      continue;
    }

    try {
      const convId = await getOrCreateConversation(supabase, p.user_id);
      for (const msg of messagesToSend) {
        await sendAutoMessage(
          supabase,
          convId,
          p.user_id,
          p.id,
          msg.type,
          msg.content
        );
        results.sent++;
      }
    } catch (err) {
      console.error(`[auto-messages] Erreur prestataire ${p.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: now.toISOString(),
  });
}
