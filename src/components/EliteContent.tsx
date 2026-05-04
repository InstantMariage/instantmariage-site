"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─── Domain checker ─────────────────────────────────── */

type DomainStatus = "idle" | "checking" | "available" | "taken";

function getDomainBase(domain: string): string {
  return domain.replace(/\.(fr|com|net|org|io)$/i, "").toLowerCase().trim();
}

async function checkDomainRDAP(domain: string): Promise<boolean | null> {
  try {
    const res = await fetch(`/api/elite/check-domain?domain=${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return data.available ?? null;
  } catch {
    return null;
  }
}

interface DomainCheckerProps {
  eliteMode: "vitrine" | "shop";
  setEliteMode: (mode: "vitrine" | "shop") => void;
  onCheckout: (domain: string) => void;
  loading: boolean;
}

function DomainChecker({ eliteMode, setEliteMode, onCheckout, loading }: DomainCheckerProps) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<DomainStatus>("idle");
  const [autoExtension, setAutoExtension] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async (domain: string) => {
    let trimmed = domain.trim();
    if (!trimmed || trimmed.length < 4) {
      setStatus("idle");
      setAutoExtension(false);
      return;
    }
    const hasDot = trimmed.includes(".");
    if (!hasDot) {
      trimmed = trimmed + ".fr";
      setInput(trimmed);
      setAutoExtension(true);
    } else {
      setAutoExtension(false);
    }
    setStatus("checking");
    const available = await checkDomainRDAP(trimmed);
    setStatus(available === null ? "idle" : available ? "available" : "taken");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setAutoExtension(false);
    setStatus(val.trim().length >= 4 ? "checking" : "idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => check(val), 500);
  }

  function handleAlternativeClick(alt: string) {
    setInput(alt);
    setAutoExtension(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    check(alt);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const base = getDomainBase(input);
  const suggestions = base
    ? [
        `${base}-mariage.fr`,
        `${base}-pro.fr`,
        `${base}-mariage2026.fr`,
        `${base}-events.fr`,
        `${base}-wedding.fr`,
        `atelier-${base}.fr`,
      ]
    : [];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="ex: dupont-photographe.fr"
          className="flex-1 rounded-xl border border-purple-200 bg-white px-4 py-3 text-gray-800 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400"
        />
        <button
          onClick={() => check(input)}
          className="px-5 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
        >
          Vérifier
        </button>
      </div>
      {autoExtension && (
        <p className="mt-1.5 text-xs text-gray-400 pl-1">Nous avons ajouté .fr automatiquement</p>
      )}

      {/* Spinner */}
      {status === "checking" && (
        <div className="mt-4 flex items-center gap-2 text-purple-600 text-sm">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Vérification en cours…
        </div>
      )}

      {/* Available → toggle + checkout */}
      {status === "available" && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-5">
          <p className="text-green-700 font-semibold mb-4">
            🎉 Ce domaine est disponible ! Réservez-le avec le pack Elite avant qu'il ne soit pris.
          </p>
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-full overflow-hidden border border-purple-300">
              <button
                onClick={() => setEliteMode("vitrine")}
                className="px-5 py-2 text-sm font-semibold transition-all duration-200"
                style={
                  eliteMode === "vitrine"
                    ? { background: "#5B21B6", color: "#fff" }
                    : { background: "transparent", color: "#5B21B6" }
                }
              >
                Vitrine — 99,90€/mois
              </button>
              <button
                onClick={() => setEliteMode("shop")}
                className="px-5 py-2 text-sm font-semibold transition-all duration-200"
                style={
                  eliteMode === "shop"
                    ? { background: "#5B21B6", color: "#fff" }
                    : { background: "transparent", color: "#5B21B6" }
                }
              >
                Shop — 149€/mois
              </button>
            </div>
          </div>
          <button
            onClick={() => onCheckout(input)}
            disabled={loading}
            className="w-full px-5 py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
          >
            {loading
              ? "Chargement…"
              : eliteMode === "vitrine"
              ? "Choisir Elite Vitrine →"
              : "Choisir Elite Shop →"}
          </button>
        </div>
      )}

      {/* Taken → clickable alternatives, no /contact link */}
      {status === "taken" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-red-600 font-semibold mb-3">
            Ce domaine est déjà pris. Voici quelques alternatives :
          </p>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  onClick={() => handleAlternativeClick(s)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-700 transition-colors group w-full text-left"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 group-hover:bg-purple-600 inline-block flex-shrink-0 transition-colors" />
                  <span className="font-mono font-medium group-hover:underline">{s}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const ELITE_PRICE_IDS = {
  vitrine: { monthly: "price_1TTOW1KKBs85XtqBEJMJ1GVr", yearly: "price_1TS1kJKKBs85XtqB2FHvqvCk" },
  shop:    { monthly: "price_1TTOaUKKBs85XtqBMVJfxlET", yearly: "price_1TTOc3KKBs85XtqB4woasCVh" },
};

/* ─── Comparatif table data ──────────────────────────── */

const compareRows = [
  {
    label: "Création site",
    agence: "5 000–15 000€",
    freelance: "1 500–5 000€",
    elite: "✅ Inclus",
  },
  { label: "Délai", agence: "2–3 mois", freelance: "3–6 semaines", elite: "✅ 72h" },
  {
    label: "Maintenance",
    agence: "150–300€/mois",
    freelance: "❌ Non incluse",
    elite: "✅ Incluse",
  },
  {
    label: "Visibilité mariage",
    agence: "❌ Aucune",
    freelance: "❌ Aucune",
    elite: "✅ InstantMariage",
  },
  { label: "Domaine perso", agence: "En option", freelance: "En option", elite: "✅ Inclus" },
  { label: "Dashboard stats", agence: "En option", freelance: "❌", elite: "✅ Inclus" },
  {
    label: "Prix total 1 an",
    agence: "15 000€+",
    freelance: "5 000€+",
    elite: "À partir de 1 788€",
  },
];

/* ─── Buyout table data ──────────────────────────────── */

const buyoutRows = [
  { period: "Moins de 6 mois", price: "8 000€" },
  { period: "6 à 12 mois", price: "6 000€" },
  { period: "1 à 2 ans", price: "4 500€" },
  { period: "Plus de 2 ans", price: "3 000€" },
];

/* ─── FAQ data & component ───────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Combien coûte la création d'un site web avec le Pack Elite ?",
    a: "À partir de 99,90€/mois pour un site vitrine, 149€/mois pour un site avec boutique en ligne. Le nom de domaine est inclus.",
  },
  {
    q: "En combien de temps mon site sera-t-il en ligne ?",
    a: "Votre site est livré en 72h après réception de votre questionnaire complet.",
  },
  {
    q: "Je reste propriétaire de mon site ?",
    a: "Le site reste la propriété d'InstantMariage tant que vous êtes abonné. Vous pouvez le racheter à tout moment selon notre barème dégressif.",
  },
  {
    q: "Puis-je modifier mon site après livraison ?",
    a: "Oui, les mises à jour sont incluses dans votre abonnement. Contactez notre équipe pour toute modification.",
  },
  {
    q: "Que se passe-t-il si j'arrête mon abonnement ?",
    a: "En cas de résiliation, votre site est mis hors ligne dans les 48h. Votre domaine reste réservé pendant 30 jours.",
  },
  {
    q: "Le Pack Elite inclut-il la visibilité sur InstantMariage ?",
    a: "Oui, votre profil est mis en avant sur l'annuaire InstantMariage avec un badge Elite exclusif.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-3xl mx-auto px-4">
        <h2
          className="text-center mb-12 text-gray-900"
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(36px, 5vw, 48px)",
            fontWeight: 700,
          }}
        >
          Questions fréquentes
        </h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ borderTop: "1px solid #E5E7EB" }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4"
              >
                <span
                  className="text-gray-900 font-medium text-base leading-snug"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 20 }}
                >
                  {item.q}
                </span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-lg font-bold transition-colors"
                  style={{ background: openIndex === i ? "#7C3AED" : "#E5E7EB", color: openIndex === i ? "#fff" : "#6B7280" }}
                >
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <p
                  className="pb-5 text-gray-600 leading-relaxed text-sm md:text-base"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  {item.a}
                </p>
              )}
            </div>
          ))}
          <div style={{ borderTop: "1px solid #E5E7EB" }} />
        </div>
      </div>
    </section>
  );
}

/* ─── Main component ─────────────────────────────────── */

export default function EliteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [eliteMode, setEliteMode] = useState<"vitrine" | "shop">(
    searchParams.get("plan") === "shop" ? "shop" : "vitrine"
  );
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  function scrollToDomainChecker() {
    document.getElementById("verifier-domaine")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleCheckout(domain: string, mode?: "vitrine" | "shop") {
    const m = mode ?? eliteMode;
    const redirectParam = encodeURIComponent(`/elite?plan=${m}`);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/inscription?type=prestataire&redirect=${redirectParam}`);
      return;
    }
    setLoading(true);
    const { data: prestataire } = await supabase
      .from("prestataires")
      .select("id")
      .eq("user_id", session.user.id)
      .single();
    if (!prestataire) {
      router.push("/inscription");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: ELITE_PRICE_IDS[m][billingCycle === "yearly" ? "yearly" : "monthly"], prestataireId: prestataire.id, domain }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
        setLoading(false);
      }
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div className="pt-20 md:pt-24">

      {/* ── SECTION 1 — HERO ───────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: "linear-gradient(135deg, #150D2E 0%, #1E1040 60%, #2D1B69 100%)" }}
      >
        {/* decorative blobs */}
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #F06292, transparent)" }}
        />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(124,58,237,0.3)", color: "#C4B5FD", border: "1px solid #7C3AED" }}
          >
            👑 Pack Elite — Site Pro Mariage
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Votre site pro mariage<br />
            <span style={{ color: "#C4B5FD" }}>en 72h — clé en main</span>
          </h1>
          <p className="text-purple-200 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Nom de domaine inclus&nbsp;•&nbsp;Maintenance incluse&nbsp;•&nbsp;Visibilité sur InstantMariage
          </p>
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={() => document.getElementById("realisations")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-4 rounded-full font-bold text-base shadow-2xl transition-all duration-200 hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "#fff", color: "#7C3AED" }}
            >
              Découvrir nos réalisations →
            </button>
            <p className="text-sm text-white/60 tracking-wide">
              100% sur mesure&nbsp;•&nbsp;Livraison 72h&nbsp;•&nbsp;Domaine inclus
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — VÉRIFICATEUR DE DOMAINE ───────────── */}
      <section id="verifier-domaine" className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ background: "#F3E8FF", color: "#7C3AED" }}
          >
            Domaine personnalisé
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Vérifiez la disponibilité<br />de votre domaine
          </h2>
          <p className="text-gray-500 mb-8 text-base">
            Votre domaine est inclus dans le pack Elite. Vérifiez qu'il est encore libre.
          </p>
          <DomainChecker
            eliteMode={eliteMode}
            setEliteMode={setEliteMode}
            onCheckout={handleCheckout}
            loading={loading}
          />
        </div>
      </section>

      {/* ── SECTION 3 — NOS RÉALISATIONS ──────────────────── */}
      <section id="realisations" className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "Cormorant Garamond, var(--font-playfair), Georgia, serif", fontWeight: 700 }}
            >
              Nos réalisations
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              Des sites créés sur mesure pour des prestataires mariage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                image: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/photographe/hero.jpg",
                badge: "📸 Photographie",
                name: "Léa Martin Photographie",
                description: "Site vitrine élégant pour photographe de mariage — style Apple noir et or",
                href: "/demo/photographe",
              },
              {
                image: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/boutique/hero.jpg",
                badge: "👗 Boutique",
                name: "Maison Blanche Bridal",
                description: "Boutique de robes de mariée sur mesure — style luxe blanc et champagne",
                href: "/demo/boutique",
              },
              {
                image: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/chauffeur/hero.jpg",
                badge: "🚗 Chauffeur",
                name: "Prestige Wedding Cars",
                description: "Service de chauffeur privé de luxe — style sombre et or",
                href: "/demo/chauffeur",
              },
              {
                image: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/salle/exterieur.jpg",
                badge: "🏰 Salle de réception",
                name: "Domaine des Lumières",
                description: "Salle de réception haut de gamme — style champagne et or",
                href: "/demo/salle",
              },
            ].map((card) => (
              <a
                key={card.href}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative overflow-hidden" style={{ height: 250 }}>
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className="absolute top-3 left-3 text-xs font-semibold text-white px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    {card.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="text-gray-900 mb-1"
                    style={{ fontFamily: "Cormorant Garamond, var(--font-playfair), Georgia, serif", fontSize: 24, fontWeight: 700 }}
                  >
                    {card.name}
                  </h3>
                  <p className="text-gray-500 mb-4" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
                    {card.description}
                  </p>
                  <span
                    className="inline-block rounded-full text-white font-semibold transition-colors"
                    style={{
                      background: "#7C3AED",
                      padding: "8px 20px",
                      fontSize: 14,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#5B21B6")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#7C3AED")}
                  >
                    Voir le site
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — CE QUI EST INCLUS ─────────────────── */}
      <section id="tarifs-elite" className="py-16 md:py-24" style={{ background: "#F9F5EE" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-gray-900 mb-4 leading-tight"
              style={{
                fontFamily: "Cormorant Garamond, var(--font-playfair), Georgia, serif",
                fontSize: "clamp(40px, 6vw, 64px)",
              }}
            >
              Ce qui est inclus
            </h2>
            <p className="text-gray-500 text-base md:text-lg">
              Choisissez le pack adapté à votre activité
            </p>

            {/* Toggle Mensuel / Annuel */}
            <div className="flex items-center justify-center mt-6">
              <div className="inline-flex rounded-full overflow-hidden border border-purple-200 bg-white shadow-sm">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className="px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                  style={
                    billingCycle === "monthly"
                      ? { background: "#7C3AED", color: "#fff" }
                      : { background: "transparent", color: "#7C3AED" }
                  }
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className="px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                  style={
                    billingCycle === "yearly"
                      ? { background: "#7C3AED", color: "#fff" }
                      : { background: "transparent", color: "#7C3AED" }
                  }
                >
                  Annuel
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Card Vitrine */}
            <div className="rounded-3xl overflow-hidden bg-white shadow-lg border border-gray-200 flex flex-col">
              <div className="px-7 py-6 text-center" style={{ background: "#7C3AED" }}>
                <p className="text-white text-xl font-bold mb-1">Elite Vitrine</p>
                {billingCycle === "monthly" ? (
                  <p className="text-purple-200 font-extrabold" style={{ fontSize: 32 }}>
                    99,90€<span className="text-lg font-semibold">/mois</span>
                  </p>
                ) : (
                  <>
                    <p className="text-purple-200 font-extrabold" style={{ fontSize: 32 }}>
                      79,90€<span className="text-lg font-semibold">/mois</span>
                    </p>
                    <p className="text-purple-300 text-xs mt-1">soit 958,80€/an</p>
                    <p className="text-green-300 text-xs font-semibold mt-0.5">Économisez 2 mois</p>
                  </>
                )}
              </div>
              <div className="px-7 py-6 flex flex-col flex-1">
                <ul className="space-y-2.5 text-sm flex-1 mb-8">
                  {[
                    ["✅", "Site web sur mesure créé en 72h"],
                    ["✅", "Nom de domaine personnalisé inclus"],
                    ["✅", "Certificat SSL sécurisé"],
                    ["✅", "Page d'accueil avec hero plein écran"],
                    ["✅", "Page services & tarifs"],
                    ["✅", "Galerie photos illimitée"],
                    ["✅", "Page à propos"],
                    ["✅", "Formulaire de contact"],
                    ["✅", "100% responsive mobile"],
                    ["✅", "Dashboard : stats de visites"],
                    ["✅", "Profil mis en avant sur InstantMariage"],
                    ["✅", "Maintenance & mises à jour incluses"],
                    ["✅", "Support prioritaire 7j/7"],
                    ["❌", "Boutique en ligne"],
                    ["❌", "Paiement client intégré"],
                    ["❌", "Gestion commandes & stocks"],
                  ].map(([icon, label]) => (
                    <li key={label} className={`flex items-center gap-2 ${icon === "❌" ? "text-gray-400" : "text-gray-700"}`}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("", "vitrine")}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#7C3AED" }}
                >
                  {loading ? "Chargement…" : "Choisir Vitrine →"}
                </button>
              </div>
            </div>

            {/* Card Shop */}
            <div
              className="rounded-3xl overflow-hidden bg-white shadow-xl flex flex-col border-2"
              style={{ borderColor: "#C9A84C" }}
            >
              <div className="px-7 py-6 text-center" style={{ background: "#0A0A0A" }}>
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2"
                  style={{ background: "#C9A84C", color: "#0A0A0A" }}
                >
                  ⭐ Le plus complet
                </span>
                <p className="text-white text-xl font-bold mb-1">Elite Shop</p>
                {billingCycle === "monthly" ? (
                  <p className="text-gray-300 font-extrabold" style={{ fontSize: 32 }}>
                    149€<span className="text-lg font-semibold">/mois</span>
                  </p>
                ) : (
                  <>
                    <p className="text-gray-300 font-extrabold" style={{ fontSize: 32 }}>
                      119€<span className="text-lg font-semibold">/mois</span>
                    </p>
                    <p className="text-gray-400 text-xs mt-1">soit 1 428€/an</p>
                    <p className="text-green-400 text-xs font-semibold mt-0.5">Économisez 2 mois</p>
                  </>
                )}
              </div>
              <div className="px-7 py-6 flex flex-col flex-1">
                <ul className="space-y-2.5 text-sm text-gray-700 flex-1 mb-8">
                  {[
                    "Tout le pack Vitrine inclus",
                    "Boutique en ligne complète",
                    "Paiement Stripe intégré pour vos clients",
                    "Gestion des commandes",
                    "Gestion des stocks",
                    "Dashboard ventes & statistiques avancées",
                    "Emails automatiques à vos clients",
                    "Page catalogue produits",
                    "Panier d'achat",
                    "Historique commandes clients",
                    "Export comptable CSV",
                  ].map((label) => (
                    <li key={label} className="flex items-center gap-2">
                      <span>✅</span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("", "shop")}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#0A0A0A" }}
                >
                  {loading ? "Chargement…" : "Choisir Shop →"}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Sans engagement&nbsp;•&nbsp;Résiliation = site hors ligne&nbsp;•&nbsp;Domaine inclus tant que vous êtes abonné
          </p>
        </div>
      </section>

      {/* ── SECTION 5 — COMPARATIF ─────────────────────────── */}
      <section
        className="py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #F9F5FF, #FDF2F8)" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              style={{ background: "#F3E8FF", color: "#7C3AED" }}
            >
              Comparatif
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Pourquoi choisir Elite<br />
              plutôt qu'une agence ?
            </h2>
          </div>

          <div className="overflow-x-auto rounded-3xl shadow-xl">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-50 text-left px-5 py-4 font-semibold text-gray-600 border-b border-gray-200 rounded-tl-3xl w-1/4" />
                  <th className="bg-gray-50 text-center px-5 py-4 font-semibold text-gray-600 border-b border-gray-200">
                    Agence web
                  </th>
                  <th className="bg-gray-50 text-center px-5 py-4 font-semibold text-gray-600 border-b border-gray-200">
                    Freelance
                  </th>
                  <th
                    className="text-center px-5 py-4 font-bold text-white border-b rounded-tr-3xl"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)", borderColor: "#5B21B6" }}
                  >
                    InstantMariage Elite
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => {
                  const isLast = i === compareRows.length - 1;
                  const isAlt = i % 2 === 0;
                  return (
                    <tr key={row.label}>
                      <td
                        className={`px-5 py-3.5 font-medium text-gray-700 ${isAlt ? "bg-gray-50" : "bg-white"} ${isLast ? "rounded-bl-3xl" : ""}`}
                      >
                        {row.label}
                      </td>
                      <td className={`px-5 py-3.5 text-center text-gray-500 ${isAlt ? "bg-gray-50" : "bg-white"}`}>
                        {row.agence}
                      </td>
                      <td className={`px-5 py-3.5 text-center text-gray-500 ${isAlt ? "bg-gray-50" : "bg-white"}`}>
                        {row.freelance}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-center font-semibold ${isLast ? "rounded-br-3xl" : ""}`}
                        style={{
                          background: isAlt
                            ? "rgba(124,58,237,0.08)"
                            : "rgba(124,58,237,0.04)",
                          color: "#5B21B6",
                        }}
                      >
                        {row.elite}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — RACHAT / LEASING ───────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4"
              style={{ background: "#F3E8FF", color: "#7C3AED" }}
            >
              Leasing & Propriété
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Vous souhaitez devenir<br />propriétaire de votre site ?
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto">
              Notre modèle fonctionne comme un leasing. Le site reste la propriété d'InstantMariage
              tant que vous êtes abonné. Vous pouvez le racheter à tout moment.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-lg border border-purple-100">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}>
                  <th className="text-left px-6 py-4 font-semibold text-white">Ancienneté</th>
                  <th className="text-right px-6 py-4 font-semibold text-white">Prix de rachat</th>
                </tr>
              </thead>
              <tbody>
                {buyoutRows.map((row, i) => (
                  <tr
                    key={row.period}
                    className={i % 2 === 0 ? "bg-purple-50/50" : "bg-white"}
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">{row.period}</td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: "#5B21B6" }}>
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-center text-sm text-gray-500 italic">
            Le site représente un investissement technique évalué à plus de 15 000€ en agence web traditionnelle.
          </p>
        </div>
      </section>

      {/* ── SECTION FAQ ────────────────────────────────────── */}
      <FAQSection />

      {/* ── SECTION 5 — CTA FINAL ──────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: "linear-gradient(135deg, #150D2E 0%, #1E1040 60%, #2D1B69 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Prêt à booster votre<br />activité mariage ?
          </h2>
          <p className="text-purple-200 text-lg mb-10">
            Rejoignez les prestataires qui ont choisi InstantMariage Elite
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex rounded-full overflow-hidden border" style={{ borderColor: "rgba(124,58,237,0.5)" }}>
              <button
                onClick={() => setEliteMode("vitrine")}
                className="px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                style={eliteMode === "vitrine" ? { background: "#5B21B6", color: "#fff" } : { background: "transparent", color: "#C4B5FD" }}
              >
                Vitrine — 99,90€/mois
              </button>
              <button
                onClick={() => setEliteMode("shop")}
                className="px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                style={eliteMode === "shop" ? { background: "#5B21B6", color: "#fff" } : { background: "transparent", color: "#C4B5FD" }}
              >
                Shop — 149€/mois
              </button>
            </div>
            <button
              onClick={() => handleCheckout("")}
              disabled={loading}
              className="px-8 py-4 rounded-2xl font-bold text-base text-white shadow-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
            >
              {loading ? "Chargement…" : eliteMode === "vitrine" ? "Choisir Elite Vitrine →" : "Choisir Elite Shop →"}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
