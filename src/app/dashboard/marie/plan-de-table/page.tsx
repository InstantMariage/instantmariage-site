"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
type Regime = "normal" | "vegetarien" | "vegan" | "halal" | "casher" | "sans_gluten";

type WeddingTable = {
  id: string;
  nom: string;
  capacite: number;
  position_x: number;
  position_y: number;
};

type Guest = {
  id: string;
  prenom: string;
  nom: string;
  regime_alimentaire: Regime;
  relation: string;
  table_id: string | null;
  presence_confirmee: boolean | null;
  email: string | null;
  telephone: string | null;
};

/* ─── Constants ─── */
const RELATIONS = [
  "Famille mariée", "Famille marié", "Amis mariée", "Amis marié",
  "Amis communs", "Famille commune", "Collègues mariée", "Collègues marié",
  "Voisins", "Autres",
] as const;

const REGIME_COLORS: Record<Regime, { bg: string; text: string }> = {
  normal:      { bg: "#4B5563", text: "#fff" },
  vegetarien:  { bg: "#16A34A", text: "#fff" },
  vegan:       { bg: "#059669", text: "#fff" },
  halal:       { bg: "#D97706", text: "#fff" },
  casher:      { bg: "#2563EB", text: "#fff" },
  sans_gluten: { bg: "#DC2626", text: "#fff" },
};

const REGIME_LABELS: Record<Regime, string> = {
  normal:      "Standard",
  vegetarien:  "Végétarien",
  vegan:       "Vegan",
  halal:       "Halal",
  casher:      "Casher",
  sans_gluten: "Sans gluten",
};

/* Table visual constants */
const TABLE_RADIUS = 50;      // px — radius of the round table circle
const SEAT_RADIUS = 85;       // px — radius for seat position from center
const SEAT_SIZE = 34;         // px — size of each guest chip
const CONTAINER = (SEAT_RADIUS + SEAT_SIZE) * 2; // full table container size

