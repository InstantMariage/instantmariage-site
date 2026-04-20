"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

type PackKey =
  | "digital"
  | "print_50"
  | "print_100"
  | "print_150"
  | "print_200"
  | "print_250"
  | "print_300";

interface Pack {
  key: PackKey;
  label: string;
  quantity: string;
  price: number;
  description: string;
  badge?: string;
  isPrint: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PACKS: Pack[] = [
  {
    key: "digital",
    label: "Pack Digital",
    quantity: "Invitation animée",
    price: 9.9,
    description:
      "Lien personnalisé, partage illimité par SMS & email, QR code inclus, confirmation de présence en ligne",
    badge: "Éco & Rapide",
    isPrint: false,
  },
  {
    key: "print_50",
    label: "50 Impressions",
    quantity: "50 faire-part",
    price: 99.9,
    description: "Papier premium 300g, impression recto, enveloppes blanches, livraison offerte",
    isPrint: true,
  },
  {
    key: "print_100",
    label: "100 Impressions",
    quantity: "100 faire-part",
    price: 169.9,
    description: "Papier premium 300g, impression recto, enveloppes blanches, livraison offerte",
    badge: "Populaire",
    isPrint: true,
  },
  {
    key: "print_150",
    label: "150 Impressions",
    quantity: "150 faire-part",
    price: 229.9,
    description: "Papier premium 300g, impression recto, enveloppes blanches, livraison offerte",
    isPrint: true,
  },
  {
    key: "print_200",
    label: "200 Impressions",
    quantity: "200 faire-part",
    price: 289.9,
    description: "Papier premium 300g, impression recto, enveloppes blanches, livraison offerte",
    isPrint: true,
  },
  {
    key: "print_250",
    label: "250 Impressions",
    quantity: "250 faire-part",
    price: 349.9,
    description: "Papier premium 300g, impression recto, enveloppes blanches, livraison offerte",
    isPrint: true,
  },
  {
    key: "print_300",
    label: "300 Impressions",
    quantity: "300 faire-part",
    price: 399.9,
    description: "Papier premium 300g, impression recto, enveloppes blanches, livraison offerte",
    badge: "Meilleur prix/unité",
    isPrint: true,
  },
];

const PREMIUM_PRICE = 39.9;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommanderPage() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitation_id");

  const [selectedPack, setSelectedPack] = useState<PackKey>("print_100");
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pack = PACKS.find((p) => p.key === selectedPack)!;
  const total = pack.price + (isPremium ? PREMIUM_PRICE : 0);

  function handleCommander() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/invitations/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pack: selectedPack,
            isPremium,
            invitationId: invitationId ?? undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error ?? "Une erreur est survenue, veuillez réessayer.");
          return;
        }

        window.location.href = data.url;
      } catch {
        setError("Une erreur réseau est survenue, veuillez réessayer.");
      }
    });
  }

  return (
    <>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-rose-50 via-pink-50 to-white py-14 px-4 text-center">
        <p className="text-sm font-medium text-rose-400 tracking-widest uppercase mb-3">
          Commande
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Choisissez votre pack
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
          De l&apos;invitation digitale aux impressions papier premium, trouvez
          la formule qui correspond à votre mariage.
        </p>
        {invitationId && (
          <p className="mt-3 text-sm text-rose-500 font-medium">
            Invitation #{invitationId} sélectionnée
          </p>
        )}
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Packs ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {PACKS.map((p) => {
              const isSelected = selectedPack === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPack(p.key)}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                    isSelected
                      ? "border-rose-400 bg-rose-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-rose-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Radio indicator */}
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-rose-400 bg-rose-400"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="font-semibold text-gray-900 text-lg"
                          style={{ fontFamily: "var(--font-playfair)" }}
                        >
                          {p.label}
                        </span>
                        {p.badge && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                            {p.badge}
                          </span>
                        )}
                        {p.isPrint && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                            Livraison à domicile
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {p.price.toFixed(2).replace(".", ",")}€
                      </p>
                      {p.isPrint && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          soit{" "}
                          {(p.price / parseInt(p.key.replace("print_", ""), 10))
                            .toFixed(2)
                            .replace(".", ",")}
                          €/unité
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* ── Option Premium ─────────────────────────────────────────── */}
            <div
              className={`rounded-2xl border-2 p-5 transition-all duration-200 ${
                isPremium
                  ? "border-amber-400 bg-amber-50 shadow-md"
                  : "border-gray-100 bg-white hover:border-amber-200"
              }`}
            >
              <label className="flex items-start gap-4 cursor-pointer select-none">
                {/* Toggle */}
                <div className="mt-0.5 flex-shrink-0">
                  <button
                    role="switch"
                    aria-checked={isPremium}
                    onClick={() => setIsPremium((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                      isPremium ? "bg-amber-400" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isPremium ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => setIsPremium((v) => !v)}>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="font-semibold text-gray-900 text-lg"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      Option Premium
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      ✦ Prestige
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Papier épais 350g/m², dorure à chaud sur les motifs,
                    enveloppes nacrées dorées, ruban satiné — pour un résultat
                    exceptionnel.
                  </p>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-2xl font-bold text-amber-700">+{PREMIUM_PRICE.toFixed(2).replace(".", ",")}€</p>
                </div>
              </label>
            </div>

            {/* ── Note livraison ─────────────────────────────────────────── */}
            {pack.isPrint && (
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                </svg>
                <p>
                  L&apos;adresse de livraison sera renseignée lors du paiement
                  sécurisé. Livraison sous 5 à 8 jours ouvrés en France métropolitaine.
                </p>
              </div>
            )}
          </div>

          {/* ── Récapitulatif ────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-5">
                <h2
                  className="text-white font-semibold text-xl"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Récapitulatif
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Pack sélectionné */}
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{pack.label}</p>
                    <p className="text-gray-400">{pack.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {pack.price.toFixed(2).replace(".", ",")}€
                  </span>
                </div>

                {/* Option Premium */}
                {isPremium && (
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium text-amber-700">Option Premium</p>
                      <p className="text-gray-400">Finition prestige</p>
                    </div>
                    <span className="font-semibold text-amber-700">
                      +{PREMIUM_PRICE.toFixed(2).replace(".", ",")}€
                    </span>
                  </div>
                )}

                {/* Livraison */}
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-500">Livraison</p>
                  <span className="text-green-600 font-medium">Offerte</span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">Total TTC</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {total.toFixed(2).replace(".", ",")}€
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    TVA incluse · Paiement 100% sécurisé
                  </p>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleCommander}
                  disabled={isPending}
                  className="w-full py-4 rounded-xl font-semibold text-white text-base transition-all duration-200
                    bg-gradient-to-r from-rose-500 to-pink-500
                    hover:from-rose-600 hover:to-pink-600
                    hover:shadow-lg hover:-translate-y-0.5
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
                    focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Redirection…
                    </span>
                  ) : (
                    "Commander →"
                  )}
                </button>

                {/* Sécurité */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Paiement sécurisé par Stripe
                </div>
              </div>
            </div>

            {/* Garanties */}
            <div className="mt-4 space-y-2">
              {[
                { icon: "✓", text: "Satisfaction garantie" },
                { icon: "✓", text: "Qualité contrôlée avant envoi" },
                { icon: "✓", text: "Support par email inclus" },
              ].map((g) => (
                <div key={g.text} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-green-500 font-bold">{g.icon}</span>
                  {g.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Back link ────────────────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <Link
            href="/faire-part"
            className="text-sm text-gray-400 hover:text-rose-500 transition-colors"
          >
            ← Retour aux templates
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
