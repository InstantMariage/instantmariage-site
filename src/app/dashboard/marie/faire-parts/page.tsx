"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

/* ─────────────────── Types ─────────────────── */
type Statut = "brouillon" | "publie" | "archive";

interface Template {
  id: string;
  nom: string;
  slug: string;
  categorie: string;
  plan_requis: string;
}

interface RsvpStats {
  total_reponses: number;
  nb_presences: number;
  nb_absences: number;
  nb_personnes: number;
}

interface CagnotteContribution {
  contributeur_nom: string;
  montant_cents: number;
  message: string | null;
  created_at: string;
}

interface Invitation {
  id: string;
  slug: string;
  titre: string;
  statut: Statut;
  rsvp_actif: boolean;
  rsvp_deadline: string | null;
  apercu_url: string | null;
  created_at: string;
  updated_at: string;
  template: Template | null;
  rsvpStats: RsvpStats | null;
  cagnotte_active: boolean;
  cagnotte_titre: string | null;
  cagnotte_objectif_cents: number | null;
  cagnotteTotal: number;
  cagnotteContributions: CagnotteContribution[];
}

/* ─────────────────── Icônes ─────────────────── */
const IconBack = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconLink = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconCopy = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconTable = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 6v12M21 6v12M3 18h18M8 6v12M16 6v12" />
  </svg>
);

/* ─────────────────── Helpers ─────────────────── */
const STATUT_LABEL: Record<Statut, string> = {
  brouillon: "Brouillon",
  publie: "Publié",
  archive: "Archivé",
};

