"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SignalementRow = {
  id: string;
  motif: string;
  description: string;
  created_at: string;
  prestataires: { id: string; nom_entreprise: string; suspendu: boolean } | null;
  users: { email: string } | null;
};

const MOTIF_LABEL: Record<string, string> = {
  faux_profil: "Faux profil",
  arnaque: "Arnaque / Escroquerie",
  contenu_inapproprie: "Contenu inapproprié",
  coordonnees_incorrectes: "Coordonnées incorrectes",
  autre: "Autre",
};

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export default function SignalementsAdminPage() {
  const [signalements, setSignalements] = useState<SignalementRow[]>([]);
  const [suspendus, setSuspendus] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const headers = await authHeader();
    const res = await fetch("/api/admin/signalements", { headers });
    if (!res.ok) return;
    const data: SignalementRow[] = await res.json();
    setSignalements(data);
    setSuspendus(
      new Set(
        data
          .filter((s) => s.prestataires?.suspendu)
          .map((s) => s.prestataires!.id)
      )
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteSignalement(id: string) {
    setActionId(id);
    const headers = await authHeader();
    await fetch("/api/admin/signalements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ id }),
    });
    setSignalements((prev) => prev.filter((s) => s.id !== id));
    setActionId(null);
  }

  async function toggleSuspension(prestataireId: string) {
    setActionId(prestataireId);
    const isSuspendu = suspendus.has(prestataireId);
    const headers = await authHeader();
    await fetch("/api/admin/signalements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ prestataire_id: prestataireId, suspendu: !isSuspendu }),
    });
    setSuspendus((prev) => {
      const next = new Set(prev);
      isSuspendu ? next.delete(prestataireId) : next.add(prestataireId);
      return next;
    });
    setActionId(null);
  }

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Signalements ({signalements.length})
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Profils de prestataires signalés par des utilisateurs
        </p>
      </div>

      {signalements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Aucun signalement pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => {
            const prestId = s.prestataires?.id ?? "";
            const isSuspendu = suspendus.has(prestId);
            const busy = actionId === s.id || actionId === prestId;
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {s.prestataires?.nom_entreprise ?? "—"}
                    </span>
                    {isSuspendu && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 tracking-wide">
                        SUSPENDU
                      </span>
                    )}
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: "#FFF0F5", color: "#F06292" }}
                    >
                      {MOTIF_LABEL[s.motif] ?? s.motif}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>
                      Signalé par {s.users?.email ?? "utilisateur anonyme"}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(s.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {prestId && (
                    <Link
                      href={`/prestataires/${prestId}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      Voir le profil
                    </Link>
                  )}
                  <button
                    onClick={() => deleteSignalement(s.id)}
                    disabled={busy}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                  >
                    {busy && actionId === s.id ? "…" : "Supprimer"}
                  </button>
                  {prestId && (
                    <button
                      onClick={() => toggleSuspension(prestId)}
                      disabled={busy}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        isSuspendu
                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          : "bg-orange-50 hover:bg-orange-100 text-orange-700"
                      }`}
                    >
                      {busy && actionId === prestId
                        ? "…"
                        : isSuspendu
                        ? "Réactiver"
                        : "Suspendre"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
