export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRsvpNotificationEmail } from '@/lib/emails';

type Params = { slug: string };

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Variables Supabase manquantes');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { slug } = params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de la requête invalide' }, { status: 400 });
  }

  const { prenom, nom, email, telephone, presence, nb_personnes, regime_alimentaire, message, accompagnants_prenoms: rawAccompagnants } = body;

  if (!prenom || !nom || !email || typeof presence !== 'boolean') {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const nbPersonnes = presence ? Math.max(1, Math.min(20, Number(nb_personnes) || 1)) : 0;

  const accompagnantsPrenoms: string[] = Array.isArray(rawAccompagnants)
    ? (rawAccompagnants as unknown[])
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        .map(p => p.trim().slice(0, 100))
        .slice(0, 19)
    : [];

  const supabase = getSupabaseAdmin();

  // Fetch invitation (must be published and RSVP active)
  const { data: invitation, error: invErr } = await supabase
    .from('invitations')
    .select(`
      id, slug, titre, rsvp_actif, rsvp_deadline, config, marie_id,
      maries!marie_id(user_id, prenom_marie1, prenom_marie2)
    `)
    .eq('slug', slug)
    .eq('statut', 'publie')
    .maybeSingle();

  if (invErr || !invitation) {
    return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 });
  }

  if (!invitation.rsvp_actif) {
    return NextResponse.json({ error: 'Les RSVP sont fermés' }, { status: 403 });
  }

  const deadline = (invitation as any).rsvp_deadline;
  if (deadline && new Date(deadline) < new Date()) {
    return NextResponse.json({ error: 'La date limite de RSVP est dépassée' }, { status: 403 });
  }

  // Prevent duplicate response from same email
  const { data: existing } = await supabase
    .from('rsvp_responses')
    .select('id')
    .eq('invitation_id', invitation.id)
    .eq('email', String(email))
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà répondu à cette invitation' }, { status: 409 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const { data: rsvpInserted, error: insertErr } = await supabase.from('rsvp_responses').insert({
    invitation_id: invitation.id,
    prenom: String(prenom).slice(0, 100),
    nom: String(nom).slice(0, 100),
    email: String(email).toLowerCase().slice(0, 255),
    telephone: telephone ? String(telephone).slice(0, 50) : null,
    presence,
    nb_personnes: nbPersonnes,
    accompagnants_prenoms: accompagnantsPrenoms,
    regime_alimentaire: regime_alimentaire ? String(regime_alimentaire).slice(0, 200) : null,
    message: message ? String(message).slice(0, 1000) : null,
    ip_address: ip,
  }).select('id').single();

  if (insertErr) {
    console.error('[rsvp] insert error:', insertErr.message);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
  }

  // Auto-add to wedding_guests when guest confirms attendance
  if (presence && rsvpInserted?.id && (invitation as any).marie_id) {
    const marieId = (invitation as any).marie_id;
    const prenomStr = String(prenom).slice(0, 100);
    const nomStr = String(nom).slice(0, 100);

    const guestRows = [
      {
        marie_id: marieId,
        prenom: prenomStr,
        nom: nomStr,
        email: String(email).toLowerCase().slice(0, 255),
        telephone: telephone ? String(telephone).slice(0, 50) : null,
        presence_confirmee: true,
        source: 'rsvp',
        rsvp_response_id: rsvpInserted.id,
      },
      ...accompagnantsPrenoms.map(prenomAccomp => ({
        marie_id: marieId,
        prenom: prenomAccomp,
        nom: `(avec ${prenomStr} ${nomStr})`,
        email: null as null,
        telephone: null as null,
        presence_confirmee: true,
        source: 'rsvp_accompagnant',
        rsvp_response_id: rsvpInserted.id,
      })),
    ];

    const { error: guestErr } = await supabase.from('wedding_guests').insert(guestRows);
    if (guestErr) {
      console.error('[rsvp] wedding_guests insert error:', JSON.stringify(guestErr));
    } else {
      console.log(`[rsvp] ${guestRows.length} invité(s) insérés (1 principal + ${accompagnantsPrenoms.length} accompagnants)`);
    }
  } else {
    console.log('[rsvp] skip wedding_guest insert — presence:', presence, 'marie_id:', (invitation as any).marie_id, 'rsvp_id:', rsvpInserted?.id);
  }

  // Send email notification to the couple (fire-and-forget)
  if (process.env.RESEND_API_KEY) {
    const marie = Array.isArray(invitation.maries) ? invitation.maries[0] : (invitation.maries as any);
    const config = (invitation.config as Record<string, string | undefined>) ?? {};
    const couplePrenom1 = config.prenom_marie1 ?? marie?.prenom_marie1 ?? '';
    const couplePrenom2 = config.prenom_marie2 ?? marie?.prenom_marie2 ?? null;
    const coupleNames = couplePrenom2 ? `${couplePrenom1} & ${couplePrenom2}` : couplePrenom1 || invitation.titre;

    try {
      const { data: userData } = await supabase.auth.admin.getUserById(marie?.user_id);
      const coupleEmail = userData?.user?.email;

      if (coupleEmail) {
        sendRsvpNotificationEmail({
          coupleEmail,
          coupleNames,
          guestPrenom: String(prenom),
          guestNom: String(nom),
          guestEmail: String(email),
          presence,
          nbPersonnes,
          regimeAlimentaire: regime_alimentaire ? String(regime_alimentaire) : null,
          message: message ? String(message) : null,
          invitationSlug: slug,
        }).catch(err => console.error('[rsvp] email error:', err));
      }
    } catch (emailErr) {
      console.error('[rsvp] email fetch error:', emailErr);
    }
  }

  return NextResponse.json({ ok: true });
}
