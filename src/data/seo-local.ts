export interface VilleSEO {
  slug: string;
  nom: string;
  departement: string;
  region: string;
}

export interface DepartementSEO {
  slug: string;
  nom: string;
  code: string;
  region: string;
  regionSlug: string;
}

export interface RegionSEO {
  slug: string;
  nom: string;
}

export interface MetierSEO {
  slug: string;
  nom: string;
  categorie: string;
  icon: string;
  nomPluriel: string;
}

// ─── Régions ──────────────────────────────────────────────────────────────────

export const REGIONS_SEO: RegionSEO[] = [
  { slug: "ile-de-france", nom: "Île-de-France" },
  { slug: "centre-val-de-loire", nom: "Centre-Val de Loire" },
  { slug: "bourgogne-franche-comte", nom: "Bourgogne-Franche-Comté" },
  { slug: "normandie", nom: "Normandie" },
  { slug: "hauts-de-france", nom: "Hauts-de-France" },
  { slug: "grand-est", nom: "Grand Est" },
  { slug: "pays-de-la-loire", nom: "Pays de la Loire" },
  { slug: "bretagne", nom: "Bretagne" },
  { slug: "nouvelle-aquitaine", nom: "Nouvelle-Aquitaine" },
  { slug: "occitanie", nom: "Occitanie" },
  { slug: "auvergne-rhone-alpes", nom: "Auvergne-Rhône-Alpes" },
  { slug: "provence-alpes-cote-d-azur", nom: "Provence-Alpes-Côte d'Azur" },
  { slug: "corse", nom: "Corse" },
];

// ─── Départements (96 métropolitains) ─────────────────────────────────────────

