"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Hook d'animation au scroll
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Fausse UI de carte prestataire
function FakeProviderCard({
  name,
  job,
  location,
  rating,
  reviews,
  price,
  tag,
  emoji,
  delay = 0,
}: {
  name: string;
  job: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  tag?: string;
  emoji: string;
  delay?: number;
}) {
  return (
    <RevealSection delay={delay}>
      <div className="bg-white rounded-2xl shadow-md border border-rose-50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="relative h-40 bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center text-6xl">
          {emoji}
          {tag && (
            <span className="absolute top-3 left-3 bg-rose-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {tag}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
            <span className="text-rose-400 text-xs font-semibold">{price}</span>
          </div>
          <p className="text-rose-400 text-xs font-medium mb-1">{job}</p>
          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {location}
          </p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-3 h-3 ${i < rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-400 text-xs ml-1">({reviews} avis)</span>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

// Badge feature
function FeatureBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-xs font-medium px-3 py-1.5 rounded-full border border-rose-100">
      <span>{icon}</span>
      {label}
    </span>
  );
}

// Fausse timeline rétroplanning
function FakeTimeline() {
  const steps = [
    { done: true, label: "Choisir la date", time: "18 mois avant" },
    { done: true, label: "Réserver la salle", time: "12 mois avant" },
    { done: true, label: "Photographe & Vidéaste", time: "10 mois avant" },
    { done: false, label: "Traiteur & Menu", time: "8 mois avant", active: true },
    { done: false, label: "Robe & Costume", time: "6 mois avant" },
    { done: false, label: "Invitations envoyées", time: "4 mois avant" },
  ];
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            s.active
              ? "bg-rose-50 border border-rose-200"
              : s.done
              ? "bg-gray-50"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
            s.done ? "bg-emerald-400" : s.active ? "bg-rose-400" : "bg-gray-200"
          }`}>
            {s.done ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : s.active ? (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${s.done ? "text-gray-400 line-through" : s.active ? "text-rose-600" : "text-gray-700"}`}>
              {s.label}
            </p>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{s.time}</span>
        </div>
      ))}
    </div>
  );
}

