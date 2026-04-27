"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://instantmariage.fr";
const A4_W = 595;
const A4_H = 842;

type TemplateId =
  | "elegance-doree"
  | "boheme-rose"
  | "moderne-minimaliste"
  | "nuit-romantique";

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  "elegance-doree": "Élégance Dorée",
  "boheme-rose": "Bohème Rose",
  "moderne-minimaliste": "Moderne Minimaliste",
  "nuit-romantique": "Nuit Romantique",
};

// ── Mini template renderers (identiques aux originaux, pour le mockup) ─────────

function EleganceDoreeMin({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{ width: A4_W, height: A4_H, background: "#FAFAF8", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, 'Times New Roman', serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 16, border: "2px solid #C9A84C", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 26, border: "1px solid rgba(201,168,76,0.45)", pointerEvents: "none" }} />
      {([{ top: 10, left: 10 }, { top: 10, right: 10 }, { bottom: 10, left: 10 }, { bottom: 10, right: 10 }] as React.CSSProperties[]).map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos, color: "#C9A84C", fontSize: 18, lineHeight: 1, userSelect: "none" }}>✦</div>
      ))}
      <div style={{ textAlign: "center", padding: "0 72px", width: "100%", zIndex: 1 }}>
        <p style={{ fontSize: 13, letterSpacing: "0.35em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 14, fontStyle: "italic" }}>Mariage de</p>
        <p style={{ fontSize: 40, fontWeight: "bold", color: "#1a1a1a", marginBottom: 6, lineHeight: 1.15 }}>{names}</p>
        <div style={{ width: 72, height: 1, background: "#C9A84C", margin: "18px auto 36px" }} />
        {qrDataUrl ? (
          <div style={{ width: 216, height: 216, margin: "0 auto", border: "3px solid #C9A84C", padding: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={196} height={196} alt="QR Code" />
          </div>
        ) : (
          <div style={{ width: 216, height: 216, margin: "0 auto", border: "3px solid #C9A84C", background: "#f5f0e8" }} />
        )}
        <div style={{ width: 72, height: 1, background: "#C9A84C", margin: "30px auto 18px" }} />
        <p style={{ fontSize: 10, color: "#999", letterSpacing: "0.22em", textTransform: "uppercase" }}>Scannez pour partager vos photos</p>
        <p style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.28em", marginTop: 8, textTransform: "uppercase" }}>instantmariage.fr</p>
      </div>
    </div>
  );
}

function BohemeRoseMin({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{ width: A4_W, height: A4_H, background: "#FDF6F0", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, 'Times New Roman', serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,98,146,0.28) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,167,38,0.2) 0%, transparent 70%)" }} />
      <div style={{ textAlign: "center", padding: "0 72px", width: "100%", zIndex: 1 }}>
        <p style={{ fontSize: 15, color: "#F06292", fontStyle: "italic", marginBottom: 10, letterSpacing: "0.05em" }}>Mariage de</p>
        <p style={{ fontSize: 44, color: "#F06292", fontWeight: "bold", fontStyle: "italic", marginBottom: 10, lineHeight: 1.15 }}>{names}</p>
        <div style={{ width: 60, height: 2, borderRadius: 2, background: "linear-gradient(90deg, #F06292, #ffb6c1)", margin: "0 auto 38px" }} />
        {qrDataUrl ? (
          <div style={{ width: 220, height: 220, margin: "0 auto", background: "#FDE8F0", borderRadius: 20, padding: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={196} height={196} alt="QR Code" />
          </div>
        ) : (
          <div style={{ width: 220, height: 220, margin: "0 auto", background: "#FDE8F0", borderRadius: 20 }} />
        )}
        <p style={{ fontSize: 11, color: "#F06292", letterSpacing: "0.15em", marginTop: 28, fontStyle: "italic" }}>Scannez pour partager vos photos</p>
        <p style={{ fontSize: 10, color: "#f8a4c8", letterSpacing: "0.2em", marginTop: 8, textTransform: "uppercase" }}>instantmariage.fr</p>
      </div>
    </div>
  );
}

function ModerneMinimalisteMin({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{ width: A4_W, height: A4_H, background: "#FFFFFF", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 52, left: 44, right: 44, height: 2, background: "#111" }} />
      <div style={{ position: "absolute", bottom: 52, left: 44, right: 44, height: 2, background: "#111" }} />
      <div style={{ textAlign: "center", padding: "0 72px", width: "100%" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.55em", color: "#444", textTransform: "uppercase", marginBottom: 24, fontWeight: 400 }}>MARIAGE DE</p>
        <p style={{ fontSize: 38, fontWeight: 300, color: "#111", letterSpacing: "0.12em", marginBottom: 40, textTransform: "uppercase", lineHeight: 1.25 }}>{names.toUpperCase()}</p>
        {qrDataUrl ? (
          <div style={{ width: 210, height: 210, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={210} height={210} alt="QR Code" />
          </div>
        ) : (
          <div style={{ width: 210, height: 210, margin: "0 auto", background: "#f0f0f0" }} />
        )}
        <p style={{ fontSize: 9, color: "#999", letterSpacing: "0.45em", marginTop: 32, textTransform: "uppercase" }}>SCANNEZ POUR PARTAGER VOS PHOTOS</p>
        <p style={{ fontSize: 9, color: "#111", letterSpacing: "0.35em", marginTop: 10, textTransform: "uppercase" }}>INSTANTMARIAGE.FR</p>
      </div>
    </div>
  );
}

function NuitRomantiqueMin({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{ width: A4_W, height: A4_H, background: "#1C1C1E", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, 'Times New Roman', serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 18, border: "1px solid #C9A84C", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 26, border: "1px solid rgba(201,168,76,0.25)", pointerEvents: "none" }} />
      {([{ top: 12, left: 12 }, { top: 12, right: 12 }, { bottom: 12, left: 12 }, { bottom: 12, right: 12 }] as React.CSSProperties[]).map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos, color: "#C9A84C", fontSize: 16, lineHeight: 1, userSelect: "none" }}>✦</div>
      ))}
      <div style={{ textAlign: "center", padding: "0 72px", width: "100%", zIndex: 1 }}>
        <p style={{ fontSize: 13, letterSpacing: "0.35em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 14, fontStyle: "italic" }}>Mariage de</p>
        <p style={{ fontSize: 40, fontWeight: "bold", color: "#C9A84C", marginBottom: 6, lineHeight: 1.15 }}>{names}</p>
        <div style={{ width: 72, height: 1, background: "#C9A84C", margin: "18px auto 36px" }} />
        {qrDataUrl ? (
          <div style={{ width: 216, height: 216, margin: "0 auto", background: "#ffffff", padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={196} height={196} alt="QR Code" />
          </div>
        ) : (
          <div style={{ width: 216, height: 216, margin: "0 auto", background: "#2c2c2e" }} />
        )}
        <div style={{ width: 72, height: 1, background: "#C9A84C", margin: "30px auto 18px" }} />
        <p style={{ fontSize: 10, color: "rgba(201,168,76,0.7)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Scannez pour partager vos photos</p>
        <p style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.28em", marginTop: 8, textTransform: "uppercase" }}>instantmariage.fr</p>
      </div>
    </div>
  );
}

function TemplateMini({ id, names, qrDataUrl }: { id: TemplateId; names: string; qrDataUrl: string | null }) {
  if (id === "elegance-doree") return <EleganceDoreeMin names={names} qrDataUrl={qrDataUrl} />;
  if (id === "boheme-rose") return <BohemeRoseMin names={names} qrDataUrl={qrDataUrl} />;
  if (id === "moderne-minimaliste") return <ModerneMinimalisteMin names={names} qrDataUrl={qrDataUrl} />;
  return <NuitRomantiqueMin names={names} qrDataUrl={qrDataUrl} />;
}

// ── Main page ─────────────────────────────────────────────────────────────────

function CommanderCadreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTemplate = searchParams.get("template") ?? "elegance-doree";
  const templateId: TemplateId = (["elegance-doree", "boheme-rose", "moderne-minimaliste", "nuit-romantique"] as TemplateId[]).includes(rawTemplate as TemplateId)
    ? (rawTemplate as TemplateId)
    : "elegance-doree";

  const isSuccess = searchParams.get("success") === "true";

  const [authChecked, setAuthChecked] = useState(false);
  const [marieId, setMarieId] = useState<string | null>(null);
  const [prenom1, setPrenom1] = useState("");
  const [prenom2, setPrenom2] = useState<string | null>(null);
  const [albumSlug, setAlbumSlug] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [telephone, setTelephone] = useState("");
  const [dateMariage, setDateMariage] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarie = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("maries")
      .select("id, prenom_marie1, prenom_marie2, album_slug")
      .eq("user_id", uid)
      .single();
    if (data) {
      setMarieId(data.id);
      setPrenom1(data.prenom_marie1 ?? "");
      setPrenom2(data.prenom_marie2 ?? null);
      setAlbumSlug(data.album_slug ?? null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      await fetchMarie(session.user.id);
      setAuthChecked(true);
    });
  }, [router, fetchMarie]);

  useEffect(() => {
    if (!albumSlug) return;
    QRCode.toDataURL(`${SITE_URL}/album/${albumSlug}`, {
      width: 300, margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [albumSlug]);

  if (!authChecked) return null;

  const names = prenom1 || prenom2
    ? prenom2 ? `${prenom1} & ${prenom2}` : prenom1
    : "Prénom 1 & Prénom 2";

  const FRAME_W = 200;
  const FRAME_H = 267;
  const FRAME_PAD = 10;
  const innerW = FRAME_W - FRAME_PAD * 2;
  const scale = innerW / A4_W;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marieId || paying) return;
    if (!prenom || !nom || !adresse || !codePostal || !ville || !telephone || !dateMariage) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setError(null);
    setPaying(true);
    try {
      const adresseLivraison = { prenom, nom, adresse, codePostal, ville, telephone, dateMariage };
      const res = await fetch("/api/marie/cadre-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, marieId, adresseLivraison }),
      });
      const { url, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
      setPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Back */}
          <div className="pt-10 pb-8">
            <Link
              href={`/dashboard/marie/album-photo/templates?template=${templateId}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux templates
            </Link>
          </div>

          {/* Success */}
          {isSuccess && (
            <div className="mb-8 rounded-2xl p-6 flex items-start gap-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#10B981" }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-green-800">Commande confirmée !</p>
                <p className="text-sm text-green-700 mt-1 leading-relaxed">
                  Votre cadre photo avec carte QR Code sera expédié sous 5–7 jours ouvrés.
                  Vous recevrez un email de confirmation avec le suivi de livraison.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Commander votre cadre
            </h1>
            <p className="text-gray-400 text-sm">
              Cadre blanc 15×20 cm + carte QR Code imprimée · Livraison incluse
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* ── Left: mockup + récapitulatif ── */}
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Aperçu du cadre
              </p>

              {/* Table mockup */}
              <div
                className="relative rounded-2xl overflow-hidden mb-6"
                style={{
                  backgroundImage: "url(https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                  height: 320,
                }}
              >
                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />
                {/* Frame */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-1.5deg)",
                    width: FRAME_W,
                    height: FRAME_H,
                    background: "#ffffff",
                    borderRadius: 3,
                    padding: FRAME_PAD,
                    boxShadow: "0 25px 70px rgba(0,0,0,0.45), 0 6px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative", borderRadius: 1 }}>
                    <div style={{ width: A4_W, height: A4_H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
                      <TemplateMini id={templateId} names={names} qrDataUrl={qrDataUrl} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-2xl p-5" style={{ background: "#FAFAF8", border: "1px solid #EBEBEB" }}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Récapitulatif</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Design</span>
                    <span className="font-medium text-gray-900">{TEMPLATE_LABELS[templateId]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Format</span>
                    <span className="font-medium text-gray-900">Cadre blanc 15×20 cm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Contenu</span>
                    <span className="font-medium text-gray-900">Carte QR Code imprimée</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-medium text-gray-900">5–7 jours ouvrés</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total TTC</span>
                    <span className="text-lg font-bold text-gray-900">39,90 €</span>
                  </div>
                  <p className="text-xs text-gray-400">Livraison incluse · Paiement sécurisé Stripe</p>
                </div>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="lg:col-span-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Informations de livraison
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                      placeholder="Marie"
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      placeholder="Dupont"
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse de livraison</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    required
                    placeholder="12 rue des Roses"
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Code postal</label>
                    <input
                      type="text"
                      value={codePostal}
                      onChange={(e) => setCodePostal(e.target.value)}
                      required
                      placeholder="75001"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
                    <input
                      type="text"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      required
                      placeholder="Paris"
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                    placeholder="06 12 34 56 78"
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Date du mariage</label>
                  <input
                    type="date"
                    value={dateMariage}
                    onChange={(e) => setDateMariage(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full py-4 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background: "#1a1a1a", color: "#fff" }}
                  >
                    {paying ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirection vers le paiement…
                      </span>
                    ) : (
                      "Commander — 39,90 €"
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Paiement sécurisé Stripe · Livraison offerte · Délai 5–7 jours ouvrés
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function CommanderCadrePage() {
  return (
    <Suspense>
      <CommanderCadreContent />
    </Suspense>
  );
}
