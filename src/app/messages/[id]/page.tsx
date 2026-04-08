"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

interface MessageItem {
  id: string;
  contenu: string;
  expediteur_id: string;
  created_at: string;
  lu: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const convId = params.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("...");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [myName, setMyName] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(
    async (uid: string, otherId: string) => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, contenu, expediteur_id, destinataire_id, created_at, lu")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) return;
      setMessages(data ?? []);

      // Marquer les messages reçus comme lus
      const unreadIds = (data ?? [])
        .filter((m) => m.destinataire_id === uid && !m.lu)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ lu: true })
          .in("id", unreadIds);
      }
    },
    [convId]
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      const uid = session.user.id;
      setUserId(uid);

      // Vérifier que l'utilisateur est bien un participant
      const { data: conv, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", convId)
        .maybeSingle();

      if (error || !conv) { setNotFound(true); setLoading(false); return; }

      if (conv.participant1_id !== uid && conv.participant2_id !== uid) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const otherId =
        conv.participant1_id === uid ? conv.participant2_id : conv.participant1_id;
      setOtherUserId(otherId);

      // Nom de l'interlocuteur et de l'utilisateur courant
      const [{ data: prest }, { data: myPrest }] = await Promise.all([
        supabase.from("prestataires").select("nom_entreprise").eq("user_id", otherId).maybeSingle(),
        supabase.from("prestataires").select("nom_entreprise").eq("user_id", uid).maybeSingle(),
      ]);

      if (prest) {
        setOtherUserName(prest.nom_entreprise);
      } else {
        const { data: marie } = await supabase
          .from("maries")
          .select("prenom_marie1, prenom_marie2")
          .eq("user_id", otherId)
          .maybeSingle();

        if (marie) {
          setOtherUserName(
            marie.prenom_marie2
              ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
              : marie.prenom_marie1
          );
        } else {
          const { data: u } = await supabase
            .from("users")
            .select("email")
            .eq("id", otherId)
            .maybeSingle();
          if (u) setOtherUserName(u.email.split("@")[0]);
        }
      }

      if (myPrest) {
        setMyName(myPrest.nom_entreprise);
      } else {
        const { data: myMarie } = await supabase
          .from("maries")
          .select("prenom_marie1, prenom_marie2")
          .eq("user_id", uid)
          .maybeSingle();
        if (myMarie) {
          setMyName(
            myMarie.prenom_marie2
              ? `${myMarie.prenom_marie1} & ${myMarie.prenom_marie2}`
              : myMarie.prenom_marie1
          );
        }
      }

      await loadMessages(uid, otherId);
      setLoading(false);
    });
  }, [convId, router, loadMessages]);

  // Scroll au bas à chaque nouveau message
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime : nouveaux messages
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`conv-${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        async (payload) => {
          const msg = payload.new as MessageItem;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Marquer comme lu si c'est pour moi
          if (msg.expediteur_id !== userId) {
            await supabase
              .from("messages")
              .update({ lu: true })
              .eq("id", msg.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [convId, userId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !otherUserId || sending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: convId,
      expediteur_id: userId,
      destinataire_id: otherUserId,
      contenu: content,
      lu: false,
    });

    if (!error) {
      // Mettre à jour last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", convId);

      // Envoyer notification email au destinataire (fire-and-forget)
      try {
        const { data: recipientUser } = await supabase
          .from("users")
          .select("email")
          .eq("id", otherUserId)
          .maybeSingle();

        if (recipientUser?.email) {
          fetch("/api/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "new_message",
              recipientEmail: recipientUser.email,
              recipientName: otherUserName,
              senderName: myName || "Un utilisateur",
              messagePreview: content,
              conversationId: convId,
            }),
          }).catch(() => {});
        }
      } catch {}
    }

    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Grouper les messages par date
  const groupedMessages: { date: string; items: MessageItem[] }[] = [];
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && new Date(last.items[0].created_at).toDateString() === dateKey) {
      last.items.push(msg);
    } else {
      groupedMessages.push({ date: formatDate(msg.created_at), items: [msg] });
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Conversation introuvable.</p>
            <Link
              href="/messages"
              className="text-sm font-semibold"
              style={{ color: "#F06292" }}
            >
              ← Retour aux messages
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Barre de conversation */}
      <div
        className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-white border-b border-rose-100 shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/messages"
            className="p-2 rounded-full hover:bg-rose-50 text-gray-500 hover:text-rose-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "#F06292" }}
          >
            {otherUserName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{otherUserName}</p>
          </div>
        </div>
      </div>

      {/* Zone messages */}
      <main
        className="flex-1 overflow-y-auto pt-36 md:pt-40 pb-28"
        style={{ maxHeight: "100vh" }}
      >
        <div className="max-w-2xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#F06292", borderTopColor: "transparent" }}
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
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
              <p className="font-semibold text-gray-700 mb-1">
                Démarrez la conversation
              </p>
              <p className="text-sm text-gray-400">
                Envoyez votre premier message à {otherUserName}
              </p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Séparateur de date */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium px-2">{group.date}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Messages du groupe */}
                <div className="space-y-1.5">
                  {group.items.map((msg, idx) => {
                    const isMe = msg.expediteur_id === userId;
                    const prevMsg = idx > 0 ? group.items[idx - 1] : null;
                    const showAvatar =
                      !isMe &&
                      (!prevMsg || prevMsg.expediteur_id !== msg.expediteur_id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {/* Avatar interlocuteur */}
                        {!isMe && (
                          <div
                            className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                              showAvatar ? "visible" : "invisible"
                            }`}
                            style={{ background: "#F06292" }}
                          >
                            {otherUserName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? "text-white rounded-br-sm"
                                : "text-gray-800 bg-white shadow-sm rounded-bl-sm"
                            }`}
                            style={isMe ? { background: "#F06292" } : undefined}
                          >
                            {msg.contenu}
                          </div>
                          <span className="text-xs text-gray-300 mt-0.5 px-1">
                            {formatTime(msg.created_at)}
                            {isMe && (
                              <span className="ml-1">
                                {msg.lu ? "✓✓" : "✓"}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Zone de saisie */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message…"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              // @ts-ignore
              "--tw-ring-color": "#F06292",
            } as React.CSSProperties}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all duration-200 disabled:opacity-40"
            style={{ background: "#F06292" }}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
