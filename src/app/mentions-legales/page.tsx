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
              Dernière mise à jour : avril 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-10">

            {/* 1. Éditeur */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                1. Éditeur du site
              </h2>
              <div className="text-gray-600 space-y-2 text-sm leading-relaxed">
                <p><strong className="text-gray-800">Nom du site :</strong> InstantMariage.fr</p>
                <p><strong className="text-gray-800">Directeur de la publication :</strong> Adel Bendjelloul</p>
                <p><strong className="text-gray-800">Adresse e-mail :</strong>{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>
                </p>
                <p><strong className="text-gray-800">Statut :</strong> Entreprise individuelle / Porteur de projet</p>
              </div>
            </section>

            {/* 2. Hébergeur */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                2. Hébergeur
              </h2>
              <div className="text-gray-600 space-y-2 text-sm leading-relaxed">
                <p><strong className="text-gray-800">Raison sociale :</strong> Vercel Inc.</p>
                <p><strong className="text-gray-800">Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
                <p><strong className="text-gray-800">Site web :</strong>{" "}
                  <span className="text-gray-600">vercel.com</span>
                </p>
              </div>
            </section>

            {/* 3. Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                3. Propriété intellectuelle
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

            {/* 4. Responsabilité */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                4. Limitation de responsabilité
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                InstantMariage.fr s&apos;efforce de fournir des informations aussi précises que possible.
                Toutefois, l&apos;éditeur ne pourra être tenu responsable des omissions, des inexactitudes et
                des carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers
                partenaires qui lui fournissent ces informations. Les informations présentes sur le site sont
                non-contractuelles et peuvent être modifiées à tout moment.
              </p>
            </section>

            {/* 5. Données personnelles */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                5. Données personnelles
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Les informations collectées sur ce site font l&apos;objet d&apos;un traitement informatique
                destiné à la gestion des utilisateurs et des prestataires inscrits. Conformément au Règlement
                Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du
                6 janvier 1978 modifiée, vous disposez d&apos;un droit d&apos;accès, de rectification, de
                suppression et de portabilité de vos données. Pour exercer ces droits, adressez votre demande
                à{" "}
                <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                  contact@instantmariage.fr
                </a>.
                Pour en savoir plus, consultez notre{" "}
                <a href="/confidentialite" className="text-rose-500 hover:underline">
                  Politique de confidentialité
                </a>.
              </p>
            </section>

            {/* 6. Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                6. Cookies
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Le site InstantMariage.fr peut utiliser des cookies pour améliorer l&apos;expérience
                utilisateur, mesurer l&apos;audience et sécuriser l&apos;authentification. Vous pouvez
                configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site
                pourraient alors ne pas fonctionner correctement.
              </p>
            </section>

            {/* 7. Droit applicable */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                7. Droit applicable
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tout litige en relation avec l&apos;utilisation du site InstantMariage.fr est soumis au droit
                français. Les tribunaux compétents sont ceux du ressort du domicile de l&apos;éditeur, sauf
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
