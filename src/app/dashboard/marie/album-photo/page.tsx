"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://instantmariage.fr";

type Photo = {
  id: string;
  url: string;
  type: "photo" | "video";
  nom_fichier: string | null;
  uploade_par: string | null;
  created_at: string;
};

function slugFromPrenoms(p1: string, p2: string | null): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 12);
  const suffix = Math.floor(100000 + Math.random() * 900000).toString();
  const base = p2 ? `${clean(p1)}-${clean(p2)}` : clean(p1);
  return `${base}-${suffix}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AlbumPhotoDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [marieId, setMarieId] = useState<string | null>(null);
  const [prenom1, setPrenom1] = useState("");
  const [prenom2, setPrenom2] = useState<string | null>(null);
  const [albumSlug, setAlbumSlug] = useState<string | null>(null);
  const [albumActif, setAlbumActif] = useState(false);
  const [creating, setCreating] = useState(false);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const albumUrl = albumSlug ? `${SITE_URL}/album/${albumSlug}` : null;

  useEffect(() => {
    if (!albumUrl) return;
    QRCode.toDataURL(albumUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [albumUrl]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }

      const { data: marie } = await supabase
        .from("maries")
        .select("id, prenom_marie1, prenom_marie2, album_slug, album_actif")
        .eq("user_id", session.user.id)
        .single();

      if (marie) {
        setMarieId(marie.id);
        setPrenom1(marie.prenom_marie1 ?? "");
        setPrenom2(marie.prenom_marie2 ?? null);
        setAlbumSlug(marie.album_slug ?? null);
        setAlbumActif(marie.album_actif ?? false);
      }
      setAuthChecked(true);
    });
  }, [router]);

  const loadPhotos = useCallback(async (mid: string) => {
    const { data } = await supabase
      .from("album_photos")
      .select("id, url, type, nom_fichier, uploade_par, created_at")
      .eq("marie_id", mid)
      .order("created_at", { ascending: false });
    setPhotos((data as Photo[]) ?? []);
    setPhotosLoaded(true);
  }, []);

  useEffect(() => {
    if (marieId && albumSlug) loadPhotos(marieId);
    else setPhotosLoaded(true);
  }, [marieId, albumSlug, loadPhotos]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, photos.length]);

  const createAlbum = async () => {
    if (!marieId) return;
    setCreating(true);
    const slug = slugFromPrenoms(prenom1, prenom2);
    const { error } = await supabase
      .from("maries")
      .update({ album_slug: slug, album_actif: true })
      .eq("id", marieId);
    if (!error) {
      setAlbumSlug(slug);
      setAlbumActif(true);
    }
    setCreating(false);
  };

  const toggleAlbum = async (actif: boolean) => {
    if (!marieId) return;
    await supabase.from("maries").update({ album_actif: actif }).eq("id", marieId);
    setAlbumActif(actif);
  };

  const downloadCard = useCallback(async () => {
    if (!qrDataUrl || !prenom1) return;
    const canvas = document.createElement("canvas");
    const W = 600, H = 800;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#F06292");
    grad.addColorStop(1, "#e91e8c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("InstantMariage", W / 2, 72);

    const names = prenom2 ? `${prenom1} & ${prenom2}` : prenom1;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillText(`Mariage de`, W / 2, 180);
    ctx.font = "bold 40px Georgia, serif";
    ctx.fillStyle = "#e91e8c";
    ctx.fillText(names, W / 2, 230);

    const qrImg = new window.Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.src = qrDataUrl;
    });
    const qrSize = 320;
    const qrX = (W - qrSize) / 2;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(qrX - 16, 270, qrSize + 32, qrSize + 32, 16);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(qrImg, qrX, 286, qrSize, qrSize);

    ctx.fillStyle = "#555555";
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText("Scannez pour partager vos photos !", W / 2, 670);
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("instantmariage.fr", W / 2, 740);

    const link = document.createElement("a");
    link.download = `album-qrcode-${albumSlug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [qrDataUrl, prenom1, prenom2, albumSlug]);

  if (!authChecked) return null;

  const albumTitle = prenom2 ? `${prenom1} & ${prenom2}` : prenom1;
  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />

        <div className="pt-20 pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Back link */}
            <div className="pt-10 pb-8">
              <Link
                href="/dashboard/marie"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
            </div>

            {/* Header row: title + QR code compact box */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">

              {/* Left: title + counter */}
              <div className="flex-1">
                {albumSlug ? (
                  <>
                    <h1
                      className="text-4xl lg:text-5xl text-gray-900 leading-tight mb-3"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}
                    >
                      Album de{" "}
                      <span style={{ fontStyle: "italic" }}>{albumTitle}</span>
                    </h1>
                    <p className="text-gray-400 text-base mb-5">
                      {photos.length === 0
                        ? "Aucune photo partagée pour l'instant"
                        : `${photos.length} photo${photos.length > 1 ? "s" : ""} partagée${photos.length > 1 ? "s" : ""} par vos invités`}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: albumActif ? "#10b981" : "#d1d5db" }}
                        />
                        <span className="text-sm text-gray-500">
                          Album {albumActif ? "actif" : "désactivé"}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleAlbum(!albumActif)}
                        className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                        style={
                          albumActif
                            ? { borderColor: "#fca5a5", color: "#ef4444", background: "#fef2f2" }
                            : { borderColor: "#6ee7b7", color: "#059669", background: "#f0fdf4" }
                        }
                      >
                        {albumActif ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        onClick={() => marieId && loadPhotos(marieId)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
                      >
                        Actualiser
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1
                      className="text-4xl lg:text-5xl text-gray-900 leading-tight mb-3"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}
                    >
                      Album photo
                    </h1>
                    <p className="text-gray-400 text-base">
                      Créez votre album pour recevoir les photos de vos invités
                    </p>
                  </>
                )}
              </div>

              {/* Right: QR Code compact */}
              {albumSlug && (
                <div
                  className="flex-shrink-0 rounded-2xl p-5 flex flex-col items-center gap-3 w-full lg:w-auto"
                  style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    minWidth: 200,
                    maxWidth: 240,
                  }}
                >
                  {qrDataUrl ? (
                    <div className="p-2 bg-white rounded-xl border border-gray-100">
                      <Image
                        src={qrDataUrl}
                        alt="QR Code album"
                        width={140}
                        height={140}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-[140px] h-[140px] rounded-xl bg-gray-100 flex items-center justify-center"
                    >
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                    </div>
                  )}

                  <p className="text-xs text-gray-400 font-mono text-center truncate w-full px-1">
                    {albumUrl?.replace("https://", "")}
                  </p>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={downloadCard}
                      disabled={!qrDataUrl}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    >
                      Télécharger la carte
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(albumUrl!)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Copier le lien"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <Link
                    href="/dashboard/marie/album-photo/templates"
                    style={{ background: '#F06292', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 500, display: 'block', textAlign: 'center' }}
                  >
                    Personnaliser ma carte
                  </Link>
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="w-full py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                    style={{ borderColor: '#F06292', color: '#F06292', background: 'white' }}
                  >
                    Partager l&apos;album
                  </button>
                </div>
              )}
            </div>

            {/* Create album CTA */}
            {!albumSlug && (
              <div className="flex flex-col items-center text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Créez votre album collaboratif
                </h2>
                <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
                  Générez un QR Code unique à imprimer ou partager. Vos invités y déposent leurs photos sans créer de compte.
                </p>
                <button
                  onClick={createAlbum}
                  disabled={creating}
                  className="px-8 py-3 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? "Création…" : "Créer mon album"}
                </button>
              </div>
            )}

            {/* Photos grid */}
            {albumSlug && (
              <>
                {!photosLoaded ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
                  </div>
                ) : photos.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-24">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium text-gray-700 mb-1">
                      Aucune photo pour l&apos;instant
                    </p>
                    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                      Partagez le QR Code à vos invités pour commencer à recevoir des photos
                    </p>
                  </div>
                ) : (
                  /* Masonry grid */
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-2">
                    {photos.map((p, idx) => (
                      <div
                        key={p.id}
                        className="break-inside-avoid mb-2 group"
                        style={{ cursor: p.type === "photo" ? "pointer" : "default" }}
                        onClick={() => p.type === "photo" && setLightboxIndex(idx)}
                      >
                        <div
                          className="relative rounded-lg overflow-hidden"
                          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                        >
                          {p.type === "photo" ? (
                            <Image
                              src={p.url}
                              alt={p.nom_fichier ?? "photo"}
                              width={800}
                              height={600}
                              style={{ width: "100%", height: "auto", display: "block" }}
                              className="group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          )}

                          {/* Hover overlay shadow */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                            style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
                          />

                          {/* Uploader badge — always visible at bottom-left */}
                          {p.uploade_par && (
                            <div
                              className="absolute bottom-0 left-0 right-0 px-3 py-2"
                              style={{
                                background:
                                  "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
                              }}
                            >
                              <span className="text-white text-xs font-medium">
                                {p.uploade_par}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        <Footer />
      </main>

      {/* Share modal */}
      {shareModalOpen && albumUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Partager l&apos;album</h2>
              <button
                onClick={() => setShareModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Link display */}
            <div
              className="rounded-xl px-3 py-2 mb-4 font-mono text-xs text-gray-500 truncate"
              style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}
            >
              {albumUrl}
            </div>

            {/* Share buttons */}
            <div className="flex flex-col gap-2 mb-4">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Partagez vos photos de notre mariage ! ${albumUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.546 4.09 1.5 5.814L0 24l6.335-1.484A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.371l-.36-.214-3.724.872.937-3.626-.235-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`sms:?body=${encodeURIComponent(`Partagez vos photos de notre mariage ! ${albumUrl}`)}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                SMS
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(albumUrl);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: linkCopied ? "#10b981" : "#F06292" }}
              >
                {linkCopied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copié !
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copier le lien
                  </>
                )}
              </button>
            </div>

            {/* Explanation */}
            <p className="text-xs text-center text-gray-400 leading-relaxed">
              Envoyez ce lien à vos invités pour qu&apos;ils partagent leurs photos de votre mariage 📸
            </p>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {currentPhoto !== null && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2">
            <span className="text-gray-400 text-sm tabular-nums">
              {lightboxIndex + 1} / {photos.length}
            </span>
          </div>

          {/* Prev */}
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image container */}
          <div
            className="flex flex-col items-center px-16 max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {currentPhoto.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPhoto.url}
                alt={currentPhoto.nom_fichier ?? "photo"}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "78vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            ) : (
              <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            )}

            {/* Bottom info */}
            <div className="flex items-center justify-between w-full mt-4 px-1">
              <span className="text-white text-sm font-medium">
                {currentPhoto.uploade_par ?? "Invité"}
              </span>
              <span className="text-gray-500 text-sm">
                {formatDate(currentPhoto.created_at)}
              </span>
            </div>
          </div>

          {/* Next */}
          {lightboxIndex < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
