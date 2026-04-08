"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

/* ─────────────────── Types ─────────────────── */
type Priority = "urgent" | "important" | "normal";

interface Task {
  id: string;
  label: string;
  category: string;
  priority: Priority;
  periodId: string;
}

interface Period {
  id: string;
  label: string;
  sublabel: string;
  emoji: string;
  color: string;
  monthsBefore?: number;
  daysBefore?: number; // positive = avant, 0 = jour J, négatif = après
}

/* ─────────────────── Périodes ─────────────────── */
const PERIODS: Period[] = [
  { id: "p18", label: "18 mois avant", sublabel: "Les grandes décisions", emoji: "🏰", color: "#6366F1", monthsBefore: 18 },
  { id: "p12", label: "12 mois avant", sublabel: "Réserver les essentiels", emoji: "📸", color: "#8B5CF6", monthsBefore: 12 },
  { id: "p9",  label: "9 mois avant",  sublabel: "Tenues & prestataires clés", emoji: "👗", color: "#EC4899", monthsBefore: 9 },
  { id: "p6",  label: "6 mois avant",  sublabel: "Faire-parts & détails", emoji: "💌", color: "#F06292", monthsBefore: 6 },
  { id: "p4",  label: "4 mois avant",  sublabel: "Confirmations & organisation", emoji: "✅", color: "#F59E0B", monthsBefore: 4 },
  { id: "p3",  label: "3 mois avant",  sublabel: "Administratif & coordinations", emoji: "📋", color: "#EF4444", monthsBefore: 3 },
  { id: "p2",  label: "2 mois avant",  sublabel: "Finalisations & voyages", emoji: "✈️", color: "#10B981", monthsBefore: 2 },
  { id: "p1",  label: "1 mois avant",  sublabel: "Derniers préparatifs", emoji: "🎯", color: "#06B6D4", monthsBefore: 1 },
  { id: "p2w", label: "2 semaines avant", sublabel: "Détails & vérifications", emoji: "🔍", color: "#F97316", daysBefore: 14 },
  { id: "p1w", label: "1 semaine avant",  sublabel: "Mise en place finale", emoji: "⏰", color: "#DC2626", daysBefore: 7 },
  { id: "pv",  label: "Veille du mariage", sublabel: "Dernière soirée de préparation", emoji: "🌙", color: "#BE185D", daysBefore: 1 },
  { id: "pj",  label: "Jour J", sublabel: "Le grand jour !", emoji: "💍", color: "#F06292", daysBefore: 0 },
  { id: "pa",  label: "Après le mariage", sublabel: "Les dernières formalités", emoji: "🥂", color: "#6B7280", daysBefore: -30 },
];

