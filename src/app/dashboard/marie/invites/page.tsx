"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
type Regime = "normal" | "vegetarien" | "vegan" | "halal" | "casher" | "sans_gluten";
type Relation =
  | "Famille mariée" | "Famille marié" | "Amis mariée" | "Amis marié"
  | "Amis communs" | "Famille commune" | "Collègues mariée" | "Collègues marié"
  | "Voisins" | "Autres";

type WeddingTable = { id: string; nom: string; capacite: number };

type Guest = {
  id: string;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  regime_alimentaire: Regime;
  relation: Relation;
  table_id: string | null;
  presence_confirmee: boolean | null;
  notes: string | null;
  source: "manuel" | "rsvp";
  created_at: string;
};

/* ─── Constants ─── */
const REGIMES: { value: Regime; label: string; color: string }[] = [
  { value: "normal", label: "Standard", color: "#6B7280" },
  { value: "vegetarien", label: "Végétarien", color: "#16A34A" },
  { value: "vegan", label: "Vegan", color: "#059669" },
  { value: "halal", label: "Halal", color: "#D97706" },
  { value: "casher", label: "Casher", color: "#2563EB" },
  { value: "sans_gluten", label: "Sans gluten", color: "#DC2626" },
];

const RELATIONS: Relation[] = [
  "Famille mariée", "Famille marié", "Amis mariée", "Amis marié",
  "Amis communs", "Famille commune", "Collègues mariée", "Collègues marié",
  "Voisins", "Autres",
];

const PRESENCE_OPTS = [
  { value: "all", label: "Toutes présences" },
  { value: "true", label: "Confirmés ✓" },
  { value: "false", label: "Déclinés ✗" },
  { value: "null", label: "Sans réponse" },
];

const EMPTY_FORM = {
  prenom: "", nom: "", email: "", telephone: "",
  regime_alimentaire: "normal" as Regime,
  relation: "Autres" as Relation,
  table_id: "",
  presence_confirmee: "" as "" | "true" | "false",
  notes: "",
};

/* ─── Icons ─── */
const IconBack = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const IconImport = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconChair = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4M3 14h18M7 14v6M17 14v6M9 20h6" />
  </svg>
);
const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
  </svg>
);

/* ─── Helpers ─── */
function regimeInfo(value: Regime) {
  return REGIMES.find((r) => r.value === value) ?? REGIMES[0];
}

function presenceLabel(p: boolean | null) {
  if (p === true) return { label: "Confirmé", color: "#16A34A", bg: "#DCFCE7" };
  if (p === false) return { label: "Décliné", color: "#DC2626", bg: "#FEE2E2" };
  return { label: "Sans réponse", color: "#9CA3AF", bg: "#F3F4F6" };
}

