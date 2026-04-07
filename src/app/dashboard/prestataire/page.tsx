"use client";

import { useState, useEffect, Suspense } from "react";
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
    devisLabel: "",
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
    devisLabel: "Limité à 5 devis/mois",
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
    label: "PREMIUM",
    badgeColor: "white",
    badgeBg: "#F59E0B",
    features: ["Tout Pro inclus", "Badge Premium", "Profil en avant-première", "Support dédié"],
    canAccessDevis: true,
    canAccessFactures: true,
    canAccessContrats: true,
    hasPremiumBadge: true,
    devisLabel: "Illimité",
    upgradeLabel: null,
    upgradeHref: null,
  },
};

// ─── Composants ─────────────────────────────────────────────────────────────

const stats = [
  {
    label: "Vues du profil",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    label: "Contacts reçus",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Devis envoyés",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Note moyenne",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

const profileSuggestions = [
  { label: "Ajouter 3 photos supplémentaires", done: false, points: 10 },
  { label: "Renseigner votre zone de déplacement", done: false, points: 5 },
  { label: "Compléter votre description", done: true, points: 15 },
  { label: "Ajouter vos tarifs indicatifs", done: false, points: 10 },
  { label: "Relier votre compte Instagram", done: true, points: 5 },
  { label: "Ajouter une vidéo de présentation", done: false, points: 15 },
];

const profileCompletion = 52;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function LockOverlay({ planRequired }: { planRequired: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 gap-2">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "#FFF0F5" }}
      >
        <svg className="w-5 h-5" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700">Réservé au plan {planRequired}</p>
      <Link
        href="/tarifs"
        className="text-xs font-semibold px-4 py-1.5 rounded-full text-white transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
      >
        Mettre à niveau →
      </Link>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function DashboardPrestataire() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"avis" | "messages">("messages");
  const [authChecked, setAuthChecked] = useState(false);
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [categorie, setCategorie] = useState("");
  const [ville, setVille] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [plan, setPlan] = useState<PlanAbonnement>("gratuit");
  const [dateRenouvellement, setDateRenouvellement] = useState<string | null>(null);

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

      // Récupérer profil prestataire
      const { data: prestataire } = await supabase
        .from("prestataires")
        .select("id, nom_entreprise, categorie, ville")
        .eq("user_id", session.user.id)
        .single();

      if (prestataire) {
        setNomEntreprise(prestataire.nom_entreprise || "");
        setCategorie(prestataire.categorie || "");
        setVille(prestataire.ville || "");

        // Récupérer l'abonnement actif
        const { data: abonnement } = await supabase
          .from("abonnements")
          .select("plan, statut, date_fin")
          .eq("prestataire_id", prestataire.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (abonnement && abonnement.statut === "actif") {
          setPlan(abonnement.plan as PlanAbonnement);
          if (abonnement.date_fin) {
            const d = new Date(abonnement.date_fin);
            setDateRenouvellement(
              d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
            );
          }
        }
      } else {
        const meta = session.user.user_metadata;
        setNomEntreprise(meta?.nom_entreprise || session.user.email?.split("@")[0] || "");
        setCategorie(meta?.categorie || "");
        setVille(meta?.ville || "");
      }

      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) return null;

  const planConfig = PLAN_CONFIG[plan];

  return (
    <main className="min-h-screen bg-gray-50">
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

      <div className="pt-20 pb-16">
        {/* Hero Header */}
        <div
          className="px-4 py-10"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {getInitials(nomEntreprise)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white font-playfair">
                      {nomEntreprise}
                    </h1>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: planConfig.badgeBg,
                        color: planConfig.badgeColor,
                      }}
                    >
                      {planConfig.label}
                    </span>
                    {planConfig.hasPremiumBadge && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#F59E0B", color: "white" }}>
                        ★ Premium
                      </span>
                    )}
                  </div>
                  <p className="text-rose-100 text-sm mt-0.5">
                    {[categorie, ville].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <Link
                href={`/prestataires/${nomEntreprise.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex items-center gap-2 bg-white text-rose-500 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-rose-50 transition-all duration-200 shadow-sm self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir mon profil
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-2">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#FFF0F5", color: "#F06292" }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-300">—</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-1">Données à venir</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-6">

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
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#FFF0F5" }}>
                      <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">Pas encore de messages</p>
                    <p className="text-sm text-gray-400">Vos échanges avec les futurs mariés apparaîtront ici</p>
                  </div>
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
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Mes outils</h2>

                {/* Générateur de Devis */}
                <div className="relative">
                  {!planConfig.canAccessDevis && (
                    <LockOverlay planRequired="Starter" />
                  )}
                  <a
                    href={planConfig.canAccessDevis ? "https://wedding-devis.vercel.app" : undefined}
                    target={planConfig.canAccessDevis ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border transition-all duration-200 group ${
                      planConfig.canAccessDevis
                        ? "border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 cursor-pointer"
                        : "border-gray-100 cursor-default select-none opacity-60"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: "#FFF0F5" }}
                    >
                      📄
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold text-gray-900">Générateur de Devis, Factures & Contrats</div>
                        {planConfig.canAccessDevis && planConfig.devisLabel && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            {planConfig.devisLabel}
                          </span>
                        )}
                        {planConfig.canAccessDevis && !planConfig.canAccessFactures && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            Devis uniquement
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {planConfig.canAccessDevis
                          ? planConfig.canAccessFactures
                            ? "Créez vos devis professionnels, convertissez-les en factures et générez vos contrats en quelques clics"
                            : "Créez vos devis professionnels. Passez en Pro pour accéder aux factures et contrats."
                          : "Disponible à partir du plan Starter — créez vos devis professionnels"}
                      </div>
                    </div>
                    {planConfig.canAccessDevis && (
                      <span
                        className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 group-hover:opacity-90 whitespace-nowrap"
                        style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)", color: "white" }}
                      >
                        Accéder à l&apos;outil →
                      </span>
                    )}
                  </a>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">

              {/* Complétion du profil */}
              <div className="bg-white rounded-2xl shadow-card p-6">
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
                className="rounded-2xl p-6 text-white relative overflow-hidden"
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

                  {dateRenouvellement && plan !== "gratuit" && (
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
                      style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}
                    >
                      ★ Vous êtes Premium !
                    </div>
                  )}
                </div>
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
