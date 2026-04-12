"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    id: "gratuit",
    name: "Gratuit",
    price: 0,
    priceAnnual: 0,
    period: "",
    description: "Pour démarrer votre présence en ligne",
    color: "gray",
    features: [
      "Profil basique dans l'annuaire",
      "Photo de profil",
      "Coordonnées visibles",
      "Visible dans les recherches",
    ],
    cta: "Commencer gratuitement",
    priceId: null,
    recommended: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 9.9,
    priceAnnual: 7.92,
    period: "/mois",
    description: "Pour les prestataires qui débutent",
    color: "rose",
    features: [
      "Tout du plan Gratuit",
      "Générateur de devis (5/mois)",
      "Galerie photos (10 photos)",
      "Lien vers votre site web",
      "Formulaire de contact",
    ],
    cta: "Choisir Starter",
    priceId: "price_1TJbkIKKBs85XtqBrD4MvZDu",
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.9,
    priceAnnual: 15.92,
    period: "/mois",
    description: "La formule préférée des pros",
    color: "rose-strong",
    features: [
      "Tout du plan Starter",
      "Devis illimités",
      "Gestion des factures",
      "Modèles de contrats",
      "Badge prestataire vérifié",
      "Statistiques de visites",
    ],
    cta: "Choisir Pro",
    priceId: "price_1TJblgKKBs85XtqBUD5euLaF",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 39.9,
    priceAnnual: 31.92,
    period: "/mois",
    description: "Visibilité maximale, résultats garantis",
    color: "gold",
    features: [
      "Tout du plan Pro",
      "Top des résultats de recherche",
      "Mise en avant sur la homepage",
      "Photos illimitées",
      "Support prioritaire 7j/7",
      "Accès aux mariés en avant-première",
    ],
    cta: "Choisir Premium",
    priceId: "price_1TJbmfKKBs85XtqBN57D6Z5U",
    recommended: false,
  },
];

const faqItems = [
  {
    q: "Puis-je changer de formule à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis votre espace prestataire. Le changement prend effet immédiatement, et la différence est calculée au prorata.",
  },
  {
    q: "Comment fonctionne la réduction annuelle ?",
    a: "En choisissant la facturation annuelle, vous économisez 20% sur votre abonnement. Le montant est prélevé en une seule fois pour l'année complète. Vous pouvez annuler à tout moment et être remboursé au prorata.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Absolument. Toutes vos données (devis, contrats, photos) sont hébergées en France sur des serveurs sécurisés, conformément au RGPD. Vos clients ne voient que ce que vous choisissez de partager.",
  },
  {
    q: "Comment fonctionne le badge « Prestataire vérifié » ?",
    a: "Le badge vérifié est attribué après vérification de votre identité et de vos activités professionnelles. Il rassure les futurs mariés sur le sérieux de votre prestation et améliore votre classement dans les résultats.",
  },
];

