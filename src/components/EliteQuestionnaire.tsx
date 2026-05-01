"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActivityType =
  | "photographe" | "videaste" | "dj" | "traiteur"
  | "wedding-planner" | "fleuriste" | "autre";

interface FormState {
  domaine: string;
  typeActivite: ActivityType | "";
  nomProfessionnel: string;
  descriptionActivite: string;
  villePrincipale: string;
  telephone: string;
  email_contact: string;
  site_actuel: string;
  style_description: string;
  logoFile: File | null;
  logoUrl: string;
  photoFiles: File[];
  photoUrls: string[];
  instagram: string;
  facebook: string;
  tiktok: string;
  pinterest: string;
  cgvAccepte: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVITY_TYPES: { id: ActivityType; icon: string; label: string }[] = [
  { id: "photographe",    icon: "📸", label: "Photographe" },
  { id: "videaste",       icon: "🎥", label: "Vidéaste" },
  { id: "dj",             icon: "🎵", label: "DJ" },
  { id: "traiteur",       icon: "🍽️", label: "Traiteur" },
  { id: "wedding-planner",icon: "💍", label: "Wedding Planner" },
  { id: "fleuriste",      icon: "🌸", label: "Fleuriste" },
  { id: "autre",          icon: "✨", label: "Autre" },
];

const STATUS_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  en_cours:  { label: "En cours de création", icon: "🔨", desc: "Notre équipe travaille activement sur votre site." },
  en_ligne:  { label: "En ligne", icon: "🌐", desc: "Votre site est en ligne et accessible à vos clients." },
  suspendu:  { label: "Suspendu", icon: "⏸️", desc: "Votre site est temporairement suspendu." },
};

const STEPS = ["Votre activité", "Vos contenus"];

const ELITE_GRADIENT = "linear-gradient(135deg, #7C3AED, #F06292)";

