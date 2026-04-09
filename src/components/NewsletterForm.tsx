"use client";

import { useState } from "react";

interface NewsletterFormProps {
  variant?: "footer" | "sidebar";
}

export default function NewsletterForm({ variant = "footer" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Merci ! Vous êtes bien inscrit à notre newsletter.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setStatus("error");
      setMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  if (variant === "sidebar") {
    return (
      <form onSubmit={handleSubmit}>
        {status === "success" ? (
          <p className="text-sm text-white font-medium bg-white/20 rounded-xl px-4 py-3">
            {message}
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 mb-3"
            />
            {status === "error" && (
              <p className="text-sm text-white/90 bg-white/20 rounded-lg px-3 py-2 mb-3">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-white font-semibold text-rose-500 py-2.5 rounded-xl text-sm hover:bg-rose-50 transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "Inscription…" : "S'abonner gratuitement"}
            </button>
          </>
        )}
      </form>
    );
  }

  // Footer variant
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full md:w-auto">
      {status === "success" ? (
        <p className="text-sm text-white font-medium bg-white/20 rounded-xl px-4 py-3 md:w-80">
          {message}
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              required
              className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-white text-rose-500 hover:bg-rose-50 font-semibold px-5 py-3 rounded-xl transition-colors text-sm whitespace-nowrap disabled:opacity-60"
            >
              {status === "loading" ? "…" : "S'inscrire"}
            </button>
          </div>
          {status === "error" && (
            <p className="text-sm text-white/90 bg-white/20 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
        </>
      )}
    </form>
  );
}
