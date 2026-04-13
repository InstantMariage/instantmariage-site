import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique des cookies – InstantMariage.fr",
  description:
    "Politique de gestion des cookies d'InstantMariage.fr : types de cookies utilisés, finalités, durée de conservation et comment les désactiver.",
  alternates: { canonical: "/cookies" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Politique des cookies – InstantMariage.fr",
    description:
      "Politique de gestion des cookies d'InstantMariage.fr : types de cookies utilisés, finalités, durée de conservation et comment les désactiver.",
    url: "https://instantmariage.fr/cookies",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Vie privée &amp; RGPD
            </p>
            <h1
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Politique des cookies
            </h1>
            <p className="text-gray-500 text-sm">
              Dernière mise à jour : avril 2026 — Version 1.0
            </p>
          </div>

          <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Qu&apos;est-ce qu&apos;un cookie ?
              </h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette,
                téléphone mobile) lors de votre visite sur notre site. Il permet au site de mémoriser
                des informations sur votre navigation et de vous reconnaître lors d&apos;une visite
                ultérieure. Les cookies ne peuvent pas endommager votre appareil et ne contiennent
                pas de virus.
              </p>
            </section>

            {/* Types de cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Les cookies que nous utilisons
              </h2>

              <div className="space-y-6">
                {/* Cookies essentiels */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">✓</span>
                    <h3 className="font-semibold text-gray-800">Cookies strictement nécessaires</h3>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">Toujours actifs</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">
                    Ces cookies sont indispensables au fonctionnement du site. Ils permettent notamment
                    de gérer votre session d&apos;authentification, de mémoriser vos préférences de
                    navigation et d&apos;assurer la sécurité de votre compte.
                  </p>
                  <table className="w-full text-xs text-gray-500">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Nom</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Finalité</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 font-mono">sb-access-token</td>
                        <td className="py-2">Session utilisateur (Supabase Auth)</td>
                        <td className="py-2">1 heure</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">sb-refresh-token</td>
                        <td className="py-2">Renouvellement de session</td>
                        <td className="py-2">30 jours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Cookies analytiques */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">~</span>
                    <h3 className="font-semibold text-gray-800">Cookies analytiques</h3>
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">Optionnels</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">
                    Ces cookies nous permettent de mesurer l&apos;audience du site, de comprendre
                    comment vous naviguez et d&apos;améliorer nos contenus et fonctionnalités. Les
                    données collectées sont anonymisées et agrégées.
                  </p>
                  <table className="w-full text-xs text-gray-500">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Service</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Finalité</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2">Google Analytics 4</td>
                        <td className="py-2">Mesure d&apos;audience, pages vues, comportement</td>
                        <td className="py-2">13 mois</td>
                      </tr>
                      <tr>
                        <td className="py-2">Vercel Analytics</td>
                        <td className="py-2">Performances et disponibilité du site</td>
                        <td className="py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Cookies de paiement */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">$</span>
                    <h3 className="font-semibold text-gray-800">Cookies tiers — Paiement</h3>
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-1 rounded-full">Stripe</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Lors du processus de paiement, Stripe dépose des cookies techniques nécessaires à la
                    sécurisation des transactions et à la prévention de la fraude. Ces cookies sont
                    régis par la{" "}
                    <a
                      href="https://stripe.com/fr/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-500 hover:underline"
                    >
                      politique de confidentialité de Stripe
                    </a>.
                  </p>
                </div>
              </div>
            </section>

            {/* Base légale */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Base légale (RGPD)
              </h2>
              <div className="space-y-3">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement
                  UE 2016/679) et à la loi Informatique et Libertés modifiée, les cookies strictement
                  nécessaires reposent sur l&apos;<strong className="text-gray-800">intérêt légitime</strong> de
                  l&apos;éditeur (fonctionnement du service).
                </p>
                <p>
                  Les cookies analytiques et optionnels sont déposés uniquement avec votre{" "}
                  <strong className="text-gray-800">consentement préalable</strong>, conformément à
                  la directive ePrivacy et aux recommandations de la CNIL.
                </p>
              </div>
            </section>

            {/* Gestion du consentement */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Gérer vos préférences
              </h2>
              <div className="space-y-3">
                <p>
                  Vous pouvez à tout moment modifier vos préférences en matière de cookies via les
                  paramètres de votre navigateur. Voici comment procéder selon votre navigateur :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong className="text-gray-800">Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies
                  </li>
                  <li>
                    <strong className="text-gray-800">Firefox :</strong> Préférences → Vie privée et sécurité
                  </li>
                  <li>
                    <strong className="text-gray-800">Safari :</strong> Préférences → Confidentialité
                  </li>
                  <li>
                    <strong className="text-gray-800">Edge :</strong> Paramètres → Cookies et données de site
                  </li>
                </ul>
                <p>
                  La désactivation des cookies analytiques n&apos;affecte pas votre expérience de
                  navigation sur InstantMariage.fr. En revanche, la désactivation des cookies
                  essentiels peut empêcher la connexion à votre compte.
                </p>
                <p>
                  Pour vous opposer aux cookies Google Analytics, vous pouvez également installer
                  le{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-500 hover:underline"
                  >
                    module complémentaire de désactivation
                  </a>{" "}
                  proposé par Google.
                </p>
              </div>
            </section>

            {/* Durée de conservation */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Durée de conservation
              </h2>
              <p>
                Conformément aux recommandations de la CNIL, la durée maximale de conservation des
                cookies soumis à consentement est de <strong className="text-gray-800">13 mois</strong> à
                compter du premier dépôt. Passé ce délai, votre consentement sera à nouveau sollicité.
                Les cookies de session sont supprimés à la fermeture de votre navigateur.
              </p>
            </section>

            {/* Vos droits */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Vos droits
              </h2>
              <p className="mb-3">
                Conformément au RGPD, vous disposez des droits suivants concernant vos données
                personnelles collectées via les cookies :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Droit d&apos;accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
                <li>Droit d&apos;opposition au traitement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, contactez-nous à{" "}
                <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                  contact@instantmariage.fr
                </a>. Vous pouvez également introduire une réclamation auprès de la{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:underline"
                >
                  CNIL
                </a>.
              </p>
            </section>

            {/* Contact */}
            <div className="bg-rose-50 rounded-2xl p-6">
              <p className="font-semibold text-gray-800 mb-1">Délégué à la protection des données</p>
              <p>
                Pour toute question relative à notre politique de cookies ou à vos données
                personnelles :{" "}
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
