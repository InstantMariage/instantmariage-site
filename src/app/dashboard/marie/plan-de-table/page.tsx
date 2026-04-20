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
  seat_number: number | null;
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

/* Table visual constants — SEAT_SIZE 40 for better touch target (was 34) */
const TABLE_RADIUS = 50;
const SEAT_RADIUS = 90;
const SEAT_SIZE = 40;
const CONTAINER = (SEAT_RADIUS + SEAT_SIZE) * 2; // 260

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
const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const IconMenu = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

/* ─── Main component ─── */
export default function PlanDeTablePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [marieId, setMarieId] = useState<string | null>(null);
  const [coupleNames, setCoupleNames] = useState("Mariage");
  const [tables, setTables] = useState<WeddingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [exportingPDF, setExportingPDF] = useState(false);

  /* Mobile sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Guest popup */
  const [popupGuest, setPopupGuest] = useState<Guest | null>(null);

  /* Edit guest modal */
  const [editGuestOpen, setEditGuestOpen] = useState(false);
  const [editGuestForm, setEditGuestForm] = useState<{
    prenom: string; nom: string; relation: string;
    regime_alimentaire: Regime; email: string; telephone: string;
  }>({ prenom: "", nom: "", relation: "", regime_alimentaire: "normal", email: "", telephone: "" });
  const [savingGuest, setSavingGuest] = useState(false);

  /* Drag state (HTML5 — desktop) */
  const [dragGuest, setDragGuest] = useState<{
    guestId: string;
    fromTableId: string | null;
    fromSeatNumber: number | null;
  } | null>(null);
  const [dragOverTable, setDragOverTable] = useState<string | null>(null);
  const [dragOverSeat, setDragOverSeat] = useState<{ tableId: string; seatIdx: number } | null>(null);
  const [dragOverSidebar, setDragOverSidebar] = useState(false);

  /* Table move (mouse — desktop) */
  const movingTable = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  /* Touch drag refs */
  const touchDragRef = useRef<{
    guestId: string;
    fromTableId: string | null;
    fromSeatNumber: number | null;
    startX: number; startY: number;
    ghost: HTMLDivElement | null;
    isDragging: boolean;
    chipBg: string; chipColor: string; chipInitials: string;
  } | null>(null);

  const touchMoveTableRef = useRef<{
    id: string; offsetX: number; offsetY: number;
    startX: number; startY: number; isMoving: boolean;
  } | null>(null);

  /* Stable ref: always points to latest callbacks/state for use in effects */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const S = useRef<any>({});

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
      supabase.from("wedding_guests")
        .select("id,prenom,nom,regime_alimentaire,relation,table_id,seat_number,presence_confirmee,email,telephone")
        .eq("marie_id", mid),
    ]);

    const tablesData = (tRes.data ?? []) as WeddingTable[];
    const guestsData = (gRes.data ?? []) as Guest[];

    const needsSeat = guestsData.filter((g) => g.table_id !== null && g.seat_number === null);
    if (needsSeat.length > 0) {
      const updates: PromiseLike<unknown>[] = [];
      const byTable = new Map<string, Guest[]>();
      needsSeat.forEach((g) => {
        if (!byTable.has(g.table_id!)) byTable.set(g.table_id!, []);
        byTable.get(g.table_id!)!.push(g);
      });

      byTable.forEach((list, tableId) => {
        const table = tablesData.find((t) => t.id === tableId);
        if (!table) return;
        const occupied = new Set(
          guestsData
            .filter((g) => g.table_id === tableId && g.seat_number !== null)
            .map((g) => g.seat_number as number)
        );
        let cursor = 0;
        list.forEach((g) => {
          while (cursor < table.capacite && occupied.has(cursor)) cursor++;
          if (cursor >= table.capacite) return;
          g.seat_number = cursor;
          occupied.add(cursor);
          updates.push(
            supabase.from("wedding_guests").update({ seat_number: cursor }).eq("id", g.id).then()
          );
          cursor++;
        });
      });

      await Promise.all(updates);
    }

    setTables(tablesData);
    setGuests(guestsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const { data: marie } = await supabase.from("maries").select("id,prenom_marie1,prenom_marie2").eq("user_id", session.user.id).single();
      if (!marie) { router.replace("/dashboard/marie"); return; }
      setMarieId(marie.id);
      if (marie.prenom_marie1) {
        setCoupleNames(marie.prenom_marie2
          ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
          : marie.prenom_marie1);
      }
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

  function guestAtSeat(tableId: string, seatIdx: number): Guest | null {
    return guests.find((g) => g.table_id === tableId && g.seat_number === seatIdx) ?? null;
  }

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

  async function updateRelation(guestId: string, relation: string) {
    setGuests((prev) => prev.map((g) => g.id === guestId ? { ...g, relation } : g));
    setPopupGuest((prev) => prev?.id === guestId ? { ...prev, relation } : prev);
    await supabase.from("wedding_guests").update({ relation }).eq("id", guestId);
  }

  /* ── Assign guest to a specific seat ── */
  function assignGuest(guestId: string, tableId: string | null, seatNumber: number | null) {
    setGuests((prev) =>
      prev.map((g) => g.id === guestId ? { ...g, table_id: tableId, seat_number: seatNumber } : g)
    );
    triggerSave(async () => {
      await supabase
        .from("wedding_guests")
        .update({ table_id: tableId, seat_number: seatNumber })
        .eq("id", guestId);
    });
  }

  /* ── Swap two guests between their seats ── */
  function swapGuests(
    guestAId: string, tableAId: string | null, seatA: number | null,
    guestBId: string, tableBId: string | null, seatB: number | null
  ) {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id === guestAId) return { ...g, table_id: tableBId, seat_number: seatB };
        if (g.id === guestBId) return { ...g, table_id: tableAId, seat_number: seatA };
        return g;
      })
    );
    triggerSave(async () => {
      await Promise.all([
        supabase.from("wedding_guests").update({ table_id: tableBId, seat_number: seatB }).eq("id", guestAId),
        supabase.from("wedding_guests").update({ table_id: tableAId, seat_number: seatA }).eq("id", guestBId),
      ]);
    });
  }

  /* ── HTML5 DnD handlers (desktop) ── */
  function handleGuestDragStart(guestId: string, fromTableId: string | null, fromSeatNumber: number | null) {
    return (e: React.DragEvent) => {
      setDragGuest({ guestId, fromTableId, fromSeatNumber });
      e.dataTransfer.effectAllowed = "move";
      e.stopPropagation();
    };
  }

  function handleDropOnSeat(tableId: string, seatIdx: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSeat(null);
      setDragOverTable(null);
      if (!dragGuest) return;
      if (dragGuest.fromTableId === tableId && dragGuest.fromSeatNumber === seatIdx) {
        setDragGuest(null);
        return;
      }
      const occupant = guests.find(
        (g) => g.table_id === tableId && g.seat_number === seatIdx && g.id !== dragGuest.guestId
      );
      if (occupant) {
        swapGuests(
          dragGuest.guestId, dragGuest.fromTableId, dragGuest.fromSeatNumber,
          occupant.id, tableId, seatIdx
        );
      } else {
        assignGuest(dragGuest.guestId, tableId, seatIdx);
      }
      setDragGuest(null);
    };
  }

  function handleDropOnTable(tableId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverTable(null);
      if (!dragGuest) return;
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      const occupied = new Set(
        guests
          .filter((g) => g.table_id === tableId && g.id !== dragGuest.guestId)
          .map((g) => g.seat_number)
      );
      let firstFree = -1;
      for (let i = 0; i < table.capacite; i++) {
        if (!occupied.has(i)) { firstFree = i; break; }
      }
      if (firstFree === -1) { setDragGuest(null); return; }
      assignGuest(dragGuest.guestId, tableId, firstFree);
      setDragGuest(null);
    };
  }

  function handleDropOnSidebar(e: React.DragEvent) {
    e.preventDefault();
    setDragOverSidebar(false);
    if (!dragGuest || dragGuest.fromTableId === null) return;
    assignGuest(dragGuest.guestId, null, null);
    setDragGuest(null);
  }

  /* ── Table move (mouse — desktop) ── */
  function handleTableMouseDown(tableId: string) {
    return (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-guest-chip]")) return;
      if ((e.target as HTMLElement).closest("[data-table-action]")) return;
      if ((e.target as HTMLElement).closest("[data-seat]")) return;
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

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragGuest) return;
    assignGuest(dragGuest.guestId, null, null);
    setDragGuest(null);
  }

  /* ── Touch: table move start ── */
  function handleTableTouchStart(tableId: string) {
    return (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest("[data-guest-chip]")) return;
      if ((e.target as HTMLElement).closest("[data-table-action]")) return;
      if ((e.target as HTMLElement).closest("[data-seat]")) return;
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      touchMoveTableRef.current = {
        id: tableId,
        offsetX: touch.clientX - rect.left + canvas.scrollLeft - table.position_x,
        offsetY: touch.clientY - rect.top + canvas.scrollTop - table.position_y,
        startX: touch.clientX, startY: touch.clientY, isMoving: false,
      };
    };
  }

  /* ── Touch: guest drag start ── */
  function handleGuestTouchStart(
    guestId: string,
    fromTableId: string | null,
    fromSeatNumber: number | null,
    chipBg: string, chipColor: string, chipInitials: string
  ) {
    return (e: React.TouchEvent) => {
      e.stopPropagation(); // prevent table touchstart from also firing
      const touch = e.touches[0];
      touchDragRef.current = {
        guestId, fromTableId, fromSeatNumber,
        startX: touch.clientX, startY: touch.clientY,
        ghost: null, isDragging: false,
        chipBg, chipColor, chipInitials,
      };
    };
  }

  /* ── Update stable ref every render ── */
  S.current = {
    guests, tables,
    assignGuest, swapGuests, triggerSave,
    setGuests, setTables,
    setDragGuest, setDragOverSeat, setDragOverTable,
    setPopupGuest, setSidebarOpen,
  };

  /* ── Document-level touch handlers ── */
  useEffect(() => {
    const DRAG_THRESHOLD = 8;

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];

      /* Table move */
      if (touchMoveTableRef.current) {
        const ref = touchMoveTableRef.current;
        if (!ref.isMoving) {
          if (Math.hypot(touch.clientX - ref.startX, touch.clientY - ref.startY) < DRAG_THRESHOLD) return;
          ref.isMoving = true;
        }
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, touch.clientX - rect.left + canvas.scrollLeft - ref.offsetX);
        const y = Math.max(0, touch.clientY - rect.top + canvas.scrollTop - ref.offsetY);
        S.current.setTables((prev: WeddingTable[]) =>
          prev.map((t: WeddingTable) => t.id === ref.id ? { ...t, position_x: x, position_y: y } : t)
        );
        return;
      }

      /* Guest drag */
      if (touchDragRef.current) {
        const ref = touchDragRef.current;
        if (!ref.isDragging) {
          if (Math.hypot(touch.clientX - ref.startX, touch.clientY - ref.startY) < DRAG_THRESHOLD) return;
          ref.isDragging = true;
          /* Create ghost avatar */
          const ghost = document.createElement("div");
          ghost.style.cssText = [
            "position:fixed",
            `width:${SEAT_SIZE}px`,
            `height:${SEAT_SIZE}px`,
            "border-radius:50%",
            `background:${ref.chipBg}`,
            `color:${ref.chipColor}`,
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "font-size:14px",
            "font-weight:bold",
            "pointer-events:none",
            "z-index:9999",
            "opacity:0.92",
            "box-shadow:0 8px 28px rgba(0,0,0,0.55)",
            "transform:scale(1.2)",
            "user-select:none",
            "transition:none",
          ].join(";");
          ghost.textContent = ref.chipInitials;
          document.body.appendChild(ghost);
          ref.ghost = ghost as HTMLDivElement;
          S.current.setDragGuest({ guestId: ref.guestId, fromTableId: ref.fromTableId, fromSeatNumber: ref.fromSeatNumber });
        }
        e.preventDefault(); // block scroll during drag
        const half = SEAT_SIZE / 2;
        ref.ghost!.style.left = `${touch.clientX - half}px`;
        ref.ghost!.style.top  = `${touch.clientY - half}px`;

        /* Highlight drop target */
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const seatEl = el?.closest("[data-seat-idx]");
        if (seatEl) {
          S.current.setDragOverSeat({
            tableId: seatEl.getAttribute("data-seat-table")!,
            seatIdx: parseInt(seatEl.getAttribute("data-seat-idx")!),
          });
          S.current.setDragOverTable(null);
        } else {
          const tableEl = el?.closest("[data-table-drop]");
          S.current.setDragOverSeat(null);
          S.current.setDragOverTable(tableEl ? tableEl.getAttribute("data-table-drop") : null);
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0];

      /* Table move end */
      if (touchMoveTableRef.current) {
        const ref = touchMoveTableRef.current;
        touchMoveTableRef.current = null;
        if (ref.isMoving) {
          const table = (S.current.tables as WeddingTable[]).find((t) => t.id === ref.id);
          if (table) {
            S.current.triggerSave(async () => {
              await supabase.from("wedding_tables")
                .update({ position_x: table.position_x, position_y: table.position_y })
                .eq("id", ref.id);
            });
          }
        }
        return;
      }

      /* Guest drag end */
      if (touchDragRef.current) {
        const ref = touchDragRef.current;
        ref.ghost?.remove();
        const wasDragging = ref.isDragging;
        const { guestId, fromTableId, fromSeatNumber } = ref;
        touchDragRef.current = null;
        S.current.setDragGuest(null);
        S.current.setDragOverSeat(null);
        S.current.setDragOverTable(null);

        if (!wasDragging) return; // tap → onClick fires naturally

        /* Find drop target under finger */
        const el = document.elementFromPoint(touch.clientX, touch.clientY);

        /* Drop on a specific seat */
        const seatEl = el?.closest("[data-seat-idx]");
        if (seatEl) {
          const tableId = seatEl.getAttribute("data-seat-table")!;
          const seatIdx = parseInt(seatEl.getAttribute("data-seat-idx")!);
          if (fromTableId === tableId && fromSeatNumber === seatIdx) return;
          const guests: Guest[] = S.current.guests;
          const occupant = guests.find(
            (g) => g.table_id === tableId && g.seat_number === seatIdx && g.id !== guestId
          );
          if (occupant) {
            S.current.swapGuests(guestId, fromTableId, fromSeatNumber, occupant.id, tableId, seatIdx);
          } else {
            S.current.assignGuest(guestId, tableId, seatIdx);
          }
          S.current.setSidebarOpen(false);
          return;
        }

        /* Drop on table center → first free seat */
        const tableEl = el?.closest("[data-table-drop]");
        if (tableEl) {
          const tableId = tableEl.getAttribute("data-table-drop")!;
          const tables: WeddingTable[] = S.current.tables;
          const guests: Guest[] = S.current.guests;
          const table = tables.find((t) => t.id === tableId);
          if (!table) return;
          const occupied = new Set(
            guests.filter((g) => g.table_id === tableId && g.id !== guestId).map((g) => g.seat_number)
          );
          let firstFree = -1;
          for (let i = 0; i < table.capacite; i++) {
            if (!occupied.has(i)) { firstFree = i; break; }
          }
          if (firstFree === -1) return;
          S.current.assignGuest(guestId, tableId, firstFree);
          S.current.setSidebarOpen(false);
          return;
        }

        /* Drop on sidebar → unassign */
        const sidebarEl = el?.closest("[data-sidebar]");
        if (sidebarEl) {
          S.current.assignGuest(guestId, null, null);
          return;
        }

        /* Drop outside everything → unassign if was placed */
        if (fromTableId !== null) {
          S.current.assignGuest(guestId, null, null);
        }
      }
    }

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend",  onTouchEnd);
    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend",  onTouchEnd);
    };
  }, []); // intentionally empty — S.current always has latest values

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
    await supabase.from("wedding_guests").update({ table_id: null, seat_number: null }).eq("table_id", id);
    await supabase.from("wedding_tables").delete().eq("id", id);
    await loadData(marieId);
  }

  /* ── PDF Export ── */
  async function generatePDF() {
    if (exportingPDF) return;
    setExportingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");
      const W = 210, H = 297;
      const mL = 16, mR = 16;
      const cW = W - mL - mR;

      const WHITE  = [255, 255, 255] as [number,number,number];
      const BLACK  = [ 26,  26,  26] as [number,number,number];
      const GOLD   = [201, 168,  76] as [number,number,number];
      const GRAY   = [160, 160, 160] as [number,number,number];

      const sf = (c: [number,number,number]) => doc.setFillColor(c[0], c[1], c[2]);
      const sd = (c: [number,number,number]) => doc.setDrawColor(c[0], c[1], c[2]);
      const st = (c: [number,number,number]) => doc.setTextColor(c[0], c[1], c[2]);

      const bgPage = () => {
        sf(WHITE); doc.rect(0, 0, W, H, "F");
        sd(GOLD); doc.setLineWidth(0.4);
        doc.rect(8, 8, W - 16, H - 16, "S");
        sd(GOLD); doc.setLineWidth(0.15);
        doc.rect(10, 10, W - 20, H - 20, "S");
      };

      const goldLine = (gy: number, x1 = mL + 4, x2 = W - mR - 4) => {
        sd(GOLD); doc.setLineWidth(0.3); doc.line(x1, gy, x2, gy);
      };

      const diamond = (x: number, dy: number, size = 2) => {
        sf(GOLD);
        doc.lines([[size, size], [size, -size], [-size, -size], [-size, size]], x - size, dy, [1, 1], "F", true);
      };

      const divider = (dy: number) => {
        const cx = W / 2;
        goldLine(dy, mL + 10, cx - 5);
        goldLine(dy, cx + 5, W - mR - 10);
        diamond(cx, dy);
      };

      const pageFooter = () => {
        goldLine(H - 14);
        st(GOLD); doc.setFont("times", "italic"); doc.setFontSize(7);
        doc.text("InstantMariage", W / 2, H - 9.5, { align: "center" });
      };

      let y = 0;
      const checkPage = (needed: number) => {
        if (y + needed > H - 20) {
          pageFooter();
          doc.addPage(); bgPage();
          y = 24;
        }
      };

      const byTable: { [id: string]: { name: string; guests: Guest[] } } = {};
      const unassigned: Guest[] = [];
      guests.forEach((g) => {
        if (!g.table_id) { unassigned.push(g); return; }
        const tbl = tables.find((t) => t.id === g.table_id);
        if (!byTable[g.table_id]) byTable[g.table_id] = { name: tbl?.nom ?? "Table", guests: [] };
        byTable[g.table_id].guests.push(g);
      });

      Object.values(byTable).forEach((t) => {
        t.guests.sort((a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0));
      });

      const sortedTables = Object.values(byTable).sort((a, b) => a.name.localeCompare(b.name));
      if (unassigned.length) sortedTables.push({ name: "Non placés", guests: unassigned });

      bgPage();

      doc.setFont("times", "bolditalic"); doc.setFontSize(32); st(BLACK);
      doc.text(coupleNames, W / 2, 38, { align: "center" });

      doc.setFont("times", "normal"); doc.setFontSize(10); st(GOLD);
      doc.text("P L A N  D E  T A B L E", W / 2, 48, { align: "center" });

      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      doc.setFont("times", "italic"); doc.setFontSize(8); st(GRAY);
      doc.text(`${guests.length} invités · ${tables.length} tables · ${dateStr}`, W / 2, 56, { align: "center" });

      divider(63);
      y = 73;

      for (const t of sortedTables) {
        const isUnplaced = t.name === "Non placés";
        const LINE_H = 6.5;
        const cardH = 14 + t.guests.length * LINE_H + 3;

        checkPage(cardH + 6);

        sf(WHITE); doc.roundedRect(mL, y, cW, cardH, 2, 2, "F");
        sd(isUnplaced ? GRAY : GOLD);
        doc.setLineWidth(0.5);
        doc.roundedRect(mL, y, cW, cardH, 2, 2, "S");

        doc.setFont("times", "bold"); doc.setFontSize(10); st(isUnplaced ? GRAY : GOLD);
        doc.text(t.name.toUpperCase(), mL + 8, y + 8.5);

        doc.setFont("times", "italic"); doc.setFontSize(8); st(GRAY);
        doc.text(`${t.guests.length} invité${t.guests.length > 1 ? "s" : ""}`, mL + cW - 6, y + 8.5, { align: "right" });

        sd(isUnplaced ? GRAY : GOLD); doc.setLineWidth(0.3);
        doc.line(mL + 6, y + 12, mL + cW - 6, y + 12);

        const half = Math.ceil(t.guests.length / 2);
        const col1 = t.guests.slice(0, half);
        const col2 = t.guests.slice(half);
        const colW = (cW - 14) / 2;

        col1.forEach((g, i) => {
          const gy = y + 12 + LINE_H * (i + 1);
          const isSpecial = g.regime_alimentaire !== "normal";
          const seatLabel = g.seat_number !== null ? `${g.seat_number + 1}. ` : "";
          doc.setFont("times", isSpecial ? "italic" : "normal"); doc.setFontSize(9); st(BLACK);
          doc.text(seatLabel, mL + 8, gy);
          const seatW = doc.getTextWidth(seatLabel);
          const label = `${g.prenom} ${g.nom}`;
          doc.text(label, mL + 8 + seatW, gy);
          if (isSpecial) {
            const lw = doc.getTextWidth(label);
            doc.setFontSize(7); st(GRAY);
            doc.text(REGIME_LABELS[g.regime_alimentaire].slice(0, 3).toUpperCase(), mL + 8 + seatW + lw + 1.5, gy);
          }
        });

        col2.forEach((g, i) => {
          const gy = y + 12 + LINE_H * (i + 1);
          const isSpecial = g.regime_alimentaire !== "normal";
          const seatLabel = g.seat_number !== null ? `${g.seat_number + 1}. ` : "";
          doc.setFont("times", isSpecial ? "italic" : "normal"); doc.setFontSize(9); st(BLACK);
          doc.text(seatLabel, mL + 8 + colW + 2, gy);
          const seatW = doc.getTextWidth(seatLabel);
          const label = `${g.prenom} ${g.nom}`;
          doc.text(label, mL + 8 + colW + 2 + seatW, gy);
          if (isSpecial) {
            const lw = doc.getTextWidth(label);
            doc.setFontSize(7); st(GRAY);
            doc.text(REGIME_LABELS[g.regime_alimentaire].slice(0, 3).toUpperCase(), mL + 8 + colW + 2 + seatW + lw + 1.5, gy);
          }
        });

        y += cardH + 5;
      }

      pageFooter();

      doc.addPage(); bgPage();

      doc.setFont("times", "bolditalic"); doc.setFontSize(24); st(BLACK);
      doc.text("Récapitulatif", W / 2, 38, { align: "center" });
      doc.setFont("times", "normal"); doc.setFontSize(10); st(GOLD);
      doc.text("S T A T I S T I Q U E S", W / 2, 47, { align: "center" });
      divider(54);

      let sy = 68;

      doc.setFont("times", "bold"); doc.setFontSize(8.5); st(GOLD);
      doc.text("RÉGIMES ALIMENTAIRES", mL + 6, sy); sy += 10;

      const regimeCounts: Record<string, number> = {};
      guests.forEach((g) => { regimeCounts[g.regime_alimentaire] = (regimeCounts[g.regime_alimentaire] ?? 0) + 1; });

      Object.entries(REGIME_LABELS).forEach(([key, label]) => {
        const count = regimeCounts[key] ?? 0;
        if (!count) return;
        doc.setFont("times", "normal"); doc.setFontSize(11); st(BLACK);
        doc.text(label, mL + 10, sy);
        doc.setFont("times", "bold"); st(GRAY);
        doc.text(`${count}`, W - mR - 6, sy, { align: "right" });
        sd(GOLD); doc.setLineWidth(0.15);
        doc.line(mL + 6, sy + 2.5, W - mR - 6, sy + 2.5);
        sy += 12;
      });

      goldLine(sy + 3); sy += 10;
      doc.setFont("times", "bold"); doc.setFontSize(13); st(BLACK);
      doc.text("Total", mL + 10, sy);
      st(GOLD);
      doc.text(`${guests.length} couvert${guests.length > 1 ? "s" : ""}`, W - mR - 6, sy, { align: "right" });

      sy += 22;
      doc.setFont("times", "bold"); doc.setFontSize(8.5); st(GOLD);
      doc.text("PRÉSENCES", mL + 6, sy); sy += 10;

      const confirmed = guests.filter((g) => g.presence_confirmee === true).length;
      const declined  = guests.filter((g) => g.presence_confirmee === false).length;
      const pending   = guests.filter((g) => g.presence_confirmee === null).length;
      const placed    = guests.filter((g) => g.table_id !== null).length;

      [
        { label: "Confirmés", count: confirmed },
        { label: "Déclinés", count: declined },
        { label: "Sans réponse", count: pending },
        { label: "Placés en table", count: placed },
      ].forEach(({ label, count }) => {
        doc.setFont("times", "normal"); doc.setFontSize(11); st(BLACK);
        doc.text(label, mL + 10, sy);
        doc.setFont("times", "bold"); st(GRAY);
        doc.text(`${count}`, W - mR - 6, sy, { align: "right" });
        sd(GOLD); doc.setLineWidth(0.15);
        doc.line(mL + 6, sy + 2.5, W - mR - 6, sy + 2.5);
        sy += 12;
      });

      pageFooter();
      doc.save(`plan-de-table-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExportingPDF(false);
    }
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
  const unassignedCount = guests.filter((g) => !g.table_id).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0f172a" }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 flex-shrink-0 z-20"
        style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/dashboard/marie/invites"
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <IconBack /> <span className="hidden sm:inline">Invités</span>
        </Link>

        <div className="w-px h-4 bg-white/10" />

        <h1 className="text-sm font-bold text-white">Plan de table</h1>

        <div className="flex items-center gap-2 ml-auto">
          {saveStatus !== "idle" && (
            <span
              className="hidden sm:flex text-xs font-medium px-2.5 py-1 rounded-full items-center gap-1.5 transition-all"
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
            {placedGuests}/{totalGuests}
          </span>

          <button
            onClick={generatePDF}
            disabled={exportingPDF || tables.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
          >
            {exportingPDF ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
            ) : (
              <IconDownload />
            )}
            <span className="hidden sm:inline">{exportingPDF ? "PDF…" : "Exporter en PDF"}</span>
          </button>

          <button
            onClick={openAddTable}
            disabled={tables.length >= 50}
            className="flex items-center gap-1.5 text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <IconPlus />
            <span className="hidden sm:inline">Table {tables.length >= 50 ? "(50/50)" : ""}</span>
          </button>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex sm:hidden items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl relative"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <IconMenu />
            {unassignedCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                style={{ background: "#F06292", fontSize: "9px", fontWeight: "bold" }}
              >
                {unassignedCount > 9 ? "9+" : unassignedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + canvas ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Sidebar ─ desktop: always visible, mobile: slide-in drawer ── */}
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 sm:hidden"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          data-sidebar="true"
          className={[
            /* mobile: fixed slide-in */
            "fixed sm:relative inset-y-0 left-0 z-40 sm:z-auto",
            "w-72 sm:w-64 flex-shrink-0 flex flex-col overflow-hidden",
            "transition-transform duration-200 sm:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          style={{ background: "#1e293b", borderRight: "1px solid rgba(255,255,255,0.08)" }}
          onDragOver={(e) => { e.preventDefault(); setDragOverSidebar(true); }}
          onDragLeave={() => setDragOverSidebar(false)}
          onDrop={handleDropOnSidebar}
        >
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: dragOverSidebar ? "rgba(240,98,146,0.1)" : "transparent",
              transition: "background 0.15s",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Non placés · {guests.filter((g) => !g.table_id).length}
              </p>
              {/* Close button — mobile only */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="sm:hidden w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
              >
                <IconClose />
              </button>
            </div>
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
              unassignedGuests.map((g) => {
                const colors = REGIME_COLORS[g.regime_alimentaire];
                const initials = `${g.prenom[0] ?? ""}${g.nom[0] ?? ""}`.toUpperCase();
                return (
                  <GuestChip
                    key={g.id}
                    guest={g}
                    onDragStart={handleGuestDragStart(g.id, null, null)}
                    onTouchStart={handleGuestTouchStart(g.id, null, null, colors.bg, colors.text, initials)}
                    isDragging={dragGuest?.guestId === g.id}
                    isDropTarget={false}
                    compact={false}
                    onGuestClick={setPopupGuest}
                  />
                );
              })
            )}
          </div>

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
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
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
              tables.map((table) => {
                const tGuests = tableGuests(table.id);
                const isFull = tGuests.length >= table.capacite;
                const isTableOver = dragOverTable === table.id;

                return (
                  <div
                    key={table.id}
                    data-table-drop={table.id}
                    style={{
                      position: "absolute",
                      left: table.position_x,
                      top: table.position_y,
                      width: CONTAINER,
                      height: CONTAINER + 44,
                      cursor: movingTable.current?.id === table.id ? "grabbing" : "grab",
                      userSelect: "none",
                      touchAction: "none",
                    }}
                    onMouseDown={handleTableMouseDown(table.id)}
                    onTouchStart={handleTableTouchStart(table.id)}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverTable(table.id); }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverTable(null);
                    }}
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
                        background: isTableOver && !isFull
                          ? "rgba(240,98,146,0.25)"
                          : isFull
                          ? "rgba(220,38,38,0.12)"
                          : "rgba(255,255,255,0.07)",
                        border: isTableOver && !isFull
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

                    {/* Seat slots */}
                    {Array.from({ length: table.capacite }).map((_, seatIdx) => {
                      const pos = seatPosition(seatIdx, table.capacite);
                      const seatGuest = guestAtSeat(table.id, seatIdx);
                      const isSeatOver =
                        dragOverSeat?.tableId === table.id && dragOverSeat.seatIdx === seatIdx;
                      const isDraggingThis = dragGuest?.guestId === seatGuest?.id;
                      const colors = seatGuest ? REGIME_COLORS[seatGuest.regime_alimentaire] : null;
                      const initials = seatGuest
                        ? `${seatGuest.prenom[0] ?? ""}${seatGuest.nom[0] ?? ""}`.toUpperCase()
                        : "";

                      return (
                        <div
                          key={seatIdx}
                          data-seat="true"
                          data-seat-idx={seatIdx}
                          data-seat-table={table.id}
                          style={{
                            position: "absolute",
                            left: pos.left,
                            top: pos.top,
                            width: SEAT_SIZE,
                            height: SEAT_SIZE,
                            borderRadius: "50%",
                            zIndex: isSeatOver ? 20 : 10,
                            /* Larger touch hit area via padding trick */
                            touchAction: "none",
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (dragGuest) setDragOverSeat({ tableId: table.id, seatIdx });
                          }}
                          onDragLeave={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              setDragOverSeat((prev) =>
                                prev?.tableId === table.id && prev.seatIdx === seatIdx ? null : prev
                              );
                            }
                          }}
                          onDrop={handleDropOnSeat(table.id, seatIdx)}
                        >
                          {seatGuest ? (
                            <GuestChip
                              guest={seatGuest}
                              onDragStart={handleGuestDragStart(seatGuest.id, table.id, seatIdx)}
                              onTouchStart={handleGuestTouchStart(
                                seatGuest.id, table.id, seatIdx,
                                colors!.bg, colors!.text, initials
                              )}
                              isDragging={isDraggingThis}
                              isDropTarget={isSeatOver && !isDraggingThis}
                              compact
                              onGuestClick={setPopupGuest}
                            />
                          ) : (
                            <div
                              style={{
                                width: SEAT_SIZE,
                                height: SEAT_SIZE,
                                borderRadius: "50%",
                                border: isSeatOver
                                  ? "2px solid #F06292"
                                  : "1.5px dashed rgba(255,255,255,0.15)",
                                background: isSeatOver
                                  ? "rgba(240,98,146,0.2)"
                                  : "rgba(255,255,255,0.02)",
                                transition: "border-color 0.15s, background 0.15s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: "700",
                                  color: isSeatOver ? "#F06292" : "rgba(255,255,255,0.2)",
                                  userSelect: "none",
                                  lineHeight: 1,
                                }}
                              >
                                {seatIdx + 1}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Table action buttons */}
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
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <IconEdit />
                      </button>
                      <button
                        data-table-action="true"
                        onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "rgba(220,38,38,0.12)", color: "rgba(220,38,38,0.6)" }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
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

            <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.07)" }} />

            <div className="space-y-2.5">
              {popupGuest.table_id && (
                <div className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 8v4l3 3" />
                  </svg>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Place</span>
                  <span className="text-xs font-semibold ml-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {tables.find((t) => t.id === popupGuest.table_id)?.nom ?? "—"}
                    {popupGuest.seat_number !== null && (
                      <span style={{ color: "rgba(255,255,255,0.4)" }}> · siège {popupGuest.seat_number + 1}</span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: REGIME_COLORS[popupGuest.regime_alimentaire].bg }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Régime</span>
                <span className="text-xs font-semibold ml-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {REGIME_LABELS[popupGuest.regime_alimentaire]}
                </span>
              </div>

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
  onDragStart,
  onTouchStart,
  isDragging,
  isDropTarget,
  compact,
  onGuestClick,
  style: extraStyle,
}: {
  guest: Guest;
  onDragStart: (e: React.DragEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  isDragging: boolean;
  isDropTarget: boolean;
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
        onTouchStart={onTouchStart}
        onClick={(e) => { e.stopPropagation(); onGuestClick?.(guest); }}
        title={`${guest.prenom} ${guest.nom}`}
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
          fontSize: "12px",
          fontWeight: "bold",
          cursor: "grab",
          opacity: isDragging ? 0.3 : 1,
          transition: "opacity 0.15s, box-shadow 0.15s",
          border: isDropTarget ? "2px solid #F06292" : "2px solid rgba(255,255,255,0.2)",
          boxShadow: isDropTarget
            ? "0 0 0 3px rgba(240,98,146,0.4), 0 0 14px rgba(240,98,146,0.4)"
            : undefined,
          userSelect: "none",
          zIndex: 10,
          touchAction: "none",
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
      onTouchStart={onTouchStart}
      onClick={(e) => { e.stopPropagation(); onGuestClick?.(guest); }}
      className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer transition-all"
      style={{
        background: isDragging ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
        touchAction: "none",
        ...extraStyle,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
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
