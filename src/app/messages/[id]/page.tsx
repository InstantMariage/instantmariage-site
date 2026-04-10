"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

interface MessageItem {
  id: string;
  contenu: string;
  expediteur_id: string;
  created_at: string;
  lu: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
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

function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

function isPdf(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}

function FileIcon({ filename }: { filename: string }) {
  if (isPdf(filename)) {
    return (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
        <path d="M8 13h8v1.5H8V13zm0 3h5v1.5H8V16z"/>
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
    </svg>
  );
}

function AttachmentDisplay({
  url,
  name,
  isMe,
}: {
  url: string;
  name: string | null | undefined;
  isMe: boolean;
}) {
  const filename = name || url.split("/").pop() || "fichier";

  if (isImage(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <img
          src={url}
          alt={filename}
          className="max-w-full rounded-xl"
          style={{ maxHeight: 220, objectFit: "cover" }}
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={filename}
      className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
        isMe
          ? "bg-white/20 hover:bg-white/30 text-white"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      <FileIcon filename={filename} />
      <span className="truncate max-w-[160px]">{filename}</span>
      <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const convId = params.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("...");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherPrestaId, setOtherPrestaId] = useState<string | null>(null);
  const [myName, setMyName] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Pièce jointe
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(
    async (uid: string, otherId: string) => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, contenu, expediteur_id, destinataire_id, created_at, lu, attachment_url, attachment_name")
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
        supabase.from("prestataires").select("id, nom_entreprise").eq("user_id", otherId).maybeSingle(),
        supabase.from("prestataires").select("nom_entreprise").eq("user_id", uid).maybeSingle(),
      ]);

      if (prest) {
        setOtherUserName(prest.nom_entreprise);
        setOtherPrestaId(prest.id);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Fichier trop volumineux (max 10 Mo).");
      e.target.value = "";
      return;
    }

    setPendingFile(file);
    e.target.value = "";
  };

  const removePendingFile = () => {
    setPendingFile(null);
    setUploadError(null);
  };

  const handleSend = async () => {
    const hasText = newMessage.trim().length > 0;
    const hasFile = pendingFile !== null;
    if ((!hasText && !hasFile) || !userId || !otherUserId || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    setUploadError(null);

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;

    // Upload du fichier si présent
    if (pendingFile) {
      const ext = pendingFile.name.split(".").pop();
      const path = `${convId}/${Date.now()}-${pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

      const { error: uploadErr } = await supabase.storage
        .from("messages-attachments")
        .upload(path, pendingFile, { upsert: false });

      if (uploadErr) {
        setUploadError("Erreur lors de l'envoi du fichier.");
        setSending(false);
        setNewMessage(content);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("messages-attachments")
        .getPublicUrl(path);

      attachmentUrl = publicData.publicUrl;
      attachmentName = pendingFile.name;
      setPendingFile(null);
    }

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: convId,
        expediteur_id: userId,
        destinataire_id: otherUserId,
        contenu: content || (attachmentName ? `📎 ${attachmentName}` : ""),
        lu: false,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      })
      .select("id, contenu, expediteur_id, created_at, lu, attachment_url, attachment_name")
      .single();

    if (!error && inserted) {
      setMessages((prev) =>
        prev.find((m) => m.id === inserted.id) ? prev : [...prev, inserted]
      );
    }

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
              messagePreview: content || `[Pièce jointe : ${attachmentName}]`,
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

  const canSend = (newMessage.trim().length > 0 || pendingFile !== null) && !sending;

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
            {otherPrestaId ? (
              <Link
                href={`/prestataires/${otherPrestaId}`}
                className="font-semibold text-sm truncate hover:underline"
                style={{ color: "#F06292" }}
              >
                {otherUserName}
              </Link>
            ) : (
              <p className="font-semibold text-gray-900 text-sm truncate">{otherUserName}</p>
            )}
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

                    const hasAttachment = !!msg.attachment_url;
                    const textContent = hasAttachment && !msg.contenu.trim()
                      ? null
                      : msg.contenu.startsWith("📎 ") && hasAttachment
                      ? null
                      : msg.contenu;

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
                            {textContent && <p>{textContent}</p>}
                            {hasAttachment && (
                              <AttachmentDisplay
                                url={msg.attachment_url!}
                                name={msg.attachment_name}
                                isMe={isMe}
                              />
                            )}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        {/* Aperçu fichier sélectionné */}
        {pendingFile && (
          <div className="max-w-2xl mx-auto px-4 pt-2.5">
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              <FileIcon filename={pendingFile.name} />
              <span className="text-sm text-gray-700 truncate flex-1">{pendingFile.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {(pendingFile.size / 1024 / 1024).toFixed(1)} Mo
              </span>
              <button
                onClick={removePendingFile}
                className="flex-shrink-0 text-gray-400 hover:text-rose-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Erreur upload */}
        {uploadError && (
          <div className="max-w-2xl mx-auto px-4 pt-2">
            <p className="text-xs text-red-500">{uploadError}</p>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-2">
          {/* Input fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Bouton trombone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-rose-400 hover:bg-rose-50 transition-all disabled:opacity-40"
            title="Joindre un fichier"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

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
            disabled={!canSend}
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
