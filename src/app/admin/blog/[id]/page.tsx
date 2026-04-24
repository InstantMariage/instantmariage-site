"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ── Types ──────────────────────────────────────────────────── */
type BlockType = "intro" | "h2" | "h3" | "p" | "ul" | "ol" | "tip" | "quote" | "table";

interface EditorBlock {
  _id: string;
  type: BlockType;
  text: string;
  title: string;
  author: string;
  headers: string;
  rows: string;
}

interface FormState {
  titre: string;
  slug: string;
  excerpt: string;
  category: string;
  image: string;
  meta_description: string;
  keywords: string;
  read_time: string;
  auteur: string;
  statut: string;
  date_publication: string;
  blocks: EditorBlock[];
}

/* ── Helpers ────────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2);
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function emptyBlock(type: BlockType): EditorBlock {
  return { _id: uid(), type, text: "", title: "", author: "", headers: "", rows: "" };
}

function blocksToJson(blocks: EditorBlock[]) {
  return blocks.map((b) => {
    switch (b.type) {
      case "intro":
      case "h2":
      case "h3":
      case "p":
        return { type: b.type, text: b.text };
      case "ul":
      case "ol":
        return { type: b.type, items: b.text.split("\n").filter(Boolean) };
      case "tip":
        return { type: b.type, title: b.title, text: b.text };
      case "quote":
        return { type: b.type, text: b.text, ...(b.author ? { author: b.author } : {}) };
      case "table": {
        const headerList = b.headers.split(",").map((h) => h.trim());
        const rowList = b.rows
          .split("\n")
          .filter(Boolean)
          .map((r) => r.split(",").map((c) => c.trim()));
        return { type: b.type, headers: headerList, rows: rowList };
      }
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonToBlocks(content: any[]): EditorBlock[] {
  return content.map((b) => {
    const base = emptyBlock(b.type as BlockType);
    switch (b.type) {
      case "intro":
      case "h2":
      case "h3":
      case "p":
        return { ...base, text: b.text ?? "" };
      case "ul":
      case "ol":
        return { ...base, text: (b.items ?? []).join("\n") };
      case "tip":
        return { ...base, title: b.title ?? "", text: b.text ?? "" };
      case "quote":
        return { ...base, text: b.text ?? "", author: b.author ?? "" };
      case "table":
        return {
          ...base,
          headers: (b.headers ?? []).join(", "),
          rows: (b.rows ?? []).map((r: string[]) => r.join(", ")).join("\n"),
        };
      default:
        return base;
    }
  });
}

const blockLabels: Record<BlockType, string> = {
  intro: "Introduction",
  h2: "Titre H2",
  h3: "Titre H3",
  p: "Paragraphe",
  ul: "Liste à puces",
  ol: "Liste numérotée",
  tip: "Astuce",
  quote: "Citation",
  table: "Tableau",
};

const CATEGORIES = ["Budget", "Organisation", "Inspiration", "Prestataires", "Mode", "Conseils"];

const emptyForm = (): FormState => ({
  titre: "",
  slug: "",
  excerpt: "",
  category: "Conseils",
  image: "",
  meta_description: "",
  keywords: "",
  read_time: "5 min",
  auteur: "InstantMariage",
  statut: "brouillon",
  date_publication: new Date().toISOString().slice(0, 16),
  blocks: [],
});

/* ── Component ──────────────────────────────────────────────── */
export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";

  const [form, setForm] = useState<FormState>(emptyForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Load existing article */
  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/admin/blog/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      // fetch the full article via admin API — but that route only has PATCH/DELETE
      // so we use the Supabase client directly here (admin has service role via RLS bypass)
      const sbAdmin = (await import("@supabase/supabase-js")).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await sbAdmin.from("articles").select("*").eq("id", id).single();
      if (data) {
        setForm({
          titre: data.titre ?? "",
          slug: data.slug ?? "",
          excerpt: data.excerpt ?? "",
          category: data.category ?? "Conseils",
          image: data.image ?? "",
          meta_description: data.meta_description ?? "",
          keywords: data.keywords ?? "",
          read_time: data.read_time ?? "5 min",
          auteur: data.auteur ?? "InstantMariage",
          statut: data.statut ?? "brouillon",
          date_publication: data.date_publication
            ? new Date(data.date_publication).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          blocks: Array.isArray(data.content) ? jsonToBlocks(data.content) : [],
        });
        setSlugManual(true);
      }
      setLoading(false);
      void res; // res not used — loading done via supabase directly
    })();
  }, [id, isNew]);

  /* Image upload to Supabase Storage bucket "blog" */
  async function handleImageUpload(file: File) {
    setSizeWarning(file.size > 5 * 1024 * 1024);
    setUploading(true);
    setUploadError(null);

    const cleanName = file.name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase();
    const fileName = `${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage.from("blog").upload(fileName, file);
    if (error) {
      setUploadError("Upload échoué : " + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("blog").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, image: publicUrl }));
    setUploading(false);
  }

  /* Auto-slug from title */
  const setTitre = useCallback((v: string) => {
    setForm((prev) => ({
      ...prev,
      titre: v,
      slug: slugManual ? prev.slug : toSlug(v),
    }));
  }, [slugManual]);

  /* Block operations */
  function addBlock(type: BlockType) {
    setForm((prev) => ({ ...prev, blocks: [...prev.blocks, emptyBlock(type)] }));
  }

  function removeBlock(idx: number) {
    setForm((prev) => ({ ...prev, blocks: prev.blocks.filter((_, i) => i !== idx) }));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setForm((prev) => {
      const arr = [...prev.blocks];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...prev, blocks: arr };
    });
  }

  function updateBlock(idx: number, patch: Partial<EditorBlock>) {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }));
  }

  /* Save */
  async function save(targetStatut?: string) {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const payload = {
      titre: form.titre,
      slug: form.slug,
      excerpt: form.excerpt || null,
      category: form.category,
      image: form.image || null,
      meta_description: form.meta_description || null,
      keywords: form.keywords || null,
      read_time: form.read_time,
      auteur: form.auteur,
      statut: targetStatut ?? form.statut,
      date_publication: new Date(form.date_publication).toISOString(),
      content: blocksToJson(form.blocks),
    };

    const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (isNew) {
        const data = await res.json();
        router.replace(`/admin/blog/${data.id}`);
      } else {
        setForm((prev) => ({ ...prev, statut: targetStatut ?? prev.statut }));
      }
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/blog")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate max-w-xs">
            {isNew ? "Nouvel article" : (form.titre || "Sans titre")}
          </h1>
          {saved && (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              Enregistré ✓
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {form.statut !== "publie" && (
            <button
              onClick={() => save("publie")}
              disabled={saving || !form.titre || !form.slug}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Publier
            </button>
          )}
          <button
            onClick={() => save()}
            disabled={saving || !form.titre || !form.slug}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            Enregistrer
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── Métadonnées ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informations générales</h2>

          {/* Titre */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Titre *</label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de l'article"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugManual(true); setForm((prev) => ({ ...prev, slug: e.target.value })); }}
                placeholder="mon-article-url"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 font-mono"
              />
              <button
                onClick={() => { setForm((prev) => ({ ...prev, slug: toSlug(prev.titre) })); setSlugManual(false); }}
                className="text-xs text-gray-500 hover:text-rose-500 border border-gray-200 rounded-xl px-3 py-2 hover:border-rose-300 transition-colors whitespace-nowrap"
              >
                ↻ Regénérer
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">instantmariage.fr/blog/{form.slug || "…"}</p>
          </div>

          {/* Row: catégorie + read_time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Temps de lecture</label>
              <input
                type="text"
                value={form.read_time}
                onChange={(e) => setForm((prev) => ({ ...prev, read_time: e.target.value }))}
                placeholder="8 min"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Extrait</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              placeholder="Courte description affichée dans la liste d'articles…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>

          {/* Image de couverture */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Image de couverture</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="https://images.unsplash.com/…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-sm font-medium text-rose-500 border border-rose-300 hover:bg-rose-50 disabled:opacity-50 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                {uploading ? (
                  <span className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "📁"
                )}
                {uploading ? "Upload…" : "Uploader"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </div>
            {sizeWarning && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Image &gt; 5 MB — pensez à la compresser pour de meilleures performances.
              </p>
            )}
            {uploadError && (
              <p className="text-xs text-red-500 mt-1">{uploadError}</p>
            )}
            {form.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl" />
            )}
          </div>
        </div>

        {/* ── SEO ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">SEO</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Meta description
              <span className={`ml-2 ${form.meta_description.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                {form.meta_description.length}/160
              </span>
            </label>
            <textarea
              value={form.meta_description}
              onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))}
              rows={3}
              maxLength={160}
              placeholder="Description pour les moteurs de recherche…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Mots-clés</label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder="mariage, budget, prestataires…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </div>

        {/* ── Éditeur de blocs ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Contenu · {form.blocks.length} bloc{form.blocks.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {/* Add block buttons */}
          <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-gray-100">
            {(Object.keys(blockLabels) as BlockType[]).map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="text-xs font-medium text-gray-600 border border-gray-200 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                + {blockLabels[type]}
              </button>
            ))}
          </div>

          {/* Blocks */}
          {form.blocks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Cliquez sur un bouton ci-dessus pour ajouter votre premier bloc de contenu.
            </p>
          ) : (
            <div className="space-y-3">
              {form.blocks.map((block, idx) => (
                <BlockEditor
                  key={block._id}
                  block={block}
                  idx={idx}
                  total={form.blocks.length}
                  onChange={(patch) => updateBlock(idx, patch)}
                  onRemove={() => removeBlock(idx)}
                  onMove={(dir) => moveBlock(idx, dir)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Publication ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Publication</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm((prev) => ({ ...prev, statut: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="brouillon">Brouillon</option>
                <option value="publie">Publié</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date de publication</label>
              <input
                type="datetime-local"
                value={form.date_publication}
                onChange={(e) => setForm((prev) => ({ ...prev, date_publication: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Auteur</label>
            <input
              type="text"
              value={form.auteur}
              onChange={(e) => setForm((prev) => ({ ...prev, auteur: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => save()}
              disabled={saving || !form.titre || !form.slug}
              className="flex-1 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            {form.statut !== "publie" && (
              <button
                onClick={() => save("publie")}
                disabled={saving || !form.titre || !form.slug}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                {saving ? "Publication…" : "Publier"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Block editor sub-component ─────────────────────────────── */
function BlockEditor({
  block,
  idx,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  block: EditorBlock;
  idx: number;
  total: number;
  onChange: (patch: Partial<EditorBlock>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const typeColors: Record<BlockType, string> = {
    intro: "bg-rose-50 border-rose-200 text-rose-700",
    h2: "bg-blue-50 border-blue-200 text-blue-700",
    h3: "bg-indigo-50 border-indigo-200 text-indigo-700",
    p: "bg-gray-50 border-gray-200 text-gray-600",
    ul: "bg-green-50 border-green-200 text-green-700",
    ol: "bg-teal-50 border-teal-200 text-teal-700",
    tip: "bg-amber-50 border-amber-200 text-amber-700",
    quote: "bg-purple-50 border-purple-200 text-purple-700",
    table: "bg-orange-50 border-orange-200 text-orange-700",
  };

  const baseInput = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none bg-white";

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Block header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeColors[block.type]}`}>
          {blockLabels[block.type]}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={idx === 0}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1 rounded hover:bg-gray-100 transition-colors text-xs"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={idx === total - 1}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1 rounded hover:bg-gray-100 transition-colors text-xs"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-red-400 p-1 rounded hover:bg-red-50 transition-colors ml-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Block inputs */}
      <div className="p-4 space-y-3">
        {(block.type === "intro" || block.type === "h2" || block.type === "h3" || block.type === "p") && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={block.type === "p" ? 4 : 2}
            placeholder={block.type === "intro" ? "Paragraphe d'introduction…" : block.type === "p" ? "Contenu du paragraphe…" : "Titre…"}
            className={baseInput}
          />
        )}

        {(block.type === "ul" || block.type === "ol") && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={4}
            placeholder={"Un élément par ligne\nDeuxième élément\nTroisième élément"}
            className={baseInput}
          />
        )}

        {block.type === "tip" && (
          <>
            <input
              type="text"
              value={block.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Titre de l'astuce"
              className={baseInput}
            />
            <textarea
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value })}
              rows={3}
              placeholder="Contenu de l'astuce…"
              className={baseInput}
            />
          </>
        )}

        {block.type === "quote" && (
          <>
            <textarea
              value={block.text}
              onChange={(e) => onChange({ text: e.target.value })}
              rows={3}
              placeholder="Texte de la citation…"
              className={baseInput}
            />
            <input
              type="text"
              value={block.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="Auteur (optionnel)"
              className={baseInput}
            />
          </>
        )}

        {block.type === "table" && (
          <>
            <div>
              <p className="text-xs text-gray-400 mb-1">En-têtes (séparés par des virgules)</p>
              <input
                type="text"
                value={block.headers}
                onChange={(e) => onChange({ headers: e.target.value })}
                placeholder="Colonne 1, Colonne 2, Colonne 3"
                className={baseInput}
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Lignes (une ligne par rangée, cellules séparées par des virgules)</p>
              <textarea
                value={block.rows}
                onChange={(e) => onChange({ rows: e.target.value })}
                rows={4}
                placeholder={"Valeur A, Valeur B, Valeur C\nValeur D, Valeur E, Valeur F"}
                className={baseInput}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
