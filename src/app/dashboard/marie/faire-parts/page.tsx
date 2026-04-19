"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const IconEnvelope = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconLink = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const IconVideo = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

type RsvpStats = {
  total_reponses: number;
  nb_presences: number;
  nb_absences: number;
  nb_personnes: number;
};

type InvitationOrder = {
  id: string;
  pack: string | null;
  render_statut: string | null;
  video_url: string | null;
  statut: string;
  montant_cts: number;
};

type Invitation = {
  id: string;
  slug: string;
  titre: string;
  statut: "brouillon" | "publie" | "archive";
  rsvp_actif: boolean;
  rsvp_deadline: string | null;
  created_at: string;
  invitation_orders: InvitationOrder[];
  rsvp_stats?: RsvpStats;
};

function formatDateFr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function RenderBadge({ order }: { order: InvitationOrder | undefined }) {
  if (!order) return null;

  const statut = order.render_statut;
  if (!statut || statut === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
        <IconVideo />
        En attente
      </span>
    );
  }
  if (statut === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
        <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: "#3B82F6" }} />
        Rendu en cours…
      </span>
    );
  }
  if (statut === "done" && order.video_url) {
    return (
      <a
        href={order.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
        style={{ background: "#D1FAE5", color: "#065F46" }}
      >
        <IconVideo />
        Vidéo prête
      </a>
    );
  }
  if (statut === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#991B1B" }}>
        Erreur rendu
      </span>
    );
  }
  return null;
}

