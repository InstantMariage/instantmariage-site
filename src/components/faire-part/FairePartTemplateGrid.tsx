"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const templates = [
  {
    id: "elegance-doree",
    name: "Élégance Dorée",
    style: "Classique & Raffiné",
    description: "Calligraphie dorée sur fond crème ivoire, fioritures délicates.",
    tag: "Populaire",
    tagColor: "bg-amber-100 text-amber-700",
    preview: { bg: "from-amber-50 via-yellow-50 to-amber-100", accent: "#C9A96E", textColor: "text-amber-800", pattern: "elegance" },
  },
  {
    id: "boheme-champetre",
    name: "Bohème Champêtre",
    style: "Nature & Bohème",
    description: "Aquarelles florales, tons beige et vert sauge, ambiance bucolique.",
    tag: "Tendance",
    tagColor: "bg-green-100 text-green-700",
    preview: { bg: "from-stone-100 via-green-50 to-emerald-100", accent: "#6B8F71", textColor: "text-stone-700", pattern: "boheme" },
  },
  {
    id: "moderne-minimal",
    name: "Moderne Minimal",
    style: "Épuré & Contemporain",
    description: "Typographie moderne, espaces blancs, lignes géométriques fines.",
    tag: "Nouveau",
    tagColor: "bg-gray-100 text-gray-600",
    preview: { bg: "from-white via-gray-50 to-slate-100", accent: "#1a1a1a", textColor: "text-gray-900", pattern: "minimal" },
  },
  {
    id: "luxe-marbre",
    name: "Luxe Marbré",
    style: "Luxe & Sophistiqué",
    description: "Veines de marbre blanc et or, élégance absolue pour une union d'exception.",
    tag: "Premium",
    tagColor: "bg-rose-100 text-rose-700",
    preview: { bg: "from-slate-100 via-gray-100 to-zinc-200", accent: "#8B7355", textColor: "text-zinc-800", pattern: "marbre" },
  },
  {
    id: "romantique-floral",
    name: "Romantique Floral",
    style: "Romantique & Fleuri",
    description: "Pivoines et roses en pleine floraison, douceur rose poudré.",
    tag: "Populaire",
    tagColor: "bg-pink-100 text-pink-700",
    preview: { bg: "from-pink-50 via-rose-50 to-fuchsia-50", accent: "#F06292", textColor: "text-rose-700", pattern: "floral" },
  },
  {
    id: "cote-dazur",
    name: "Côte d'Azur",
    style: "Méditerranéen & Lumineux",
    description: "Azur profond, blanc éclatant, esprit Riviera française ensoleillée.",
    tag: "Exclusif",
    tagColor: "bg-blue-100 text-blue-700",
    preview: { bg: "from-sky-100 via-blue-100 to-cyan-100", accent: "#0284C7", textColor: "text-sky-800", pattern: "azur" },
  },
  {
    id: "provence-olivier",
    name: "Provence Olivier",
    style: "Provençal & Authentique",
    description: "Branches d'olivier, lavande, terre de Provence et senteurs estivales.",
    tag: "Tendance",
    tagColor: "bg-purple-100 text-purple-700",
    preview: { bg: "from-violet-50 via-purple-50 to-lime-50", accent: "#6B7C45", textColor: "text-purple-800", pattern: "provence" },
  },
  {
    id: "nuit-etoilee",
    name: "Nuit Étoilée",
    style: "Mystique & Romantique",
    description: "Ciel étoilé profond, or céleste, invitation au voyage nocturne.",
    tag: "Nouveau",
    tagColor: "bg-indigo-100 text-indigo-700",
    preview: { bg: "from-indigo-900 via-violet-900 to-slate-900", accent: "#C9A96E", textColor: "text-indigo-100", pattern: "nuit" },
  },
];

