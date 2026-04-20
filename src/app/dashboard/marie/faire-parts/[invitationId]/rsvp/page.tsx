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
  telephone: string | null;
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

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconClose = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

  /* Detail popup */
  const [popupRsvp, setPopupRsvp] = useState<RsvpResponse | null>(null);

  /* Edit modal */
  const [editRsvpOpen, setEditRsvpOpen] = useState(false);
  const [editRsvpForm, setEditRsvpForm] = useState<{
    prenom: string; nom: string; email: string; telephone: string;
    regime_alimentaire: string; message: string; nb_personnes: string;
  }>({ prenom: "", nom: "", email: "", telephone: "", regime_alimentaire: "", message: "", nb_personnes: "1" });
  const [savingRsvp, setSavingRsvp] = useState(false);

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
        .select("id, prenom, nom, email, telephone, presence, nb_personnes, regime_alimentaire, message, created_at")
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
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const res = await fetch(`/api/invitations/${invitation?.slug}/rsvp/${id}`, {
      method: "DELETE",
      headers: currentSession?.access_token ? { Authorization: `Bearer ${currentSession.access_token}` } : {},
    });
    if (res.ok) {
      setResponses((prev) => prev.filter((r) => r.id !== id));
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body?.error ?? "Erreur lors de la suppression.");
    }
    setDeletingId(null);
  }

  function openEditRsvp(r: RsvpResponse) {
    setEditRsvpForm({
      prenom: r.prenom,
      nom: r.nom,
      email: r.email,
      telephone: r.telephone ?? "",
      regime_alimentaire: r.regime_alimentaire ?? "",
      message: r.message ?? "",
      nb_personnes: String(r.nb_personnes),
    });
    setEditRsvpOpen(true);
  }

  async function saveRsvpEdit() {
    if (!popupRsvp) return;
    setSavingRsvp(true);
    const patch = {
      prenom: editRsvpForm.prenom.trim(),
      nom: editRsvpForm.nom.trim(),
      email: editRsvpForm.email.trim(),
      telephone: editRsvpForm.telephone.trim() || null,
      regime_alimentaire: editRsvpForm.regime_alimentaire.trim() || null,
      message: editRsvpForm.message.trim() || null,
      nb_personnes: Math.max(1, parseInt(editRsvpForm.nb_personnes) || 1),
    };
    await supabase.from("rsvp_responses").update(patch).eq("id", popupRsvp.id);
    const updated: RsvpResponse = { ...popupRsvp, ...patch };
    setResponses((prev) => prev.map((r) => r.id === popupRsvp.id ? updated : r));
    setPopupRsvp(updated);
    setSavingRsvp(false);
    setEditRsvpOpen(false);
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
                      className="rounded-3xl px-5 py-4 cursor-pointer transition-shadow hover:shadow-lg"
                      style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
                      onClick={() => setPopupRsvp(r)}
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
                          onClick={(e) => { e.stopPropagation(); handleDelete(r.id, r.prenom, r.nom); }}
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

      {/* ── RSVP detail popup ── */}
      {popupRsvp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => setPopupRsvp(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.18)", border: "1px solid #FECDD3" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-start justify-between"
              style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                >
                  {`${popupRsvp.prenom[0] ?? ""}${popupRsvp.nom[0] ?? ""}`.toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-tight">{popupRsvp.prenom} {popupRsvp.nom}</p>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5"
                    style={{
                      background: popupRsvp.presence ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                      color: "white",
                    }}
                  >
                    {popupRsvp.presence ? `Présent · ${popupRsvp.nb_personnes} pers.` : "Absent"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPopupRsvp(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
              >
                <IconClose />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${popupRsvp.email}`} className="text-sm truncate" style={{ color: "#F06292" }}>{popupRsvp.email}</a>
              </div>
              {/* Téléphone */}
              {popupRsvp.telephone && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${popupRsvp.telephone}`} className="text-sm" style={{ color: "#F06292" }}>{popupRsvp.telephone}</a>
                </div>
              )}
              {/* Régime */}
              {popupRsvp.regime_alimentaire && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm text-gray-600"><span className="font-medium">Régime :</span> {popupRsvp.regime_alimentaire}</span>
                </div>
              )}
              {/* Nb personnes */}
              {popupRsvp.presence && (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-600"><span className="font-medium">{popupRsvp.nb_personnes}</span> personne{popupRsvp.nb_personnes > 1 ? "s" : ""}</span>
                </div>
              )}
              {/* Message */}
              {popupRsvp.message && (
                <div className="rounded-2xl p-3 mt-1" style={{ background: "#FFF0F5", border: "1px solid #FECDD3" }}>
                  <p className="text-sm text-gray-600 italic">&ldquo;{popupRsvp.message}&rdquo;</p>
                </div>
              )}
              <p className="text-xs text-gray-300 pt-1">{formatDate(popupRsvp.created_at)}</p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <button
                onClick={() => openEditRsvp(popupRsvp)}
                className="w-full py-3 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
              >
                <IconEdit /> Modifier les infos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit RSVP modal ── */}
      {editRsvpOpen && popupRsvp && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditRsvpOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "white", boxShadow: "0 25px 60px rgba(0,0,0,0.18)", border: "1px solid #FECDD3" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Modifier la réponse</h2>
              <button onClick={() => setEditRsvpOpen(false)} className="text-gray-400 hover:text-gray-600"><IconClose /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Prénom</label>
                  <input
                    type="text"
                    value={editRsvpForm.prenom}
                    onChange={(e) => setEditRsvpForm({ ...editRsvpForm, prenom: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300"
                    style={{ borderColor: "#FECDD3" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Nom</label>
                  <input
                    type="text"
                    value={editRsvpForm.nom}
                    onChange={(e) => setEditRsvpForm({ ...editRsvpForm, nom: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300"
                    style={{ borderColor: "#FECDD3" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Email</label>
                <input
                  type="email"
                  value={editRsvpForm.email}
                  onChange={(e) => setEditRsvpForm({ ...editRsvpForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300"
                  style={{ borderColor: "#FECDD3" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Téléphone</label>
                <input
                  type="tel"
                  value={editRsvpForm.telephone}
                  onChange={(e) => setEditRsvpForm({ ...editRsvpForm, telephone: e.target.value })}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300"
                  style={{ borderColor: "#FECDD3" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Régime alimentaire</label>
                <input
                  type="text"
                  value={editRsvpForm.regime_alimentaire}
                  onChange={(e) => setEditRsvpForm({ ...editRsvpForm, regime_alimentaire: e.target.value })}
                  placeholder="Végétarien, Halal…"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300"
                  style={{ borderColor: "#FECDD3" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Nombre de personnes</label>
                <input
                  type="number"
                  min={1}
                  value={editRsvpForm.nb_personnes}
                  onChange={(e) => setEditRsvpForm({ ...editRsvpForm, nb_personnes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300"
                  style={{ borderColor: "#FECDD3" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-gray-400">Message</label>
                <textarea
                  value={editRsvpForm.message}
                  onChange={(e) => setEditRsvpForm({ ...editRsvpForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none border focus:border-pink-300 resize-none"
                  style={{ borderColor: "#FECDD3" }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditRsvpOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border text-gray-500 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#FECDD3" }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveRsvpEdit}
                  disabled={savingRsvp || !editRsvpForm.prenom.trim() || !editRsvpForm.nom.trim()}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
                >
                  {savingRsvp ? "…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
