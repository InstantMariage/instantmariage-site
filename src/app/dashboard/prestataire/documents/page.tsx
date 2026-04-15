"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import type { PlanAbonnement } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Ligne = {
  id: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  tva: number;
};

type Clause = {
  id: string;
  titre: string;
  contenu: string;
};

type PrestataireInfo = {
  id: string;
  nom_entreprise: string;
  adresse: string;
  telephone: string;
  email: string;
  siret: string;
  avatar_url: string | null;
};

type SavedDoc = {
  id: string;
  type: "devis" | "facture" | "contrat";
  numero: string;
  client_prenom: string | null;
  client_nom: string | null;
  client_email: string | null;
  montant_ttc: number | null;
  statut: "brouillon" | "envoye" | "signe" | "paye";
  created_at: string;
};

type FullDoc = SavedDoc & {
  client_telephone: string | null;
  client_adresse: string | null;
  date_emission: string | null;
  date_mariage: string | null;
  contenu: {
    lignes?: Ligne[];
    acompteType?: "pourcentage" | "montant";
    acompteValeur?: string;
    notes?: string;
    clauses?: Clause[];
  } | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_QUOTA: Record<PlanAbonnement, number | null> = {
  gratuit: 1,
  starter: 5,
  pro: null,
  premium: null,
};

const UPGRADE_INFO: Partial<Record<PlanAbonnement, { label: string; href: string }>> = {
  gratuit: { label: "Passer au Starter", href: "/tarifs" },
  starter: { label: "Passer au Pro", href: "/tarifs" },
};

const DEFAULT_CLAUSES: Clause[] = [
  {
    id: "c1",
    titre: "Objet du contrat",
    contenu:
      "Le présent contrat a pour objet de définir les conditions dans lesquelles le prestataire s'engage à fournir les services décrits ci-dessus pour le mariage des clients à la date mentionnée.",
  },
  {
    id: "c2",
    titre: "Acompte et paiement",
    contenu:
      "Un acompte de 30 % du montant total est exigible à la signature du présent contrat. Le solde sera réglé au plus tard 30 jours avant la date de la prestation. Tout retard de paiement entraîne des pénalités au taux légal en vigueur.",
  },
  {
    id: "c3",
    titre: "Annulation par le client",
    contenu:
      "En cas d'annulation par le client plus de 90 jours avant la prestation, l'acompte reste acquis au prestataire à titre d'indemnisation. En cas d'annulation moins de 90 jours avant, la totalité du montant convenu est due.",
  },
  {
    id: "c4",
    titre: "Annulation par le prestataire",
    contenu:
      "En cas d'empêchement définitif du prestataire (maladie grave, accident ou force majeure), celui-ci s'engage à proposer un remplaçant de qualité équivalente ou à rembourser l'intégralité des sommes versées dans un délai de 30 jours.",
  },
  {
    id: "c5",
    titre: "Responsabilités",
    contenu:
      "Le prestataire s'engage à réaliser sa mission avec tout le soin et la diligence requis par les usages professionnels. Sa responsabilité est limitée au montant de la prestation. Il ne saurait être tenu responsable des dommages indirects ou imprévus.",
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtMoney(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// ─── Statut badge ─────────────────────────────────────────────────────────────

const STATUT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  brouillon: { bg: "#F3F4F6", text: "#6B7280", label: "Brouillon" },
  envoye:    { bg: "#EFF6FF", text: "#3B82F6", label: "Envoyé" },
  signe:     { bg: "#F0FDF4", text: "#16A34A", label: "Signé" },
  paye:      { bg: "#FFF7ED", text: "#EA580C", label: "Payé" },
};

// ─── Preview component ────────────────────────────────────────────────────────

type PreviewProps = {
  docType: "devis" | "facture" | "contrat";
  prestataire: PrestataireInfo;
  clientPrenom: string;
  clientNom: string;
  clientEmail: string;
  clientTelephone: string;
  clientAdresse: string;
  dateMariage: string;
  dateEmission: string;
  numeroDoc: string;
  lignes: Ligne[];
  totals: { ht: number; tva: number; ttc: number };
  acompteType: "pourcentage" | "montant";
  acompteValeur: string;
  acompteAmount: number;
  notes: string;
  clauses: Clause[];
};

function DocumentPreview(props: PreviewProps) {
  const {
    docType, prestataire, clientPrenom, clientNom, clientEmail,
    clientTelephone, clientAdresse, dateMariage, dateEmission,
    numeroDoc, lignes, totals, acompteType, acompteValeur,
    acompteAmount, notes, clauses,
  } = props;

  const TYPE_LABELS = { devis: "DEVIS", facture: "FACTURE", contrat: "CONTRAT" };
  const clientFullName = [clientPrenom, clientNom].filter(Boolean).join(" ") || "Client";

  return (
    <div
      style={{
        background: "#fff",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "12px",
        color: "#1a1a1a",
        padding: "40px 48px",
        minHeight: "842px",
        lineHeight: "1.6",
      }}
    >
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {prestataire.avatar_url && (
            <div style={{ width: "52px", height: "52px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prestataire.avatar_url} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" }}>
              {prestataire.nom_entreprise || "Votre Entreprise"}
            </div>
            {prestataire.adresse && <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{prestataire.adresse}</div>}
            {(prestataire.telephone || prestataire.email) && (
              <div style={{ fontSize: "11px", color: "#6B7280" }}>
                {[prestataire.telephone, prestataire.email].filter(Boolean).join(" · ")}
              </div>
            )}
            {prestataire.siret && (
              <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "1px" }}>SIRET : {prestataire.siret}</div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#F06292",
              letterSpacing: "-0.5px",
            }}
          >
            {TYPE_LABELS[docType]}
          </div>
          <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>N° {numeroDoc || "—"}</div>
          <div style={{ fontSize: "11px", color: "#6B7280" }}>Émis le {fmtDate(dateEmission)}</div>
          {dateMariage && (
            <div style={{ fontSize: "11px", color: "#6B7280" }}>Mariage le {fmtDate(dateMariage)}</div>
          )}
        </div>
      </div>

      {/* Séparateur rose */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, #F06292, #F8BBD0)", borderRadius: "1px", marginBottom: "28px" }} />

      {/* Parties */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
            Prestataire
          </div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#111" }}>{prestataire.nom_entreprise || "—"}</div>
          {prestataire.adresse && <div style={{ color: "#4B5563", fontSize: "11px" }}>{prestataire.adresse}</div>}
          {prestataire.telephone && <div style={{ color: "#4B5563", fontSize: "11px" }}>{prestataire.telephone}</div>}
          {prestataire.email && <div style={{ color: "#4B5563", fontSize: "11px" }}>{prestataire.email}</div>}
          {prestataire.siret && <div style={{ color: "#9CA3AF", fontSize: "10px", marginTop: "2px" }}>SIRET : {prestataire.siret}</div>}
        </div>
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
            Client
          </div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#111" }}>{clientFullName}</div>
          {clientAdresse && <div style={{ color: "#4B5563", fontSize: "11px" }}>{clientAdresse}</div>}
          {clientTelephone && <div style={{ color: "#4B5563", fontSize: "11px" }}>{clientTelephone}</div>}
          {clientEmail && <div style={{ color: "#4B5563", fontSize: "11px" }}>{clientEmail}</div>}
        </div>
      </div>

      {/* Tableau prestations (devis / facture) */}
      {docType !== "contrat" && (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ background: "#FFF0F5" }}>
                <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", borderRadius: "4px 0 0 4px" }}>
                  Description
                </th>
                <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", width: "60px" }}>
                  Qté
                </th>
                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", width: "90px" }}>
                  Prix HT
                </th>
                <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", width: "60px" }}>
                  TVA
                </th>
                <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", width: "90px", borderRadius: "0 4px 4px 0" }}>
                  Prix TTC
                </th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "9px 10px", color: "#374151", fontSize: "11px" }}>
                    {l.description || <span style={{ color: "#D1D5DB" }}>Prestation</span>}
                  </td>
                  <td style={{ padding: "9px 10px", textAlign: "center", color: "#374151", fontSize: "11px" }}>{l.quantite}</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", color: "#374151", fontSize: "11px" }}>{fmtMoney(l.prixUnitaire)}</td>
                  <td style={{ padding: "9px 10px", textAlign: "center", color: "#6B7280", fontSize: "11px" }}>{l.tva} %</td>
                  <td style={{ padding: "9px 10px", textAlign: "right", color: "#374151", fontSize: "11px", fontWeight: "600" }}>
                    {fmtMoney(l.quantite * l.prixUnitaire)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
            <div style={{ minWidth: "240px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "#6B7280", borderBottom: "1px solid #F3F4F6" }}>
                <span>Total HT</span><span>{fmtMoney(totals.ht)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "#6B7280", borderBottom: "1px solid #F3F4F6" }}>
                <span>TVA</span><span>{fmtMoney(totals.tva)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#fff", background: "#F06292", borderRadius: "8px", marginTop: "4px" }}>
                <span>Total TTC</span><span>{fmtMoney(totals.ttc)}</span>
              </div>
              {parseFloat(acompteValeur) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "#F06292", marginTop: "6px" }}>
                  <span>Acompte ({acompteType === "pourcentage" ? `${acompteValeur} %` : "montant fixe"})</span>
                  <span style={{ fontWeight: "600" }}>{fmtMoney(acompteAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Clauses contrat */}
      {docType === "contrat" && (
        <div style={{ marginBottom: "24px" }}>
          {clauses.map((c, i) => (
            <div key={c.id} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#F06292", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Article {i + 1} — {c.titre}
              </div>
              <div style={{ fontSize: "11px", color: "#4B5563", lineHeight: "1.7" }}>{c.contenu}</div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{ background: "#FAFAFA", borderLeft: "3px solid #F8BBD0", padding: "12px 14px", borderRadius: "0 6px 6px 0", marginBottom: "24px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>
            Notes & Conditions
          </div>
          <div style={{ fontSize: "11px", color: "#4B5563", whiteSpace: "pre-wrap" }}>{notes}</div>
        </div>
      )}

      {/* Signature */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "32px" }}>
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "40px" }}>
            Signature du prestataire
          </div>
          <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "6px", fontSize: "10px", color: "#9CA3AF" }}>
            {prestataire.nom_entreprise}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "9px", fontWeight: "700", color: "#F06292", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "40px" }}>
            Signature du client — Lu et approuvé
          </div>
          <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "6px", fontSize: "10px", color: "#9CA3AF" }}>
            {clientFullName}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div style={{ marginTop: "40px", paddingTop: "12px", borderTop: "1px solid #F3F4F6", textAlign: "center", fontSize: "10px", color: "#D1D5DB" }}>
        {prestataire.nom_entreprise}
        {prestataire.siret && <> · SIRET {prestataire.siret}</>}
        {prestataire.email && <> · {prestataire.email}</>}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Auth & prestataire
  const [authChecked, setAuthChecked] = useState(false);
  const [prestataire, setPrestataire] = useState<PrestataireInfo | null>(null);
  const [plan, setPlan] = useState<PlanAbonnement>("gratuit");

  // Quota
  const [docsThisMonth, setDocsThisMonth] = useState(0);

  // Formulaire
  const [docType, setDocType] = useState<"devis" | "facture" | "contrat">("devis");
  const [clientPrenom, setClientPrenom] = useState("");
  const [clientNom, setClientNom] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [dateMariage, setDateMariage] = useState("");
  const [dateEmission, setDateEmission] = useState(todayStr());
  const [numeroDoc, setNumeroDoc] = useState("");
  const [lignes, setLignes] = useState<Ligne[]>([
    { id: uid(), description: "", quantite: 1, prixUnitaire: 0, tva: 20 },
  ]);
  const [acompteType, setAcompteType] = useState<"pourcentage" | "montant">("pourcentage");
  const [acompteValeur, setAcompteValeur] = useState("30");
  const [notes, setNotes] = useState("");
  const [clauses, setClauses] = useState<Clause[]>(DEFAULT_CLAUSES);

  // Vue
  const [view, setView] = useState<"form" | "list">("form");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Liste documents
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [filterType, setFilterType] = useState<"all" | "devis" | "facture" | "contrat">("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [docsLoading, setDocsLoading] = useState(false);

  // Téléchargement PDF depuis la liste
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadDoc, setDownloadDoc] = useState<FullDoc | null>(null);

  // ── Chargement initial ────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const uid_val = session.user.id;

      const { data: prest } = await supabase
        .from("prestataires")
        .select("id, nom_entreprise, adresse, telephone, email_contact, siret, avatar_url")
        .eq("user_id", uid_val)
        .single();

      if (!prest) { router.replace("/login"); return; }

      const avatarUrl = prest.avatar_url
        ? prest.avatar_url.startsWith("http")
          ? prest.avatar_url
          : `https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/photos/${prest.avatar_url}`
        : null;

      setPrestataire({
        id: prest.id,
        nom_entreprise: prest.nom_entreprise || "",
        adresse: prest.adresse || "",
        telephone: prest.telephone || "",
        email: prest.email_contact || session.user.email || "",
        siret: prest.siret || "",
        avatar_url: avatarUrl,
      });

      // Plan
      const { data: abo } = await supabase
        .from("abonnements")
        .select("plan, statut")
        .eq("prestataire_id", prest.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      const currentPlan = (abo?.statut === "actif" ? abo.plan : "gratuit") as PlanAbonnement;
      setPlan(currentPlan);

      // Quota mensuel
      const start = new Date();
      start.setDate(1); start.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("documents_prestataire")
        .select("*", { count: "exact", head: true })
        .eq("prestataire_id", prest.id)
        .gte("created_at", start.toISOString());
      setDocsThisMonth(count ?? 0);

      // Numéro auto
      const year = new Date().getFullYear();
      const { count: cntDevis } = await supabase
        .from("documents_prestataire")
        .select("*", { count: "exact", head: true })
        .eq("prestataire_id", prest.id)
        .eq("type", "devis")
        .gte("created_at", `${year}-01-01`);
      setNumeroDoc(`DEV-${year}-${String((cntDevis ?? 0) + 1).padStart(3, "0")}`);

      setAuthChecked(true);
    });
  }, [router]);

  // Mise à jour du numéro quand le type change
  useEffect(() => {
    if (!prestataire || !authChecked) return;
    const prefixes = { devis: "DEV", facture: "FAC", contrat: "CTR" };
    const year = new Date().getFullYear();
    supabase
      .from("documents_prestataire")
      .select("*", { count: "exact", head: true })
      .eq("prestataire_id", prestataire.id)
      .eq("type", docType)
      .gte("created_at", `${year}-01-01`)
      .then(({ count }) => {
        setNumeroDoc(`${prefixes[docType]}-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`);
      });
  }, [docType, prestataire, authChecked]);

  // Chargement des documents sauvegardés
  const loadDocs = useCallback(async () => {
    if (!prestataire) return;
    setDocsLoading(true);
    const { data } = await supabase
      .from("documents_prestataire")
      .select("id, type, numero, client_prenom, client_nom, client_email, montant_ttc, statut, created_at")
      .eq("prestataire_id", prestataire.id)
      .order("created_at", { ascending: false });
    setSavedDocs((data as SavedDoc[]) ?? []);
    setDocsLoading(false);
  }, [prestataire]);

  useEffect(() => {
    if (view === "list" && prestataire) loadDocs();
  }, [view, prestataire, loadDocs]);

  // Génère le PDF depuis le preview caché une fois qu'il est monté dans le DOM
  useEffect(() => {
    if (!downloadDoc || !downloadRef.current || !prestataire) return;
    const el = downloadRef.current;
    const doc = downloadDoc;
    const avatarUrl = prestataire.avatar_url;

    // Petit délai pour s'assurer que le DOM est peint
    const timer = setTimeout(async () => {
      try {
        let logoBase64: string | null = null;
        if (avatarUrl) {
          try {
            const res = await fetch(avatarUrl, { mode: "cors" });
            const blob = await res.blob();
            logoBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch { /* logo non disponible */ }
        }

        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
          import("html2canvas"),
          import("jspdf"),
        ]);

        const imgEl = el.querySelector("img") as HTMLImageElement | null;
        const originalSrc = imgEl?.src ?? null;
        if (imgEl && logoBase64) {
          imgEl.src = logoBase64;
          await new Promise<void>((resolve) => {
            if (imgEl.complete) { resolve(); return; }
            imgEl.onload = () => resolve();
            imgEl.onerror = () => resolve();
          });
        }

        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
        });

        if (imgEl && originalSrc !== null) imgEl.src = originalSrc;

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        const imgH = pw / ratio;

        if (imgH <= ph) {
          pdf.addImage(imgData, "PNG", 0, 0, pw, imgH);
        } else if (imgH <= ph * 1.12) {
          pdf.addImage(imgData, "PNG", 0, 0, pw, ph);
        } else {
          const MIN_LAST_PAGE = 35;
          let offset = 0;
          let remaining = imgH;
          while (remaining > 0) {
            const afterThisPage = remaining - ph;
            if (afterThisPage > 0 && afterThisPage < MIN_LAST_PAGE) {
              const thisPageH = remaining - MIN_LAST_PAGE;
              pdf.addImage(imgData, "PNG", 0, -offset, pw, imgH);
              offset += thisPageH;
              remaining = MIN_LAST_PAGE;
              pdf.addPage();
              pdf.addImage(imgData, "PNG", 0, -offset, pw, imgH);
              remaining = 0;
            } else {
              pdf.addImage(imgData, "PNG", 0, -offset, pw, imgH);
              offset += ph;
              remaining -= ph;
              if (remaining > 0) pdf.addPage();
            }
          }
        }

        const typeLabels = { devis: "Devis", facture: "Facture", contrat: "Contrat" };
        pdf.save(`${typeLabels[doc.type]}_${doc.client_nom || "Client"}_${doc.numero}.pdf`);
      } finally {
        setDownloadDoc(null);
        setDownloadingDocId(null);
      }
    }, 120);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloadDoc]);

  // ── Calculs ───────────────────────────────────────────────────────────────

  const totals = lignes.reduce(
    (acc, l) => {
      const ht = l.quantite * l.prixUnitaire;
      const tva = (ht * l.tva) / 100;
      return { ht: acc.ht + ht, tva: acc.tva + tva, ttc: acc.ttc + ht + tva };
    },
    { ht: 0, tva: 0, ttc: 0 }
  );

  const acompteAmount = (() => {
    const v = parseFloat(acompteValeur) || 0;
    if (acompteType === "pourcentage") return (totals.ttc * v) / 100;
    return v;
  })();

  const quota = DOC_QUOTA[plan];
  const quotaReached = quota !== null && docsThisMonth >= quota;
  const upgradeInfo = UPGRADE_INFO[plan];

  const filteredDocs = savedDocs.filter((d) => {
    if (filterType !== "all" && d.type !== filterType) return false;
    if (filterStatut !== "all" && d.statut !== filterStatut) return false;
    return true;
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  function addLigne() {
    setLignes((prev) => [...prev, { id: uid(), description: "", quantite: 1, prixUnitaire: 0, tva: 20 }]);
  }

  function removeLigne(id: string) {
    if (lignes.length === 1) return;
    setLignes((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLigne(id: string, field: keyof Omit<Ligne, "id">, value: string | number) {
    setLignes((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  async function handleSave() {
    if (!prestataire || quotaReached) return;
    setSaving(true);
    try {
      await supabase.from("documents_prestataire").insert({
        prestataire_id: prestataire.id,
        type: docType,
        numero: numeroDoc,
        client_prenom: clientPrenom,
        client_nom: clientNom,
        client_email: clientEmail,
        client_telephone: clientTelephone,
        client_adresse: clientAdresse,
        date_mariage: dateMariage || null,
        date_emission: dateEmission,
        montant_ht: docType !== "contrat" ? totals.ht : null,
        montant_tva: docType !== "contrat" ? totals.tva : null,
        montant_ttc: docType !== "contrat" ? totals.ttc : null,
        statut: "brouillon",
        contenu: {
          lignes: docType !== "contrat" ? lignes : undefined,
          acompteType: docType !== "contrat" ? acompteType : undefined,
          acompteValeur: docType !== "contrat" ? acompteValeur : undefined,
          notes,
          clauses: docType === "contrat" ? clauses : undefined,
        },
      });
      setDocsThisMonth((prev) => prev + 1);
      setSavedMessage("Document sauvegardé !");
      setTimeout(() => setSavedMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handlePDF() {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      // Charger le logo en base64 pour éviter les erreurs CORS dans html2canvas
      let logoBase64: string | null = null;
      if (prestataire?.avatar_url) {
        try {
          const res = await fetch(prestataire.avatar_url, { mode: "cors" });
          const blob = await res.blob();
          logoBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          // Logo non disponible, on continue sans
        }
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Remplacer temporairement le src du logo par le base64
      const imgEl = previewRef.current.querySelector("img") as HTMLImageElement | null;
      const originalSrc = imgEl?.src ?? null;
      if (imgEl && logoBase64) {
        imgEl.src = logoBase64;
        await new Promise<void>((resolve) => {
          if (imgEl.complete) { resolve(); return; }
          imgEl.onload = () => resolve();
          imgEl.onerror = () => resolve();
        });
      }

      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
      });

      // Restaurer le src original
      if (imgEl && originalSrc !== null) {
        imgEl.src = originalSrc;
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();   // 210 mm
      const ph = pdf.internal.pageSize.getHeight();  // 297 mm
      const ratio = canvas.width / canvas.height;
      const imgH = pw / ratio; // hauteur totale du contenu en mm

      if (imgH <= ph) {
        // Tient sur une seule page
        pdf.addImage(imgData, "PNG", 0, 0, pw, imgH);
      } else if (imgH <= ph * 1.12) {
        // Légèrement plus grand qu'une page : forcer une seule page (réduction ~12% max)
        pdf.addImage(imgData, "PNG", 0, 0, pw, ph);
      } else {
        // Multi-pages : éviter les lignes orphelines en bas de dernière page
        const MIN_LAST_PAGE = 35; // mm minimum sur la dernière page
        let offset = 0;
        let remaining = imgH;

        while (remaining > 0) {
          const afterThisPage = remaining - ph;

          if (afterThisPage > 0 && afterThisPage < MIN_LAST_PAGE) {
            // La dernière page serait trop petite : réduire la page courante
            const thisPageH = remaining - MIN_LAST_PAGE;
            pdf.addImage(imgData, "PNG", 0, -offset, pw, imgH);
            offset += thisPageH;
            remaining = MIN_LAST_PAGE;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, -offset, pw, imgH);
            remaining = 0;
          } else {
            pdf.addImage(imgData, "PNG", 0, -offset, pw, imgH);
            offset += ph;
            remaining -= ph;
            if (remaining > 0) pdf.addPage();
          }
        }
      }

      const typeLabels = { devis: "Devis", facture: "Facture", contrat: "Contrat" };
      pdf.save(`${typeLabels[docType]}_${clientNom || "Client"}_${numeroDoc}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDownloadDoc(docId: string) {
    if (downloadingDocId) return;
    setDownloadingDocId(docId);
    try {
      const { data } = await supabase
        .from("documents_prestataire")
        .select("id, type, numero, client_prenom, client_nom, client_email, client_telephone, client_adresse, date_emission, date_mariage, montant_ttc, statut, created_at, contenu")
        .eq("id", docId)
        .single();
      if (!data) { setDownloadingDocId(null); return; }
      setDownloadDoc(data as FullDoc);
      // PDF généré dans le useEffect dès que downloadRef est monté
    } catch {
      setDownloadingDocId(null);
    }
  }

  async function updateDocStatut(docId: string, newStatut: string) {
    await supabase.from("documents_prestataire").update({ statut: newStatut }).eq("id", docId);
    setSavedDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, statut: newStatut as SavedDoc["statut"] } : d))
    );
  }

  async function deleteDoc(docId: string) {
    if (!confirm("Supprimer ce document ?")) return;
    await supabase.from("documents_prestataire").delete().eq("id", docId);
    setSavedDocs((prev) => prev.filter((d) => d.id !== docId));
  }

  if (!authChecked || !prestataire) return null;

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <div className="pt-16 sm:pt-20 pb-20">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div
          className="px-4 py-8 sm:py-10"
          style={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Link
                    href="/dashboard/prestataire"
                    className="text-rose-200 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                    Mes Documents
                  </h1>
                </div>
                <p className="text-rose-100 text-sm">
                  Devis · Factures · Contrats — générés et sauvegardés directement
                </p>
              </div>

              {/* Compteur quota */}
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
              >
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="text-white font-semibold text-sm leading-none">
                    {quota === null
                      ? `${docsThisMonth} document${docsThisMonth !== 1 ? "s" : ""} ce mois`
                      : `${docsThisMonth} / ${quota} document${quota !== 1 ? "s" : ""} ce mois`}
                  </div>
                  <div className="text-rose-200 text-xs mt-0.5">
                    Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    {quota === null ? " — illimité" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Alerte quota atteint ──────────────────────────────────────── */}
        {quotaReached && upgradeInfo && (
          <div className="px-4 py-3" style={{ background: "#FFF0F5", borderBottom: "1px solid #FECDD3" }}>
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "#9D174D" }}>
                  Quota mensuel atteint ({quota} document{quota !== 1 ? "s" : ""}/mois). Passez au plan supérieur pour continuer.
                </p>
              </div>
              <Link
                href={upgradeInfo.href}
                className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
              >
                {upgradeInfo.label} →
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 pt-6">

          {/* ── Onglets vue ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setView("form")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                view === "form"
                  ? "text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100"
              }`}
              style={view === "form" ? { background: "linear-gradient(135deg, #F06292, #E91E8C)" } : {}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un document
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                view === "list"
                  ? "text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100"
              }`}
              style={view === "list" ? { background: "linear-gradient(135deg, #F06292, #E91E8C)" } : {}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Mes documents
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* VUE : CRÉER UN DOCUMENT                                       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {view === "form" && (
            <div>
              {/* Tabs type de document */}
              <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 w-fit">
                {(["devis", "facture", "contrat"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDocType(t)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                      docType === t ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                    style={docType === t ? { background: "linear-gradient(135deg, #F06292, #E91E8C)" } : {}}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Mobile : onglets édition / aperçu */}
              <div className="flex gap-1 mb-4 lg:hidden bg-gray-100 rounded-xl p-1 w-fit">
                <button
                  onClick={() => setMobileTab("edit")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mobileTab === "edit" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Formulaire
                </button>
                <button
                  onClick={() => setMobileTab("preview")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mobileTab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Aperçu
                </button>
              </div>

              <div className="flex gap-6 items-start">

                {/* ── Formulaire (gauche) ─────────────────────────────── */}
                <div
                  className={`flex-1 min-w-0 flex flex-col gap-5 ${
                    mobileTab === "preview" ? "hidden lg:flex" : "flex"
                  }`}
                >
                  {/* Infos document */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations du document</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Numéro</label>
                        <input
                          value={numeroDoc}
                          onChange={(e) => setNumeroDoc(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Date d'émission</label>
                        <input
                          type="date"
                          value={dateEmission}
                          onChange={(e) => setDateEmission(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Date du mariage</label>
                        <input
                          type="date"
                          value={dateMariage}
                          onChange={(e) => setDateMariage(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Infos prestataire (lecture seule) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Prestataire</h3>
                      <Link href="/dashboard/prestataire/profil" className="text-xs text-rose-400 hover:text-rose-500 font-medium">
                        Modifier →
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Entreprise</div>
                        <div className="font-medium text-gray-800">{prestataire.nom_entreprise || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">SIRET</div>
                        <div className="font-medium text-gray-800">{prestataire.siret || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Téléphone</div>
                        <div className="font-medium text-gray-800">{prestataire.telephone || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Email</div>
                        <div className="font-medium text-gray-800 truncate">{prestataire.email || "—"}</div>
                      </div>
                      {prestataire.adresse && (
                        <div className="col-span-2">
                          <div className="text-xs text-gray-400 mb-0.5">Adresse</div>
                          <div className="font-medium text-gray-800">{prestataire.adresse}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Infos client */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Client</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénom</label>
                        <input
                          value={clientPrenom}
                          onChange={(e) => setClientPrenom(e.target.value)}
                          placeholder="Sophie"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>
                        <input
                          value={clientNom}
                          onChange={(e) => setClientNom(e.target.value)}
                          placeholder="Martin"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="sophie@email.com"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>
                        <input
                          value={clientTelephone}
                          onChange={(e) => setClientTelephone(e.target.value)}
                          placeholder="06 12 34 56 78"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse</label>
                        <input
                          value={clientAdresse}
                          onChange={(e) => setClientAdresse(e.target.value)}
                          placeholder="12 rue des Fleurs, 75001 Paris"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prestations (Devis / Facture) */}
                  {docType !== "contrat" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Prestations</h3>

                      <div className="space-y-3">
                        {lignes.map((l) => (
                          <div key={l.id} className="flex gap-2 items-start">
                            <div className="flex-1 min-w-0">
                              <input
                                value={l.description}
                                onChange={(e) => updateLigne(l.id, "description", e.target.value)}
                                placeholder="Description de la prestation"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                              />
                            </div>
                            <input
                              type="number"
                              value={l.quantite}
                              min={1}
                              onChange={(e) => updateLigne(l.id, "quantite", parseFloat(e.target.value) || 1)}
                              className="w-16 px-2 py-2.5 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                              title="Quantité"
                            />
                            <input
                              type="number"
                              value={l.prixUnitaire === 0 ? "" : l.prixUnitaire}
                              min={0}
                              step={0.01}
                              onChange={(e) => updateLigne(l.id, "prixUnitaire", parseFloat(e.target.value) || 0)}
                              placeholder="Prix HT"
                              className="w-28 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-right focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                            />
                            <select
                              value={l.tva}
                              onChange={(e) => updateLigne(l.id, "tva", parseFloat(e.target.value))}
                              className="w-20 px-2 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                            >
                              {[0, 5.5, 10, 20].map((r) => (
                                <option key={r} value={r}>{r} %</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeLigne(l.id)}
                              disabled={lignes.length === 1}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-30"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={addLigne}
                        className="mt-3 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                        style={{ color: "#F06292" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter une prestation
                      </button>

                      {/* Totaux */}
                      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Total HT</span><span className="font-medium text-gray-700">{fmtMoney(totals.ht)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>TVA</span><span className="font-medium text-gray-700">{fmtMoney(totals.tva)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold" style={{ color: "#F06292" }}>
                          <span>Total TTC</span><span>{fmtMoney(totals.ttc)}</span>
                        </div>
                      </div>

                      {/* Acompte */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 mb-2">Acompte demandé</label>
                        <div className="flex gap-2 items-center">
                          <select
                            value={acompteType}
                            onChange={(e) => setAcompteType(e.target.value as "pourcentage" | "montant")}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                          >
                            <option value="pourcentage">%</option>
                            <option value="montant">€ fixe</option>
                          </select>
                          <input
                            type="number"
                            value={acompteValeur}
                            min={0}
                            onChange={(e) => setAcompteValeur(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                          />
                          {parseFloat(acompteValeur) > 0 && (
                            <span className="text-sm font-semibold" style={{ color: "#F06292" }}>
                              = {fmtMoney(acompteAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clauses contrat */}
                  {docType === "contrat" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Clauses du contrat</h3>
                      <div className="space-y-4">
                        {clauses.map((c, i) => (
                          <div key={c.id} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#F06292" }}>
                                Art. {i + 1}
                              </span>
                              <input
                                value={c.titre}
                                onChange={(e) =>
                                  setClauses((prev) =>
                                    prev.map((x) => x.id === c.id ? { ...x, titre: e.target.value } : x)
                                  )
                                }
                                className="flex-1 text-sm font-semibold text-gray-900 bg-transparent border-none outline-none"
                              />
                            </div>
                            <textarea
                              value={c.contenu}
                              rows={3}
                              onChange={(e) =>
                                setClauses((prev) =>
                                  prev.map((x) => x.id === c.id ? { ...x, contenu: e.target.value } : x)
                                )
                              }
                              className="w-full text-sm text-gray-600 bg-transparent border-none outline-none resize-none leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Notes & conditions particulières
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Conditions de paiement, informations complémentaires..."
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap pb-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || quotaReached}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                    >
                      {saving ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      )}
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>

                    <button
                      onClick={handlePDF}
                      disabled={pdfLoading}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200 bg-white"
                      style={{ color: "#374151" }}
                    >
                      {pdfLoading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      {pdfLoading ? "Génération..." : "Télécharger en PDF"}
                    </button>

                    {savedMessage && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {savedMessage}
                      </span>
                    )}

                    {quotaReached && upgradeInfo && (
                      <Link
                        href={upgradeInfo.href}
                        className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
                        style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                      >
                        {upgradeInfo.label} →
                      </Link>
                    )}
                  </div>
                </div>

                {/* ── Aperçu (droite) ─────────────────────────────────── */}
                <div
                  className={`lg:w-[520px] lg:flex-shrink-0 ${
                    mobileTab === "edit" ? "hidden lg:block" : "block w-full"
                  }`}
                >
                  <div className="lg:sticky lg:top-24">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
                      Aperçu en temps réel
                    </div>
                    <div
                      className="rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                      style={{ maxHeight: "85vh", overflowY: "auto" }}
                    >
                      <div ref={previewRef}>
                        <DocumentPreview
                          docType={docType}
                          prestataire={prestataire}
                          clientPrenom={clientPrenom}
                          clientNom={clientNom}
                          clientEmail={clientEmail}
                          clientTelephone={clientTelephone}
                          clientAdresse={clientAdresse}
                          dateMariage={dateMariage}
                          dateEmission={dateEmission}
                          numeroDoc={numeroDoc}
                          lignes={lignes}
                          totals={totals}
                          acompteType={acompteType}
                          acompteValeur={acompteValeur}
                          acompteAmount={acompteAmount}
                          notes={notes}
                          clauses={clauses}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* VUE : LISTE DES DOCUMENTS                                     */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {view === "list" && (
            <div>
              {/* Filtres */}
              <div className="flex flex-wrap gap-2 mb-5">
                <div className="flex items-center gap-1 bg-white rounded-xl px-1 py-1 shadow-sm border border-gray-100">
                  {(["all", "devis", "facture", "contrat"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                        filterType === t ? "text-white" : "text-gray-500 hover:text-gray-700"
                      }`}
                      style={filterType === t ? { background: "#F06292" } : {}}
                    >
                      {t === "all" ? "Tous types" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-xl px-1 py-1 shadow-sm border border-gray-100">
                  {["all", "brouillon", "envoye", "signe", "paye"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatut(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filterStatut === s ? "text-white" : "text-gray-500 hover:text-gray-700"
                      }`}
                      style={
                        filterStatut === s
                          ? { background: s === "all" ? "#F06292" : STATUT_STYLES[s]?.text }
                          : {}
                      }
                    >
                      {s === "all" ? "Tous statuts" : STATUT_STYLES[s]?.label ?? s}
                    </button>
                  ))}
                </div>
              </div>

              {docsLoading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                  Chargement...
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "#FFF0F5" }}
                  >
                    <svg className="w-7 h-7" style={{ color: "#F06292" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Aucun document</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {savedDocs.length === 0
                      ? "Créez votre premier devis, facture ou contrat"
                      : "Aucun document ne correspond aux filtres sélectionnés"}
                  </p>
                  {savedDocs.length === 0 && (
                    <button
                      onClick={() => setView("form")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #F06292, #E91E8C)" }}
                    >
                      Créer un document →
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* En-tête tableau */}
                  <div
                    className="hidden sm:grid gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{
                      gridTemplateColumns: "80px 120px 1fr 110px 100px 90px 100px",
                      color: "#F06292",
                      background: "#FFF0F5",
                    }}
                  >
                    <span>Type</span>
                    <span>Numéro</span>
                    <span>Client</span>
                    <span className="text-right">Montant TTC</span>
                    <span>Statut</span>
                    <span>Date</span>
                    <span />
                  </div>

                  <div className="divide-y divide-gray-50">
                    {filteredDocs.map((doc) => {
                      const st = STATUT_STYLES[doc.statut] ?? STATUT_STYLES.brouillon;
                      return (
                        <div
                          key={doc.id}
                          className="flex flex-col sm:grid gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                          style={{ gridTemplateColumns: "80px 120px 1fr 110px 100px 90px 100px" }}
                        >
                          {/* Type */}
                          <div className="flex items-center">
                            <span
                              className="text-xs font-bold px-2 py-1 rounded-lg"
                              style={{
                                background:
                                  doc.type === "devis" ? "#EFF6FF" :
                                  doc.type === "facture" ? "#FFF7ED" : "#F0FDF4",
                                color:
                                  doc.type === "devis" ? "#3B82F6" :
                                  doc.type === "facture" ? "#EA580C" : "#16A34A",
                              }}
                            >
                              {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                            </span>
                          </div>

                          {/* Numéro */}
                          <div className="flex items-center">
                            <span className="text-sm font-mono text-gray-600">{doc.numero}</span>
                          </div>

                          {/* Client */}
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {[doc.client_prenom, doc.client_nom].filter(Boolean).join(" ") || "—"}
                            </span>
                            {doc.client_email && (
                              <span className="text-xs text-gray-400 truncate">{doc.client_email}</span>
                            )}
                          </div>

                          {/* Montant */}
                          <div className="flex items-center justify-start sm:justify-end">
                            <span className="text-sm font-semibold text-gray-900">
                              {doc.montant_ttc != null ? fmtMoney(doc.montant_ttc) : "—"}
                            </span>
                          </div>

                          {/* Statut (modifiable) */}
                          <div className="flex items-center">
                            <select
                              value={doc.statut}
                              onChange={(e) => updateDocStatut(doc.id, e.target.value)}
                              className="text-xs font-semibold px-2 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-200"
                              style={{ background: st.bg, color: st.text }}
                            >
                              <option value="brouillon">Brouillon</option>
                              <option value="envoye">Envoyé</option>
                              <option value="signe">Signé</option>
                              <option value="paye">Payé</option>
                            </select>
                          </div>

                          {/* Date */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-400">{fmtDate(doc.created_at)}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 justify-start sm:justify-end">
                            <button
                              onClick={() => handleDownloadDoc(doc.id)}
                              disabled={downloadingDocId === doc.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-50 transition-all disabled:opacity-50"
                              title="Télécharger en PDF"
                            >
                              {downloadingDocId === doc.id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => deleteDoc(doc.id)}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                              title="Supprimer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Preview hors-écran pour génération PDF depuis la liste */}
      {downloadDoc && (
        <div
          ref={downloadRef}
          style={{ position: "fixed", left: "-9999px", top: 0, width: "794px", zIndex: -1, pointerEvents: "none" }}
          aria-hidden="true"
        >
          <DocumentPreview
            docType={downloadDoc.type}
            prestataire={prestataire!}
            clientPrenom={downloadDoc.client_prenom ?? ""}
            clientNom={downloadDoc.client_nom ?? ""}
            clientEmail={downloadDoc.client_email ?? ""}
            clientTelephone={downloadDoc.client_telephone ?? ""}
            clientAdresse={downloadDoc.client_adresse ?? ""}
            dateMariage={downloadDoc.date_mariage ?? ""}
            dateEmission={downloadDoc.date_emission ?? todayStr()}
            numeroDoc={downloadDoc.numero}
            lignes={downloadDoc.contenu?.lignes ?? []}
            totals={(downloadDoc.contenu?.lignes ?? []).reduce(
              (acc, l) => {
                const ht = l.quantite * l.prixUnitaire;
                const tva = (ht * l.tva) / 100;
                return { ht: acc.ht + ht, tva: acc.tva + tva, ttc: acc.ttc + ht + tva };
              },
              { ht: 0, tva: 0, ttc: 0 }
            )}
            acompteType={downloadDoc.contenu?.acompteType ?? "pourcentage"}
            acompteValeur={downloadDoc.contenu?.acompteValeur ?? "0"}
            acompteAmount={(() => {
              const v = parseFloat(downloadDoc.contenu?.acompteValeur ?? "0") || 0;
              const ttc = (downloadDoc.contenu?.lignes ?? []).reduce((acc, l) => {
                const ht = l.quantite * l.prixUnitaire;
                return acc + ht + (ht * l.tva) / 100;
              }, 0);
              return (downloadDoc.contenu?.acompteType ?? "pourcentage") === "pourcentage"
                ? (ttc * v) / 100
                : v;
            })()}
            notes={downloadDoc.contenu?.notes ?? ""}
            clauses={downloadDoc.contenu?.clauses ?? DEFAULT_CLAUSES}
          />
        </div>
      )}
    </main>
  );
}
