"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  url: string;
  nom_fichier: string | null;
  uploade_par: string | null;
};

type Format = {
  pages: number;
  maxPhotos: number;
  prix: string;
  prixCents: number;
  label: string;
  description: string;
};

const FORMATS: Format[] = [
  { pages: 20, maxPhotos: 29, prix: "29,90 €", prixCents: 2990, label: "20 pages", description: "20 pages · Jusqu'à 29 photos · Couverture rigide A4" },
  { pages: 30, maxPhotos: 44, prix: "39,90 €", prixCents: 3990, label: "30 pages", description: "30 pages · Jusqu'à 44 photos · Couverture rigide A4" },
  { pages: 50, maxPhotos: 74, prix: "59,90 €", prixCents: 5990, label: "50 pages", description: "50 pages · Jusqu'à 74 photos · Couverture rigide A4" },
];

type CoverType = {
  sku: string;
  label: string;
  priceDelta: number; // cents
};

const COVER_TYPES: CoverType[] = [
  { sku: "BOOK-FE-A4-P-HARD-G", label: "Rigide glacée", priceDelta: 0 },
  { sku: "BOOK-FE-A4-P-HARD-M", label: "Rigide mate", priceDelta: 0 },
  { sku: "BOOK-FE-A4-L-LAYFLAT-G", label: "Layflat (pages à plat)", priceDelta: 1000 },
  { sku: "BOOK-FE-A4-P-SOFT-G", label: "Souple", priceDelta: -500 },
];

function formatPriceCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

type Adresse = {
  prenom: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
};

