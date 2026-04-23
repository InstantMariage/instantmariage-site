"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type PeriodType = "30j" | "12semaines" | "12mois";
type PeriodData = { label: string; prestataires: number; maries: number };

// ─── helpers ────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}

function buildPeriod(period: PeriodType): PeriodData[] {
  const now = new Date();
  const data: PeriodData[] = [];
  if (period === "30j") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      data.push({
        label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        prestataires: 0,
        maries: 0,
      });
    }
  } else if (period === "12semaines") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const start = new Date(d);
      const day = start.getDay();
      start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
      data.push({
        label: start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        prestataires: 0,
        maries: 0,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        prestataires: 0,
        maries: 0,
      });
    }
  }
  return data;
}

function fillPeriod(
  period: PeriodType,
  prestataires: { created_at: string }[],
  maries: { created_at: string }[]
): PeriodData[] {
  const now = new Date();
  const data = buildPeriod(period);

  function getBucketIndex(dateStr: string): number {
    const d = new Date(dateStr);
    if (period === "30j") {
      const key = d.toISOString().slice(0, 10);
      for (let i = 0; i < 30; i++) {
        const bd = new Date(now);
        bd.setDate(now.getDate() - (29 - i));
        if (key === bd.toISOString().slice(0, 10)) return i;
      }
    } else if (period === "12semaines") {
      const ws = getWeekStart(d);
      for (let i = 0; i < 12; i++) {
        const wd = new Date(now);
        wd.setDate(now.getDate() - (11 - i) * 7);
        if (ws === getWeekStart(wd)) return i;
      }
    } else {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      for (let i = 0; i < 12; i++) {
        const bd = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const bk = `${bd.getFullYear()}-${String(bd.getMonth() + 1).padStart(2, "0")}`;
        if (key === bk) return i;
      }
    }
    return -1;
  }

  prestataires.forEach(({ created_at }) => {
    const idx = getBucketIndex(created_at);
    if (idx >= 0) data[idx].prestataires++;
  });
  maries.forEach(({ created_at }) => {
    const idx = getBucketIndex(created_at);
    if (idx >= 0) data[idx].maries++;
  });
  return data;
}

