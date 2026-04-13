import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité – InstantMariage.fr",
  description:
    "Déclaration d'accessibilité d'InstantMariage.fr : niveau de conformité RGAA, limitations connues et moyens de nous contacter pour signaler un problème d'accessibilité.",
  alternates: { canonical: "/accessibilite" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Déclaration d'accessibilité – InstantMariage.fr",
    description:
      "Déclaration d'accessibilité d'InstantMariage.fr : niveau de conformité RGAA, limitations connues et moyens de nous contacter.",
    url: "https://instantmariage.fr/accessibilite",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function AccessibilitePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Accessibilité numérique
            </p>
            <h1
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Déclaration d&apos;accessibilité
            </h1>
            <p className="text-gray-500 text-sm">
              Dernière mise à jour : avril 2026 — Conforme RGAA 4.1
            </p>
          </div>

          <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

            {/* Engagements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Notre engagement
              </h2>
              <p>
                InstantMariage.fr s&apos;engage à rendre son site internet accessible conformément
                à l&apos;article 47 de la loi n° 2005-102 du 11 février 2005 et au décret n° 2019-768
                du 24 juillet 2019. La présente déclaration d&apos;accessibilité s&apos;applique au
                site{" "}
                <a href="https://instantmariage.fr" className="text-rose-500 hover:underline">
                  instantmariage.fr
                </a>.
              </p>
            </section>

            {/* État de conformité */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                État de conformité
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">!</span>
                  <p className="font-semibold text-gray-800">Partiellement conforme</p>
                </div>
                <p className="text-gray-500 text-sm">
                  InstantMariage.fr est <strong className="text-gray-700">partiellement conforme</strong> avec
                  le référentiel général d&apos;amélioration de l&apos;accessibilité (RGAA) version 4.1,
                  en raison des non-conformités et des dérogations énumérées ci-dessous.
                </p>
              </div>
              <p>
                Un audit interne a été réalisé en avril 2026. Nous travaillons activement à améliorer
                le niveau d&apos;accessibilité du site afin d&apos;atteindre la conformité totale aux
                critères WCAG 2.1 niveau AA.
              </p>
            </section>

            {/* Contenus non accessibles */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Contenus non accessibles
              </h2>

              <h3 className="font-semibold text-gray-800 mb-3">Non-conformités identifiées</h3>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-6">
                <li>
                  <strong className="text-gray-700">Critère 1.1 :</strong> Certaines images décoratives
                  peuvent ne pas avoir d&apos;attribut <code className="bg-gray-100 px-1 rounded">alt</code> vide.
                </li>
                <li>
                  <strong className="text-gray-700">Critère 3.3 :</strong> Quelques contrastes de couleur
                  sur les textes secondaires (gris clair sur fond blanc) peuvent être insuffisants pour
                  les utilisateurs malvoyants.
                </li>
                <li>
                  <strong className="text-gray-700">Critère 4.1 :</strong> Certains médias vidéo (visuels
                  d&apos;inspiration) ne disposent pas de sous-titres ou de transcription textuelle.
                </li>
                <li>
                  <strong className="text-gray-700">Critère 7.1 :</strong> La navigation au clavier dans
                  certains composants interactifs (filtres de recherche) peut être perfectible.
                </li>
                <li>
                  <strong className="text-gray-700">Critère 10.7 :</strong> Quelques éléments de formulaire
                  ne présentent pas de style de focus visible systématiquement.
                </li>
              </ul>

              <h3 className="font-semibold text-gray-800 mb-3">Dérogations pour charge disproportionnée</h3>
              <p>
                Les contenus tiers intégrés (Stripe pour le paiement, Google Analytics pour
                l&apos;audience) sont soumis aux politiques d&apos;accessibilité de leurs éditeurs
                respectifs et font l&apos;objet d&apos;une dérogation pour charge disproportionnée.
              </p>
            </section>

            {/* Technologies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Technologies utilisées
              </h2>
              <p className="mb-3">Le site InstantMariage.fr est développé avec les technologies suivantes :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>HTML5 sémantique</li>
                <li>CSS3 / Tailwind CSS</li>
                <li>JavaScript / TypeScript</li>
                <li>Next.js 14 (React) — génération statique et rendu côté serveur</li>
                <li>ARIA (Accessible Rich Internet Applications) sur les composants interactifs</li>
              </ul>
            </section>

            {/* Environnement de test */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Environnement de test
              </h2>
              <p className="mb-3">
                Les vérifications d&apos;accessibilité ont été réalisées avec les combinaisons
                navigateur / technologie d&apos;assistance suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Chrome 123 + NVDA (Windows)</li>
                <li>Safari 17 + VoiceOver (macOS / iOS)</li>
                <li>Firefox 124 + NVDA (Windows)</li>
              </ul>
            </section>

            {/* Signaler un problème */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Signaler un problème
              </h2>
              <p className="mb-3">
                Si vous rencontrez un problème d&apos;accessibilité vous empêchant d&apos;accéder
                à un contenu ou une fonctionnalité, vous pouvez :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Nous écrire à{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>{" "}
                  en indiquant la page concernée et la description du problème.
                </li>
                <li>
                  Utiliser notre{" "}
                  <a href="/contact" className="text-rose-500 hover:underline">
                    formulaire de contact
                  </a>.
                </li>
              </ul>
              <p className="mt-3">
                Nous nous engageons à vous répondre dans un délai de <strong className="text-gray-700">5 jours ouvrés</strong> et
                à vous proposer une alternative accessible si nécessaire.
              </p>
            </section>

            {/* Voie de recours */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Voie de recours
              </h2>
              <p>
                Si vous n&apos;obtenez pas de réponse satisfaisante de notre part, vous pouvez
                contacter le{" "}
                <a
                  href="https://www.defenseurdesdroits.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:underline"
                >
                  Défenseur des droits
                </a>{" "}
                (défenseur des droits en ligne ou par courrier postal : Défenseur des droits —
                Libre réponse 71120 — 75342 Paris CEDEX 07).
              </p>
            </section>

            {/* Contact */}
            <div className="bg-rose-50 rounded-2xl p-6">
              <p className="font-semibold text-gray-800 mb-1">Contact accessibilité</p>
              <p>
                Pour tout signalement ou demande relative à l&apos;accessibilité de notre site :{" "}
                <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline font-medium">
                  contact@instantmariage.fr
                </a>
              </p>
              <p className="mt-2 text-xs text-gray-400">
                InstantMariage.fr — Adel Bendjelloul — France
              </p>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