const INITIAL_FORM: FormState = {
  domaine: "",
  typeActivite: "",
  nomProfessionnel: "",
  descriptionActivite: "",
  villePrincipale: "",
  telephone: "",
  email_contact: "",
  site_actuel: "",
  style_description: "",
  logoFile: null,
  logoUrl: "",
  photoFiles: [],
  photoUrls: [],
  instagram: "",
  facebook: "",
  tiktok: "",
  pinterest: "",
  cgvAccepte: false,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EliteQuestionnaire() {
  const router = useRouter();

  const [loading, setLoading]               = useState(true);
  const [isDomainLocked, setIsDomainLocked] = useState(false);
  const [prestataireId, setPrestataireId]   = useState<string | null>(null);
  const [existingSiteId, setExistingSiteId] = useState<string | null>(null);
  const [eliteSiteStatus, setEliteSiteStatus] = useState<string | null>(null);
  const [step, setStep]         = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [logoDrag, setLogoDrag]   = useState(false);
  const [photosDrag, setPhotosDrag] = useState(false);

  const logoInputRef   = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // ─── Auth & data loading ────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prestataire } = await supabase
        .from("prestataires")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!prestataire) { router.replace("/login"); return; }

      setPrestataireId(prestataire.id);

      const { data: eliteSite } = await supabase
        .from("elite_sites")
        .select("*")
        .eq("prestataire_id", prestataire.id)
        .maybeSingle();

      if (eliteSite) {
        if (eliteSite.statut !== "en_attente") {
          setEliteSiteStatus(eliteSite.statut);
          setLoading(false);
          return;
        }
        setExistingSiteId(eliteSite.id);
        if (eliteSite.domaine) setIsDomainLocked(true);
        setForm({
          domaine:             eliteSite.domaine || "",
          typeActivite:        (eliteSite.type_activite || "") as ActivityType | "",
          nomProfessionnel:    eliteSite.nom_professionnel || "",
          descriptionActivite: eliteSite.description_activite || "",
          villePrincipale:     eliteSite.ville_principale || "",
          telephone:           eliteSite.telephone || "",
          email_contact:       eliteSite.email_contact || session.user.email || "",
          site_actuel:         eliteSite.site_actuel || "",
          style_description:   eliteSite.style_description || "",
          logoFile:   null,
          logoUrl:    eliteSite.logo_url || "",
          photoFiles: [],
          photoUrls:  eliteSite.photos_urls || [],
          instagram:  eliteSite.instagram || "",
          facebook:   eliteSite.facebook  || "",
          tiktok:     eliteSite.tiktok    || "",
          pinterest:  eliteSite.pinterest || "",
          cgvAccepte: eliteSite.cgv_accepte || false,
        });
      } else {
        setForm(prev => ({ ...prev, email_contact: session.user.email || "" }));
        try {
          const res = await fetch(`/api/elite/domain?prestataire_id=${prestataire.id}`);
          if (res.ok) {
            const { domain } = await res.json();
            if (domain) {
              setForm(prev => ({ ...prev, domaine: domain }));
              setIsDomainLocked(true);
            }
          }
        } catch { /* domain stays empty */ }
      }

      setLoading(false);
    };

    init();
  }, [router]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  }

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.typeActivite)           errs.typeActivite     = "Veuillez choisir un type d'activité";
      if (!form.nomProfessionnel.trim()) errs.nomProfessionnel = "Champ obligatoire";
      if (!form.villePrincipale.trim())  errs.villePrincipale  = "Champ obligatoire";
      if (!form.telephone.trim()) {
        errs.telephone = "Champ obligatoire";
      } else if (!/^(\+33|0)[0-9]{9}$/.test(form.telephone.replace(/[\s.\-]/g, ""))) {
        errs.telephone = "Format invalide (ex : +33 6 00 00 00 00)";
      }
      if (!form.email_contact.trim()) errs.email_contact = "Champ obligatoire";
    }
    if (s === 2) {
      if (!form.cgvAccepte) errs.cgvAccepte = "Vous devez accepter les conditions";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleNext = () => { if (validateStep(step)) setStep(s => s + 1); };
  const handlePrev = () => setStep(s => s - 1);

  async function uploadFileToStorage(file: File, path: string): Promise<string> {
    const { error } = await supabase.storage
      .from("elite-assets")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("elite-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  function handleLogoFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: "Le logo ne doit pas dépasser 2 MB" }));
      return;
    }
    if (!["image/png", "image/svg+xml", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrors(prev => ({ ...prev, logo: "Format accepté : PNG, SVG, JPG" }));
      return;
    }
    setField("logoFile", file);
    setErrors(prev => ({ ...prev, logo: "" }));
  }

  function handlePhotosFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const newFiles: File[] = [];
    const total = form.photoFiles.length + form.photoUrls.length;
    for (const f of arr) {
      if (total + newFiles.length >= 10) break;
      if (f.size > 5 * 1024 * 1024) continue;
      if (!f.type.startsWith("image/")) continue;
      newFiles.push(f);
    }
    setField("photoFiles", [...form.photoFiles, ...newFiles]);
  }

  function removePhoto(index: number) {
    if (index < form.photoFiles.length) {
      setField("photoFiles", form.photoFiles.filter((_, i) => i !== index));
    } else {
      const urlIndex = index - form.photoFiles.length;
      setField("photoUrls", form.photoUrls.filter((_, i) => i !== urlIndex));
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2) || !prestataireId) return;
    setSubmitting(true);
    setUploadProgress(10);

    try {
      let logoUrl    = form.logoUrl;
      let photoUrls  = [...form.photoUrls];

      if (form.logoFile) {
        const ext  = form.logoFile.name.split(".").pop() ?? "jpg";
        const path = `${prestataireId}/logo-${Date.now()}.${ext}`;
        logoUrl = await uploadFileToStorage(form.logoFile, path);
      }
      setUploadProgress(30);

      for (let i = 0; i < form.photoFiles.length; i++) {
        const file = form.photoFiles[i];
        const ext  = file.name.split(".").pop() ?? "jpg";
        const path = `${prestataireId}/photo-${Date.now()}-${i}.${ext}`;
        photoUrls.push(await uploadFileToStorage(file, path));
        setUploadProgress(30 + Math.round(((i + 1) / form.photoFiles.length) * 45));
      }
      setUploadProgress(78);

      const payload = {
        prestataire_id:      prestataireId,
        domaine:             form.domaine,
        statut:              "en_attente",
        type_activite:       form.typeActivite  || null,
        nom_professionnel:   form.nomProfessionnel,
        description_activite: form.descriptionActivite || null,
        ville_principale:    form.villePrincipale,
        style_description:   form.style_description   || null,
        logo_url:            logoUrl   || null,
        photos_urls:         photoUrls,
        telephone:           form.telephone     || null,
        email_contact:       form.email_contact || null,
        site_actuel:         form.site_actuel   || null,
        instagram:           form.instagram     || null,
        facebook:            form.facebook      || null,
        tiktok:              form.tiktok        || null,
        pinterest:           form.pinterest     || null,
        cgv_accepte:         form.cgvAccepte,
        updated_at:          new Date().toISOString(),
      };

      let dbError;
      if (existingSiteId) {
        ({ error: dbError } = await supabase.from("elite_sites").update(payload).eq("id", existingSiteId));
      } else {
        ({ error: dbError } = await supabase.from("elite_sites").insert(payload));
      }
      if (dbError) {
        console.error("[elite-sites] Erreur Supabase DB:", {
          message: dbError.message,
          code:    dbError.code,
          details: dbError.details,
          hint:    dbError.hint,
          full:    dbError,
          payload,
        });
        throw dbError;
      }
      setUploadProgress(92);

      // Admin notification — best-effort, silent fail if table doesn't exist
      await supabase.from("notifications").insert({
        type:          "elite_questionnaire",
        titre:         "Nouveau questionnaire Elite soumis",
        message:       `${form.nomProfessionnel} — ${form.domaine}`,
        prestataire_id: prestataireId,
      }).then(
        () => {},
        () => console.log("[elite-questionnaire] Demande soumise:", form.domaine),
      );

      setUploadProgress(100);
      setSubmitted(true);
    } catch (err) {
      const e = err as Record<string, unknown>;
      console.error("[elite-questionnaire] Erreur complète:", {
        message:    e?.message,
        code:       e?.code,
        details:    e?.details,
        hint:       e?.hint,
        status:     e?.status,
        statusCode: e?.statusCode,
        raw:        err,
      });
      setErrors(prev => ({ ...prev, submit: "Une erreur est survenue. Veuillez réessayer." }));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (eliteSiteStatus) {
    const info = STATUS_LABELS[eliteSiteStatus] ?? { label: eliteSiteStatus, icon: "⚙️", desc: "" };
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-5">{info.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre site est en cours de création</h2>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
            style={{ background: "linear-gradient(135deg, #F3E8FF, #FCE7F3)", color: "#7C3AED" }}
          >
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            {info.label}
          </span>
          <p className="text-gray-500 mb-8">{info.desc}</p>
          <button
            onClick={() => router.push("/dashboard/prestataire")}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: ELITE_GRADIENT }}
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Votre demande a bien été reçue !</h2>
          <p className="text-gray-600 mb-4">
            Votre site sera en ligne dans <strong>72h</strong>. Nous vous contacterons par email dès qu&apos;il sera prêt.
          </p>
          <div className="rounded-2xl p-4 mb-8" style={{ background: "linear-gradient(135deg, #F3E8FF20, #FCE7F320)", border: "1px solid #E9D5FF" }}>
            <p className="text-xs text-gray-400 mb-1">Domaine réservé</p>
            <p className="font-bold text-violet-700 text-lg">{form.domaine}</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/prestataire")}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: ELITE_GRADIENT }}
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // ─── Main form ──────────────────────────────────────────────────────────────

  const totalPhotos = form.photoFiles.length + form.photoUrls.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-8">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: "linear-gradient(135deg, #F3E8FF, #FCE7F3)", color: "#7C3AED" }}
          >
            👑 Pack Elite — Création de votre site
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Configurez votre site</h1>
          <p className="text-gray-500 mt-2 text-sm">2 étapes pour créer votre site pro mariage</p>
        </div>

        {/* Stepper */}
        <div className="relative flex justify-between mb-3">
          {/* Connecting lines */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-0" />
          <div
            className="absolute top-5 left-5 h-0.5 transition-all duration-500"
            style={{
              right: step === 2 ? "20px" : "calc(100% - 20px)",
              background: ELITE_GRADIENT,
            }}
          />
          {STEPS.map((label, i) => {
            const idx      = i + 1;
            const isActive = step === idx;
            const isDone   = step > idx;
            return (
              <div key={idx} className="flex flex-col items-center z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: isDone
                      ? "#7C3AED"
                      : isActive
                      ? ELITE_GRADIENT
                      : "white",
                    border: isDone || isActive ? "none" : "2px solid #E5E7EB",
                    color:  isDone || isActive ? "white" : "#9CA3AF",
                    boxShadow: isActive ? "0 4px 14px #7C3AED33" : undefined,
                  }}
                >
                  {isDone ? "✓" : idx}
                </div>
                <span
                  className="text-xs mt-2 font-medium text-center whitespace-nowrap"
                  style={{ color: isActive ? "#7C3AED" : isDone ? "#8B5CF6" : "#9CA3AF" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${((step - 1) / (STEPS.length - 1)) * 100}%`,
              background: ELITE_GRADIENT,
            }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">

          {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Votre activité</h2>

              {/* Domaine */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de domaine
                </label>
                {isDomainLocked ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={form.domaine}
                      disabled
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed select-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.domaine}
                    onChange={e => setForm(prev => ({ ...prev, domaine: e.target.value }))}
                    placeholder="ex: mon-entreprise.fr"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {isDomainLocked ? "Domaine validé lors de votre souscription" : "Indiquez le nom de domaine souhaité pour votre site"}
                </p>
              </div>

              {/* Type d'activité */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type d&apos;activité <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ACTIVITY_TYPES.map(({ id, icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setField("typeActivite", id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium"
                      style={
                        form.typeActivite === id
                          ? { borderColor: "#7C3AED", background: "#F5F3FF", color: "#7C3AED" }
                          : { borderColor: "#E5E7EB", color: "#6B7280" }
                      }
                    >
                      <span className="text-2xl">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                {errors.typeActivite && (
                  <p className="text-rose-400 text-xs mt-2">{errors.typeActivite}</p>
                )}
              </div>

              {/* Nom professionnel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom professionnel <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.nomProfessionnel}
                  onChange={e => setField("nomProfessionnel", e.target.value)}
                  placeholder="ex : Sophie Martin Photographie"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 transition-colors"
                  style={errors.nomProfessionnel ? { borderColor: "#FCA5A5" } : {}}
                />
                {errors.nomProfessionnel && (
                  <p className="text-rose-400 text-xs mt-1">{errors.nomProfessionnel}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description de votre activité
                  <span className="text-gray-400 font-normal ml-2 text-xs">
                    ({form.descriptionActivite.length}/500)
                  </span>
                </label>
                <textarea
                  value={form.descriptionActivite}
                  onChange={e => setField("descriptionActivite", e.target.value.slice(0, 500))}
                  placeholder="Parlez de votre activité, votre style, vos valeurs..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 resize-none transition-colors"
                />
              </div>

              {/* Ville principale */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ville principale d&apos;intervention <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.villePrincipale}
                  onChange={e => setField("villePrincipale", e.target.value)}
                  placeholder="ex : Paris, Lyon, Marseille..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 transition-colors"
                  style={errors.villePrincipale ? { borderColor: "#FCA5A5" } : {}}
                />
                {errors.villePrincipale && (
                  <p className="text-rose-400 text-xs mt-1">{errors.villePrincipale}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéro de téléphone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={e => setField("telephone", e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 transition-colors"
                  style={errors.telephone ? { borderColor: "#FCA5A5" } : {}}
                />
                {errors.telephone && (
                  <p className="text-rose-400 text-xs mt-1">{errors.telephone}</p>
                )}
              </div>

              {/* Email de contact */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email de contact professionnel <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email_contact}
                  onChange={e => setField("email_contact", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 transition-colors"
                  style={errors.email_contact ? { borderColor: "#FCA5A5" } : {}}
                />
                {errors.email_contact && (
                  <p className="text-rose-400 text-xs mt-1">{errors.email_contact}</p>
                )}
              </div>

              {/* Site web actuel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site web actuel
                  <span className="text-gray-400 font-normal ml-1.5">(optionnel)</span>
                </label>
                <input
                  type="url"
                  value={form.site_actuel}
                  onChange={e => setField("site_actuel", e.target.value)}
                  placeholder="https://votre-site-actuel.fr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 transition-colors"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-7">
              <h2 className="text-xl font-bold text-gray-900">Vos contenus</h2>

              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo
                  <span className="text-gray-400 font-normal ml-1.5">(PNG, SVG, JPG — max 2 MB)</span>
                </label>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                  onDragOver={e  => { e.preventDefault(); setLogoDrag(true); }}
                  onDragLeave={() => setLogoDrag(false)}
                  onDrop={e => {
                    e.preventDefault(); setLogoDrag(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handleLogoFile(f);
                  }}
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
                  style={
                    logoDrag
                      ? { borderColor: "#7C3AED", background: "#F5F3FF" }
                      : { borderColor: "#E5E7EB" }
                  }
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }}
                  />
                  {form.logoFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">{form.logoFile.name}</p>
                        <p className="text-xs text-gray-400">{(form.logoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setField("logoFile", null); }}
                        className="ml-2 text-rose-400 hover:text-rose-600 text-xl leading-none"
                      >×</button>
                    </div>
                  ) : form.logoUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.logoUrl} alt="Logo actuel" className="h-12 w-auto object-contain rounded" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setField("logoUrl", ""); }}
                        className="text-rose-400 hover:text-rose-600 text-sm underline"
                      >Supprimer</button>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl block mb-2">🖼️</span>
                      <p className="text-sm text-gray-500">
                        Glissez votre logo ici ou{" "}
                        <span style={{ color: "#7C3AED" }} className="font-medium">parcourez</span>
                      </p>
                    </>
                  )}
                </div>
                {errors.logo && <p className="text-rose-400 text-xs mt-1">{errors.logo}</p>}
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photos de votre travail
                  <span className="text-gray-400 font-normal ml-1.5">
                    ({totalPhotos}/10 — max 5 MB/photo)
                  </span>
                </label>

                {totalPhotos > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                    {form.photoFiles.map((file, i) => (
                      <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                        >×</button>
                      </div>
                    ))}
                    {form.photoUrls.map((url, i) => (
                      <div key={`url-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(form.photoFiles.length + i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {totalPhotos < 10 && (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                  <div
                    onDragOver={e  => { e.preventDefault(); setPhotosDrag(true); }}
                    onDragLeave={() => setPhotosDrag(false)}
                    onDrop={e => {
                      e.preventDefault(); setPhotosDrag(false);
                      handlePhotosFiles(e.dataTransfer.files);
                    }}
                    onClick={() => photosInputRef.current?.click()}
                    className="rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all"
                    style={
                      photosDrag
                        ? { borderColor: "#7C3AED", background: "#F5F3FF" }
                        : { borderColor: "#E5E7EB" }
                    }
                  >
                    <input
                      ref={photosInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => { if (e.target.files) handlePhotosFiles(e.target.files); }}
                    />
                    <span className="text-3xl block mb-2">📷</span>
                    <p className="text-sm text-gray-500">
                      Glissez vos photos ici ou{" "}
                      <span style={{ color: "#7C3AED" }} className="font-medium">parcourez</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Maximum 10 photos · {10 - totalPhotos} restante{10 - totalPhotos > 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Réseaux sociaux
                  <span className="text-gray-400 font-normal ml-1.5">(optionnels)</span>
                </label>
                <div className="space-y-3">
                  {(
                    [
                      { key: "instagram" as const, icon: "📸", placeholder: "https://instagram.com/votre-compte",  label: "Instagram" },
                      { key: "facebook"  as const, icon: "📘", placeholder: "https://facebook.com/votre-page",    label: "Facebook" },
                      { key: "tiktok"    as const, icon: "🎵", placeholder: "https://tiktok.com/@votre-compte",   label: "TikTok" },
                      { key: "pinterest" as const, icon: "📌", placeholder: "https://pinterest.com/votre-compte", label: "Pinterest" },
                    ] as const
                  ).map(({ key, icon, placeholder, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
                      <input
                        type="url"
                        value={form[key]}
                        onChange={e => setField(key, e.target.value)}
                        placeholder={placeholder}
                        aria-label={label}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-sm text-gray-900 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Style description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Décrivez votre style souhaité
                  <span className="text-gray-400 font-normal ml-2 text-xs">
                    ({form.style_description.length}/1000)
                  </span>
                </label>
                <textarea
                  value={form.style_description}
                  onChange={e => setField("style_description", e.target.value.slice(0, 1000))}
                  placeholder="Ex: je veux quelque chose d'élégant, noir et or, minimaliste, dans l'esprit Apple..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 text-gray-900 resize-none transition-colors"
                />
              </div>

              {/* CGV */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.cgvAccepte}
                    onChange={e => setField("cgvAccepte", e.target.checked)}
                    className="mt-0.5 w-5 h-5 flex-shrink-0 rounded accent-violet-600"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    J&apos;ai lu et j&apos;accepte les conditions — mon site reste la propriété
                    d&apos;InstantMariage tant que je suis abonné
                  </span>
                </label>
                {errors.cgvAccepte && (
                  <p className="text-rose-400 text-xs mt-1 ml-8">{errors.cgvAccepte}</p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-600 text-sm">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────────────────────────── */}
          <div className={`flex mt-8 gap-3 ${step > 1 ? "justify-between" : "justify-end"}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                ← Précédent
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: ELITE_GRADIENT }}
              >
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                style={{ background: ELITE_GRADIENT }}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Envoi en cours... ({uploadProgress}%)
                  </>
                ) : (
                  "Envoyer ma demande 🚀"
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
