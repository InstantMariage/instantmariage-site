'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import EleganceDoreeInteractive from '@/components/faire-part/EleganceDoreeInteractive';

// ─── Template config ─────────────────────────────────────────────────────────

const TEMPLATES: Record<string, {
  name: string;
  style: string;
  accentColor: string;
  hasPlayer: boolean;
  preview: { bg: string; textColor: string; borderColor: string };
}> = {
  'elegance-doree': {
    name: 'Élégance Dorée',
    style: 'Classique & Raffiné',
    accentColor: '#C9A84C',
    hasPlayer: true,
    preview: { bg: 'from-amber-50 via-yellow-50 to-amber-100', textColor: 'text-amber-900', borderColor: '#C9A84C' },
  },
  'boheme-champetre': {
    name: 'Bohème Champêtre',
    style: 'Nature & Bohème',
    accentColor: '#6B8F71',
    hasPlayer: false,
    preview: { bg: 'from-stone-100 via-green-50 to-emerald-100', textColor: 'text-stone-700', borderColor: '#6B8F71' },
  },
  'moderne-minimal': {
    name: 'Moderne Minimal',
    style: 'Épuré & Contemporain',
    accentColor: '#1a1a1a',
    hasPlayer: false,
    preview: { bg: 'from-white via-gray-50 to-slate-100', textColor: 'text-gray-900', borderColor: '#1a1a1a' },
  },
  'luxe-marbre': {
    name: 'Luxe Marbré',
    style: 'Luxe & Sophistiqué',
    accentColor: '#8B7355',
    hasPlayer: false,
    preview: { bg: 'from-slate-100 via-gray-100 to-zinc-200', textColor: 'text-zinc-800', borderColor: '#8B7355' },
  },
  'romantique-floral': {
    name: 'Romantique Floral',
    style: 'Romantique & Fleuri',
    accentColor: '#F06292',
    hasPlayer: false,
    preview: { bg: 'from-pink-50 via-rose-50 to-fuchsia-50', textColor: 'text-rose-700', borderColor: '#F06292' },
  },
  'cote-dazur': {
    name: "Côte d'Azur",
    style: 'Méditerranéen & Lumineux',
    accentColor: '#0284C7',
    hasPlayer: false,
    preview: { bg: 'from-sky-100 via-blue-100 to-cyan-100', textColor: 'text-sky-800', borderColor: '#0284C7' },
  },
  'provence-olivier': {
    name: 'Provence Olivier',
    style: 'Provençal & Authentique',
    accentColor: '#6B7C45',
    hasPlayer: false,
    preview: { bg: 'from-violet-50 via-purple-50 to-lime-50', textColor: 'text-purple-800', borderColor: '#6B7C45' },
  },
  'nuit-etoilee': {
    name: 'Nuit Étoilée',
    style: 'Mystique & Romantique',
    accentColor: '#C9A96E',
    hasPlayer: false,
    preview: { bg: 'from-indigo-900 via-violet-900 to-slate-900', textColor: 'text-indigo-100', borderColor: '#C9A96E' },
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function formatDateFr(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${parseInt(day)} ${MONTHS_FR[parseInt(month) - 1]} ${year}`;
}

const INPUT_CLS =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-200 bg-white';

// ─── Static preview (for templates without Remotion comp) ─────────────────────

function StaticPreview({
  template,
  coupleNames,
  dateFormatted,
  lieu,
  message,
}: {
  template: (typeof TEMPLATES)[string];
  coupleNames: string;
  dateFormatted: string;
  lieu: string;
  message: string;
}) {
  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-br ${template.preview.bg} flex flex-col items-center justify-center p-8 gap-4 shadow-xl min-h-[380px]`}
      style={{ border: `2px solid ${template.preview.borderColor}22` }}
    >
      <div className="text-center">
        <p className={`text-xs uppercase tracking-widest mb-2 opacity-60 ${template.preview.textColor}`}>Mariage</p>
        <p
          className={`text-2xl font-bold ${template.preview.textColor}`}
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          {coupleNames}
        </p>
        <div className="my-3 flex items-center justify-center gap-2">
          <div className="h-px w-10 opacity-40" style={{ background: template.accentColor }} />
          <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ background: template.accentColor }} />
          <div className="h-px w-10 opacity-40" style={{ background: template.accentColor }} />
        </div>
        {message && (
          <p className={`text-xs italic mb-3 opacity-75 max-w-[240px] leading-relaxed ${template.preview.textColor}`}>{message}</p>
        )}
        {dateFormatted && (
          <p className={`text-sm font-semibold ${template.preview.textColor}`} style={{ color: template.accentColor }}>
            {dateFormatted}
          </p>
        )}
        {lieu && (
          <p className={`text-xs mt-1 opacity-60 ${template.preview.textColor}`}>{lieu}</p>
        )}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <span
          className="text-xs px-3 py-1 rounded-full font-medium opacity-70"
          style={{ background: `${template.accentColor}22`, color: template.accentColor }}
        >
          Animation bientôt disponible
        </span>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2.5">
        <span
          className="inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: '#F06292' }}
        >
          {number}
        </span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FairePartEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');
  const templateId = params.templateId as string;
  const template = TEMPLATES[templateId];

  const [draftInvitationId, setDraftInvitationId] = useState<string | null>(draftId);

  const [form, setForm] = useState({
    prenomMariee: '',
    prenomMarie: '',
    dateMariage: '',
    lieu: '',
    message: 'Nous vous invitons à célébrer notre union',
    rsvpDeadline: '',
    emailContact: '',
  });

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [invitationSlug, setInvitationSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session && draftId) {
        // Charger le brouillon existant depuis Supabase
        const { data: inv } = await supabase
          .from('invitations')
          .select('id, slug, config, rsvp_actif, rsvp_deadline')
          .eq('id', draftId)
          .maybeSingle();
        if (inv?.config) {
          const c = inv.config as Record<string, string>;
          setForm((prev) => ({
            ...prev,
            prenomMariee: c.prenomMariee ?? prev.prenomMariee,
            prenomMarie: c.prenomMarie ?? prev.prenomMarie,
            dateMariage: c.dateMariage ?? prev.dateMariage,
            lieu: c.lieu ?? prev.lieu,
            message: c.message ?? prev.message,
            emailContact: c.emailContact ?? prev.emailContact,
            rsvpDeadline: inv.rsvp_deadline ?? prev.rsvpDeadline,
          }));
          setDraftInvitationId(inv.id);
          setInvitationSlug(inv.slug);
          setToast({ type: 'success', message: 'Brouillon chargé — continuez votre faire-part !' });
        }
      } else if (session && templateId) {
        const key = `faire-part-draft-${templateId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setForm((prev) => ({ ...prev, ...parsed }));
            setToast({ type: 'success', message: 'Votre formulaire a été restauré !' });
          } catch {}
          localStorage.removeItem(key);
        }
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s && !draftId && templateId) {
        const key = `faire-part-draft-${templateId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setForm((prev) => ({ ...prev, ...parsed }));
            setToast({ type: 'success', message: 'Votre formulaire a été restauré !' });
          } catch {}
          localStorage.removeItem(key);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [templateId, draftId]);

  useEffect(() => {
    if (template === undefined && templateId) router.replace('/faire-part');
  }, [template, templateId, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const setField = useCallback((field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Derived display values (with fallback for preview)
  const coupleNames =
    [form.prenomMariee, form.prenomMarie].filter(Boolean).join(' & ') || 'Sophie & Antoine';
  const dateFormatted = form.dateMariage ? formatDateFr(form.dateMariage) : '14 Juin 2025';
  const lieuDisplay = form.lieu || 'Château de Versailles, Paris';
  const messageDisplay = form.message || 'Nous vous invitons à célébrer notre union';

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!session) {
      localStorage.setItem(`faire-part-draft-${templateId}`, JSON.stringify(form));
      router.push(`/login?redirect=/faire-part/${templateId}`);
      return;
    }
    if (!form.prenomMariee || !form.prenomMarie) {
      setToast({ type: 'error', message: 'Veuillez indiquer les prénoms des mariés' });
      return;
    }
    if (!form.dateMariage) {
      setToast({ type: 'error', message: 'Veuillez indiquer la date du mariage' });
      return;
    }

    setSaving(true);
    try {
      const { data: marie, error: marieErr } = await supabase
        .from('maries')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (marieErr || !marie) throw new Error('Profil marié introuvable. Créez votre profil dans le dashboard.');

      const { data: tpl } = await supabase
        .from('invitation_templates')
        .select('id')
        .eq('slug', templateId)
        .maybeSingle();

      // template_id is nullable — save proceeds even if slug not yet seeded in DB
      const templateDbId = tpl?.id ?? null;

      const { data: slugFromRpc } = await supabase.rpc('generate_invitation_slug', {
        p_prenom1: form.prenomMariee || null,
        p_prenom2: form.prenomMarie || null,
      });
      const slug = slugFromRpc || `invitation-${crypto.randomUUID().slice(0, 8)}`;

      const config = {
        coupleNames,
        prenomMariee: form.prenomMariee,
        prenomMarie: form.prenomMarie,
        date: dateFormatted,
        dateMariage: form.dateMariage,
        lieu: form.lieu,
        message: form.message,
        emailContact: form.emailContact,
        accentColor: template.accentColor,
      };

      let saveErr;
      if (draftInvitationId) {
        // Mise à jour du brouillon existant
        const { error } = await supabase.from('invitations').update({
          titre: `${coupleNames} — ${dateFormatted}`,
          config,
          rsvp_actif: !!form.rsvpDeadline,
          rsvp_deadline: form.rsvpDeadline || null,
          updated_at: new Date().toISOString(),
        }).eq('id', draftInvitationId);
        saveErr = error;
      } else {
        const { error } = await supabase.from('invitations').insert({
          marie_id: marie.id,
          template_id: templateDbId,
          slug,
          titre: `${coupleNames} — ${dateFormatted}`,
          config,
          rsvp_actif: !!form.rsvpDeadline,
          rsvp_deadline: form.rsvpDeadline || null,
          statut: 'brouillon',
        });
        saveErr = error;
      }

      if (saveErr) throw saveErr;

      setToast({ type: 'success', message: 'Faire-part sauvegardé en brouillon !' });
      setTimeout(() => router.push('/dashboard/marie/faire-parts'), 1800);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  // ── Publish ─────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    setShowPublishConfirm(false);
    if (!session) {
      localStorage.setItem(`faire-part-draft-${templateId}`, JSON.stringify(form));
      router.push(`/login?redirect=/faire-part/${templateId}`);
      return;
    }
    if (!form.prenomMariee || !form.prenomMarie) {
      setToast({ type: 'error', message: 'Veuillez indiquer les prénoms des mariés' });
      return;
    }
    if (!form.dateMariage) {
      setToast({ type: 'error', message: 'Veuillez indiquer la date du mariage' });
      return;
    }

    setPublishing(true);
    try {
      const { data: marie, error: marieErr } = await supabase
        .from('maries')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (marieErr || !marie) throw new Error('Profil marié introuvable. Créez votre profil dans le dashboard.');

      const config = {
        coupleNames,
        prenomMariee: form.prenomMariee,
        prenomMarie: form.prenomMarie,
        date: dateFormatted,
        dateMariage: form.dateMariage,
        lieu: form.lieu,
        message: form.message,
        emailContact: form.emailContact,
        accentColor: template.accentColor,
      };

      let finalSlug: string | null = null;

      if (draftInvitationId) {
        const { error: updateErr } = await supabase.from('invitations').update({
          titre: `${coupleNames} — ${dateFormatted}`,
          config,
          rsvp_actif: !!form.rsvpDeadline,
          rsvp_deadline: form.rsvpDeadline || null,
          statut: 'publie',
          updated_at: new Date().toISOString(),
        }).eq('id', draftInvitationId);
        if (updateErr) throw updateErr;

        const { data: fetched, error: fetchErr } = await supabase
          .from('invitations')
          .select('slug')
          .eq('id', draftInvitationId)
          .single();
        if (fetchErr) throw fetchErr;
        finalSlug = fetched.slug;
      } else {
        const { data: tpl } = await supabase
          .from('invitation_templates')
          .select('id')
          .eq('slug', templateId)
          .maybeSingle();

        const { data: slugFromRpc } = await supabase.rpc('generate_invitation_slug', {
          p_prenom1: form.prenomMariee || null,
          p_prenom2: form.prenomMarie || null,
        });
        finalSlug = slugFromRpc || `invitation-${crypto.randomUUID().slice(0, 8)}`;

        const { error } = await supabase.from('invitations').insert({
          marie_id: marie.id,
          template_id: tpl?.id ?? null,
          slug: finalSlug,
          titre: `${coupleNames} — ${dateFormatted}`,
          config,
          rsvp_actif: !!form.rsvpDeadline,
          rsvp_deadline: form.rsvpDeadline || null,
          statut: 'publie',
        });
        if (error) throw error;
      }

      if (!finalSlug) throw new Error('Slug introuvable après publication');

      setToast({ type: 'success', message: 'Faire-part publié ! Redirection vers votre invitation…' });
      setTimeout(() => router.push(`/invitation/${finalSlug}`), 1800);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Erreur lors de la publication' });
    } finally {
      setPublishing(false);
    }
  };

  if (!template) return null;

  const isEleganceDoree = templateId === 'elegance-doree';

  return (
    <>
      <Header />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Publish confirmation modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FFF0F5' }}>
                <svg className="w-5 h-5" fill="none" stroke="#E91E8C" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">Publier votre faire-part ?</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Votre faire-part sera accessible à tous via un lien unique. Vos invités pourront le consulter et répondre au RSVP.
            </p>
            <p className="text-xs text-gray-400">Vous pourrez le modifier à tout moment depuis votre dashboard.</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)' }}
              >
                Oui, publier
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-50 pt-20 pb-24 lg:pb-0">

        {/* Breadcrumb + header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Link href="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/faire-part" className="hover:text-gray-600 transition-colors">Faire-part</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">{template.name}</span>
            </nav>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold text-gray-900"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {template.name}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">{template.style}</p>
              </div>
              <Link
                href="/faire-part"
                className="shrink-0 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="hidden sm:inline">Changer de template</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main editor layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">

            {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
            <div className="flex-1 space-y-4 min-w-0">

              {/* Section 1: Les mariés */}
              <FormSection number={1} title="Les mariés">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">Prénom de la mariée</label>
                    <input
                      type="text"
                      placeholder="Sophie"
                      value={form.prenomMariee}
                      onChange={(e) => setField('prenomMariee', e.target.value)}
                      className={INPUT_CLS}
                      maxLength={40}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 font-medium">Prénom du marié</label>
                    <input
                      type="text"
                      placeholder="Antoine"
                      value={form.prenomMarie}
                      onChange={(e) => setField('prenomMarie', e.target.value)}
                      className={INPUT_CLS}
                      maxLength={40}
                    />
                  </div>
                </div>
                {(form.prenomMariee || form.prenomMarie) && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-0.5">
                    <span>Aperçu :</span>
                    <span
                      className="font-semibold text-gray-600 italic"
                      style={{ fontFamily: 'var(--font-playfair), serif', color: template.accentColor }}
                    >
                      {coupleNames}
                    </span>
                  </p>
                )}
              </FormSection>

              {/* Section 2: La cérémonie */}
              <FormSection number={2} title="La cérémonie">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                    Date du mariage <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dateMariage}
                    onChange={(e) => setField('dateMariage', e.target.value)}
                    className={INPUT_CLS}
                  />
                  {form.dateMariage && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <span>Affiché :</span>
                      <span className="font-medium text-gray-600">{dateFormatted}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Lieu de la cérémonie</label>
                  <input
                    type="text"
                    placeholder="Château de Versailles, Paris"
                    value={form.lieu}
                    onChange={(e) => setField('lieu', e.target.value)}
                    className={INPUT_CLS}
                    maxLength={100}
                  />
                </div>
              </FormSection>

              {/* Section 3: Message */}
              <FormSection number={3} title="Message personnalisé">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Message pour vos invités</label>
                  <textarea
                    rows={3}
                    placeholder="Nous vous invitons à célébrer notre union…"
                    value={form.message}
                    onChange={(e) => setField('message', e.target.value)}
                    className={`${INPUT_CLS} resize-none`}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length}/200</p>
                </div>
              </FormSection>

              {/* Section 4: RSVP */}
              <FormSection number={4} title="RSVP & contact">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Date limite RSVP</label>
                  <input
                    type="date"
                    value={form.rsvpDeadline}
                    onChange={(e) => setField('rsvpDeadline', e.target.value)}
                    className={INPUT_CLS}
                  />
                  {form.dateMariage && form.rsvpDeadline && form.rsvpDeadline >= form.dateMariage && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      La date limite RSVP doit être avant le mariage
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Email de contact</label>
                  <input
                    type="email"
                    placeholder="votre@email.fr"
                    value={form.emailContact}
                    onChange={(e) => setField('emailContact', e.target.value)}
                    className={INPUT_CLS}
                  />
                  <p className="text-xs text-gray-400 mt-1">Vos invités pourront vous contacter via cet email</p>
                </div>
              </FormSection>

            </div>

            {/* ── RIGHT: Preview ──────────────────────────────────────────────── */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-24 space-y-4">

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Prévisualisation live
                  </p>
                  {isEleganceDoree && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: `${template.accentColor}18`, color: template.accentColor }}
                    >
                      Animé
                    </span>
                  )}
                </div>

                {isEleganceDoree ? (
                  /* Interactive HTML preview — scaled mobile 390×844 → 240×426 */
                  <div className="flex justify-center">
                    <div
                      className="relative rounded-xl overflow-hidden shadow-lg"
                      style={{ width: 240, height: 426, flexShrink: 0 }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 390,
                          height: 844,
                          transform: 'scale(0.6154)',
                          transformOrigin: 'top left',
                          pointerEvents: 'none',
                        }}
                      >
                        <EleganceDoreeInteractive
                          coupleNames={coupleNames}
                          date={dateFormatted}
                          lieu={lieuDisplay}
                          message={messageDisplay}
                          autoPlay
                          fixedHeight={844}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <StaticPreview
                    template={template}
                    coupleNames={coupleNames}
                    dateFormatted={dateFormatted}
                    lieu={lieuDisplay}
                    message={messageDisplay}
                  />
                )}

                <p className="text-xs text-center text-gray-400 mt-3">
                  Mis à jour en temps réel
                </p>
              </div>

              {/* Info card */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 p-4 space-y-2.5">
                {[
                  { icon: '🔗', text: 'Lien unique partageable généré automatiquement' },
                  { icon: '💌', text: 'Formulaire RSVP intégré pour vos invités' },
                  { icon: '📱', text: 'Optimisé mobile & desktop' },
                  { icon: '📊', text: 'Suivi des réponses dans votre dashboard' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="text-base leading-none mt-0.5">{item.icon}</span>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Save button (desktop panel) */}
              <div className="hidden lg:block">
                <SaveButton
                  saving={saving}
                  publishing={publishing}
                  session={session}
                  accentColor={template.accentColor}
                  onSave={handleSave}
                  onPublish={() => setShowPublishConfirm(true)}
                />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Mobile sticky save bar ──────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 flex gap-2">
        <Link
          href="/faire-part"
          className="flex items-center justify-center px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || publishing}
          className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 shrink-0"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="hidden xs:inline">Brouillon</span>
        </button>
        <button
          onClick={() => setShowPublishConfirm(true)}
          disabled={saving || publishing}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
          style={{ background: publishing ? '#9C27B0aa' : 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)' }}
        >
          {publishing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              Publication…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              {session ? 'Publier' : 'Connexion pour publier'}
            </>
          )}
        </button>
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}

// ─── Save button component ────────────────────────────────────────────────────

function SaveButton({
  saving,
  publishing,
  session,
  accentColor,
  onSave,
  onPublish,
}: {
  saving: boolean;
  publishing: boolean;
  session: any;
  accentColor: string;
  onSave: () => void;
  onPublish: () => void;
}) {
  const busy = saving || publishing;
  return (
    <div className="space-y-2.5">
      {/* Publish — primary CTA */}
      <button
        onClick={onPublish}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0"
        style={{
          background: publishing
            ? '#9C27B0aa'
            : 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)',
        }}
      >
        {publishing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            Publication en cours…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            {session ? 'Publier le faire-part' : 'Se connecter pour publier'}
          </>
        )}
      </button>

      {/* Save draft — secondary */}
      <button
        onClick={onSave}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        {saving ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
            Sauvegarde…
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {session ? 'Sauvegarder en brouillon' : 'Se connecter pour sauvegarder'}
          </>
        )}
      </button>

      {!session && (
        <p className="text-xs text-center text-gray-400">
          Vous serez redirigé vers la connexion
        </p>
      )}
    </div>
  );
}
