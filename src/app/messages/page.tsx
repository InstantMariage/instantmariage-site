"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface ConversationItem {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  last_message: string;
  last_message_at: string;
  last_message_is_mine: boolean;
  unread_count: number;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async (uid: string) => {
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
      .order("last_message_at", { ascending: false });

    if (error || !convs) { setLoading(false); return; }

    const items: ConversationItem[] = [];

    for (const conv of convs) {
      const otherId =
        conv.participant1_id === uid ? conv.participant2_id : conv.participant1_id;

      // Nom de l'interlocuteur
      let displayName = "Utilisateur";
      let role = "marie";

      const { data: prest } = await supabase
        .from("prestataires")
        .select("nom_entreprise")
        .eq("user_id", otherId)
        .maybeSingle();

      if (prest) {
        displayName = prest.nom_entreprise;
        role = "prestataire";
      } else {
        const { data: marie } = await supabase
          .from("maries")
          .select("prenom_marie1, prenom_marie2")
          .eq("user_id", otherId)
          .maybeSingle();

        if (marie) {
          displayName = marie.prenom_marie2
            ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
            : marie.prenom_marie1;
        } else {
          const { data: u } = await supabase
            .from("users")
            .select("email")
            .eq("id", otherId)
            .maybeSingle();
          if (u) displayName = u.email.split("@")[0];
        }
      }

      // Dernier message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("contenu, created_at, lu, expediteur_id, destinataire_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Nb messages non lus
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("destinataire_id", uid)
        .eq("lu", false);

      items.push({
        id: conv.id,
        other_user_id: otherId,
        other_user_name: displayName,
        other_user_role: role,
        last_message: lastMsg?.contenu ?? "",
        last_message_at: lastMsg?.created_at ?? conv.created_at,
        last_message_is_mine: lastMsg?.expediteur_id === uid,
        unread_count: count ?? 0,
      });
    }

    setConversations(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      loadConversations(session.user.id);
    });
  }, [router, loadConversations]);

  // Realtime : rafraîchir quand un nouveau message arrive
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => loadConversations(userId)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, loadConversations]);

  const totalUnread = conversations.reduce((n, c) => n + c.unread_count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Messages
              </h1>
              {totalUnread > 0 && (
                <p className="text-sm mt-0.5" style={{ color: "#F06292" }}>
                  {totalUnread} message{totalUnread > 1 ? "s" : ""} non lu{totalUnread > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Liste des conversations */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#FFF0F5" }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: "#F06292" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <p className="font-semibold text-gray-700 text-lg mb-2">
                Aucune conversation
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Contactez un prestataire depuis l&apos;annuaire pour démarrer une conversation.
              </p>
              <Link
                href="/annuaire"
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-sm transition-all hover:shadow-md"
                style={{ background: "#F06292" }}
              >
                Parcourir l&apos;annuaire
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
                    style={{ background: conv.unread_count > 0 ? "#F06292" : "#FBBDD9" }}
                  >
                    {conv.other_user_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm truncate ${
                          conv.unread_count > 0
                            ? "font-bold text-gray-900"
                            : "font-semibold text-gray-700"
                        }`}
                      >
                        {conv.other_user_name}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {timeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs truncate flex-1 ${
                          conv.unread_count > 0
                            ? "text-gray-700 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {conv.last_message_is_mine && (
                          <span className="text-gray-400">Vous : </span>
                        )}
                        {conv.last_message || "Conversation démarrée"}
                      </p>
                      {conv.unread_count > 0 && (
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ background: "#F06292" }}
                        >
                          {conv.unread_count > 9 ? "9+" : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flèche */}
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-rose-300 flex-shrink-0 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
