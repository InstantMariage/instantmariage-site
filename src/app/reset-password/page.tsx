"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the token from the URL hash automatically on session restoration
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Une erreur est survenue. Le lien a peut-être expiré. Demandez un nouveau lien.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
            Nouveau mot de passe
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </div>

        {done ? (
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
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              Mot de passe mis à jour avec succès !
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Vous allez être redirigé vers la connexion…
            </p>
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#F06292" }}
            >
              Se connecter maintenant →
            </Link>
          </div>
        ) : (
          <>
            {!ready && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                En attente de validation du lien… Si cette page reste bloquée, cliquez à nouveau sur le lien reçu par email.
              </div>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !ready}
                className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
                    </svg>
                    Mise à jour…
                  </span>
                ) : "Mettre à jour le mot de passe"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link
                href="/mot-de-passe-oublie"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: "#F06292" }}
              >
                ← Demander un nouveau lien
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
