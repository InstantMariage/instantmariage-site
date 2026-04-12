"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import type { PlanAbonnement } from "@/lib/supabase";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconCreditCard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path strokeLinecap="round" d="M2 10h20" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" />
  </svg>
);

const IconExternalLink = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IconWarning = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<PlanAbonnement, {
  label: string;
  badgeBg: string;
  badgeColor: string;
  prix: number | null;
  features: string[];
}> = {
  gratuit: {
    label: "Gratuit",
    badgeBg: "#6B7280",
    badgeColor: "white",
    prix: null,
    features: ["Profil de base visible", "Annuaire des prestataires"],
  },
  starter: {
    label: "Starter",
    badgeBg: "#3B82F6",
    badgeColor: "white",
    prix: 9.90,
    features: ["Profil enrichi", "Générateur de devis (limité à 5/mois)", "Support email"],
  },
  pro: {
    label: "Pro",
    badgeBg: "#F06292",
    badgeColor: "white",
    prix: 19.90,
    features: ["Devis illimités", "Factures & contrats", "Statistiques avancées", "Support prioritaire"],
  },
  premium: {
    label: "Premium",
    badgeBg: "linear-gradient(135deg, #C9A96E, #A67C52)",
    badgeColor: "white",
    prix: 39.90,
    features: ["Tout Pro inclus", "Badge Premium", "Profil en avant-première", "Support dédié"],
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Invoice = {
  id: string;
  number: string | null;
  amount_paid: number;
  currency: string;
  created: number;
  pdf_url: string | null;
  hosted_url: string | null;
  period_start: number;
  period_end: number;
};

type AbonnementData = {
  plan: PlanAbonnement;
  statut: string;
  date_fin: string | null;
  prix: number;
  stripe_subscription_id: string | null;
  cancel_at_period_end?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateStr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AbonnementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prestataireId, setPrestataireId] = useState<string | null>(null);
  const [abonnement, setAbonnement] = useState<AbonnementData | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      // Récupérer le prestataire
      const { data: prestataire } = await supabase
        .from("prestataires")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!prestataire) {
        router.replace("/dashboard/prestataire");
        return;
      }

      setPrestataireId(prestataire.id);

      // Récupérer l'abonnement
      const { data: abo } = await supabase
        .from("abonnements")
        .select("plan, statut, date_fin, prix, stripe_subscription_id")
        .eq("prestataire_id", prestataire.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (abo) {
        setAbonnement(abo);

        // Vérifier cancel_at_period_end via API Stripe si abonnement actif
        if (abo.stripe_subscription_id && abo.statut === "actif") {
          try {
            const res = await fetch(
              `/api/stripe/subscription-status?subscriptionId=${abo.stripe_subscription_id}`
            );
            if (res.ok) {
              const { cancel_at_period_end } = await res.json();
              setCancelAtPeriodEnd(cancel_at_period_end ?? false);
            }
          } catch {
            // On ignore si l'API n'est pas dispo
          }
        }
      }

      setLoading(false);

      // Charger les factures
      setInvoicesLoading(true);
      try {
        const res = await fetch(
          `/api/stripe/invoices?prestataireId=${prestataire.id}`
        );
        if (res.ok) {
          const { invoices: data } = await res.json();
          setInvoices(data ?? []);
        }
      } catch {
        // silencieux
      } finally {
        setInvoicesLoading(false);
      }
    });
  }, [router]);

  async function handleCancelSubscription() {
    if (!prestataireId) return;
    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prestataireId }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setCancelError(error ?? "Une erreur est survenue");
        return;
      }

      setCancelSuccess(true);
      setCancelAtPeriodEnd(true);
      setShowCancelModal(false);
    } catch {
      setCancelError("Une erreur réseau est survenue");
    } finally {
      setCancelLoading(false);
    }
  }

  const planConfig = abonnement ? PLAN_CONFIG[abonnement.plan] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Retour */}
        <Link
          href="/dashboard/prestataire"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
        >
          <IconArrowLeft />
          Retour au tableau de bord
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 font-playfair mb-6">
          Mon abonnement
        </h1>

        {/* Succès annulation */}
        {cancelSuccess && (
          <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
            <span className="mt-0.5 flex-shrink-0 bg-green-100 rounded-full p-0.5">
              <IconCheck />
            </span>
            <div>
              <p className="font-semibold text-sm">Annulation programmée</p>
              <p className="text-sm mt-0.5">
                Votre abonnement sera résilié à la fin de la période en cours. Vous conservez tous vos accès jusqu&apos;à cette date.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── Carte plan actuel ─────────────────────────────────────── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="px-6 py-4"
                style={{
                  background: planConfig
                    ? `linear-gradient(135deg, ${planConfig.badgeBg}22 0%, ${planConfig.badgeBg}08 100%)`
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Plan actuel
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-lg font-bold"
                        style={{ color: planConfig?.badgeBg }}
                      >
                        {planConfig?.label ?? "—"}
                      </span>
                      {abonnement && abonnement.statut === "actif" && !cancelAtPeriodEnd && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          Actif
                        </span>
                      )}
                      {cancelAtPeriodEnd && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                          Résiliation programmée
                        </span>
                      )}
                      {abonnement && abonnement.statut === "inactif" && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                          Inactif
                        </span>
                      )}
                    </div>
                  </div>

                  {planConfig?.prix != null && (
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {planConfig.prix.toFixed(2).replace(".", ",")} €
                      </span>
                      <span className="text-sm text-gray-400 ml-1">/mois</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {planConfig && planConfig.features.length > 0 && (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {planConfig.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: planConfig.badgeBg + "22" }}>
                          <svg className="w-2.5 h-2.5" style={{ color: planConfig.badgeBg }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Dates */}
              {abonnement && abonnement.date_fin && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 text-sm text-gray-600">
                  <IconCalendar />
                  <span>
                    {cancelAtPeriodEnd ? (
                      <>
                        Accès jusqu&apos;au{" "}
                        <strong className="text-gray-900">{formatDateStr(abonnement.date_fin)}</strong>
                      </>
                    ) : (
                      <>
                        Prochain renouvellement le{" "}
                        <strong className="text-gray-900">{formatDateStr(abonnement.date_fin)}</strong>
                      </>
                    )}
                  </span>
                </div>
              )}

              {abonnement && abonnement.statut === "gratuit" && !abonnement.date_fin && (
                <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
                  Aucun renouvellement — plan gratuit
                </div>
              )}
            </section>

            {/* ── Actions ──────────────────────────────────────────────── */}
            <section className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tarifs"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Changer de plan
              </Link>

              {abonnement && abonnement.statut === "actif" && !cancelAtPeriodEnd && abonnement.plan !== "gratuit" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler mon abonnement
                </button>
              )}
            </section>

            {/* ── Historique des factures ───────────────────────────────── */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <IconCreditCard />
                <h2 className="font-semibold text-gray-900">Historique des factures</h2>
              </div>

              {invoicesLoading ? (
                <div className="px-6 py-8 flex justify-center">
                  <div className="w-6 h-6 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400">
                  Aucune facture disponible pour le moment.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <li key={inv.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inv.number ?? inv.id}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(inv.period_start)} → {formatDate(inv.period_end)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(inv.amount_paid, inv.currency)}
                        </span>
                        <div className="flex items-center gap-1">
                          {inv.pdf_url && (
                            <a
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Télécharger le PDF"
                            >
                              <IconDownload />
                              PDF
                            </a>
                          )}
                          {inv.hosted_url && (
                            <a
                              href={inv.hosted_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Voir la facture en ligne"
                            >
                              <IconExternalLink />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />

      {/* ── Modal confirmation annulation ─────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <IconWarning />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Annuler l&apos;abonnement</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Cette action est irréversible depuis cette interface.
                </p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5 text-sm text-orange-800">
              <p className="font-medium mb-1">Ce qui va se passer :</p>
              <ul className="space-y-1 text-orange-700">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  Votre abonnement sera résilié à la <strong>fin de la période en cours</strong>.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  Vous conservez tous vos accès jusqu&apos;à cette date.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  Aucun remboursement au prorata ne sera effectué.
                </li>
              </ul>
            </div>

            {cancelError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                {cancelError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Garder mon abonnement
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    En cours…
                  </>
                ) : (
                  "Confirmer l'annulation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
