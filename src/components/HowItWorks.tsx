"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Recherchez",
    description: "Trouvez le prestataire idéal parmi nos 18 catégories de professionnels du mariage, tous vérifiés.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 30l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 21h8M21 17v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Contactez",
    description: "Échangez directement avec le professionnel, posez vos questions et obtenez un devis personnalisé.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <path
          d="M8 12a2 2 0 012-2h18a2 2 0 012 2v12a2 2 0 01-2 2H18l-6 4v-4H10a2 2 0 01-2-2V12z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 19h12M14 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Profitez",
    description: "Vivez le mariage de vos rêves, serein·e et entouré·e des meilleurs professionnels.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
        <path
          d="M24 8c-4 0-8 3-8 8 0 6 8 14 8 14s8-8 8-14c0-5-4-8-8-8z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M12 38c0-4 5-6 12-6s12 2 12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function HowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-24 bg-white" aria-labelledby="how-it-works-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Simple &amp; rapide
          </p>
          <h2
            id="how-it-works-title"
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Comment ça marche
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-rose-300 to-pink-400 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 mt-4 text-lg max-w-lg mx-auto">
            Organisez votre mariage en toute sérénité, en trois étapes.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-rose-100 via-rose-200 to-rose-100" />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
              }}
            >
              {/* Icon bubble */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 flex items-center justify-center text-rose-400 shadow-sm">
                  {step.icon}
                </div>
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center text-xs font-bold text-rose-400">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
