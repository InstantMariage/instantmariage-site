import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales – InstantMariage.fr",
  description:
    "Mentions légales du site InstantMariage.fr : éditeur, hébergeur, directeur de publication et informations de contact.",
  alternates: { canonical: "/mentions-legales" },
  openGraph: {
    title: "Mentions légales – InstantMariage.fr",
    description:
      "Mentions légales du site InstantMariage.fr : éditeur, hébergeur, directeur de publication et informations de contact.",
    url: "https://instantmariage.fr/mentions-legales",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* En-tête */}
          <div className="mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Informations légales
            </p>
            <h1
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Mentions légales
            </h1>
            <p className="text-gray-500 text-sm">
              Dernière mise à jour : 23 avril 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-10">

            {/* 1. Éditeur */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                1. Éditeur du site
              </h2>
              <div className="text-gray-600 space-y-2 text-sm leading-relaxed">
                <p><strong className="text-gray-800">Raison sociale :</strong> Mohamed Adel BENDJELLOUL</p>
                <p><strong className="text-gray-800">Statut :</strong> Entrepreneur individuel (micro-entrepreneur)</p>
                <p><strong className="text-gray-800">SIRET :</strong> 922 397 195 00012</p>
                <p><strong className="text-gray-800">Code APE/NAF :</strong> 7021Z – Conseil en relations publiques et communication</p>
                <p><strong className="text-gray-800">Siège social :</strong> Arc 2000, Bâtiment B, 35 Route des Milles, 13090 Aix-en-Provence</p>
                <p><strong className="text-gray-800">Adresse e-mail :</strong>{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>
                </p>
                <p><strong className="text-gray-800">TVA :</strong> TVA non applicable, article 293 B du CGI (franchise en base de TVA)</p>
              </div>
            </section>

            {/* 2. Directeur de la publication */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                2. Directeur de la publication
              </h2>
              <div className="text-gray-600 space-y-2 text-sm leading-relaxed">
                <p>
                  Mohamed Adel BENDJELLOUL, en qualité d&apos;entrepreneur individuel.
                </p>
              </div>
            </section>

            {/* 3. Hébergeur */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                3. Hébergeur
              </h2>
              <div className="text-gray-600 space-y-2 text-sm leading-relaxed">
                <p><strong className="text-gray-800">Raison sociale :</strong> Vercel Inc.</p>
                <p><strong className="text-gray-800">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
                <p><strong className="text-gray-800">Site web :</strong> vercel.com</p>
                <p><strong className="text-gray-800">Contact :</strong> via vercel.com/help</p>
              </div>
            </section>

            {/* 4. Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                4. Propriété intellectuelle
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                L&apos;ensemble du contenu présent sur le site InstantMariage.fr (textes, images, graphismes,
                logo, icônes, sons, logiciels, etc.) est la propriété exclusive de son éditeur ou de ses
                partenaires et est protégé par les lois françaises et internationales relatives à la propriété
                intellectuelle. Toute reproduction, représentation, modification, publication ou adaptation de
                tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
                sans l&apos;autorisation écrite préalable de l&apos;éditeur.
              </p>
            </section>

            {/* 5. Limitation de responsabilité */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                5. Limitation de responsabilité
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                InstantMariage.fr s&apos;efforce de fournir des informations aussi précises que possible.
                Toutefois, l&apos;éditeur ne pourra être tenu responsable des omissions, des inexactitudes et
                des carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers
                partenaires qui lui fournissent ces informations. Les informations présentes sur le site sont
                non-contractuelles et peuvent être modifiées à tout moment.
              </p>
            </section>

            {/* 6. Données personnelles / RGPD */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                6. Données personnelles et RGPD
              </h2>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  <strong className="text-gray-800">Responsable du traitement :</strong> Mohamed Adel BENDJELLOUL –{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>
                </p>
                <p>
                  <strong className="text-gray-800">Bases légales :</strong> exécution du contrat (art. 6.1.b RGPD)
                  pour la gestion des comptes et des transactions ; consentement (art. 6.1.a RGPD) pour les
                  communications marketing.
                </p>
                <p>
                  <strong className="text-gray-800">Durée de conservation :</strong> 3 ans après la dernière
                  activité du compte, puis anonymisation des données.
                </p>
                <p><strong className="text-gray-800">Vos droits (RGPD) :</strong></p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Droit d&apos;accès (art. 15)</li>
                  <li>Droit de rectification (art. 16)</li>
                  <li>Droit à l&apos;effacement (art. 17)</li>
                  <li>Droit à la limitation du traitement (art. 18)</li>
                  <li>Droit à la portabilité (art. 20)</li>
                  <li>Droit d&apos;opposition (art. 21)</li>
                  <li>Droit de retrait du consentement à tout moment</li>
                </ul>
                <p>
                  Pour exercer ces droits, adressez votre demande accompagnée d&apos;une copie de votre pièce
                  d&apos;identité à{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>.
                </p>
                <p>
                  En cas de réclamation, vous pouvez saisir la Commission Nationale de l&apos;Informatique et
                  des Libertés (CNIL) : <span className="text-gray-700">www.cnil.fr</span>.
                </p>
                <p>
                  Pour en savoir plus, consultez notre{" "}
                  <a href="/confidentialite" className="text-rose-500 hover:underline">
                    Politique de confidentialité
                  </a>.
                </p>
              </div>
            </section>

            {/* 7. Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                7. Cookies
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Le site InstantMariage.fr utilise des cookies pour améliorer l&apos;expérience utilisateur,
                mesurer l&apos;audience et sécuriser l&apos;authentification. Lors de votre première visite,
                un bandeau de consentement vous permet d&apos;accepter ou de refuser les cookies non
                essentiels. Vous pouvez également configurer votre navigateur pour refuser les cookies à tout
                moment, étant entendu que certaines fonctionnalités du site pourraient alors ne plus
                fonctionner correctement.
              </p>
            </section>

            {/* 8. Médiation de la consommation */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                8. Médiation de la consommation
              </h2>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Conformément aux articles L.616-1 et R.616-1 du code de la consommation, InstantMariage a
                  mis en place un dispositif de médiation de la consommation. L&apos;entité de médiation
                  retenue est <strong className="text-gray-800">MEDIATION CONSOMMATION DÉVELOPPEMENT (MED CONSO DEV)</strong>.
                </p>
                <p>
                  <strong className="text-gray-800">Adresse :</strong> Centre d&apos;Affaires Stéphanois SAS,
                  Immeuble L&apos;Horizon – Esplanade de France, 3 rue J. Constant Milleret, 42000 Saint-Étienne
                </p>
                <p>
                  <strong className="text-gray-800">Site web :</strong>{" "}
                  <span className="text-gray-700">www.medconsodev.eu</span>
                </p>
                <p>
                  <strong className="text-gray-800">Numéro d&apos;adhérent :</strong>{" "}
                  <span className="italic text-gray-500">[À compléter — adhésion en cours de validation]</span>
                </p>
                <p>
                  En cas de litige, après avoir tenté une réclamation écrite auprès de nos services restée
                  sans réponse satisfaisante sous 2 mois, le consommateur peut saisir le médiateur
                  gratuitement via le site <span className="text-gray-700">medconsodev.eu</span>.
                </p>
                <p>
                  Le consommateur peut également recourir à la plateforme européenne de règlement en ligne
                  des litiges :{" "}
                  <span className="text-gray-700">https://ec.europa.eu/consumers/odr</span>
                </p>
              </div>
            </section>

            {/* 9. Droit applicable */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                9. Droit applicable
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tout litige en relation avec l&apos;utilisation du site InstantMariage.fr est soumis au droit
                français. En l&apos;absence de résolution amiable ou par voie de médiation, les tribunaux
                compétents sont ceux du ressort du Tribunal judiciaire d&apos;Aix-en-Provence, sauf
                dispositions légales contraires.
              </p>
            </section>

            {/* Contact */}
            <div className="bg-rose-50 rounded-2xl p-6 text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">Une question ?</p>
              <p>
                Contactez-nous à{" "}
                <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline font-medium">
                  contact@instantmariage.fr
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
