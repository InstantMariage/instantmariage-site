"use client";

import { useState } from "react";
import Link from "next/link";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  sectionKey: string;
  accentColor: "rose" | "gold";
}

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="8" y1="1" x2="8" y2="15" />
      <line x1="1" y1="8" x2="15" y2="8" />
    </svg>
  );
}

function FaqAccordion({ items, accentColor }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(null);
  const isRose = accentColor === "rose";
  const activeColor = isRose ? "#F06292" : "#C9A96E";

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span
                className="font-semibold text-base leading-snug transition-colors duration-200"
                style={{ color: isOpen ? activeColor : "#1f2937" }}
              >
                {item.q}
              </span>
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={
                  isOpen
                    ? { background: activeColor, color: "#fff" }
                    : { background: "#f3f4f6", color: "#9ca3af" }
                }
              >
                <PlusIcon open={isOpen} />
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface FaqContentProps {
  faqMaries: FaqItem[];
  faqPrestataires: FaqItem[];
}

export default function FaqContent({ faqMaries, faqPrestataires }: FaqContentProps) {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-28 pb-20 md:pt-36 md:pb-24 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Centre d&apos;aide
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Foire aux questions
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-xl mx-auto leading-relaxed">
            Toutes les réponses aux questions que vous vous posez sur InstantMariage.fr — que vous soyez futurs mariés ou prestataire.
          </p>

          {/* Quick jump */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a
              href="#maries"
              className="inline-flex items-center gap-2 bg-white text-rose-500 font-semibold px-6 py-3 rounded-full hover:bg-rose-50 transition-colors duration-200 shadow-md"
            >
              <span>💍</span>
              <span>Questions des mariés</span>
            </a>
            <a
              href="#prestataires"
              className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/30 transition-colors duration-200 border border-white/30"
            >
              <span>🏢</span>
              <span>Questions des prestataires</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="bg-gray-50/50 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-20">

          {/* Section mariés */}
          <section id="maries" className="scroll-mt-24">
            <div className="mb-10 text-center">
              <div
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <span>💍</span>
                <span>Pour les futurs mariés</span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Vous préparez votre mariage ?
              </h2>
              <p className="text-gray-500 text-base max-w-lg mx-auto">
                Découvrez comment InstantMariage.fr vous aide à trouver les meilleurs prestataires et à organiser votre grand jour.
              </p>
            </div>
            <FaqAccordion items={faqMaries} sectionKey="maries" accentColor="rose" />
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-2xl">💒</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Section prestataires */}
          <section id="prestataires" className="scroll-mt-24">
            <div className="mb-10 text-center">
              <div
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
                style={{ background: "#FDF8EE", color: "#C9A96E" }}
              >
                <span>🏢</span>
                <span>Pour les prestataires</span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Vous êtes un professionnel du mariage ?
              </h2>
              <p className="text-gray-500 text-base max-w-lg mx-auto">
                Tout ce que vous devez savoir pour rejoindre InstantMariage.fr et développer votre activité.
              </p>
            </div>
            <FaqAccordion items={faqPrestataires} sectionKey="prestataires" accentColor="gold" />
          </section>

        </div>
      </div>

      {/* CTA block */}
      <section
        className="py-16 md:py-20 text-white text-center"
        style={{ background: "linear-gradient(135deg, #e91e8c 0%, #F06292 100%)" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-white/85 text-lg mb-8">
            Notre équipe est disponible pour répondre à toutes vos questions. N&apos;hésitez pas à nous contacter.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-4 rounded-full hover:bg-rose-50 transition-colors duration-200 shadow-lg"
            style={{ color: "#e91e8c" }}
          >
            Contacter le support
          </Link>
        </div>
      </section>
    </>
  );
}
