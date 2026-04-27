"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
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

interface Template {
  id: TemplateId;
  name: string;
  description: string;
  bg: string;
  accent: string;
  textColor: string;
}

const TEMPLATES: Template[] = [
  {
    id: "elegance-doree",
    name: "Élégance Dorée",
    description: "Classique & raffiné",
    bg: "#FAFAF8",
    accent: "#C9A84C",
    textColor: "#1a1a1a",
  },
  {
    id: "boheme-rose",
    name: "Bohème Rose",
    description: "Romantique & poétique",
    bg: "#FDF6F0",
    accent: "#F06292",
    textColor: "#c2185b",
  },
  {
    id: "moderne-minimaliste",
    name: "Moderne Minimaliste",
    description: "Épuré & luxueux",
    bg: "#FFFFFF",
    accent: "#111111",
    textColor: "#111111",
  },
  {
    id: "nuit-romantique",
    name: "Nuit Romantique",
    description: "Chic & mystérieux",
    bg: "#1C1C1E",
    accent: "#C9A84C",
    textColor: "#C9A84C",
  },
];

// ── Template renderers ────────────────────────────────────────────────────────

function EleganceDoree({
  names,
  qrDataUrl,
}: {
  names: string;
  qrDataUrl: string | null;
}) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: "#FAFAF8",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 16,
          border: "2px solid #C9A84C",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 26,
          border: "1px solid rgba(201,168,76,0.45)",
          pointerEvents: "none",
        }}
      />
      {/* Corner ornaments */}
      {(
        [
          { top: 10, left: 10 },
          { top: 10, right: 10 },
          { bottom: 10, left: 10 },
          { bottom: 10, right: 10 },
        ] as React.CSSProperties[]
      ).map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            color: "#C9A84C",
            fontSize: 18,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ✦
        </div>
      ))}
      <div
        style={{
          textAlign: "center",
          padding: "0 72px",
          width: "100%",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.35em",
            color: "#C9A84C",
            textTransform: "uppercase" as const,
            marginBottom: 14,
            fontStyle: "italic",
          }}
        >
          Mariage de
        </p>
        <p
          style={{
            fontSize: 40,
            fontWeight: "bold",
            color: "#1a1a1a",
            marginBottom: 6,
            lineHeight: 1.15,
          }}
        >
          {names}
        </p>
        <div
          style={{
            width: 72,
            height: 1,
            background: "#C9A84C",
            margin: "18px auto 36px",
          }}
        />
        {qrDataUrl ? (
          <div
            style={{
              width: 216,
              height: 216,
              margin: "0 auto",
              border: "3px solid #C9A84C",
              padding: 8,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={196} height={196} alt="QR Code album" />
          </div>
        ) : (
          <div
            style={{
              width: 216,
              height: 216,
              margin: "0 auto",
              border: "3px solid #C9A84C",
              background: "#f5f0e8",
            }}
          />
        )}
        <div
          style={{
            width: 72,
            height: 1,
            background: "#C9A84C",
            margin: "30px auto 18px",
          }}
        />
        <p
          style={{
            fontSize: 10,
            color: "#999",
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
          }}
        >
          Scannez pour partager vos photos
        </p>
        <p
          style={{
            fontSize: 10,
            color: "#C9A84C",
            letterSpacing: "0.28em",
            marginTop: 8,
            textTransform: "uppercase" as const,
          }}
        >
          instantmariage.fr
        </p>
      </div>
    </div>
  );
}

