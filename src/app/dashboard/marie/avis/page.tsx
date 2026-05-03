"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconStar = ({ filled }: { filled: boolean }) => (
  <svg
    className="w-4 h-4"
    fill={filled ? "#F59E0B" : "none"}
    stroke={filled ? "#F59E0B" : "#D1D5DB"}
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

type AvisRow = {
  id: string;
  note: number;
  commentaire: string | null;
  approuve: boolean;
  created_at: string;
  prestataires: {
    id: string;
    nom_entreprise: string;
    categorie: string;
  } | null;
};

export default function MesAvisPage() {
  const router = useRouter();
  const [avis, setAvis] = useState<AvisRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!marie) { setLoading(false); return; }

      const { data } = await supabase
        .from("avis")
        .select("id, note, commentaire, approuve, created_at, prestataires!prestataire_id(id, nom_entreprise, categorie)")
        .eq("marie_id", marie.id)
        .order("created_at", { ascending: false });

      setAvis((data ?? []) as unknown as AvisRow[]);
      setLoading(false);
    })();
  }, [router]);

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">
        {/* ── Hero ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-10 pb-8 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href="/dashboard/marie"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <IconArrowLeft />
            Mon espace
          </Link>
          <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
            Mes avis
          </p>
          <h1 className="text-2xl font-semibold text-white leading-tight">
            Mes avis prestataires
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            Retrouvez tous les avis que vous avez laissés
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"
                style={{ borderTopColor: "#F06292" }}
              />
            </div>
          ) : avis.length === 0 ? (
            <div
              className="rounded-3xl overflow-hidden flex flex-col items-center text-center p-10"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Vous n&apos;avez pas encore laissé d&apos;avis.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                Retrouvez vos prestataires et partagez votre expérience !
              </p>
              <Link
                href="/annuaire"
                className="mt-5 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-80"
                style={{ background: "#F06292", color: "white" }}
              >
                Parcourir l&apos;annuaire
              </Link>
            </div>
          ) : (
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {avis.map((a, i) => {
                const isLast = i === avis.length - 1;
                const p = a.prestataires;
                return (
                  <div
                    key={a.id}
                    className="px-5 py-5"
                    style={{ borderBottom: isLast ? "none" : "1px solid #FEE2E2" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Infos prestataire + note */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {p?.nom_entreprise ?? "Prestataire supprimé"}
                          </p>
                          {p?.categorie && (
                            <span className="text-xs text-gray-400">{p.categorie}</span>
                          )}
                        </div>

                        {/* Étoiles */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <IconStar key={n} filled={n <= a.note} />
                          ))}
                          <span className="text-xs text-gray-500 ml-1.5 tabular-nums">{a.note}/5</span>
                        </div>

                        {/* Commentaire */}
                        {a.commentaire && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {a.commentaire}
                          </p>
                        )}
                      </div>

                      {/* Statut + date + bouton */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {a.approuve ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            Approuvé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                            En attente
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {p && (
                          <Link
                            href={`/prestataires/${p.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                            style={{ background: "#FFF0F5", color: "#F06292" }}
                          >
                            Voir le profil
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
