"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://instantmariage.fr/reset-password",
    });
    setLoading(false);
    if (authError) {
      setError("Une erreur est survenue. Vérifiez votre adresse email et réessayez.");
      return;
    }
    setSent(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-6 py-12"
      style={{ background: "linear-gradient(to bottom, #fdf2f8 0%, #fff9fb 40%, #ffffff 100%)" }}
    >
      {/* Logo */}
      <div className="mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div style={{ mixBlendMode: "multiply" }}>
            <Image src="/logo.png" alt="InstantMariage logo" width={42} height={42} />
          </div>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            <span style={{ color: "#F06292" }}>Instant</span>
            <span className="text-gray-900">Mariage.fr</span>
          </span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-rose-100 px-8 py-10">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)" }}
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#F06292" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#F06292">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#fbb6ce">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)" }}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#F06292" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              Un email vous a été envoyé avec un lien pour réinitialiser votre mot de passe.{" "}
              <span className="font-medium text-gray-900">Vérifiez vos spams.</span>
            </p>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#F06292" }}
            >
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          /* Form */
          <>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
                    </svg>
                    Envoi…
                  </span>
                ) : "Envoyer le lien de réinitialisation"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link
                href="/login"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: "#F06292" }}
              >
                ← Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
