"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface RsvpResponse {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  presence: boolean;
  nb_personnes: number;
  regime_alimentaire: string | null;
  message: string | null;
  created_at: string;
}

interface InvitationInfo {
  titre: string;
  slug: string;
}

const IconBack = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RsvpResponsesPage() {
  const router = useRouter();
  const params = useParams();
  const invitationId = params.invitationId as string;

  const [authChecked, setAuthChecked] = useState(false);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [responses, setResponses] = useState<RsvpResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"tous" | "presents" | "absents">("tous");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!marie) {
        router.replace("/dashboard/marie/faire-parts");
        return;
      }

      // Vérifier que l'invitation appartient au marié
      const { data: inv } = await supabase
        .from("invitations")
        .select("id, titre, slug")
        .eq("id", invitationId)
        .eq("marie_id", marie.id)
        .single();

      if (!inv) {
        router.replace("/dashboard/marie/faire-parts");
        return;
      }

      setInvitation({ titre: inv.titre, slug: inv.slug });

      const { data: rsvpData } = await supabase
        .from("rsvp_responses")
        .select("id, prenom, nom, email, presence, nb_personnes, regime_alimentaire, message, created_at")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: false });

      setResponses(rsvpData ?? []);
      setLoading(false);
      setAuthChecked(true);
    });
  }, [router, invitationId]);

  if (!authChecked) return null;

  async function handleDelete(id: string, prenom: string, nom: string) {
    const confirmed = window.confirm(`Supprimer la réponse de ${prenom} ${nom} ? Cette action est irréversible.`);
    if (!confirmed) return;

    setDeletingId(id);
    await supabase.from("wedding_guests").delete().eq("rsvp_response_id", id);
    await supabase.from("rsvp_responses").delete().eq("id", id);
    setResponses((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  }

  const filtered = responses.filter((r) => {
    if (filter === "presents") return r.presence;
    if (filter === "absents") return !r.presence;
    return true;
  });

  const totalPresents = responses.filter((r) => r.presence).length;
  const totalAbsents = responses.filter((r) => !r.presence).length;
  const totalPersonnes = responses.filter((r) => r.presence).reduce((sum, r) => sum + r.nb_personnes, 0);

  return (
    <main className="min-h-screen" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-24">
        {/* Hero */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-8 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href="/dashboard/marie/faire-parts"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity mb-6"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <IconBack />
            Mes faire-parts
          </Link>
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
            Réponses RSVP
          </p>
          <h1 className="text-3xl font-semibold text-white leading-tight mb-1">
            {invitation?.titre ?? "Faire-part"}
          </h1>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.8)" }}>
            {responses.length} réponse{responses.length !== 1 ? "s" : ""} reçue{responses.length !== 1 ? "s" : ""}
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-4 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"
                style={{ borderTopColor: "#F06292" }}
              />
            </div>
          ) : (
            <>
              {/* Récap chiffres */}
              {responses.length > 0 && (
                <div
                  className="rounded-3xl px-5 py-4 grid grid-cols-3 gap-3"
                  style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold tabular-nums text-emerald-600">{totalPresents}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Présents</p>
                  </div>
                  <div className="text-center" style={{ borderLeft: "1px solid #FECDD3", borderRight: "1px solid #FECDD3" }}>
                    <p className="text-2xl font-bold tabular-nums text-gray-400">{totalAbsents}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Absents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold tabular-nums" style={{ color: "#F06292" }}>{totalPersonnes}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Personnes</p>
                  </div>
                </div>
              )}

              {/* Filtres */}
              {responses.length > 0 && (
                <div className="flex gap-2">
                  {(["tous", "presents", "absents"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                      style={{
                        background: filter === f ? "#e91e8c" : "white",
                        color: filter === f ? "white" : "#9CA3AF",
                        border: filter === f ? "none" : "1px solid #FECDD3",
                      }}
                    >
                      {f === "tous" ? `Tous (${responses.length})` : f === "presents" ? `Présents (${totalPresents})` : `Absents (${totalAbsents})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Liste des réponses */}
              {responses.length === 0 ? (
                <div
                  className="rounded-3xl p-10 flex flex-col items-center text-center"
                  style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#FFF0F5", color: "#F06292" }}
                  >
                    <IconUsers />
                  </div>
                  <p className="text-base font-semibold text-gray-800 mb-2">Aucune réponse pour l&apos;instant</p>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    Les réponses de vos invités apparaîtront ici dès qu&apos;ils auront répondu à votre faire-part.
                  </p>
                  {invitation && (
                    <Link
                      href={`/invitation/${invitation.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-80"
                      style={{ background: "#F06292" }}
                    >
                      Voir le faire-part
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-3xl px-5 py-4"
                      style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: r.presence ? "#D1FAE5" : "#F3F4F6",
                            color: r.presence ? "#065F46" : "#6B7280",
                          }}
                        >
                          {r.presence ? <IconCheck /> : <IconX />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-semibold text-gray-900">
                              {r.prenom} {r.nom}
                            </p>
                            <span
                              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                              style={{
                                background: r.presence ? "#D1FAE5" : "#F3F4F6",
                                color: r.presence ? "#065F46" : "#6B7280",
                              }}
                            >
                              {r.presence ? `Présent${r.nb_personnes > 1 ? ` · ${r.nb_personnes} personnes` : ""}` : "Absent"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5">{r.email}</p>
                          {r.regime_alimentaire && (
                            <p className="text-sm text-gray-500 mt-1.5">
                              <span className="font-medium">Régime :</span> {r.regime_alimentaire}
                            </p>
                          )}
                          {r.message && (
                            <p className="text-sm text-gray-600 mt-1.5 italic">&ldquo;{r.message}&rdquo;</p>
                          )}
                          <p className="text-xs text-gray-300 mt-2">{formatDate(r.created_at)}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(r.id, r.prenom, r.nom)}
                          disabled={deletingId === r.id}
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-red-50 disabled:opacity-40"
                          style={{ color: "#F87171" }}
                          title="Supprimer cette réponse"
                        >
                          {deletingId === r.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <IconTrash />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