const coupleTools = [
  { icon: "👥", label: "Liste d'invités", desc: "Gérez invitations et confirmations" },
  { icon: "🪑", label: "Plan de table", desc: "Organisez vos tables facilement" },
  { icon: "📅", label: "Rétroplanning", desc: "Planifiez chaque étape du mariage" },
  { icon: "💰", label: "Budget mariage", desc: "Suivez chaque dépense en temps réel" },
  { icon: "✅", label: "Checklist", desc: "Ne rien oublier le grand jour" },
  { icon: "💌", label: "Faire-part digital", desc: "Créez votre faire-part en ligne" },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function TarifsContent() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [prestataireId, setPrestataireId] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const role = session.user.user_metadata?.role ?? "marie";
      if (role === "marie") {
        router.replace("/dashboard/marie");
        return;
      }
      const { data: prestataire } = await supabase
        .from("prestataires")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      if (!prestataire) return;
      setPrestataireId(prestataire.id);

      // Vérifier si un abonnement payant actif existe déjà
      const { data: abo } = await supabase
        .from("abonnements")
        .select("stripe_subscription_id, statut, plan")
        .eq("prestataire_id", prestataire.id)
        .eq("statut", "actif")
        .not("stripe_subscription_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (abo?.stripe_subscription_id && abo.plan !== "gratuit") {
        setHasActiveSubscription(true);
      }
    });
  }, [router]);

  async function handleSubscribe(plan: typeof plans[number]) {
    if (!plan.priceId) {
      router.push("/inscription");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?redirect=/tarifs");
      return;
    }

    setLoadingPlan(plan.id);

    // Abonnement actif → Customer Portal (upgrade/downgrade/annulation/carte)
    if (hasActiveSubscription && prestataireId) {
      try {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prestataireId }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Une erreur est survenue. Veuillez réessayer.");
          setLoadingPlan(null);
        }
      } catch {
        alert("Une erreur est survenue. Veuillez réessayer.");
        setLoadingPlan(null);
      }
      return;
    }

    // Pas d'abonnement → Checkout Stripe (premier abonnement)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, prestataireId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
        setLoadingPlan(null);
      }
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="pt-20 md:pt-24">

      {/* ─── HERO HEADER ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
      >
        {/* decorative blobs */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #fff, transparent)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #fff, transparent)" }}
        />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/20 text-white text-sm font-semibold tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full">
            Tarifs prestataires
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Choisissez votre formule
          </h1>
          <p className="text-rose-100 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Développez votre activité mariage. Commencez gratuitement,
            évoluez à votre rythme.
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-2 py-2 shadow-lg">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                !annual
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={!annual ? { background: "#F06292" } : {}}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                annual
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={annual ? { background: "#F06292" } : {}}
            >
              Annuel
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={
                  annual
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "rgba(240,98,146,0.12)", color: "#F06292" }
                }
              >
                −20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── PRICING CARDS ───────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-stretch">
            {plans.filter((p) => p.id !== "gratuit").map((plan) => {
              const displayPrice = annual ? plan.priceAnnual : plan.price;
              const isPro = plan.id === "pro";
              const isGold = plan.id === "premium";

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl transition-all duration-300 ${
                    isPro
                      ? "shadow-2xl md:scale-105 z-10"
                      : "shadow-md hover:shadow-xl hover:-translate-y-1"
                  }`}
                  style={
                    isPro
                      ? {
                          background: "linear-gradient(145deg, #F06292, #E91E63)",
                          border: "none",
                        }
                      : isGold
                      ? {
                          background: "#fff",
                          border: "2px solid #C9A96E",
                        }
                      : {
                          background: "#fff",
                          border: "1.5px solid #f3f4f6",
                        }
                  }
                >
                  {/* Badge recommandé */}
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="bg-white text-rose-500 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide">
                        ✦ Recommandé
                      </span>
                    </div>
                  )}
                  {isGold && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span
                        className="text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide"
                        style={{
                          background: "linear-gradient(135deg, #C9A96E, #A67C52)",
                          color: "#fff",
                        }}
                      >
                        ★ Top visibilité
                      </span>
                    </div>
                  )}

                  <div className="p-8 sm:p-7 flex flex-col flex-1">
                    {/* Plan name & description */}
                    <div className="mb-6">
                      <p
                        className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                          isPro ? "text-rose-200" : isGold ? "text-amber-500" : "text-gray-400"
                        }`}
                      >
                        {plan.name}
                      </p>
                      <p
                        className={`text-sm leading-snug ${
                          isPro ? "text-rose-100" : "text-gray-500"
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-7">
                      {plan.price === 0 ? (
                        <div>
                          <span
                            className={`text-5xl font-extrabold ${
                              isPro ? "text-white" : "text-gray-900"
                            }`}
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                          >
                            Gratuit
                          </span>
                          <p className={`text-sm mt-1 ${isPro ? "text-rose-200" : "text-gray-400"}`}>
                            Pour toujours
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-end gap-1">
                            <span
                              className={`text-5xl font-extrabold leading-none ${
                                isPro ? "text-white" : isGold ? "text-amber-700" : "text-gray-900"
                              }`}
                              style={{ fontFamily: "var(--font-playfair), serif" }}
                            >
                              {displayPrice.toFixed(2).replace(".", ",")}€
                            </span>
                            <span
                              className={`text-sm pb-1.5 ${
                                isPro ? "text-rose-200" : "text-gray-400"
                              }`}
                            >
                              /mois
                            </span>
                          </div>
                          {annual && (
                            <p
                              className={`text-xs mt-1 ${
                                isPro ? "text-rose-200" : "text-gray-400"
                              }`}
                            >
                              Facturé{" "}
                              <span className="font-semibold">
                                {(displayPrice * 12).toFixed(2).replace(".", ",")}€/an
                              </span>
                            </p>
                          )}
                          {!annual && (
                            <p
                              className={`text-xs mt-1 ${
                                isPro ? "text-rose-200" : "text-gray-400"
                              }`}
                            >
                              ou{" "}
                              <span className="font-semibold" style={isPro ? {} : { color: "#F06292" }}>
                                {plan.priceAnnual.toFixed(2).replace(".", ",")}€/mois
                              </span>{" "}
                              en annuel
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 ${
                              isPro
                                ? "text-white"
                                : isGold
                                ? "text-amber-500"
                                : "text-rose-400"
                            }`}
                          >
                            <CheckIcon />
                          </span>
                          <span
                            className={`text-sm leading-snug ${
                              isPro ? "text-rose-50" : "text-gray-600"
                            }`}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlan === plan.id}
                      className={`block w-full text-center text-sm font-semibold px-6 py-3.5 rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                        isPro
                          ? "bg-white text-rose-500 hover:bg-rose-50 shadow-md hover:shadow-lg"
                          : isGold
                          ? "text-white hover:opacity-90"
                          : plan.price === 0
                          ? "border-2 border-gray-200 text-gray-600 hover:border-rose-300 hover:text-[#F06292]"
                          : "text-white hover:opacity-90"
                      }`}
                      style={
                        isGold
                          ? { background: "linear-gradient(135deg, #C9A96E, #A67C52)" }
                          : !isPro && plan.price > 0
                          ? { background: "linear-gradient(135deg, #F06292, #e91e8c)" }
                          : {}
                      }
                    >
                      {loadingPlan === plan.id ? "Chargement…" : plan.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Sans engagement · Annulation à tout moment · Paiement sécurisé
          </p>
        </div>
      </section>

      {/* ─── SECTION MARIÉS ──────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white shadow-xl overflow-hidden">
            <div
              className="px-8 py-10 md:py-12 text-center"
              style={{ background: "linear-gradient(135deg, #F06292, #E91E63)" }}
            >
              <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Pour les futurs mariés
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                100% Gratuit pour les mariés
              </h2>
              <p className="text-rose-100 text-lg max-w-xl mx-auto">
                Tous nos outils de planification sont offerts aux futurs mariés.
                Organisez votre mariage parfait sans dépenser un centime.
              </p>
            </div>

            <div className="px-8 py-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {coupleTools.map((tool) => (
                  <div
                    key={tool.label}
                    className="flex items-start gap-3 p-4 rounded-2xl hover:bg-rose-50 transition-colors duration-200 group cursor-pointer"
                  >
                    <span className="text-2xl leading-none mt-0.5">{tool.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[#F06292] transition-colors">
                        {tool.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="#"
                  className="inline-block text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #F06292, #E91E63)" }}
                >
                  Créer mon compte mariés gratuitement
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Questions fréquentes
            </h2>
            <p className="text-gray-400 mt-3 text-lg">Tout ce que vous devez savoir sur nos formules</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200 hover:border-rose-200"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span
                    className={`text-sm md:text-base font-semibold transition-colors duration-200 ${
                      openFaq === i ? "" : "text-gray-800 group-hover:text-[#F06292]"
                    }`}
                    style={openFaq === i ? { color: "#F06292" } : {}}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      openFaq === i
                        ? "text-white"
                        : "bg-gray-100 text-gray-400 group-hover:bg-rose-50 group-hover:text-[#F06292]"
                    }`}
                    style={openFaq === i ? { background: "#F06292" } : {}}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl overflow-hidden px-8 py-14 md:py-20 shadow-2xl"
            style={{ background: "linear-gradient(145deg, #F06292 0%, #E91E63 60%, #C2185B 100%)" }}
          >
            {/* decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ background: "#fff", transform: "translate(30%, -30%)" }}
            />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ background: "#fff", transform: "translate(-30%, 30%)" }}
            />

            <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Prêt à vous lancer ?
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-5"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Rejoignez les meilleurs
              <br />
              prestataires mariage
            </h2>
            <p className="text-rose-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Créez votre profil en 2 minutes et commencez à recevoir des demandes de mariés dès aujourd'hui.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#"
                className="inline-block bg-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm"
                style={{ color: "#F06292" }}
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#"
                className="inline-block bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 border border-white/30 text-sm"
              >
                Nous contacter
              </Link>
            </div>

            <p className="text-rose-200 text-xs mt-8">
              Aucune carte bancaire requise · Accès immédiat · Annulation sans frais
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