function BohemeRose({
  names,
  qrDataUrl,
}: {
  names: string;
  qrDataUrl: string | null;
}) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: "#FDF6F0",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: "hidden",
      }}
    >
      {/* Corner blobs */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(240,98,146,0.28) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,167,38,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(240,98,146,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,167,38,0.14) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          textAlign: "center",
          padding: "0 72px",
          width: "100%",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "#F06292",
            fontStyle: "italic",
            marginBottom: 10,
            letterSpacing: "0.05em",
          }}
        >
          Mariage de
        </p>
        <p
          style={{
            fontSize: 44,
            color: "#F06292",
            fontWeight: "bold",
            fontStyle: "italic",
            marginBottom: 10,
            lineHeight: 1.15,
          }}
        >
          {names}
        </p>
        <div
          style={{
            width: 60,
            height: 2,
            borderRadius: 2,
            background: "linear-gradient(90deg, #F06292, #ffb6c1)",
            margin: "0 auto 38px",
          }}
        />
        {qrDataUrl ? (
          <div
            style={{
              width: 220,
              height: 220,
              margin: "0 auto",
              background: "#FDE8F0",
              borderRadius: 20,
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={196} height={196} alt="QR Code album" />
          </div>
        ) : (
          <div
            style={{
              width: 220,
              height: 220,
              margin: "0 auto",
              background: "#FDE8F0",
              borderRadius: 20,
            }}
          />
        )}
        <p
          style={{
            fontSize: 11,
            color: "#F06292",
            letterSpacing: "0.15em",
            marginTop: 28,
            fontStyle: "italic",
          }}
        >
          Scannez pour partager vos photos
        </p>
        <p
          style={{
            fontSize: 10,
            color: "#f8a4c8",
            letterSpacing: "0.2em",
            marginTop: 8,
            textTransform: "uppercase" as const,
          }}
        >
          instantmariage.fr
        </p>
      </div>
    </div>
  );
}

function ModerneMinimaliste({
  names,
  qrDataUrl,
}: {
  names: string;
  qrDataUrl: string | null;
}) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: "#FFFFFF",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 44,
          right: 44,
          height: 2,
          background: "#111",
        }}
      />
      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 44,
          right: 44,
          height: 2,
          background: "#111",
        }}
      />
      <div
        style={{
          textAlign: "center",
          padding: "0 72px",
          width: "100%",
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.55em",
            color: "#444",
            textTransform: "uppercase" as const,
            marginBottom: 24,
            fontWeight: 400,
          }}
        >
          MARIAGE DE
        </p>
        <p
          style={{
            fontSize: 38,
            fontWeight: 300,
            color: "#111",
            letterSpacing: "0.12em",
            marginBottom: 40,
            textTransform: "uppercase" as const,
            lineHeight: 1.25,
          }}
        >
          {names.toUpperCase()}
        </p>
        {qrDataUrl ? (
          <div
            style={{
              width: 210,
              height: 210,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={210} height={210} alt="QR Code album" />
          </div>
        ) : (
          <div
            style={{ width: 210, height: 210, margin: "0 auto", background: "#f0f0f0" }}
          />
        )}
        <p
          style={{
            fontSize: 9,
            color: "#999",
            letterSpacing: "0.45em",
            marginTop: 32,
            textTransform: "uppercase" as const,
          }}
        >
          SCANNEZ POUR PARTAGER VOS PHOTOS
        </p>
        <p
          style={{
            fontSize: 9,
            color: "#111",
            letterSpacing: "0.35em",
            marginTop: 10,
            textTransform: "uppercase" as const,
          }}
        >
          INSTANTMARIAGE.FR
        </p>
      </div>
    </div>
  );
}

