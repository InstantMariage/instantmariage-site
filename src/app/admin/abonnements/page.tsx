"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type AbonnementRow = {
  id: string;
  plan: string;
  date_debut: string;
  date_fin: string | null;
  prix: number | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  prestataires: {
    nom_entreprise: string;
    users: { email: string } | null;
  } | null;
};

const PLAN_STYLE: Record<string, { bg: string; text: string }> = {
  premium: { bg: "#FFF0F5", text: "#F06292" },
  pro: { bg: "#EFF6FF", text: "#3B82F6" },
  starter: { bg: "#F0FDF4", text: "#10B981" },
};

const PLAN_LABELS = ["Tous", "starter", "pro", "premium"];

function formatEur(prix: number | null) {
  if (prix == null) return "—";
  return prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export default function AbonnementsAdminPage() {
  const [abonnements, setAbonnements] = useState<AbonnementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState("Tous");
  const [acting, setActing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("abonnements")
      .select(
        `id, plan, date_debut, date_fin, prix, stripe_subscription_id, stripe_customer_id,
         prestataires!prestataire_id(nom_entreprise, users!user_id(email))`
      )
      .eq("statut", "actif")
      .order("date_debut", { ascending: false });
    setAbonnements((data as unknown as AbonnementRow[]) ?? []);
    setLoading(false);
  }

  async function offrirMois(id: string) {
    if (!confirm("Offrir 1 mois gratuit ? Un crédit sera ajouté sur la prochaine facture Stripe.")) return;
    setActing(id + "-credit");
    const token = await getToken();
    const res = await fetch("/api/admin/abonnements/credit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ abonnementId: id }),
    });
    const json = await res.json();
    setActing(null);
    setFeedback({ id, msg: json.ok ? "Crédit ajouté !" : json.error ?? "Erreur", ok: !!json.ok });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function annuler(id: string) {
    if (!confirm("Annuler cet abonnement à la fin de la période en cours ?")) return;
    setActing(id + "-cancel");
    const token = await getToken();
    const res = await fetch("/api/admin/abonnements/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ abonnementId: id }),
    });
    const json = await res.json();
    setActing(null);
    setFeedback({ id, msg: json.ok ? "Annulé à la prochaine échéance." : json.error ?? "Erreur", ok: !!json.ok });
    setTimeout(() => setFeedback(null), 4000);
  }

  const filtered =
    planFilter === "Tous" ? abonnements : abonnements.filter((a) => a.plan === planFilter);

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-900">
          Abonnements actifs ({abonnements.length})
        </h2>
        <div className="flex gap-2 flex-wrap">
          {PLAN_LABELS.map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border"
              style={
                planFilter === p
                  ? { background: "#F06292", color: "#fff", borderColor: "#F06292" }
                  : { background: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              {p === "Tous" ? "Tous" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Prestataire</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Début</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Renouvellement</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Montant/mois</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((a) => {
              const style = PLAN_STYLE[a.plan] ?? { bg: "#F9FAFB", text: "#6B7280" };
              const isFeedback = feedback?.id === a.id;
              return (
                <tr key={a.id} className="hover:bg-gray-50/40">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {a.prestataires?.nom_entreprise ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.prestataires?.users?.email ?? "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {a.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(a.date_debut)}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(a.date_fin)}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-700 tabular-nums whitespace-nowrap">
                    {formatEur(a.prix)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {isFeedback ? (
                      <span
                        className="text-xs font-medium"
                        style={{ color: feedback.ok ? "#10B981" : "#EF4444" }}
                      >
                        {feedback.msg}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => offrirMois(a.id)}
                          disabled={acting === a.id + "-credit"}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {acting === a.id + "-credit" ? "…" : "Offrir 1 mois gratuit"}
                        </button>
                        <button
                          onClick={() => annuler(a.id)}
                          disabled={acting === a.id + "-cancel" || !a.stripe_subscription_id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {acting === a.id + "-cancel" ? "…" : "Annuler"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-400">
            Aucun abonnement actif{planFilter !== "Tous" ? ` pour le plan ${planFilter}` : ""}.
          </div>
        )}
      </div>
    </div>
  );
}