/* ─────────────────── 155 Tâches ─────────────────── */
const ALL_TASKS: Task[] = [
  // 18 mois avant
  { id: "t001", label: "Fixer la date du mariage", category: "Essentiel", priority: "urgent", periodId: "p18" },
  { id: "t002", label: "Définir le budget global", category: "Budget", priority: "urgent", periodId: "p18" },
  { id: "t003", label: "Dresser la liste d'invités préliminaire", category: "Invités", priority: "urgent", periodId: "p18" },
  { id: "t004", label: "Visiter et réserver la salle de réception", category: "Lieu", priority: "urgent", periodId: "p18" },
  { id: "t005", label: "Réserver la mairie pour le mariage civil", category: "Administratif", priority: "urgent", periodId: "p18" },
  { id: "t006", label: "Réserver l'église ou officiant cérémonie laïque", category: "Cérémonie", priority: "urgent", periodId: "p18" },
  { id: "t007", label: "Choisir un thème et un style pour le mariage", category: "Style", priority: "normal", periodId: "p18" },
  { id: "t008", label: "Créer un compte email dédié au mariage", category: "Organisation", priority: "normal", periodId: "p18" },
  { id: "t009", label: "Ouvrir une liste de mariage", category: "Cadeaux", priority: "normal", periodId: "p18" },
  { id: "t010", label: "Chercher un wedding planner si souhaité", category: "Organisation", priority: "normal", periodId: "p18" },
  { id: "t011", label: "Créer un tableau de budget détaillé", category: "Budget", priority: "important", periodId: "p18" },
  { id: "t012", label: "Constituer une équipe de confiance (témoins, etc.)", category: "Organisation", priority: "important", periodId: "p18" },

  // 12 mois avant
  { id: "t013", label: "Réserver le photographe", category: "Prestataires", priority: "urgent", periodId: "p12" },
  { id: "t014", label: "Réserver le traiteur", category: "Prestataires", priority: "urgent", periodId: "p12" },
  { id: "t015", label: "Réserver le DJ ou groupe de musique", category: "Animation", priority: "urgent", periodId: "p12" },
  { id: "t016", label: "Réserver le fleuriste", category: "Décoration", priority: "important", periodId: "p12" },
  { id: "t017", label: "Réserver le wedding planner", category: "Organisation", priority: "important", periodId: "p12" },
  { id: "t018", label: "Commencer les essayages de robe de mariée", category: "Tenues", priority: "important", periodId: "p12" },
  { id: "t019", label: "Commencer les recherches de costume", category: "Tenues", priority: "important", periodId: "p12" },
  { id: "t020", label: "Réserver les hébergements proches pour invités", category: "Invités", priority: "normal", periodId: "p12" },
  { id: "t021", label: "Définir les menus de réception", category: "Traiteur", priority: "normal", periodId: "p12" },
  { id: "t022", label: "Réserver un vidéaste / caméra", category: "Prestataires", priority: "important", periodId: "p12" },
  { id: "t023", label: "Planifier l'animation enfants (baby-sitter, espace)", category: "Invités", priority: "normal", periodId: "p12" },
  { id: "t024", label: "Choisir le style de déco (moodboard)", category: "Décoration", priority: "normal", periodId: "p12" },

  // 9 mois avant
  { id: "t025", label: "Commander / acheter la robe de mariée", category: "Tenues", priority: "urgent", periodId: "p9" },
  { id: "t026", label: "Choisir et commander les alliances", category: "Bijoux", priority: "urgent", periodId: "p9" },
  { id: "t027", label: "Finaliser la liste d'invités définitive", category: "Invités", priority: "urgent", periodId: "p9" },
  { id: "t028", label: "Réserver le maquilleur et/ou coiffeur", category: "Beauté", priority: "important", periodId: "p9" },
  { id: "t029", label: "Réserver la location de voiture de mariée", category: "Transport", priority: "important", periodId: "p9" },
  { id: "t030", label: "Choisir les décorations et centres de table", category: "Décoration", priority: "normal", periodId: "p9" },
  { id: "t031", label: "Choisir les dragées et cadeaux invités", category: "Cadeaux", priority: "normal", periodId: "p9" },
  { id: "t032", label: "Préparer un premier plan de table prévisionnel", category: "Organisation", priority: "normal", periodId: "p9" },
  { id: "t033", label: "Souscrire une assurance mariage", category: "Administratif", priority: "important", periodId: "p9" },
  { id: "t034", label: "Commander la pièce montée / gâteau de mariage", category: "Traiteur", priority: "urgent", periodId: "p9" },
  { id: "t035", label: "Choisir les tenues des témoins et du cortège", category: "Tenues", priority: "normal", periodId: "p9" },
  { id: "t036", label: "Préparer la musique de cérémonie", category: "Cérémonie", priority: "normal", periodId: "p9" },

  // 6 mois avant
  { id: "t037", label: "Commander les faire-parts", category: "Papeterie", priority: "urgent", periodId: "p6" },
  { id: "t038", label: "Créer le site web du mariage (save the date)", category: "Communication", priority: "important", periodId: "p6" },
  { id: "t039", label: "Organiser la dégustation menu avec le traiteur", category: "Traiteur", priority: "important", periodId: "p6" },
  { id: "t040", label: "Essayage robe n°1", category: "Tenues", priority: "important", periodId: "p6" },
  { id: "t041", label: "Commander les accessoires de mariée (voile, bijoux, chaussures)", category: "Tenues", priority: "important", periodId: "p6" },
  { id: "t042", label: "Réserver et organiser l'EVG / EVJF", category: "Fêtes", priority: "normal", periodId: "p6" },
  { id: "t043", label: "Préparer le déroulement détaillé de la cérémonie", category: "Cérémonie", priority: "important", periodId: "p6" },
  { id: "t044", label: "Réserver les transports collectifs (navettes)", category: "Transport", priority: "normal", periodId: "p6" },
  { id: "t045", label: "Prévoir une séance photo engagement", category: "Photographie", priority: "normal", periodId: "p6" },
  { id: "t046", label: "Commander les étiquettes et cartons cadeaux", category: "Papeterie", priority: "normal", periodId: "p6" },
  { id: "t047", label: "Commander le livre d'or personnalisé", category: "Souvenirs", priority: "normal", periodId: "p6" },
  { id: "t048", label: "Vérifier et confirmer tous les contrats prestataires", category: "Organisation", priority: "urgent", periodId: "p6" },

  // 4 mois avant
  { id: "t049", label: "Envoyer les faire-parts", category: "Invités", priority: "urgent", periodId: "p4" },
  { id: "t050", label: "Essayage robe n°2", category: "Tenues", priority: "important", periodId: "p4" },
  { id: "t051", label: "Finaliser les décorations florales avec le fleuriste", category: "Décoration", priority: "important", periodId: "p4" },
  { id: "t052", label: "Confirmer les prestataires réservés (appel de confirmation)", category: "Organisation", priority: "important", periodId: "p4" },
  { id: "t053", label: "Commencer la rédaction des vœux", category: "Cérémonie", priority: "normal", periodId: "p4" },
  { id: "t054", label: "Organiser l'EVG / EVJF (si pas encore fait)", category: "Fêtes", priority: "normal", periodId: "p4" },
  { id: "t055", label: "Choisir les lectures de cérémonie", category: "Cérémonie", priority: "normal", periodId: "p4" },
  { id: "t056", label: "Préparer les activités pour les enfants", category: "Invités", priority: "normal", periodId: "p4" },
  { id: "t057", label: "Planifier les cadeaux pour les témoins", category: "Cadeaux", priority: "normal", periodId: "p4" },
  { id: "t058", label: "Préparer un planning minute par minute du jour J", category: "Organisation", priority: "important", periodId: "p4" },
  { id: "t059", label: "Commander les menus imprimés", category: "Papeterie", priority: "normal", periodId: "p4" },
  { id: "t060", label: "Commander les marque-places et cartons de table", category: "Papeterie", priority: "normal", periodId: "p4" },

  // 3 mois avant
  { id: "t061", label: "Gérer les RSVP et confirmer le nombre d'invités", category: "Invités", priority: "urgent", periodId: "p3" },
  { id: "t062", label: "Actualiser le plan de table", category: "Organisation", priority: "urgent", periodId: "p3" },
  { id: "t063", label: "Accomplir les formalités administratives à la mairie", category: "Administratif", priority: "urgent", periodId: "p3" },
  { id: "t064", label: "Vérifier contrat de mariage / régime matrimonial", category: "Administratif", priority: "urgent", periodId: "p3" },
  { id: "t065", label: "Essayage robe n°3 avec accessoires", category: "Tenues", priority: "important", periodId: "p3" },
  { id: "t066", label: "Tester la coiffure et le maquillage", category: "Beauté", priority: "important", periodId: "p3" },
  { id: "t067", label: "Finaliser les vœux", category: "Cérémonie", priority: "important", periodId: "p3" },
  { id: "t068", label: "Préparer les discours (parents, témoins)", category: "Cérémonie", priority: "important", periodId: "p3" },
  { id: "t069", label: "Confirmer le menu final avec le traiteur", category: "Traiteur", priority: "important", periodId: "p3" },
  { id: "t070", label: "Commander les boîtes de dragées", category: "Cadeaux", priority: "normal", periodId: "p3" },
  { id: "t071", label: "Préparer un kit beauté d'urgence pour le jour J", category: "Beauté", priority: "normal", periodId: "p3" },
  { id: "t072", label: "Préparer les cadeaux des témoins", category: "Cadeaux", priority: "normal", periodId: "p3" },
  { id: "t073", label: "Vérifier les clauses d'annulation des contrats", category: "Organisation", priority: "important", periodId: "p3" },
  { id: "t074", label: "Préparer les animations de soirée (jeux, quiz, etc.)", category: "Animation", priority: "normal", periodId: "p3" },

  // 2 mois avant
  { id: "t075", label: "Envoyer les rappels et informations pratiques aux invités", category: "Invités", priority: "urgent", periodId: "p2" },
  { id: "t076", label: "Essayage final robe avec tous les accessoires", category: "Tenues", priority: "urgent", periodId: "p2" },
  { id: "t077", label: "Finaliser le plan de table", category: "Organisation", priority: "urgent", periodId: "p2" },
  { id: "t078", label: "Planifier et réserver la lune de miel", category: "Voyage", priority: "urgent", periodId: "p2" },
  { id: "t079", label: "Vérifier passeports et visas pour la lune de miel", category: "Administratif", priority: "urgent", periodId: "p2" },
  { id: "t080", label: "Préparer les enveloppes de rémunération prestataires", category: "Budget", priority: "important", periodId: "p2" },
  { id: "t081", label: "Finaliser le programme imprimé de la cérémonie", category: "Papeterie", priority: "important", periodId: "p2" },
  { id: "t082", label: "Envoyer le programme détaillé à l'officiant", category: "Cérémonie", priority: "important", periodId: "p2" },
  { id: "t083", label: "Réserver les transports pour la lune de miel", category: "Voyage", priority: "important", periodId: "p2" },
  { id: "t084", label: "Préparer les corbeilles de bienvenue (salle de bain)", category: "Décoration", priority: "normal", periodId: "p2" },
  { id: "t085", label: "Commander les petits cadeaux pour les invités", category: "Cadeaux", priority: "normal", periodId: "p2" },
  { id: "t086", label: "Préparer les petits mots de remerciement", category: "Communication", priority: "normal", periodId: "p2" },

  // 1 mois avant
  { id: "t087", label: "Récupérer les alliances", category: "Bijoux", priority: "urgent", periodId: "p1" },
  { id: "t088", label: "Confirmer tous les prestataires avec horaires précis", category: "Organisation", priority: "urgent", periodId: "p1" },
  { id: "t089", label: "Finaliser les vœux définitifs", category: "Cérémonie", priority: "urgent", periodId: "p1" },
  { id: "t090", label: "Vérifier la tenue complète du marié", category: "Tenues", priority: "important", periodId: "p1" },
  { id: "t091", label: "Fournir la liste de chansons au DJ", category: "Animation", priority: "important", periodId: "p1" },
  { id: "t092", label: "Organiser le transport mairie → réception", category: "Transport", priority: "important", periodId: "p1" },
  { id: "t093", label: "Préparer les valises pour la lune de miel", category: "Voyage", priority: "important", periodId: "p1" },
  { id: "t094", label: "Dernières confirmations avec l'officiant", category: "Cérémonie", priority: "important", periodId: "p1" },
  { id: "t095", label: "Préparer les bouquets et boutonnières (brief fleuriste)", category: "Décoration", priority: "important", periodId: "p1" },
  { id: "t096", label: "Prévoir un kit couture d'urgence", category: "Organisation", priority: "normal", periodId: "p1" },
  { id: "t097", label: "Prévoir une trousse pharmacie d'urgence", category: "Santé", priority: "normal", periodId: "p1" },
  { id: "t098", label: "Distribuer le planning détaillé aux témoins", category: "Organisation", priority: "important", periodId: "p1" },
  { id: "t099", label: "Envoyer l'adresse GPS du lieu à tous les invités", category: "Communication", priority: "important", periodId: "p1" },
  { id: "t100", label: "Prévenir les voisins du lieu de réception du bruit", category: "Communication", priority: "normal", periodId: "p1" },

  // 2 semaines avant
  { id: "t101", label: "Confirmer le nombre final d'invités au traiteur", category: "Traiteur", priority: "urgent", periodId: "p2w" },
  { id: "t102", label: "Imprimer le plan de table final et les marque-places", category: "Organisation", priority: "urgent", periodId: "p2w" },
  { id: "t103", label: "Confirmer les transports du jour J", category: "Transport", priority: "urgent", periodId: "p2w" },
  { id: "t104", label: "Préparer les enveloppes de paiement pour les témoins", category: "Budget", priority: "important", periodId: "p2w" },
  { id: "t105", label: "Essayage final coiffure + maquillage avec tous accessoires", category: "Beauté", priority: "important", periodId: "p2w" },
  { id: "t106", label: "Récupérer toutes les tenues du cortège", category: "Tenues", priority: "important", periodId: "p2w" },
  { id: "t107", label: "Finaliser et ranger toutes les décorations", category: "Décoration", priority: "important", periodId: "p2w" },
  { id: "t108", label: "Préparer un sac d'urgence pour le jour J", category: "Organisation", priority: "important", periodId: "p2w" },
  { id: "t109", label: "Briefer les témoins sur leur rôle exact", category: "Organisation", priority: "important", periodId: "p2w" },
  { id: "t110", label: "Tester la playlist finale avec le DJ", category: "Animation", priority: "normal", periodId: "p2w" },
  { id: "t111", label: "Vérifier avec le photographe : liste shots, horaires", category: "Photographie", priority: "important", periodId: "p2w" },
  { id: "t112", label: "Préparer et distribuer les cadeaux invités", category: "Cadeaux", priority: "normal", periodId: "p2w" },
  { id: "t113", label: "Prévoir un plan B en cas de météo défavorable", category: "Organisation", priority: "normal", periodId: "p2w" },

  // 1 semaine avant
  { id: "t114", label: "Récupérer la robe de mariée définitivement", category: "Tenues", priority: "urgent", periodId: "p1w" },
  { id: "t115", label: "Préparer les enveloppes de paiement prestataires", category: "Budget", priority: "urgent", periodId: "p1w" },
  { id: "t116", label: "Confirmer les horaires précis à chaque prestataire", category: "Organisation", priority: "urgent", periodId: "p1w" },
  { id: "t117", label: "Répétition de cérémonie (rehearsal)", category: "Cérémonie", priority: "important", periodId: "p1w" },
  { id: "t118", label: "Décoration de la salle (si accès possible)", category: "Décoration", priority: "urgent", periodId: "p1w" },
  { id: "t119", label: "Se reposer, se faire plaisir, se chouchouter", category: "Bien-être", priority: "important", periodId: "p1w" },
  { id: "t120", label: "Faire la manucure et pédicure", category: "Beauté", priority: "important", periodId: "p1w" },
  { id: "t121", label: "Vérifier la tenue complète une dernière fois", category: "Tenues", priority: "important", periodId: "p1w" },
  { id: "t122", label: "Charger tous les appareils photo et batteries", category: "Photographie", priority: "normal", periodId: "p1w" },
  { id: "t123", label: "Organiser un dîner de répétition avec les proches", category: "Fêtes", priority: "normal", periodId: "p1w" },
  { id: "t124", label: "Préparer les vêtements du lendemain du mariage", category: "Organisation", priority: "normal", periodId: "p1w" },
  { id: "t125", label: "Faire un dernier point avec le wedding planner", category: "Organisation", priority: "important", periodId: "p1w" },

  // Veille du mariage
  { id: "t126", label: "Confirmer l'heure avec le coiffeur et maquilleur", category: "Beauté", priority: "urgent", periodId: "pv" },
  { id: "t127", label: "Récupérer les fleurs auprès du fleuriste", category: "Décoration", priority: "urgent", periodId: "pv" },
  { id: "t128", label: "Dernière vérification de la salle de réception", category: "Organisation", priority: "urgent", periodId: "pv" },
  { id: "t129", label: "Vérifier que les enveloppes prestataires sont prêtes", category: "Budget", priority: "urgent", periodId: "pv" },
  { id: "t130", label: "Préparer la pochette du marié (alliances, vœux, contacts)", category: "Organisation", priority: "urgent", periodId: "pv" },
  { id: "t131", label: "Dîner léger et calme avec les proches", category: "Bien-être", priority: "important", periodId: "pv" },
  { id: "t132", label: "Se coucher tôt — sommeil réparateur", category: "Bien-être", priority: "important", periodId: "pv" },
  { id: "t133", label: "Mettre l'alarme suffisamment à l'avance", category: "Organisation", priority: "important", periodId: "pv" },
  { id: "t134", label: "Recharger les téléphones et appareils", category: "Organisation", priority: "normal", periodId: "pv" },
  { id: "t135", label: "Se faire masser ou spa si possible", category: "Bien-être", priority: "normal", periodId: "pv" },

  // Jour J
  { id: "t136", label: "Petit-déjeuner copieux pour tenir toute la journée", category: "Bien-être", priority: "urgent", periodId: "pj" },
  { id: "t137", label: "Coiffure et maquillage de la mariée", category: "Beauté", priority: "urgent", periodId: "pj" },
  { id: "t138", label: "Habillage de la mariée + voile et accessoires", category: "Tenues", priority: "urgent", periodId: "pj" },
  { id: "t139", label: "Photos des préparatifs avec le photographe", category: "Photographie", priority: "urgent", periodId: "pj" },
  { id: "t140", label: "Départ en voiture de mariée vers la mairie à l'heure", category: "Transport", priority: "urgent", periodId: "pj" },
  { id: "t141", label: "Cérémonie civile à la mairie", category: "Cérémonie", priority: "urgent", periodId: "pj" },
  { id: "t142", label: "Cérémonie religieuse ou laïque", category: "Cérémonie", priority: "urgent", periodId: "pj" },
  { id: "t143", label: "Séance photos de couple (couple session)", category: "Photographie", priority: "urgent", periodId: "pj" },
  { id: "t144", label: "Cocktail de bienvenue avec les invités", category: "Réception", priority: "urgent", periodId: "pj" },
  { id: "t145", label: "Repas de mariage / dîner", category: "Réception", priority: "urgent", periodId: "pj" },
  { id: "t146", label: "Payer les prestataires (enveloppes préparées)", category: "Budget", priority: "urgent", periodId: "pj" },
  { id: "t147", label: "Remise des cadeaux aux témoins", category: "Cadeaux", priority: "important", periodId: "pj" },
  { id: "t148", label: "Soirée dansante et fête", category: "Animation", priority: "urgent", periodId: "pj" },
  { id: "t149", label: "Remercier les invités en personne", category: "Communication", priority: "important", periodId: "pj" },
  { id: "t150", label: "Départ en lune de miel !", category: "Voyage", priority: "urgent", periodId: "pj" },

  // Après le mariage
  { id: "t151", label: "Envoyer les cartes de remerciements à tous les invités", category: "Communication", priority: "important", periodId: "pa" },
  { id: "t152", label: "Commander l'album photo auprès du photographe", category: "Photographie", priority: "important", periodId: "pa" },
  { id: "t153", label: "Changement de nom si souhaité (administrations)", category: "Administratif", priority: "normal", periodId: "pa" },
  { id: "t154", label: "Rédiger des avis sur les prestataires InstantMariage", category: "Communication", priority: "normal", periodId: "pa" },
  { id: "t155", label: "Retourner les tenues et accessoires de location", category: "Tenues", priority: "normal", periodId: "pa" },
];

