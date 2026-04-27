"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type SearchResult = {
  user_id: string;
  display_name: string;
  email: string;
  type: "prestataire" | "marie";
};

type PrestatairesRaw = {
  id: string;
  nom_entreprise: string;
  user_id: string;
  users: { email: string } | null;
};

type MariesRaw = {
  id: string;
  prenom_marie1: string;
  prenom_marie2: string | null;
  user_id: string;
  users: { email: string } | null;
};

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export default function MessagesAdminPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recipient, setRecipient] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preselectUserId = params.get("userId");
    const preselectName = params.get("name");
    if (preselectUserId && preselectName) {
      setRecipient({
        user_id: preselectUserId,
        display_name: decodeURIComponent(preselectName),
        email: "",
        type: "prestataire",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recipient) {
      setResults([]);
      return;
    }
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const headers = await authHeader();
      const res = await fetch(
        `/api/admin/message?q=${encodeURIComponent(query)}`,
        { headers }
      );
      if (!res.ok) { setSearching(false); return; }
      const data: { prestataires: PrestatairesRaw[]; maries: MariesRaw[] } = await res.json();
      const mapped: SearchResult[] = [
        ...(data.prestataires ?? []).map((p) => ({
          user_id: p.user_id,
          display_name: p.nom_entreprise,
          email: p.users?.email ?? "",
          type: "prestataire" as const,
        })),
        ...(data.maries ?? []).map((m) => ({
          user_id: m.user_id,
          display_name: m.prenom_marie2
            ? `${m.prenom_marie1} & ${m.prenom_marie2}`
            : m.prenom_marie1,
          email: m.users?.email ?? "",
          type: "marie" as const,
        })),
      ];
      setResults(mapped);
      setSearching(false);
    }, 300);
  }, [query, recipient]);

  async function send() {
    if (!recipient || !message.trim()) return;
    setSending(true);
    setError(null);
    const headers = await authHeader();
    const res = await fetch("/api/admin/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ user_id: recipient.user_id, contenu: message }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de l'envoi");
    } else {
      setSent(true);
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    }
    setSending(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Envoyer un message</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Message envoyé depuis le compte système InstantMariage vers un prestataire ou un marié
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {/* Destinataire */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Destinataire
          </label>

          {recipient ? (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{recipient.display_name}</p>
                <p className="text-xs text-gray-400">{recipient.email}</p>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={
                  recipient.type === "prestataire"
                    ? { background: "#EFF6FF", color: "#3B82F6" }
                    : { background: "#FFF0F5", color: "#F06292" }
                }
              >
                {recipient.type === "prestataire" ? "Prestataire" : "Marié·e"}
              </span>
              <button
                onClick={() => { setRecipient(null); setQuery(""); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un prestataire ou un marié par nom…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              )}
              {results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  {results.map((r) => (
                    <button
                      key={r.user_id}
                      onClick={() => { setRecipient(r); setQuery(""); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.display_name}</p>
                        <p className="text-xs text-gray-400 truncate">{r.email}</p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                        style={
                          r.type === "prestataire"
                            ? { background: "#EFF6FF", color: "#3B82F6" }
                            : { background: "#FFF0F5", color: "#F06292" }
                        }
                      >
                        {r.type === "prestataire" ? "Prestataire" : "Marié·e"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {query.length >= 2 && !searching && results.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
                  Aucun résultat pour « {query} »
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Message
          </label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message…"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Le message sera envoyé depuis le compte InstantMariage et apparaîtra dans la messagerie du destinataire.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {sent && (
          <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Message envoyé avec succès.
          </p>
        )}

        <button
          onClick={send}
          disabled={!recipient || !message.trim() || sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "#F06292" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {sending ? "Envoi…" : "Envoyer le message"}
        </button>
      </div>
    </div>
  );
}
