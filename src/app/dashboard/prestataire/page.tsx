"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import type { PlanAbonnement } from "@/lib/supabase";

// ─── Config des plans ────────────────────────────────────────────────────────

type PlanConfig = {
  label: string
  badgeColor: string
  badgeBg: string
  features: string[]
  canAccessDevis: boolean
  canAccessFactures: boolean
  canAccessContrats: boolean
  hasPremiumBadge: boolean
  devisLabel: string
  upgradeLabel: string | null
  upgradeHref: string | null
}

const PLAN_CONFIG: Record<PlanAbonnement, PlanConfig> = {
  gratuit: {
    label: "GRATUIT",
    badgeColor: "white",
    badgeBg: "#6B7280",
    features: ["Profil de base visible", "Annuaire des prestataires"],
    canAccessDevis: false,
    canAccessFactures: false,
    canAccessContrats: false,
    hasPremiumBadge: false,
    devisLabel: "1 document/mois",
    upgradeLabel: "Passer Starter →",
    upgradeHref: "/tarifs",
  },
  starter: {
    label: "STARTER",
    badgeColor: "white",
    badgeBg: "#3B82F6",
    features: ["Profil enrichi", "Générateur de devis (limité)", "Support email"],
    canAccessDevis: true,
    canAccessFactures: false,
    canAccessContrats: false,
    hasPremiumBadge: false,
    devisLabel: "5 documents/mois",
    upgradeLabel: "Passer Pro →",
    upgradeHref: "/tarifs",
  },
  pro: {
    label: "PRO",
    badgeColor: "white",
    badgeBg: "#F06292",
    features: ["Devis illimités", "Factures & contrats", "Statistiques avancées", "Support prioritaire"],
    canAccessDevis: true,
    canAccessFactures: true,
    canAccessContrats: true,
    hasPremiumBadge: false,
    devisLabel: "Illimité",
    upgradeLabel: "Passer Premium →",
    upgradeHref: "/tarifs",
  },
  premium: {
    label: "Premium",
    badgeColor: "white",
    badgeBg: "linear-gradient(135deg, #C9A96E, #A67C52)",
    features: ["Tout Pro inclus", "Badge Premium", "Profil en avant-première", "Support dédié"],
    canAccessDevis: true,
    canAccessFactures: true,
    canAccessContrats: true,
    hasPremiumBadge: false,
    devisLabel: "Illimité",
    upgradeLabel: null,
    upgradeHref: null,
  },
};

// ─── Composants ─────────────────────────────────────────────────────────────

// icônes réutilisées dans la grille de stats
const IconEye = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconStar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

type ConversationItem = {
  id: string;
  other_name: string;
  last_message: string;
  last_message_at: string;
  last_message_is_mine: boolean;
  unread_count: number;
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}


// ─── Dashboard ───────────────────────────────────────────────────────────────