function NuitRomantique({
  names,
  qrDataUrl,
}: {
  names: string;
  qrDataUrl: string | null;
}) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: "#1C1C1E",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 18,
          border: "1px solid #C9A84C",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 26,
          border: "1px solid rgba(201,168,76,0.25)",
          pointerEvents: "none",
        }}
      />
      {/* Corner ornaments */}
      {(
        [
          { top: 12, left: 12 },
          { top: 12, right: 12 },
          { bottom: 12, left: 12 },
          { bottom: 12, right: 12 },
        ] as React.CSSProperties[]
      ).map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            color: "#C9A84C",
            fontSize: 16,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ✦
        </div>
      ))}
      <div
        style={{
          textAlign: "center",
          padding: "0 72px",
          width: "100%",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.35em",
            color: "#C9A84C",
            textTransform: "uppercase" as const,
            marginBottom: 14,
            fontStyle: "italic",
          }}
        >
          Mariage de
        </p>
        <p
          style={{
            fontSize: 40,
            fontWeight: "bold",
            color: "#C9A84C",
            marginBottom: 6,
            lineHeight: 1.15,
          }}
        >
          {names}
        </p>
        <div
          style={{
            width: 72,
            height: 1,
            background: "#C9A84C",
            margin: "18px auto 36px",
          }}
        />
        {qrDataUrl ? (
          <div
            style={{
              width: 216,
              height: 216,
              margin: "0 auto",
              background: "#ffffff",
              padding: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={196} height={196} alt="QR Code album" />
          </div>
        ) : (
          <div
            style={{
              width: 216,
              height: 216,
              margin: "0 auto",
              background: "#2c2c2e",
            }}
          />
        )}
        <div
          style={{
            width: 72,
            height: 1,
            background: "#C9A84C",
            margin: "30px auto 18px",
          }}
        />
        <p
          style={{
            fontSize: 10,
            color: "rgba(201,168,76,0.7)",
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
          }}
        >
          Scannez pour partager vos photos
        </p>
        <p
          style={{
            fontSize: 10,
            color: "#C9A84C",
            letterSpacing: "0.28em",
            marginTop: 8,
            textTransform: "uppercase" as const,
          }}
        >
          instantmariage.fr
        </p>
      </div>
    </div>
  );
}

function TemplateContent({
  id,
  names,
  qrDataUrl,
}: {
  id: TemplateId;
  names: string;
  qrDataUrl: string | null;
}) {
  if (id === "elegance-doree")
    return <EleganceDoree names={names} qrDataUrl={qrDataUrl} />;
  if (id === "boheme-rose")
    return <BohemeRose names={names} qrDataUrl={qrDataUrl} />;
  if (id === "moderne-minimaliste")
    return <ModerneMinimaliste names={names} qrDataUrl={qrDataUrl} />;
  return <NuitRomantique names={names} qrDataUrl={qrDataUrl} />;
}

// ── Main page ─────────────────────────────────────────────────────────────────