const STATUT_STYLE: Record<Statut, { bg: string; color: string }> = {
  brouillon: { bg: "#F3F4F6", color: "#6B7280" },
  publie: { bg: "#D1FAE5", color: "#065F46" },
  archive: { bg: "#FEF3C7", color: "#92400E" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

/* ─────────────────── Templates gallery data ─────────────────── */
const GALLERY_TEMPLATES = [
  { id: "elegance-doree", name: "Élégance Dorée", tag: "Populaire", tagColor: { bg: "#FEF3C7", color: "#92400E" }, accent: "#C9A96E", bg: "from-amber-50 via-yellow-50 to-amber-100" },
  { id: "boheme-champetre", name: "Bohème Champêtre", tag: "Tendance", tagColor: { bg: "#D1FAE5", color: "#065F46" }, accent: "#6B8F71", bg: "from-stone-100 via-green-50 to-emerald-100" },
  { id: "moderne-minimal", name: "Moderne Minimal", tag: "Nouveau", tagColor: { bg: "#F3F4F6", color: "#6B7280" }, accent: "#1a1a1a", bg: "from-white via-gray-50 to-slate-100" },
  { id: "luxe-marbre", name: "Luxe Marbré", tag: "Premium", tagColor: { bg: "#FFE4E6", color: "#9F1239" }, accent: "#8B7355", bg: "from-slate-100 via-gray-100 to-zinc-200" },
  { id: "romantique-floral", name: "Romantique Floral", tag: "Populaire", tagColor: { bg: "#FCE7F3", color: "#9D174D" }, accent: "#F06292", bg: "from-pink-50 via-rose-50 to-fuchsia-50" },
  { id: "cote-dazur", name: "Côte d'Azur", tag: "Exclusif", tagColor: { bg: "#DBEAFE", color: "#1E40AF" }, accent: "#0284C7", bg: "from-sky-100 via-blue-100 to-cyan-100" },
  { id: "provence-olivier", name: "Provence Olivier", tag: "Tendance", tagColor: { bg: "#EDE9FE", color: "#5B21B6" }, accent: "#6B7C45", bg: "from-violet-50 via-purple-50 to-lime-50" },
  { id: "nuit-etoilee", name: "Nuit Étoilée", tag: "Nouveau", tagColor: { bg: "#E0E7FF", color: "#3730A3" }, accent: "#C9A96E", bg: "from-indigo-900 via-violet-900 to-slate-900" },
];

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

/* ─────────────────── Page ─────────────────── */
export default function FairePartsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showChangeTemplate, setShowChangeTemplate] = useState(false);
  const [changingTemplate, setChangingTemplate] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      // Récupérer le marie_id
      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!marie) {
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      // Charger les invitations avec leurs templates
      const { data: invData } = await supabase
        .from("invitations")
        .select(`
          id, slug, titre, statut, rsvp_actif, rsvp_deadline, apercu_url, created_at, updated_at,
          cagnotte_active, cagnotte_titre, cagnotte_objectif_cents,
          invitation_templates (id, nom, slug, categorie, plan_requis)
        `)
        .eq("marie_id", marie.id)
        .order("updated_at", { ascending: false });

      if (invData && invData.length > 0) {
        // Charger les stats RSVP pour chaque invitation
        const withStats: Invitation[] = await Promise.all(
          invData.map(async (inv) => {
            const { data: stats } = await supabase.rpc("get_rsvp_stats", {
              p_invitation_id: inv.id,
            });
            const rsvpStats = stats && stats[0]
              ? {
                  total_reponses: Number(stats[0].total_reponses),
                  nb_presences: Number(stats[0].nb_presences),
                  nb_absences: Number(stats[0].nb_absences),
                  nb_personnes: Number(stats[0].nb_personnes),
                }
              : null;

            const tpl = inv.invitation_templates as unknown as Template | null;

            // Cagnotte contributions
            let cagnotteTotal = 0;
            let cagnotteContributions: CagnotteContribution[] = [];
            if ((inv as any).cagnotte_active) {
              const { data: contribs } = await supabase
                .from("cagnotte_contributions")
                .select("contributeur_nom, montant_cents, message, created_at")
                .eq("invitation_id", inv.id)
                .eq("statut", "paye")
                .order("created_at", { ascending: false });
              if (contribs) {
                cagnotteContributions = contribs as CagnotteContribution[];
                cagnotteTotal = contribs.reduce((acc, c) => acc + c.montant_cents, 0);
              }
            }

            return {
              id: inv.id,
              slug: inv.slug,
              titre: inv.titre,
              statut: inv.statut as Statut,
              rsvp_actif: inv.rsvp_actif,
              rsvp_deadline: inv.rsvp_deadline,
              apercu_url: inv.apercu_url,
              created_at: inv.created_at,
              updated_at: inv.updated_at,
              template: tpl,
              rsvpStats,
              cagnotte_active: Boolean((inv as any).cagnotte_active),
              cagnotte_titre: (inv as any).cagnotte_titre ?? null,
              cagnotte_objectif_cents: (inv as any).cagnotte_objectif_cents ?? null,
              cagnotteTotal,
              cagnotteContributions,
            };
          })
        );
        setInvitations(withStats);
      }

      setLoading(false);
      setAuthChecked(true);
    });
  }, [router]);

  async function deleteInvitation(inv: Invitation) {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/invitations/${inv.slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  async function copyPublicLink(slug: string) {
    const url = `${window.location.origin}/invitation/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  async function handleChangeTemplate(templateSlug: string) {
    if (invitations.length === 0) return;
    setChangingTemplate(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const inv = invitations[0];
      const res = await fetch("/api/invitations/change-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ invitationId: inv.id, templateSlug }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("[handleChangeTemplate] Erreur API:", json);
        return;
      }

      setShowChangeTemplate(false);
      router.refresh();
      router.push(`/faire-part/${templateSlug}?draft=${inv.id}`);
    } finally {
      setChangingTemplate(false);
    }
  }

  if (!authChecked) return null;

  return (
    <main className="min-h-screen" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-24">
        {/* ── Hero ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-8 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href="/dashboard/marie"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity mb-6"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <IconBack />
            Tableau de bord
          </Link>
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
            Mes outils
          </p>
          <h1 className="text-3xl font-semibold text-white leading-tight mb-1">Faire-parts animés</h1>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            Créez et partagez votre faire-part digital avec confirmations de présence en ligne
          </p>

          {/* CTA créer ou changer */}
          {invitations.length > 0 ? (
            <button
              onClick={() => setShowChangeTemplate(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "white", color: "#e91e8c" }}
            >
              <IconRefresh />
              Changer de template
            </button>
          ) : (
            <Link
              href="/faire-part"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "white", color: "#e91e8c" }}
            >
              <IconPlus />
              Créer un faire-part
            </Link>
          )}
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-4 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"
                style={{ borderTopColor: "#F06292" }}
              />
            </div>
          ) : invitations.length === 0 ? (
            /* ── État vide ── */
            <div
              className="rounded-3xl p-10 flex flex-col items-center text-center"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <IconMail />
              </div>
              <p className="text-base font-semibold text-gray-800 mb-2">Aucun faire-part pour l&apos;instant</p>
              <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                Créez votre premier faire-part animé et partagez-le avec vos invités en quelques clics.
              </p>
              <Link
                href="/faire-part"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-80"
                style={{ background: "#F06292" }}
              >
                <IconPlus />
                Choisir un modèle
              </Link>
            </div>
          ) : (
            /* ── Liste des faire-parts ── */
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
                {invitations.length} faire-part{invitations.length > 1 ? "s" : ""}
              </p>

              <div className="space-y-3">
                {invitations.map((inv) => {
                  const statutStyle = STATUT_STYLE[inv.statut];
                  const isPublie = inv.statut === "publie";
                  const copied = copiedSlug === inv.slug;

                  return (
                    <div
                      key={inv.id}
                      className="rounded-3xl overflow-hidden"
                      style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                    >
                      {/* ── En-tête carte ── */}
                      <div className="flex items-start gap-4 px-5 pt-5 pb-4">
                        {/* Icône */}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "#FFF0F5", color: "#F06292" }}
                        >
                          <IconMail />
                        </div>

                        {/* Titre + statut */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className="text-base font-semibold text-gray-900 truncate">{inv.titre}</h2>
                            <span
                              className="text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: statutStyle.bg, color: statutStyle.color }}
                            >
                              {STATUT_LABEL[inv.statut]}
                            </span>
                          </div>
                          {inv.template && (
                            <p className="text-xs text-gray-400">
                              {inv.template.nom}
                              {inv.template.plan_requis === "premium" && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: "#FFF0F5", color: "#F06292" }}>
                                  Premium
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-xs text-gray-300 mt-0.5">
                            Modifié le {formatDate(inv.updated_at)}
                          </p>
                        </div>
                      </div>

                      {/* ── Stats RSVP (si publié et données) ── */}
                      {isPublie && inv.rsvpStats !== null && (
                        <div
                          className="mx-5 mb-4 rounded-2xl px-4 py-3 grid grid-cols-3 gap-3"
                          style={{ background: "#FFF0F5" }}
                        >
                          <div className="text-center">
                            <p className="text-xl font-bold tabular-nums" style={{ color: "#F06292" }}>
                              {inv.rsvpStats.total_reponses}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Réponses</p>
                          </div>
                          <div className="text-center" style={{ borderLeft: "1px solid #FECDD3", borderRight: "1px solid #FECDD3" }}>
                            <p className="text-xl font-bold tabular-nums text-emerald-600">
                              {inv.rsvpStats.nb_presences}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Présents</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold tabular-nums text-gray-500">
                              {inv.rsvpStats.nb_absences}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Absents</p>
                          </div>
                        </div>
                      )}

                      {/* ── Stats RSVP vides (si publié mais pas encore de réponses) ── */}
                      {isPublie && inv.rsvpStats !== null && inv.rsvpStats.total_reponses === 0 && (
                        <div className="mx-5 mb-4">
                          <div
                            className="rounded-2xl px-4 py-3 flex items-center gap-2.5"
                            style={{ background: "#F3F4F6" }}
                          >
                            <IconUsers />
                            <p className="text-sm text-gray-400">En attente des premières confirmations de présence</p>
                          </div>
                        </div>
                      )}

                      {/* ── Actions ── */}
                      <div
                        className="flex items-center gap-2 px-5 pb-5"
                        style={{ borderTop: "1px solid #FEE2E2", paddingTop: "14px" }}
                      >
                        {/* Bouton supprimer */}
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:opacity-80"
                          style={{ background: "#FFF0F5", color: "#F06292" }}
                          title="Supprimer ce faire-part"
                        >
                          <IconTrash />
                        </button>
                        {/* Bouton éditer (toujours visible) */}
                        {inv.statut === "brouillon" ? (
                          <Link
                            href={`/faire-part/${inv.template?.slug ?? ""}?draft=${inv.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
                            style={{ background: "#e91e8c", color: "white" }}
                          >
                            <IconEdit />
                            Continuer →
                          </Link>
                        ) : (
                        <Link
                          href={`/faire-part/${inv.template?.slug ?? ""}?draft=${inv.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
                          style={{ background: "#FFF0F5", color: "#F06292" }}
                        >
                          <IconEdit />
                          Modifier
                        </Link>
                        )}

                        {/* Lien public (si publié) */}
                        {isPublie && (
                          <>
                            <Link
                              href={`/invitation/${inv.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
                              style={{ background: "#F06292", color: "white" }}
                            >
                              <IconLink />
                              Voir le faire-part
                            </Link>

                            <button
                              onClick={() => copyPublicLink(inv.slug)}
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:opacity-80"
                              style={{
                                background: copied ? "#D1FAE5" : "#F3F4F6",
                                color: copied ? "#065F46" : "#6B7280",
                              }}
                              title="Copier le lien"
                            >
                              {copied ? <IconCheck /> : <IconCopy />}
                            </button>
                          </>
                        )}
                      </div>

                      {/* ── Lien réponses RSVP (si publié) ── */}
                      {isPublie && (
                        <div className="px-5 pb-5 space-y-2">
                          <Link
                            href={`/dashboard/marie/faire-parts/${inv.id}/rsvp`}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
                            style={{ background: "#FFF0F5", color: "#F06292", border: "1px solid #FECDD3" }}
                          >
                            <IconUsers />
                            Voir les confirmations de présence
                            {inv.rsvpStats && inv.rsvpStats.total_reponses > 0 && (
                              <span
                                className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: "#F06292", color: "white" }}
                              >
                                {inv.rsvpStats.total_reponses}
                              </span>
                            )}
                          </Link>

                          {/* Bouton plan de table (si des présences confirmées) */}
                          {inv.rsvpStats && inv.rsvpStats.nb_presences > 0 && (
                            <Link
                              href="/dashboard/marie/plan-de-table"
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
                              style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)", color: "white", boxShadow: "0 4px 12px rgba(233,30,140,0.25)" }}
                            >
                              <IconTable />
                              Placer mes invités par table →
                            </Link>
                          )}
                        </div>
                      )}

                      {/* ── Section cagnotte (si active) ── */}
                      {inv.cagnotte_active && (
                        <div className="px-5 pb-5">
                          <div
                            className="rounded-2xl p-4 space-y-3"
                            style={{ background: "#FFF0F5", border: "1px solid #FECDD3" }}
                          >
                            {/* Header cagnotte */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">🎁</span>
                                <p className="text-sm font-semibold text-gray-800">
                                  {inv.cagnotte_titre ?? "Cagnotte mariage"}
                                </p>
                              </div>
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: "#F06292", color: "white" }}
                              >
                                {(inv.cagnotteTotal / 100).toFixed(0)} €
                              </span>
                            </div>

                            {/* Barre de progression */}
                            {inv.cagnotte_objectif_cents && inv.cagnotte_objectif_cents > 0 && (
                              <div>
                                <div className="h-2 rounded-full bg-white overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${Math.min(100, Math.round((inv.cagnotteTotal / inv.cagnotte_objectif_cents) * 100))}%`,
                                      background: "linear-gradient(90deg, #F06292, #e91e8c)",
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-gray-500">{(inv.cagnotteTotal / 100).toFixed(0)} € collectés</span>
                                  <span className="text-xs text-gray-400">sur {(inv.cagnotte_objectif_cents / 100).toFixed(0)} €</span>
                                </div>
                              </div>
                            )}

                            {/* Liste des contributeurs */}
                            {inv.cagnotteContributions.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-1">
                                En attente des premiers cadeaux…
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {inv.cagnotteContributions.map((c, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start justify-between gap-3 py-2 border-t first:border-t-0"
                                    style={{ borderColor: "#FECDD3" }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-800 truncate">{c.contributeur_nom}</p>
                                      {c.message && (
                                        <p className="text-xs text-gray-500 italic mt-0.5 line-clamp-2">&ldquo;{c.message}&rdquo;</p>
                                      )}
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-bold" style={{ color: "#F06292" }}>
                                      +{(c.montant_cents / 100).toFixed(0)} €
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </>
          )}
        </div>
      </div>

      <Footer />

      {/* ── Modale changer de template ── */}
      {showChangeTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !changingTemplate) setShowChangeTemplate(false); }}
        >
          <div
            className="w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]"
            style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
          >
            {/* Header modale */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #FECDD3" }}>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Changer de template</h3>
                <p className="text-xs text-gray-400 mt-0.5">Vos données (prénoms, date, lieu, message) seront conservées</p>
              </div>
              <button
                onClick={() => setShowChangeTemplate(false)}
                disabled={changingTemplate}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 disabled:opacity-40"
                style={{ color: "#9CA3AF" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grille templates */}
            <div className="overflow-y-auto p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GALLERY_TEMPLATES.map((tpl) => {
                  const isCurrent = invitations[0]?.template?.slug === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => !isCurrent && handleChangeTemplate(tpl.id)}
                      disabled={changingTemplate || isCurrent}
                      className="relative rounded-2xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:cursor-default"
                      style={{
                        border: isCurrent ? "2px solid #e91e8c" : "2px solid #F3F4F6",
                        opacity: changingTemplate && !isCurrent ? 0.5 : 1,
                      }}
                    >
                      {/* Mini preview */}
                      <div className={`h-20 bg-gradient-to-br ${tpl.bg} flex items-center justify-center`}>
                        <p className="text-xs font-bold text-center px-2" style={{ color: tpl.accent, fontFamily: "serif" }}>
                          {tpl.name.split(" ")[0]}
                        </p>
                      </div>
                      {/* Label */}
                      <div className="px-3 py-2.5">
                        <p className="text-xs font-semibold text-gray-800 leading-tight">{tpl.name}</p>
                        <span
                          className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: tpl.tagColor.bg, color: tpl.tagColor.color }}
                        >
                          {isCurrent ? "Actuel" : tpl.tag}
                        </span>
                      </div>
                      {/* Spinner overlay */}
                      {changingTemplate && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                          <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale de confirmation de suppression ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 flex flex-col"
            style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
          >
            {/* Icône */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto"
              style={{ background: "#FFF0F5", color: "#F06292" }}
            >
              <IconTrash />
            </div>

            <h3 className="text-base font-semibold text-gray-900 text-center mb-2">
              Supprimer ce faire-part&nbsp;?
            </h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-medium text-gray-700">&ldquo;{deleteTarget.titre}&rdquo;</span>&nbsp;? Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80 disabled:opacity-40"
                style={{ background: "#F3F4F6", color: "#374151" }}
              >
                Annuler
              </button>
              <button
                onClick={() => deleteInvitation(deleteTarget)}
                disabled={deleting}
                className="flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: "#F06292", color: "white" }}
              >
                {deleting ? "Suppression…" : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
