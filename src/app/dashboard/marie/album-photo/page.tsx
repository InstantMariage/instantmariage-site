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
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

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

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const albumUrl = albumSlug ? `${SITE_URL}/album/${albumSlug}` : null;

  // Génère le QR code dès que le slug est disponible
  useEffect(() => {
    if (!albumUrl) return;
    QRCode.toDataURL(albumUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [albumUrl]);

  // Auth + chargement
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

  // Charger les photos quand l'album existe
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

  // Génère et télécharge la carte QR Code sur canvas
  const downloadCard = useCallback(async () => {
    if (!qrDataUrl || !prenom1) return;
    const canvas = document.createElement("canvas");
    const W = 600, H = 800;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Fond blanc
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Bandeau rose en haut
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#F06292");
    grad.addColorStop(1, "#e91e8c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 120);

    // Logo texte dans le bandeau
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("InstantMariage", W / 2, 72);

    // Titre "Mariage de …"
    const names = prenom2 ? `${prenom1} & ${prenom2}` : prenom1;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillText(`Mariage de`, W / 2, 180);
    ctx.font = "bold 40px Georgia, serif";
    ctx.fillStyle = "#e91e8c";
    ctx.fillText(names, W / 2, 230);

    // QR Code
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

    // Texte bas
    ctx.fillStyle = "#555555";
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText("Scannez pour partager vos photos !", W / 2, 670);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("instantmariage.fr", W / 2, 740);

    // Téléchargement
    const link = document.createElement("a");
    link.download = `album-qrcode-${albumSlug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [qrDataUrl, prenom1, prenom2, albumSlug]);

  if (!authChecked) return null;

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#FEF0F5" }}>
      <Header />

      <div className="pt-20 pb-20">

        {/* Hero */}
        <section
          className="max-w-3xl mx-auto px-6 pt-12 pb-10 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
        >
          <Link href="/dashboard/marie" className="inline-flex items-center gap-1.5 text-xs font-medium mb-4 opacity-80 hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.9)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-1">Album photo</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
            Vos invités partagent leurs photos via QR Code, sans inscription
          </p>
        </section>

        <div className="max-w-3xl mx-auto px-6 space-y-5 pt-4">

          {/* ── Créer l'album ── */}
          {!albumSlug && (
            <section
              className="rounded-3xl p-8 flex flex-col items-center text-center"
              style={{ background: "white", border: "1px solid #FECDD3", boxShadow: "0 4px 24px rgba(240,98,146,0.08)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Créez votre album collaboratif</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">
                Générez un QR Code unique à imprimer ou partager. Vos invités y déposent leurs photos sans créer de compte.
              </p>
              <button
                onClick={createAlbum}
                disabled={creating}
                className="px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white", boxShadow: "0 8px 24px rgba(240,98,146,0.3)" }}
              >
                {creating ? "Création…" : "Créer mon album"}
              </button>
            </section>
          )}

          {/* ── QR Code + contrôles ── */}
          {albumSlug && (
            <section
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", border: "1px solid #FECDD3", boxShadow: "0 4px 24px rgba(240,98,146,0.08)" }}
            >
              {/* Statut */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #FEE2E2" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: albumActif ? "#10b981" : "#d1d5db" }}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Album {albumActif ? "actif" : "désactivé"}
                  </span>
                </div>
                <button
                  onClick={() => toggleAlbum(!albumActif)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: albumActif ? "#FEE2E2" : "#D1FAE5",
                    color: albumActif ? "#ef4444" : "#059669",
                  }}
                >
                  {albumActif ? "Désactiver" : "Activer"}
                </button>
              </div>

              {/* QR Code */}
              <div className="p-6 flex flex-col items-center">
                {qrDataUrl ? (
                  <div
                    className="p-4 rounded-2xl mb-4"
                    style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}
                  >
                    <Image src={qrDataUrl} alt="QR Code album" width={200} height={200} />
                  </div>
                ) : (
                  <div className="w-[200px] h-[200px] rounded-2xl flex items-center justify-center mb-4" style={{ background: "#FFF0F5" }}>
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
                  </div>
                )}

                {/* Lien */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full max-w-sm mb-4"
                  style={{ background: "#FFF0F5" }}
                >
                  <span className="text-xs text-gray-500 truncate flex-1 font-mono">{albumUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(albumUrl!)}
                    className="text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-70"
                    style={{ color: "#F06292" }}
                  >
                    Copier
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full max-w-sm">
                  <button
                    onClick={downloadCard}
                    disabled={!qrDataUrl}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #F06292, #e91e8c)", color: "white" }}
                  >
                    Télécharger la carte
                  </button>
                  <a
                    href={albumUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-70"
                    style={{ background: "#FFF0F5", color: "#F06292", border: "1px solid #FECDD3" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* ── Mes photos ── */}
          {albumSlug && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Photos des invités
                  {photos.length > 0 && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "#FFF0F5", color: "#F06292" }}
                    >
                      {photos.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => marieId && loadPhotos(marieId)}
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "#F06292" }}
                >
                  Actualiser
                </button>
              </div>

              <div
                className="rounded-3xl overflow-hidden"
                style={{ background: "white", border: "1px solid #FECDD3", boxShadow: "0 4px 24px rgba(240,98,146,0.08)" }}
              >
                {!photosLoaded ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: "#F06292" }} />
                  </div>
                ) : photos.length === 0 ? (
                  <div className="flex flex-col items-center text-center p-10">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#FFF0F5", color: "#F06292" }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Aucune photo pour l&apos;instant</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Partagez le QR Code à vos invités pour commencer à recevoir des photos
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 grid grid-cols-3 gap-2">
                      {photos.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group" style={{ background: "#FFF0F5" }}>
                          {p.type === "photo" ? (
                            <Image
                              src={p.url}
                              alt={p.nom_fichier ?? "photo"}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 33vw, 200px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8" style={{ color: "#F06292" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          )}
                          {p.uploade_par && (
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
                              <p className="text-white text-xs truncate">{p.uploade_par}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Tout télécharger */}
                    <div style={{ borderTop: "1px solid #FEE2E2" }}>
                      <div className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Télécharger tout</p>
                          <p className="text-xs text-gray-400">Exportez toutes vos photos en ZIP</p>
                        </div>
                        <span
                          className="text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: "#F3F4F6", color: "#9CA3AF" }}
                        >
                          Bientôt
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

        </div>
      </div>

      <Footer />
      {/* Canvas caché pour la génération de la carte */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
