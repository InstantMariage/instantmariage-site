"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type EliteSite = {
  id: string;
  prestataire_id: string;
  domaine: string;
  statut: "en_attente" | "en_cours" | "en_ligne" | "suspendu";
  type_activite: string | null;
  nom_professionnel: string | null;
  ville_principale: string | null;
  style_description: string | null;
  created_at: string;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconGlobe = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const IconExternalLink = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

// ─── Badge statut ─────────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: EliteSite["statut"] }) {
  if (statut === "en_attente") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#FFF7ED" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#FED7AA" }}>
          ⏳
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: "#C2410C" }}>En attente</div>
          <div className="text-xs mt-0.5" style={{ color: "#9A3412" }}>
            Votre demande a été reçue, nous allons créer votre site dans les 72h
          </div>
        </div>
      </div>
    );
  }
  if (statut === "en_cours") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#EFF6FF" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#BFDBFE" }}>
          🔨
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: "#1D4ED8" }}>En cours de création</div>
          <div className="text-xs mt-0.5" style={{ color: "#1E40AF" }}>
            Notre équipe travaille sur votre site
          </div>
        </div>
      </div>
    );
  }
  if (statut === "en_ligne") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#F0FDF4" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ background: "#BBF7D0" }}>
          ✅
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: "#15803D" }}>En ligne</div>
          <div className="text-xs mt-0.5" style={{ color: "#166534" }}>
            Votre site est en ligne !
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EliteSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eliteSite, setEliteSite] = useState<EliteSite | null>(null);
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: prestataire } = await supabase
        .from("prestataires")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!prestataire) {
        router.replace("/dashboard/prestataire");
        return;
      }

      const [{ data: site }, { data: abonnement }] = await Promise.all([
        supabase
          .from("elite_sites")
          .select("id, prestataire_id, domaine, statut, type_activite, nom_professionnel, ville_principale, style_description, created_at")
          .eq("prestataire_id", prestataire.id)
          .maybeSingle(),
        supabase
          .from("abonnements")
          .select("plan")
          .eq("prestataire_id", prestataire.id)
          .eq("statut", "actif")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (abonnement) setPlan(abonnement.plan);
      if (site) setEliteSite(site as EliteSite);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16 sm:pt-20 pb-16">
          <div className="max-w-2xl mx-auto px-4 mt-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded-xl animate-pulse w-48" />
            <div className="bg-white rounded-2xl shadow-card h-48 animate-pulse" />
            <div className="bg-white rounded-2xl shadow-card h-32 animate-pulse" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const planLabel = plan === "elite-shop" ? "Elite Shop" : "Elite Vitrine";

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-16 sm:pt-20 pb-16">
        {/* Header */}
        <div
          className="px-4 py-8 sm:py-10"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}
        >
          <div className="max-w-2xl mx-auto">
            <Link
              href="/dashboard/prestataire"
              className="inline-flex items-center gap-2 text-purple-200 hover:text-white text-sm font-medium transition-colors mb-4"
            >
              <IconArrowLeft />
              Retour au dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <IconGlobe />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-playfair">Mon site pro</h1>
                <p className="text-purple-200 text-sm mt-0.5">Plan {planLabel} 👑</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

          {/* Pas de site → CTA */}
          {!eliteSite && (
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#F3F0FF" }}
              >
                <svg className="w-8 h-8" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Votre site pro n&apos;est pas encore configuré</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Remplissez le questionnaire pour que notre équipe crée votre site professionnel personnalisé sous 72h.
              </p>
              <Link
                href="/elite/questionnaire?from=dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Configurer votre site
              </Link>
            </div>
          )}

          {/* Site existant */}
          {eliteSite && (
            <>
              {/* Section statut */}
              <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Statut</h2>

                <StatutBadge statut={eliteSite.statut} />

                {eliteSite.statut === "en_ligne" && (
                  <a
                    href={`https://${eliteSite.domaine}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                    style={{ color: "#7C3AED" }}
                  >
                    <IconExternalLink />
                    {eliteSite.domaine}
                  </a>
                )}

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Domaine réservé</span>
                    <span className="font-medium text-gray-800">{eliteSite.domaine}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Plan souscrit</span>
                    <span
                      className="font-semibold text-xs px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
                    >
                      {planLabel} 👑
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Demande soumise le</span>
                    <span className="font-medium text-gray-800">
                      {new Date(eliteSite.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section infos questionnaire */}
              {(eliteSite.type_activite || eliteSite.nom_professionnel || eliteSite.ville_principale || eliteSite.style_description) && (
                <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Informations de votre site</h2>
                  <div className="space-y-3">
                    {eliteSite.nom_professionnel && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F0FF" }}>
                          <svg className="w-4 h-4" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Nom professionnel</div>
                          <div className="text-sm font-medium text-gray-800">{eliteSite.nom_professionnel}</div>
                        </div>
                      </div>
                    )}
                    {eliteSite.type_activite && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F0FF" }}>
                          <svg className="w-4 h-4" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Type d&apos;activité</div>
                          <div className="text-sm font-medium text-gray-800">{eliteSite.type_activite}</div>
                        </div>
                      </div>
                    )}
                    {eliteSite.ville_principale && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F0FF" }}>
                          <svg className="w-4 h-4" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Ville principale</div>
                          <div className="text-sm font-medium text-gray-800">{eliteSite.ville_principale}</div>
                        </div>
                      </div>
                    )}
                    {eliteSite.style_description && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F0FF" }}>
                          <svg className="w-4 h-4" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Style souhaité</div>
                          <div className="text-sm font-medium text-gray-800">{eliteSite.style_description}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {eliteSite.statut === "en_attente" && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <Link
                        href="/elite/questionnaire?from=dashboard"
                        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:opacity-80"
                        style={{ background: "#F3F0FF", color: "#7C3AED" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier ma demande
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Section support */}
              <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Support</h2>
                <div className="space-y-3">
                  <Link
                    href="/contact"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F0FF" }}>
                        <svg className="w-4 h-4" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Une question sur votre site ?</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/cgu#article-12"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F0FF" }}>
                        <svg className="w-4 h-4" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Voir les conditions</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