export const DEPARTEMENTS_SEO: DepartementSEO[] = [
  { slug: "ain", nom: "Ain", code: "01", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "aisne", nom: "Aisne", code: "02", region: "Hauts-de-France", regionSlug: "hauts-de-france" },
  { slug: "allier", nom: "Allier", code: "03", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "alpes-de-haute-provence", nom: "Alpes-de-Haute-Provence", code: "04", region: "Provence-Alpes-Côte d'Azur", regionSlug: "provence-alpes-cote-d-azur" },
  { slug: "hautes-alpes", nom: "Hautes-Alpes", code: "05", region: "Provence-Alpes-Côte d'Azur", regionSlug: "provence-alpes-cote-d-azur" },
  { slug: "alpes-maritimes", nom: "Alpes-Maritimes", code: "06", region: "Provence-Alpes-Côte d'Azur", regionSlug: "provence-alpes-cote-d-azur" },
  { slug: "ardeche", nom: "Ardèche", code: "07", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "ardennes", nom: "Ardennes", code: "08", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "ariege", nom: "Ariège", code: "09", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "aube", nom: "Aube", code: "10", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "aude", nom: "Aude", code: "11", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "aveyron", nom: "Aveyron", code: "12", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "bouches-du-rhone", nom: "Bouches-du-Rhône", code: "13", region: "Provence-Alpes-Côte d'Azur", regionSlug: "provence-alpes-cote-d-azur" },
  { slug: "calvados", nom: "Calvados", code: "14", region: "Normandie", regionSlug: "normandie" },
  { slug: "cantal", nom: "Cantal", code: "15", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "charente", nom: "Charente", code: "16", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "charente-maritime", nom: "Charente-Maritime", code: "17", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "cher", nom: "Cher", code: "18", region: "Centre-Val de Loire", regionSlug: "centre-val-de-loire" },
  { slug: "correze", nom: "Corrèze", code: "19", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "corse-du-sud", nom: "Corse-du-Sud", code: "2A", region: "Corse", regionSlug: "corse" },
  { slug: "haute-corse", nom: "Haute-Corse", code: "2B", region: "Corse", regionSlug: "corse" },
  { slug: "cote-d-or", nom: "Côte-d'Or", code: "21", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "cotes-d-armor", nom: "Côtes-d'Armor", code: "22", region: "Bretagne", regionSlug: "bretagne" },
  { slug: "creuse", nom: "Creuse", code: "23", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "dordogne", nom: "Dordogne", code: "24", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "doubs", nom: "Doubs", code: "25", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "drome", nom: "Drôme", code: "26", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "eure", nom: "Eure", code: "27", region: "Normandie", regionSlug: "normandie" },
  { slug: "eure-et-loir", nom: "Eure-et-Loir", code: "28", region: "Centre-Val de Loire", regionSlug: "centre-val-de-loire" },
  { slug: "finistere", nom: "Finistère", code: "29", region: "Bretagne", regionSlug: "bretagne" },
  { slug: "gard", nom: "Gard", code: "30", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "haute-garonne", nom: "Haute-Garonne", code: "31", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "gers", nom: "Gers", code: "32", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "gironde", nom: "Gironde", code: "33", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "herault", nom: "Hérault", code: "34", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "ille-et-vilaine", nom: "Ille-et-Vilaine", code: "35", region: "Bretagne", regionSlug: "bretagne" },
  { slug: "indre", nom: "Indre", code: "36", region: "Centre-Val de Loire", regionSlug: "centre-val-de-loire" },
  { slug: "indre-et-loire", nom: "Indre-et-Loire", code: "37", region: "Centre-Val de Loire", regionSlug: "centre-val-de-loire" },
  { slug: "isere", nom: "Isère", code: "38", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "jura", nom: "Jura", code: "39", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "landes", nom: "Landes", code: "40", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "loir-et-cher", nom: "Loir-et-Cher", code: "41", region: "Centre-Val de Loire", regionSlug: "centre-val-de-loire" },
  { slug: "loire", nom: "Loire", code: "42", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "haute-loire", nom: "Haute-Loire", code: "43", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "loire-atlantique", nom: "Loire-Atlantique", code: "44", region: "Pays de la Loire", regionSlug: "pays-de-la-loire" },
  { slug: "loiret", nom: "Loiret", code: "45", region: "Centre-Val de Loire", regionSlug: "centre-val-de-loire" },
  { slug: "lot", nom: "Lot", code: "46", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "lot-et-garonne", nom: "Lot-et-Garonne", code: "47", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "lozere", nom: "Lozère", code: "48", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "maine-et-loire", nom: "Maine-et-Loire", code: "49", region: "Pays de la Loire", regionSlug: "pays-de-la-loire" },
  { slug: "manche", nom: "Manche", code: "50", region: "Normandie", regionSlug: "normandie" },
  { slug: "marne", nom: "Marne", code: "51", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "haute-marne", nom: "Haute-Marne", code: "52", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "mayenne", nom: "Mayenne", code: "53", region: "Pays de la Loire", regionSlug: "pays-de-la-loire" },
  { slug: "meurthe-et-moselle", nom: "Meurthe-et-Moselle", code: "54", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "meuse", nom: "Meuse", code: "55", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "morbihan", nom: "Morbihan", code: "56", region: "Bretagne", regionSlug: "bretagne" },
  { slug: "moselle", nom: "Moselle", code: "57", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "nievre", nom: "Nièvre", code: "58", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "nord", nom: "Nord", code: "59", region: "Hauts-de-France", regionSlug: "hauts-de-france" },
  { slug: "oise", nom: "Oise", code: "60", region: "Hauts-de-France", regionSlug: "hauts-de-france" },
  { slug: "orne", nom: "Orne", code: "61", region: "Normandie", regionSlug: "normandie" },
  { slug: "pas-de-calais", nom: "Pas-de-Calais", code: "62", region: "Hauts-de-France", regionSlug: "hauts-de-france" },
  { slug: "puy-de-dome", nom: "Puy-de-Dôme", code: "63", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "pyrenees-atlantiques", nom: "Pyrénées-Atlantiques", code: "64", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "hautes-pyrenees", nom: "Hautes-Pyrénées", code: "65", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "pyrenees-orientales", nom: "Pyrénées-Orientales", code: "66", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "bas-rhin", nom: "Bas-Rhin", code: "67", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "haut-rhin", nom: "Haut-Rhin", code: "68", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "rhone", nom: "Rhône", code: "69", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "haute-saone", nom: "Haute-Saône", code: "70", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "saone-et-loire", nom: "Saône-et-Loire", code: "71", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "sarthe", nom: "Sarthe", code: "72", region: "Pays de la Loire", regionSlug: "pays-de-la-loire" },
  { slug: "savoie", nom: "Savoie", code: "73", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "haute-savoie", nom: "Haute-Savoie", code: "74", region: "Auvergne-Rhône-Alpes", regionSlug: "auvergne-rhone-alpes" },
  { slug: "paris", nom: "Paris", code: "75", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "seine-maritime", nom: "Seine-Maritime", code: "76", region: "Normandie", regionSlug: "normandie" },
  { slug: "seine-et-marne", nom: "Seine-et-Marne", code: "77", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "yvelines", nom: "Yvelines", code: "78", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "deux-sevres", nom: "Deux-Sèvres", code: "79", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "somme", nom: "Somme", code: "80", region: "Hauts-de-France", regionSlug: "hauts-de-france" },
  { slug: "tarn", nom: "Tarn", code: "81", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "tarn-et-garonne", nom: "Tarn-et-Garonne", code: "82", region: "Occitanie", regionSlug: "occitanie" },
  { slug: "var", nom: "Var", code: "83", region: "Provence-Alpes-Côte d'Azur", regionSlug: "provence-alpes-cote-d-azur" },
  { slug: "vaucluse", nom: "Vaucluse", code: "84", region: "Provence-Alpes-Côte d'Azur", regionSlug: "provence-alpes-cote-d-azur" },
  { slug: "vendee", nom: "Vendée", code: "85", region: "Pays de la Loire", regionSlug: "pays-de-la-loire" },
  { slug: "vienne", nom: "Vienne", code: "86", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "haute-vienne", nom: "Haute-Vienne", code: "87", region: "Nouvelle-Aquitaine", regionSlug: "nouvelle-aquitaine" },
  { slug: "vosges", nom: "Vosges", code: "88", region: "Grand Est", regionSlug: "grand-est" },
  { slug: "yonne", nom: "Yonne", code: "89", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "territoire-de-belfort", nom: "Territoire de Belfort", code: "90", region: "Bourgogne-Franche-Comté", regionSlug: "bourgogne-franche-comte" },
  { slug: "essonne", nom: "Essonne", code: "91", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "hauts-de-seine", nom: "Hauts-de-Seine", code: "92", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "seine-saint-denis", nom: "Seine-Saint-Denis", code: "93", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "val-de-marne", nom: "Val-de-Marne", code: "94", region: "Île-de-France", regionSlug: "ile-de-france" },
  { slug: "val-d-oise", nom: "Val-d'Oise", code: "95", region: "Île-de-France", regionSlug: "ile-de-france" },
];

