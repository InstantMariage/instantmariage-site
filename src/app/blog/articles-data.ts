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
  {
    slug: "combien-coute-un-mariage-france-2026",
    title: "Combien coûte un mariage en France en 2026 ?",
    excerpt:
      "Budget moyen, postes de dépenses, différences régionales, astuces pour économiser… Tout ce qu'il faut savoir pour planifier votre budget mariage en 2026.",
    category: "Budget",
    date: "12 avril 2026",
    readTime: "12 min",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    metaDescription:
      "Quel est le budget moyen d'un mariage en France en 2026 ? Salle, traiteur, photographe, robe… Découvrez les prix détaillés par poste et nos conseils pour optimiser votre budget.",
    keywords:
      "coût mariage France 2026, budget mariage, prix mariage France, combien coûte un mariage, budget moyen mariage, financer mariage",
    content: [
      {
        type: "intro",
        text: "En France, se marier représente l'un des investissements émotionnels et financiers les plus importants d'une vie. En 2026, le budget moyen d'un mariage oscille entre 10 000 € et 30 000 €, selon la région, le nombre d'invités et les prestataires choisis. Voici un guide complet pour y voir clair.",
      },
      {
        type: "h2",
        text: "Le budget moyen d'un mariage en France en 2026",
      },
      {
        type: "p",
        text: "Selon les dernières études du secteur, le coût médian d'un mariage en France s'établit autour de 15 000 € à 20 000 € pour une cérémonie de 80 à 100 invités. Ce chiffre peut sembler élevé, mais il recouvre des réalités très différentes : un mariage intime de 30 personnes peut se faire pour 6 000 €, tandis qu'une grande fête de 150 convives peut facilement dépasser les 40 000 €.",
      },
      {
        type: "table",
        headers: ["Type de mariage", "Nombre d'invités", "Budget estimé"],
        rows: [
          ["Mariage intime", "20 – 40 personnes", "5 000 € – 10 000 €"],
          ["Mariage classique", "60 – 100 personnes", "12 000 € – 22 000 €"],
          ["Grand mariage", "120 – 180 personnes", "25 000 € – 45 000 €"],
          ["Mariage de luxe", "150+ personnes", "50 000 € et plus"],
        ],
      },
      {
        type: "h2",
        text: "Les postes de dépenses détaillés",
      },
      {
        type: "p",
        text: "Un budget mariage se compose de nombreux postes distincts. Comprendre leur poids relatif vous permettra de faire des arbitrages intelligents selon vos priorités.",
      },
      {
        type: "h3",
        text: "La salle de réception",
      },
      {
        type: "p",
        text: "Le lieu est souvent le poste le plus onéreux, représentant 20 à 30 % du budget total. En 2026, la location d'une salle ou d'un domaine pour une journée complète coûte en moyenne entre 2 000 € et 8 000 €. Les châteaux et domaines viticoles en Bourgogne ou dans le Bordelais peuvent atteindre 15 000 € à 25 000 €. Les salles municipales restent une option économique (500 € – 1 500 €), mais avec moins de cachet.",
      },
      {
        type: "h3",
        text: "Le traiteur et la restauration",
      },
      {
        type: "p",
        text: "Comptez entre 70 € et 200 € par personne pour un repas servi à table, soit 7 000 € à 20 000 € pour 100 invités. Ce poste inclut généralement le cocktail, le dîner, la pièce montée et les boissons. Les formules buffet ou cocktail dînatoire sont 20 à 30 % moins chères. Pensez à demander des devis précis car les tarifs varient considérablement selon les régions.",
      },
      {
        type: "h3",
        text: "La photographie et la vidéographie",
      },
      {
        type: "p",
        text: "Un photographe professionnel pour une journée coûte entre 1 500 € et 4 000 €. Ajouter un vidéaste représente 1 500 € à 3 000 € supplémentaires. Ce poste est souvent sous-estimé par les couples, alors qu'il constitue le souvenir durable de votre journée. Privilégiez la qualité ici : vous ne pouvez pas refaire les photos de votre mariage.",
      },
      {
        type: "h3",
        text: "La robe de mariée et la tenue du marié",
      },
      {
        type: "p",
        text: "La robe de mariée représente un budget moyen de 1 500 € à 3 500 € en boutique spécialisée. Les créateurs et robes sur mesure peuvent dépasser les 5 000 €. Les alternatives (robes de prêt-à-porter, occasions, location) permettent de réduire ce poste à 300 € – 800 €. La tenue du marié (costume ou smoking) coûte entre 400 € et 1 500 €, auxquels s'ajoutent accessoires et chaussures.",
      },
      {
        type: "h3",
        text: "La musique et l'animation",
      },
      {
        type: "p",
        text: "Un DJ pour la soirée coûte entre 800 € et 2 000 €. Un groupe de musique live est plus onéreux : comptez 1 500 € à 5 000 € selon le nombre de musiciens et le style. Si vous souhaitez animer le cocktail avec un musicien solo (violoniste, guitariste, pianiste), prévoyez 500 € à 1 200 €. Certains couples optent pour une playlist Spotify soigneusement préparée pour zéro euro.",
      },
      {
        type: "h3",
        text: "Les fleurs et la décoration",
      },
      {
        type: "p",
        text: "La décoration florale est un poste variable : de 500 € pour quelques compositions simples jusqu'à 5 000 € ou plus pour un décor élaboré avec arche florale, centres de table et pétales de roses. Les fleuristes spécialisés mariage facturent en moyenne 1 500 € à 3 000 € pour une décoration complète. La tendance pampas grass, eucalyptus et fleurs séchées permet de réduire les coûts sans sacrifier l'esthétique.",
      },
      {
        type: "h3",
        text: "Les alliances, faire-part et papeterie",
      },
      {
        type: "p",
        text: "Les alliances représentent un budget moyen de 800 € à 2 000 € la paire pour de l'or jaune ou blanc. Les faire-part et papeterie (invitations, menus, plan de table, livret de cérémonie) coûtent entre 300 € et 1 200 € selon la quantité et la finition. Les solutions d'impression en ligne permettent de diviser ce budget par deux.",
      },
      {
        type: "table",
        headers: ["Poste de dépense", "Budget petit mariage", "Budget moyen", "Budget grand mariage"],
        rows: [
          ["Salle / lieu", "1 500 €", "3 500 €", "8 000 €"],
          ["Traiteur (par personne)", "60 €", "90 €", "140 €"],
          ["Photographe", "1 200 €", "2 200 €", "3 800 €"],
          ["Vidéaste", "—", "1 500 €", "2 500 €"],
          ["Robe de mariée", "800 €", "1 800 €", "4 000 €"],
          ["Tenue marié", "400 €", "800 €", "1 500 €"],
          ["Musique / DJ", "600 €", "1 200 €", "2 500 €"],
          ["Fleurs / décoration", "700 €", "1 800 €", "4 500 €"],
          ["Alliances", "600 €", "1 200 €", "2 500 €"],
          ["Faire-part / papeterie", "200 €", "500 €", "1 200 €"],
          ["Coiffure & maquillage", "200 €", "450 €", "800 €"],
          ["Transport / voiture", "300 €", "600 €", "1 500 €"],
          ["Animation / extras", "300 €", "700 €", "2 000 €"],
        ],
      },
      {
        type: "h2",
        text: "Les différences régionales en France",
      },
      {
        type: "p",
        text: "Le coût d'un mariage varie significativement selon la région. En Île-de-France, les prix sont en moyenne 30 à 50 % plus élevés qu'en province. Paris et sa banlieue cumulent les surcoûts : traiteurs plus chers, lieux plus rares, prestataires premium. À l'inverse, les régions comme l'Auvergne, la Bretagne ou le Limousin offrent des tarifs plus abordables, notamment pour les lieux de réception.",
      },
      {
        type: "p",
        text: "Les régions viticoles (Bourgogne, Bordeaux, Alsace, Provence) sont très prisées pour les mariages et voient leurs tarifs augmenter chaque année. La Provence-Alpes-Côte d'Azur est la région la plus chère hors Île-de-France, portée par la demande touristique internationale.",
      },
      {
        type: "h2",
        text: "Comment réduire son budget mariage sans sacrifier la magie",
      },
      {
        type: "ul",
        items: [
          "Choisir une date en semaine ou hors saison (novembre à mars) : les tarifs des lieux et prestataires baissent de 15 à 30 %.",
          "Limiter la liste d'invités : chaque invité en moins représente en moyenne 120 à 200 € d'économies (repas, siège, cadeau…).",
          "Opter pour un brunch ou un déjeuner plutôt qu'un dîner : moins onéreux et tout aussi festif.",
          "Faire appel à de jeunes photographes talentueux avec un portfolio solide mais moins d'expérience.",
          "Réaliser soi-même certains éléments de déco (DIY) : centres de table, signalétique, dragées.",
          "Louer plutôt qu'acheter pour les tenues et accessoires peu portés.",
          "Comparer au minimum 3 devis pour chaque prestataire majeur.",
          "Utiliser InstantMariage pour trouver des prestataires locaux et transparents sur leurs tarifs.",
        ],
      },
      {
        type: "tip",
        title: "Le conseil des pros",
        text: "Définissez dès le départ vos 2 ou 3 priorités absolues (exemple : le lieu, la photo, le traiteur) et accordez-leur 60 % de votre budget. Sur les autres postes, cherchez à optimiser sans rogner sur ces priorités. C'est la stratégie des couples les plus satisfaits de leur mariage.",
      },
      {
        type: "h2",
        text: "Comment financer son mariage en 2026",
      },
      {
        type: "p",
        text: "La plupart des couples financent leur mariage sur plusieurs années d'épargne, souvent complétée par une participation familiale. La liste de mariage reste le mécanisme privilégié pour inviter proches et famille à contribuer aux dépenses. En 2026, les listes de mariage en ligne (incluant des cagnottes numériques) ont largement remplacé les listes en magasin.",
      },
      {
        type: "p",
        text: "Le prêt personnel ou le crédit à la consommation représentent une option à envisager avec prudence : les intérêts sur un crédit de 10 000 € sur 3 ans représentent 700 € à 1 500 € supplémentaires selon le taux. Mieux vaut décaler la date et épargner davantage plutôt que de commencer sa vie commune avec des dettes.",
      },
      {
        type: "quote",
        text: "Un mariage, c'est une fête d'un jour, mais les dettes durent des années. Organisez la fête que vous pouvez vous offrir aujourd'hui, et voyagez en amoureux demain.",
        author: "Conseillère en gestion de budget mariage",
      },
      {
        type: "h2",
        text: "Établir son budget mariage étape par étape",
      },
      {
        type: "ol",
        items: [
          "Définir votre enveloppe globale disponible (épargne + contributions familiales).",
          "Estimer le nombre d'invités : c'est lui qui dimensionne la majorité des postes.",
          "Choisir votre date et votre lieu en premier : ces deux éléments structurent tout le reste.",
          "Affecter une enveloppe à chaque poste de dépense selon vos priorités.",
          "Prévoir une réserve de 10 % pour les imprévus (toujours utile !).",
          "Comparer les devis avec au moins 3 prestataires par catégorie.",
          "Suivre les dépenses avec un tableur ou une application dédiée.",
        ],
      },
      {
        type: "tip",
        title: "Outil gratuit",
        text: "InstantMariage met à disposition un simulateur de budget mariage entièrement gratuit dans votre espace mariés. Renseignez votre nombre d'invités et votre région, et obtenez une estimation personnalisée par poste en quelques secondes.",
      },
      {
        type: "h2",
        text: "En résumé : les chiffres clés du mariage en France en 2026",
      },
      {
        type: "p",
        text: "Budget moyen national : 15 000 € à 20 000 € pour 80 à 100 invités. Le traiteur et le lieu représentent à eux seuls 50 à 60 % du budget total. Chaque invité supplémentaire coûte en moyenne 150 € toutes charges comprises. Et surtout, rappelez-vous : le plus beau mariage n'est pas le plus cher, c'est celui qui vous ressemble.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return seoArticles.find((a) => a.slug === slug);
}