function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [marieId, setMarieId] = useState<string | null>(null);
  const [prenom1, setPrenom1] = useState("");
  const [prenom2, setPrenom2] = useState<string | null>(null);
  const [albumSlug, setAlbumSlug] = useState<string | null>(null);
  const [templateAchete, setTemplateAchete] = useState<string | null>(null);
  const [templateExpireAt, setTemplateExpireAt] = useState<string | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("elegance-doree");

  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  const isSuccess = searchParams.get("success") === "true";

  // Fetch marié data
  const fetchMarie = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("maries")
      .select(
        "id, prenom_marie1, prenom_marie2, album_slug, qrcode_template_achete, qrcode_template_expire_at"
      )
      .eq("user_id", uid)
      .single();

    if (data) {
      setMarieId(data.id);
      setPrenom1(data.prenom_marie1 ?? "");
      setPrenom2(data.prenom_marie2 ?? null);
      setAlbumSlug(data.album_slug ?? null);
      setTemplateAchete(data.qrcode_template_achete ?? null);
      setTemplateExpireAt(data.qrcode_template_expire_at ?? null);
    }
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setUserId(session.user.id);
      await fetchMarie(session.user.id);
      setAuthChecked(true);
    });
  }, [router, fetchMarie]);

  // Poll after success until webhook fires
  useEffect(() => {
    if (!isSuccess || !authChecked || !userId) return;
    setShowSuccess(true);
    if (templateAchete) return;

    setPendingConfirmation(true);
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from("maries")
        .select("qrcode_template_achete, qrcode_template_expire_at")
        .eq("user_id", userId)
        .single();

      if (data?.qrcode_template_achete) {
        setTemplateAchete(data.qrcode_template_achete);
        setTemplateExpireAt(data.qrcode_template_expire_at ?? null);
        setPendingConfirmation(false);
        clearInterval(poll);
      } else if (attempts >= 6) {
        setPendingConfirmation(false);
        clearInterval(poll);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [isSuccess, authChecked, userId, templateAchete]);

  // Generate QR code
  useEffect(() => {
    if (!albumSlug) return;
    QRCode.toDataURL(`${SITE_URL}/album/${albumSlug}`, {
      width: 300,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [albumSlug]);

  // Responsive preview scale via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? A4_W;
      setPreviewScale(w / A4_W);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [authChecked]);

  const isUnlocked = Boolean(
    templateAchete &&
      (!templateExpireAt || new Date(templateExpireAt) > new Date())
  );

  const handleCheckout = async () => {
    if (!marieId || paying) return;
    setPaying(true);
    try {
      const res = await fetch("/api/marie/qrcode-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate, marieId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setPaying(false);
    }
  };

  const downloadPDF = useCallback(async () => {
    if (!previewRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`carte-qrcode-${selectedTemplate}.pdf`);
    } catch (e) {
      console.error("[downloadPDF]", e);
    } finally {
      setDownloading(false);
    }
  }, [downloading, selectedTemplate]);

  if (!authChecked) return null;

  const names =
    prenom1 || prenom2
      ? prenom2
        ? `${prenom1} & ${prenom2}`
        : prenom1
      : "Prénom 1 & Prénom 2";

  const expireFormatted = templateExpireAt
    ? new Date(templateExpireAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const selectedConfig = TEMPLATES.find((t) => t.id === selectedTemplate)!;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Back */}
          <div className="pt-10 pb-8">
            <Link
              href="/dashboard/marie/album-photo"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Album photo
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1
                className="text-3xl font-semibold text-gray-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Carte QR Code pour vos invités
              </h1>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "#FEFAEC",
                  color: "#A07820",
                  border: "1px solid #EDD96A",
                }}
              >
                9,90€ — accès illimité 12 mois
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Choisissez votre design et téléchargez votre carte A4 prête à imprimer
            </p>
          </div>

          {/* Success banner */}
          {showSuccess && (
            <div
              className="mb-8 rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "#10B981" }}
              >
                {pendingConfirmation ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div>
                {pendingConfirmation ? (
                  <>
                    <p className="text-sm font-semibold text-green-800">
                      Paiement reçu !
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Activation de votre accès en cours…
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-green-800">
                      Accès débloqué avec succès !
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Sélectionnez votre design et téléchargez votre carte PDF.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* No album yet */}
          {!albumSlug && (
            <div className="flex flex-col items-center text-center py-24">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
                <svg
                  className="w-7 h-7 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z"
                  />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-700 mb-1">
                Créez d&apos;abord votre album photo
              </p>
              <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                Votre QR Code est généré depuis votre album collaboratif. Créez-le
                en quelques secondes.
              </p>
              <Link
                href="/dashboard/marie/album-photo"
                className="px-7 py-3 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              >
                Créer mon album
              </Link>
            </div>
          )}

          {/* Main layout */}
          {albumSlug && (
            <>
            <div className="grid lg:grid-cols-5 gap-10 items-start">

              {/* ── Left: selector + action ─── */}
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Design
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {TEMPLATES.map((t) => {
                    const isSelected = selectedTemplate === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className="text-left rounded-2xl p-4 transition-all"
                        style={{
                          background: t.bg,
                          border: `2px solid ${isSelected ? t.accent : "transparent"}`,
                          boxShadow: isSelected
                            ? `0 0 0 1px ${t.accent}30, 0 2px 8px rgba(0,0,0,0.08)`
                            : "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                      >
                        {/* Mini QR mockup */}
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 4,
                            background:
                              t.id === "nuit-romantique" ? "#fff" : "#f4f4f4",
                            border: `1.5px solid ${t.accent}`,
                            marginBottom: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              background: t.accent,
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: t.textColor,
                            marginBottom: 2,
                          }}
                        >
                          {t.name}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color:
                              t.id === "nuit-romantique"
                                ? "rgba(201,168,76,0.6)"
                                : "#aaa",
                          }}
                        >
                          {t.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Unlocked: expiry info */}
                {isUnlocked && expireFormatted && (
                  <div
                    className="rounded-xl px-4 py-3 mb-5 flex items-center gap-2"
                    style={{
                      background: "#FEFAEC",
                      border: "1px solid #EDD96A",
                    }}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="#A07820"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs" style={{ color: "#A07820" }}>
                      Accès valable jusqu'au{" "}
                      <span className="font-semibold">{expireFormatted}</span>
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {isUnlocked ? (
                  <div className="space-y-3">
                    <button
                      onClick={downloadPDF}
                      disabled={downloading || !qrDataUrl}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#F06292", color: "#fff" }}
                    >
                      {downloading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Génération PDF…
                        </span>
                      ) : (
                        "📄 Format digital — 9,90€"
                      )}
                    </button>
                    <Link
                      href={`/dashboard/marie/album-photo/commander-cadre?template=${selectedTemplate}`}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold block text-center transition-all"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      🖼️ Cadre livré chez vous — 39,90€
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={paying}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#F06292", color: "#fff" }}
                    >
                      {paying ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Redirection…
                        </span>
                      ) : (
                        "📄 Format digital — 9,90€"
                      )}
                    </button>
                    <Link
                      href={`/dashboard/marie/album-photo/commander-cadre?template=${selectedTemplate}`}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold block text-center transition-all"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      🖼️ Cadre livré chez vous — 39,90€
                    </Link>
                    <p className="text-xs text-gray-400 text-center">
                      Format digital : accès illimité 12 mois · Cadre : livraison 5–7 jours
                    </p>
                  </div>
                )}
              </div>

              {/* ── Right: live preview ─── */}
              <div className="lg:col-span-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Aperçu
                </p>

                <div
                  ref={containerRef}
                  className="relative w-full rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: `${A4_W} / ${A4_H}`,
                    boxShadow:
                      "0 2px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.07)",
                  }}
                >
                  <div
                    ref={previewRef}
                    style={{
                      width: A4_W,
                      height: A4_H,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <TemplateContent
                      id={selectedTemplate}
                      names={names}
                      qrDataUrl={qrDataUrl}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Format A4 · 210 × 297 mm · Impression haute qualité
                </p>
              </div>

            </div>

            {/* ── Table mockup section ── */}
            <div className="mt-20">
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Visualisez votre cadre sur votre table
                </p>
                <p className="text-sm text-gray-400">
                  Cadre blanc 15×20 cm + carte QR Code imprimée · livraison 5–7 jours ouvrés
                </p>
              </div>

              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  backgroundImage:
                    "url(https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center 30%",
                  height: 460,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: "rgba(0,0,0,0.18)" }}
                />

                {/* White frame with template */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-1.8deg)",
                    width: 190,
                    height: 253,
                    background: "#ffffff",
                    borderRadius: 3,
                    padding: 10,
                    boxShadow:
                      "0 30px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                      position: "relative",
                      borderRadius: 1,
                    }}
                  >
                    <div
                      style={{
                        width: A4_W,
                        height: A4_H,
                        transform: `scale(${170 / A4_W})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                      <TemplateContent
                        id={selectedTemplate}
                        names={names}
                        qrDataUrl={qrDataUrl}
                      />
                    </div>
                  </div>
                </div>

                {/* Label badge */}
                <div
                  className="absolute bottom-5 left-1/2"
                  style={{ transform: "translateX(-50%)" }}
                >
                  <span
                    className="text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap"
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      color: "#555",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Posé sur votre table de mariage · Se met à jour en temps réel
                  </span>
                </div>
              </div>

              {/* 2 buttons under mockup */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-lg mx-auto">
                {isUnlocked ? (
                  <button
                    onClick={downloadPDF}
                    disabled={downloading || !qrDataUrl}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "#F06292", color: "#fff" }}
                  >
                    {downloading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Génération…
                      </>
                    ) : (
                      "📄 Format digital — 9,90€"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={paying}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "#F06292", color: "#fff" }}
                  >
                    {paying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirection…
                      </>
                    ) : (
                      "📄 Format digital — 9,90€"
                    )}
                  </button>
                )}
                <Link
                  href={`/dashboard/marie/album-photo/commander-cadre?template=${selectedTemplate}`}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 text-center transition-all"
                  style={{ background: "#1a1a1a", color: "#fff" }}
                >
                  🖼️ Cadre livré chez vous — 39,90€
                </Link>
              </div>
            </div>

            </>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense>
      <TemplatesPageContent />
    </Suspense>
  );
}
