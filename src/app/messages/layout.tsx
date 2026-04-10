"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

interface ConversationItem {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  last_message_is_mine: boolean;
  unread_count: number;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "maintenant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"marie" | "prestataire" | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedId = pathname.startsWith("/messages/")
    ? pathname.replace("/messages/", "")
    : null;
  const isOnConversation = !!selectedId;

  const loadConversations = useCallback(async (uid: string) => {
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
      .order("last_message_at", { ascending: false });

    if (error || !convs) {
      setLoading(false);
      return;
    }

    const items: ConversationItem[] = [];

    for (const conv of convs) {
      const otherId =
        conv.participant1_id === uid ? conv.participant2_id : conv.participant1_id;

      let displayName = "Utilisateur";

      let avatarUrl: string | null = null;

      const { data: prest } = await supabase
        .from("prestataires")
        .select("nom_entreprise, avatar_url")
        .eq("user_id", otherId)
        .maybeSingle();

      if (prest) {
        displayName = prest.nom_entreprise;
        avatarUrl = prest.avatar_url ?? null;
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

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("contenu, created_at, expediteur_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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
        other_avatar_url: avatarUrl,
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/login");
        return;
      }
      const uid = session.user.id;
      setUserId(uid);
      loadConversations(uid);

      const { data: prest } = await supabase
        .from("prestataires")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();
      setUserRole(prest ? "prestataire" : "marie");
    });
  }, [router, loadConversations]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("inbox-realtime-layout")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => loadConversations(userId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadConversations]);

  const totalUnread = conversations.reduce((n, c) => n + c.unread_count, 0);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      <Header />

      {/* Two-panel layout below fixed header */}
      <div className="flex flex-1 overflow-hidden mt-16 md:mt-20">
        {/* ── SIDEBAR ── */}
        <aside
          className={`
            ${isOnConversation ? "hidden md:flex" : "flex"}
            flex-col w-full md:w-80 lg:w-96 flex-shrink-0
            bg-white border-r border-gray-100
          `}
        >
          {/* Sidebar header */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            {userRole && (
              <Link
                href={
                  userRole === "prestataire"
                    ? "/dashboard/prestataire"
                    : "/dashboard/marie"
                }
                className="inline-flex items-center gap-1 text-xs font-medium mb-2.5 transition-colors"
                style={{ color: "#F06292" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Mon espace
              </Link>
            )}
            <div className="flex items-center justify-between">
              <h1
                className="text-xl font-bold text-gray-900"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Messages
              </h1>
              {totalUnread > 0 && (
                <span
                  className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ background: "#F06292" }}
                >
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3.5 animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-100 rounded w-2/5" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#FFF0F5" }}
                >
                  <svg
                    className="w-7 h-7"
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
                <p className="font-semibold text-gray-700 text-sm mb-1.5">
                  Aucune conversation
                </p>
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                  Contactez un prestataire depuis l&apos;annuaire pour démarrer.
                </p>
                <Link
                  href="/annuaire"
                  className="text-xs font-semibold text-white px-5 py-2.5 rounded-full shadow-sm transition-all hover:shadow-md"
                  style={{ background: "#F06292" }}
                >
                  Parcourir l&apos;annuaire
                </Link>
              </div>
            ) : (
              <ul>
                {conversations.map((conv) => {
                  const isSelected = conv.id === selectedId;
                  const hasUnread = conv.unread_count > 0;

                  return (
                    <li key={conv.id}>
                      <Link
                        href={`/messages/${conv.id}`}
                        className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                          isSelected
                            ? "bg-rose-50"
                            : "hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full flex-shrink-0 select-none overflow-hidden">
                          {conv.other_avatar_url ? (
                            <img
                              src={conv.other_avatar_url}
                              alt={conv.other_user_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white font-bold text-base"
                              style={{
                                background: hasUnread ? "#F06292" : "#F8BBD9",
                              }}
                            >
                              {conv.other_user_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <span
                              className={`text-sm truncate ${
                                hasUnread
                                  ? "font-bold text-gray-900"
                                  : "font-semibold text-gray-700"
                              }`}
                            >
                              {conv.other_user_name}
                            </span>
                            <span
                              className="text-xs flex-shrink-0"
                              style={{
                                color: hasUnread ? "#F06292" : "#9CA3AF",
                                fontWeight: hasUnread ? 600 : 400,
                              }}
                            >
                              {timeAgo(conv.last_message_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-xs truncate flex-1 ${
                                hasUnread
                                  ? "text-gray-800 font-medium"
                                  : "text-gray-400"
                              }`}
                            >
                              {conv.last_message_is_mine && (
                                <span className="text-gray-400 font-normal">
                                  Vous :{" "}
                                </span>
                              )}
                              {conv.last_message || "Conversation démarrée"}
                            </p>
                            {hasUnread && (
                              <span
                                className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                                style={{ background: "#F06292" }}
                              >
                                {conv.unread_count > 9
                                  ? "9+"
                                  : conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      {/* Divider (skip after last) */}
                      <div className="mx-[72px] h-px bg-gray-50" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <div
          className={`${
            !isOnConversation ? "hidden md:flex" : "flex"
          } flex-1 flex-col overflow-hidden bg-[#F5F5F7]`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
