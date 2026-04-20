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

/* ─────────────────── Page ─────────────────── */
export default function FairePartsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

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
            };
          })
        );
        setInvitations(withStats);
      }

      setLoading(false);
      setAuthChecked(true);
    });
  }, [router]);

  async function copyPublicLink(slug: string) {
    const url = `${window.location.origin}/invitation/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
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

          {/* CTA créer */}
          <Link
            href="/faire-part"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: "white", color: "#e91e8c" }}
          >
            <IconPlus />
            Créer un faire-part
          </Link>
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

                    </div>
                  );
                })}
              </div>

              {/* CTA nouveau faire-part en bas */}
              <Link
                href="/faire-part"
                className="flex items-center justify-center gap-2 py-4 rounded-3xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: "white", color: "#F06292", border: "2px dashed #FECDD3" }}
              >
                <IconPlus />
                Créer un nouveau faire-part
              </Link>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
