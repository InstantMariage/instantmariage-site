export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Params = { invitationId: string; responseId: string };

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Variables Supabase manquantes');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { invitationId, responseId } = params;

  // Extraire le JWT depuis le header Authorization
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Vérifier le token et récupérer l'utilisateur
  const { data: { user }, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'invitation appartient bien au marié connecté
  const { data: invitation } = await admin
    .from('invitations')
    .select('id, maries!marie_id(user_id)')
    .eq('id', invitationId)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 });
  }

  const marie = Array.isArray((invitation as any).maries)
    ? (invitation as any).maries[0]
    : (invitation as any).maries;

  if (!marie || marie.user_id !== user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Supprimer d'abord la référence dans wedding_guests
  await admin
    .from('wedding_guests')
    .delete()
    .eq('rsvp_response_id', responseId);

  // Supprimer la réponse RSVP (contrainte sur invitation_id pour sécurité)
  const { error } = await admin
    .from('rsvp_responses')
    .delete()
    .eq('id', responseId)
    .eq('invitation_id', invitationId);

  if (error) {
    console.error('[rsvp-delete] error:', error.message);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
