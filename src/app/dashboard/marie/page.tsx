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

const IconChecklist = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

type FavoriPrestataire = {
  id: string;
  prestataire_id: string;
  prestataires: {
    id: string;
    nom_entreprise: string;
    categorie: string;
    ville: string | null;
    avatar_url: string | null;
    note_moyenne: number;
  };
};

type ConversationItem = {
  id: string;
  other_name: string;
  last_message: string;
  last_message_at: string;
  last_message_is_mine: boolean;
  unread_count: number;
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function DashboardMarie() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [prenomMarie1, setPrenomMarie1] = useState("");
  const [prenomMarie2, setPrenomMarie2] = useState("");
  const [dateMariage, setDateMariage] = useState<string | null>(null);
  const [lieuMariage, setLieuMariage] = useState<string | null>(null);
  const [favoris, setFavoris] = useState<FavoriPrestataire[]>([]);
  const [favorisLoaded, setFavorisLoaded] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [convsLoaded, setConvsLoaded] = useState(false);

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
        setPrenomMarie1(meta?.prenom || "");
        setPrenomMarie2(meta?.prenom_marie2 || "");
        setDateMariage(meta?.date_mariage || null);
      }

      // Charger les prestataires sauvegardés
      const { data: favData } = await supabase
        .from("favoris")
        .select("id, prestataire_id, prestataires(id, nom_entreprise, categorie, ville, avatar_url, note_moyenne)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (favData) setFavoris(favData as unknown as FavoriPrestataire[]);
      setFavorisLoaded(true);

      // Charger les conversations
      const uid = session.user.id;
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
        .order("last_message_at", { ascending: false })
        .limit(3);

      if (convs && convs.length > 0) {
        const items: ConversationItem[] = [];
        for (const conv of convs) {
          const otherId = conv.participant1_id === uid ? conv.participant2_id : conv.participant1_id;
          let displayName = "Utilisateur";
          const { data: prest } = await supabase
            .from("prestataires")
            .select("nom_entreprise")
            .eq("user_id", otherId)
            .maybeSingle();
          if (prest) {
            displayName = prest.nom_entreprise;
          } else {
            const { data: m } = await supabase
              .from("maries")
              .select("prenom_marie1, prenom_marie2")
              .eq("user_id", otherId)
              .maybeSingle();
            if (m) displayName = m.prenom_marie2 ? `${m.prenom_marie1} & ${m.prenom_marie2}` : m.prenom_marie1;
          }
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("contenu, created_at, expediteur_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("destinataire_id", uid)
            .eq("lu", false);
          items.push({
            id: conv.id,
            other_name: displayName,
            last_message: lastMsg?.contenu ?? "",
            last_message_at: lastMsg?.created_at ?? conv.created_at,
            last_message_is_mine: lastMsg?.expediteur_id === uid,
            unread_count: count ?? 0,
          });
        }
        setConversations(items);
      }
      setConvsLoaded(true);

      setAuthChecked(true);
    });
  }, [router]);

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
      icon: <IconChecklist />,
      label: "Checklist",
      desc: "66 étapes pour ne rien oublier",
      iconBg: "#FFF0F5",
      iconColor: "#F06292",
    },
    {
      href: "/dashboard/marie/profil",
      external: false,
      icon: <IconUser />,
      label: "Mon profil",
      desc: "Prénom, email, date & lieu de mariage",
      iconBg: "#FFF7ED",
      iconColor: "#EA580C",
    },
    {
      href: "/dashboard/parametres",
      external: false,
      icon: <IconSettings />,
      label: "Paramètres du compte",
      desc: "Email, mot de passe, suppression du compte",
      iconBg: "#F0FDF4",
      iconColor: "#16A34A",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">

        {/* ── Hero ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-10 mb-2 rounded-b-3xl"
          style={{
            background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
          }}
        >
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
            Mon espace
          </p>
          <h1 className="text-3xl font-semibold text-white leading-tight mb-1" style={{ fontFamily: "inherit" }}>
            Bonjour{prenomMarie1 ? `, ${prenomMarie1}` : ""}
          </h1>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            Votre grand jour approche, profitez de chaque instant ✨
          </p>

          {/* Countdown pill */}
          {dateMariage && days !== null && (
            <div
              className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.18)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div>
                <span className="text-4xl font-bold tabular-nums text-white">{days}</span>
                <span className="text-lg ml-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>jours</span>
              </div>
              <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.3)" }} />
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>jusqu&apos;au grand jour</p>
                <p className="text-sm font-medium text-white">{formatDateFr(dateMariage)}</p>
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

          {/* ── Mes prestataires sauvegardés ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Mes prestataires sauvegardés</h2>
              <Link
                href="/annuaire"
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#F06292" }}
              >
                Annuaire
              </Link>
            </div>

            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {!favorisLoaded ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
                </div>
              ) : favoris.length === 0 ? (
                <div className="flex flex-col items-center text-center p-8">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "#FFF0F5", color: "#F06292" }}
                  >
                    <IconHeart />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Aucun prestataire sauvegardé</p>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Parcourez l&apos;annuaire pour trouver vos prestataires idéaux
                  </p>
                  <Link
                    href="/annuaire"
                    className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-80"
                    style={{ background: "#F06292", color: "white" }}
                  >
                    Parcourir l&apos;annuaire
                  </Link>
                </div>
              ) : (
                <>
                  {favoris.slice(0, 4).map((fav, i) => {
                    const p = fav.prestataires;
                    const isLast = i === Math.min(favoris.length, 4) - 1;
                    const initial = p.nom_entreprise.charAt(0).toUpperCase();
                    return (
                      <Link
                        key={fav.id}
                        href={`/prestataires/${p.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-rose-50/40 transition-colors duration-200 cursor-pointer group"
                        style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden text-white font-bold text-sm"
                          style={{ background: "#F06292" }}
                        >
                          {p.avatar_url ? (
                            <img src={p.avatar_url.startsWith("http") ? p.avatar_url : `https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/photos/${p.avatar_url}`} alt={p.nom_entreprise} className="w-full h-full object-cover" />
                          ) : (
                            initial
                          )}
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.nom_entreprise}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {p.categorie}{p.ville ? ` · ${p.ville}` : ""}
                          </p>
                        </div>

                        {/* Note */}
                        {p.note_moyenne > 0 && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-600">{p.note_moyenne}</span>
                          </div>
                        )}

                        <div className="text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0">
                          <IconChevronRight />
                        </div>
                      </Link>
                    );
                  })}
                  {favoris.length > 4 && (
                    <Link
                      href="/annuaire"
                      className="flex items-center justify-center gap-1.5 text-sm font-semibold py-3.5 transition-all duration-200 hover:opacity-70"
                      style={{ borderTop: "1px solid #FEE2E2", color: "#F06292" }}
                    >
                      Voir les {favoris.length - 4} autres
                      <IconChevronRight />
                    </Link>
                  )}
                </>
              )}
            </div>
          </section>

          {/* ── Messages ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Messages</h2>
              <Link
                href="/messages"
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#F06292" }}
              >
                Voir tout
              </Link>
            </div>

            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {!convsLoaded ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center text-center p-8">
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
              ) : (
                <>
                  {conversations.map((conv, i) => {
                    const isLast = i === conversations.length - 1;
                    return (
                      <Link
                        key={conv.id}
                        href={`/messages/${conv.id}`}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-rose-50/40 transition-colors duration-200 group"
                        style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                          style={{ background: conv.unread_count > 0 ? "#F06292" : "#FBBDD9" }}
                        >
                          {conv.other_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm truncate ${conv.unread_count > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                              {conv.other_name}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`text-xs truncate flex-1 ${conv.unread_count > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                              {conv.last_message_is_mine && <span className="text-gray-400">Vous : </span>}
                              {conv.last_message || "Conversation démarrée"}
                            </p>
                            {conv.unread_count > 0 && (
                              <span
                                className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                                style={{ background: "#F06292" }}
                              >
                                {conv.unread_count > 9 ? "9+" : conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0">
                          <IconChevronRight />
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}
