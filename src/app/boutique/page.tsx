"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

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

const TESTIMONIALS = [
  {
    name: "Sophie & Thomas",
    date: "Mariés en juin 2025",
    text: "Le cadre QR Code était absolument magnifique sur nos tables ! Tous nos invités ont scanné et les photos qu'on a reçues sont inoubliables. La qualité d'impression est parfaite.",
    stars: 5,
  },
  {
    name: "Camille & Antoine",
    date: "Mariés en septembre 2024",
    text: "On a pris le chevalet pour les petites tables du cocktail. Élégant, discret, efficace. En 20 minutes on avait déjà 50 photos d'invités dans l'album !",
    stars: 5,
  },
  {
    name: "Léa & Julien",
    date: "Mariés en avril 2025",
    text: "La livraison était rapide et le packaging soigné. Le chevalet s'intègre parfaitement dans notre décoration champêtre. Je recommande à tous les futurs mariés.",
    stars: 5,
  },
];

export default function BoutiquePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, [router]);

  function getCadreHref() {
    if (isLoggedIn === null) return "#";
    return isLoggedIn
      ? "/dashboard/marie/album-photo/commander-cadre"
      : "/inscription?redirect=/boutique";
  }

  function getChevaletHref() {
    if (isLoggedIn === null) return "#";
    return isLoggedIn ? "/boutique/chevalet" : "/inscription?redirect=/boutique/chevalet";
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

      {/* Products */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Cadre */}
            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {/* Mockup */}
              <div
                className="relative h-64 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #F5F0E8 0%, #EDE5D4 100%)",
                }}
              >
                {/* Cadre CSS */}
                <div
                  className="relative"
                  style={{
                    width: 130,
                    height: 170,
                    background: "#FFFFFF",
                    borderRadius: 4,
                    padding: 8,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2), 0 4px 15px rgba(0,0,0,0.1)",
                    transform: "rotate(-2deg)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1.5px solid #C9A84C",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "#FAFAF8",
                    }}
                  >
                    <p style={{ fontSize: 7, color: "#C9A84C", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Mariage de</p>
                    <p style={{ fontSize: 11, fontWeight: "bold", color: "#1a1a1a", fontFamily: "Georgia, serif", textAlign: "center", lineHeight: 1.3 }}>Léa & Thomas</p>
                    <div style={{ width: 40, height: 1, background: "#C9A84C" }} />
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        border: "2px solid #C9A84C",
                        padding: 3,
                        background: "#fff",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 1.5,
                      }}
                    >
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            background: [0,1,5,6,10,14,15,18,19,20,24].includes(i) ? "#1a1a1a" : "#fff",
                            borderRadius: 0.5,
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: 5, color: "#aaa", letterSpacing: "0.15em", textTransform: "uppercase" }}>instantmariage.fr</p>
                  </div>
                </div>

                {/* Badge livraison */}
                <span
                  className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#F0FDF4", color: "#10B981" }}
                >
                  Livraison 5–7 jours
                </span>
              </div>

              {/* Content */}
              <div className="p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  Cadre QR Code — Partagez vos photos
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  Cadre blanc 15×20 cm avec votre carte QR Code personnalisée. Posez-le sur chaque
                  table et collectez tous les souvenirs de vos invités.
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">39,90 €</span>
                    <span className="text-sm text-gray-400 ml-1">TTC</span>
                  </div>
                  <span className="text-xs text-gray-400">Livraison incluse</span>
                </div>
                <Link
                  href={getCadreHref()}
                  className="block w-full text-center py-3.5 rounded-2xl text-sm font-semibold transition-all"
                  style={{ background: "#1a1a1a", color: "#fff" }}
                >
                  Commander le cadre
                </Link>
              </div>
            </div>

            {/* Chevalet */}
            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {/* Mockup */}
              <div
                className="relative h-64 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #F0F4FF 0%, #E8F0FF 100%)",
                }}
              >
                {/* Chevalet CSS : tent card / A-frame */}
                <div
                  style={{
                    position: "relative",
                    transform: "rotate(1.5deg)",
                  }}
                >
                  {/* Corps du chevalet */}
                  <div
                    style={{
                      width: 140,
                      height: 110,
                      background: "#FFFFFF",
                      borderRadius: 6,
                      padding: 10,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 15px rgba(0,0,0,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1px solid #E8E8E8",
                    }}
                  >
                    <p style={{ fontSize: 7, color: "#6366F1", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>Mariage de</p>
                    <p style={{ fontSize: 10, fontWeight: "bold", color: "#1a1a1a", fontFamily: "Georgia, serif", textAlign: "center", lineHeight: 1.3 }}>Sophie & Marc</p>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        border: "2px solid #6366F1",
                        padding: 2,
                        background: "#fff",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 1.2,
                      }}
                    >
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            background: [0,1,4,5,8,12,16,20,21,23,24].includes(i) ? "#6366F1" : "#fff",
                            borderRadius: 0.5,
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: 5, color: "#aaa", letterSpacing: "0.15em", textTransform: "uppercase" }}>instantmariage.fr</p>
                  </div>
                  {/* Pied du chevalet */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
                    <div style={{ width: 2, height: 16, background: "#D1D5DB", borderRadius: 1, transform: "rotate(15deg)", transformOrigin: "top center" }} />
                    <div style={{ width: 2, height: 16, background: "#D1D5DB", borderRadius: 1, transform: "rotate(-15deg)", transformOrigin: "top center" }} />
                  </div>
                </div>

                <span
                  className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#F0FDF4", color: "#10B981" }}
                >
                  Livraison 5–7 jours
                </span>
              </div>

              {/* Content */}
              <div className="p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  Chevalet QR Code — Élégant et compact
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  Chevalet cartonné premium avec votre carte QR Code. Plus léger qu'un cadre,
                  aussi élégant. Idéal pour les petites tables.
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">19,90 €</span>
                    <span className="text-sm text-gray-400 ml-1">TTC</span>
                  </div>
                  <span className="text-xs text-gray-400">Livraison incluse</span>
                </div>
                <Link
                  href={getChevaletHref()}
                  className="block w-full text-center py-3.5 rounded-2xl text-sm font-semibold transition-all"
                  style={{ background: "#6366F1", color: "#fff" }}
                >
                  Commander le chevalet
                </Link>
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
                title: "Choisissez votre support",
                desc: "Cadre élégant ou chevalet compact — sélectionnez le produit qui correspond à votre décoration.",
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
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{t.text}"</p>
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