/* ─── Main component ─── */
export default function InvitesPage() {
  const router = useRouter();
  const [marieId, setMarieId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<WeddingTable[]>([]);
  const [loading, setLoading] = useState(true);

  /* Filters */
  const [search, setSearch] = useState("");
  const [filterRelation, setFilterRelation] = useState("all");
  const [filterRegime, setFilterRegime] = useState("all");
  const [filterTable, setFilterTable] = useState("all");
  const [filterPresence, setFilterPresence] = useState("all");

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* Import state */
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");

  /* Load data */
  const loadData = useCallback(async (mid: string) => {
    const [gRes, tRes] = await Promise.all([
      supabase
        .from("wedding_guests")
        .select("*")
        .eq("marie_id", mid)
        .order("created_at", { ascending: false }),
      supabase
        .from("wedding_tables")
        .select("id, nom, capacite")
        .eq("marie_id", mid)
        .order("nom"),
    ]);
    if (gRes.data) setGuests(gRes.data as Guest[]);
    if (tRes.data) setTables(tRes.data as WeddingTable[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      if (!marie) { router.replace("/dashboard/marie"); return; }
      setMarieId(marie.id);
      await loadData(marie.id);
    });
  }, [router, loadData]);

  /* Filtered guests */
  const filtered = guests.filter((g) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !g.prenom.toLowerCase().includes(q) &&
        !g.nom.toLowerCase().includes(q) &&
        !(g.email ?? "").toLowerCase().includes(q)
      ) return false;
    }
    if (filterRelation !== "all" && g.relation !== filterRelation) return false;
    if (filterRegime !== "all" && g.regime_alimentaire !== filterRegime) return false;
    if (filterTable !== "all") {
      if (filterTable === "unassigned" && g.table_id !== null) return false;
      if (filterTable !== "unassigned" && g.table_id !== filterTable) return false;
    }
    if (filterPresence !== "all") {
      if (filterPresence === "null" && g.presence_confirmee !== null) return false;
      if (filterPresence === "true" && g.presence_confirmee !== true) return false;
      if (filterPresence === "false" && g.presence_confirmee !== false) return false;
    }
    return true;
  });

  /* Stats */
  const stats = {
    total: guests.length,
    confirmes: guests.filter((g) => g.presence_confirmee === true).length,
    declins: guests.filter((g) => g.presence_confirmee === false).length,
    sansReponse: guests.filter((g) => g.presence_confirmee === null).length,
    places: guests.filter((g) => g.table_id !== null).length,
  };

  /* Modal helpers */
  function openAdd() {
    setEditGuest(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(g: Guest) {
    setEditGuest(g);
    setForm({
      prenom: g.prenom,
      nom: g.nom,
      email: g.email ?? "",
      telephone: g.telephone ?? "",
      regime_alimentaire: g.regime_alimentaire,
      relation: g.relation,
      table_id: g.table_id ?? "",
      presence_confirmee: g.presence_confirmee === true ? "true" : g.presence_confirmee === false ? "false" : "",
      notes: g.notes ?? "",
    });
    setModalOpen(true);
  }

  async function saveGuest() {
    if (!marieId || !form.prenom.trim()) return;
    setSaving(true);
    const payload = {
      marie_id: marieId,
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      email: form.email.trim() || null,
      telephone: form.telephone.trim() || null,
      regime_alimentaire: form.regime_alimentaire,
      relation: form.relation,
      table_id: form.table_id || null,
      presence_confirmee: form.presence_confirmee === "true" ? true : form.presence_confirmee === "false" ? false : null,
      notes: form.notes.trim() || null,
    };

    if (editGuest) {
      await supabase.from("wedding_guests").update(payload).eq("id", editGuest.id);
    } else {
      await supabase.from("wedding_guests").insert({ ...payload, source: "manuel" });
    }

    setSaving(false);
    setModalOpen(false);
    await loadData(marieId);
  }

  async function deleteGuest(id: string) {
    if (!marieId) return;
    await supabase.from("wedding_guests").delete().eq("id", id);
    setDeleteId(null);
    await loadData(marieId);
  }

  /* Import from RSVP */
  async function importFromRsvp() {
    if (!marieId) return;
    setImporting(true);
    setImportMsg("");

    const { data: invitations } = await supabase
      .from("invitations")
      .select("id")
      .eq("marie_id", marieId);

    if (!invitations?.length) {
      setImportMsg("Aucun faire-part trouvé.");
      setImporting(false);
      return;
    }

    const invIds = invitations.map((i) => i.id);

    const { data: rsvpData } = await supabase
      .from("rsvp_responses")
      .select(`id, regime_alimentaire, invitation_guests (prenom, nom, email, telephone, groupe)`)
      .in("invitation_id", invIds)
      .eq("presence", true);

    if (!rsvpData?.length) {
      setImportMsg("Aucune confirmation de présence trouvée.");
      setImporting(false);
      return;
    }

    const { data: existing } = await supabase
      .from("wedding_guests")
      .select("rsvp_response_id")
      .eq("marie_id", marieId)
      .not("rsvp_response_id", "is", null);

    const existingIds = new Set((existing ?? []).map((e) => e.rsvp_response_id));

    const validRegimes = ["normal", "vegetarien", "vegan", "halal", "casher", "sans_gluten"];

    const toInsert = rsvpData
      .filter((r) => r.invitation_guests && !existingIds.has(r.id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        marie_id: marieId,
        prenom: r.invitation_guests.prenom ?? "Invité",
        nom: r.invitation_guests.nom ?? "",
        email: r.invitation_guests.email ?? null,
        telephone: r.invitation_guests.telephone ?? null,
        regime_alimentaire: validRegimes.includes(r.regime_alimentaire) ? r.regime_alimentaire : "normal",
        relation: "Autres" as Relation,
        presence_confirmee: true,
        source: "rsvp",
        rsvp_response_id: r.id,
      }));

    if (toInsert.length === 0) {
      setImportMsg("Tous les invités confirmés ont déjà été importés.");
      setImporting(false);
      return;
    }

    await supabase.from("wedding_guests").insert(toInsert);
    setImportMsg(`${toInsert.length} invité${toInsert.length > 1 ? "s" : ""} importé${toInsert.length > 1 ? "s" : ""} avec succès.`);
    setImporting(false);
    await loadData(marieId);
  }

  /* PDF Export */
  async function exportPDF() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(240, 98, 146);
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Liste des invités par table", 20, 13);
    doc.setFontSize(9);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} · ${guests.length} invités au total`, 20, 23);

    doc.setTextColor(30, 30, 30);
    let y = 42;

    // Group by table
    const byTable: { [key: string]: { name: string; guests: Guest[] } } = {};
    const unassigned: Guest[] = [];

    guests.forEach((g) => {
      if (!g.table_id) {
        unassigned.push(g);
        return;
      }
      const table = tables.find((t) => t.id === g.table_id);
      const key = g.table_id;
      if (!byTable[key]) byTable[key] = { name: table?.nom ?? "Table", guests: [] };
      byTable[key].guests.push(g);
    });

    const sortedTables = Object.values(byTable).sort((a, b) => a.name.localeCompare(b.name));
    if (unassigned.length) sortedTables.push({ name: "Non placés", guests: unassigned });

    for (const t of sortedTables) {
      if (y > 260) { doc.addPage(); y = 20; }

      // Table header
      doc.setFillColor(t.name === "Non placés" ? 243 : 255, t.name === "Non placés" ? 244 : 240, t.name === "Non placés" ? 246 : 245);
      doc.rect(15, y - 5, pageW - 30, 10, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(t.name === "Non placés" ? 107 : 240, t.name === "Non placés" ? 114 : 98, t.name === "Non placés" ? 128 : 146);
      doc.text(`${t.name}  —  ${t.guests.length} invité${t.guests.length > 1 ? "s" : ""}`, 18, y + 1);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      for (const g of t.guests) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setTextColor(30, 30, 30);
        const regime = regimeInfo(g.regime_alimentaire);
        const presence = presenceLabel(g.presence_confirmee);
        const line1 = `${g.prenom} ${g.nom}`;
        const line2 = `${regime.label}${g.email ? "  ·  " + g.email : ""}`;
        const line3 = `${g.relation}  ·  ${presence.label}`;

        doc.text(`•  ${line1}`, 22, y);
        doc.setTextColor(120, 120, 120);
        doc.text(`    ${line2}`, 22, y + 4);
        doc.text(`    ${line3}`, 22, y + 8);
        doc.setTextColor(30, 30, 30);
        y += 13;
      }
      y += 4;
    }

    // Summary page
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(240, 98, 146);
    doc.text("Résumé des régimes alimentaires", 20, y);
    y += 10;

    const regimeCounts: { [k: string]: number } = {};
    guests.forEach((g) => {
      regimeCounts[g.regime_alimentaire] = (regimeCounts[g.regime_alimentaire] ?? 0) + 1;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    for (const r of REGIMES) {
      const count = regimeCounts[r.value] ?? 0;
      if (!count) continue;
      doc.text(`${r.label} :  ${count} couvert${count > 1 ? "s" : ""}`, 25, y);
      y += 7;
    }

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Total :  ${guests.length} couvert${guests.length > 1 ? "s" : ""}`, 25, y);

    doc.save(`invites-mariage-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  /* Table name helper */
  function tableName(id: string | null) {
    if (!id) return null;
    return tables.find((t) => t.id === id)?.nom ?? null;
  }

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "#FEF0F5" }}>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-pink-400 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">
        {/* ── Hero ── */}
        <section
          className="max-w-5xl mx-auto px-6 pt-10 pb-8 mb-4 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href="/dashboard/marie"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <IconBack /> Tableau de bord
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Mes invités</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                Gérez votre liste, régimes alimentaires et plan de table
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={importFromRsvp}
                disabled={importing}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                <IconImport />
                {importing ? "Import…" : "Importer RSVP"}
              </button>
              <button
                onClick={exportPDF}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                <IconDownload /> Export PDF
              </button>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-90"
                style={{ background: "white", color: "#e91e8c" }}
              >
                <IconPlus /> Ajouter
              </button>
            </div>
          </div>

          {importMsg && (
            <div className="mt-4 text-sm font-medium px-4 py-2 rounded-xl inline-block" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
              {importMsg}
            </div>
          )}
        </section>

        <div className="max-w-5xl mx-auto px-6 space-y-4">

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Total", value: stats.total, color: "#F06292", bg: "#FFF0F5" },
              { label: "Confirmés", value: stats.confirmes, color: "#16A34A", bg: "#DCFCE7" },
              { label: "Déclinés", value: stats.declins, color: "#DC2626", bg: "#FEE2E2" },
              { label: "Sans réponse", value: stats.sansReponse, color: "#9CA3AF", bg: "#F3F4F6" },
              { label: "Placés", value: stats.places, color: "#7C3AED", bg: "#EDE9FE" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "white", border: `1px solid ${s.bg}` }}>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Actions rapides ── */}
          <div className="flex items-center justify-end">
            <Link
              href="/dashboard/marie/plan-de-table"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ background: "#EDE9FE", color: "#7C3AED" }}
            >
              <IconChair /> Plan de table
            </Link>
          </div>

          {/* ── Filters ── */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", border: "1px solid #FECDD3", boxShadow: "0 2px 12px rgba(240,98,146,0.06)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300"
                />
              </div>
              {/* Relation */}
              <select
                value={filterRelation}
                onChange={(e) => setFilterRelation(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
              >
                <option value="all">Toutes relations</option>
                {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {/* Régime */}
              <select
                value={filterRegime}
                onChange={(e) => setFilterRegime(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
              >
                <option value="all">Tous régimes</option>
                {REGIMES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {/* Table */}
              <select
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
              >
                <option value="all">Toutes tables</option>
                <option value="unassigned">Non placés</option>
                {tables.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </select>
              {/* Présence */}
              <select
                value={filterPresence}
                onChange={(e) => setFilterPresence(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
              >
                {PRESENCE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── Guest list ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid #FECDD3", boxShadow: "0 2px 12px rgba(240,98,146,0.06)" }}
          >
            {/* Header row */}
            <div
              className="grid gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
              style={{ gridTemplateColumns: "1fr 120px 110px 110px 100px 80px", borderBottom: "1px solid #FEE2E2" }}
            >
              <span>Invité</span>
              <span>Relation</span>
              <span>Régime</span>
              <span>Table</span>
              <span>Présence</span>
              <span className="text-right">Actions</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center px-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#FFF0F5" }}>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {guests.length === 0 ? "Aucun invité pour l'instant" : "Aucun résultat"}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {guests.length === 0
                    ? "Ajoutez des invités manuellement ou importez depuis vos faire-parts"
                    : "Modifiez vos filtres pour afficher plus de résultats"}
                </p>
                {guests.length === 0 && (
                  <button
                    onClick={openAdd}
                    className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-80"
                    style={{ background: "#F06292", color: "white" }}
                  >
                    Ajouter un invité
                  </button>
                )}
              </div>
            ) : (
              filtered.map((g, i) => {
                const regime = regimeInfo(g.regime_alimentaire);
                const presence = presenceLabel(g.presence_confirmee);
                const isLast = i === filtered.length - 1;
                return (
                  <div
                    key={g.id}
                    className="grid gap-3 items-center px-5 py-3.5 hover:bg-rose-50/30 transition-colors"
                    style={{
                      gridTemplateColumns: "1fr 120px 110px 110px 100px 80px",
                      borderBottom: isLast ? "none" : "1px solid #FEF2F2",
                    }}
                  >
                    {/* Name */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {g.prenom} {g.nom}
                      </p>
                      {(g.email || g.telephone) && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {g.email || g.telephone}
                        </p>
                      )}
                      {g.source === "rsvp" && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#EDE9FE", color: "#7C3AED", fontSize: "10px" }}>
                          RSVP
                        </span>
                      )}
                    </div>

                    {/* Relation */}
                    <p className="text-xs text-gray-500 truncate">{g.relation}</p>

                    {/* Régime */}
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full inline-block"
                      style={{ background: regime.color + "18", color: regime.color }}
                    >
                      {regime.label}
                    </span>

                    {/* Table */}
                    <p className="text-xs text-gray-500 truncate">
                      {tableName(g.table_id) ?? <span className="text-gray-300">—</span>}
                    </p>

                    {/* Présence */}
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full inline-block"
                      style={{ background: presence.bg, color: presence.color }}
                    >
                      {presence.label}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(g)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{ color: "#9CA3AF" }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => setDeleteId(g.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                        style={{ color: "#FCA5A5" }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer count */}
            {filtered.length > 0 && (
              <div
                className="px-5 py-3 text-xs text-gray-400 text-right"
                style={{ borderTop: "1px solid #FEE2E2" }}
              >
                {filtered.length} invité{filtered.length > 1 ? "s" : ""}
                {filtered.length !== guests.length && ` sur ${guests.length}`}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: "white", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editGuest ? "Modifier l'invité" : "Ajouter un invité"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <IconClose />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Prénom *</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300"
                    placeholder="Marie"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300"
                    placeholder="marie@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Téléphone</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Régime alimentaire</label>
                <select
                  value={form.regime_alimentaire}
                  onChange={(e) => setForm({ ...form, regime_alimentaire: e.target.value as Regime })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
                >
                  {REGIMES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Relation</label>
                <select
                  value={form.relation}
                  onChange={(e) => setForm({ ...form, relation: e.target.value as Relation })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
                >
                  {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Table</label>
                  <select
                    value={form.table_id}
                    onChange={(e) => setForm({ ...form, table_id: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
                  >
                    <option value="">Non placé</option>
                    {tables.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Présence</label>
                  <select
                    value={form.presence_confirmee}
                    onChange={(e) => setForm({ ...form, presence_confirmee: e.target.value as "" | "true" | "false" })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 bg-white"
                  >
                    <option value="">Sans réponse</option>
                    <option value="true">Confirmé ✓</option>
                    <option value="false">Décliné ✗</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-pink-300 resize-none"
                  placeholder="Notes optionnelles…"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveGuest}
                  disabled={saving || !form.prenom.trim()}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
                >
                  {saving ? "Enregistrement…" : editGuest ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "white" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#FEE2E2" }}>
              <IconTrash />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Supprimer cet invité ?</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteGuest(deleteId)}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: "#DC2626" }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
