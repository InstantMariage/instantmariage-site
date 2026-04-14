"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import type { PlanAbonnement } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHOTO_LIMITS: Record<PlanAbonnement, number> = {
  gratuit: 3,
  starter: 10,
  pro: 30,
  premium: 50,
};

const CATEGORIES = [
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
  "Voiture de mariage",
  "Animation",
  "Créateur de contenu",
  "Papeterie & Personnalisation",
  "Pâtissier / Wedding cake",
  "Autre",
];

const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Guadeloupe",
  "Guyane",
  "Hauts-de-France",
  "Île-de-France",
  "La Réunion",
  "Martinique",
  "Mayotte",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfilForm = {
  // Infos générales
  nom_entreprise: string;
  categorie: string;
  description: string;
  slogan: string;
  // Coordonnées
  telephone: string;
  email_contact: string;
  site_web: string;
  adresse: string;
  ville: string;
  departement: string;
  region: string;
  // Réseaux sociaux
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  // Infos légales
  siret: string;
  numero_tva: string;
  // Tarifs
  prix_depart: string;
  tarifs_description: string;
  // Avatar
  avatar_url: string;
  // Couverture
  cover_url: string;
  cover_position: number;
};

// ─── Calendar Component ───────────────────────────────────────────────────────

function CalendarDisponibilites({
  reservedDates,
  onChange,
}: {
  reservedDates: string[];
  onChange: (dates: string[]) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const MOIS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  // Monday-based: 0=Mon, 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = startOffset + lastDay.getDate();
  const cells = Math.ceil(totalCells / 7) * 7;

  function fmt(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function toggleDate(dateStr: string) {
    if (reservedDates.includes(dateStr)) {
      onChange(reservedDates.filter((d) => d !== dateStr));
    } else {
      onChange([...reservedDates, dateStr]);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const isPast = (y: number, m: number, d: number) => {
    const date = new Date(y, m, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-gray-800 text-sm">
          {MOIS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Jours header */}
      <div className="grid grid-cols-7 mb-1">
        {JOURS.map((j) => (
          <div key={j} className="text-center text-xs font-semibold text-gray-400 py-1">
            {j}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: cells }).map((_, i) => {
          const dayNum = i - startOffset + 1;
          const isValid = dayNum >= 1 && dayNum <= lastDay.getDate();
          const dateStr = isValid ? fmt(viewYear, viewMonth, dayNum) : "";
          const isReserved = isValid && reservedDates.includes(dateStr);
          const past = isValid && isPast(viewYear, viewMonth, dayNum);
          const isToday = isValid && dateStr === fmt(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={i}
              type="button"
              disabled={!isValid || past}
              onClick={() => isValid && !past && toggleDate(dateStr)}
              className={`
                aspect-square rounded-lg text-xs font-medium transition-all duration-150
                ${!isValid ? "invisible" : ""}
                ${past ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                ${isReserved ? "text-white" : ""}
                ${!isReserved && !past && isValid ? "hover:bg-rose-50" : ""}
                ${isToday && !isReserved ? "ring-2 ring-rose-300" : ""}
              `}
              style={
                isReserved
                  ? { background: "linear-gradient(135deg, #F06292, #E91E8C)" }
                  : {}
              }
            >
              {isValid ? dayNum : ""}
            </button>
          );
        })}
      </div>

      {reservedDates.length > 0 && (
        <div className="mt-4 flex items-start gap-2">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0 mt-0.5"
            style={{ background: "#F06292" }}
          />
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{reservedDates.length} date{reservedDates.length > 1 ? "s" : ""} réservée{reservedDates.length > 1 ? "s" : ""}</span>
            {" "}marquée{reservedDates.length > 1 ? "s" : ""}. Cliquez sur une date rose pour la libérer.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#FFF0F5" }}
        >
          <span style={{ color: "#F06292" }}>{icon}</span>
        </div>
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-gray-400">(facultatif)</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-200 bg-white";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilPrestatairePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [prestataireId, setPrestataireId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanAbonnement>("gratuit");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [photoSizeError, setPhotoSizeError] = useState<string | null>(null);
  const [avatarSizeError, setAvatarSizeError] = useState<string | null>(null);
  const [coverSizeError, setCoverSizeError] = useState<string | null>(null);

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [reservedDates, setReservedDates] = useState<string[]>([]);

  const [form, setForm] = useState<ProfilForm>({
    nom_entreprise: "",
    categorie: "",
    description: "",
    slogan: "",
    telephone: "",
    email_contact: "",
    site_web: "",
    adresse: "",
    ville: "",
    departement: "",
    region: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    siret: "",
    numero_tva: "",
    prix_depart: "",
    tarifs_description: "",
    avatar_url: "",
    cover_url: "",
    cover_position: 50,
  });

  // ── Auth + load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: p } = await supabase
        .from("prestataires")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (p) {
        setPrestataireId(p.id);
        setPhotos(Array.isArray(p.photos) ? p.photos : []);
        setReservedDates(Array.isArray(p.dates_reservees) ? p.dates_reservees : []);
        setForm({
          nom_entreprise: p.nom_entreprise || "",
          categorie: p.categorie || "",
          description: p.description || "",
          slogan: p.slogan || "",
          telephone: p.telephone || "",
          email_contact: p.email_contact || session.user.email || "",
          site_web: p.site_web || "",
          adresse: p.adresse || "",
          ville: p.ville || "",
          departement: p.departement || "",
          region: p.region || "",
          instagram: p.instagram || "",
          facebook: p.facebook || "",
          tiktok: p.tiktok || "",
          youtube: p.youtube || "",
          siret: p.siret || "",
          numero_tva: p.numero_tva || "",
          prix_depart: p.prix_depart != null ? String(p.prix_depart) : "",
          tarifs_description: p.tarifs_description || "",
          avatar_url: p.avatar_url || "",
          cover_url: p.cover_url || "",
          cover_position: p.cover_position ?? 50,
        });

        // Plan
        const { data: abo } = await supabase
          .from("abonnements")
          .select("plan, statut")
          .eq("prestataire_id", p.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (abo && abo.statut === "actif") {
          setPlan(abo.plan as PlanAbonnement);
        }
      } else {
        // Prestataire pas encore créé
        const meta = session.user.user_metadata;
        setForm((f) => ({
          ...f,
          nom_entreprise: meta?.nom_entreprise || "",
          categorie: meta?.categorie || "",
          email_contact: session.user.email || "",
        }));
      }

      setAuthChecked(true);
    });
  }, [router]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const setField = useCallback(
    <K extends keyof ProfilForm>(key: K, value: ProfilForm[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    []
  );

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoSizeError(null);

    const limit = PHOTO_LIMITS[plan];
    if (photos.length >= limit) {
      alert(`Votre plan ${plan.toUpperCase()} est limité à ${limit} photo${limit > 1 ? "s" : ""}. Supprimez des photos ou passez à un plan supérieur.`);
      return;
    }

    const remaining = limit - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);

    const oversized = toUpload.some((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setPhotoSizeError("Cette image est trop lourde. Taille maximale : 10 Mo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingPhoto(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUploadingPhoto(false);
      return;
    }

    const newUrls: string[] = [];
    let hasError = false;

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) continue;

      const ext = file.name.split(".").pop();
      const path = `prestataires/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("photos")
        .upload(path, file, { upsert: false });

      if (error) {
        console.error("Upload error:", error);
        hasError = true;
        continue;
      }

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
    }

    if (hasError && newUrls.length === 0) {
      alert("L'upload a échoué. Vérifiez votre connexion et réessayez.");
    }

    setPhotos((prev) => [...prev, ...newUrls]);
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarSizeError(null);

    if (file.size > 5 * 1024 * 1024) {
      setAvatarSizeError("Image trop lourde. Taille maximale : 5 Mo.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    setUploadingAvatar(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUploadingAvatar(false); return; }

    // Remove old avatar if any
    if (form.avatar_url) {
      const parts = form.avatar_url.split("/photos/");
      if (parts.length === 2) {
        await supabase.storage.from("photos").remove([parts[1]]);
      }
    }

    const ext = file.name.split(".").pop();
    const path = `prestataires/${session.user.id}/avatar-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Avatar upload error:", error);
      setAvatarSizeError("L'upload a échoué. Veuillez réessayer.");
    } else {
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      if (urlData?.publicUrl) {
        setField("avatar_url", urlData.publicUrl);
      }
    }

    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverSizeError(null);

    if (file.size > 10 * 1024 * 1024) {
      setCoverSizeError("Image trop lourde. Taille maximale : 10 Mo.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setUploadingCover(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUploadingCover(false); return; }

    // Remove old cover if any
    if (form.cover_url) {
      const parts = form.cover_url.split("/photos/");
      if (parts.length === 2) {
        await supabase.storage.from("photos").remove([parts[1]]);
      }
    }

    const ext = file.name.split(".").pop();
    const path = `prestataires/${session.user.id}/cover-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Cover upload error:", error);
      setCoverSizeError("L'upload a échoué. Veuillez réessayer.");
    } else {
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
      if (urlData?.publicUrl) {
        setField("cover_url", urlData.publicUrl);
      }
    }

    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  async function handleDeletePhoto(url: string) {
    // Extract path from URL
    const parts = url.split("/photos/");
    if (parts.length === 2) {
      await supabase.storage.from("photos").remove([parts[1]]);
    }
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  async function handleSave() {
    if (!form.nom_entreprise.trim()) {
      alert("Le nom de l'entreprise est requis.");
      return;
    }

    setSaving(true);
    setSaveStatus("idle");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const payload = {
      user_id: session.user.id,
      nom_entreprise: form.nom_entreprise.trim(),
      categorie: form.categorie,
      description: form.description,
      slogan: form.slogan,
      telephone: form.telephone,
      email_contact: form.email_contact,
      site_web: form.site_web,
      adresse: form.adresse,
      ville: form.ville,
      departement: form.departement,
      region: form.region,
      instagram: form.instagram,
      facebook: form.facebook,
      tiktok: form.tiktok,
      youtube: form.youtube,
      siret: form.siret,
      numero_tva: form.numero_tva,
      prix_depart: form.prix_depart !== "" ? parseInt(form.prix_depart, 10) : null,
      tarifs_description: form.tarifs_description,
      photos,
      avatar_url: form.avatar_url || null,
      cover_url: form.cover_url || null,
      cover_position: form.cover_position,
      dates_reservees: reservedDates,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (prestataireId) {
      const res = await supabase
        .from("prestataires")
        .update(payload)
        .eq("id", prestataireId);
      error = res.error;
    } else {
      const res = await supabase
        .from("prestataires")
        .insert(payload)
        .select("id")
        .single();
      error = res.error;
      if (!error && res.data) setPrestataireId(res.data.id);
    }

    setSaving(false);
    if (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#F06292", borderTopColor: "transparent" }}
        />
      </main>
    );
  }

  const photoLimit = PHOTO_LIMITS[plan];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-20">
        {/* Hero */}
        <div
          className="px-4 py-8"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)" }}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-100 text-xs mb-1">
                <Link href="/dashboard/prestataire" className="hover:text-white transition-colors">
                  Tableau de bord
                </Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white">Mon profil</span>
              </div>
              <h1 className="text-2xl font-bold text-white font-playfair">
                Mon profil prestataire
              </h1>
              <p className="text-rose-100 text-sm mt-0.5">
                Complétez votre profil pour être visible par les futurs mariés
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-rose-50 transition-all duration-200 shadow-sm self-start sm:self-auto disabled:opacity-70"
              style={{ color: "#E91E8C" }}
            >
              {saving ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#E91E8C", borderTopColor: "transparent" }}
                  />
                  Enregistrement…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toast */}
        {saveStatus !== "idle" && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-medium"
              style={{
                background:
                  saveStatus === "success"
                    ? "linear-gradient(135deg, #16a34a, #15803d)"
                    : "linear-gradient(135deg, #dc2626, #b91c1c)",
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {saveStatus === "success" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              {saveStatus === "success"
                ? "Profil enregistré avec succès !"
                : "Erreur lors de l'enregistrement. Veuillez réessayer."}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">

          {/* ── 1. Informations générales ─────────────────────────────────── */}
          <Section
            title="Informations générales"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          >
            {/* ── Avatar / Logo ── */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-3">Photo de profil / Logo</p>
              <div className="flex items-center gap-4">
                {/* Prévisualisation */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {form.avatar_url ? (
                    <Image src={form.avatar_url} alt="Avatar" fill className="object-cover" sizes="80px" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
                {/* Contrôles */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {form.avatar_url ? "Changer la photo" : "Ajouter une photo"}
                  </button>
                  {form.avatar_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        const parts = form.avatar_url.split("/photos/");
                        if (parts.length === 2) {
                          await supabase.storage.from("photos").remove([parts[1]]);
                        }
                        setField("avatar_url", "");
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors text-left"
                    >
                      Supprimer
                    </button>
                  )}
                  {avatarSizeError && (
                    <p className="text-xs text-red-500">{avatarSizeError}</p>
                  )}
                  <p className="text-xs text-gray-400">JPG, PNG, WebP — max 5 Mo</p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* ── Photo de couverture ── */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-3">Photo de couverture (bannière)</p>

              {/* Prévisualisation */}
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 mb-3">
                {form.cover_url && (
                  <Image
                    src={form.cover_url}
                    alt="Couverture"
                    fill
                    className="object-cover"
                    style={{ objectPosition: `center ${form.cover_position}%` }}
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </div>
                )}
                {!form.cover_url && !uploadingCover && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 text-rose-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Aucune photo de couverture</span>
                  </div>
                )}
              </div>

              {/* Contrôle de position verticale */}
              {form.cover_url && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-500">Position verticale</span>
                    <div className="flex gap-1">
                      {([["Haut", 0], ["Centre", 50], ["Bas", 100]] as [string, number][]).map(([label, val]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setField("cover_position", val)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            form.cover_position === val
                              ? "border-rose-400 bg-rose-50 text-rose-600 font-semibold"
                              : "border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-500"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.cover_position}
                    onChange={(e) => setField("cover_position", Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-rose-500"
                    style={{ background: `linear-gradient(to right, #F06292 ${form.cover_position}%, #e5e7eb ${form.cover_position}%)` }}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {form.cover_url ? "Changer la couverture" : "Ajouter une couverture"}
                </button>
                {form.cover_url && (
                  <button
                    type="button"
                    onClick={async () => {
                      const parts = form.cover_url.split("/photos/");
                      if (parts.length === 2) {
                        await supabase.storage.from("photos").remove([parts[1]]);
                      }
                      setField("cover_url", "");
                      setField("cover_position", 50);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
                <p className="text-xs text-gray-400">JPG, PNG, WebP — max 10 Mo — Format paysage recommandé</p>
              </div>
              {coverSizeError && (
                <p className="text-xs text-red-500 mt-2">{coverSizeError}</p>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nom de l'entreprise">
                  <input
                    type="text"
                    value={form.nom_entreprise}
                    onChange={(e) => setField("nom_entreprise", e.target.value)}
                    placeholder="Ex : Studio Lumière Photographe"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Catégorie / Métier">
                <select
                  value={form.categorie}
                  onChange={(e) => setField("categorie", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Choisir une catégorie…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Slogan" optional>
                <input
                  type="text"
                  value={form.slogan}
                  onChange={(e) => setField("slogan", e.target.value)}
                  placeholder="Ex : Des souvenirs inoubliables"
                  className={inputCls}
                  maxLength={120}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Décrivez votre activité, votre style, votre expérience…"
                    rows={5}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* ── 2. Coordonnées ────────────────────────────────────────────── */}
          <Section
            title="Coordonnées"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Téléphone" optional>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setField("telephone", e.target.value)}
                  placeholder="06 12 34 56 78"
                  className={inputCls}
                />
              </Field>

              <Field label="Email de contact" optional>
                <input
                  type="email"
                  value={form.email_contact}
                  onChange={(e) => setField("email_contact", e.target.value)}
                  placeholder="contact@monstudio.fr"
                  className={inputCls}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Site web" optional>
                  <input
                    type="url"
                    value={form.site_web}
                    onChange={(e) => setField("site_web", e.target.value)}
                    placeholder="https://monstudio.fr"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Adresse" optional>
                  <input
                    type="text"
                    value={form.adresse}
                    onChange={(e) => setField("adresse", e.target.value)}
                    placeholder="12 rue des Roses"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Ville" optional>
                <input
                  type="text"
                  value={form.ville}
                  onChange={(e) => setField("ville", e.target.value)}
                  placeholder="Paris"
                  className={inputCls}
                />
              </Field>

              <Field label="Département" optional>
                <input
                  type="text"
                  value={form.departement}
                  onChange={(e) => setField("departement", e.target.value)}
                  placeholder="75 – Paris"
                  className={inputCls}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Région" optional>
                  <select
                    value={form.region}
                    onChange={(e) => setField("region", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Choisir une région…</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          {/* ── 3. Galerie photos ─────────────────────────────────────────── */}
          <Section
            title="Galerie photos"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            {/* Quota */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{photos.length}</span> / {photoLimit} photo{photoLimit > 1 ? "s" : ""}
                {" "}(plan <span className="font-semibold uppercase">{plan}</span>)
              </p>
              {photos.length > 0 && photos.length < photoLimit && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                >
                  {uploadingPhoto ? (
                    <>
                      <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                      Upload…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Quota bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (photos.length / photoLimit) * 100)}%`,
                  background: photos.length >= photoLimit
                    ? "#ef4444"
                    : "linear-gradient(90deg, #F06292, #E91E8C)",
                }}
              />
            </div>

            {photoSizeError && (
              <p className="text-sm text-red-600 font-medium mb-3">{photoSizeError}</p>
            )}

            {/* Grid */}
            {photos.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center gap-3 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-all duration-200"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Cliquez pour ajouter vos photos</span>
                <span className="text-xs">JPG, PNG, WebP • 10 Mo max par photo</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((url, i) => (
                  <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={url}
                      alt={`Photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(url)}
                        className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {i === 0 && (
                      <div
                        className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        Photo principale
                      </div>
                    )}
                  </div>
                ))}
                {photos.length < photoLimit && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-medium">Ajouter</span>
                  </button>
                )}
              </div>
            )}

            {photos.length >= photoLimit && (
              <div className="mt-4 flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#F06292]">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#F06292] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <p className="text-sm text-gray-700">
                    Limite de photos atteinte.
                  </p>
                </div>
                <Link
                  href="/tarifs"
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: "#F06292" }}
                >
                  Passer au Pro
                </Link>
              </div>
            )}
          </Section>

          {/* ── 4. Réseaux sociaux ────────────────────────────────────────── */}
          <Section
            title="Réseaux sociaux"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "instagram" as const,
                  label: "Instagram",
                  placeholder: "https://instagram.com/monstudio",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                  color: "#E4405F",
                },
                {
                  key: "facebook" as const,
                  label: "Facebook",
                  placeholder: "https://facebook.com/monstudio",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                  color: "#1877F2",
                },
                {
                  key: "tiktok" as const,
                  label: "TikTok",
                  placeholder: "https://tiktok.com/@monstudio",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.19 8.19 0 004.78 1.52V6.72a4.85 4.85 0 01-1.01-.03z" />
                    </svg>
                  ),
                  color: "#000000",
                },
                {
                  key: "youtube" as const,
                  label: "YouTube",
                  placeholder: "https://youtube.com/@monstudio",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                  color: "#FF0000",
                },
              ].map(({ key, label, placeholder, icon, color }) => (
                <Field key={key} label={label} optional>
                  <div className="relative">
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color }}
                    >
                      {icon}
                    </div>
                    <input
                      type="url"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      placeholder={placeholder}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </Section>

          {/* ── 5. Informations légales ───────────────────────────────────── */}
          <Section
            title="Informations légales"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Numéro SIRET" optional>
                <input
                  type="text"
                  value={form.siret}
                  onChange={(e) => setField("siret", e.target.value.replace(/\D/g, "").slice(0, 14))}
                  placeholder="12345678901234"
                  maxLength={14}
                  className={inputCls}
                />
              </Field>

              <Field label="Numéro de TVA" optional>
                <input
                  type="text"
                  value={form.numero_tva}
                  onChange={(e) => setField("numero_tva", e.target.value.toUpperCase())}
                  placeholder="FR12345678901"
                  className={inputCls}
                />
              </Field>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Ces informations sont facultatives et ne sont pas affichées publiquement.
            </p>
          </Section>

          {/* ── 6. Tarifs ─────────────────────────────────────────────────── */}
          <Section
            title="Tarifs"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <Field label="À partir de" optional>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={form.prix_depart}
                  onChange={(e) => setField("prix_depart", e.target.value)}
                  placeholder="500"
                  className={`${inputCls} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Entrez votre prix de départ en euros (ex : 500 → affiché &quot;À partir de 500 €&quot;). Si vide, &quot;Prix sur demande&quot; sera affiché.
              </p>
            </Field>
            <Field label="Description de vos formules et tarifs" optional>
              <textarea
                value={form.tarifs_description}
                onChange={(e) => setField("tarifs_description", e.target.value)}
                placeholder={"Formule Essentielle : à partir de 1 200 €\nInclut : 4h de reportage, 200 photos retouchées\n\nFormule Prestige : à partir de 2 500 €\nInclut : journée complète, album photo, drone…"}
                rows={7}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <p className="text-xs text-gray-400 mt-2">
              Décrivez vos formules librement. Ces informations sont affichées sur votre profil public.
            </p>
          </Section>

          {/* ── 7. Disponibilités ─────────────────────────────────────────── */}
          <Section
            title="Disponibilités"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            <p className="text-xs text-gray-500 mb-5">
              Cliquez sur une date pour la marquer comme <span className="font-semibold text-gray-700">déjà réservée</span>. Ces dates seront affichées sur votre profil public pour informer les futurs mariés.
            </p>
            <CalendarDisponibilites
              reservedDates={reservedDates}
              onChange={setReservedDates}
            />
          </Section>

          {/* ── Bouton Enregistrer ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 pb-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 font-semibold px-10 py-4 rounded-2xl text-white text-base transition-all duration-200 hover:opacity-90 disabled:opacity-70 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #F06292, #E91E8C)",
                boxShadow: "0 8px 32px rgba(240, 98, 146, 0.35)",
              }}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Enregistrement en cours…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer mon profil
                </>
              )}
            </button>

            <Link
              href="/dashboard/prestataire"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Retour au tableau de bord
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
