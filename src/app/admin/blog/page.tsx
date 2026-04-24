"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ArticleRow = {
  id: string;
  slug: string;
  titre: string;
  category: string;
  statut: "brouillon" | "publie" | "archive";
  date_publication: string;
  nb_vues: number;
  updated_at: string;
};

const statutColors = {
  publie: "bg-green-100 text-green-700",
  brouillon: "bg-amber-100 text-amber-700",
  archive: "bg-gray-100 text-gray-500",
};

const statutLabels = {
  publie: "Publié",
  brouillon: "Brouillon",
  archive: "Archivé",
};

export default function AdminBlogPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"tous" | "publie" | "brouillon" | "archive">("tous");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/admin/blog", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }

  async function handleDelete(id: string, titre: string) {
    if (!confirm(`Supprimer "${titre}" ?`)) return;
    setDeleting(id);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`/api/admin/blog/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  }

  const filtered = filter === "tous" ? articles : articles.filter((a) => a.statut === filter);

  const counts = {
    tous: articles.length,
    publie: articles.filter((a) => a.statut === "publie").length,
    brouillon: articles.filter((a) => a.statut === "brouillon").length,
    archive: articles.filter((a) => a.statut === "archive").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => router.push("/admin/blog/new")}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(["tous", "publie", "brouillon", "archive"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "tous" ? "Tous" : statutLabels[tab]}
            <span className={`ml-1.5 text-xs ${filter === tab ? "text-gray-500" : "text-gray-400"}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Aucun article
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Titre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Catégorie</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Statut</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Publication</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Vues</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 line-clamp-1">{article.titre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{article.slug}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gray-600">{article.category}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statutColors[article.statut]}`}>
                      {statutLabels[article.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {new Date(article.date_publication).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 text-gray-500">{article.nb_vues.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => router.push(`/admin/blog/${article.id}`)}
                        className="text-xs font-medium text-gray-600 hover:text-rose-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.titre)}
                        disabled={deleting === article.id}
                        className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleting === article.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
