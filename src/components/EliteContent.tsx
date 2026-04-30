"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─── Domain checker ─────────────────────────────────── */

type DomainStatus = "idle" | "checking" | "available" | "taken";

function getDomainBase(domain: string): string {
  return domain.replace(/\.(fr|com|net|org|io)$/i, "").toLowerCase().trim();
}

async function checkDomainRDAP(domain: string): Promise<boolean> {
  const ext = domain.endsWith(".fr") ? "fr" : "com";
  const url =
    ext === "fr"
      ? `https://rdap.nic.fr/domain/${domain}`
      : `https://rdap.verisign.com/com/v1/domain/${domain}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    // 200 = domain registered, 404 = available
    return res.status === 404;
  } catch {
    // network error → treat as unknown, default available for UX
    return true;
  }
}

function DomainChecker() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<DomainStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async (domain: string) => {
    const trimmed = domain.trim();
    if (!trimmed || trimmed.length < 4) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const available = await checkDomainRDAP(trimmed);
    setStatus(available ? "available" : "taken");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setStatus(val.trim().length >= 4 ? "checking" : "idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => check(val), 500);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const base = getDomainBase(input);
  const suggestions = base
    ? [`${base}-pro.fr`, `${base}-mariage.fr`, `${base}-events.fr`]
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

      {/* Available */}
      {status === "available" && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-green-700 font-semibold mb-3">
            🎉 Ce domaine est disponible ! Réservez-le avec le pack Elite avant qu'il ne soit pris.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
          >
            Réserver maintenant →
          </Link>
        </div>
      )}

      {/* Taken */}
      {status === "taken" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-red-600 font-semibold mb-3">
            Ce domaine est déjà pris. Voici quelques alternatives :
          </p>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                <span className="font-mono font-medium">{s}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-3 inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
          >
            Choisir une alternative →
          </Link>
        </div>
      )}
    </div>
  );
}

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

/* ─── Main component ─────────────────────────────────── */

export default function EliteContent() {
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
          <p className="text-purple-200 text-lg md:text-xl max-w-xl mx-auto mb-4 leading-relaxed">
            Nom de domaine inclus&nbsp;•&nbsp;Maintenance incluse&nbsp;•&nbsp;Visibilité sur InstantMariage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-2xl font-bold text-base text-white shadow-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
            >
              Choisir Elite Vitrine&nbsp;149€/mois
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #F06292, #e91e8c)",
                color: "#fff",
              }}
            >
              Choisir Elite Shop&nbsp;199€/mois
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — VÉRIFICATEUR DE DOMAINE ───────────── */}
      <section className="py-16 md:py-20 bg-white">
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
          <DomainChecker />
        </div>
      </section>

      {/* ── SECTION 3 — COMPARATIF ─────────────────────────── */}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-2xl font-bold text-base text-white shadow-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
            >
              Vitrine&nbsp;149€/mois
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "#fff" }}
            >
              Shop&nbsp;199€/mois
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
