export type ContentBlock =
  | { type: "intro"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  metaDescription: string;
  keywords: string;
  content: ContentBlock[];
}

export const seoArticles: Article[] = [
  /* ─────────────────────────────────────────────────────────────
     1. GUIDE ORGANISATION 2026
  ───────────────────────────────────────────────────────────── */
  {
    slug: "comment-organiser-son-mariage-guide-2026",
    title: "Comment organiser son mariage : le guide complet 2026",
    excerpt:
      "De la demande en mariage à la lune de miel, découvrez notre guide pas-à-pas pour organiser votre mariage en France en 2026 : rétroplanning, prestataires, budget et astuces de pros.",
    category: "Organisation",
    date: "10 janvier 2026",
    readTime: "15 min",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    metaDescription:
      "Guide complet pour organiser son mariage en France en 2026 : rétroplanning, budget, choix des prestataires, checklist et conseils d'experts pas-à-pas.",
    keywords:
      "comment organiser son mariage, guide mariage 2026, organisation mariage France, rétroplanning mariage",
    content: [
      {
        type: "intro",
        text: "Organiser son mariage est l'un des projets les plus excitants — et les plus complexes — d'une vie. Entre la salle, le traiteur, la robe, le photographe et les centaines de petits détails, il est facile de se sentir dépassé. Ce guide complet vous accompagne étape par étape, du premier jour après la demande jusqu'au grand soir.",
      },
      { type: "h2", text: "Par où commencer ?" },
      {
        type: "p",
        text: "Avant de contacter le moindre prestataire, prenez le temps de poser les fondations. Toutes les décisions qui suivront en découleront directement.",
      },
      {
        type: "ul",
        items: [
          "Définissez votre budget total (et une marge de 10 % pour les imprévus)",
          "Choisissez une date ou une période (saison, jour de la semaine)",
          "Estimez le nombre d'invités approximatif",
          "Précisez votre vision : mariage intime, grande fête, champêtre, urbain…",
          "Décidez du lieu géographique : ville, région, destination",
        ],
      },
      {
        type: "tip",
        title: "Conseil pro",
        text: "Avant tout, discutez en couple de vos priorités absolues. Si la photo est votre priorité n°1, allouez-y 15 % du budget. Si c'est le traiteur, montez à 35 %. Aligner vos valeurs dès le départ évite 90 % des tensions.",
      },
      { type: "h2", text: "J-18 mois : les premières décisions stratégiques" },
      {
        type: "p",
        text: "Dix-huit mois, ça semble loin — et pourtant les meilleures salles et les photographes les plus demandés sont souvent réservés deux ans à l'avance pour les week-ends de juin et septembre.",
      },
      {
        type: "ol",
        items: [
          "Réservez la salle de réception en priorité absolue",
          "Choisissez et réservez votre photographe/vidéaste",
          "Constituez vos listes d'invités (deux côtés de la famille)",
          "Envoyez les save-the-date dès que la date est confirmée",
          "Commencez à explorer les robes de mariée (les délais de confection dépassent 6 mois)",
          "Rencontrez 2 ou 3 officiers de cérémonie si vous optez pour une cérémonie laïque",
        ],
      },
      { type: "h2", text: "J-12 mois : réserver les prestataires clés" },
      {
        type: "p",
        text: "À un an du grand jour, il est temps de compléter votre équipe. Les traiteurs, DJ et fleuristes ont souvent plusieurs mariages le même week-end — ne tardez pas.",
      },
      {
        type: "ul",
        items: [
          "Sélectionnez et réservez votre traiteur (demandez 3 devis minimum)",
          "Réservez DJ ou groupe de musique",
          "Choisissez votre fleuriste et établissez un premier moodboard floral",
          "Commandez ou choisissez la robe (premiers essayages)",
          "Planifiez la lune de miel et réservez vols/hébergements",
          "Pensez aux tenues des témoins et des enfants d'honneur",
        ],
      },
      {
        type: "quote",
        text: "Le traiteur représente souvent 30 à 40 % du budget total d'un mariage. C'est le poste sur lequel les couples regrettent le plus d'avoir économisé.",
        author: "Chef traiteur, partenaire InstantMariage",
      },
      { type: "h2", text: "J-6 mois : les détails qui font la différence" },
      {
        type: "p",
        text: "La moitié du chemin est parcourue. C'est maintenant que les décisions de style et de personnalisation prennent forme.",
      },
      {
        type: "ul",
        items: [
          "Envoyez les faire-part officiels",
          "Créez votre site de mariage (avec formulaire RSVP)",
          "Choisissez la papeterie (menus, plan de table, marque-places)",
          "Dégustations avec le traiteur",
          "Définissez les alliances (délai de fabrication : 6 à 8 semaines)",
          "Organisez l'enterrement de vie de garçon/jeune fille",
          "Rencontrez à nouveau tous vos prestataires pour un point de coordination",
        ],
      },
      { type: "h2", text: "J-3 mois : les finitions" },
      {
        type: "ul",
        items: [
          "Confirmez le nombre définitif d'invités et finalisez le plan de table",
          "Récupérez et essayez la robe (ajustements finaux)",
          "Préparez les discours et la cérémonie",
          "Réservez le coiffeur et la maquilleuse",
          "Commandez le gâteau de mariage",
          "Préparez les cadeaux d'invités",
          "Récupérez les alliances et vérifiez qu'elles sont à la bonne taille",
        ],
      },
      { type: "h2", text: "J-1 mois : les derniers préparatifs" },
      {
        type: "ul",
        items: [
          "Envoyez le planning détaillé à tous les prestataires",
          "Confirmez les horaires, adresses et accès avec chacun",
          "Prévoyez la logistique transport (navette, parking)",
          "Préparez les enveloppes de paiement prestataires pour le jour J",
          "Faites un essai coiffure et maquillage",
          "Déposez les affaires à la salle si possible",
        ],
      },
      { type: "h2", text: "La semaine J : relâchez la pression" },
      {
        type: "p",
        text: "La planification est terminée. Votre rôle cette semaine est de vous reposer, de profiter de vos proches et de faire confiance à l'équipe que vous avez soigneusement choisie.",
      },
      {
        type: "tip",
        title: "Le secret des mariages réussis",
        text: "Désignez un coordinateur de jour (un témoin de confiance ou un wedding planner) qui gérera les imprévus le jour J. Vous n'aurez ainsi qu'à profiter de chaque instant.",
      },
      { type: "h2", text: "Conclusion" },
      {
        type: "p",
        text: "Un mariage bien organisé, c'est avant tout un mariage où les mariés profitent pleinement. Utilisez ce guide comme boussole, pas comme contrainte. Chaque couple est unique — adaptez le rétroplanning à votre rythme et vos priorités. Et si vous avez besoin d'aide pour trouver les meilleurs prestataires dans votre région, l'annuaire InstantMariage est là pour ça.",
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     2. BUDGET MARIAGE FRANCE 2026
  ───────────────────────────────────────────────────────────── */
  {
    slug: "budget-mariage-combien-coute-mariage-france-2026",
    title: "Budget mariage : combien coûte un mariage en France en 2026 ?",
    excerpt:
      "Salle, traiteur, photographe, fleurs, robe… Découvrez le coût réel d'un mariage en France en 2026, poste par poste, avec des conseils pour maîtriser votre budget sans sacrifier le rêve.",
    category: "Budget",
    date: "15 janvier 2026",
    readTime: "12 min",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80",
    metaDescription:
      "Combien coûte un mariage en France en 2026 ? Budget moyen, répartition par poste, astuces d'économies : tout ce qu'il faut savoir avant de planifier.",
    keywords:
      "budget mariage France 2026, coût mariage France, combien coûte un mariage, budget moyen mariage",
    content: [
      {
        type: "intro",
        text: "Combien coûte vraiment un mariage en France en 2026 ? C'est la question que se posent tous les futurs mariés. La réponse varie énormément selon la région, le nombre d'invités et les choix de chacun. Dans cet article, nous décortiquons chaque poste de dépense avec des chiffres réels pour vous aider à construire un budget solide.",
      },
      { type: "h2", text: "Le budget moyen d'un mariage en France en 2026" },
      {
        type: "p",
        text: "En 2026, le coût moyen d'un mariage en France se situe entre 15 000 € et 25 000 € pour une cérémonie de 80 à 100 invités. Les mariages plus modestes descendent à 8 000-12 000 €, tandis que les réceptions luxueuses dépassent facilement 50 000 €.",
      },
      {
        type: "table",
        headers: ["Taille du mariage", "Nombre d'invités", "Budget estimé"],
        rows: [
          ["Intime", "20-40 invités", "5 000 – 10 000 €"],
          ["Intermédiaire", "50-80 invités", "10 000 – 20 000 €"],
          ["Standard", "80-120 invités", "20 000 – 35 000 €"],
          ["Grand mariage", "120-200 invités", "35 000 – 60 000 €"],
          ["Luxe", "200+ invités", "60 000 € et plus"],
        ],
      },
      { type: "h2", text: "La répartition idéale du budget poste par poste" },
      {
        type: "p",
        text: "Voici comment les couples français répartissent généralement leur budget mariage en 2026 :",
      },
      {
        type: "table",
        headers: ["Poste", "Part du budget", "Fourchette (100 invités)"],
        rows: [
          ["Traiteur & boissons", "35-40 %", "7 000 – 14 000 €"],
          ["Salle de réception", "15-20 %", "3 000 – 7 000 €"],
          ["Photographie & vidéo", "10-15 %", "2 000 – 5 000 €"],
          ["Tenue des mariés", "8-12 %", "1 500 – 4 000 €"],
          ["Fleurs & décoration", "7-10 %", "1 500 – 3 500 €"],
          ["Musique (DJ/groupe)", "5-8 %", "1 000 – 2 500 €"],
          ["Papeterie & cadeaux", "3-5 %", "500 – 1 500 €"],
          ["Animation & extras", "2-4 %", "400 – 1 200 €"],
          ["Imprévus (buffer)", "10 %", "variable"],
        ],
      },
      { type: "h2", text: "Les postes qui coûtent le plus cher" },
      { type: "h3", text: "Le traiteur : le poste n°1" },
      {
        type: "p",
        text: "Avec 35 à 40 % du budget total, le traiteur est de loin le poste le plus important. En 2026, comptez entre 60 € et 120 € par personne pour un cocktail dînatoire, et entre 80 € et 180 € pour un repas assis avec service à table. Ces prix incluent généralement le cocktail d'accueil, le dîner, le dessert et les boissons.",
      },
      { type: "h3", text: "La salle de réception" },
      {
        type: "p",
        text: "Une salle de château ou de domaine dans une belle région (Provence, Loire, Bourgogne) coûte entre 3 000 € et 10 000 € la location. Les salles des fêtes municipales ou les fermes aménagées sont entre 500 € et 2 000 €. À Paris et en Île-de-France, les tarifs peuvent tripler.",
      },
      { type: "h3", text: "La photographie" },
      {
        type: "p",
        text: "Un photographe de mariage professionnel en France coûte entre 1 500 € et 4 000 € pour une journée complète. Certains grands noms du secteur facturent 5 000 € à 8 000 €. La vidéo (film de mariage) s'ajoute généralement pour 1 500 € à 3 500 €.",
      },
      { type: "h2", text: "7 astuces pour maîtriser son budget" },
      {
        type: "ol",
        items: [
          "Mariez-vous en semaine ou hors saison (novembre–mars) : jusqu'à 30 % d'économies sur la salle et le traiteur",
          "Limitez la liste d'invités — chaque convive supplémentaire représente 100 € à 200 € de coût additionnel",
          "Optez pour un cocktail dînatoire plutôt qu'un repas assis (15 à 20 % moins cher pour le même niveau de qualité)",
          "Demandez systématiquement 3 devis pour chaque prestataire et n'hésitez pas à négocier",
          "Confiez la décoration florale aux talents de proches passionnés ou choisissez des fleurs de saison",
          "Achetez une robe d'occasion ou de créateur en boutique de déstockage",
          "Créez vous-même la papeterie (Canva permet des designs professionnels gratuitement)",
        ],
      },
      { type: "h2", text: "Les erreurs de budget les plus fréquentes" },
      {
        type: "ul",
        items: [
          "Ne pas prévoir de buffer pour les imprévus (comptez 10 % du total)",
          "Oublier la coiffure et le maquillage (300 € à 800 € pour la mariée)",
          "Négliger les frais de transport (navettes, voiture de luxe)",
          "Sous-estimer le bar ouvert en soirée (+15 à 25 € par personne)",
          "Oublier les droits de corkage si vous apportez votre propre alcool",
          "Ne pas inclure les tenues du cortège et les alliances dans le budget",
        ],
      },
      {
        type: "tip",
        title: "Bonne pratique",
        text: "Tenez un tableau de budget partagé (Google Sheets) avec votre partenaire dès le premier jour. Notez devis, acomptes versés et soldes restants. Vous éviterez les mauvaises surprises à l'approche du grand jour.",
      },
      { type: "h2", text: "Conclusion" },
      {
        type: "p",
        text: "Il n'existe pas de budget idéal — seulement celui qui correspond à vos valeurs et vos moyens. L'essentiel est de le définir clairement dès le départ et de le respecter avec discipline. Pour trouver des prestataires de qualité dans votre budget, parcourez l'annuaire InstantMariage où vous pouvez comparer les offres et demander des devis gratuits.",
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     3. CHECKLIST MARIAGE 100 CHOSES
  ───────────────────────────────────────────────────────────── */
  {
    slug: "checklist-mariage-100-choses-a-ne-pas-oublier",
    title: "Checklist mariage : les 100 choses à ne pas oublier",
    excerpt:
      "La checklist ultime pour n'oublier aucun détail de votre mariage : de J-18 mois jusqu'au lendemain du grand jour, 100 tâches essentielles classées par étape pour organiser sereinement votre plus beau jour.",
    category: "Organisation",
    date: "20 janvier 2026",
    readTime: "10 min",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
    metaDescription:
      "La checklist mariage complète : 100 tâches essentielles classées de J-18 mois au jour J pour n'oublier aucun détail et organiser sereinement votre mariage.",
    keywords:
      "checklist mariage, liste mariage à ne pas oublier, planning mariage, préparation mariage étapes",
    content: [
      {
        type: "intro",
        text: "Organiser un mariage, c'est gérer des centaines de détails en parallèle. Une seule chose oubliée peut créer du stress le jour J. Cette checklist exhaustive recense les 100 tâches incontournables, classées chronologiquement, pour que vous abordez votre grand jour l'esprit léger.",
      },
      { type: "h2", text: "J-18 mois : poser les bases" },
      {
        type: "ol",
        items: [
          "Fixer la date du mariage",
          "Définir le budget global",
          "Choisir le type de mariage (civil, religieux, laïque)",
          "Établir une première liste d'invités",
          "Visiter et réserver la salle de réception",
          "Réserver la mairie (date et heure de la cérémonie civile)",
          "Choisir et réserver le photographe",
          "Choisir et réserver le vidéaste",
          "Commencer les essayages de robe de mariée",
          "Envoyer les save-the-date",
        ],
      },
      { type: "h2", text: "J-12 mois : constituer l'équipe" },
      {
        type: "ol",
        items: [
          "Réserver le traiteur (après dégustation)",
          "Choisir et réserver DJ ou groupe de musique",
          "Réserver l'officiant de cérémonie laïque (si applicable)",
          "Choisir le fleuriste et premier brief floral",
          "Commander la robe de mariée",
          "Choisir la tenue du marié",
          "Réserver le lieu de la cérémonie religieuse (si applicable)",
          "Planifier la lune de miel et réserver les billets",
          "Choisir les témoins et les en informer",
          "Ouvrir une liste de mariage ou une cagnotte",
        ],
      },
      { type: "h2", text: "J-9 mois : les décisions de style" },
      {
        type: "ol",
        items: [
          "Définir le thème et la palette de couleurs",
          "Choisir la papeterie (faire-part, menus, plan de table)",
          "Sélectionner le gâteau de mariage (dégustation)",
          "Réserver le coiffeur",
          "Réserver la maquilleuse",
          "Choisir les alliances",
          "Définir le plan de salle",
          "Créer votre site de mariage ou page RSVP",
          "Réserver un hébergement pour les invités venant de loin",
          "Prévoir la logistique transport (navettes)",
        ],
      },
      { type: "h2", text: "J-6 mois : la mise en forme" },
      {
        type: "ol",
        items: [
          "Envoyer les faire-part officiels",
          "Créer le planning de la journée",
          "Dégustation finale avec le traiteur",
          "Essayage de la robe (premier ajustement)",
          "Organiser l'EVJF et EVG",
          "Confirmer les réservations de tous les prestataires",
          "Réserver les voitures de prestige ou calèche",
          "Choisir les cadeaux pour les invités",
          "Préparer la playlist personnelle pour certains moments clés",
          "Créer la liste de lecture pour la cérémonie (lectures, musiques)",
        ],
      },
      { type: "h2", text: "J-3 mois : les finitions" },
      {
        type: "ol",
        items: [
          "Finaliser le plan de table avec les RSVP reçus",
          "Relancer les invités qui n'ont pas répondu",
          "Récupérer les alliances et vérifier les tailles",
          "Essayage robe (deuxième ajustement)",
          "Essai coiffure",
          "Essai maquillage",
          "Préparer les discours (mariés, témoins, parents)",
          "Commander ou préparer les marque-places",
          "Confirmer la commande du gâteau",
          "Préparer la sac d'urgence du jour J",
        ],
      },
      { type: "h2", text: "J-1 mois : les dernières confirmations" },
      {
        type: "ol",
        items: [
          "Envoyer le planning détaillé à tous les prestataires",
          "Confirmer les horaires et adresses exacts",
          "Finaliser le plan de table complet",
          "Récupérer la robe (essayage final)",
          "Préparer les enveloppes de règlement prestataires",
          "Vérifier les assurances et annulations",
          "Préparer un plan B météo (tente, chauffage)",
          "Briefer les témoins sur leur rôle le jour J",
          "Préparer la décoration et les petits détails personnels",
          "Faire les dernières courses (accessoires, lingerie, chaussures)",
        ],
      },
      { type: "h2", text: "La semaine du mariage" },
      {
        type: "ol",
        items: [
          "Confirmer une dernière fois avec chaque prestataire",
          "Déposer les affaires et décoration à la salle",
          "Se reposer et dormir suffisamment",
          "Préparer les tenues dans des housses",
          "Récupérer le bouquet de la mariée",
          "Préparer les accessoires (jarretière, voile, bijoux)",
          "Briefer les parents et le cortège",
          "Faire une répétition de la cérémonie",
          "Préparer les alliances dans leur écrin",
          "Imprimer le planning jour J en plusieurs exemplaires",
        ],
      },
      { type: "h2", text: "Le jour J : les incontournables" },
      {
        type: "ol",
        items: [
          "Prendre un bon petit-déjeuner",
          "Prévoir du temps supplémentaire pour la coiffure et le maquillage",
          "Laisser le coordinateur gérer les imprévus",
          "Prendre un moment seul à deux avant la cérémonie",
          "S'assurer que quelqu'un s'occupe de recueillir les enveloppes cadeaux",
          "Manger lors du cocktail (les mariés oublient souvent !)",
          "Prendre des photos avec tous vos proches importants",
          "Profiter de chaque instant sans se soucier des détails",
          "Désigner quelqu'un pour ramasser toutes les affaires à la fin",
          "Donner un cadeau de remerciement à vos témoins",
        ],
      },
      { type: "h2", text: "Après le mariage" },
      {
        type: "ol",
        items: [
          "Envoyer les remerciements dans les 3 semaines",
          "Commander l'album photo dès réception des images",
          "Faire nettoyer et conserver la robe de mariée",
          "Changer votre nom légal (si souhaité)",
          "Changer le nom sur les documents officiels",
          "Partager quelques photos sur les réseaux sociaux",
          "Rédiger des avis pour vos prestataires favoris",
          "Archiver les contrats et factures",
          "Préparer le retour de voyage de noces",
          "Célébrez ! Vous avez réussi 🎊",
        ],
      },
      {
        type: "tip",
        title: "Astuce organisation",
        text: "Utilisez notre outil Checklist gratuit dans votre espace mariés sur InstantMariage — toutes ces tâches sont déjà pré-chargées, avec des rappels automatiques et la possibilité d'assigner chaque tâche à l'un ou l'autre des mariés.",
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     4. CHOISIR SON PHOTOGRAPHE DE MARIAGE
  ───────────────────────────────────────────────────────────── */
  {
    slug: "comment-choisir-photographe-mariage",
    title: "Comment bien choisir son photographe de mariage",
    excerpt:
      "Le photographe immortalise votre journée pour l'éternité. Découvrez comment choisir le professionnel idéal : styles, tarifs, questions à poser et pièges à éviter pour des souvenirs inoubliables.",
    category: "Prestataires",
    date: "25 janvier 2026",
    readTime: "8 min",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80",
    metaDescription:
      "Comment choisir son photographe de mariage : styles photographiques, tarifs, questions à poser, contrat à vérifier. Guide complet pour ne pas se tromper.",
    keywords:
      "choisir photographe mariage, photographe mariage tarif, styles photo mariage, photographe mariage France",
    content: [
      {
        type: "intro",
        text: "Le photographe de mariage est l'un des prestataires les plus importants de votre journée. Les fleurs faneront, le gâteau sera mangé, les décorations rangées — mais les photos, elles, resteront toute une vie. Choisir le bon professionnel n'est donc pas une décision à prendre à la légère. Ce guide vous donne toutes les clés pour faire le bon choix.",
      },
      { type: "h2", text: "Pourquoi le photographe est un choix crucial" },
      {
        type: "p",
        text: "Des mariés sur deux déclarent que si c'était à refaire, ils accorderaient encore plus d'importance au choix du photographe. Les photos de mariage sont les seuls souvenirs tangibles que vous conserverez des émotions, des regards et des moments uniques de cette journée.",
      },
      {
        type: "quote",
        text: "Une mauvaise salle, on s'en remet. Un mauvais traiteur, on rigole l'année suivante. De mauvaises photos de mariage, ça reste une douleur pour la vie.",
        author: "Sophie, mariée en 2024",
      },
      { type: "h2", text: "Les grands styles photographiques" },
      { type: "h3", text: "Reportage documentaire" },
      {
        type: "p",
        text: "Le photographe se fait oublier et capture les moments spontanément, comme un journaliste. Peu ou pas de mises en scène. Le résultat est authentique et plein d'émotion. Idéal pour les couples qui n'aiment pas poser.",
      },
      { type: "h3", text: "Posé classique" },
      {
        type: "p",
        text: "Des portraits traditionnels, soignés, avec un travail minutieux sur la lumière et la composition. Convient aux couples qui souhaitent des photos élégantes et intemporelles pour l'album de famille.",
      },
      { type: "h3", text: "Fine art / Éditorial" },
      {
        type: "p",
        text: "Un style artistique et travaillé, proche de la photographie de mode. Les images sont lumineuses, aérées, avec une palette de couleurs spécifique (souvent pastel ou filmique). Ce style est très tendance en 2026.",
      },
      { type: "h3", text: "Hybride (reportage + posé)" },
      {
        type: "p",
        text: "La majorité des photographes de mariage proposent un mélange des deux : reportage pendant la journée et quelques séances posées pour les portraits officiels. C'est le choix le plus courant.",
      },
      { type: "h2", text: "Les tarifs en France en 2026" },
      {
        type: "table",
        headers: ["Niveau", "Expérience", "Tarif journée complète"],
        rows: [
          ["Débutant", "Moins de 3 ans", "800 – 1 500 €"],
          ["Confirmé", "3 à 7 ans", "1 500 – 2 800 €"],
          ["Expert", "7 ans et plus", "2 800 – 4 500 €"],
          ["Renommé", "Reconnu nationalement", "4 500 – 8 000 €"],
        ],
      },
      {
        type: "p",
        text: "Ces tarifs incluent généralement la journée complète (8 à 12 heures), la retouche des photos, et la livraison d'une galerie en ligne. Un album papier est souvent proposé en supplément (400 € à 1 200 €).",
      },
      { type: "h2", text: "Les 10 questions à poser lors du rendez-vous" },
      {
        type: "ol",
        items: [
          "Avez-vous déjà photographié dans cette salle ou ce lieu ?",
          "Comment gérez-vous les situations de faible luminosité ?",
          "Combien de photos livrerez-vous ? Dans quel délai ?",
          "Utilisez-vous du matériel de sauvegarde en cas de panne ?",
          "Avez-vous un collègue qui peut vous remplacer en cas d'urgence ?",
          "Pouvez-nous voir un reportage complet d'un mariage (pas seulement les meilleures photos) ?",
          "Comment se déroule la séance couple durant la journée ?",
          "Quels sont vos droits d'auteur et peut-on utiliser les photos librement ?",
          "Que se passe-t-il si vous tombez malade le jour J ?",
          "Avez-vous une assurance responsabilité civile professionnelle ?",
        ],
      },
      { type: "h2", text: "Les points essentiels du contrat" },
      {
        type: "ul",
        items: [
          "Nom et prénom du photographe qui sera présent (pas d'assistant envoyé à la place)",
          "Durée de la prestation (heure de début et de fin)",
          "Nombre minimum de photos livrées",
          "Délai de livraison de la galerie",
          "Format de livraison (haute résolution, basse résolution)",
          "Conditions d'annulation et de remboursement des acomptes",
          "Clause de remplacement en cas d'empêchement",
          "Droits d'exploitation des photos (utilisation par le photographe pour sa comm)",
        ],
      },
      { type: "h2", text: "Les 5 pièges à éviter" },
      {
        type: "ul",
        items: [
          "Choisir uniquement sur le prix : un photographe à 600 € est souvent un amateur non assuré",
          "Ne pas demander à voir un reportage complet — les portfolios ne montrent que les meilleures images",
          "Réserver sans rencontrer physiquement (ou en visio) le photographe — la relation humaine est essentielle",
          "Oublier de vérifier qu'il a déjà travaillé en conditions difficiles (intérieur sombre, mauvais temps)",
          "Signer sans lire la clause concernant ses droits d'utilisation de vos photos",
        ],
      },
      {
        type: "tip",
        title: "Notre conseil",
        text: "Rencontrez au minimum 3 photographes avant de décider. Le feeling humain est aussi important que le style : vous passerez toute la journée avec cette personne. Si vous ne vous sentez pas à l'aise lors du rendez-vous, les photos s'en ressentiront.",
      },
      { type: "h2", text: "Conclusion" },
      {
        type: "p",
        text: "Choisir son photographe de mariage demande du temps et de la recherche, mais cet investissement en vaut largement la peine. Sur InstantMariage, vous pouvez consulter les portfolios et les avis de photographes vérifiés partout en France, et les contacter directement pour obtenir un devis personnalisé.",
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     5. TROUVER DES CLIENTS ACTIVITÉ MARIAGE
  ───────────────────────────────────────────────────────────── */
  {
    slug: "comment-trouver-clients-activite-mariage",
    title: "Comment trouver des clients pour son activité mariage",
    excerpt:
      "Photographe, traiteur, fleuriste, DJ… vous exercez dans le secteur du mariage et cherchez à développer votre clientèle ? Découvrez les meilleures stratégies pour trouver des clients et remplir votre agenda en 2026.",
    category: "Prestataires",
    date: "5 février 2026",
    readTime: "10 min",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80",
    metaDescription:
      "Prestataire mariage : comment trouver des clients en 2026 ? Annuaires, réseaux sociaux, bouche-à-oreille, salons… Toutes les stratégies efficaces pour développer votre activité.",
    keywords:
      "trouver clients mariage, prestataire mariage clients, développer activité mariage, photographe mariage trouver clients",
    content: [
      {
        type: "intro",
        text: "Le marché du mariage en France représente plus de 5 milliards d'euros par an avec environ 220 000 cérémonies annuelles. Pourtant, de nombreux prestataires peinent à remplir leur agenda. La concurrence est forte, et les couples font leurs recherches sur des canaux très spécifiques. Voici comment vous démarquer et attirer des clients de qualité.",
      },
      { type: "h2", text: "Comprendre le comportement des couples en 2026" },
      {
        type: "p",
        text: "Avant de chercher des clients, il faut comprendre comment ils vous cherchent. En 2026, un couple commence généralement ses recherches de prestataires 12 à 18 mois avant le mariage, et utilise ces canaux dans cet ordre :",
      },
      {
        type: "ol",
        items: [
          "Les recommandations de proches (famille, amis récemment mariés)",
          "Les annuaires spécialisés mariage (InstantMariage, etc.)",
          "Instagram et Pinterest pour l'inspiration visuelle",
          "Google pour une recherche locale précise",
          "Les salons du mariage pour rencontrer en direct",
        ],
      },
      {
        type: "p",
        text: "Chaque canal mérite une stratégie adaptée. Un prestataire qui investit sur tous ces points aura un agenda plein toute l'année.",
      },
      { type: "h2", text: "1. Rejoindre un annuaire spécialisé mariage" },
      {
        type: "p",
        text: "C'est la manière la plus directe d'être visible auprès de couples qui cherchent activement un prestataire. Contrairement à Google Ads ou aux réseaux sociaux, un couple sur un annuaire mariage a une intention d'achat immédiate.",
      },
      {
        type: "ul",
        items: [
          "Créez un profil complet avec photos de qualité, description détaillée et tarifs indicatifs",
          "Récoltez et affichez vos premiers avis clients — les couples lisent en moyenne 7 avis avant de contacter",
          "Répondez rapidement aux demandes de contact (moins de 2 heures = +60 % de conversion)",
          "Mettez à jour votre portfolio régulièrement avec vos meilleures réalisations",
        ],
      },
      {
        type: "tip",
        title: "InstantMariage",
        text: "Sur InstantMariage, les prestataires avec un profil complet et des avis récoltent 3 fois plus de contacts que les profils incomplets. L'inscription est gratuite et les formules Pro débloquent la mise en avant et les demandes de devis illimitées.",
      },
      { type: "h2", text: "2. Optimiser sa présence sur Instagram" },
      {
        type: "p",
        text: "Instagram est devenu le portfolio numérique incontournable des prestataires du mariage. C'est là que les futurs mariés s'inspirent et découvrent de nouveaux professionnels.",
      },
      {
        type: "ul",
        items: [
          "Publiez 3 à 4 fois par semaine avec des photos haute qualité de vos réalisations",
          "Utilisez des hashtags locaux (#mariageProvence, #photographemariageParis) en plus des hashtags généraux",
          "Identifiez les salles, fleuristes et autres prestataires avec qui vous travaillez — ils le feront en retour",
          "Partagez les stories le jour J pour montrer les coulisses et l'ambiance en direct",
          "Répondez à tous les commentaires et DM — l'algorithme récompense l'engagement",
        ],
      },
      { type: "h2", text: "3. Travailler son référencement Google local" },
      {
        type: "p",
        text: "Quand un couple tape « photographe mariage Lyon » ou « traiteur mariage Bordeaux », vous devez apparaître. Le SEO local est gratuit et durable.",
      },
      {
        type: "ol",
        items: [
          "Créez et optimisez votre fiche Google Business Profile avec photos, horaires et description",
          "Collectez des avis Google — c'est le signal de confiance n°1 pour le référencement local",
          "Créez un site web avec des pages dédiées à chaque ville où vous intervenez",
          "Publiez régulièrement du contenu (articles de blog) sur des sujets mariage liés à votre région",
          "Inscrivez-vous dans des annuaires locaux et nationaux pour obtenir des backlinks",
        ],
      },
      { type: "h2", text: "4. Le bouche-à-oreille : votre meilleur commercial" },
      {
        type: "p",
        text: "Dans le mariage, la recommandation d'un ami vaut de l'or. Un couple satisfait peut vous rapporter 2 à 5 nouveaux clients sur les années suivantes.",
      },
      {
        type: "ul",
        items: [
          "Faites un suivi post-mariage systématique : envoyez un email 2 semaines après pour demander leur satisfaction",
          "Proposez une remise de parrainage : 5 % de réduction pour tout client recommandé",
          "Envoyez une carte de remerciement personnalisée avec une petite attention",
          "Demandez explicitement un avis sur Google, InstantMariage et Mariages.net",
          "Restez en contact avec vos anciens clients via les réseaux sociaux",
        ],
      },
      { type: "h2", text: "5. Les salons et foires du mariage" },
      {
        type: "p",
        text: "Les salons du mariage permettent une chose unique : le contact humain. Un couple qui vous rencontre en personne et accroche avec vous a bien plus de chances de vous choisir.",
      },
      {
        type: "ul",
        items: [
          "Exposez avec un stand soigné, professionnel et cohérent avec votre identité visuelle",
          "Proposez une animation ou une démonstration pour attirer l'attention",
          "Collectez des coordonnées via un concours ou un livre d'or numérique",
          "Relancez par email dans les 48h après le salon avec une offre spéciale",
          "Les grands salons nationaux (Paris) sont coûteux — ciblez d'abord les salons régionaux",
        ],
      },
      { type: "h2", text: "6. Nouer des partenariats avec d'autres prestataires" },
      {
        type: "p",
        text: "Les prestataires du mariage ne sont pas concurrents — ils sont complémentaires. Un photographe recommande son traiteur favori, qui recommande son fleuriste, qui recommande son DJ. Ce réseau de recommandations mutuelles est extrêmement puissant.",
      },
      {
        type: "ul",
        items: [
          "Identifiez les acteurs de votre secteur dans votre région avec qui vous partagez des valeurs",
          "Proposez des shootings d'inspiration mutuels pour créer du contenu et tisser des liens",
          "Construisez une liste de prestataires « recommandés » que vous partagez à vos clients",
          "Organisez des petits-déjeuners networking régionaux entre prestataires mariage",
        ],
      },
      { type: "h2", text: "Conclusion" },
      {
        type: "p",
        text: "Trouver des clients dans le secteur du mariage demande une présence sur plusieurs canaux et une stratégie cohérente. La clé est d'être visible là où les couples cherchent, et de transformer chaque client satisfait en ambassadeur. Commencez par créer votre profil gratuit sur InstantMariage pour être visible auprès de milliers de couples en recherche active dès aujourd'hui.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return seoArticles.find((a) => a.slug === slug);
}
