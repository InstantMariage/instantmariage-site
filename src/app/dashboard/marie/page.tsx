"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// Wedding date – would normally come from user profile/DB
const WEDDING_DATE = new Date("2026-09-12T14:00:00");

function useCountdown(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const months = Math.max(0, Math.floor(days / 30));
  return { days, months };
}

const soonTools = [
  {
    label: "Rétroplanning",
    desc: "Planifiez chaque étape jusqu'au grand jour",
    icon: "📅",
    color: "#F0FDF4",
  },
  {
    label: "Budget mariage",
    desc: "Suivez et maîtrisez vos dépenses",
    icon: "💰",
    color: "#FFFBEB",
  },
];

const savedVendors = [
  {
    name: "Atelier Lumière",
    category: "Photographe",
    rating: 4.9,
    reviews: 87,
    location: "Paris 11e",
    avatar: "AL",
    contacted: true,
  },
  {
    name: "Château des Bruyères",
    category: "Lieu de réception",
    rating: 4.8,
    reviews: 134,
    location: "Seine-et-Marne",
    avatar: "CB",
    contacted: false,
  },
  {
    name: "Fleurs de Soie",
    category: "Fleuriste",
    rating: 4.7,
    reviews: 52,
    location: "Paris 6e",
    avatar: "FS",
    contacted: true,
  },
];

const messages = [
  {
    name: "Marc Lefebvre Photo",
    preview: "Bonjour, j'ai bien reçu votre message. Je serais disponible le 12 septembre...",
    time: "Aujourd'hui, 15h04",
    unread: true,
    avatar: "ML",
  },
  {
    name: "Château des Bruyères",
    preview: "Nous avons le plaisir de vous transmettre notre brochure tarifaire 2026.",
    time: "Hier, 11h20",
    unread: false,
    avatar: "CB",
  },
];

interface CheckItem {
  id: number;
  label: string;
  category: string;
  done: boolean;
  urgent?: boolean;
}

const initialChecklist: CheckItem[] = [
  { id: 1, label: "Fixer la date et le lieu", category: "Essentiel", done: true },
  { id: 2, label: "Définir le budget global", category: "Essentiel", done: true },
  { id: 3, label: "Choisir un photographe", category: "Prestataires", done: false, urgent: true },
  { id: 4, label: "Réserver le traiteur", category: "Prestataires", done: false, urgent: true },
  { id: 5, label: "Envoyer les faire-parts", category: "Invités", done: false },
  { id: 6, label: "Choisir la robe / le costume", category: "Tenues", done: false },
  { id: 7, label: "Organiser l'hébergement des invités", category: "Invités", done: false },
  { id: 8, label: "Préparer la liste de musique", category: "Animation", done: false },
  { id: 9, label: "Réserver le wedding planner", category: "Prestataires", done: false },
  { id: 10, label: "Planifier la lune de miel", category: "Voyage", done: false },
];

export default function DashboardMarie() {
  const router = useRouter();
  const { days } = useCountdown(WEDDING_DATE);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [showAll, setShowAll] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      } else {
        const meta = session.user.user_metadata;
        setUserName(meta?.prenom || session.user.email?.split("@")[0] || "");
        setAuthChecked(true);
      }
    });
  }, [router]);

  const toggle = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const done = checklist.filter((i) => i.done).length;
  const total = checklist.length;
  const pct = Math.round((done / total) * 100);
  const displayed = showAll ? checklist : checklist.slice(0, 6);

  const Stars = ({ count }: { count: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.floor(count) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  if (!authChecked) return null;

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  💍
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-playfair">
                    Bonjour, {userName}
                  </h1>
                  <p className="text-rose-100 text-sm mt-0.5">
                    Votre mariage avec Thomas · 12 septembre 2026
                  </p>
                </div>
              </div>

              {/* Countdown */}
              <div
                className="flex items-center gap-4 px-6 py-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white leading-none">{days}</div>
                  <div className="text-xs text-rose-100 mt-1 font-medium">jours restants</div>
                </div>
                <div className="w-px h-10 bg-white/30" />
                <div className="text-center">
                  <div className="text-sm text-white font-semibold">12 Sep 2026</div>
                  <div className="text-xs text-rose-100 mt-1">Grand jour</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-6">

          {/* Outils gratuits */}
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Mes outils gratuits</h2>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                100% gratuit
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {/* Grande carte Tableau de Bord Mariage */}
              <a
                href="https://tableau-de-bord-mariage.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-rose-200 hover:shadow-card-hover transition-all duration-200 group"
                style={{ background: "#FFF0F5" }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(240,98,146,0.15)" }}
                  >
                    💍
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 group-hover:text-rose-500 transition-colors">
                      Tableau de Bord Mariage
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      Gérez votre liste d&apos;invités et créez votre plan de table interactif
                    </div>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0 transition-all duration-200 group-hover:opacity-90"
                  style={{ background: "#F06292", color: "white" }}
                >
                  Accéder à l&apos;outil
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>

              {/* Outils à venir */}
              <div className="grid grid-cols-2 gap-3">
                {soonTools.map((tool) => (
                  <div
                    key={tool.label}
                    className="flex flex-col gap-3 p-4 rounded-xl border border-gray-100 opacity-60 cursor-not-allowed"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: tool.color }}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold text-gray-900">{tool.label}</div>
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#F3F4F6", color: "#6B7280" }}
                        >
                          Bientôt
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Prestataires + Messages */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Prestataires sauvegardés */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <h2 className="font-semibold text-gray-900">Mes prestataires sauvegardés</h2>
                  <Link
                    href="/prestataires"
                    className="text-xs font-semibold"
                    style={{ color: "#F06292" }}
                  >
                    Découvrir +
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {savedVendors.map((vendor) => (
                    <div
                      key={vendor.name}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                      >
                        {vendor.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{vendor.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {vendor.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Stars count={vendor.rating} />
                          <span className="text-xs text-gray-500">{vendor.rating} ({vendor.reviews} avis)</span>
                          <span className="text-xs text-gray-400">· {vendor.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {vendor.contacted && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "#F0FDF4", color: "#16A34A" }}
                          >
                            Contacté
                          </span>
                        )}
                        <Link
                          href={`/prestataires/${vendor.name.toLowerCase().replace(/\s/g, "-")}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 hover:bg-rose-50"
                          style={{ borderColor: "#F06292", color: "#F06292" }}
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <h2 className="font-semibold text-gray-900">
                    Mes messages
                    <span
                      className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "#FFF0F5", color: "#F06292" }}
                    >
                      1
                    </span>
                  </h2>
                  <Link href="/messages" className="text-xs font-semibold" style={{ color: "#F06292" }}>
                    Tout voir
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.name}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "#F06292" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Checklist */}
            <div className="bg-white rounded-2xl shadow-card p-6 self-start">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-gray-900">Checklist mariage</h2>
                <span className="text-sm font-bold" style={{ color: "#F06292" }}>
                  {done}/{total}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #F06292, #E91E8C)",
                  }}
                />
              </div>

              <div className="space-y-2">
                {displayed.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggle(item.id)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                        style={{
                          borderColor: item.done ? "#F06292" : "#D1D5DB",
                          background: item.done ? "#F06292" : "white",
                        }}
                      >
                        {item.done && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-sm transition-colors ${
                            item.done ? "line-through text-gray-400" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.urgent && !item.done && (
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#FFF0F5", color: "#F06292" }}
                          >
                            urgent
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.category}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 w-full text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                style={{ color: "#F06292" }}
              >
                {showAll ? "Réduire" : `Voir les ${total - 6} tâches restantes`}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
