import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité – InstantMariage.fr",
  description:
    "Politique de confidentialité RGPD d'InstantMariage.fr : données collectées, finalités, droits des utilisateurs et conservation des données.",
  openGraph: {
    title: "Politique de confidentialité – InstantMariage.fr",
    description:
      "Politique de confidentialité RGPD d'InstantMariage.fr : données collectées, finalités, droits des utilisateurs et conservation des données.",
    url: "https://instantmariage.fr/confidentialite",
    siteName: "InstantMariage.fr",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "InstantMariage.fr" }],
    locale: "fr_FR",
    type: "website",
  },
};

export default function Confidentialite() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Vie privée & RGPD
            </p>
            <h1
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Politique de confidentialité
            </h1>
            <p className="text-gray-500 text-sm">
              Dernière mise à jour : avril 2026 — Conforme au RGPD (UE) 2016/679
            </p>
          </div>

          <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

            {/* Intro */}
            <section>
              <p>
                InstantMariage.fr (ci-après « nous », « la Plateforme ») attache une importance
                fondamentale à la protection de vos données personnelles. La présente politique
                décrit quelles données nous collectons, pourquoi, comment nous les utilisons et
                quels droits vous possédez à leur égard, conformément au Règlement Général sur la
                Protection des Données (RGPD).
              </p>
            </section>

            {/* 1. Responsable */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                1. Responsable du traitement
              </h2>
              <div className="space-y-1">
                <p><strong className="text-gray-800">Responsable :</strong> Adel Bendjelloul</p>
                <p><strong className="text-gray-800">Plateforme :</strong> InstantMariage.fr</p>
                <p>
                  <strong className="text-gray-800">Contact DPO :</strong>{" "}
                  <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                    contact@instantmariage.fr
                  </a>
                </p>
              </div>
            </section>

            {/* 2. Données collectées */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                2. Données que nous collectons
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">2.1 Données fournies lors de l&apos;inscription</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Adresse e-mail et mot de passe (ou compte Google via OAuth)</li>
                    <li>Prénom, nom</li>
                    <li>Rôle sur la plateforme (marié ou prestataire)</li>
                    <li>Pour les prestataires : nom commercial, catégorie, localisation, description, photos, tarifs</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">2.2 Données générées lors de l&apos;utilisation</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Messages échangés via la messagerie interne</li>
                    <li>Avis déposés sur des prestataires</li>
                    <li>Données de planning (rétroplanning, budget, checklist)</li>
                    <li>Logs de connexion (adresse IP, navigateur, date/heure)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">2.3 Données de paiement</h3>
                  <p>
                    Les données bancaires (numéro de carte, etc.) ne transitent jamais par nos serveurs.
                    Elles sont traitées directement et de manière sécurisée par notre prestataire Stripe,
                    certifié PCI DSS niveau 1. Nous ne stockons que les informations de facturation
                    (montant, date, statut de l&apos;abonnement).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">2.4 Newsletter</h3>
                  <p>
                    Si vous vous abonnez à notre newsletter, votre adresse e-mail est transmise à notre
                    prestataire Resend pour l&apos;envoi des communications. Vous pouvez vous désabonner
                    à tout moment via le lien présent dans chaque email.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Finalités */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                3. Finalités et bases légales du traitement
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Finalité</th>
                      <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Base légale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["Création et gestion du compte", "Exécution du contrat"],
                      ["Mise en relation mariés / prestataires", "Exécution du contrat"],
                      ["Gestion des abonnements et paiements", "Exécution du contrat"],
                      ["Envoi de notifications transactionnelles", "Exécution du contrat"],
                      ["Envoi de la newsletter", "Consentement"],
                      ["Modération des avis et contenus", "Intérêt légitime"],
                      ["Amélioration de la Plateforme (statistiques)", "Intérêt légitime"],
                      ["Respect des obligations légales (comptabilité, sécurité)", "Obligation légale"],
                    ].map(([finalite, base]) => (
                      <tr key={finalite} className="hover:bg-gray-50">
                        <td className="p-3 border border-gray-200 text-gray-600">{finalite}</td>
                        <td className="p-3 border border-gray-200 text-gray-600">{base}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Destinataires */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                4. Destinataires des données
              </h2>
              <p className="mb-3">Vos données peuvent être partagées avec les sous-traitants suivants :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-gray-800">Supabase</strong> — base de données et authentification (serveurs UE)</li>
                <li><strong className="text-gray-800">Vercel</strong> — hébergement de l&apos;application</li>
                <li><strong className="text-gray-800">Stripe</strong> — traitement des paiements</li>
                <li><strong className="text-gray-800">Resend</strong> — envoi des e-mails transactionnels et newsletter</li>
              </ul>
              <p className="mt-3">
                Ces prestataires agissent en qualité de sous-traitants et sont liés par des engagements
                de confidentialité. Nous ne vendons ni ne louons vos données à des tiers à des fins
                commerciales.
              </p>
            </section>

            {/* 5. Transferts hors UE */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                5. Transferts hors Union européenne
              </h2>
              <p>
                Certains de nos sous-traitants (Vercel, Stripe, Resend) sont établis aux États-Unis.
                Ces transferts sont encadrés par des clauses contractuelles types approuvées par la
                Commission européenne, garantissant un niveau de protection adéquat de vos données.
              </p>
            </section>

            {/* 6. Conservation */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                6. Durée de conservation
              </h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-gray-800">Données de compte :</strong> durée de la relation contractuelle + 3 ans après la clôture du compte</li>
                <li><strong className="text-gray-800">Messages :</strong> 2 ans après le dernier échange</li>
                <li><strong className="text-gray-800">Données de facturation :</strong> 10 ans (obligation comptable légale)</li>
                <li><strong className="text-gray-800">Logs de connexion :</strong> 12 mois</li>
                <li><strong className="text-gray-800">Newsletter :</strong> jusqu&apos;au désabonnement</li>
              </ul>
            </section>

            {/* 7. Vos droits */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                7. Vos droits
              </h2>
              <p className="mb-3">
                Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="space-y-2 ml-2">
                <li><strong className="text-gray-800">Droit d&apos;accès :</strong> obtenir une copie des données que nous détenons sur vous.</li>
                <li><strong className="text-gray-800">Droit de rectification :</strong> corriger des données inexactes ou incomplètes.</li>
                <li><strong className="text-gray-800">Droit à l&apos;effacement :</strong> demander la suppression de vos données (« droit à l&apos;oubli »).</li>
                <li><strong className="text-gray-800">Droit à la limitation :</strong> suspendre temporairement le traitement de vos données.</li>
                <li><strong className="text-gray-800">Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine.</li>
                <li><strong className="text-gray-800">Droit d&apos;opposition :</strong> vous opposer à certains traitements fondés sur l&apos;intérêt légitime.</li>
                <li><strong className="text-gray-800">Retrait du consentement :</strong> retirer à tout moment votre consentement pour les traitements qui en dépendent (ex. newsletter).</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, adressez votre demande par email à{" "}
                <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline">
                  contact@instantmariage.fr
                </a>.
                Nous répondrons dans un délai maximum de 30 jours. Vous pouvez également introduire
                une réclamation auprès de la{" "}
                <strong className="text-gray-800">CNIL</strong> (Commission Nationale de
                l&apos;Informatique et des Libertés) — cnil.fr.
              </p>
            </section>

            {/* 8. Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                8. Cookies et traceurs
              </h2>
              <div className="space-y-3">
                <p>
                  La Plateforme utilise des cookies strictement nécessaires à son fonctionnement
                  (session d&apos;authentification, sécurité). Ces cookies ne requièrent pas votre
                  consentement.
                </p>
                <p>
                  Si nous mettons en place des cookies analytiques ou publicitaires à l&apos;avenir,
                  nous recueillerons votre consentement préalable via un bandeau dédié, conformément
                  aux recommandations de la CNIL.
                </p>
                <p>
                  Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies.
                  Consulter l&apos;aide de votre navigateur pour plus d&apos;informations.
                </p>
              </div>
            </section>

            {/* 9. Sécurité */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                9. Sécurité des données
              </h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
                protéger vos données contre l&apos;accès non autorisé, la divulgation, l&apos;altération
                ou la destruction : chiffrement des communications (HTTPS/TLS), authentification
                sécurisée, accès aux données restreint aux personnes habilitées, infrastructure
                hébergée chez des prestataires certifiés.
              </p>
            </section>

            {/* 10. Mineurs */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                10. Mineurs
              </h2>
              <p>
                La Plateforme n&apos;est pas destinée aux personnes de moins de 18 ans. Nous ne
                collectons pas sciemment de données personnelles concernant des mineurs. Si vous
                pensez qu&apos;un mineur nous a fourni des données sans consentement parental,
                contactez-nous afin que nous puissions les supprimer.
              </p>
            </section>

            {/* 11. Mise à jour */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                11. Mise à jour de la politique
              </h2>
              <p>
                Nous pouvons modifier la présente politique à tout moment pour refléter
                l&apos;évolution de nos pratiques ou de la réglementation. La date de mise à jour
                indiquée en haut de page est modifiée à chaque révision. En cas de modification
                substantielle, nous vous en informerons par email.
              </p>
            </section>

            {/* Contact */}
            <div className="bg-rose-50 rounded-2xl p-6">
              <p className="font-semibold text-gray-800 mb-1">Questions sur vos données ?</p>
              <p>
                Contactez notre responsable de la protection des données à{" "}
                <a href="mailto:contact@instantmariage.fr" className="text-rose-500 hover:underline font-medium">
                  contact@instantmariage.fr
                </a>.
                Nous répondrons dans un délai de 30 jours ouvrés.
              </p>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
