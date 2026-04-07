"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const WEDDING_IMG = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=95";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    const role = data.user?.user_metadata?.role;
    if (role === "prestataire") {
      router.push("/dashboard/prestataire");
    } else {
      router.push("/dashboard/marie");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Photo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {!imgError ? (
          <Image
            src={WEDDING_IMG}
            alt="Mariage élégant"
            fill
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-rose-700 to-rose-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div style={{ mixBlendMode: "normal" }}>
              <Image src="/logo.png" alt="InstantMariage logo" width={44} height={44} />
            </div>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <span style={{ color: "#F06292" }}>Instant</span>
              <span className="text-white">Mariage.fr</span>
            </span>
          </Link>
          <div className="text-white">
            <p className="text-4xl font-bold leading-snug mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Votre mariage de rêve commence ici
            </p>
            <p className="text-white/80 text-lg leading-relaxed">
              Trouvez les meilleurs prestataires, gérez votre planning et créez le mariage parfait.
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div style={{ mixBlendMode: "multiply" }}>
              <Image src="/logo.png" alt="InstantMariage logo" width={36} height={36} />
            </div>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <span style={{ color: "#F06292" }}>Instant</span>
              <span className="text-gray-900">Mariage.fr</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Bon retour !
            </h1>
            <p className="text-gray-500 text-sm">
              Connectez-vous à votre espace InstantMariage.fr
            </p>
          </div>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1664D6] rounded-xl py-3 px-4 text-sm font-medium text-white transition-all duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuer avec Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou par email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: "#F06292" }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="font-semibold hover:underline transition-colors"
              style={{ color: "#F06292" }}
            >
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