// ─── Villes (100 villes françaises) ───────────────────────────────────────────

export const VILLES_SEO: VilleSEO[] = [
  // Île-de-France
  { slug: "paris", nom: "Paris", departement: "75", region: "Île-de-France" },
  { slug: "versailles", nom: "Versailles", departement: "78", region: "Île-de-France" },
  { slug: "boulogne-billancourt", nom: "Boulogne-Billancourt", departement: "92", region: "Île-de-France" },
  { slug: "saint-denis", nom: "Saint-Denis", departement: "93", region: "Île-de-France" },
  { slug: "montreuil", nom: "Montreuil", departement: "93", region: "Île-de-France" },
  { slug: "argenteuil", nom: "Argenteuil", departement: "95", region: "Île-de-France" },
  { slug: "nanterre", nom: "Nanterre", departement: "92", region: "Île-de-France" },
  { slug: "creteil", nom: "Créteil", departement: "94", region: "Île-de-France" },
  { slug: "vitry-sur-seine", nom: "Vitry-sur-Seine", departement: "94", region: "Île-de-France" },
  { slug: "asnieres-sur-seine", nom: "Asnières-sur-Seine", departement: "92", region: "Île-de-France" },
  // Auvergne-Rhône-Alpes
  { slug: "lyon", nom: "Lyon", departement: "69", region: "Auvergne-Rhône-Alpes" },
  { slug: "grenoble", nom: "Grenoble", departement: "38", region: "Auvergne-Rhône-Alpes" },
  { slug: "saint-etienne", nom: "Saint-Étienne", departement: "42", region: "Auvergne-Rhône-Alpes" },
  { slug: "villeurbanne", nom: "Villeurbanne", departement: "69", region: "Auvergne-Rhône-Alpes" },
  { slug: "clermont-ferrand", nom: "Clermont-Ferrand", departement: "63", region: "Auvergne-Rhône-Alpes" },
  { slug: "annecy", nom: "Annecy", departement: "74", region: "Auvergne-Rhône-Alpes" },
  { slug: "valence", nom: "Valence", departement: "26", region: "Auvergne-Rhône-Alpes" },
  { slug: "chambery", nom: "Chambéry", departement: "73", region: "Auvergne-Rhône-Alpes" },
  { slug: "montlucon", nom: "Montluçon", departement: "03", region: "Auvergne-Rhône-Alpes" },
  { slug: "vichy", nom: "Vichy", departement: "03", region: "Auvergne-Rhône-Alpes" },
  // Provence-Alpes-Côte d'Azur
  { slug: "marseille", nom: "Marseille", departement: "13", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "nice", nom: "Nice", departement: "06", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "toulon", nom: "Toulon", departement: "83", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "aix-en-provence", nom: "Aix-en-Provence", departement: "13", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "avignon", nom: "Avignon", departement: "84", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "cannes", nom: "Cannes", departement: "06", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "antibes", nom: "Antibes", departement: "06", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "frejus", nom: "Fréjus", departement: "83", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "arles", nom: "Arles", departement: "13", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "aubagne", nom: "Aubagne", departement: "13", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "gap", nom: "Gap", departement: "05", region: "Provence-Alpes-Côte d'Azur" },
  // Occitanie
  { slug: "toulouse", nom: "Toulouse", departement: "31", region: "Occitanie" },
  { slug: "montpellier", nom: "Montpellier", departement: "34", region: "Occitanie" },
  { slug: "nimes", nom: "Nîmes", departement: "30", region: "Occitanie" },
  { slug: "perpignan", nom: "Perpignan", departement: "66", region: "Occitanie" },
  { slug: "beziers", nom: "Béziers", departement: "34", region: "Occitanie" },
  { slug: "montauban", nom: "Montauban", departement: "82", region: "Occitanie" },
  { slug: "tarbes", nom: "Tarbes", departement: "65", region: "Occitanie" },
  { slug: "albi", nom: "Albi", departement: "81", region: "Occitanie" },
  // Nouvelle-Aquitaine
  { slug: "bordeaux", nom: "Bordeaux", departement: "33", region: "Nouvelle-Aquitaine" },
  { slug: "limoges", nom: "Limoges", departement: "87", region: "Nouvelle-Aquitaine" },
  { slug: "poitiers", nom: "Poitiers", departement: "86", region: "Nouvelle-Aquitaine" },
  { slug: "pau", nom: "Pau", departement: "64", region: "Nouvelle-Aquitaine" },
  { slug: "la-rochelle", nom: "La Rochelle", departement: "17", region: "Nouvelle-Aquitaine" },
  { slug: "niort", nom: "Niort", departement: "79", region: "Nouvelle-Aquitaine" },
  { slug: "bayonne", nom: "Bayonne", departement: "64", region: "Nouvelle-Aquitaine" },
  { slug: "angouleme", nom: "Angoulême", departement: "16", region: "Nouvelle-Aquitaine" },
  { slug: "perigueux", nom: "Périgueux", departement: "24", region: "Nouvelle-Aquitaine" },
  { slug: "merignac", nom: "Mérignac", departement: "33", region: "Nouvelle-Aquitaine" },
  { slug: "pessac", nom: "Pessac", departement: "33", region: "Nouvelle-Aquitaine" },
  // Hauts-de-France
  { slug: "lille", nom: "Lille", departement: "59", region: "Hauts-de-France" },
  { slug: "amiens", nom: "Amiens", departement: "80", region: "Hauts-de-France" },
  { slug: "roubaix", nom: "Roubaix", departement: "59", region: "Hauts-de-France" },
  { slug: "tourcoing", nom: "Tourcoing", departement: "59", region: "Hauts-de-France" },
  { slug: "dunkerque", nom: "Dunkerque", departement: "59", region: "Hauts-de-France" },
  { slug: "calais", nom: "Calais", departement: "62", region: "Hauts-de-France" },
  { slug: "villeneuve-d-ascq", nom: "Villeneuve-d'Ascq", departement: "59", region: "Hauts-de-France" },
  { slug: "saint-quentin", nom: "Saint-Quentin", departement: "02", region: "Hauts-de-France" },
  // Grand Est
  { slug: "strasbourg", nom: "Strasbourg", departement: "67", region: "Grand Est" },
  { slug: "reims", nom: "Reims", departement: "51", region: "Grand Est" },
  { slug: "metz", nom: "Metz", departement: "57", region: "Grand Est" },
  { slug: "nancy", nom: "Nancy", departement: "54", region: "Grand Est" },
  { slug: "mulhouse", nom: "Mulhouse", departement: "68", region: "Grand Est" },
  { slug: "troyes", nom: "Troyes", departement: "10", region: "Grand Est" },
  { slug: "colmar", nom: "Colmar", departement: "68", region: "Grand Est" },
  { slug: "thionville", nom: "Thionville", departement: "57", region: "Grand Est" },
  // Pays de la Loire
  { slug: "nantes", nom: "Nantes", departement: "44", region: "Pays de la Loire" },
  { slug: "angers", nom: "Angers", departement: "49", region: "Pays de la Loire" },
  { slug: "le-mans", nom: "Le Mans", departement: "72", region: "Pays de la Loire" },
  { slug: "laval", nom: "Laval", departement: "53", region: "Pays de la Loire" },
  // Bretagne
  { slug: "rennes", nom: "Rennes", departement: "35", region: "Bretagne" },
  { slug: "brest", nom: "Brest", departement: "29", region: "Bretagne" },
  { slug: "quimper", nom: "Quimper", departement: "29", region: "Bretagne" },
  { slug: "lorient", nom: "Lorient", departement: "56", region: "Bretagne" },
  { slug: "vannes", nom: "Vannes", departement: "56", region: "Bretagne" },
  { slug: "saint-malo", nom: "Saint-Malo", departement: "35", region: "Bretagne" },
  { slug: "saint-brieuc", nom: "Saint-Brieuc", departement: "22", region: "Bretagne" },
  // Normandie
  { slug: "rouen", nom: "Rouen", departement: "76", region: "Normandie" },
  { slug: "caen", nom: "Caen", departement: "14", region: "Normandie" },
  { slug: "le-havre", nom: "Le Havre", departement: "76", region: "Normandie" },
  { slug: "evreux", nom: "Évreux", departement: "27", region: "Normandie" },
  { slug: "cherbourg-en-cotentin", nom: "Cherbourg-en-Cotentin", departement: "50", region: "Normandie" },
  // Centre-Val de Loire
  { slug: "tours", nom: "Tours", departement: "37", region: "Centre-Val de Loire" },
  { slug: "orleans", nom: "Orléans", departement: "45", region: "Centre-Val de Loire" },
  { slug: "bourges", nom: "Bourges", departement: "18", region: "Centre-Val de Loire" },
  { slug: "chartres", nom: "Chartres", departement: "28", region: "Centre-Val de Loire" },
  { slug: "blois", nom: "Blois", departement: "41", region: "Centre-Val de Loire" },
  { slug: "chateauroux", nom: "Châteauroux", departement: "36", region: "Centre-Val de Loire" },
  // Bourgogne-Franche-Comté
  { slug: "dijon", nom: "Dijon", departement: "21", region: "Bourgogne-Franche-Comté" },
  { slug: "besancon", nom: "Besançon", departement: "25", region: "Bourgogne-Franche-Comté" },
  { slug: "macon", nom: "Mâcon", departement: "71", region: "Bourgogne-Franche-Comté" },
  { slug: "chalon-sur-saone", nom: "Chalon-sur-Saône", departement: "71", region: "Bourgogne-Franche-Comté" },
  { slug: "belfort", nom: "Belfort", departement: "90", region: "Bourgogne-Franche-Comté" },
  { slug: "auxerre", nom: "Auxerre", departement: "89", region: "Bourgogne-Franche-Comté" },
  // Corse
  { slug: "ajaccio", nom: "Ajaccio", departement: "2A", region: "Corse" },
  // Aulnay-sous-Bois (IDF)
  { slug: "aulnay-sous-bois", nom: "Aulnay-sous-Bois", departement: "93", region: "Île-de-France" },
  // Levallois-Perret (IDF)
  { slug: "levallois-perret", nom: "Levallois-Perret", departement: "92", region: "Île-de-France" },
];