export default function FairePartDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadData = useCallback(async (marieId: string) => {
    const { data: invs } = await supabase
      .from("invitations")
      .select("id, slug, titre, statut, rsvp_actif, rsvp_deadline, created_at, invitation_orders(id, pack, render_statut, video_url, statut, montant_cts)")
      .eq("marie_id", marieId)
      .order("created_at", { ascending: false });

    if (!invs) { setLoading(false); return; }

    const withStats = await Promise.all(
      invs.map(async (inv) => {
        const { data: stats } = await supabase.rpc("get_rsvp_stats", {
          p_invitation_id: inv.id,
        });
        return {
          ...inv,
          invitation_orders: inv.invitation_orders ?? [],
          rsvp_stats: (stats as RsvpStats[] | null)?.[0] ?? undefined,
        } as Invitation;
      })
    );

    setInvitations(withStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      const uid = session.user.id;
      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (!marie) { setAuthChecked(true); setLoading(false); return; }
      await loadData(marie.id);
      setAuthChecked(true);
    });
  }, [router, loadData]);

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/invitation/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (!authChecked) return null;

  const published = invitations.filter((i) => i.statut === "publie");
  const drafts = invitations.filter((i) => i.statut === "brouillon");

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">
        {/* Hero */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-10 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href="/dashboard/marie"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <IconArrowLeft />
            Tableau de bord
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
                Mon espace
              </p>
              <h1 className="text-3xl font-semibold text-white leading-tight mb-1">
                Mes faire-parts
              </h1>
              <p className="text-base" style={{ color: "rgba(255,255,255,0.8)" }}>
                {invitations.length === 0
                  ? "Créez votre premier faire-part animé"
                  : `${invitations.length} faire-part${invitations.length > 1 ? "s" : ""} · ${published.length} publié${published.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <Link
              href="/faire-part"
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "rgba(255,255,255,0.22)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
            >
              <IconPlus />
              Nouveau
            </Link>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-5 pt-4">

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
            </div>
          ) : invitations.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-3xl p-10 flex flex-col items-center text-center"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <IconEnvelope />
              </div>
              <p className="text-base font-semibold text-gray-800 mb-2">Aucun faire-part créé</p>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-xs">
                Créez un faire-part animé personnalisé et partagez un lien unique à vos invités.
              </p>
              <Link
                href="/faire-part"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: "#F06292", color: "white" }}
              >
                <IconPlus />
                Créer mon premier faire-part
              </Link>
            </div>
          ) : (
            <>
              {/* Published */}
              {published.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Publiés</h2>
                  <div
                    className="rounded-3xl overflow-hidden"
                    style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                  >
                    {published.map((inv, i) => (
                      <InvitationCard
                        key={inv.id}
                        inv={inv}
                        isLast={i === published.length - 1}
                        copiedSlug={copiedSlug}
                        onCopy={copyLink}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Drafts */}
              {drafts.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Brouillons</h2>
                  <div
                    className="rounded-3xl overflow-hidden"
                    style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                  >
                    {drafts.map((inv, i) => (
                      <InvitationCard
                        key={inv.id}
                        inv={inv}
                        isLast={i === drafts.length - 1}
                        copiedSlug={copiedSlug}
                        onCopy={copyLink}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* CTA */}
              <div className="pt-2">
                <Link
                  href="/faire-part"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                  style={{ background: "#F06292", color: "white" }}
                >
                  <IconPlus />
                  Créer un nouveau faire-part
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

function InvitationCard({
  inv,
  isLast,
  copiedSlug,
  onCopy,
}: {
  inv: Invitation;
  isLast: boolean;
  copiedSlug: string | null;
  onCopy: (slug: string) => void;
}) {
  const paidOrder = inv.invitation_orders.find((o) => o.statut === "paye");
  const stats = inv.rsvp_stats;
  const isCopied = copiedSlug === inv.slug;

  return (
    <div
      className="px-5 py-4"
      style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: inv.statut === "publie" ? "#FFF0F5" : "#F9FAFB", color: inv.statut === "publie" ? "#F06292" : "#9CA3AF" }}
        >
          <IconEnvelope />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">{inv.titre}</p>
            <StatusBadge statut={inv.statut} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Créé le {formatDateFr(inv.created_at)}</p>

          {/* Render badge */}
          {paidOrder && (
            <div className="mt-1.5">
              <RenderBadge order={paidOrder} />
            </div>
          )}
        </div>
      </div>

      {/* RSVP stats — only if published & rsvp active */}
      {inv.statut === "publie" && inv.rsvp_actif && stats && stats.total_reponses > 0 && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <IconUsers />
            <span>{stats.total_reponses} réponse{stats.total_reponses > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#D1FAE5", color: "#065F46" }}
            >
              ✓ {stats.nb_presences} présent{stats.nb_presences > 1 ? "s" : ""}
            </span>
            {stats.nb_absences > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                ✗ {stats.nb_absences} absent{stats.nb_absences > 1 ? "s" : ""}
              </span>
            )}
            <span className="text-xs text-gray-400">
              ({stats.nb_personnes} pers.)
            </span>
          </div>
        </div>
      )}

      {inv.statut === "publie" && inv.rsvp_actif && (!stats || stats.total_reponses === 0) && (
        <div className="mt-2">
          <span className="text-xs text-gray-400">Aucune réponse RSVP pour l&apos;instant</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {inv.statut === "publie" && (
          <button
            onClick={() => onCopy(inv.slug)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95"
            style={{
              background: isCopied ? "#D1FAE5" : "#FFF0F5",
              color: isCopied ? "#065F46" : "#F06292",
            }}
          >
            {isCopied ? <IconCheck /> : <IconLink />}
            {isCopied ? "Lien copié !" : "Copier le lien"}
          </button>
        )}
        <Link
          href={`/invitation/${inv.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 hover:opacity-80"
          style={{ background: "#F3F4F6", color: "#374151" }}
        >
          Voir la page
          <IconChevronRight />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  if (statut === "publie") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: "#D1FAE5", color: "#065F46" }}
      >
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#10B981" }} />
        Publié
      </span>
    );
  }
  if (statut === "brouillon") {
    return (
      <span
        className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: "#F3F4F6", color: "#6B7280" }}
      >
        Brouillon
      </span>
    );
  }
  return null;
}