/* ─────────────────── Utils ─────────────────── */
function computeDeadline(weddingDate: Date, period: Period): Date {
  const d = new Date(weddingDate);
  if (period.daysBefore !== undefined) {
    d.setDate(d.getDate() - period.daysBefore);
  } else if (period.monthsBefore !== undefined) {
    d.setMonth(d.getMonth() - period.monthsBefore);
  }
  return d;
}

function formatDateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function getRelativeLabel(deadline: Date, weddingDate: Date): { text: string; late: boolean } {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days < 0) {
    // If the wedding hasn't happened yet, this is a past milestone — not truly "late"
    const weddingInFuture = weddingDate.getTime() > now.getTime();
    if (weddingInFuture) {
      const absDays = Math.abs(days);
      if (absDays < 31) return { text: `Il y a ${absDays} j`, late: false };
      const months = Math.round(absDays / 30);
      return { text: `Il y a ${months} mois`, late: false };
    }
    return { text: `En retard de ${Math.abs(days)} j`, late: true };
  }
  if (days === 0) return { text: "Aujourd'hui !", late: false };
  if (days < 7) return { text: `Dans ${days} jour${days > 1 ? "s" : ""}`, late: false };
  if (days < 31) return { text: `Dans ${Math.round(days / 7)} sem.`, late: false };
  const months = Math.round(days / 30);
  return { text: `Dans ${months} mois`, late: false };
}