// ─── Métiers ──────────────────────────────────────────────────────────────────

export const METIERS_SEO: MetierSEO[] = [
  { slug: "photographe", nom: "Photographe", categorie: "Photographe", icon: "📷", nomPluriel: "photographes" },
  { slug: "dj", nom: "DJ", categorie: "DJ", icon: "🎧", nomPluriel: "DJs" },
  { slug: "traiteur", nom: "Traiteur", categorie: "Traiteur", icon: "🍽️", nomPluriel: "traiteurs" },
  { slug: "fleuriste", nom: "Fleuriste", categorie: "Fleuriste", icon: "💐", nomPluriel: "fleuristes" },
  { slug: "wedding-planner", nom: "Wedding Planner", categorie: "Wedding Planner", icon: "📋", nomPluriel: "wedding planners" },
  { slug: "videaste", nom: "Vidéaste", categorie: "Vidéaste", icon: "🎬", nomPluriel: "vidéastes" },
  { slug: "lieu-de-reception", nom: "Lieu de réception", categorie: "Lieu de réception", icon: "🏛️", nomPluriel: "lieux de réception" },
  { slug: "coiffeur", nom: "Coiffeur", categorie: "Coiffeur", icon: "✂️", nomPluriel: "coiffeurs" },
  { slug: "maquilleur", nom: "Maquilleur", categorie: "Maquilleur", icon: "💄", nomPluriel: "maquilleurs" },
  { slug: "robes-de-mariee", nom: "Robes de mariée", categorie: "Robes de mariée", icon: "", nomPluriel: "boutiques de robes de mariée" },
  { slug: "costumes-smokings", nom: "Costumes & Smokings", categorie: "Costumes & Smokings", icon: "", nomPluriel: "boutiques de costumes et smokings" },
  { slug: "tenues-invites", nom: "Tenues invités", categorie: "Tenues invités", icon: "", nomPluriel: "boutiques de tenues pour invités" },
];

