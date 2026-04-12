"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path strokeLinecap="round" d="M8 11V7a4 4 0 018 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Alert({ type, title, message }: { type: "success" | "error"; title: string; message?: string }) {
  const isSuccess = type === "success";
  return (
    <div
      className="flex items-start gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: isSuccess ? "#D1FAE5" : "#FEE2E2",
        border: `1px solid ${isSuccess ? "#6EE7B7" : "#FCA5A5"}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: isSuccess ? "#059669" : "#EF4444", color: "white" }}
      >
        {isSuccess ? <IconCheck /> : <span className="font-bold text-sm">!</span>}
      </div>
      <div>
        <p className={`text-sm font-semibold ${isSuccess ? "text-emerald-800" : "text-red-800"}`}>{title}</p>
        {message && <p className={`text-xs mt-0.5 ${isSuccess ? "text-emerald-700" : "text-red-700"}`}>{message}</p>}
      </div>
    </div>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #FEE2E2" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#FFF0F5", color: "#F06292" }}
        >
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  hint,
  showToggle,
  onToggle,
  showPassword,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
  disabled?: boolean;
}) {
  const inputType = showToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#FFF5F8",
            border: "1.5px solid #FECDD3",
            paddingRight: showToggle ? "2.75rem" : undefined,
          }}
          onFocus={(e) => { if (!disabled) e.currentTarget.style.borderColor = "#F06292"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#FECDD3"; }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParametresCompte() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"marie" | "prestataire" | null>(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  // Mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordResult, setPasswordResult] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);

  // Suppression
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? "");
      setNewEmail(session.user.email ?? "");
      const role = session.user.user_metadata?.role ?? null;
      setUserRole(role);

      // Vérifier si l'utilisateur a un provider OAuth (pas de mot de passe)
      const identities = session.user.identities ?? [];
      const hasEmailProvider = identities.some((id) => id.provider === "email");
      setIsOAuthUser(!hasEmailProvider);

      setAuthChecked(true);
    });
  }, [router]);

  // ── Changer l'email ─────────────────────────────────────────────────────────

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailResult(null);

    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail || trimmedEmail === userEmail) {
      setEmailResult({ type: "error", title: "Veuillez saisir une nouvelle adresse email." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailResult({ type: "error", title: "Adresse email invalide." });
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: trimmedEmail });
      if (error) throw error;

      setEmailResult({
        type: "success",
        title: "Email de confirmation envoyé",
        message: `Un lien de confirmation a été envoyé à ${trimmedEmail}. Cliquez dessus pour valider votre nouvelle adresse.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setEmailResult({ type: "error", title: "Erreur lors de la mise à jour", message: msg });
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Changer le mot de passe ─────────────────────────────────────────────────

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordResult(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordResult({ type: "error", title: "Veuillez remplir tous les champs." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordResult({ type: "error", title: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordResult({ type: "error", title: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordResult({ type: "error", title: "Le nouveau mot de passe doit être différent de l'ancien." });
      return;
    }

    setPasswordLoading(true);
    try {
      // Vérifier l'ancien mot de passe en se reconnectant
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: oldPassword,
      });
      if (signInErr) {
        setPasswordResult({ type: "error", title: "Ancien mot de passe incorrect." });
        return;
      }

      // Mettre à jour le mot de passe
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;

      setPasswordResult({
        type: "success",
        title: "Mot de passe mis à jour",
        message: "Votre mot de passe a été modifié avec succès.",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setPasswordResult({ type: "error", title: "Erreur lors de la mise à jour", message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Supprimer le compte ─────────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") return;
    setDeleteResult(null);
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Erreur serveur");

      await supabase.auth.signOut();
      router.replace("/?compte=supprime");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setDeleteResult({ type: "error", title: "Erreur lors de la suppression", message: msg });
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const dashboardHref = userRole === "prestataire" ? "/dashboard/prestataire" : "/dashboard/marie";

  if (!authChecked) return null;

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">

        {/* ── Hero ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-10 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-75"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <IconArrowLeft />
            Retour au dashboard
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <span style={{ color: "white" }}><IconSettings /></span>
            </div>
            <div>
              <p className="text-sm font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
                Mon compte
              </p>
              <h1 className="text-2xl font-semibold text-white leading-tight">
                Paramètres du compte
              </h1>
            </div>
          </div>
          <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.75)" }}>
            Gérez votre adresse email, mot de passe et les données de votre compte.
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-6 pt-4 space-y-4">

          {/* ── Email ── */}
          <SectionCard icon={<IconMail />} title="Adresse email">
            <form onSubmit={handleEmailChange} className="space-y-4">
              {emailResult && (
                <Alert type={emailResult.type} title={emailResult.title} message={emailResult.message} />
              )}
              <InputField
                label="Adresse email actuelle"
                type="email"
                value={userEmail}
                onChange={() => {}}
                disabled
                hint="Votre adresse actuelle (en lecture seule)"
              />
              <InputField
                label="Nouvelle adresse email"
                type="email"
                value={newEmail}
                onChange={(v) => { setNewEmail(v); setEmailResult(null); }}
                placeholder="nouvelle@email.fr"
                hint="Un email de confirmation vous sera envoyé pour valider le changement."
              />
              <button
                type="submit"
                disabled={emailLoading || newEmail.trim() === userEmail}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: (emailLoading || newEmail.trim() === userEmail)
                    ? "#F8A4C0"
                    : "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
                  boxShadow: (emailLoading || newEmail.trim() === userEmail) ? "none" : "0 4px 20px rgba(240,98,146,0.4)",
                  cursor: (emailLoading || newEmail.trim() === userEmail) ? "not-allowed" : "pointer",
                }}
              >
                {emailLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  "Modifier l'email"
                )}
              </button>
            </form>
          </SectionCard>

          {/* ── Mot de passe ── */}
          <SectionCard icon={<IconLock />} title="Mot de passe">
            {isOAuthUser ? (
              <div className="py-2">
                <p className="text-sm text-gray-500">
                  Vous êtes connecté via Google. La gestion du mot de passe s&apos;effectue depuis votre compte Google.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordResult && (
                  <Alert type={passwordResult.type} title={passwordResult.title} message={passwordResult.message} />
                )}
                <InputField
                  label="Mot de passe actuel"
                  type="password"
                  value={oldPassword}
                  onChange={(v) => { setOldPassword(v); setPasswordResult(null); }}
                  placeholder="••••••••"
                  showToggle
                  onToggle={() => setShowOld(!showOld)}
                  showPassword={showOld}
                />
                <InputField
                  label="Nouveau mot de passe"
                  type="password"
                  value={newPassword}
                  onChange={(v) => { setNewPassword(v); setPasswordResult(null); }}
                  placeholder="••••••••"
                  showToggle
                  onToggle={() => setShowNew(!showNew)}
                  showPassword={showNew}
                  hint="Au moins 8 caractères."
                />
                <InputField
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  value={confirmPassword}
                  onChange={(v) => { setConfirmPassword(v); setPasswordResult(null); }}
                  placeholder="••••••••"
                  showToggle
                  onToggle={() => setShowConfirm(!showConfirm)}
                  showPassword={showConfirm}
                />

                {/* Indicateur de force */}
                {newPassword.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = Math.min(
                          4,
                          [newPassword.length >= 8, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^a-zA-Z0-9]/.test(newPassword)].filter(Boolean).length
                        );
                        const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E"];
                        return (
                          <div
                            key={level}
                            className="flex-1 h-1.5 rounded-full transition-all duration-300"
                            style={{ background: level <= strength ? colors[strength - 1] : "#E5E7EB" }}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400">
                      {(() => {
                        const strength = [newPassword.length >= 8, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword), /[^a-zA-Z0-9]/.test(newPassword)].filter(Boolean).length;
                        return ["Très faible", "Faible", "Moyen", "Fort"][strength - 1] ?? "Trop court";
                      })()}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: passwordLoading ? "#F8A4C0" : "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
                    boxShadow: passwordLoading ? "none" : "0 4px 20px rgba(240,98,146,0.4)",
                    cursor: passwordLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mise à jour…
                    </>
                  ) : (
                    "Modifier le mot de passe"
                  )}
                </button>
              </form>
            )}
          </SectionCard>

          {/* ── Zone danger ── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 4px 24px rgba(239,68,68,0.08)", border: "1px solid #FCA5A5" }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid #FEE2E2" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FEF2F2", color: "#EF4444" }}
              >
                <IconTrash />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Zone de danger</h2>
                <p className="text-xs text-gray-400 mt-0.5">Actions irréversibles</p>
              </div>
            </div>

            <div className="px-5 py-4">
              {deleteResult && (
                <div className="mb-4">
                  <Alert type={deleteResult.type} title={deleteResult.title} message={deleteResult.message} />
                </div>
              )}
              <div
                className="p-4 rounded-2xl"
                style={{ background: "#FFF5F5", border: "1px solid #FECACA" }}
              >
                <p className="text-sm font-semibold text-gray-800 mb-1">Supprimer mon compte</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Cette action est <strong>irréversible</strong>. Toutes vos données (profil, messages, favoris) seront définitivement supprimées.
                </p>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirmText(""); setShowDeleteModal(true); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" }}
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal confirmation suppression ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}
          >
            {/* Header */}
            <div
              className="px-6 py-5"
              style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <span className="text-white"><IconTrash /></span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Supprimer le compte</h3>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>Cette action est irréversible</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Vous êtes sur le point de supprimer définitivement votre compte <strong>{userEmail}</strong> ainsi que toutes les données associées.
              </p>
              <div
                className="p-4 rounded-2xl text-sm text-gray-600 space-y-1"
                style={{ background: "#FFF5F5", border: "1px solid #FECACA" }}
              >
                <p className="font-semibold text-red-700 mb-2">Ce qui sera supprimé :</p>
                <p>• Votre profil et toutes vos informations</p>
                <p>• Vos messages et conversations</p>
                <p>• Vos favoris et données personnelles</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Tapez <strong className="text-red-600">SUPPRIMER</strong> pour confirmer
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 outline-none transition-all"
                  style={{
                    background: "#FFF5F5",
                    border: `1.5px solid ${deleteConfirmText === "SUPPRIMER" ? "#EF4444" : "#FECACA"}`,
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#EF4444"}
                  onBlur={(e) => e.currentTarget.style.borderColor = deleteConfirmText === "SUPPRIMER" ? "#EF4444" : "#FECACA"}
                />
              </div>
            </div>

            {/* Actions */}
            <div
              className="px-6 py-4 flex gap-3"
              style={{ borderTop: "1px solid #FEE2E2" }}
            >
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100"
                style={{ background: "#F3F4F6" }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "SUPPRIMER" || deleteLoading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: deleteConfirmText === "SUPPRIMER" && !deleteLoading
                    ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
                    : "#FCA5A5",
                  cursor: deleteConfirmText !== "SUPPRIMER" || deleteLoading ? "not-allowed" : "pointer",
                }}
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Suppression…
                  </>
                ) : (
                  "Supprimer définitivement"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