function DashboardPrestataire() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"avis" | "messages">("messages");
  const [authChecked, setAuthChecked] = useState(false);
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [verifie, setVerifie] = useState(false);
  const [prestataireId, setPrestataireId] = useState<string | null>(null);
  const [categorie, setCategorie] = useState("");
  const [ville, setVille] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanAbonnement>("gratuit");
  const [dateRenouvellement, setDateRenouvellement] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [convsLoaded, setConvsLoaded] = useState(false);
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [nbContacts, setNbContacts] = useState<number | null>(null);
  const [noteStats, setNoteStats] = useState<{ note: number; nb: number } | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileSuggestions, setProfileSuggestions] = useState<Array<{ label: string; done: boolean; points: number }>>([]);
  const [codeParrainage, setCodeParrainage] = useState<string | null>(null);
  const [nbFilleuls, setNbFilleuls] = useState(0);
  const [moisGagnes, setMoisGagnes] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showUpsellBanner, setShowUpsellBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const uid = session.user.id;

      // Récupérer profil prestataire
      const { data: prestataire } = await supabase
        .from("prestataires")
        .select("id, nom_entreprise, categorie, ville, avatar_url, photos, description, telephone, site_web, note_moyenne, nb_avis, verifie, code_parrainage, show_upsell_banner")
        .eq("user_id", session.user.id)
        .single();

      if (prestataire) {
        setNomEntreprise(prestataire.nom_entreprise || "");
        setVerifie(prestataire.verifie ?? false);
        setPrestataireId(prestataire.id);
        setCategorie(prestataire.categorie || "");
        setVille(prestataire.ville || "");
        if (prestataire.avatar_url) {
          const url = prestataire.avatar_url.startsWith("http")
            ? prestataire.avatar_url
            : `https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/photos/${prestataire.avatar_url}`;
          setAvatarUrl(url);
        }

        // Complétion du profil (calcul dynamique)
        const suggItems = [
          { label: "Ajouter une photo de profil", done: !!(prestataire.avatar_url || prestataire.photos?.length > 0), points: 25 },
          { label: "Compléter votre description", done: !!(prestataire.description?.trim()), points: 25 },
          { label: "Renseigner votre ville", done: !!prestataire.ville, points: 15 },
          { label: "Ajouter votre téléphone", done: !!prestataire.telephone, points: 20 },
          { label: "Renseigner votre site web", done: !!prestataire.site_web, points: 15 },
        ];
        setProfileCompletion(suggItems.reduce((s, i) => s + (i.done ? i.points : 0), 0));
        setProfileSuggestions(suggItems);

        // Stats + abonnement en parallèle
        const [{ count: views }, { count: contacts }, { data: avisData }, { data: parrainagesData }, { data: abonnement }] = await Promise.all([
          supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("prestataire_id", prestataire.id),
          supabase.from("conversations").select("id", { count: "exact", head: true }).or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`),
          supabase.from("avis").select("note").eq("prestataire_id", prestataire.id),
          supabase.from("parrainages").select("mois_offerts").eq("parrain_id", prestataire.id).eq("statut", "valide"),
          supabase.from("abonnements").select("plan, statut, date_fin, stripe_subscription_id").eq("prestataire_id", prestataire.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);
        setProfileViews(views ?? 0);
        setNbContacts(contacts ?? 0);
        const nb = avisData?.length ?? 0;
        const note = nb > 0 ? avisData!.reduce((s: number, a: { note: number }) => s + a.note, 0) / nb : 0;
        setNoteStats({ note, nb });

        // Stats parrainage
        if (prestataire.code_parrainage) setCodeParrainage(prestataire.code_parrainage);
        setShowUpsellBanner(prestataire.show_upsell_banner ?? false);
        if (parrainagesData) {
          setNbFilleuls(parrainagesData.length);
          setMoisGagnes(parrainagesData.reduce((s: number, p: { mois_offerts: number }) => s + p.mois_offerts, 0));
        }

        if (abonnement && abonnement.statut === "actif") {
          setPlan(abonnement.plan as PlanAbonnement);
          if (abonnement.date_fin) {
            const d = new Date(abonnement.date_fin);
            setDateRenouvellement(
              d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            );
          }

          // Vérifier l'annulation Stripe de façon non-bloquante
          if (abonnement.stripe_subscription_id) {
            fetch(`/api/stripe/subscription-status?subscriptionId=${abonnement.stripe_subscription_id}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => { if (data) setCancelAtPeriodEnd(data.cancel_at_period_end ?? false); })
              .catch(() => {});
          }
        }
      } else {
        // FIX BUG #2 — Profil absent (cas OAuth sans création) : création silencieuse + rechargement
        const meta = session.user.user_metadata;
        const nomEntreprise =
          meta?.full_name || meta?.name || meta?.nom_entreprise ||
          session.user.email?.split("@")[0] || "Mon entreprise";

        await fetch("/api/inscription/prestataire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.id,
            nom_entreprise: nomEntreprise,
            categorie: meta?.categorie || "Autre",
            ville: meta?.ville || "",
            telephone: meta?.telephone || "",
          }),
        }).catch(() => {});

        const { data: created } = await supabase
          .from("prestataires")
          .select("id, nom_entreprise, categorie, ville, verifie, code_parrainage")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (created) {
          setNomEntreprise(created.nom_entreprise || "");
          setVerifie(created.verifie ?? false);
          setPrestataireId(created.id);
          setCategorie(created.categorie || "");
          setVille(created.ville || "");
          if (created.code_parrainage) setCodeParrainage(created.code_parrainage);
        }
      }

      // Charger les conversations
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, participant1_id, participant2_id, created_at, last_message_at")
        .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
        .order("last_message_at", { ascending: false })
        .limit(5);

      if (convs && convs.length > 0) {
        // Parallélise toutes les sous-requêtes par conversation simultanément
        const items = await Promise.all(
          convs.map(async (conv) => {
            const otherId = conv.participant1_id === uid ? conv.participant2_id : conv.participant1_id;

            const [{ data: marie }, { data: prest }, { data: lastMsg }, { count }] = await Promise.all([
              supabase.from("maries").select("prenom_marie1, prenom_marie2").eq("user_id", otherId).maybeSingle(),
              supabase.from("prestataires").select("nom_entreprise").eq("user_id", otherId).maybeSingle(),
              supabase.from("messages").select("contenu, created_at, expediteur_id").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
              supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("destinataire_id", uid).eq("lu", false),
            ]);

            let displayName = "Utilisateur";
            if (otherId === SYSTEM_USER_ID) {
              displayName = "InstantMariage";
            } else if (marie) {
              displayName = marie.prenom_marie2
                ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
                : marie.prenom_marie1;
            } else if (prest) {
              displayName = prest.nom_entreprise;
            }

            return {
              id: conv.id,
              other_name: displayName,
              last_message: lastMsg?.contenu ?? "",
              last_message_at: lastMsg?.created_at ?? conv.created_at,
              last_message_is_mine: lastMsg?.expediteur_id === uid,
              unread_count: count ?? 0,
            } as ConversationItem;
          })
        );
        setConversations(items);
      }
      setConvsLoaded(true);

      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
        <Header />
        <div className="pt-16 sm:pt-20 pb-16">
          {/* Hero skeleton */}
          <div className="px-4 py-8 sm:py-10" style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)" }}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0 animate-pulse" style={{ background: "rgba(255,255,255,0.25)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-6 rounded-full w-44 animate-pulse" style={{ background: "rgba(255,255,255,0.25)" }} />
                  <div className="h-4 rounded-full w-28 animate-pulse" style={{ background: "rgba(255,255,255,0.15)" }} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[80, 96, 112, 96, 128].map((w, i) => (
                  <div key={i} className="h-9 rounded-full animate-pulse" style={{ width: w, background: "rgba(255,255,255,0.2)" }} />
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 mt-5 sm:mt-6">
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 shadow-card">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse mb-3" />
                  <div className="h-7 bg-gray-100 rounded-lg animate-pulse w-14 mb-1.5" />
                  <div className="h-3 bg-gray-50 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl shadow-card h-72 animate-pulse" />
                <div className="bg-white rounded-2xl shadow-card h-32 animate-pulse" />
              </div>
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl shadow-card h-44 animate-pulse" />
                <div className="rounded-2xl h-52 animate-pulse" style={{ background: "#1a1a2e", opacity: 0.6 }} />
                <div className="bg-white rounded-2xl shadow-card h-36 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const planConfig = PLAN_CONFIG[plan];

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      <Header />

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Abonnement activé avec succès ! Bienvenue dans votre nouvel espace prestataire.</span>
            <button onClick={() => setShowSuccess(false)} className="ml-auto flex-shrink-0 opacity-70 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="pt-16 sm:pt-20 pb-16">
        {/* Hero Header */}
        <div
          className="px-4 py-8 sm:py-10"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg flex-shrink-0 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={nomEntreprise} fill className="object-cover" sizes="64px" />
                  ) : (
                    getInitials(nomEntreprise)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white font-playfair truncate flex items-center gap-2">
                      {nomEntreprise}
                      {verifie && (
                        <span title="Prestataire vérifié par InstantMariage" className="flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#1D9BF0"/>
                            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </h1>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: planConfig.badgeBg,
                        color: planConfig.badgeColor,
                      }}
                    >
                      {planConfig.label}
                    </span>
                  </div>
                  <p className="text-rose-100 text-sm mt-0.5 truncate">
                    {[categorie, ville].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/dashboard/prestataire/profil"
                  className="inline-flex items-center gap-2 bg-white text-rose-500 font-semibold px-4 py-2 rounded-full text-sm hover:bg-rose-50 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier mon profil
                </Link>
                <Link
                  href={prestataireId ? `/prestataires/${prestataireId}` : "#"}
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Voir mon profil
                </Link>
                <Link
                  href="/dashboard/prestataire/abonnement"
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeWidth={1.5} d="M2 10h20" />
                  </svg>
                  Mon abonnement
                </Link>
                <Link
                  href="/dashboard/prestataire/documents"
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documents
                </Link>
                <Link
                  href="/dashboard/parametres"
                  className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Paramètres du compte
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bannière upsell contextuelle — activée par l'admin depuis /admin/upsell */}
        {showUpsellBanner && plan !== "premium" && (
          <div
            className="px-4 py-4"
            style={{ background: "linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%)" }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-white font-bold text-sm sm:text-base leading-snug">
                  🚀 Passez au plan {PLAN_CONFIG[plan].upgradeLabel?.replace("Passer ", "").replace(" →", "")} — débloque de nouvelles fonctionnalités !
                </p>
                <p className="text-purple-200 text-xs sm:text-sm mt-0.5">
                  {plan === "gratuit" && "Accédez aux devis, à la messagerie prioritaire et boostez votre visibilité."}
                  {plan === "starter" && "Factures, contrats illimités et statistiques avancées inclus."}
                  {plan === "pro" && "Badge Premium, profil mis en avant et support dédié."}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href="/tarifs"
                  className="bg-white text-purple-700 font-bold text-sm px-5 py-2 rounded-full hover:bg-purple-50 transition-all duration-200 shadow-md"
                >
                  {PLAN_CONFIG[plan].upgradeLabel ?? "Voir les plans"}
                </Link>
                <button
                  onClick={async () => {
                    setShowUpsellBanner(false);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    fetch("/api/prestataire/dismiss-banner", {
                      method: "PATCH",
                      headers: { Authorization: `Bearer ${session.access_token}` },
                    }).catch(() => {});
                  }}
                  className="text-purple-200 hover:text-white text-sm font-medium transition-colors px-2"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner Pro — visible uniquement pour les plans gratuit et starter */}
        {(plan === "gratuit" || plan === "starter") && (
          <div
            className="px-4 py-4"
            style={{ background: "linear-gradient(90deg, #F06292 0%, #E91E8C 100%)" }}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-white font-bold text-sm sm:text-base leading-snug">
                  ⭐ Passez au plan Pro et boostez votre visibilité !
                </p>
                <p className="text-rose-100 text-xs sm:text-sm mt-0.5">
                  Les prestataires Pro reçoivent en moyenne 3x plus de contacts
                </p>
              </div>
              <Link
                href="/tarifs"
                className="self-start sm:self-auto flex-shrink-0 bg-white text-rose-500 font-bold text-sm px-5 py-2 rounded-full hover:bg-rose-50 transition-all duration-200 shadow-md"
              >
                Découvrir le plan Pro →
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 mt-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6">
            {[
              {
                label: "Vues du profil",
                value: profileViews !== null ? String(profileViews) : "—",
                icon: <IconEye />,
              },
              {
                label: "Contacts reçus",
                value: nbContacts !== null ? String(nbContacts) : "—",
                icon: <IconMail />,
              },
              {
                label: "Avis reçus",
                value: noteStats !== null ? String(noteStats.nb) : "—",
                icon: <IconStar />,
              },
              {
                label: "Note moyenne",
                value: noteStats !== null
                  ? noteStats.nb > 0 ? `${noteStats.note.toFixed(1)}/5` : "—"
                  : "—",
                icon: <IconStar />,
              },
            ].map((stat) => (
              <div key={stat.label} className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-card overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#FFF0F5", color: "#F06292" }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">

              {/* Tabs: Messages / Avis */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="flex border-b border-gray-100">
                  {(["messages", "avis"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="flex-1 py-4 text-sm font-semibold transition-all duration-200 relative"
                      style={{ color: activeTab === tab ? "#F06292" : "#9CA3AF" }}
                    >
                      {tab === "messages" ? "Mes messages" : "Mes avis"}
                      {activeTab === tab && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{ background: "#F06292" }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === "messages" && (
                  <>
                    {!convsLoaded ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#FFF0F5" }}>
                          <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-700 mb-1">Pas encore de messages</p>
                        <p className="text-sm text-gray-400">Vos échanges avec les futurs mariés apparaîtront ici</p>
                      </div>
                    ) : (
                      <div>
                        {conversations.map((conv, i) => {
                          const isLast = i === conversations.length - 1;
                          return (
                            <Link
                              key={conv.id}
                              href={`/messages/${conv.id}`}
                              className="flex items-center gap-3 px-5 py-4 hover:bg-rose-50/40 transition-colors duration-200 group"
                              style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}
                            >
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                                style={{ background: conv.unread_count > 0 ? "#F06292" : "#FBBDD9" }}
                              >
                                {conv.other_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className={`text-sm truncate ${conv.unread_count > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                                    {conv.other_name}
                                  </span>
                                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className={`text-xs truncate flex-1 ${conv.unread_count > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                                    {conv.last_message_is_mine && <span className="text-gray-400">Vous : </span>}
                                    {conv.last_message || "Conversation démarrée"}
                                  </p>
                                  {conv.unread_count > 0 && (
                                    <span
                                      className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                                      style={{ background: "#F06292" }}
                                    >
                                      {conv.unread_count > 9 ? "9+" : conv.unread_count}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-gray-300 group-hover:text-rose-300 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          );
                        })}
                        <Link
                          href="/messages"
                          className="flex items-center justify-center gap-1.5 text-sm font-semibold py-3.5 transition-all hover:opacity-70"
                          style={{ borderTop: "1px solid #FEE2E2", color: "#F06292" }}
                        >
                          Voir tous les messages
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "avis" && (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#FFF0F5" }}>
                      <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Pas encore d&apos;avis</p>
                    <p className="text-sm text-gray-400">Les avis de vos clients apparaîtront ici après leurs mariages</p>
                  </div>
                )}
              </div>

              {/* Mes Outils */}
              <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Mes outils</h2>

                {/* Documents */}
                <Link
                  href="/dashboard/prestataire/documents"
                  className="flex flex-col gap-3 p-4 sm:p-5 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#FFF0F5" }}
                    >
                      <svg className="w-6 h-6" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold text-gray-900">Devis, Factures & Contrats</div>
                        {planConfig.devisLabel && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-gray-500 bg-gray-100">
                            {planConfig.devisLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Générez vos documents professionnels directement depuis votre dashboard
                      </div>
                    </div>
                  </div>
                  <span
                    className="self-start text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 group-hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)", color: "white" }}
                  >
                    Ouvrir →
                  </span>
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4 sm:gap-6">

              {/* Complétion du profil */}
              <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-gray-900">Profil complété</h2>
                  <span className="text-sm font-bold" style={{ color: "#F06292" }}>
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${profileCompletion}%`,
                      background: "linear-gradient(90deg, #F06292, #E91E8C)",
                    }}
                  />
                </div>
                <div className="space-y-2.5">
                  {profileSuggestions.map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: s.done ? "#F0FDF4" : "#F3F4F6" }}
                      >
                        {s.done ? (
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span className={`text-xs flex-1 ${s.done ? "line-through text-gray-400" : "text-gray-600"}`}>
                        {s.label}
                      </span>
                      {!s.done && (
                        <span className="text-xs font-semibold" style={{ color: "#F06292" }}>
                          +{s.points}pts
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mon abonnement */}
              <div
                className="rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "#F06292", transform: "translate(30%, -30%)" }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white">Mon abonnement</h2>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: planConfig.badgeBg }}
                    >
                      {planConfig.label}
                    </span>
                  </div>
                  <div className="space-y-2 mb-5">
                    {planConfig.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F06292" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-gray-300">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {cancelAtPeriodEnd && dateRenouvellement && plan !== "gratuit" && (
                    <div className="text-xs mb-4 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(251,146,60,0.15)", color: "#FB923C" }}>
                      Actif jusqu&apos;au <span className="font-semibold">{dateRenouvellement}</span>
                    </div>
                  )}
                  {!cancelAtPeriodEnd && dateRenouvellement && plan !== "gratuit" && (
                    <div className="text-xs text-gray-400 mb-4">
                      Renouvellement le <span className="text-white font-medium">{dateRenouvellement}</span>
                    </div>
                  )}

                  {planConfig.upgradeLabel && planConfig.upgradeHref && (
                    <Link
                      href={planConfig.upgradeHref}
                      className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                      style={{ background: "#F06292" }}
                    >
                      {planConfig.upgradeLabel}
                    </Link>
                  )}

                  {plan === "premium" && (
                    <div
                      className="text-center py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "rgba(201,169,110,0.18)", color: "#A67C52" }}
                    >
                      ★ Vous êtes Premium !
                    </div>
                  )}
                </div>
              </div>

              {/* Parrainage */}
              <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FFF0F5", color: "#F06292" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-gray-900">Parrainage</h2>
                </div>

                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Parrainez un prestataire et gagnez <span className="font-semibold text-gray-700">1 mois gratuit</span> dès son inscription.
                </p>

                {/* Compteurs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-xl p-3 text-center" style={{ background: "#FFF0F5" }}>
                    <div className="text-2xl font-bold" style={{ color: "#F06292" }}>{nbFilleuls}</div>
                    <div className="text-xs text-gray-500 mt-0.5">filleul{nbFilleuls > 1 ? "s" : ""}</div>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: "#FFF0F5" }}>
                    <div className="text-2xl font-bold" style={{ color: "#F06292" }}>{moisGagnes}</div>
                    <div className="text-xs text-gray-500 mt-0.5">mois gagné{moisGagnes > 1 ? "s" : ""}</div>
                  </div>
                </div>

                {/* Code + bouton copier */}
                {codeParrainage && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Votre code parrainage</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 rounded-xl px-3 py-2.5 text-center font-mono font-bold tracking-widest text-base"
                        style={{ background: "#F3F4F6", color: "#1F2937" }}
                      >
                        {codeParrainage}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const url = `https://instantmariage.fr/inscription?ref=${codeParrainage}`;
                          try {
                            await navigator.clipboard.writeText(url);
                          } catch {
                            // Fallback for browsers without clipboard API
                            const ta = document.createElement("textarea");
                            ta.value = url;
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand("copy");
                            document.body.removeChild(ta);
                          }
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={{
                          background: copiedCode ? "#F0FDF4" : "#FFF0F5",
                          color: copiedCode ? "#16A34A" : "#F06292",
                        }}
                        title="Copier le lien de parrainage"
                      >
                        {copiedCode ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: copiedCode ? "#16A34A" : "#9CA3AF" }}>
                      {copiedCode ? "Lien copié !" : "Cliquez pour copier votre lien"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function DashboardPrestatairePage() {
  return (
    <Suspense>
      <DashboardPrestataire />
    </Suspense>
  );
}