const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; text: string; dot: string }> = {
  urgent: { label: "Urgent", bg: "#FFF0F5", text: "#F06292", dot: "#F06292" },
  important: { label: "Important", bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
  normal: { label: "Normal", bg: "#F9FAFB", text: "#9CA3AF", dot: "#D1D5DB" },
};

/* ─────────────────── Composant principal ─────────────────── */
export default function Retroplanning() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [prenomMarie1, setPrenomMarie1] = useState("");
  const [weddingDateStr, setWeddingDateStr] = useState<string | null>(null);
  const [inputDate, setInputDate] = useState("");
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [openPeriods, setOpenPeriods] = useState<Set<string>>(new Set(["p18", "p12"]));
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  /* Auth + data load */
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUserId(session.user.id);

      const { data: marie } = await supabase
        .from("maries")
        .select("prenom_marie1, date_mariage")
        .eq("user_id", session.user.id)
        .single();

      if (marie) {
        setPrenomMarie1(marie.prenom_marie1 || "");
        if (marie.date_mariage) {
          setWeddingDateStr(marie.date_mariage);
          setInputDate(marie.date_mariage);
        }
      } else {
        const meta = session.user.user_metadata;
        setPrenomMarie1(meta?.prenom || "");
        if (meta?.date_mariage) {
          setWeddingDateStr(meta.date_mariage);
          setInputDate(meta.date_mariage);
        }
      }

      // Load checked state from localStorage
      const stored = localStorage.getItem(`retroplanning_${session.user.id}`);
      if (stored) {
        try { setDoneIds(new Set(JSON.parse(stored))); } catch {}
      }

      setAuthChecked(true);
    });
  }, [router]);

  /* Persist checked state */
  const persistDone = useCallback((ids: Set<string>, uid: string) => {
    localStorage.setItem(`retroplanning_${uid}`, JSON.stringify(Array.from(ids)));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (userId) persistDone(next, userId);
      return next;
    });
  }, [userId, persistDone]);

  const togglePeriod = (id: string) => {
    setOpenPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* Date change */
  const applyDate = () => {
    if (inputDate) setWeddingDateStr(inputDate);
  };

  /* Computed values */
  const weddingDate = useMemo(
    () => (weddingDateStr ? new Date(weddingDateStr) : null),
    [weddingDateStr]
  );

  const daysUntil = useMemo(() => {
    if (!weddingDate) return null;
    const diff = weddingDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [weddingDate]);

  const filteredTasks = useMemo(() => {
    return ALL_TASKS.filter((t) => {
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (searchQuery && !t.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterPriority, searchQuery]);

  const totalTasks = ALL_TASKS.length;
  const doneTasks = Array.from(doneIds).filter((id) => ALL_TASKS.find((t) => t.id === id)).length;
  const globalPct = Math.round((doneTasks / totalTasks) * 100);

  /* Period stats */
  const periodStats = useMemo(() => {
    return PERIODS.map((p) => {
      const tasks = filteredTasks.filter((t) => t.periodId === p.id);
      const done = tasks.filter((t) => doneIds.has(t.id)).length;
      return { period: p, tasks, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
    }).filter((s) => s.tasks.length > 0);
  }, [filteredTasks, doneIds]);

  /* Mark all in period */
  const markAllInPeriod = (periodId: string, mark: boolean) => {
    const ids = ALL_TASKS.filter((t) => t.periodId === periodId).map((t) => t.id);
    setDoneIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => mark ? next.add(id) : next.delete(id));
      if (userId) persistDone(next, userId);
      return next;
    });
  };

  if (!authChecked) return null;

  return (
    <main className="min-h-screen" style={{ background: "#FFF5F8" }}>
      <Header />

      <div className="pt-20 pb-20">
        {/* ── Header ── */}
        <section
          className="max-w-4xl mx-auto px-6 pt-12 pb-8 mb-2 rounded-b-3xl"
          style={{ background: "linear-gradient(160deg, #FFDDE8 0%, #FFF0F5 50%, #FFF5F8 100%)" }}
        >
          <Link
            href="/dashboard/marie"
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity mb-6"
            style={{ color: "#C2768D" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tableau de bord
          </Link>
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "#E91E8C", letterSpacing: "0.12em" }}>
            Outils mariés
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight mb-1">Rétroplanning</h1>
          <p className="text-base mb-8" style={{ color: "#C2768D" }}>
            {prenomMarie1 ? `Bonjour ${prenomMarie1} · ` : ""}
            {totalTasks} tâches pour votre mariage parfait
          </p>

          {weddingDate && daysUntil !== null && (
            <div
              className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #fff 60%, #FFF0F5 100%)",
                boxShadow: "0 4px 24px rgba(240,98,146,0.13)",
                border: "1px solid #FECDD3",
              }}
            >
              <div>
                <span className="text-4xl font-bold tabular-nums" style={{ color: "#E91E8C" }}>{daysUntil}</span>
                <span className="text-lg text-gray-400 ml-1.5">jours</span>
              </div>
              <div className="w-px h-8" style={{ background: "#FECDD3" }} />
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#C2768D" }}>Jour J</p>
                <p className="text-sm font-medium text-gray-700">{formatDateFr(weddingDate)}</p>
              </div>
            </div>
          )}
        </section>

        <div className="max-w-4xl mx-auto px-6 space-y-4">

          {/* Date de mariage si pas définie */}
          {!weddingDateStr && (
            <div
              className="rounded-3xl p-6"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FFF0F5", color: "#F06292" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="3" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Entrez votre date de mariage</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Toutes les échéances seront calculées automatiquement.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="date"
                      value={inputDate}
                      onChange={(e) => setInputDate(e.target.value)}
                      className="border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300 bg-gray-50"
                    />
                    <button
                      onClick={applyDate}
                      disabled={!inputDate}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-80"
                      style={{ background: "#F06292" }}
                    >
                      Générer mon planning
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard progression */}
          {weddingDateStr && (
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Progression</h2>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{doneTasks} <span className="text-base font-normal text-gray-400">/ {totalTasks} tâches</span></p>
                  </div>
                  <span className="text-3xl font-bold tabular-nums" style={{ color: "#F06292" }}>{globalPct}%</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${globalPct}%`, background: "#F06292" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Urgent restant",
                      count: ALL_TASKS.filter((t) => t.priority === "urgent" && !doneIds.has(t.id)).length,
                      color: "#F06292",
                      bg: "#FFF0F5",
                    },
                    {
                      label: "Important restant",
                      count: ALL_TASKS.filter((t) => t.priority === "important" && !doneIds.has(t.id)).length,
                      color: "#6B7280",
                      bg: "#F3F4F6",
                    },
                    {
                      label: "Terminées",
                      count: doneTasks,
                      color: "#374151",
                      bg: "#F9FAFB",
                    },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
                      <div className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.count}</div>
                      <div className="text-xs font-medium mt-0.5 text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-3 flex items-center gap-3 border-t border-gray-50 bg-gray-50/50">
                <span className="text-xs text-gray-400">Date :</span>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-300 bg-white"
                />
                <button
                  onClick={applyDate}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-80"
                  style={{ background: "#F06292" }}
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          )}

          {/* Filtres */}
          {weddingDateStr && (
            <div
              className="rounded-3xl p-4"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher une tâche…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-100 rounded-2xl focus:outline-none focus:border-rose-200 bg-gray-50"
                  />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {[
                    { value: "all", label: "Tout" },
                    { value: "urgent", label: "Urgent" },
                    { value: "important", label: "Important" },
                    { value: "normal", label: "Normal" },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilterPriority(f.value as Priority | "all")}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150"
                      style={
                        filterPriority === f.value
                          ? { background: "#F06292", color: "white" }
                          : { background: "#F3F4F6", color: "#6B7280" }
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Périodes et tâches */}
          {weddingDateStr && periodStats.map(({ period, tasks, done, pct }) => {
            const deadline = computeDeadline(new Date(weddingDateStr), period);
            const isOpen = openPeriods.has(period.id);
            const allDone = done === tasks.length;
            const relLabel = getRelativeLabel(deadline, new Date(weddingDateStr));

            return (
              <div
                key={period.id}
                className="rounded-3xl overflow-hidden"
                style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
              >
                {/* Header période */}
                <button
                  onClick={() => togglePeriod(period.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/60 transition-colors text-left"
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{
                      background: allDone ? period.color : `${period.color}22`,
                    }}
                  >
                    {allDone ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{period.emoji}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{period.label}</span>
                      <span className="text-xs text-gray-400">{period.sublabel}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1 max-w-28">
                        <div
                          className="h-1 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: period.color }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">{done}/{tasks.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline"
                      style={{
                        background: relLabel.late ? "#FFF0F5" : "#F3F4F6",
                        color: relLabel.late ? "#F06292" : "#6B7280",
                      }}
                    >
                      {relLabel.text}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Tasks list */}
                {isOpen && (
                  <div className="border-t border-gray-50">
                    <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/40">
                      <span className="text-xs text-gray-400">{tasks.length} tâche{tasks.length > 1 ? "s" : ""} · {formatDateFr(deadline)}</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => markAllInPeriod(period.id, true)}
                          className="text-xs font-semibold transition-opacity hover:opacity-70"
                          style={{ color: "#F06292" }}
                        >
                          Tout cocher
                        </button>
                        <span className="text-gray-200">·</span>
                        <button
                          onClick={() => markAllInPeriod(period.id, false)}
                          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Décocher
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {tasks.map((task) => {
                        const isDone = doneIds.has(task.id);
                        const pc = PRIORITY_CONFIG[task.priority];

                        return (
                          <label
                            key={task.id}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 cursor-pointer transition-colors"
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                              style={{
                                border: isDone ? "none" : "1.5px solid #D1D5DB",
                                background: isDone ? "#F06292" : "transparent",
                              }}
                            >
                              <input type="checkbox" checked={isDone} onChange={() => toggleTask(task.id)} className="sr-only" />
                              {isDone && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${isDone ? "line-through text-gray-300" : "text-gray-700"}`}>
                                {task.label}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5">{task.category}</p>
                            </div>

                            {!isDone && (
                              <span
                                className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ background: pc.bg, color: pc.text }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pc.dot }} />
                                {pc.label}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!weddingDateStr && (
            <div
              className="rounded-3xl p-12 text-center"
              style={{ background: "white", boxShadow: "0 4px 24px rgba(240,98,146,0.08)", border: "1px solid #FECDD3" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#FFF0F5", color: "#F06292" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="3" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Entrez votre date de mariage</h3>
              <p className="text-sm text-gray-400">
                Renseignez la date ci-dessus pour générer votre rétroplanning avec {totalTasks} tâches.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

