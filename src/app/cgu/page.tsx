import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation – InstantMariage.fr",
  description:
    "Conditions Générales d'Utilisation de la marketplace InstantMariage.fr : règles d'accès, rôles des utilisateurs, abonnements prestataires et responsabilités.",
  openGraph: {
    title: "Conditions Générales d'Utilisation – InstantMariage.fr",
    description:
      "Conditions Générales d'Utilisation de la marketplace InstantMariage.fr : règles d'accès, rôles des utilisateurs, abonnements prestataires et responsabilités.",
    url: "https://instantmariage.fr/cgu",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function CGU() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Conditions d&apos;utilisation
            </p>
            <h1
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-gray-500 text-sm">
              Dernière mise à jour : avril 2026 — Version 1.0
            </p>
          </div>

          <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

            {/* Préambule */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Préambule
              </h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent
                l&apos;accès et l&apos;utilisation de la plateforme InstantMariage.fr (ci-après « la
                Plateforme »), éditée par Adel Bendjelloul (ci-après « l&apos;Éditeur »). En accédant
                à la Plateforme ou en créant un compte, l&apos;utilisateur accepte sans réserve les
                présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser
                la Plateforme.
              </p>
            </section>

            {/* 1. Définitions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                1. Définitions
              </h2>
              <ul className="space-y-2">
                <li><strong className="text-gray-800">Plateforme :</strong> le site web InstantMariage.fr et ses services associés.</li>
                <li><strong className="text-gray-800">Utilisateur :</strong> toute personne accédant à la Plateforme, qu&apos;elle soit ou non inscrite.</li>
                <li><strong className="text-gray-800">Marié(e) :</strong> utilisateur inscrit à la recherche de prestataires de mariage.</li>
                <li><strong className="text-gray-800">Prestataire :</strong> professionnel du secteur du mariage ayant créé un profil sur la Plateforme.</li>
                <li><strong className="text-gray-800">Abonnement :</strong> offre payante donnant accès à des fonctionnalités avancées pour les prestataires.</li>
                <li><strong className="text-gray-800">Contenu :</strong> tous textes, photos, vidéos, avis et informations publiés sur la Plateforme.</li>
              </ul>
            </section>

            {/* 2. Inscription */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                2. Inscription et accès au compte
              </h2>
              <div className="space-y-3">
                <p>
                  L&apos;inscription est gratuite pour les mariés et payante pour les prestataires
                  souhaitant accéder aux fonctionnalités premium. L&apos;utilisateur s&apos;engage à
                  fournir des informations exactes, complètes et à jour lors de son inscription.
                </p>
                <p>
                  Chaque compte est strictement personnel et ne peut être partagé. L&apos;utilisateur
                  est seul responsable de la confidentialité de ses identifiants et de toute activité
                  réalisée depuis son compte.
                </p>
                <p>
                  L&apos;Éditeur se réserve le droit de suspendre ou supprimer tout compte dont les
                  informations s&apos;avèrent fausses, ou dont l&apos;activité viole les présentes CGU,
                  sans préavis ni indemnité.
                </p>
              </div>
            </section>

            {/* 3. Services */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                3. Description des services
              </h2>
              <div className="space-y-3">
                <p>
                  La Plateforme propose les services suivants :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Annuaire de prestataires mariage en France (photographes, traiteurs, DJ, fleuristes, etc.)</li>
                  <li>Système de messagerie privée entre mariés et prestataires</li>
                  <li>Outils de planification : rétroplanning, budget, checklist, liste d&apos;invités</li>
                  <li>Dépôt d&apos;avis par les mariés ayant utilisé un prestataire</li>
                  <li>Publication de blog et contenus d&apos;inspiration mariage</li>
                </ul>
                <p>
                  L&apos;Éditeur se réserve le droit de modifier, suspendre ou interrompre tout ou
                  partie des services à tout moment, sans obligation de préavis.
                </p>
              </div>
            </section>

            {/* 4. Prestataires */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                4. Règles applicables aux prestataires
              </h2>
              <div className="space-y-3">
                <p>
                  Tout prestataire s&apos;inscrivant sur la Plateforme garantit exercer son activité
                  de manière légale, être à jour de ses obligations fiscales et sociales, et disposer
                  des assurances professionnelles requises.
                </p>
                <p>
                  Le prestataire s&apos;engage à :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fournir des informations exactes sur son profil (tarifs, localisation, spécialités)</li>
                  <li>Utiliser uniquement des photos et contenus dont il est titulaire des droits</li>
                  <li>Répondre aux demandes des mariés dans un délai raisonnable</li>
                  <li>Ne pas solliciter des avis frauduleux ou contraires à la réalité</li>
                  <li>Respecter les engagements pris envers les couples</li>
                </ul>
                <p>
                  Tout manquement à ces règles pourra entraîner la suspension ou la suppression du
                  profil, sans remboursement de l&apos;abonnement en cours.
                </p>
              </div>
            </section>

            {/* 5. Abonnements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                5. Abonnements et paiements
              </h2>
              <div className="space-y-3">
                <p>
                  Les prestataires ont accès à des offres d&apos;abonnement payantes pour référencer
                  leur profil et accéder à des fonctionnalités avancées. Les tarifs en vigueur sont
                  affichés sur la page{" "}
                  <a href="/tarifs" className="text-rose-500 hover:underline">Tarifs</a>.
                </p>
                <p>
                  Les paiements sont traités de manière sécurisée via Stripe. En souscrivant un
                  abonnement, le prestataire autorise le prélèvement automatique à la fréquence
                  choisie (mensuelle ou annuelle).
                </p>
                <p>
                  <strong className="text-gray-800">Droit de rétractation :</strong> conformément
                  à l&apos;article L221-18 du Code de la consommation, vous disposez d&apos;un délai
                  de 14 jours à compter de la souscription pour exercer votre droit de rétractation,
                  en envoyant un email à{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>.
                </p>
                <p>
                  La résiliation d&apos;un abonnement prend effet à la fin de la période en cours.
                  Aucun remboursement partiel n&apos;est effectué.
                </p>
              </div>
            </section>

            {/* 6. Avis */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                6. Système d&apos;avis
              </h2>
              <div className="space-y-3">
                <p>
                  Les mariés peuvent laisser un avis sur un prestataire avec lequel ils ont été mis en
                  relation via la Plateforme. Les avis doivent être sincères, fondés sur une expérience
                  réelle et ne pas contenir de propos diffamatoires, injurieux ou trompeurs.
                </p>
                <p>
                  L&apos;Éditeur se réserve le droit de modérer ou supprimer tout avis ne respectant
                  pas ces critères. Les prestataires peuvent signaler un avis qu&apos;ils estiment
                  abusif à{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>.
                </p>
              </div>
            </section>

            {/* 7. Règles de comportement */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                7. Règles de comportement
              </h2>
              <p className="mb-3">Il est strictement interdit sur la Plateforme de :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Publier des contenus illicites, diffamatoires, obscènes ou portant atteinte aux droits des tiers</li>
                <li>Usurper l&apos;identité d&apos;un tiers</li>
                <li>Utiliser des bots, scrapers ou tout moyen automatisé pour collecter des données</li>
                <li>Tenter de contourner les systèmes de sécurité de la Plateforme</li>
                <li>Contacter les autres utilisateurs à des fins de démarchage commercial en dehors des services proposés</li>
                <li>Publier de faux avis ou de fausses informations</li>
              </ul>
            </section>

            {/* 8. Responsabilité */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                8. Limitation de responsabilité
              </h2>
              <div className="space-y-3">
                <p>
                  InstantMariage.fr est une plateforme de mise en relation. L&apos;Éditeur n&apos;est
                  pas partie aux contrats conclus entre mariés et prestataires et ne saurait être tenu
                  responsable de l&apos;inexécution ou de la mauvaise exécution des prestations.
                </p>
                <p>
                  L&apos;Éditeur ne garantit pas la disponibilité permanente et ininterrompue de la
                  Plateforme et se réserve le droit d&apos;effectuer des maintenances susceptibles
                  d&apos;interrompre l&apos;accès.
                </p>
              </div>
            </section>

            {/* 9. Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                9. Propriété intellectuelle
              </h2>
              <p>
                En publiant du contenu sur la Plateforme, l&apos;utilisateur concède à l&apos;Éditeur
                une licence non exclusive, mondiale et gratuite d&apos;utilisation, de reproduction et
                d&apos;affichage dudit contenu, dans le seul but de faire fonctionner et promouvoir la
                Plateforme. L&apos;utilisateur garantit être titulaire des droits nécessaires sur les
                contenus qu&apos;il publie.
              </p>
            </section>

            {/* 10. Modification */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                10. Modification des CGU
              </h2>
              <p>
                L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les
                utilisateurs seront informés par email ou par notification sur la Plateforme. La
                poursuite de l&apos;utilisation de la Plateforme après notification vaut acceptation
                des nouvelles CGU.
              </p>
            </section>

            {/* 11. Droit applicable */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                11. Droit applicable et litiges
              </h2>
              <p>
                Les présentes CGU sont soumises au droit français. En cas de litige, une solution
                amiable sera recherchée en priorité. À défaut, les tribunaux compétents seront ceux
                du ressort du domicile de l&apos;Éditeur. Pour les litiges de consommation, vous
                pouvez recourir à un médiateur agréé conformément à l&apos;article L612-1 du Code de
                la consommation.
              </p>
            </section>

            {/* Contact */}
            <div className="bg-rose-50 rounded-2xl p-6">
              <p className="font-semibold text-gray-800 mb-1">Contact</p>
              <p>
                Pour toute question relative aux présentes CGU :{" "}
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