function TemplatePreview({ template }: { template: (typeof templates)[0] }) {
  const { preview, name } = template;
  return (
    <div className={`relative w-full h-48 rounded-t-xl bg-gradient-to-br ${preview.bg} flex flex-col items-center justify-center overflow-hidden`}>
      {preview.pattern === "elegance" && (
        <>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #C9A96E 1px, transparent 1px), radial-gradient(circle at 80% 20%, #C9A96E 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
            {["✦","✦","✦"].map((s,i) => <span key={i} style={{ color: preview.accent, fontSize: "10px" }}>{s}</span>)}
          </div>
          <div className="w-16 h-px mb-2" style={{ background: preview.accent }} />
        </>
      )}
      {preview.pattern === "boheme" && (
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 10% 10%, #8B6F47 20px, transparent 20px), radial-gradient(ellipse at 90% 90%, #6B8F71 15px, transparent 15px)" }} />
      )}
      {preview.pattern === "minimal" && (
        <>
          <div className="absolute top-6 left-6 w-8 h-px bg-gray-400 opacity-50" />
          <div className="absolute bottom-6 right-6 w-8 h-px bg-gray-400 opacity-50" />
        </>
      )}
      {preview.pattern === "marbre" && (
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(135deg, transparent 30%, rgba(139,115,85,0.3) 45%, transparent 55%, rgba(139,115,85,0.15) 70%, transparent 80%)" }} />
      )}
      {preview.pattern === "floral" && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl pointer-events-none select-none">🌸</div>
      )}
      {preview.pattern === "azur" && (
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20" style={{ background: "linear-gradient(to top, #0284C7, transparent)" }} />
      )}
      {preview.pattern === "provence" && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-8xl pointer-events-none select-none">🌿</div>
      )}
      {preview.pattern === "nuit" && (
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: i % 3 === 0 ? "3px" : "2px", height: i % 3 === 0 ? "3px" : "2px", background: "#C9A96E", opacity: 0.6 + (i % 4) * 0.1, top: `${10 + (i * 17) % 80}%`, left: `${5 + (i * 23) % 90}%` }} />
          ))}
        </div>
      )}
      <div className="relative text-center px-4 z-10">
        <p className={`text-xs font-semibold uppercase tracking-widest mb-1.5 opacity-60 ${preview.textColor}`}>Mariage</p>
        <p className={`text-base font-bold ${preview.textColor}`} style={{ fontFamily: "var(--font-playfair), serif" }}>
          Sophie & Thomas
        </p>
        <div className="my-2 flex items-center justify-center gap-2">
          <div className="h-px w-8 opacity-40" style={{ background: preview.accent }} />
          <div className="w-1 h-1 rounded-full opacity-40" style={{ background: preview.accent }} />
          <div className="h-px w-8 opacity-40" style={{ background: preview.accent }} />
        </div>
        <p className={`text-xs opacity-60 ${preview.textColor}`}>14 Juin 2025 · Paris</p>
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-t-xl" />
    </div>
  );
}

export default function FairePartTemplateGrid() {
  const [hasExistingFairePart, setHasExistingFairePart] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!marie) return;
      const { count } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("marie_id", marie.id);
      if (count && count > 0) setHasExistingFairePart(true);
    });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {hasExistingFairePart && (
        <div
          className="mb-8 rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: "#FFF0F5", border: "1px solid #FECDD3" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F06292" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Vous avez déjà un faire-part</p>
            <p className="text-xs text-gray-500 mt-0.5">Pour changer de template en conservant vos données, rendez-vous dans votre dashboard.</p>
          </div>
          <Link
            href="/dashboard/marie/faire-parts"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-90"
            style={{ background: "#e91e8c", color: "white" }}
          >
            Changer de template →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <TemplatePreview template={template} />
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h2 className="text-base font-bold text-gray-900 leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {template.name}
                </h2>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${template.tagColor}`}>
                  {template.tag}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{template.style}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{template.description}</p>

              {hasExistingFairePart ? (
                <Link
                  href="/dashboard/marie/faire-parts"
                  className="block w-full text-center text-sm font-semibold py-2.5 px-4 rounded-full transition-all duration-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  Changer de template →
                </Link>
              ) : (
                <Link
                  href={`/faire-part/${template.id}`}
                  className="block w-full text-center text-sm font-semibold py-2.5 px-4 rounded-full transition-all duration-200 border-2 border-[#F06292] text-[#F06292] hover:bg-[#F06292] hover:text-white group-hover:shadow-md"
                >
                  Personnaliser →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