function seatPosition(index: number, total: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  const cx = CONTAINER / 2;
  const cy = CONTAINER / 2;
  return {
    left: cx + Math.cos(angle) * SEAT_RADIUS - SEAT_SIZE / 2,
    top:  cy + Math.sin(angle) * SEAT_RADIUS - SEAT_SIZE / 2,
  };
}

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
const IconClose = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
const IconSearch = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
  </svg>
);
const IconSave = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/* ─── Main component ─── */
export default function PlanDeTablePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [marieId, setMarieId] = useState<string | null>(null);
  const [tables, setTables] = useState<WeddingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  /* Guest popup */
  const [popupGuest, setPopupGuest] = useState<Guest | null>(null);

  /* Edit guest modal */
  const [editGuestOpen, setEditGuestOpen] = useState(false);
  const [editGuestForm, setEditGuestForm] = useState<{
    prenom: string; nom: string; relation: string;
    regime_alimentaire: Regime; email: string; telephone: string;
  }>({ prenom: "", nom: "", relation: "", regime_alimentaire: "normal", email: "", telephone: "" });
  const [savingGuest, setSavingGuest] = useState(false);

  /* Drag: guest */
  const [dragGuest, setDragGuest] = useState<{ guestId: string; fromTableId: string | null } | null>(null);
  const [dragOverTable, setDragOverTable] = useState<string | null>(null);
  const [dragOverSidebar, setDragOverSidebar] = useState(false);

  /* Drag: table move */
  const movingTable = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  /* Sidebar search */
  const [sideSearch, setSideSearch] = useState("");

  /* Add table modal */
  const [addTableOpen, setAddTableOpen] = useState(false);
  const [tableForm, setTableForm] = useState({ nom: "", capacite: "10" });
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [savingTable, setSavingTable] = useState(false);

  /* Save debounce */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load ── */
  const loadData = useCallback(async (mid: string) => {
    const [tRes, gRes] = await Promise.all([
      supabase.from("wedding_tables").select("*").eq("marie_id", mid).order("nom"),
      supabase.from("wedding_guests").select("id,prenom,nom,regime_alimentaire,relation,table_id,presence_confirmee,email,telephone").eq("marie_id", mid),
    ]);
    if (tRes.data) setTables(tRes.data as WeddingTable[]);
    if (gRes.data) setGuests(gRes.data as Guest[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const { data: marie } = await supabase.from("maries").select("id").eq("user_id", session.user.id).single();
      if (!marie) { router.replace("/dashboard/marie"); return; }
      setMarieId(marie.id);
      await loadData(marie.id);
    });
  }, [router, loadData]);

  /* ── Derived ── */
  const unassignedGuests = guests
    .filter((g) => !g.table_id)
    .filter((g) => {
      if (!sideSearch) return true;
      const q = sideSearch.toLowerCase();
      return g.prenom.toLowerCase().includes(q) || g.nom.toLowerCase().includes(q);
    });

  function tableGuests(tableId: string) {
    return guests.filter((g) => g.table_id === tableId);
  }

  /* ── Auto-save helper ── */
  function triggerSave(fn: () => Promise<void>) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      await fn();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 400);
  }

  /* ── Edit guest ── */
  function openEditGuest(g: Guest) {
    setEditGuestForm({
      prenom: g.prenom,
      nom: g.nom,
      relation: g.relation ?? "",
      regime_alimentaire: g.regime_alimentaire,
      email: g.email ?? "",
      telephone: g.telephone ?? "",
    });
    setEditGuestOpen(true);
  }

  async function saveGuestEdit() {
    if (!popupGuest) return;
    setSavingGuest(true);
    const patch = {
      prenom: editGuestForm.prenom.trim(),
      nom: editGuestForm.nom.trim(),
      relation: editGuestForm.relation.trim() || null,
      regime_alimentaire: editGuestForm.regime_alimentaire,
      email: editGuestForm.email.trim() || null,
      telephone: editGuestForm.telephone.trim() || null,
    };
    await supabase.from("wedding_guests").update(patch).eq("id", popupGuest.id);
    const updated: Guest = { ...popupGuest, ...patch, relation: patch.relation ?? "" };
    setGuests((prev) => prev.map((g) => g.id === popupGuest.id ? updated : g));
    setPopupGuest(updated);
    setSavingGuest(false);
    setEditGuestOpen(false);
  }

  /* ── Update relation inline ── */
  async function updateRelation(guestId: string, relation: string) {
    setGuests((prev) => prev.map((g) => g.id === guestId ? { ...g, relation } : g));
    setPopupGuest((prev) => prev?.id === guestId ? { ...prev, relation } : prev);
    await supabase.from("wedding_guests").update({ relation }).eq("id", guestId);
  }

  /* ── Assign guest to table ── */
  async function assignGuest(guestId: string, tableId: string | null) {
    setGuests((prev) => prev.map((g) => g.id === guestId ? { ...g, table_id: tableId } : g));
    triggerSave(async () => {
      await supabase.from("wedding_guests").update({ table_id: tableId }).eq("id", guestId);
    });
  }

  /* ── Guest DnD handlers ── */
  function handleGuestDragStart(guestId: string, fromTableId: string | null) {
    return (e: React.DragEvent) => {
      setDragGuest({ guestId, fromTableId });
      e.dataTransfer.effectAllowed = "move";
      e.stopPropagation();
    };
  }

  function handleDropOnTable(tableId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverTable(null);
      if (!dragGuest) return;
      if (dragGuest.fromTableId === tableId) return;
      const occupied = tableGuests(tableId).length;
      const table = tables.find((t) => t.id === tableId);
      if (table && occupied >= table.capacite) return;
      assignGuest(dragGuest.guestId, tableId);
      setDragGuest(null);
    };
  }

  function handleDropOnSidebar(e: React.DragEvent) {
    e.preventDefault();
    setDragOverSidebar(false);
    if (!dragGuest || dragGuest.fromTableId === null) return;
    assignGuest(dragGuest.guestId, null);
    setDragGuest(null);
  }

  /* ── Table move (mouse) ── */
  function handleTableMouseDown(tableId: string) {
    return (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-guest-chip]")) return;
      if ((e.target as HTMLElement).closest("[data-table-action]")) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      movingTable.current = {
        id: tableId,
        offsetX: e.clientX - rect.left + canvas.scrollLeft - table.position_x,
        offsetY: e.clientY - rect.top + canvas.scrollTop - table.position_y,
      };
    };
  }

  function handleCanvasMouseMove(e: React.MouseEvent) {
    if (!movingTable.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left + canvas.scrollLeft - movingTable.current.offsetX);
    const newY = Math.max(0, e.clientY - rect.top + canvas.scrollTop - movingTable.current.offsetY);
    const id = movingTable.current.id;
    setTables((prev) => prev.map((t) => t.id === id ? { ...t, position_x: newX, position_y: newY } : t));
  }

  function handleCanvasMouseUp() {
    if (!movingTable.current) return;
    const id = movingTable.current.id;
    const table = tables.find((t) => t.id === id);
    movingTable.current = null;
    if (table) {
      triggerSave(async () => {
        await supabase.from("wedding_tables")
          .update({ position_x: table.position_x, position_y: table.position_y })
          .eq("id", id);
      });
    }
  }

  /* Canvas drop: unassign if dropped on empty canvas */
  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragGuest) return;
    assignGuest(dragGuest.guestId, null);
    setDragGuest(null);
  }

  /* ── Add/Edit table ── */
  function openAddTable() {
    if (tables.length >= 50) return;
    setEditTableId(null);
    setTableForm({ nom: `Table ${tables.length + 1}`, capacite: "10" });
    setAddTableOpen(true);
  }

  function openEditTable(t: WeddingTable) {
    setEditTableId(t.id);
    setTableForm({ nom: t.nom, capacite: String(t.capacite) });
    setAddTableOpen(true);
  }

  async function saveTable() {
    if (!marieId || !tableForm.nom.trim()) return;
    setSavingTable(true);
    const cap = Math.max(2, Math.min(30, parseInt(tableForm.capacite) || 10));

    if (editTableId) {
      await supabase.from("wedding_tables").update({ nom: tableForm.nom.trim(), capacite: cap }).eq("id", editTableId);
    } else {
      const canvas = canvasRef.current;
      const cx = canvas ? canvas.scrollLeft + canvas.clientWidth / 2 - CONTAINER / 2 : 100;
      const cy = canvas ? canvas.scrollTop + canvas.clientHeight / 2 - CONTAINER / 2 : 100;
      await supabase.from("wedding_tables").insert({ marie_id: marieId, nom: tableForm.nom.trim(), capacite: cap, position_x: cx, position_y: cy });
    }

    setSavingTable(false);
    setAddTableOpen(false);
    await loadData(marieId);
  }

  async function deleteTable(id: string) {
    if (!marieId) return;
    await supabase.from("wedding_guests").update({ table_id: null }).eq("table_id", id);
    await supabase.from("wedding_tables").delete().eq("id", id);
    await loadData(marieId);
  }

  /* ── Render ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="w-7 h-7 rounded-full border-2 border-gray-600 border-t-pink-400 animate-spin" />
      </div>
    );
  }

  const totalGuests = guests.length;
  const placedGuests = guests.filter((g) => g.table_id).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0f172a" }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0 z-20"
        style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/dashboard/marie/invites"
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <IconBack /> Invités
        </Link>

        <div className="w-px h-4 bg-white/10" />

        <h1 className="text-sm font-bold text-white">Plan de table</h1>

        <div className="flex items-center gap-2 ml-auto">
          {/* Save status */}
          {saveStatus !== "idle" && (
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all"
              style={{
                background: saveStatus === "saved" ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.08)",
                color: saveStatus === "saved" ? "#4ADE80" : "rgba(255,255,255,0.5)",
              }}
            >
              {saveStatus === "saving" ? (
                <><span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin inline-block" /> Sauvegarde…</>
              ) : (
                <><IconSave /> Sauvegardé</>
              )}
            </span>
          )}

          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            {placedGuests}/{totalGuests} placés
          </span>

          <button
            onClick={openAddTable}
            disabled={tables.length >= 50}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
          >
            <IconPlus /> Table {tables.length >= 50 ? "(50/50)" : ""}
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + canvas ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar: unassigned guests ── */}
        <div
          className="w-64 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ background: "#1e293b", borderRight: "1px solid rgba(255,255,255,0.08)" }}
          onDragOver={(e) => { e.preventDefault(); setDragOverSidebar(true); }}
          onDragLeave={() => setDragOverSidebar(false)}
          onDrop={handleDropOnSidebar}
        >
          {/* Sidebar header */}
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: dragOverSidebar ? "rgba(240,98,146,0.1)" : "transparent",
              transition: "background 0.15s",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              Non placés · {guests.filter((g) => !g.table_id).length}
            </p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}><IconSearch /></span>
              <input
                type="text"
                placeholder="Rechercher…"
                value={sideSearch}
                onChange={(e) => setSideSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                }}
              />
            </div>
          </div>

          {/* Guest list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {unassignedGuests.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center px-2">
                <span className="text-3xl mb-2">🎉</span>
                <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {guests.filter((g) => !g.table_id).length === 0
                    ? "Tous les invités sont placés"
                    : "Aucun résultat"}
                </p>
              </div>
            ) : (
              unassignedGuests.map((g) => (
                <GuestChip
                  key={g.id}
                  guest={g}
                  fromTableId={null}
                  onDragStart={handleGuestDragStart(g.id, null)}
                  isDragging={dragGuest?.guestId === g.id}
                  compact={false}
                  onGuestClick={setPopupGuest}
                />
              ))
            )}
          </div>

          {/* Legend */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Régimes</p>
            <div className="space-y-1">
              {Object.entries(REGIME_LABELS).map(([k, label]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: REGIME_COLORS[k as Regime].bg }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto cursor-default select-none"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          <div
            style={{
              position: "relative",
              minWidth: "3000px",
              minHeight: "2000px",
              background: "#0f172a",
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          >
          {tables.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ border: "2px dashed rgba(255,255,255,0.15)" }}
              >
                <span className="text-3xl">🪑</span>
              </div>
              <p className="text-base font-bold mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Aucune table pour l&apos;instant</p>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                Ajoutez des tables rondes et placez vos invités par glisser-déposer
              </p>
              <button
                onClick={openAddTable}
                className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-2xl transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
              >
                <IconPlus /> Créer une table
              </button>
            </div>
          ) : (
            /* Render each table */
            tables.map((table) => {
              const tGuests = tableGuests(table.id);
              const isFull = tGuests.length >= table.capacite;
              const isOver = dragOverTable === table.id;

              return (
                <div
                  key={table.id}
                  style={{
                    position: "absolute",
                    left: table.position_x,
                    top: table.position_y,
                    width: CONTAINER,
                    height: CONTAINER + 44,
                    cursor: movingTable.current?.id === table.id ? "grabbing" : "grab",
                    userSelect: "none",
                  }}
                  onMouseDown={handleTableMouseDown(table.id)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverTable(table.id); }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverTable(null); }}
                  onDrop={handleDropOnTable(table.id)}
                >
                  {/* Table circle */}
                  <div
                    style={{
                      position: "absolute",
                      left: CONTAINER / 2 - TABLE_RADIUS,
                      top: CONTAINER / 2 - TABLE_RADIUS,
                      width: TABLE_RADIUS * 2,
                      height: TABLE_RADIUS * 2,
                      borderRadius: "50%",
                      background: isOver && !isFull
                        ? "rgba(240,98,146,0.25)"
                        : isFull
                        ? "rgba(220,38,38,0.12)"
                        : "rgba(255,255,255,0.07)",
                      border: isOver && !isFull
                        ? "2px solid #F06292"
                        : isFull
                        ? "2px solid rgba(220,38,38,0.4)"
                        : "2px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.15s, border-color 0.15s",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      className="text-xs font-bold text-center px-1 leading-tight"
                      style={{ color: "rgba(255,255,255,0.85)", maxWidth: TABLE_RADIUS * 2 - 8, fontSize: "11px" }}
                    >
                      {table.nom}
                    </span>
                    <span
                      className="text-xs mt-0.5"
                      style={{
                        color: isFull ? "rgba(220,38,38,0.8)" : "rgba(255,255,255,0.35)",
                        fontSize: "10px",
                      }}
                    >
                      {tGuests.length}/{table.capacite}
                    </span>
                  </div>

                  {/* Seat slots around the table */}
                  {Array.from({ length: table.capacite }).map((_, idx) => {
                    const pos = seatPosition(idx, table.capacite);
                    const guest = tGuests[idx];
                    if (guest) {
                      return (
                        <GuestChip
                          key={guest.id}
                          guest={guest}
                          fromTableId={table.id}
                          onDragStart={handleGuestDragStart(guest.id, table.id)}
                          isDragging={dragGuest?.guestId === guest.id}
                          compact
                          onGuestClick={setPopupGuest}
                          style={{ position: "absolute", left: pos.left, top: pos.top }}
                        />
                      );
                    }
                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          left: pos.left,
                          top: pos.top,
                          width: SEAT_SIZE,
                          height: SEAT_SIZE,
                          borderRadius: "50%",
                          border: "1.5px dashed rgba(255,255,255,0.1)",
                          pointerEvents: "none",
                        }}
                      />
                    );
                  })}

                  {/* Table action buttons (edit/delete) */}
                  <div
                    data-table-action="true"
                    className="flex items-center justify-center gap-1"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 44,
                    }}
                  >
                    <button
                      data-table-action="true"
                      onClick={(e) => { e.stopPropagation(); openEditTable(table); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <IconEdit />
                    </button>
                    <button
                      data-table-action="true"
                      onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: "rgba(220,38,38,0.12)", color: "rgba(220,38,38,0.6)" }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* ── Guest info popup ── */}
      {popupGuest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setPopupGuest(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl p-5"
            style={{
              background: "linear-gradient(145deg, #1e293b, #182032)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: REGIME_COLORS[popupGuest.regime_alimentaire].bg,
                    color: REGIME_COLORS[popupGuest.regime_alimentaire].text,
                    boxShadow: `0 0 16px ${REGIME_COLORS[popupGuest.regime_alimentaire].bg}60`,
                  }}
                >
                  {`${popupGuest.prenom[0] ?? ""}${popupGuest.nom[0] ?? ""}`.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {popupGuest.prenom} {popupGuest.nom}
                  </p>
                  <select
                    value={popupGuest.relation || "Autres"}
                    onChange={(e) => { e.stopPropagation(); updateRelation(popupGuest.id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs mt-0.5 rounded outline-none cursor-pointer"
                    style={{
                      background: "transparent",
                      color: "rgba(255,255,255,0.45)",
                      border: "none",
                      padding: 0,
                      appearance: "auto",
                    }}
                  >
                    {RELATIONS.map((r) => <option key={r} value={r} style={{ background: "#1e293b" }}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setPopupGuest(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
              >
                <IconClose />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.07)" }} />

            {/* Details */}
            <div className="space-y-2.5">
              {/* Régime */}
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: REGIME_COLORS[popupGuest.regime_alimentaire].bg }}
                />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Régime</span>
                <span className="text-xs font-semibold ml-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {REGIME_LABELS[popupGuest.regime_alimentaire]}
                </span>
              </div>

              {/* Email */}
              {popupGuest.email && (
                <div className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a
                    href={`mailto:${popupGuest.email}`}
                    className="text-xs truncate transition-colors hover:underline"
                    style={{ color: "#F06292", maxWidth: "180px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {popupGuest.email}
                  </a>
                </div>
              )}

              {/* Téléphone */}
              {popupGuest.telephone && (
                <div className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a
                    href={`tel:${popupGuest.telephone}`}
                    className="text-xs transition-colors hover:underline"
                    style={{ color: "#F06292" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {popupGuest.telephone}
                  </a>
                </div>
              )}

              {/* Présence */}
              <div className="flex items-center gap-2.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Présence</span>
                <span
                  className="text-xs font-semibold ml-auto px-2 py-0.5 rounded-full"
                  style={{
                    background: popupGuest.presence_confirmee === true
                      ? "rgba(22,163,74,0.15)"
                      : popupGuest.presence_confirmee === false
                      ? "rgba(220,38,38,0.15)"
                      : "rgba(255,255,255,0.07)",
                    color: popupGuest.presence_confirmee === true
                      ? "#4ADE80"
                      : popupGuest.presence_confirmee === false
                      ? "#F87171"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {popupGuest.presence_confirmee === true ? "Confirmée" : popupGuest.presence_confirmee === false ? "Déclinée" : "En attente"}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => openEditGuest(popupGuest)}
                className="w-full py-2.5 text-sm font-bold rounded-2xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
              >
                <IconEdit /> Modifier les infos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit guest modal ── */}
      {editGuestOpen && popupGuest && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditGuestOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Modifier l&apos;invité</h2>
              <button onClick={() => setEditGuestOpen(false)} className="text-gray-500 hover:text-gray-300"><IconClose /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>Prénom</label>
                  <input
                    type="text"
                    value={editGuestForm.prenom}
                    onChange={(e) => setEditGuestForm({ ...editGuestForm, prenom: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>Nom</label>
                  <input
                    type="text"
                    value={editGuestForm.nom}
                    onChange={(e) => setEditGuestForm({ ...editGuestForm, nom: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>Relation</label>
                <select
                  value={editGuestForm.relation || "Autres"}
                  onChange={(e) => setEditGuestForm({ ...editGuestForm, relation: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                >
                  {RELATIONS.map((r) => <option key={r} value={r} style={{ background: "#1e293b" }}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>Régime alimentaire</label>
                <select
                  value={editGuestForm.regime_alimentaire}
                  onChange={(e) => setEditGuestForm({ ...editGuestForm, regime_alimentaire: e.target.value as Regime })}
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                >
                  {Object.entries(REGIME_LABELS).map(([k, label]) => (
                    <option key={k} value={k} style={{ background: "#1e293b" }}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>Email</label>
                <input
                  type="email"
                  value={editGuestForm.email}
                  onChange={(e) => setEditGuestForm({ ...editGuestForm, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>Téléphone</label>
                <input
                  type="tel"
                  value={editGuestForm.telephone}
                  onChange={(e) => setEditGuestForm({ ...editGuestForm, telephone: e.target.value })}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full px-3 py-2 text-sm rounded-xl outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditGuestOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveGuestEdit}
                  disabled={savingGuest || !editGuestForm.prenom.trim() || !editGuestForm.nom.trim()}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
                >
                  {savingGuest ? "…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit table modal ── */}
      {addTableOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setAddTableOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">
                {editTableId ? "Modifier la table" : "Nouvelle table"}
              </h2>
              <button onClick={() => setAddTableOpen(false)} className="text-gray-500 hover:text-gray-300">
                <IconClose />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Nom de la table
                </label>
                <input
                  type="text"
                  value={tableForm.nom}
                  onChange={(e) => setTableForm({ ...tableForm, nom: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                  placeholder="Table des mariés"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Nombre de places
                </label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={tableForm.capacite}
                  onChange={(e) => setTableForm({ ...tableForm, capacite: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                  }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setAddTableOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Annuler
                </button>
                <button
                  onClick={saveTable}
                  disabled={savingTable || !tableForm.nom.trim()}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
                >
                  {savingTable ? "…" : editTableId ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── GuestChip component ─── */
function GuestChip({
  guest,
  fromTableId,
  onDragStart,
  isDragging,
  compact,
  onGuestClick,
  style: extraStyle,
}: {
  guest: Guest;
  fromTableId: string | null;
  onDragStart: (e: React.DragEvent) => void;
  isDragging: boolean;
  compact: boolean;
  onGuestClick?: (guest: Guest) => void;
  style?: React.CSSProperties;
}) {
  const colors = REGIME_COLORS[guest.regime_alimentaire];
  const initials = `${guest.prenom[0] ?? ""}${guest.nom[0] ?? ""}`.toUpperCase();

  if (compact) {
    return (
      <div
        data-guest-chip="true"
        draggable
        onDragStart={onDragStart}
        onClick={(e) => { e.stopPropagation(); onGuestClick?.(guest); }}
        style={{
          ...extraStyle,
          width: SEAT_SIZE,
          height: SEAT_SIZE,
          borderRadius: "50%",
          background: colors.bg,
          color: colors.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "bold",
          cursor: "pointer",
          opacity: isDragging ? 0.3 : 1,
          transition: "opacity 0.15s, transform 0.1s, box-shadow 0.15s",
          border: "2px solid rgba(255,255,255,0.2)",
          userSelect: "none",
          zIndex: 10,
        }}
      >
        {initials || guest.prenom[0]?.toUpperCase()}
      </div>
    );
  }

  return (
    <div
      data-guest-chip="true"
      draggable
      onDragStart={onDragStart}
      onClick={(e) => { e.stopPropagation(); onGuestClick?.(guest); }}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all"
      style={{
        background: isDragging ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: colors.bg, color: colors.text }}
      >
        {initials || guest.prenom[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.8)" }}>
          {guest.prenom} {guest.nom}
        </p>
        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
          {REGIME_LABELS[guest.regime_alimentaire]}
        </p>
      </div>
    </div>
  );
}
