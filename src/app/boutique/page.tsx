"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://instantmariage.fr";

function slugFromPrenoms(p1: string, p2: string | null): string {
  const clean = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "").slice(0, 12);
  const suffix = Math.floor(100000 + Math.random() * 900000).toString();
  const base = p2 ? `${clean(p1)}-${clean(p2)}` : clean(p1);
  return `${base}-${suffix}`;
}

function CadreIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

const TEMPLATES = [
  {
    id: "elegance-doree",
    name: "Élégance Dorée",
    url: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777311248762-img_1741.jpg",
  },
  {
    id: "boheme-rose",
    name: "Bohème Rose",
    url: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777311228438-img_1742.jpg",
  },
  {
    id: "moderne-minimaliste",
    name: "Moderne Minimaliste",
    url: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777311208591-img_1743.jpg",
  },
  {
    id: "nuit-romantique",
    name: "Nuit Romantique",
    url: "https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777311265519-img_1744-2.jpg",
  },
];

const FRAME_COLORS = [
  { color: "#1C1C1E", label: "Noir", isLight: false },
  { color: "#F5F5F5", label: "Blanc", isLight: true },
  { color: "#C9A84C", label: "Doré", isLight: false },
];

const TESTIMONIALS = [
  {
    name: "Sophie & Thomas",
    date: "Mariés en juin 2025",
    text: "Le cadre QR Code était absolument magnifique sur nos tables ! Tous nos invités ont scanné et les photos qu'on a reçues sont inoubliables. La qualité d'impression est parfaite.",
    stars: 5,
  },
  {
    name: "Léa & Julien",
    date: "Mariés en avril 2025",
    text: "La livraison était rapide et le packaging soigné. Le cadre s'intègre parfaitement dans notre décoration champêtre. Je recommande à tous les futurs mariés.",
    stars: 5,
  },
];

// ── Overlay components ───────────────────────────────────────────────────────

function EleganceOverlay({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(250,250,248,0.84)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <div style={{ position: "absolute", inset: 8, border: "1.5px solid rgba(201,168,76,0.85)", pointerEvents: "none" }} />
      {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos as React.CSSProperties, color: "#C9A84C", fontSize: 12, lineHeight: 1, userSelect: "none" }}>✦</div>
      ))}
      <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 8, fontStyle: "italic" }}>Mariage de</p>
      <p style={{ fontSize: 17, fontWeight: "bold", color: "#1a1a1a", lineHeight: 1.2, textAlign: "center", padding: "0 20px", marginBottom: 4 }}>{names}</p>
      <div style={{ width: 40, height: 1, background: "#C9A84C", margin: "10px auto 12px" }} />
      {qrDataUrl ? (
        <div style={{ border: "2.5px solid #C9A84C", padding: 5, background: "#fff" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} width={80} height={80} alt="QR" style={{ display: "block" }} />
        </div>
      ) : (
        <div style={{ width: 90, height: 90, border: "2.5px solid #C9A84C", background: "#f5f0e8" }} />
      )}
      <p style={{ fontSize: 7, color: "#C9A84C", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 12 }}>instantmariage.fr</p>
    </div>
  );
}

