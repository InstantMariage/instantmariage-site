import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour les tables
export type UserRole = 'marie' | 'prestataire' | 'admin'

export type User = {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export type Prestataire = {
  id: string
  user_id: string
  nom_entreprise: string
  categorie: string
  description: string | null
  ville: string | null
  departement: string | null
  telephone: string | null
  site_web: string | null
  photos: string[]
  avatar_url: string | null
  cover_url: string | null
  cover_position: number | null
  prix_depart: number | null
  note_moyenne: number
  nb_avis: number
  abonnement_actif: boolean
  verifie: boolean
  created_at: string
  updated_at: string
}

export type Marie = {
  id: string
  user_id: string
  prenom_marie1: string
  prenom_marie2: string | null
  date_mariage: string | null
  lieu_mariage: string | null
  budget_total: number | null
  nb_invites: number | null
  created_at: string
  updated_at: string
}

export type PlanAbonnement = 'gratuit' | 'starter' | 'pro' | 'premium'

export type Abonnement = {
  id: string
  prestataire_id: string
  plan: PlanAbonnement
  statut: 'actif' | 'inactif' | 'expire'
  date_debut: string
  date_fin: string | null
  prix: number
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
}

export type Conversation = {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  expediteur_id: string
  destinataire_id: string
  sujet: string | null
  contenu: string
  lu: boolean
  created_at: string
}

export type Avis = {
  id: string
  prestataire_id: string
  marie_id: string
  note: number
  commentaire: string | null
  date_mariage_couple: string | null
  reponse_prestataire: string | null
  reponse_at: string | null
  created_at: string
}