// ─── Fonctions utilitaires — Villes ───────────────────────────────────────────

export function parseSlug(slug: string): { metier: MetierSEO | null; ville: VilleSEO | null } {
  const marker = "-mariage-";
  const markerIndex = slug.indexOf(marker);
  if (markerIndex === -1) return { metier: null, ville: null };

  const metierSlug = slug.substring(0, markerIndex);
  const villeSlug = slug.substring(markerIndex + marker.length);

  const metier = METIERS_SEO.find((m) => m.slug === metierSlug) ?? null;
  const ville = VILLES_SEO.find((v) => v.slug === villeSlug) ?? null;

  return { metier, ville };
}

export function buildSlug(metierSlug: string, villeSlug: string): string {
  return `${metierSlug}-mariage-${villeSlug}`;
}

// ─── Fonctions utilitaires — Départements ─────────────────────────────────────

export function parseSlugDepartement(slug: string): { metier: MetierSEO | null; departement: DepartementSEO | null } {
  const marker = "-mariage-";
  const markerIndex = slug.indexOf(marker);
  if (markerIndex === -1) return { metier: null, departement: null };

  const metierSlug = slug.substring(0, markerIndex);
  const departementSlug = slug.substring(markerIndex + marker.length);

  const metier = METIERS_SEO.find((m) => m.slug === metierSlug) ?? null;
  const departement = DEPARTEMENTS_SEO.find((d) => d.slug === departementSlug) ?? null;

  return { metier, departement };
}