function BohemeOverlay({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(253,246,240,0.84)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <p style={{ fontSize: 10, color: "#F06292", fontStyle: "italic", marginBottom: 8, letterSpacing: "0.05em" }}>Mariage de</p>
      <p style={{ fontSize: 20, color: "#F06292", fontWeight: "bold", fontStyle: "italic", lineHeight: 1.2, textAlign: "center", padding: "0 20px", marginBottom: 8 }}>{names}</p>
      <div style={{ width: 40, height: 2, borderRadius: 2, background: "linear-gradient(90deg, #F06292, #ffb6c1)", margin: "0 auto 14px" }} />
      {qrDataUrl ? (
        <div style={{ background: "rgba(253,232,240,0.96)", borderRadius: 12, padding: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} width={80} height={80} alt="QR" style={{ display: "block" }} />
        </div>
      ) : (
        <div style={{ width: 96, height: 96, background: "#FDE8F0", borderRadius: 12 }} />
      )}
      <p style={{ fontSize: 8, color: "#F06292", letterSpacing: "0.12em", marginTop: 12, fontStyle: "italic" }}>instantmariage.fr</p>
    </div>
  );
}

function ModerneOverlay({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(255,255,255,0.88)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ position: "absolute", top: 22, left: 18, right: 18, height: 2, background: "#111" }} />
      <div style={{ position: "absolute", bottom: 22, left: 18, right: 18, height: 2, background: "#111" }} />
      <p style={{ fontSize: 8, letterSpacing: "0.45em", color: "#444", textTransform: "uppercase", marginBottom: 14, fontWeight: 400 }}>MARIAGE DE</p>
      <p style={{ fontSize: 15, fontWeight: 300, color: "#111", letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase", lineHeight: 1.3, textAlign: "center", padding: "0 18px" }}>{names.toUpperCase()}</p>
      {qrDataUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={qrDataUrl} width={86} height={86} alt="QR" style={{ display: "block" }} />
      ) : (
        <div style={{ width: 86, height: 86, background: "#f0f0f0" }} />
      )}
      <p style={{ fontSize: 7, color: "#999", letterSpacing: "0.35em", marginTop: 14, textTransform: "uppercase" }}>INSTANTMARIAGE.FR</p>
    </div>
  );
}

