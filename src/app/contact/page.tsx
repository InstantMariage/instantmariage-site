"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const subjects = [
  "Choisir un sujet…",
  "Question générale",
  "Problème avec un prestataire",
  "Devenir partenaire",
  "Signaler un abus",
  "Presse & média",
  "Autre",
];

const faqs = [
  {
    question: "Comment fonctionne InstantMariage.fr ?",
    answer:
      "InstantMariage.fr référence les meilleurs prestataires mariage en France. Vous pouvez rechercher par métier et par région, consulter les avis vérifiés, voir les portfolios et demander des devis gratuits directement depuis la plateforme.",
  },
  {
    question: "Comment devenir prestataire partenaire ?",
    answer:
      "Pour rejoindre notre réseau de professionnels, créez un compte prestataire depuis la page Inscription. Notre équipe examine chaque candidature sous 48h pour garantir la qualité de notre annuaire. Consultez nos tarifs pour choisir la formule adaptée à votre activité.",
  },
  {
    question: "Les avis sont-ils authentiques ?",
    answer:
      "Oui. Chaque avis est soumis après vérification que le mariage a bien eu lieu. Nous utilisons un système de validation qui empêche les faux avis. La confiance de nos utilisateurs est notre priorité absolue.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...form }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer ou nous écrire directement à contact@instantmariage.fr.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 bg-white overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #F06292, transparent)",
            }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-8"
            style={{
              background: "radial-gradient(circle, #E91E63, transparent)",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-500 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span>✉️</span>
            <span>Nous sommes à votre écoute</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Parlons de votre{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F06292, #E91E63)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              mariage
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Une question, un projet, un partenariat ? Notre équipe vous répond
            sous 24h, du lundi au vendredi.
          </p>
        </div>
      </section>

      {/* ── FORMULAIRE + INFOS ── */}
      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* FORMULAIRE */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-100 rounded-3xl shadow-lg p-8 md:p-10">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                      💌
                    </div>
                    <h2
                      className="text-2xl font-bold text-gray-900 mb-3"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Message envoyé !
                    </h2>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                      Merci de nous avoir contactés. Nous vous répondrons dans
                      les 24h ouvrées.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false);
                        setForm({ name: "", email: "", subject: "", message: "" });
                      }}
                      className="text-rose-400 hover:text-rose-500 font-semibold text-sm underline underline-offset-4 transition-colors"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2
                      className="text-2xl font-bold text-gray-900 mb-2"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Envoyez-nous un message
                    </h2>
                    <p className="text-gray-500 text-sm mb-8">
                      Tous les champs sont obligatoires.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Nom */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Nom complet
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Sophie Beaumont"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Adresse e-mail
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="sophie@exemple.fr"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Sujet */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Sujet
                        </label>
                        <div className="relative">
                          <select
                            id="subject"
                            name="subject"
                            required
                            value={form.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent appearance-none cursor-pointer transition-all"
                          >
                            {subjects.map((s, i) => (
                              <option key={s} value={i === 0 ? "" : s} disabled={i === 0}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Décrivez votre demande…"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent resize-none transition-all"
                        />
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                      >
                        {sending ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Envoi en cours…
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* INFOS DE CONTACT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Email */}
              <div className="bg-rose-50 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                  📧
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                    E-mail
                  </h3>
                  <a
                    href="mailto:contact@instantmariage.fr"
                    className="text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors"
                  >
                    contact@instantmariage.fr
                  </a>
                  <p className="text-gray-400 text-xs mt-1">
                    Réponse sous 24h ouvrées
                  </p>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                  Suivez-nous
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Instagram",
                      handle: "@instantmariage.fr",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      ),
                      color: "text-pink-500 bg-pink-50",
                    },
                    {
                      name: "Pinterest",
                      handle: "instantmariage.fr",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                        </svg>
                      ),
                      color: "text-red-500 bg-red-50",
                    },
                    {
                      name: "Facebook",
                      handle: "InstantMariage",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      ),
                      color: "text-blue-500 bg-blue-50",
                    },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="flex items-center gap-3 group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${social.color} group-hover:scale-105 transition-transform`}
                      >
                        {social.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-rose-500 transition-colors">
                          {social.name}
                        </p>
                        <p className="text-xs text-gray-400">{social.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  Disponibilité
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lundi – Vendredi</span>
                    <span className="text-gray-800 font-medium">9h – 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Samedi</span>
                    <span className="text-gray-800 font-medium">10h – 14h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dimanche</span>
                    <span className="text-gray-400">Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-rose-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-4">
              FAQ
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-rose-50/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-gray-900 leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openFaq === i
                        ? "bg-rose-400 text-white rotate-45"
                        : "bg-rose-50 text-rose-400"
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Vous ne trouvez pas votre réponse ?{" "}
            <a
              href="mailto:contact@instantmariage.fr"
              className="text-rose-400 hover:text-rose-500 font-medium transition-colors"
            >
              Contactez-nous directement.
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