function calcEvol(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function countInRange(items: { created_at: string }[], start: Date, end: Date): number {
  return items.filter(({ created_at }) => {
    const d = new Date(created_at);
    return d >= start && d < end;
  }).length;
}

function aggregateTop(
  items: (string | null | undefined)[],
  n: number
): { name: string; count: number }[] {
  const map = new Map<string, number>();
  items.forEach((v) => {
    if (!v || v.trim() === "") return;
    map.set(v, (map.get(v) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

// ─── components ─────────────────────────────────────────────────────────────

function EvolutionBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  if (pct > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
        ↑ +{pct}%
      </span>
    );
  if (pct < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500 bg-red-50 rounded px-1.5 py-0.5">
        ↓ {pct}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
      = 0%
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  evolution,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  evolution?: number | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color: color ?? "#111827" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      {evolution !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {evolution !== null ? (
            <>
              <EvolutionBadge pct={evolution} />
              <span className="text-xs text-gray-400">vs mois dernier</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      )}
    </div>
  );
}

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  starter: { label: "Starter", color: "#6B7280", bg: "#F9FAFB" },
  pro: { label: "Pro", color: "#3B82F6", bg: "#EFF6FF" },
  premium: { label: "Premium", color: "#D97706", bg: "#FFFBEB" },
};

function PlanCard({
  plan,
  count,
  mrr,
  total,
}: {
  plan: string;
  count: number;
  mrr: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const cfg = PLAN_CONFIG[plan] ?? { label: plan, color: "#111827", bg: "#F9FAFB" };
  return (
    <div
      className="flex-1 rounded-xl border border-gray-100 p-5"
      style={{ background: cfg.bg }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: cfg.color }}>
        {cfg.label}
      </p>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-xs text-gray-400 mt-1">{pct}% des payants</p>
      <p className="text-xs font-semibold mt-1.5" style={{ color: cfg.color }}>
        {mrr.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} MRR
      </p>
    </div>
  );
}

function TopList({
  title,
  items,
}: {
  title: string;
  items: { name: string; count: number }[];
}) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-5">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">Aucune donnée</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ name, count }, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 truncate max-w-[70%]">{name}</span>
                <span className="text-xs font-semibold text-gray-700">{count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(count / max) * 100}%`, background: "#F06292" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarChart({ data }: { data: PeriodData[] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.prestataires, d.maries]), 1);
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
      <div className="flex items-end gap-1" style={{ height: 140 }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex gap-0.5 items-end" style={{ height: 110 }}>
              <div
                className="flex-1 rounded-t transition-all"
                style={{
                  background: "#F06292",
                  height: `${(d.prestataires / maxVal) * 100}%`,
                  minHeight: d.prestataires > 0 ? 4 : 0,
                }}
                title={`${d.prestataires} prestataires`}
              />
              <div
                className="flex-1 rounded-t transition-all"
                style={{
                  background: "#60A5FA",
                  height: `${(d.maries / maxVal) * 100}%`,
                  minHeight: d.maries > 0 ? 4 : 0,
                }}
                title={`${d.maries} mariés`}
              />
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── types ───────────────────────────────────────────────────────────────────

type PlanBreakdown = Record<string, { count: number; mrr: number }>;
type Evolution = {
  prestataires: number | null;
  maries: number | null;
  cagnottes: number | null;
  revenu: number | null;
};

// ─── page ────────────────────────────────────────────────────────────────────

export default function StatistiquesAdminPage() {
  const [period, setPeriod] = useState<PeriodType>("12semaines");
  const [periodData, setPeriodData] = useState<PeriodData[]>(buildPeriod("12semaines"));
  const [stats, setStats] = useState({
    totalPrestataires: 0,
    totalMaries: 0,
    fairePartsTotal: 0,
    fairePartsPublies: 0,
    cagnottesActives: 0,
    totalCagnotteCents: 0,
    revenuMensuelEur: 0,
    conversionRate: 0,
    conversionNumerator: 0,
    planBreakdown: {} as PlanBreakdown,
    topCategories: [] as { name: string; count: number }[],
    topDepartements: [] as { name: string; count: number }[],
    evolution: {
      prestataires: null,
      maries: null,
      cagnottes: null,
      revenu: null,
    } as Evolution,
  });
  const [loading, setLoading] = useState(true);

  const rawPrestataires = useRef<{ created_at: string }[]>([]);
  const rawMaries = useRef<{ created_at: string }[]>([]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      setPeriodData(fillPeriod(period, rawPrestataires.current, rawMaries.current));
    }
  }, [period, loading]);

  async function load() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      { data: prestataires },
      { data: maries },
      { data: invitations },
      { data: contributions },
      { data: abonnements },
    ] = await Promise.all([
      supabase.from("prestataires").select("created_at, categorie, departement"),
      supabase.from("maries").select("created_at"),
      supabase.from("invitations").select("id, statut, cagnotte_active, created_at"),
      supabase.from("cagnotte_contributions").select("montant_cents").eq("statut", "paye"),
      supabase.from("abonnements").select("plan, prix, created_at").eq("statut", "actif"),
    ]);

    const prestList = prestataires ?? [];
    const mariesList = maries ?? [];
    const invList = invitations ?? [];
    const aboList = abonnements ?? [];

    rawPrestataires.current = prestList;
    rawMaries.current = mariesList;
    setPeriodData(fillPeriod("12semaines", prestList, mariesList));

    // Monthly evolution
    const prestThisMonth = countInRange(prestList, currentMonthStart, now);
    const prestLastMonth = countInRange(prestList, prevMonthStart, currentMonthStart);

    const mariesThisMonth = countInRange(mariesList, currentMonthStart, now);
    const mariesLastMonth = countInRange(mariesList, prevMonthStart, currentMonthStart);

    const cagnottesWithDate = invList.filter((i) => i.cagnotte_active);
    const cagnottesActives = cagnottesWithDate.length;
    const cagnottesThisMonth = countInRange(cagnottesWithDate, currentMonthStart, now);
    const cagnottesLastMonth = countInRange(cagnottesWithDate, prevMonthStart, currentMonthStart);

    const revenuTotal = aboList.reduce((sum, a) => sum + (a.prix ?? 0), 0);
    const revenuThisMonth = aboList
      .filter(({ created_at }) => {
        const d = new Date(created_at);
        return d >= currentMonthStart && d < now;
      })
      .reduce((sum, a) => sum + (a.prix ?? 0), 0);
    const revenuLastMonth = aboList
      .filter(({ created_at }) => {
        const d = new Date(created_at);
        return d >= prevMonthStart && d < currentMonthStart;
      })
      .reduce((sum, a) => sum + (a.prix ?? 0), 0);

    // Conversion
    const totalPrest = prestList.length;
    const conversionNumerator = aboList.length;
    const conversionRate = totalPrest > 0 ? Math.round((conversionNumerator / totalPrest) * 100) : 0;

    // Plan breakdown (starter / pro / premium)
    const planBreakdown: PlanBreakdown = {
      starter: { count: 0, mrr: 0 },
      pro: { count: 0, mrr: 0 },
      premium: { count: 0, mrr: 0 },
    };
    aboList.forEach(({ plan, prix }) => {
      if (plan in planBreakdown) {
        planBreakdown[plan].count++;
        planBreakdown[plan].mrr += prix ?? 0;
      }
    });

    // Top 10 — null filtered in aggregateTop
    const topCategories = aggregateTop(prestList.map((p) => p.categorie), 10);
    const topDepartements = aggregateTop(prestList.map((p) => p.departement), 10);

    const fairePartsPublies = invList.filter((i) => i.statut === "publie").length;
    const totalCagnotteCents = (contributions ?? []).reduce(
      (sum, c) => sum + (c.montant_cents ?? 0),
      0
    );

    setStats({
      totalPrestataires: totalPrest,
      totalMaries: mariesList.length,
      fairePartsTotal: invList.length,
      fairePartsPublies,
      cagnottesActives,
      totalCagnotteCents,
      revenuMensuelEur: revenuTotal,
      conversionRate,
      conversionNumerator,
      planBreakdown,
      topCategories,
      topDepartements,
      evolution: {
        prestataires: calcEvol(prestThisMonth, prestLastMonth),
        maries: calcEvol(mariesThisMonth, mariesLastMonth),
        cagnottes: calcEvol(cagnottesThisMonth, cagnottesLastMonth),
        revenu: calcEvol(revenuThisMonth, revenuLastMonth),
      },
    });
    setLoading(false);
  }

  const chartTitle: Record<PeriodType, string> = {
    "30j": "Inscriptions par jour (30 derniers jours)",
    "12semaines": "Inscriptions par semaine (12 dernières semaines)",
    "12mois": "Inscriptions par mois (12 derniers mois)",
  };

  const totalPayants = Object.values(stats.planBreakdown).reduce((s, p) => s + p.count, 0);

  if (loading) return <div className="text-sm text-gray-400">Chargement…</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Statistiques</h2>

      {/* KPIs — 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Prestataires"
          value={stats.totalPrestataires}
          sub="inscrits au total"
          evolution={stats.evolution.prestataires}
        />
        <StatCard
          label="Mariés"
          value={stats.totalMaries}
          sub="inscrits au total"
          color="#60A5FA"
          evolution={stats.evolution.maries}
        />
        <StatCard
          label="Cagnottes actives"
          value={stats.cagnottesActives}
          sub="faire-parts avec cagnotte"
          color="#10B981"
          evolution={stats.evolution.cagnottes}
        />
        <StatCard
          label="Revenu abonnements"
          value={stats.revenuMensuelEur.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
          sub="MRR (abonnements actifs)"
          color="#F06292"
          evolution={stats.evolution.revenu}
        />
        <StatCard
          label="Conversion payante"
          value={`${stats.conversionRate}%`}
          sub={`${stats.conversionNumerator} sur ${stats.totalPrestataires} prestataires`}
          color="#7C3AED"
        />
      </div>

      {/* Répartition plans */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition par plan</h3>
        <div className="flex gap-4">
          {(["starter", "pro", "premium"] as const).map((plan) => (
            <PlanCard
              key={plan}
              plan={plan}
              count={stats.planBreakdown[plan]?.count ?? 0}
              mrr={stats.planBreakdown[plan]?.mrr ?? 0}
              total={totalPayants}
            />
          ))}
        </div>
      </div>

      {/* Bar chart avec toggle période */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-700">{chartTitle[period]}</h3>
          <div className="flex gap-1">
            {(["30j", "12semaines", "12mois"] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={
                  period === p
                    ? { background: "#F06292", color: "#fff", fontWeight: 600 }
                    : { background: "#F3F4F6", color: "#6B7280" }
                }
              >
                {p === "30j" ? "30 jours" : p === "12semaines" ? "12 semaines" : "12 mois"}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={periodData} />
      </div>

      {/* Top catégories + Top départements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopList title="Top 10 catégories prestataires" items={stats.topCategories} />
        <TopList title="Top 10 départements prestataires" items={stats.topDepartements} />
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
                  (
                  {stats.fairePartsTotal > 0
                    ? Math.round((stats.fairePartsPublies / stats.fairePartsTotal) * 100)
                    : 0}
                  %)
                </span>
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${
                    stats.fairePartsTotal > 0
                      ? (stats.fairePartsPublies / stats.fairePartsTotal) * 100
                      : 0
                  }%`,
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
