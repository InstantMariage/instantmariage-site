import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import RsvpForm from './RsvpForm';
import CagnotteSection from './CagnotteSection';
import EleganceDoreeInteractive from '@/components/faire-part/EleganceDoreeInteractive';
import BohemeChampetreInteractive from '@/components/faire-part/BohemeChampetreInteractive';
import ModerneMinimalInteractive from '@/components/faire-part/ModerneMinimalInteractive';
import LuxeMarbreInteractive from '@/components/faire-part/LuxeMarbreInteractive';
import RomantiqueFloralInteractive from '@/components/faire-part/RomantiqueFloralInteractive';
import CoteAzurInteractive from '@/components/faire-part/CoteAzurInteractive';
import ProvenceOlivierInteractive from '@/components/faire-part/ProvenceOlivierInteractive';
import NuitEtoileeInteractive from '@/components/faire-part/NuitEtoileeInteractive';
import JardinJaponaisInteractive from '@/components/faire-part/JardinJaponaisInteractive';
import { OrnamentalFrameWrapper } from '@/components/faire-part/OrnamentalFrame';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchInvitation(slug: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('invitations')
    .select(`
      id, slug, titre, config, rsvp_actif, rsvp_deadline, apercu_url,
      cagnotte_active, cagnotte_titre, cagnotte_message, cagnotte_objectif_cents,
      maries!marie_id(prenom_marie1, prenom_marie2, date_mariage, lieu_mariage),
      invitation_templates!template_id(slug)
    `)
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

async function fetchCagnotteTotal(invitationId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('cagnotte_contributions')
    .select('montant_cents')
    .eq('invitation_id', invitationId)
    .eq('statut', 'paye');
  if (!data) return 0;
  return data.reduce((acc, r) => acc + (r.montant_cents as number), 0);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const invitation = await fetchInvitation(params.slug);
  if (!invitation) return { title: 'Faire-part de mariage' };

  const marie = Array.isArray(invitation.maries) ? invitation.maries[0] : invitation.maries as any;
  const config = (invitation.config as Record<string, string>) ?? {};
  const prenom1 = config.prenomMariee ?? config.prenom_marie1 ?? marie?.prenom_marie1 ?? '';
  const prenom2 = config.prenomMarie ?? config.prenom_marie2 ?? marie?.prenom_marie2 ?? null;
  const names = prenom2 ? `${prenom1} & ${prenom2}` : prenom1 || 'Notre Mariage';

  return {
    title: `Faire-part de ${names}`,
    description: `Vous êtes invité(e) au mariage de ${names}. Confirmez votre présence en ligne.`,
    openGraph: {
      title: `Faire-part de ${names}`,
      description: `Vous êtes invité(e) au mariage de ${names}.`,
      ...(invitation.apercu_url ? { images: [{ url: invitation.apercu_url }] } : {}),
    },
  };
}

export default async function InvitationPage({ params }: { params: Params }) {
  const invitation = await fetchInvitation(params.slug);
  if (!invitation) notFound();

  const marie = Array.isArray(invitation.maries) ? invitation.maries[0] : invitation.maries as any;
  const config = (invitation.config as Record<string, string | undefined>) ?? {};
  const tpl = Array.isArray(invitation.invitation_templates)
    ? invitation.invitation_templates[0]
    : (invitation.invitation_templates as any);
  const templateSlug: string = tpl?.slug ?? '';

  const prenom1 = config.prenomMariee ?? config.prenom_marie1 ?? marie?.prenom_marie1 ?? '';
  const prenom2 = config.prenomMarie ?? config.prenom_marie2 ?? marie?.prenom_marie2 ?? null;
  const coupleNames = prenom2 ? `${prenom1} & ${prenom2}` : prenom1 || invitation.titre;

  const dateMariage = config.dateMariage ?? config.date_mariage ?? marie?.date_mariage ?? null;
  const lieuMariage = config.lieu ?? config.lieu_mariage ?? marie?.lieu_mariage ?? null;
  const dateFormatted = config.date ?? (dateMariage ? formatDate(dateMariage) : '');
  const couleurPrimaire = config.accentColor ?? config.couleur_primaire ?? '#C9A84C';

  const isRsvpOpen =
    invitation.rsvp_actif &&
    (!invitation.rsvp_deadline || new Date(invitation.rsvp_deadline) >= new Date());

  // Cagnotte data
  const cagnotteActive = Boolean((invitation as any).cagnotte_active);
  const cagnotteTitre = (invitation as any).cagnotte_titre as string ?? 'Notre voyage de noces';
  const cagnotteMessage = (invitation as any).cagnotte_message as string ?? '';
  const cagnotteObjectifCents = (invitation as any).cagnotte_objectif_cents as number | null ?? null;
  const totalCagnotteCents = cagnotteActive ? await fetchCagnotteTotal(invitation.id) : 0;

  // Shared props for all interactive templates
  const interactiveProps = {
    coupleNames,
    date: dateFormatted,
    lieu: lieuMariage ?? '',
    message: config.message,
    rsvpActif: isRsvpOpen,
    rsvpDeadline: invitation.rsvp_deadline ?? null,
    rsvpSlug: isRsvpOpen ? invitation.slug : undefined,
  };

  // Composant cagnotte flottant (commun à tous les templates)
  const cagnotteNode = cagnotteActive ? (
    <Suspense>
      <CagnotteSection
        invitationId={invitation.id}
        slug={invitation.slug}
        titre={cagnotteTitre}
        message={cagnotteMessage}
        objectifCents={cagnotteObjectifCents}
        totalCents={totalCagnotteCents}
        coupleNames={coupleNames}
      />
    </Suspense>
  ) : null;

  // ── Élégance Dorée ────────────────────────────────────────────────────────
  if (templateSlug === 'elegance-doree') {
    return (
      <>
        <div style={{ position: 'relative' }}>
          <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />
          <EleganceDoreeInteractive {...interactiveProps} />
        </div>
        {cagnotteNode}
      </>
    );
  }

  // ── Bohème Champêtre ──────────────────────────────────────────────────────
  if (templateSlug === 'boheme-champetre') {
    return <>{<BohemeChampetreInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Moderne Minimal ───────────────────────────────────────────────────────
  if (templateSlug === 'moderne-minimal') {
    return <>{<ModerneMinimalInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Luxe Marbre ───────────────────────────────────────────────────────────
  if (templateSlug === 'luxe-marbre') {
    return <>{<LuxeMarbreInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Romantique Floral ─────────────────────────────────────────────────────
  if (templateSlug === 'romantique-floral') {
    return <>{<RomantiqueFloralInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Côte d'Azur ───────────────────────────────────────────────────────────
  if (templateSlug === 'cote-dazur') {
    return <>{<CoteAzurInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Provence Olivier ──────────────────────────────────────────────────────
  if (templateSlug === 'provence-olivier') {
    return <>{<ProvenceOlivierInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Nuit Étoilée ──────────────────────────────────────────────────────────
  if (templateSlug === 'nuit-etoilee') {
    return <>{<NuitEtoileeInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Jardin Japonais ───────────────────────────────────────────────────────
  if (templateSlug === 'jardin-japonais') {
    return <>{<JardinJaponaisInteractive {...interactiveProps} />}{cagnotteNode}</>;
  }

  // ── Layout classique pour les autres templates ────────────────────────────
  const videoUrl = config.video_url ?? invitation.apercu_url ?? null;

  return (
    <>
      <OrnamentalFrameWrapper>
        <main className="bg-white w-full">
          {/* ── Video hero ── */}
          {videoUrl ? (
            <section className="relative w-full overflow-hidden bg-black" style={{ maxHeight: '75vh' }}>
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full object-cover"
                style={{ maxHeight: '75vh' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 bg-gradient-to-t from-black/60 via-transparent to-transparent px-4">
                <h1 className="text-white font-serif text-center drop-shadow-lg" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>
                  {coupleNames}
                </h1>
              </div>
            </section>
          ) : (
            <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 text-center px-4">
              <div className="max-w-lg mx-auto">
                <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase mb-4">Vous êtes invité(e)</p>
                <h1 className="font-serif text-rose-700 mb-4" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)' }}>
                  {coupleNames}
                </h1>
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-px flex-1 max-w-16 bg-rose-300" />
                  <span className="text-rose-400 text-lg">♥</span>
                  <div className="h-px flex-1 max-w-16 bg-rose-300" />
                </div>
              </div>
            </section>
          )}

          {/* ── Date & Lieu ── */}
          {(dateMariage || lieuMariage) && (
            <section className="py-10 px-4 bg-rose-50 text-center">
              <div className="max-w-sm mx-auto space-y-2">
                {dateFormatted && (
                  <p className="text-rose-700 font-medium capitalize" style={{ fontSize: '1.1rem' }}>
                    {dateFormatted}
                  </p>
                )}
                {lieuMariage && (
                  <p className="text-gray-500 text-base flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {lieuMariage}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ── RSVP ── */}
          <section className="py-12 px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-serif text-gray-800 mb-2" style={{ fontSize: '1.75rem' }}>
                  Confirmer ma présence
                </h2>
                <p className="text-gray-400 text-sm">Merci de répondre avant que la magie ne commence&nbsp;✨</p>
                {invitation.rsvp_deadline && (
                  <p className="mt-2 text-xs text-rose-500 font-medium">
                    Réponse souhaitée avant le {formatDate(invitation.rsvp_deadline)}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
                {isRsvpOpen ? (
                  <RsvpForm slug={invitation.slug} couleurPrimaire={couleurPrimaire} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Les confirmations de présence sont désormais fermées.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="py-8 text-center">
            <p className="text-xs text-gray-300">
              Faire-part créé avec{' '}
              <a href="https://instantmariage.fr" className="text-rose-300 hover:text-rose-400 transition">
                InstantMariage.fr
              </a>
            </p>
          </footer>
        </main>
      </OrnamentalFrameWrapper>
      {cagnotteNode}
    </>
  );
}
