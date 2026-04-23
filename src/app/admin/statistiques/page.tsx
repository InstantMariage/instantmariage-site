"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type WeekData = { label: string; prestataires: number; maries: number };

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}

function buildWeeks(count: number): WeekData[] {
  const weeks: WeekData[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    const start = new Date(d);
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    weeks.push({
      label: start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      prestataires: 0,
      maries: 0,
    });
  }
  return weeks;
}

function BarChart({ weeks }: { weeks: WeekData[] }) {
  const maxVal = Math.max(...weeks.flatMap((w) => [w.prestataires, w.maries]), 1);
  return (
    <div>
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "#F06292" }} />
          <span className="text-xs text-gray-500">Prestataires</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "#60A5FA" }} />
          <span className="text-xs text-gray-500">Mariés</span>
        </div>
      </div>
      <div className="flex items-end gap-2" style={{ height: 140 }}>
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex gap-0.5 items-end" style={{ height: 110 }}>
              <div
                className="flex-1 rounded-t transition-all"
                style={{
                  background: "#F06292",
                  height: `${(w.prestataires / maxVal) * 100}%`,
                  minHeight: w.prestataires > 0 ? 4 : 0,
                }}
                title={`${w.prestataires} prestataires`}
              />
              <div
                className="flex-1 rounded-t transition-all"
                style={{
                  background: "#60A5FA",
                  height: `${(w.maries / maxVal) * 100}%`,
                  minHeight: w.maries > 0 ? 4 : 0,
                }}
                title={`${w.maries} mariés`}
              />
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color: color ?? "#111827" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function StatistiquesAdminPage() {
  const [weeks, setWeeks] = useState<WeekData[]>(buildWeeks(8));
  const [stats, setStats] = useState({
    totalPrestataires: 0,
    totalMaries: 0,
    fairePartsTotal: 0,
    fairePartsPublies: 0,
    cagnottesActives: 0,
    totalCagnotteCents: 0,
    revenuMensuelEur: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [
      { data: prestataires },
      { data: maries },
      { data: invitations },
      { data: contributions },
      { data: abonnements },
    ] = await Promise.all([
      supabase.from("prestataires").select("created_at"),
      supabase.from("maries").select("created_at"),
      supabase.from("invitations").select("id, statut, cagnotte_active"),
      supabase
        .from("cagnotte_contributions")
        .select("montant_cents")
        .eq("statut", "paye"),
      supabase.from("abonnements").select("prix").eq("statut", "actif"),
    ]);

    const weekData = buildWeeks(8);
    const now = new Date();

    (prestataires ?? []).forEach(({ created_at }) => {
      const d = new Date(created_at);
      const ws = getWeekStart(d);
      weekData.forEach((w, i) => {
        const weekDate = new Date(now);
        weekDate.setDate(now.getDate() - (7 - i) * 7);
        const wStart = getWeekStart(weekDate);
        if (ws === wStart) w.prestataires++;
      });
    });

    (maries ?? []).forEach(({ created_at }) => {
      const d = new Date(created_at);
      const ws = getWeekStart(d);
      weekData.forEach((w, i) => {
        const weekDate = new Date(now);
        weekDate.setDate(now.getDate() - (7 - i) * 7);
        const wStart = getWeekStart(weekDate);
        if (ws === wStart) w.maries++;
      });
    });

    const cagnottesActives = (invitations ?? []).filter((i) => i.cagnotte_active).length;
    const fairePartsPublies = (invitations ?? []).filter((i) => i.statut === "publie").length;
    const totalCagnotteCents = (contributions ?? []).reduce(
      (sum, c) => sum + (c.montant_cents ?? 0),
      0
    );
    const revenuMensuelEur = (abonnements ?? []).reduce(
      (sum, a) => sum + (a.prix ?? 0),
      0
    );

    setWeeks(weekData);
    setStats({
      totalPrestataires: prestataires?.length ?? 0,
      totalMaries: maries?.length ?? 0,
      fairePartsTotal: invitations?.length ?? 0,
      fairePartsPublies,
      cagnottesActives,
      totalCagnotteCents,
      revenuMensuelEur,
    });
    setLoading(false);
  }

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Statistiques</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Prestataires"
          value={stats.totalPrestataires}
          sub="inscrits au total"
        />
        <StatCard
          label="Mariés"
          value={stats.totalMaries}
          sub="inscrits au total"
          color="#60A5FA"
        />
        <StatCard
          label="Cagnottes actives"
          value={stats.cagnottesActives}
          sub="faire-parts avec cagnotte"
          color="#10B981"
        />
        <StatCard
          label="Revenu abonnements"
          value={stats.revenuMensuelEur.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
          sub="mensuel (abonnements actifs)"
          color="#F06292"
        />
      </div>

      {/* Inscriptions par semaine */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-5">
          Inscriptions par semaine (8 dernières semaines)
        </h3>
        <BarChart weeks={weeks} />
      </div>

      {/* Faire-parts */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-5">Faire-parts animés</h3>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Créés</span>
              <span className="text-xs font-semibold text-gray-700">{stats.fairePartsTotal}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "100%", background: "#E5E7EB" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Publiés</span>
              <span className="text-xs font-semibold text-gray-700">
                {stats.fairePartsPublies}
                <span className="text-gray-400 font-normal ml-1">
                  ({stats.fairePartsTotal > 0
                    ? Math.round((stats.fairePartsPublies / stats.fairePartsTotal) * 100)
                    : 0}%)
                </span>
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${stats.fairePartsTotal > 0
                    ? (stats.fairePartsPublies / stats.fairePartsTotal) * 100
                    : 0}%`,
                  background: "#F06292",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cagnottes */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-5">Cagnottes mariage</h3>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-3xl font-bold text-emerald-600">
              {(stats.totalCagnotteCents / 100).toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
            <p className="text-xs text-gray-400 mt-1">total collecté (contributions payées)</p>
          </div>
          <div className="border-l border-gray-100 pl-6">
            <p className="text-3xl font-bold text-gray-700">{stats.cagnottesActives}</p>
            <p className="text-xs text-gray-400 mt-1">cagnottes en ligne</p>
          </div>
        </div>
      </div>
    </div>
  );
}
