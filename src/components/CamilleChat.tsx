"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const AVATAR_URL =
  "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777404758338-design-sans-titre.png";

const WELCOME_MESSAGE =
  "Bonjour ! Je suis Camille, votre wedding planner virtuelle 💐 Je peux vous aider à trouver des prestataires, organiser votre mariage, ou répondre à vos questions. Comment puis-je vous aider ?";

const QUICK_REPLIES = [
  "Trouver un prestataire 🔍",
  "L'album photo 📸",
  "Les tarifs 💎",
  "Organiser mon mariage 📋",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CamilleChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTeaser(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  function openChat() {
    setIsOpen(true);
    setHasOpened(true);
    setShowTeaser(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/camille/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolée, une erreur s'est produite. Réessayez dans un instant 🙏" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {/* Teaser bubble */}
      {showTeaser && !isOpen && !hasOpened && (
        <div
          className="bg-white rounded-2xl rounded-br-sm shadow-lg px-4 py-2 text-sm text-gray-700 border border-gray-100 cursor-pointer animate-fade-in"
          onClick={openChat}
        >
          Besoin d&apos;aide ? 💐
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "520px" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#F06292" }}>
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src={AVATAR_URL}
                alt="Camille"
                fill
                className="rounded-full object-cover border-2 border-white"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Camille</p>
              <p className="text-white/80 text-xs leading-tight">Wedding Planner virtuelle ✨</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-white/90 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                En ligne
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors ml-1"
                aria-label="Fermer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="relative w-7 h-7 shrink-0 mt-1">
                    <Image
                      src={AVATAR_URL}
                      alt="Camille"
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                  style={msg.role === "user" ? { background: "#F06292" } : undefined}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="relative w-7 h-7 shrink-0 mt-1">
                  <Image src={AVATAR_URL} alt="Camille" fill className="rounded-full object-cover" unoptimized />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies — only after welcome, before user writes */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 mt-1">
                {QUICK_REPLIES.map((label) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(label)}
                    className="text-xs px-3 py-1.5 rounded-full border border-pink-300 text-pink-600 bg-white hover:bg-pink-50 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-pink-400 bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
              style={{ background: "#F06292" }}
              aria-label="Envoyer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="relative w-[60px] h-[60px] rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none"
          style={{ background: "#F06292" }}
          aria-label="Ouvrir le chat avec Camille"
        >
          <Image
            src={AVATAR_URL}
            alt="Camille"
            fill
            className="rounded-full object-cover"
            unoptimized
          />
          {!hasOpened && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              1
            </span>
          )}
        </button>
      )}
    </div>
  );
}
