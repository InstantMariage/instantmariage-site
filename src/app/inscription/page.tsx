"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const WEDDING_IMG = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80";

type AccountType = "marie" | "prestataire" | null;

const metiers = [
  "Photographe",
  "Vidéaste",
  "DJ & Musicien",
  "Traiteur",
  "Fleuriste",
  "Décorateur",
  "Coiffure & Makeup",
  "Lieu de réception",
  "Officiant",
  "Wedding Planner",
  "Animation enfants",
  "Transport",
  "Autre",
];

export default function InscriptionPage() {
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [cgu, setCgu] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Mariés form
  const [mPrenom, setMPrenom] = useState("");
  const [mNom, setMNom] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPassword, setMPassword] = useState("");
  const [mDate, setMDate] = useState("");
  const [mShowPwd, setMShowPwd] = useState(false);

  // Prestataire form
  const [pEntreprise, setPEntreprise] = useState("");
  const [pMetier, setPMetier] = useState("");
  const [pVille, setPVille] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [pTel, setPTel] = useState("");
  const [pShowPwd, setPShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic here
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

  return (
    <div className="min-h-screen flex">
      {/* Left — Photo */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/50 via-rose-700/25 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div style={{ mixBlendMode: "multiply" }}>
              <Image src="/logo.png" alt="InstantMariage logo" width={44} height={44} />
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>
              <span className="text-white">Instant</span>
              <span className="text-white/90">Mariage.fr</span>
            </span>
          </Link>
          <div className="text-white">
            <p className="text-4xl font-bold leading-snug mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Rejoignez 12 000+ couples et prestataires
            </p>
            <ul className="space-y-3 text-white/80 text-base">
              {[
                "Accès gratuit à tous les outils mariés",
                "Contactez les meilleurs prestataires",
                "Gérez votre mariage en un seul endroit",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F06292" }}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-start px-6 py-10 sm:px-12 lg:px-16 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div style={{ mixBlendMode: "multiply" }}>
              <Image src="/logo.png" alt="InstantMariage logo" width={36} height={36} />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>
              <span style={{ color: "#F06292" }}>Instant</span>
              <span className="text-gray-900">Mariage.fr</span>
            </span>
          </Link>
        </div>

        <div className="max-w-lg w-full mx-auto">
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Créer un compte
            </h1>
            <p className="text-gray-500 text-sm">Gratuit et sans engagement</p>
          </div>

          {/* Step 1 — Account type */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Je suis…</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("marie")}
                className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  accountType === "marie"
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50/50"
                }`}
              >
                {accountType === "marie" && (
                  <span
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#F06292" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className="text-3xl">💍</span>
                <div className="text-center">
                  <p className="font-semibold text-current">Je suis un(e) marié(e)</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-normal">Outils & prestataires</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("prestataire")}
                className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  accountType === "prestataire"
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:bg-rose-50/50"
                }`}
              >
                {accountType === "prestataire" && (
                  <span
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#F06292" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className="text-3xl">🏢</span>
                <div className="text-center">
                  <p className="font-semibold text-current">Je suis un prestataire</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-normal">Profil & visibilité</p>
                </div>
              </button>
            </div>
          </div>

          {/* Social buttons */}
          {accountType && (
            <>
              <div className="space-y-3 mb-5">
                <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  S&apos;inscrire avec Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1664D6] rounded-xl py-3 px-4 text-sm font-medium text-white transition-all duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  S&apos;inscrire avec Facebook
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ou par email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Mariés form */}
              {accountType === "marie" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                      <input
                        type="text"
                        value={mPrenom}
                        onChange={(e) => setMPrenom(e.target.value)}
                        placeholder="Sophie"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                      <input
                        type="text"
                        value={mNom}
                        onChange={(e) => setMNom(e.target.value)}
                        placeholder="Martin"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                    <input
                      type="email"
                      value={mEmail}
                      onChange={(e) => setMEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={mShowPwd ? "text" : "password"}
                        value={mPassword}
                        onChange={(e) => setMPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        required
                        minLength={8}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                      />
                      <EyeIcon show={mShowPwd} onClick={() => setMShowPwd(!mShowPwd)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date du mariage
                      <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
                    </label>
                    <input
                      type="date"
                      value={mDate}
                      onChange={(e) => setMDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    />
                  </div>

                  <CguAndSubmit cgu={cgu} setCgu={setCgu} label="Créer mon compte" />
                </form>
              )}

              {/* Prestataire form */}
              {accountType === "prestataire" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise</label>
                    <input
                      type="text"
                      value={pEntreprise}
                      onChange={(e) => setPEntreprise(e.target.value)}
                      placeholder="Studio Photo Lumière"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Métier</label>
                      <select
                        value={pMetier}
                        onChange={(e) => setPMetier(e.target.value)}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all bg-white appearance-none"
                      >
                        <option value="">Choisir…</option>
                        {metiers.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                      <input
                        type="text"
                        value={pVille}
                        onChange={(e) => setPVille(e.target.value)}
                        placeholder="Paris"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email professionnelle</label>
                    <input
                      type="email"
                      value={pEmail}
                      onChange={(e) => setPEmail(e.target.value)}
                      placeholder="contact@monentreprise.fr"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={pShowPwd ? "text" : "password"}
                          value={pPassword}
                          onChange={(e) => setPPassword(e.target.value)}
                          placeholder="Min. 8 caractères"
                          required
                          minLength={8}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                        />
                        <EyeIcon show={pShowPwd} onClick={() => setPShowPwd(!pShowPwd)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        value={pTel}
                        onChange={(e) => setPTel(e.target.value)}
                        placeholder="06 12 34 56 78"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <CguAndSubmit cgu={cgu} setCgu={setCgu} label="Créer mon profil prestataire" />
                </form>
              )}
            </>
          )}

          <p className="mt-5 text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold hover:underline transition-colors" style={{ color: "#F06292" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function CguAndSubmit({
  cgu,
  setCgu,
  label,
}: {
  cgu: boolean;
  setCgu: (v: boolean) => void;
  label: string;
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
              cgu ? "border-rose-400 bg-rose-400" : "border-gray-300 bg-white group-hover:border-rose-300"
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
          <Link href="/cgu" className="font-medium hover:underline" style={{ color: "#F06292" }}>
            Conditions Générales d&apos;Utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="font-medium hover:underline" style={{ color: "#F06292" }}>
            Politique de confidentialité
          </Link>{" "}
          d&apos;InstantMariage.fr
        </span>
      </label>

      <button
        type="submit"
        disabled={!cgu}
        className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
      >
        {label}
      </button>
    </>
  );
}
