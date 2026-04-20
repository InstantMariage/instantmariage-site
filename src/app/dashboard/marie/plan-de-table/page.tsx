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
};

/* ─── Constants ─── */
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
      supabase.from("wedding_guests").select("id,prenom,nom,regime_alimentaire,relation,table_id,presence_confirmee").eq("marie_id", mid),
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
        offsetX: e.clientX - rect.left - table.position_x,
        offsetY: e.clientY - rect.top - table.position_y,
      };
    };
  }

  function handleCanvasMouseMove(e: React.MouseEvent) {
    if (!movingTable.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - movingTable.current.offsetX);
    const newY = Math.max(0, e.clientY - rect.top - movingTable.current.offsetY);
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
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
          >
            <IconPlus /> Table
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
          className="flex-1 relative overflow-auto cursor-default select-none"
          style={{
            background: "#0f172a",
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
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
  style: extraStyle,
}: {
  guest: Guest;
  fromTableId: string | null;
  onDragStart: (e: React.DragEvent) => void;
  isDragging: boolean;
  compact: boolean;
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
        title={`${guest.prenom} ${guest.nom} · ${REGIME_LABELS[guest.regime_alimentaire]}`}
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
          cursor: "grab",
          opacity: isDragging ? 0.3 : 1,
          transition: "opacity 0.15s, transform 0.1s",
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
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-grab transition-all"
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
