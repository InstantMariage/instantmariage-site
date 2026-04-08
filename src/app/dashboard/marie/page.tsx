"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

function useCountdown(targetDate: Date | null) {
  if (!targetDate) return { days: null };
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  return { days };
}

function formatDateFr(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const soonTools: { label: string; desc: string; icon: string; color: string }[] = [];


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
  const [checklist] = useState(initialChecklist);
  const [authChecked, setAuthChecked] = useState(false);
  const [prenomMarie1, setPrenomMarie1] = useState("");
  const [prenomMarie2, setPrenomMarie2] = useState("");
  const [dateMariage, setDateMariage] = useState<string | null>(null);
  const [lieuMariage, setLieuMariage] = useState<string | null>(null);

  const weddingDate = dateMariage ? new Date(dateMariage) : null;
  const { days } = useCountdown(weddingDate);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: marie } = await supabase
        .from("maries")
        .select("prenom_marie1, prenom_marie2, date_mariage, lieu_mariage")
        .eq("user_id", session.user.id)
        .single();

      if (marie) {
        setPrenomMarie1(marie.prenom_marie1 || "");
        setPrenomMarie2(marie.prenom_marie2 || "");
        setDateMariage(marie.date_mariage || null);
        setLieuMariage(marie.lieu_mariage || null);
      } else {
        // Fallback sur les métadonnées auth si pas de ligne dans maries
        const meta = session.user.user_metadata;
        setPrenomMarie1(meta?.prenom || session.user.email?.split("@")[0] || "");
        setPrenomMarie2(meta?.prenom_marie2 || "");
        setDateMariage(meta?.date_mariage || null);
      }

      setAuthChecked(true);
    });
  }, [router]);

  const done = checklist.filter((i) => i.done).length;
  const total = checklist.length;
  const pct = Math.round((done / total) * 100);
  const displayed = checklist.slice(0, 6);

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
                    Bonjour, {prenomMarie1}
                  </h1>
                  <p className="text-rose-100 text-sm mt-0.5">
                    {prenomMarie2
                      ? `Votre mariage avec ${prenomMarie2}`
                      : "Votre mariage"}
                    {` · `}
                    {dateMariage ? formatDateFr(dateMariage) : "Date non renseignée"}
                    {lieuMariage ? ` · ${lieuMariage}` : ""}
                  </p>
                </div>
              </div>

              {/* Countdown */}
              {dateMariage && (
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
                    <div className="text-sm text-white font-semibold">{formatDateShort(dateMariage)}</div>
                    <div className="text-xs text-rose-100 mt-1">Grand jour</div>
                  </div>
                </div>
              )}
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
              {/* Invités & Plan de table */}
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
                    🪑
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 group-hover:text-rose-500 transition-colors">
                      Invités &amp; Plan de table
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      Gérez vos invités et organisez votre plan de table
                    </div>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0 transition-all duration-200 group-hover:opacity-90"
                  style={{ background: "#F06292", color: "white" }}
                >
                  Ouvrir
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>

              {/* Budget mariage */}
              <Link
                href="/dashboard/marie/budget"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-rose-200 hover:shadow-card-hover transition-all duration-200 group"
                style={{ background: "#FFFBEB" }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(245,158,11,0.12)" }}
                  >
                    💰
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 group-hover:text-rose-500 transition-colors">
                      Budget mariage
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      Suivez et maîtrisez vos dépenses
                    </div>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0 transition-all duration-200 group-hover:opacity-90"
                  style={{ background: "#F06292", color: "white" }}
                >
                  Ouvrir
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Rétroplanning — outil actif */}
              <Link
                href="/dashboard/marie/retroplanning"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-rose-200 hover:shadow-card-hover transition-all duration-200 group"
                style={{ background: "#F0FDF4" }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.12)" }}
                  >
                    📅
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 group-hover:text-rose-500 transition-colors">
                      Rétroplanning
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      +150 tâches planifiées mois par mois jusqu&apos;au grand jour
                    </div>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0 transition-all duration-200 group-hover:opacity-90"
                  style={{ background: "#F06292", color: "white" }}
                >
                  Ouvrir
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

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
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#FFF0F5" }}
                  >
                    <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Aucun prestataire sauvegardé</p>
                  <p className="text-sm text-gray-400 mb-4">Explorez l&apos;annuaire et sauvegardez vos coups de cœur</p>
                  <Link
                    href="/prestataires"
                    className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)", color: "white" }}
                  >
                    Parcourir l&apos;annuaire
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <h2 className="font-semibold text-gray-900">Mes messages</h2>
                  <Link href="/messages" className="text-xs font-semibold" style={{ color: "#F06292" }}>
                    Tout voir
                  </Link>
                </div>
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#FFF0F5" }}
                  >
                    <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Pas encore de messages</p>
                  <p className="text-sm text-gray-400">Contactez un prestataire pour démarrer une conversation</p>
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
                        onChange={() => {}}
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

              <Link
                href="/dashboard/marie/checklist"
                className="mt-4 w-full text-sm font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                style={{ color: "#F06292" }}
              >
                Ouvrir la checklist complète
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