// Fausse checklist
function FakeChecklist() {
  const items = [
    { done: true, label: "Fixer la date du mariage" },
    { done: true, label: "Définir le budget global" },
    { done: true, label: "Choisir le lieu de réception" },
    { done: false, label: "Contacter le photographe", urgent: true },
    { done: false, label: "Liste des invités" },
    { done: false, label: "Thème & décoration" },
  ];
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 group">
          <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${
            item.done ? "bg-emerald-400 border-emerald-400" : "border-gray-300"
          }`}>
            {item.done && (
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className={`text-xs ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>
            {item.label}
          </span>
          {item.urgent && !item.done && (
            <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">Urgent</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Faux budget
function FakeBudget() {
  const categories = [
    { label: "Lieu & Traiteur", budget: 8000, depense: 7200, color: "bg-rose-400" },
    { label: "Photographe", budget: 2500, depense: 2500, color: "bg-violet-400" },
    { label: "Musique & DJ", budget: 1500, depense: 800, color: "bg-amber-400" },
    { label: "Fleurs & Déco", budget: 1200, depense: 400, color: "bg-emerald-400" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
        <span>Catégorie</span>
        <span>Dépensé / Budget</span>
      </div>
      {categories.map((c, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-700 font-medium">{c.label}</span>
            <span className="text-gray-500">{c.depense.toLocaleString("fr-FR")} € / {c.budget.toLocaleString("fr-FR")} €</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${c.color} rounded-full transition-all duration-1000`}
              style={{ width: `${(c.depense / c.budget) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
        <span className="text-gray-500 font-medium">Total dépensé</span>
        <span className="text-rose-500 font-bold">10 900 € / 13 200 €</span>
      </div>
    </div>
  );
}

// Faux plan de table simplifié
function FakeTablePlan() {
  const tables = [
    { id: 1, name: "Table Honneur", seats: 8, filled: 8, color: "bg-rose-100 border-rose-300" },
    { id: 2, name: "Table Famille A", seats: 6, filled: 6, color: "bg-violet-100 border-violet-300" },
    { id: 3, name: "Table Amis", seats: 8, filled: 7, color: "bg-amber-100 border-amber-300" },
    { id: 4, name: "Table Collègues", seats: 6, filled: 4, color: "bg-emerald-100 border-emerald-300" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {tables.map((t) => (
        <div key={t.id} className={`border-2 rounded-xl p-3 ${t.color}`}>
          <p className="text-xs font-bold text-gray-700 mb-1.5">{t.name}</p>
          <div className="flex flex-wrap gap-1">
            {[...Array(t.seats)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border ${
                  i < t.filled ? "bg-gray-600 border-gray-700" : "bg-white border-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{t.filled}/{t.seats} places</p>
        </div>
      ))}
    </div>
  );
}

// Faux générateur de devis
function FakeQuoteGenerator() {
  const lines = [
    { label: "Forfait reportage mariage (8h)", qty: 1, price: 1800 },
    { label: "Second photographe", qty: 1, price: 400 },
    { label: "Album photo 30x30cm", qty: 1, price: 350 },
    { label: "Retouches supplémentaires", qty: 50, price: 5 },
  ];
  const total = lines.reduce((acc, l) => acc + l.qty * l.price, 0);
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-xs">
      <div className="bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-bold text-sm">Devis #2024-047</p>
            <p className="text-white/80 text-xs">Studio Photo Élégance • Paris 8e</p>
          </div>
          <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">En attente</span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2 mb-3">
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50">
              <div className="flex-1">
                <p className="text-gray-700 font-medium">{l.label}</p>
                <p className="text-gray-400">Qté : {l.qty}</p>
              </div>
              <span className="text-gray-700 font-semibold">{(l.qty * l.price).toLocaleString("fr-FR")} €</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-gray-800 text-sm">Total TTC</span>
          <span className="text-rose-500 font-bold text-lg">{total.toLocaleString("fr-FR")} €</span>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-rose-400 text-white text-xs font-semibold py-2 rounded-lg hover:bg-rose-500 transition-colors">
            Accepter le devis
          </button>
          <button className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

// Fausse messagerie
function FakeMessages() {
  const messages = [
    {
      from: "Studio Photo Élégance",
      avatar: "📷",
      preview: "Bonjour ! Oui, nous sommes bien disponibles le 14 juin. Je vous envoie notre...",
      time: "14:32",
      unread: 2,
      active: true,
    },
    {
      from: "DJ Max Events",
      avatar: "🎵",
      preview: "Super, on se retrouve vendredi pour une audition. J'ai hâte !",
      time: "11:15",
      unread: 0,
      active: false,
    },
    {
      from: "Fleurs de Mariage",
      avatar: "💐",
      preview: "Votre devis est prêt, je vous ai joint un PDF avec les compositions...",
      time: "Hier",
      unread: 1,
      active: false,
    },
  ];
  const convo = [
    { me: false, text: "Bonjour, êtes-vous disponible le 14 juin prochain ?" },
    { me: false, text: "Nous cherchons un reportage complet, environ 8 heures." },
    { me: true, text: "Bonjour ! Oui, cette date est disponible 😊" },
    { me: true, text: "Je vous prépare un devis personnalisé sous 24h." },
    { me: false, text: "Merci beaucoup, nous attendons votre retour avec impatience !" },
  ];
  return (
    <div className="flex h-72 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="w-2/5 border-r border-gray-100 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 p-3 cursor-pointer border-b border-gray-50 ${
              m.active ? "bg-rose-50 border-l-2 border-l-rose-400" : "hover:bg-gray-50"
            }`}
          >
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-base flex-shrink-0">
              {m.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-xs font-semibold text-gray-800 truncate">{m.from}</p>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{m.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{m.preview}</p>
            </div>
            {m.unread > 0 && (
              <span className="flex-shrink-0 w-4 h-4 bg-rose-400 rounded-full text-white text-xs font-bold flex items-center justify-center">
                {m.unread}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-sm">📷</div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Studio Photo Élégance</p>
            <p className="text-xs text-emerald-500 font-medium">En ligne</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {convo.map((msg, i) => (
            <div key={i} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                msg.me
                  ? "bg-rose-400 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-700 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-400 flex-1">Votre message…</span>
            <button className="w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #fce7f3 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fce7f3 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-500 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              ✦ Découvrez InstantMariage
            </span>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Tout pour organiser{" "}
              <span className="text-rose-400">le mariage de vos rêves</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Annuaire de prestataires, outils de planification, devis en ligne et messagerie intégrée — une seule plateforme pour tout gérer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inscription"
                className="bg-rose-400 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Commencer gratuitement
              </Link>
              <a
                href="#annuaire"
                className="border-2 border-rose-200 text-rose-400 hover:border-rose-400 font-semibold px-8 py-4 rounded-full text-base transition-all duration-200"
              >
                Explorer les fonctionnalités
              </a>
            </div>
          </RevealSection>

          {/* Navigation rapide */}
          <RevealSection delay={200}>
            <div className="mt-14 flex flex-wrap justify-center gap-3">
              {[
                { icon: "🔍", label: "Annuaire", href: "#annuaire" },
                { icon: "🛠️", label: "Outils mariés", href: "#outils" },
                { icon: "📄", label: "Générateur de devis", href: "#devis" },
                { icon: "💬", label: "Messagerie", href: "#messagerie" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 bg-white border border-rose-100 text-gray-600 hover:text-rose-500 hover:border-rose-300 text-sm font-medium px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Section 1 : Annuaire */}
      <section id="annuaire" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-400 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                🔍 Annuaire prestataires
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Trouvez le prestataire idéal
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Des centaines de professionnels vérifiés — photographes, DJ, traiteurs, fleuristes — triés par région et disponibilité.
              </p>
            </div>
          </RevealSection>

          {/* Barre de recherche fictive */}
          <RevealSection delay={100}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 max-w-3xl mx-auto mb-12 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">Photographe de mariage…</span>
              </div>
              <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-sm text-gray-400">Île-de-France</span>
              </div>
              <button className="bg-rose-400 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-rose-500 transition-colors">
                Rechercher
              </button>
            </div>
          </RevealSection>

          {/* Cartes prestataires */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            <FakeProviderCard name="Studio Lumière" job="Photographe" location="Paris 8e" rating={5} reviews={142} price="dès 1 800 €" tag="⭐ Top" emoji="📷" delay={0} />
            <FakeProviderCard name="DJ FelixB" job="DJ & Animateur" location="Lyon, Rhône" rating={5} reviews={87} price="dès 900 €" emoji="🎵" delay={100} />
            <FakeProviderCard name="Saveurs Dorées" job="Traiteur" location="Bordeaux" rating={4} reviews={63} price="dès 65 €/pers" tag="Nouveau" emoji="🍽️" delay={200} />
            <FakeProviderCard name="Rosa Flora" job="Fleuriste" location="Marseille" rating={5} reviews={54} price="dès 800 €" emoji="💐" delay={300} />
          </div>

          {/* Features */}
          <RevealSection delay={100}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: "✅", label: "Profils vérifiés" },
                { icon: "⭐", label: "Avis authentiques" },
                { icon: "📍", label: "Filtrage géographique" },
                { icon: "💬", label: "Contact direct" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 bg-rose-50 rounded-xl p-3">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{f.label}</span>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Section 2 : Outils mariés */}
      <section id="outils" className="py-24 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 bg-white text-rose-400 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-rose-100 shadow-sm">
                🛠️ Outils mariés
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Organisez chaque détail
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Rétroplanning, checklist, budget et plan de table — des outils puissants et gratuits pour ne rien oublier.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rétroplanning */}
            <RevealSection delay={0}>
              <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    📅
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Rétroplanning</h3>
                    <p className="text-gray-500 text-sm">Ne ratez aucune étape clé</p>
                  </div>
                </div>
                <FakeTimeline />
                <div className="mt-4 flex flex-wrap gap-2">
                  <FeatureBadge icon="📋" label="+150 tâches pré-remplies" />
                  <FeatureBadge icon="🔔" label="Rappels par e-mail" />
                  <FeatureBadge icon="👥" label="Partage avec proches" />
                </div>
              </div>
            </RevealSection>

            {/* Checklist */}
            <RevealSection delay={100}>
              <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    ✅
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Checklist mariage</h3>
                    <p className="text-gray-500 text-sm">Tout cocher, zéro stress</p>
                  </div>
                </div>
                <FakeChecklist />
                <div className="mt-4 flex flex-wrap gap-2">
                  <FeatureBadge icon="🎯" label="Priorités visuelles" />
                  <FeatureBadge icon="📱" label="Accès mobile" />
                  <FeatureBadge icon="⚡" label="Personnalisable" />
                </div>
              </div>
            </RevealSection>

            {/* Budget */}
            <RevealSection delay={150}>
              <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    💰
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Budget mariage</h3>
                    <p className="text-gray-500 text-sm">Suivez vos dépenses en temps réel</p>
                  </div>
                </div>
                <FakeBudget />
                <div className="mt-4 flex flex-wrap gap-2">
                  <FeatureBadge icon="📊" label="Graphiques visuels" />
                  <FeatureBadge icon="⚠️" label="Alertes dépassement" />
                  <FeatureBadge icon="📂" label="Catégories flexibles" />
                </div>
              </div>
            </RevealSection>

            {/* Plan de table */}
            <RevealSection delay={200}>
              <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    🪑
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Plan de table</h3>
                    <p className="text-gray-500 text-sm">Placez vos invités sans prise de tête</p>
                  </div>
                </div>
                <FakeTablePlan />
                <div className="mt-4 flex flex-wrap gap-2">
                  <FeatureBadge icon="🖱️" label="Drag & drop" />
                  <FeatureBadge icon="🖨️" label="Export PDF" />
                  <FeatureBadge icon="📐" label="Vue 2D de la salle" />
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Section 3 : Générateur de devis */}
      <section id="devis" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealSection>
              <div>
                <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-500 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                  📄 Pour les prestataires
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Générez des devis professionnels en 2 minutes
                </h2>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  Fini les tableaux Excel complexes. Créez, envoyez et suivez vos devis directement depuis votre tableau de bord prestataire.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: "⚡", title: "Création rapide", desc: "Ajoutez vos prestations en quelques clics" },
                    { icon: "📤", title: "Envoi instantané", desc: "Le marié reçoit le devis directement dans son espace" },
                    { icon: "🔔", title: "Suivi en temps réel", desc: "Notification dès que le devis est accepté ou refusé" },
                    { icon: "📊", title: "Historique complet", desc: "Retrouvez tous vos devis envoyés et leur statut" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection delay={150}>
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-violet-50 rounded-3xl -z-10" />
                <FakeQuoteGenerator />
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">
                    Devis #2024-046 accepté par Léa & Thomas — <span className="font-bold">2 500 €</span>
                  </p>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Section 4 : Messagerie */}
      <section id="messagerie" className="py-24 bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealSection delay={150}>
              <FakeMessages />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { value: "< 2h", label: "Temps de réponse moyen" },
                  { value: "100%", label: "Conversations sécurisées" },
                  { value: "∞", label: "Messages illimités" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-rose-100 p-3 text-center">
                    <p className="text-rose-400 font-bold text-lg">{s.value}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </RevealSection>

            <RevealSection>
              <div>
                <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-400 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-rose-100">
                  💬 Messagerie intégrée
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Discutez directement avec vos prestataires
                </h2>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                  Plus besoin d'emails interminables. Centralisez toutes vos conversations avec vos prestataires en un seul endroit sécurisé.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: "🔒", title: "Conversations privées", desc: "Vos échanges restent confidentiels sur notre plateforme" },
                    { icon: "📎", title: "Partage de fichiers", desc: "Envoyez vos devis, photos et documents facilement" },
                    { icon: "🔴", title: "Notifications en temps réel", desc: "Badge de message non lu sur votre tableau de bord" },
                    { icon: "📱", title: "Accessible partout", desc: "Consultez vos messages sur mobile et desktop" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 rounded-3xl p-10 md:p-16 text-center shadow-2xl">
              {/* Décorations */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 translate-x-40" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-30 -translate-x-30" />
              <div className="absolute top-6 left-10 text-white/20 text-7xl" style={{ fontFamily: "var(--font-playfair), serif" }}>♥</div>
              <div className="absolute bottom-6 right-10 text-white/15 text-5xl" style={{ fontFamily: "var(--font-playfair), serif" }}>♥</div>

              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-sm font-semibold px-5 py-2 rounded-full mb-6 backdrop-blur-sm">
                  ✦ Inscription 100% gratuite
                </span>
                <h2
                  className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Prêts à organiser le mariage de vos rêves ?
                </h2>
                <p className="text-white/85 text-lg mb-10 max-w-xl mx-auto">
                  Rejoignez des milliers de couples qui font confiance à InstantMariage pour préparer leur plus beau jour.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/inscription"
                    className="bg-white text-rose-500 hover:bg-rose-50 font-bold px-10 py-4 rounded-full text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Commencer gratuitement →
                  </Link>
                  <Link
                    href="/annuaire"
                    className="bg-white/15 hover:bg-white/25 text-white font-semibold px-10 py-4 rounded-full border border-white/40 text-base transition-all duration-200 backdrop-blur-sm"
                  >
                    Voir les prestataires
                  </Link>
                </div>
                <p className="text-white/60 text-sm mt-6">
                  Aucune carte bancaire · Accès immédiat · Données 100% sécurisées
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
