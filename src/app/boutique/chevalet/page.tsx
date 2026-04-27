"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

function ChevaletMockup() {
  return (
    <div style={{ position: "relative", transform: "rotate(-1deg)" }}>
      <div
        style={{
          width: 200,
          height: 155,
          background: "#FFFFFF",
          borderRadius: 6,
          padding: 14,
          boxShadow: "0 25px 70px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          border: "1px solid #E8E8E8",
        }}
      >
        <p style={{ fontSize: 9, color: "#6366F1", letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Mariage de</p>
        <p style={{ fontSize: 16, fontWeight: "bold", color: "#1a1a1a", fontFamily: "Georgia, serif", textAlign: "center", lineHeight: 1.3 }}>Vos prénoms</p>
        <div style={{ width: 60, height: 1, background: "#6366F1" }} />
        <div
          style={{
            width: 64,
            height: 64,
            border: "2px solid #6366F1",
            padding: 3,
            background: "#fff",
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 1.5,
          }}
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: [0,1,2,6,7,11,12,14,17,18,21,23,24,29,30,34,35].includes(i) ? "#6366F1" : "#fff",
                borderRadius: 0.5,
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: 6, color: "#aaa", letterSpacing: "0.2em", textTransform: "uppercase" }}>Scannez pour partager vos photos</p>
      </div>
      {/* Pieds */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 30px" }}>
        <div style={{ width: 3, height: 22, background: "#C9A84C", borderRadius: 1.5, transform: "rotate(12deg)", transformOrigin: "top center" }} />
        <div style={{ width: 3, height: 22, background: "#C9A84C", borderRadius: 1.5, transform: "rotate(-12deg)", transformOrigin: "top center" }} />
      </div>
    </div>
  );
}

function CommanderChevaletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [authChecked, setAuthChecked] = useState(false);
  const [marieId, setMarieId] = useState<string | null>(null);
  const [prenom1, setPrenom1] = useState("");
  const [prenom2, setPrenom2] = useState<string | null>(null);

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
      .select("id, prenom_marie1, prenom_marie2")
      .eq("user_id", uid)
      .single();
    if (data) {
      setMarieId(data.id);
      setPrenom1(data.prenom_marie1 ?? "");
      setPrenom2(data.prenom_marie2 ?? null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/inscription?redirect=/boutique/chevalet");
        return;
      }
      await fetchMarie(session.user.id);
      setAuthChecked(true);
    });
  }, [router, fetchMarie]);

  if (!authChecked) return null;

  const names = prenom1 || prenom2
    ? prenom2 ? `${prenom1} & ${prenom2}` : prenom1
    : "Vos prénoms";

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
      const res = await fetch("/api/marie/chevalet-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marieId, adresseLivraison }),
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
              href="/boutique"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la boutique
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
                  Votre chevalet QR Code sera expédié sous 5–7 jours ouvrés.
                  Vous recevrez un email de confirmation avec le suivi de livraison.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Commander votre chevalet
            </h1>
            <p className="text-gray-400 text-sm">
              Chevalet cartonné premium + carte QR Code imprimée · Livraison incluse
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* ── Left: mockup + récapitulatif ── */}
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Aperçu du chevalet
              </p>

              {/* Mockup */}
              <div
                className="relative rounded-2xl overflow-hidden mb-6 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #F0F4FF 0%, #EAE8F8 100%)",
                  height: 280,
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <ChevaletMockup />
                  <p className="text-xs text-gray-400 mt-2">
                    {names}
                  </p>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="rounded-2xl p-5" style={{ background: "#FAFAF8", border: "1px solid #EBEBEB" }}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Récapitulatif</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Produit</span>
                    <span className="font-medium text-gray-900">Chevalet cartonné premium</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Contenu</span>
                    <span className="font-medium text-gray-900">Carte QR Code imprimée</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Format</span>
                    <span className="font-medium text-gray-900">A5 autoportant</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-medium text-gray-900">5–7 jours ouvrés</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total TTC</span>
                    <span className="text-lg font-bold text-gray-900">19,90 €</span>
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
                    style={{ background: "#6366F1", color: "#fff" }}
                  >
                    {paying ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirection vers le paiement…
                      </span>
                    ) : (
                      "Commander — 19,90 €"
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

export default function CommanderChevaletPage() {
  return (
    <Suspense>
      <CommanderChevaletContent />
    </Suspense>
  );
}
