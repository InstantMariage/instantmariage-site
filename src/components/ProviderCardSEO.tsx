"use client";
import Image from "next/image";
import Link from "next/link";
import type { PrestataireRanked } from "@/lib/supabase";

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join("");
}

export default function ProviderCardSEO({ p }: { p: PrestataireRanked }) {
  const isPro = p.active_plan === "pro" || p.active_plan === "premium";
  const photo = p.cover_url || p.photos?.[0] || null;
  const prixLabel = p.prix_depart != null
    ? `À partir de ${p.prix_depart.toLocaleString("fr-FR")} €`
    : "Sur devis";

  function saveScroll() {
    sessionStorage.setItem("annuaire-scroll-position", String(window.scrollY));
  }

  return (
    <Link
      href={`/prestataires/${p.id}`}
      onClick={saveScroll}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`${p.nom_entreprise} – ${p.categorie} à ${p.ville}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
            style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
          >
            <span className="text-white text-4xl font-bold tracking-wide select-none">
              {getInitials(p.nom_entreprise)}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.verifie && (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Vérifié
            </span>
          )}
          {isPro && (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              ✨ Pro
            </span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-rose-600 transition-colors">
            {p.nom_entreprise}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{p.ville}</p>
        </div>
        {p.description && (
          <p className="text-sm text-gray-600 line-clamp-2 flex-1">{p.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`w-3.5 h-3.5 ${p.note_moyenne >= s ? "text-amber-400" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">({p.nb_avis})</span>
          </div>
          <span className="text-xs font-medium text-rose-600">{prixLabel}</span>
        </div>
      </div>
    </Link>
  );
}
