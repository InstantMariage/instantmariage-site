export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://instantmariage.fr';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitationId, montant, nom, email, message } = body as {
      invitationId: string;
      montant: number;
      nom: string;
      email: string;
      message?: string;
    };

    // Validation de base
    if (!invitationId || !montant || !nom || !email) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const montantCents = Math.round(montant * 100);
    if (montantCents < 500) {
      return NextResponse.json({ error: 'Montant minimum : 5 €' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Récupère l'invitation et vérifie que la cagnotte est active
    const { data: inv, error: invErr } = await supabase
      .from('invitations')
      .select('id, slug, marie_id, cagnotte_active, cagnotte_titre, config')
      .eq('id', invitationId)
      .eq('statut', 'publie')
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 });
    }
    if (!inv.cagnotte_active) {
      return NextResponse.json({ error: 'Cagnotte non active' }, { status: 400 });
    }

    // Nettoyage des contributions "pending" de plus de 30 minutes pour cette invitation
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    await supabase
      .from('cagnotte_contributions')
      .delete()
      .eq('invitation_id', invitationId)
      .eq('statut', 'pending')
      .lt('created_at', thirtyMinutesAgo);

    const config = (inv.config as Record<string, string>) ?? {};
    const coupleNames = config.coupleNames ?? 'Les mariés';
    const cagnotteTitre = (inv.cagnotte_titre as string) ?? 'Cagnotte mariage';

    // Crée la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: montantCents,
          product_data: {
            name: `${cagnotteTitre} — ${coupleNames}`,
            description: `Cadeau de mariage pour ${coupleNames}`,
          },
        },
        quantity: 1,
      }],
      customer_email: email,
      success_url: `${SITE_URL}/invitation/${inv.slug}?cadeau=merci`,
      cancel_url: `${SITE_URL}/invitation/${inv.slug}`,
      locale: 'fr',
      metadata: {
        product_type: 'cagnotte',
        invitation_id: invitationId,
        marie_id: inv.marie_id,
        contributeur_nom: nom,
        contributeur_email: email,
        montant_cents: String(montantCents),
      },
    });

    // Enregistre la contribution en statut pending
    const { error: insertErr } = await supabase.from('cagnotte_contributions').insert({
      invitation_id: invitationId,
      marie_id: inv.marie_id,
      contributeur_nom: nom,
      contributeur_email: email,
      montant_cents: montantCents,
      message: message ?? null,
      stripe_session_id: session.id,
      statut: 'pending',
    });

    if (insertErr) {
      console.error('[cagnotte/checkout] Erreur INSERT contribution:', insertErr);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[cagnotte/checkout] Erreur:', err);
    return NextResponse.json(
      { error: 'Erreur interne', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
