"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const WEDDING_IMG = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=95";

type AccountType = "marie" | "prestataire" | null;

const metiers = [
  "Photographe",
  "Vidéaste",
  "DJ",
  "Musicien / Groupe",
  "Traiteur",
  "Fleuriste",
  "Décorateur",
  "Coiffeur",
  "Maquilleur",
  "Henna",
  "Lieu de réception",
  "Officiant",
  "Wedding Planner",
  "Pâtissier / Wedding cake",
  "Animation",
  "Transport",
  "Créateur de contenu",
  "Papeterie & Personnalisation",
  "Autre",
];

export default function InscriptionPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [cgu, setCgu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  // Mariés form
  const [mPrenom, setMPrenom] = useState("");
  const [mNom, setMNom] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPassword, setMPassword] = useState("");
  const [mConfirmPassword, setMConfirmPassword] = useState("");
  const [mDate, setMDate] = useState("");
  const [mShowPwd, setMShowPwd] = useState(false);
  const [mShowConfirmPwd, setMShowConfirmPwd] = useState(false);

  // Prestataire form
  const [pEntreprise, setPEntreprise] = useState("");
  const [pMetier, setPMetier] = useState("");
  const [pVille, setPVille] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [pConfirmPassword, setPConfirmPassword] = useState("");
  const [pTel, setPTel] = useState("");
  const [pShowPwd, setPShowPwd] = useState(false);
  const [pShowConfirmPwd, setPShowConfirmPwd] = useState(false);

  const mPasswordsMatch = mConfirmPassword === "" || mPassword === mConfirmPassword;
  const pPasswordsMatch = pConfirmPassword === "" || pPassword === pConfirmPassword;

  const handleGoogleSignup = async () => {
    if (!accountType) return;
    localStorage.setItem("oauth_intended_role", accountType);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://instantmariage.fr/auth/callback" },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = accountType === "marie" ? mEmail : pEmail;
    const password = accountType === "marie" ? mPassword : pPassword;
    const metadata =
      accountType === "marie"
        ? { role: "marie", prenom: mPrenom, nom: mNom, date_mariage: mDate || null }
        : { role: "prestataire", nom_entreprise: pEntreprise, categorie: pMetier, ville: pVille, telephone: pTel };

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : `Erreur : ${authError.message}`);
      return;
    }

    if (!signUpData.user) {
      setLoading(false);
      setError("Erreur : aucun utilisateur créé. Vérifiez la configuration Supabase.");
      return;
    }

    if (accountType === "marie") {
      const { error: insertError } = await supabase.from("maries").insert({
        user_id: signUpData.user.id,
        prenom_marie1: mPrenom,
        date_mariage: mDate || null,
      });
      if (insertError) console.error("[inscription] Erreur insert maries:", insertError);
    } else if (accountType === "prestataire") {
      const insertRes = await fetch("/api/inscription/prestataire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: signUpData.user.id,
          nom_entreprise: pEntreprise,
          categorie: pMetier,
          ville: pVille,
          telephone: pTel,
        }),
      });
      if (!insertRes.ok) {
        const { error: insertError } = await insertRes.json();
        setLoading(false);
        setError(`Erreur création profil prestataire : ${insertError}`);
        return;
      }

      fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_prestataire",
          entreprise: pEntreprise,
          categorie: pMetier,
          ville: pVille,
          email: pEmail,
          userId: signUpData.user.id,
        }),
      }).catch(() => {});
    }

    setLoading(false);
    setSuccessEmail(email);
  };

  const EyeIcon = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {show ? (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  // Success screen
  if (successEmail) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
      >
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="InstantMariage logo" width={44} height={44} />
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
                InstantMariage.fr
              </span>
            </Link>
          </div>

          <div
            className="rounded-3xl px-8 py-10"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <div className="mb-5 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Vérifiez votre boîte email !
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-2">
              Un email de confirmation a été envoyé à
            </p>
            <p className="font-semibold text-white mb-5 break-all">{successEmail}</p>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Cliquez sur le lien dans cet email pour activer votre compte.
            </p>
            <div className="bg-white/20 rounded-xl px-4 py-3 text-left">
              <p className="text-white/90 text-xs leading-relaxed">
                <span className="font-semibold">Vous ne voyez pas l&apos;email ?</span> Pensez à vérifier votre dossier{" "}
                <span className="font-semibold">Spams</span> ou <span className="font-semibold">Courriers indésirables</span>.
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/80">
            Déjà activé ?{" "}
            <Link href="/login" className="font-semibold text-white underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — Desktop only: wedding photo + rose overlay */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-shrink-0">
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }} />
        )}
        {/* Rose overlay gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(240,98,146,0.72) 0%, rgba(233,30,140,0.82) 100%)" }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="InstantMariage logo" width={44} height={44} className="brightness-0 invert" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              InstantMariage.fr
            </span>
          </Link>
          <div className="text-white">
            <p className="text-4xl font-bold leading-snug mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Le mariage de vos rêves commence ici
            </p>
            <ul className="space-y-4">
              {[
                "Accès gratuit à tous les outils mariés",
                "Contactez les meilleurs prestataires",
                "Gérez votre mariage en un seul endroit",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/90">
                  <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-white/70 text-sm">Rejoignez 12&nbsp;000+ couples et prestataires</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div
        className="w-full lg:w-7/12 flex flex-col overflow-y-auto bg-white"
      >
        <div className="flex flex-col min-h-full px-6 py-10 sm:px-10 lg:px-14">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="InstantMariage logo" width={44} height={44} />
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair), serif" }}>
                InstantMariage.fr
              </span>
            </Link>
          </div>

          {/* Header text */}
          {!accountType && (
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Rejoignez InstantMariage
              </h1>
              <p className="text-gray-500 text-lg font-light">
                Gratuit · Sans engagement · 12&nbsp;000+ membres
              </p>
            </div>
          )}

          {accountType && (
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAccountType(null)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              <span className="text-gray-300">·</span>
              <span className="text-gray-900 font-semibold text-sm">
                {accountType === "marie" ? "Je suis marié(e)" : "Je suis prestataire"}
              </span>
            </div>
          )}

          <div className="max-w-lg w-full mx-auto flex-1">

            {/* Step 1 — Type selection */}
            {!accountType && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Card Marié */}
                <button
                  type="button"
                  onClick={() => setAccountType("marie")}
                  className="group relative flex flex-col items-center gap-4 rounded-3xl px-5 py-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white text-base leading-tight mb-1">Je suis<br />marié(e)</p>
                    <p className="text-white/65 text-xs font-light">Outils &amp; prestataires</p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Card Prestataire */}
                <button
                  type="button"
                  onClick={() => setAccountType("prestataire")}
                  className="group relative flex flex-col items-center gap-4 rounded-3xl px-5 py-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white text-base leading-tight mb-1">Je suis<br />prestataire</p>
                    <p className="text-white/65 text-xs font-light">Profil &amp; visibilité</p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2 — Form */}
            {accountType && (
              <div
                className="rounded-3xl px-6 py-7 sm:px-8 sm:py-8"
                style={{
                  background: "white",
                  border: "1px solid #fce7f3",
                  boxShadow: "0 4px 32px rgba(233,30,140,0.07)",
                }}
              >
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center gap-3 bg-white rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-white/90 transition-all duration-200 shadow-sm mb-5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuer avec Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">ou par email</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Mariés form */}
                {accountType === "marie" && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Prénom</label>
                        <input
                          type="text"
                          value={mPrenom}
                          onChange={(e) => setMPrenom(e.target.value)}
                          placeholder="Sophie"
                          required
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nom</label>
                        <input
                          type="text"
                          value={mNom}
                          onChange={(e) => setMNom(e.target.value)}
                          placeholder="Martin"
                          required
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Adresse email</label>
                      <input
                        type="email"
                        value={mEmail}
                        onChange={(e) => setMEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        required
                        className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={mShowPwd ? "text" : "password"}
                          value={mPassword}
                          onChange={(e) => setMPassword(e.target.value)}
                          placeholder="Minimum 8 caractères"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="w-full bg-white rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                        />
                        <EyeIcon show={mShowPwd} onClick={() => setMShowPwd(!mShowPwd)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirmer le mot de passe</label>
                      <div className="relative">
                        <input
                          type={mShowConfirmPwd ? "text" : "password"}
                          value={mConfirmPassword}
                          onChange={(e) => setMConfirmPassword(e.target.value)}
                          placeholder="Répétez votre mot de passe"
                          required
                          autoComplete="new-password"
                          className={`w-full bg-white rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            !mPasswordsMatch ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-pink-300"
                          }`}
                        />
                        <EyeIcon show={mShowConfirmPwd} onClick={() => setMShowConfirmPwd(!mShowConfirmPwd)} />
                      </div>
                      {!mPasswordsMatch && (
                        <p className="mt-1.5 text-xs text-red-500 font-medium">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        Date du mariage <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
                      </label>
                      <input
                        type="date"
                        value={mDate}
                        onChange={(e) => setMDate(e.target.value)}
                        className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>
                    <CguAndSubmit cgu={cgu} setCgu={setCgu} label="Créer mon compte" loading={loading} extraDisabled={!mPasswordsMatch || mConfirmPassword === ""} />
                  </form>
                )}

                {/* Prestataire form */}
                {accountType === "prestataire" && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nom de l&apos;entreprise</label>
                      <input
                        type="text"
                        value={pEntreprise}
                        onChange={(e) => setPEntreprise(e.target.value)}
                        placeholder="Studio Photo Lumière"
                        required
                        className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Métier</label>
                        <select
                          value={pMetier}
                          onChange={(e) => setPMetier(e.target.value)}
                          required
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all appearance-none"
                        >
                          <option value="">Choisir…</option>
                          {metiers.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Ville</label>
                        <input
                          type="text"
                          value={pVille}
                          onChange={(e) => setPVille(e.target.value)}
                          placeholder="Paris"
                          required
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email professionnel</label>
                      <input
                        type="email"
                        value={pEmail}
                        onChange={(e) => setPEmail(e.target.value)}
                        placeholder="contact@monentreprise.fr"
                        required
                        className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Mot de passe</label>
                        <div className="relative">
                          <input
                            type={pShowPwd ? "text" : "password"}
                            value={pPassword}
                            onChange={(e) => setPPassword(e.target.value)}
                            placeholder="Min. 8 caractères"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="w-full bg-white rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                          />
                          <EyeIcon show={pShowPwd} onClick={() => setPShowPwd(!pShowPwd)} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Téléphone</label>
                        <input
                          type="tel"
                          value={pTel}
                          onChange={(e) => setPTel(e.target.value)}
                          placeholder="06 12 34 56 78"
                          required
                          className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirmer le mot de passe</label>
                      <div className="relative">
                        <input
                          type={pShowConfirmPwd ? "text" : "password"}
                          value={pConfirmPassword}
                          onChange={(e) => setPConfirmPassword(e.target.value)}
                          placeholder="Répétez votre mot de passe"
                          required
                          autoComplete="new-password"
                          className={`w-full bg-white rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                            !pPasswordsMatch ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-pink-300"
                          }`}
                        />
                        <EyeIcon show={pShowConfirmPwd} onClick={() => setPShowConfirmPwd(!pShowConfirmPwd)} />
                      </div>
                      {!pPasswordsMatch && (
                        <p className="mt-1.5 text-xs text-red-500 font-medium">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>
                    <CguAndSubmit cgu={cgu} setCgu={setCgu} label="Créer mon profil prestataire" loading={loading} extraDisabled={!pPasswordsMatch || pConfirmPassword === ""} />
                  </form>
                )}
              </div>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-semibold text-pink-600 underline underline-offset-2 hover:text-pink-700 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CguAndSubmit({
  cgu,
  setCgu,
  label,
  loading,
  extraDisabled,
}: {
  cgu: boolean;
  setCgu: (v: boolean) => void;
  label: string;
  loading?: boolean;
  extraDisabled?: boolean;
}) {
  return (
    <>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={cgu}
            onChange={(e) => setCgu(e.target.checked)}
            required
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              cgu ? "border-pink-500 bg-pink-500" : "border-gray-300 bg-white group-hover:border-pink-400"
            }`}
          >
            {cgu && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 leading-relaxed">
          J&apos;accepte les{" "}
          <Link href="/cgu" className="font-medium text-pink-600 underline underline-offset-1 hover:text-pink-700">
            Conditions Générales d&apos;Utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="font-medium text-pink-600 underline underline-offset-1 hover:text-pink-700">
            Politique de confidentialité
          </Link>{" "}
          d&apos;InstantMariage.fr
        </span>
      </label>

      <button
        type="submit"
        disabled={!cgu || loading || extraDisabled}
        className="w-full font-bold py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)", color: "white" }}
      >
        {loading ? "Création du compte…" : label}
      </button>
    </>
  );
}