export function buildSlugDepartement(metierSlug: string, departementSlug: string): string {
  return `${metierSlug}-mariage-${departementSlug}`;
}

// ─── Fonctions utilitaires — Régions ──────────────────────────────────────────

export function parseSlugRegion(slug: string): { metier: MetierSEO | null; region: RegionSEO | null } {
  const marker = "-mariage-";
  const markerIndex = slug.indexOf(marker);
  if (markerIndex === -1) return { metier: null, region: null };

  const metierSlug = slug.substring(0, markerIndex);
  const regionSlug = slug.substring(markerIndex + marker.length);

  const metier = METIERS_SEO.find((m) => m.slug === metierSlug) ?? null;
  const region = REGIONS_SEO.find((r) => r.slug === regionSlug) ?? null;

  return { metier, region };
}

export function buildSlugRegion(metierSlug: string, regionSlug: string): string {
  return `${metierSlug}-mariage-${regionSlug}`;
}

// ─── Helpers de filtrage géographique ─────────────────────────────────────────

export function getVillesByDepartement(code: string): VilleSEO[] {
  return VILLES_SEO.filter((v) => v.departement === code);
}

export function getVillesByRegion(regionNom: string): VilleSEO[] {
  return VILLES_SEO.filter((v) => v.region === regionNom);
}

export function getDepartementsByRegion(regionNom: string): DepartementSEO[] {
  return DEPARTEMENTS_SEO.filter((d) => d.region === regionNom);
}

export function getDepartementByCode(code: string): DepartementSEO | undefined {
  return DEPARTEMENTS_SEO.find((d) => d.code === code);
}

export function getRegionByNom(nom: string): RegionSEO | undefined {
  return REGIONS_SEO.find((r) => r.nom === nom);
}

