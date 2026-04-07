"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const stats = [
  {
    label: "Vues du profil",
    value: "247",
    change: "+12%",
    up: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    label: "Contacts reçus",
    value: "18",
    change: "+3",
    up: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Devis envoyés",
    value: "9",
    change: "+2",
    up: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Note moyenne",
    value: "4.8",
    change: "↑ 0.2",
    up: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

const reviews = [
  {
    name: "Sophie & Thomas",
    date: "28 mars 2026",
    rating: 5,
    text: "Un travail exceptionnel, des photos magnifiques qui capturent parfaitement l'émotion de notre journée. Nous recommandons vivement !",
    avatar: "ST",
  },
  {
    name: "Camille & Antoine",
    date: "15 mars 2026",
    rating: 5,
    text: "Professionnel, discret et talentueux. Nos souvenirs sont immortalisés de la plus belle des façons.",
    avatar: "CA",
  },
  {
    name: "Lucie & Romain",
    date: "2 mars 2026",
    rating: 4,
    text: "Très belles photos, une prestation soignée du début à la fin. Merci pour votre disponibilité.",
    avatar: "LR",
  },
];

const messages = [
  {
    name: "Emma Dupont",
    preview: "Bonjour, nous sommes intéressés par votre formule complète pour notre mariage en juillet...",
    time: "Aujourd'hui, 14h32",
    unread: true,
    avatar: "ED",
  },
  {
    name: "Julien Martin",
    preview: "Pourriez-vous nous envoyer votre disponibilité pour le 12 septembre 2026 ?",
    time: "Hier, 09h15",
    unread: true,
    avatar: "JM",
  },
  {
    name: "Clara Leroy",
    preview: "Merci pour le devis, nous allons en discuter et revenir vers vous rapidement.",
    time: "5 avr.",
    unread: false,
    avatar: "CL",
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

export default function DashboardPrestataire() {
  const [activeTab, setActiveTab] = useState<"avis" | "messages">("messages");

  const Stars = ({ count }: { count: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= count ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-16">
        {/* Hero Header */}
        <div
          className="px-4 py-10"
          style={{
            background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  ML
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white font-playfair">
                      Marc Lefebvre
                    </h1>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: "white",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <p className="text-rose-100 text-sm mt-0.5">
                    Photographe · Paris & Île-de-France
                  </p>
                </div>
              </div>
              <Link
                href="/prestataires/marc-lefebvre"
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
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: stat.up ? "#F0FDF4" : "#FEF2F2",
                      color: stat.up ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-1">Ce mois-ci</div>
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
                      style={{
                        color: activeTab === tab ? "#F06292" : "#9CA3AF",
                      }}
                    >
                      {tab === "messages" ? "Mes messages" : "Mes avis"}
                      {tab === "messages" && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "#FFF0F5", color: "#F06292" }}
                        >
                          2
                        </span>
                      )}
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
                  <div className="divide-y divide-gray-50">
                    {messages.map((msg) => (
                      <div
                        key={msg.name}
                        className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                        >
                          {msg.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-semibold ${msg.unread ? "text-gray-900" : "text-gray-600"}`}>
                              {msg.name}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">{msg.time}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-0.5">{msg.preview}</p>
                        </div>
                        {msg.unread && (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                            style={{ background: "#F06292" }}
                          />
                        )}
                      </div>
                    ))}
                    <div className="p-4">
                      <Link
                        href="/messages"
                        className="text-sm font-semibold flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                        style={{ color: "#F06292" }}
                      >
                        Voir tous les messages
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === "avis" && (
                  <div className="divide-y divide-gray-50">
                    {reviews.map((review) => (
                      <div key={review.name} className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                          >
                            {review.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                              <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                            <Stars count={review.rating} />
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-4">
                      <Link
                        href="/avis"
                        className="text-sm font-semibold flex items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                        style={{ color: "#F06292" }}
                      >
                        Voir tous mes avis
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mes Outils */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Mes outils</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Devis",
                      desc: "Créez et envoyez des devis pro",
                      icon: "📄",
                      href: "https://wedding-devis.vercel.app",
                    },
                    {
                      label: "Factures",
                      desc: "Historique et facturation",
                      icon: "🧾",
                      href: "https://wedding-devis.vercel.app",
                    },
                    {
                      label: "Contrats",
                      desc: "Contrats personnalisables",
                      icon: "📋",
                      href: "https://wedding-devis.vercel.app",
                    },
                  ].map((outil) => (
                    <a
                      key={outil.label}
                      href={outil.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-2 p-4 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-200"
                    >
                      <span className="text-2xl">{outil.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{outil.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{outil.desc}</div>
                      </div>
                    </a>
                  ))}
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
                        style={{
                          background: s.done ? "#F0FDF4" : "#F3F4F6",
                        }}
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
                      style={{ background: "#F06292" }}
                    >
                      PRO
                    </span>
                  </div>
                  <div className="space-y-2 mb-5">
                    {[
                      "Profil en avant première",
                      "Outils de gestion",
                      "Statistiques avancées",
                      "Support prioritaire",
                    ].map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F06292" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-gray-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mb-4">
                    Renouvellement le <span className="text-white font-medium">15 mai 2026</span>
                  </div>
                  <Link
                    href="/abonnement/upgrade"
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
                    style={{ background: "#F06292" }}
                  >
                    Passer Premium →
                  </Link>
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