function NuitOverlay({ names, qrDataUrl }: { names: string; qrDataUrl: string | null }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(28,28,30,0.84)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <div style={{ position: "absolute", inset: 8, border: "1px solid rgba(201,168,76,0.6)", pointerEvents: "none" }} />
      {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos as React.CSSProperties, color: "#C9A84C", fontSize: 11, lineHeight: 1, userSelect: "none" }}>✦</div>
      ))}
      <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "#C9A84C", textTransform: "uppercase", marginBottom: 8, fontStyle: "italic" }}>Mariage de</p>
      <p style={{ fontSize: 17, fontWeight: "bold", color: "#C9A84C", lineHeight: 1.2, textAlign: "center", padding: "0 20px", marginBottom: 4 }}>{names}</p>
      <div style={{ width: 40, height: 1, background: "#C9A84C", margin: "10px auto 14px" }} />
      {qrDataUrl ? (
        <div style={{ background: "#fff", padding: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} width={78} height={78} alt="QR" style={{ display: "block" }} />
        </div>
      ) : (
        <div style={{ width: 90, height: 90, background: "#2c2c2e" }} />
      )}
      <p style={{ fontSize: 7, color: "rgba(201,168,76,0.8)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 12 }}>instantmariage.fr</p>
    </div>
  );
}

function SliderOverlay({ templateId, names, qrDataUrl }: { templateId: string; names: string; qrDataUrl: string | null }) {
  if (templateId === "elegance-doree") return <EleganceOverlay names={names} qrDataUrl={qrDataUrl} />;
  if (templateId === "boheme-rose") return <BohemeOverlay names={names} qrDataUrl={qrDataUrl} />;
  if (templateId === "moderne-minimaliste") return <ModerneOverlay names={names} qrDataUrl={qrDataUrl} />;
  return <NuitOverlay names={names} qrDataUrl={qrDataUrl} />;
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function BoutiquePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isMarie, setIsMarie] = useState(false);
  const [prenom1, setPrenom1] = useState<string | null>(null);
  const [prenom2, setPrenom2] = useState<string | null>(null);
  const [albumSlug, setAlbumSlug] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [frameColor, setFrameColor] = useState("#1C1C1E");
  const isPausedRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setIsLoggedIn(false); return; }
      setIsLoggedIn(true);

      const { data: marie } = await supabase
        .from("maries")
        .select("id, prenom_marie1, prenom_marie2, album_slug")
        .eq("user_id", session.user.id)
        .single();

      if (marie) {
        setIsMarie(true);
        const p1 = marie.prenom_marie1 ?? null;
        const p2 = marie.prenom_marie2 ?? null;
        setPrenom1(p1);
        setPrenom2(p2);

        let slug = marie.album_slug as string | null;
        if (!slug && p1) {
          slug = slugFromPrenoms(p1, p2);
          await supabase
            .from("maries")
            .update({ album_slug: slug, album_actif: true })
            .eq("id", marie.id);
        }
        if (slug) setAlbumSlug(slug);
      }
    });
  }, []);

  useEffect(() => {
    if (!albumSlug) return;
    QRCode.toDataURL(`${SITE_URL}/album/${albumSlug}`, {
      width: 200,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [albumSlug]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPausedRef.current) setCurrentTemplate((prev) => (prev + 1) % TEMPLATES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const displayNames =
    isLoggedIn && isMarie && prenom1
      ? prenom2 ? `${prenom1} & ${prenom2}` : prenom1
      : "Prénom1 & Prénom2";

  function getCadreHref() {
    if (isLoggedIn === null) return "#";
    if (!isLoggedIn || !isMarie) return "/inscription?redirect=/boutique";
    const templateId = TEMPLATES[currentTemplate].id;
    return `/dashboard/marie/album-photo/commander-cadre?template=${templateId}&couleur=${encodeURIComponent(frameColor)}`;
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section
        className="relative pt-32 pb-20 px-4"
        style={{
          background: "linear-gradient(135deg, #FFF8F5 0%, #FDF4FF 50%, #F8FAFF 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: "#FDE8F0", color: "#F06292" }}
          >
            Boutique mariage
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Des souvenirs gravés
            <br />
            <span style={{ color: "#F06292" }}>pour toujours</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
            Personnalisez vos supports QR Code et recevez-les chez vous. Posez-les le jour J,
            collectez chaque souvenir de vos invités.
          </p>
        </div>
      </section>

      {/* Photo réaliste pleine largeur */}
      <section>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/blog/1777310770358-good.png"
          alt="Exemple de rendu sur une table de mariage"
          style={{ width: "100%", height: 500, objectFit: "cover", objectPosition: "center", display: "block" }}
        />
        <p className="text-center text-xs text-gray-400 py-3">
          Exemple de rendu sur votre table de mariage
        </p>
      </section>

      {/* Products */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* === Cadre QR Code — Slider interactif === */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid #EBEBEB",
              background: "#fff",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex flex-col md:flex-row">

              {/* Slider — 55% */}
              <div
                className="relative flex-none w-full md:w-[55%]"
                style={{ minHeight: 460, background: "linear-gradient(145deg, #F5F0E8 0%, #EDE5D4 100%)" }}
                onMouseEnter={() => { isPausedRef.current = true; }}
                onMouseLeave={() => { isPausedRef.current = false; }}
              >
                {/* Frame + images + overlays */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ padding: "48px 40px 72px" }}>
                  <div
                    style={{
                      border: `12px solid ${frameColor}`,
                      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                      borderRadius: 4,
                      position: "relative",
                      width: "100%",
                      maxWidth: 280,
                      aspectRatio: "3 / 4",
                      overflow: "hidden",
                      transition: "border-color 0.4s ease",
                    }}
                  >
                    {/* Background images */}
                    {TEMPLATES.map((tpl, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={tpl.url}
                        alt={tpl.name}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: currentTemplate === i ? 1 : 0,
                          transition: "opacity 0.8s ease-in-out",
                        }}
                      />
                    ))}

                    {/* Template overlays */}
                    {TEMPLATES.map((tpl, i) => (
                      <div
                        key={`overlay-${i}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: currentTemplate === i ? 1 : 0,
                          transition: "opacity 0.8s ease-in-out",
                          pointerEvents: "none",
                        }}
                      >
                        <SliderOverlay
                          templateId={tpl.id}
                          names={displayNames}
                          qrDataUrl={qrDataUrl}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template name */}
                <div
                  className="absolute left-0 right-0 text-center"
                  style={{ bottom: 40 }}
                >
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#9CA3AF", letterSpacing: "0.06em" }}
                  >
                    {TEMPLATES[currentTemplate].name}
                  </span>
                </div>

                {/* Dots */}
                <div
                  className="absolute left-0 right-0 flex justify-center gap-2"
                  style={{ bottom: 18 }}
                >
                  {TEMPLATES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTemplate(i)}
                      aria-label={`Template ${i + 1}`}
                      style={{
                        width: currentTemplate === i ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: currentTemplate === i ? "#F06292" : "#D1D5DB",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Info — 45% */}
              <div
                className="flex-none w-full md:w-[45%] flex flex-col justify-center"
                style={{ padding: "40px 36px" }}
              >
                {/* Badge */}
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full self-start mb-5"
                  style={{ background: "#FDE8F0", color: "#F06292", letterSpacing: "0.02em" }}
                >
                  Bestseller 🔥
                </span>

                <h2
                  className="font-bold text-gray-900 mb-2 leading-snug"
                  style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.4rem, 3vw, 1.8rem)" }}
                >
                  Cadre QR Code personnalisé
                </h2>
                <p className="text-sm mb-8" style={{ color: "#9CA3AF" }}>
                  4 designs élégants • Livraison 5–7 jours
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className="font-bold text-gray-900" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
                    39,90€
                  </span>
                  <span className="text-sm ml-2" style={{ color: "#9CA3AF" }}>
                    TTC livraison incluse
                  </span>
                </div>

                {/* Color picker */}
                <div className="mb-8">
                  <p
                    className="text-xs font-semibold uppercase mb-3"
                    style={{ color: "#9CA3AF", letterSpacing: "0.1em" }}
                  >
                    Couleur du cadre
                  </p>
                  <div className="flex gap-3 items-center">
                    {FRAME_COLORS.map((fc) => (
                      <button
                        key={fc.color}
                        onClick={() => setFrameColor(fc.color)}
                        title={fc.label}
                        aria-label={`Cadre ${fc.label}`}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: fc.color,
                          outline: frameColor === fc.color ? "3px solid #F06292" : "3px solid transparent",
                          outlineOffset: 3,
                          border: fc.isLight ? "1.5px solid #D1D5DB" : "1.5px solid transparent",
                          cursor: "pointer",
                          transition: "outline 0.2s ease, transform 0.15s ease",
                          transform: frameColor === fc.color ? "scale(1.15)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Prénoms affichés */}
                {isLoggedIn && isMarie && prenom1 && (
                  <p className="text-xs mb-6" style={{ color: "#9CA3AF" }}>
                    Aperçu personnalisé pour{" "}
                    <span className="font-semibold text-gray-700">{displayNames}</span>
                  </p>
                )}

                {/* CTA */}
                <Link
                  href={getCadreHref()}
                  className="block w-full text-center rounded-2xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#F06292", fontSize: 15, padding: "16px 0" }}
                >
                  {isLoggedIn && isMarie ? "Commander le cadre →" : "Commander →"}
                </Link>

                {!isLoggedIn && isLoggedIn !== null && (
                  <p className="text-xs text-center mt-3" style={{ color: "#9CA3AF" }}>
                    Déjà inscrit ?{" "}
                    <Link href="/connexion?redirect=/boutique" className="underline" style={{ color: "#F06292" }}>
                      Connectez-vous
                    </Link>{" "}
                    pour voir votre aperçu personnalisé
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 px-4" style={{ background: "#FAFAF8" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12" style={{ fontFamily: "Georgia, serif" }}>
            Comment ça marche
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CadreIcon />,
                step: "1",
                title: "Choisissez votre design",
                desc: "4 designs élégants — sélectionnez le template qui correspond à votre décoration et la couleur de cadre.",
              },
              {
                icon: <PersonIcon />,
                step: "2",
                title: "On personnalise avec vos prénoms",
                desc: "Votre QR Code et vos prénoms sont imprimés sur mesure selon le design de votre album.",
              },
              {
                icon: <TruckIcon />,
                step: "3",
                title: "Recevez chez vous et posez le jour J",
                desc: "Livraison en 5–7 jours ouvrés. Il ne reste plus qu'à poser sur vos tables le matin du mariage.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#FDE8F0", color: "#F06292" }}
                >
                  {item.icon}
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Étape {item.step}</p>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12" style={{ fontFamily: "Georgia, serif" }}>
            Ils nous ont fait confiance
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6"
                style={{ background: "#FAFAF8", border: "1px solid #EBEBEB" }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" style={{ color: "#F59E0B" }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4" style={{ background: "linear-gradient(135deg, #FFF0F5 0%, #F5F0FF 100%)" }}>
        <div className="max-w-xl mx-auto text-center">
          <p className="text-gray-600 text-base">
            Déjà inscrit ?{" "}
            <Link
              href="/dashboard/marie/album-photo"
              className="font-semibold underline underline-offset-2"
              style={{ color: "#F06292" }}
            >
              Accédez à votre boutique personnalisée →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
