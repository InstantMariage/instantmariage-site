"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconLocation = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconRing = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="6" />
    <path strokeLinecap="round" d="M12 6v-2M12 20v-2M6 12H4M20 12h-2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileForm = {
  prenom_marie1: string;
  prenom_marie2: string;
  nom: string;
  email: string;
  date_mariage: string;
  lieu_mariage: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilMarie() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    prenom_marie1: "",
    prenom_marie2: "",
    nom: "",
    email: "",
    date_mariage: "",
    lieu_mariage: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const uid = session.user.id;
      setUserId(uid);
      setCurrentEmail(session.user.email ?? "");

      const { data: marie } = await supabase
        .from("maries")
        .select("prenom_marie1, prenom_marie2, date_mariage, lieu_mariage")
        .eq("user_id", uid)
        .single();

      const meta = session.user.user_metadata;

      setForm({
        prenom_marie1: marie?.prenom_marie1 ?? meta?.prenom ?? "",
        prenom_marie2: marie?.prenom_marie2 ?? meta?.prenom_marie2 ?? "",
        nom: meta?.nom ?? "",
        email: session.user.email ?? "",
        date_mariage: marie?.date_mariage ?? meta?.date_mariage ?? "",
        lieu_mariage: marie?.lieu_mariage ?? "",
      });

      setAuthChecked(true);
    });
  }, [router]);

  const handleChange = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSaved(false);
    setError(null);
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      // 1. Mettre à jour le profil mariés
      const { error: marieErr } = await supabase
        .from("maries")
        .update({
          prenom_marie1: form.prenom_marie1.trim(),
          prenom_marie2: form.prenom_marie2.trim() || null,
          date_mariage: form.date_mariage || null,
          lieu_mariage: form.lieu_mariage.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (marieErr) throw new Error(marieErr.message);

      // 2. Mettre à jour l'email et les métadonnées auth si modifiés
      const updates: { email?: string; data?: Record<string, string> } = {
        data: { nom: form.nom.trim() },
      };
      if (form.email.trim() !== currentEmail) {
        updates.email = form.email.trim();
      }

      const { error: authErr } = await supabase.auth.updateUser(updates);
      if (authErr) throw new Error(authErr.message);

      if (form.email.trim() !== currentEmail) {
        setCurrentEmail(form.email.trim());
      }

      setSaved(true);
      // Masquer la confirmation après 4 secondes
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) return null;

  return (
    <main className="min-h-screen overflow-x-hidden max-w-full" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">

        {/* ── Hero ── */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-10 mb-2 rounded-b-3xl"
          style={{
            background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
          }}
        >
          <Link
            href="/dashboard/marie"
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
              <span style={{ color: "white" }}><IconUser /></span>
            </div>
            <div>
              <p className="text-sm font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.12em" }}>
                Mes informations
              </p>
              <h1 className="text-2xl font-semibold text-white leading-tight">
                Mon profil
              </h1>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 pt-4 space-y-4">

          {/* ── Confirmation ── */}
          {saved && (
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl animate-fade-in"
              style={{
                background: "#D1FAE5",
                border: "1px solid #6EE7B7",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#059669", color: "white" }}
              >
                <IconCheck />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Modifications enregistrées</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {form.email !== currentEmail
                    ? "Vos informations ont été mises à jour. Un email de confirmation a été envoyé pour valider votre nouvelle adresse."
                    : "Vos informations ont été mises à jour avec succès."}
                </p>
              </div>
            </div>
          )}

          {/* ── Erreur ── */}
          {error && (
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                style={{ background: "#EF4444", color: "white" }}
              >
                !
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Identité ── */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              {/* Section header */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "1px solid #FEE2E2" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FFF0F5", color: "#F06292" }}
                >
                  <IconUser />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Identité</h2>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Prénom (partenaire 1)
                    </label>
                    <input
                      type="text"
                      value={form.prenom_marie1}
                      onChange={handleChange("prenom_marie1")}
                      required
                      placeholder="Prénom"
                      className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none"
                      style={{
                        background: "#FFF5F8",
                        border: "1.5px solid #FECDD3",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#F06292")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#FECDD3")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Prénom (partenaire 2)
                    </label>
                    <input
                      type="text"
                      value={form.prenom_marie2}
                      onChange={handleChange("prenom_marie2")}
                      placeholder="Prénom (optionnel)"
                      className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none"
                      style={{
                        background: "#FFF5F8",
                        border: "1.5px solid #FECDD3",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#F06292")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#FECDD3")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={handleChange("nom")}
                    placeholder="Nom de famille"
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none"
                    style={{
                      background: "#FFF5F8",
                      border: "1.5px solid #FECDD3",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#F06292")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#FECDD3")}
                  />
                </div>
              </div>
            </div>

            {/* ── Email ── */}
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
                  <IconMail />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Adresse email</h2>
              </div>

              <div className="px-5 py-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email de connexion
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                  placeholder="votre@email.fr"
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none"
                  style={{
                    background: "#FFF5F8",
                    border: "1.5px solid #FECDD3",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#F06292")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#FECDD3")}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Un email de confirmation sera envoyé si vous modifiez cette adresse.
                </p>
              </div>
            </div>

            {/* ── Mariage ── */}
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
                  <IconRing />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Votre mariage</h2>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Date du mariage
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#F06292" }}
                    >
                      <IconCalendar />
                    </div>
                    <input
                      type="date"
                      value={form.date_mariage}
                      onChange={handleChange("date_mariage")}
                      className="w-full pl-12 pr-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none"
                      style={{
                        background: "#FFF5F8",
                        border: "1.5px solid #FECDD3",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#F06292")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#FECDD3")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Lieu du mariage
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#F06292" }}
                    >
                      <IconLocation />
                    </div>
                    <input
                      type="text"
                      value={form.lieu_mariage}
                      onChange={handleChange("lieu_mariage")}
                      placeholder="Ville, salle, château…"
                      className="w-full pl-12 pr-4 py-3 rounded-xl text-sm text-gray-800 transition-all outline-none"
                      style={{
                        background: "#FFF5F8",
                        border: "1.5px solid #FECDD3",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#F06292")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#FECDD3")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bouton enregistrer ── */}
            <div className="pt-1 pb-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: loading ? "#F8A4C0" : "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(240,98,146,0.4)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement…
                  </>
                ) : saved ? (
                  <>
                    <IconCheck />
                    Enregistré !
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
