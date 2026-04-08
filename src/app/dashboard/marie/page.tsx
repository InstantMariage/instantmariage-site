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

interface CheckItem {
  id: number;
  label: string;
  category: string;
  done: boolean;
  urgent?: boolean;
}

const initialChecklist: CheckItem[] = [
  { id: 1, label: "Fixer la date et le lieu", category: "Essentiel", done: false },
  { id: 2, label: "Définir le budget global", category: "Essentiel", done: false },
  { id: 3, label: "Choisir un photographe", category: "Prestataires", done: false, urgent: true },
  { id: 4, label: "Réserver le traiteur", category: "Prestataires", done: false, urgent: true },
  { id: 5, label: "Envoyer les faire-parts", category: "Invités", done: false },
  { id: 6, label: "Choisir la robe / le costume", category: "Tenues", done: false },
  { id: 7, label: "Organiser l'hébergement des invités", category: "Invités", done: false },
  { id: 8, label: "Préparer la liste de musique", category: "Animation", done: false },
  { id: 9, label: "Réserver le wedding planner", category: "Prestataires", done: false },
  { id: 10, label: "Planifier la lune de miel", category: "Voyage", done: false },
];

// Clean SVG icons — Apple SF Symbols style
const IconRing = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="6" />
    <path strokeLinecap="round" d="M12 6v-2M12 20v-2M6 12H4M20 12h-2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const IconChair = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4M3 14h18M7 14v6M17 14v6M9 20h6" />
  </svg>
);

const IconWallet = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12h5v4h-5a2 2 0 010-4z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconHeart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const IconExternal = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

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

  if (!authChecked) return null;

  const tools = [
    {
      href: "https://tableau-de-bord-mariage.vercel.app",
      external: true,
      icon: <IconChair />,
      label: "Invités & Plan de table",
      desc: "Gérez vos invités et organisez le placement",
      iconBg: "#EDE9FE",
      iconColor: "#7C3AED",
    },
    {
      href: "/dashboard/marie/budget",
      external: false,
      icon: <IconWallet />,
      label: "Budget mariage",
      desc: "Suivez et maîtrisez chaque dépense",
      iconBg: "#D1FAE5",
      iconColor: "#059669",
    },
    {
      href: "/dashboard/marie/retroplanning",
      external: false,
      icon: <IconCalendar />,
      label: "Rétroplanning",
      desc: "+150 tâches planifiées mois par mois",
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      href: "/dashboard/marie/checklist",
      external: false,
      icon: <IconCheck />,
      label: "Checklist",
      desc: "64 étapes pour ne rien oublier",
      iconBg: "#FFF0F5",
      iconColor: "#F06292",
    },
  ];

  return (
    <main className="min-h-screen" style={{ background: "#FFF5F8" }}>
      <Header />

      <div className="pt-20 pb-20">

        {/* ── Hero ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-10 mb-2 rounded-b-3xl"
          style={{
            background: "linear-gradient(160deg, #FFDDE8 0%, #FFF0F5 50%, #FFF5F8 100%)",
          }}
        >
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "#E91E8C", letterSpacing: "0.12em" }}>
            Mon espace
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-1" style={{ fontFamily: "inherit" }}>
            Bonjour{prenomMarie1 ? `, ${prenomMarie1}` : ""}
          </h1>
          <p className="text-base mb-8" style={{ color: "#C2768D" }}>
            {prenomMarie2 ? `Votre mariage avec ${prenomMarie2}` : "Votre mariage"}
            {dateMariage ? ` · ${formatDateFr(dateMariage)}` : ""}
            {lieuMariage ? ` · ${lieuMariage}` : ""}
          </p>

          {/* Countdown pill */}
          {dateMariage && days !== null && (
            <div
              className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #fff 60%, #FFF0F5 100%)",
                boxShadow: "0 4px 24px rgba(240,98,146,0.13)",
                border: "1px solid #FECDD3",
              }}
            >
              <div>
                <span className="text-4xl font-bold tabular-nums" style={{ color: "#E91E8C" }}>{days}</span>
                <span className="text-lg text-gray-400 ml-1.5">jours</span>
              </div>
              <div className="w-px h-8" style={{ background: "#FECDD3" }} />
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#C2768D" }}>jusqu&apos;au grand jour</p>
                <p className="text-sm font-medium text-gray-700">{formatDateFr(dateMariage)}</p>
              </div>
            </div>
          )}
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-5 pt-4">

          {/* ── Outils ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Mes outils</h2>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                100 % gratuit
              </span>
            </div>

            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {tools.map((tool, i) => {
                const isLast = i === tools.length - 1;
                const inner = (
                  <div
                    className="flex items-center gap-4 px-5 py-4 group transition-colors duration-200 hover:bg-rose-50/40 cursor-pointer"
                    style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: tool.iconBg, color: tool.iconColor }}
                    >
                      {tool.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{tool.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0">
                      {tool.external ? <IconExternal /> : <IconChevronRight />}
                    </div>
                  </div>
                );

                return tool.external ? (
                  <a
                    key={tool.label}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link key={tool.label} href={tool.href}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Checklist aperçu ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Checklist</h2>
              <Link
                href="/dashboard/marie/checklist"
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#F06292" }}
              >
                Voir tout
              </Link>
            </div>

            <div
              className="rounded-3xl overflow-hidden p-5"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {/* Progress */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: "#F06292" }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums" style={{ color: "#F06292" }}>
                  {done}/{total}
                </span>
              </div>

              <div className="space-y-1">
                {displayed.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        border: item.done ? "none" : "1.5px solid #D1D5DB",
                        background: item.done ? "#F06292" : "transparent",
                      }}
                    >
                      {item.done && <IconCheck />}
                    </div>
                    <span
                      className={`text-sm flex-1 transition-colors ${
                        item.done ? "line-through text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.urgent && !item.done && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "#FFF0F5", color: "#F06292" }}
                      >
                        urgent
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <Link
                href="/dashboard/marie/checklist"
                className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-2xl transition-all duration-200 hover:opacity-80"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                Ouvrir la checklist complète
                <IconChevronRight />
              </Link>
            </div>
          </section>

          {/* ── Prestataires + Messages ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Prestataires sauvegardés */}
            <section
              className="rounded-3xl p-5"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Prestataires</h2>
                <Link
                  href="/prestataires"
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "#F06292" }}
                >
                  Découvrir
                </Link>
              </div>

              <div className="flex flex-col items-center text-center py-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "#FFF0F5", color: "#F06292" }}
                >
                  <IconHeart />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Aucun favori</p>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Explorez l&apos;annuaire et sauvegardez vos coups de cœur
                </p>
                <Link
                  href="/prestataires"
                  className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-80"
                  style={{ background: "#F06292", color: "white" }}
                >
                  Parcourir l&apos;annuaire
                </Link>
              </div>
            </section>

            {/* Messages */}
            <section
              className="rounded-3xl p-5"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Messages</h2>
                <Link
                  href="/messages"
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "#F06292" }}
                >
                  Voir tout
                </Link>
              </div>

              <div className="flex flex-col items-center text-center py-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "#FFF0F5", color: "#F06292" }}
                >
                  <IconMail />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Aucun message</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Contactez un prestataire pour démarrer une conversation
                </p>
              </div>
            </section>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