export default function CommanderAlbumClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  const [authChecked, setAuthChecked] = useState(false);
  const [marieId, setMarieId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Sélection
  const [selected, setSelected] = useState<string[]>([]);

  // Format
  const [formatPages, setFormatPages] = useState<number>(30);

  // Couverture
  const [coverSku, setCoverSku] = useState("BOOK-FE-A4-P-HARD-G");
  const [coverTitle, setCoverTitle] = useState("");
  const [coverDate, setCoverDate] = useState("");

  // Adresse
  const [adresse, setAdresse] = useState<Adresse>({
    prenom: "", nom: "", adresse: "", codePostal: "", ville: "", telephone: "",
  });

  // Drag & drop
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  // Checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Quantité
  const [quantite, setQuantite] = useState(1);

  const currentFormat = FORMATS.find((f) => f.pages === formatPages) ?? FORMATS[1];
  const currentCover = COVER_TYPES.find((c) => c.sku === coverSku) ?? COVER_TYPES[0];
  const unitCents = currentFormat.prixCents + currentCover.priceDelta;
  const totalCents = unitCents * quantite;

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }

      const { data: marie } = await supabase
        .from("maries")
        .select("id, album_slug, prenom_marie1, prenom_marie2, date_mariage")
        .eq("user_id", session.user.id)
        .single();

      if (!marie?.album_slug) { router.replace("/dashboard/marie/album-photo"); return; }

      setMarieId(marie.id);

      // Pré-remplir titre et date couverture
      const p1 = marie.prenom_marie1 ?? "";
      const p2 = marie.prenom_marie2 ?? "";
      setCoverTitle(p2 ? `Mariage de ${p1} & ${p2}` : `Mariage de ${p1}`);
      if (marie.date_mariage) {
        const d = new Date(marie.date_mariage);
        setCoverDate(d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
      }

      const { data: photosData } = await supabase
        .from("album_photos")
        .select("id, url, nom_fichier, uploade_par")
        .eq("marie_id", marie.id)
        .eq("type", "photo")
        .order("created_at", { ascending: false });

      setPhotos((photosData as Photo[]) ?? []);
      setLoading(false);
      setAuthChecked(true);
    });
  }, [router]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= currentFormat.maxPhotos) return prev;
      return [...prev, id];
    });
  }

  function selectAll() {
    const ids = photos.slice(0, currentFormat.maxPhotos).map((p) => p.id);
    setSelected(ids);
  }

  function deselectAll() {
    setSelected([]);
  }

  // Drag & drop sur les photos sélectionnées
  function onDragStart(idx: number) {
    dragItem.current = idx;
  }

  function onDragEnter(idx: number) {
    dragOver.current = idx;
  }

  function onDragEnd() {
    if (dragItem.current === null || dragOver.current === null) return;
    if (dragItem.current === dragOver.current) return;
    const newOrder = [...selected];
    const [moved] = newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOver.current, 0, moved);
    setSelected(newOrder);
    dragItem.current = null;
    dragOver.current = null;
  }

  async function handleCommander() {
    if (!marieId) return;
    if (selected.length === 0) {
      setCheckoutError("Sélectionnez au moins une photo.");
      return;
    }
    if (!adresse.prenom || !adresse.nom || !adresse.adresse || !adresse.codePostal || !adresse.ville) {
      setCheckoutError("Remplissez tous les champs de livraison.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/marie/album-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marieId,
          format: String(formatPages),
          photoIds: selected,
          adresseLivraison: adresse,
          coverSku,
          coverTitle,
          coverDate,
          quantite,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        setCheckoutError(json.error ?? "Erreur lors du paiement.");
        return;
      }

      window.location.href = json.url;
    } catch {
      setCheckoutError("Erreur réseau. Réessayez.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (!authChecked) return null;

  if (success) {
    return (
      <>
        <main className="min-h-screen bg-white">
          <Header />
          <div className="pt-20 pb-24 flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#F0FDF4" }}>
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Commande confirmée !</h1>
            <p className="text-gray-500 text-center max-w-sm leading-relaxed mb-8">
              Votre album est en cours d&apos;impression. Vous le recevrez sous <strong>5 à 7 jours ouvrés</strong>.
              Un email de confirmation vous a été envoyé.
            </p>
            <Link
              href="/dashboard/marie/album-photo"
              className="px-8 py-3 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              Retour à mon album
            </Link>
          </div>
          <Footer />
        </main>
      </>
    );
  }

  const selectedPhotos = selected
    .map((id) => photos.find((p) => p.id === id))
    .filter(Boolean) as Photo[];

  const formValid =
    selected.length > 0 &&
    adresse.prenom.trim() &&
    adresse.nom.trim() &&
    adresse.adresse.trim() &&
    adresse.codePostal.trim() &&
    adresse.ville.trim();

  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />

        <div className="pt-20 pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">

            {/* Back */}
            <div className="pt-10 pb-8">
              <Link
                href="/dashboard/marie/album-photo"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Mon album
              </Link>
            </div>

            <h1 className="text-4xl text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}>
              Commander mon album
            </h1>
            <p className="text-gray-400 mb-10">Sélectionnez vos photos, choisissez votre format, et recevez votre album imprimé.</p>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <p className="text-base mb-4">Aucune photo dans votre album pour l&apos;instant.</p>
                <Link href="/dashboard/marie/album-photo" className="text-sm text-gray-600 underline">
                  Retour à l&apos;album
                </Link>
              </div>
            ) : (
              <div className="space-y-10">

                {/* ── Étape 1 : Format ── */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Choisissez votre format</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {FORMATS.map((f) => {
                      const active = formatPages === f.pages;
                      return (
                        <button
                          key={f.pages}
                          onClick={() => {
                            setFormatPages(f.pages);
                            setSelected((prev) => prev.slice(0, f.maxPhotos));
                          }}
                          className="relative rounded-2xl p-5 text-left transition-all border-2"
                          style={{
                            borderColor: active ? "#F06292" : "#e5e7eb",
                            background: active ? "#fff0f5" : "#fff",
                          }}
                        >
                          {active && (
                            <span
                              className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "#F06292" }}
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                          <p className="text-xl font-bold text-gray-900">{f.prix}</p>
                          <p className="text-xs text-gray-400 mt-1">{f.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* ── Étape 2 : Type de couverture ── */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Type de couverture</h2>
                  <div className="flex flex-col gap-3 max-w-xl">
                    {COVER_TYPES.map((cover) => {
                      const active = coverSku === cover.sku;
                      return (
                        <label
                          key={cover.sku}
                          className="flex items-center gap-3 cursor-pointer rounded-2xl p-4 border-2 transition-all"
                          style={{
                            borderColor: active ? "#F06292" : "#e5e7eb",
                            background: active ? "#fff0f5" : "#fff",
                          }}
                        >
                          <input
                            type="radio"
                            name="coverType"
                            value={cover.sku}
                            checked={active}
                            onChange={() => setCoverSku(cover.sku)}
                            className="sr-only"
                          />
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: active ? "#F06292" : "#d1d5db" }}
                          >
                            {active && (
                              <div className="w-2 h-2 rounded-full" style={{ background: "#F06292" }} />
                            )}
                          </div>
                          <span className="flex-1 text-sm font-medium text-gray-900">{cover.label}</span>
                          <span className="text-sm font-semibold text-gray-600">
                            {cover.priceDelta === 0
                              ? "Standard"
                              : cover.priceDelta > 0
                                ? `+${cover.priceDelta / 100} €`
                                : `${cover.priceDelta / 100} €`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                {/* ── Étape 3 : Personnalisation couverture ── */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">3. Personnalisation de la couverture</h2>
                  <p className="text-sm text-gray-400 mb-4">Ces informations apparaîtront sur la page de titre de votre album.</p>
                  <div className="flex flex-col gap-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Titre de couverture</label>
                      <input
                        type="text"
                        value={coverTitle}
                        onChange={(e) => setCoverTitle(e.target.value)}
                        placeholder="Mariage de Sophie & Thomas"
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                      <input
                        type="text"
                        value={coverDate}
                        onChange={(e) => setCoverDate(e.target.value)}
                        placeholder="12 juin 2025"
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                </section>

                {/* ── Étape 4 : Quantité ── */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">4. Quantité</h2>
                  <p className="text-sm text-gray-400 mb-4">Commandez plusieurs exemplaires pour offrir à vos proches 🎁</p>
                  <div className="flex gap-6">
                    {([
                      { value: 1, label: "Pour vous" },
                      { value: 2, label: "+ Parents" },
                      { value: 3, label: "Famille complète" },
                    ] as { value: number; label: string }[]).map(({ value, label }) => (
                      <div key={value} className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => setQuantite(value)}
                          className="w-12 h-12 rounded-full text-sm font-bold transition-all"
                          style={{
                            background: quantite === value ? "#F06292" : "#fff",
                            color: quantite === value ? "#fff" : "#374151",
                            border: `2px solid ${quantite === value ? "#F06292" : "#e5e7eb"}`,
                          }}
                        >
                          {value}
                        </button>
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Étape 5 : Sélection photos ── */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      5. Sélectionnez vos photos
                      <span className="ml-2 text-sm font-normal text-gray-400">
                        ({selected.length}/{currentFormat.maxPhotos})
                      </span>
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={deselectAll}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Tout désélectionner
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    {photos.map((p) => {
                      const isSelected = selected.includes(p.id);
                      const selIdx = selected.indexOf(p.id);
                      const isDisabled = !isSelected && selected.length >= currentFormat.maxPhotos;

                      return (
                        <button
                          key={p.id}
                          onClick={() => !isDisabled && toggleSelect(p.id)}
                          className="relative rounded-xl overflow-hidden aspect-square transition-all"
                          style={{
                            outline: isSelected ? "2.5px solid #F06292" : "2.5px solid transparent",
                            opacity: isDisabled ? 0.4 : 1,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          <Image
                            src={p.url}
                            alt={p.nom_fichier ?? "photo"}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="150px"
                          />
                          {isSelected && (
                            <div
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: "#F06292" }}
                            >
                              {selIdx + 1}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* ── Étape 6 : Ordre (drag & drop) ── */}
                {selected.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      6. Réorganisez l&apos;ordre des pages
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">Glissez-déposez pour changer l&apos;ordre d&apos;impression.</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhotos.map((p, idx) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => onDragStart(idx)}
                          onDragEnter={() => onDragEnter(idx)}
                          onDragEnd={onDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          className="relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                          style={{ width: 80, height: 80, flexShrink: 0 }}
                        >
                          <Image
                            src={p.url}
                            alt={p.nom_fichier ?? `page ${idx + 1}`}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="80px"
                          />
                          <div
                            className="absolute inset-0 flex items-end justify-start p-1"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }}
                          >
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Étape 7 : Adresse ── */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">7. Adresse de livraison</h2>
                  <div className="grid grid-cols-2 gap-4 max-w-xl">
                    {(
                      [
                        { key: "prenom", label: "Prénom", placeholder: "Sophie" },
                        { key: "nom", label: "Nom", placeholder: "Dupont" },
                      ] as const
                    ).map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{label} *</label>
                        <input
                          type="text"
                          value={adresse[key]}
                          onChange={(e) => setAdresse((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Adresse *</label>
                      <input
                        type="text"
                        value={adresse.adresse}
                        onChange={(e) => setAdresse((prev) => ({ ...prev, adresse: e.target.value }))}
                        placeholder="14 rue de la Paix"
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Code postal *</label>
                      <input
                        type="text"
                        value={adresse.codePostal}
                        onChange={(e) => setAdresse((prev) => ({ ...prev, codePostal: e.target.value }))}
                        placeholder="75001"
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ville *</label>
                      <input
                        type="text"
                        value={adresse.ville}
                        onChange={(e) => setAdresse((prev) => ({ ...prev, ville: e.target.value }))}
                        placeholder="Paris"
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={adresse.telephone}
                        onChange={(e) => setAdresse((prev) => ({ ...prev, telephone: e.target.value }))}
                        placeholder="06 12 34 56 78"
                        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                </section>

                {/* ── Récap + bouton commander ── */}
                <section className="rounded-2xl p-6 max-w-xl" style={{ background: "#fafafa", border: "1px solid #e5e7eb" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Album {currentFormat.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selected.length} photo{selected.length > 1 ? "s" : ""} · {currentCover.label} · Livraison incluse
                      </p>
                      {quantite > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {quantite} albums × {formatPriceCents(unitCents)} = {formatPriceCents(totalCents)}
                        </p>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatPriceCents(totalCents)}</p>
                  </div>

                  {checkoutError && (
                    <p className="text-xs text-red-500 mb-3">{checkoutError}</p>
                  )}

                  <button
                    onClick={handleCommander}
                    disabled={checkoutLoading || !formValid}
                    className="w-full py-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: formValid ? "#F06292" : "#d1d5db" }}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirection…
                      </span>
                    ) : (
                      `Commander mon album → ${formatPriceCents(totalCents)}`
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Paiement sécurisé · Délai 5–7 jours ouvrés · Expédition depuis EU
                  </p>
                </section>

              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
