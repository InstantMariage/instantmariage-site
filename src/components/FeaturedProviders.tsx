export const revalidate = 60;

import { createClient } from "@supabase/supabase-js";
import FeaturedProvidersClient, { type FeaturedPrestataire } from "./FeaturedProvidersClient";

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function getFeatured(): Promise<FeaturedPrestataire[]> {
  const { data } = await serverClient()
    .from("prestataires")
    .select("id, nom_entreprise, categorie, ville, cover_url, photos, note_moyenne, nb_avis")
    .eq("mis_en_avant", true)
    .limit(6);
  return (data as FeaturedPrestataire[]) ?? [];
}

export default async function FeaturedProviders() {
  const prestataires = await getFeatured();

  return (
    <section id="prestataires" className="py-20 bg-gradient-to-b from-white to-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#F06292] text-sm font-semibold tracking-widest uppercase mb-3">
            Sélection du moment
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Prestataires mis en avant
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-300 to-gold-500 mx-auto mt-4 rounded-full" />
        </div>

        <FeaturedProvidersClient prestataires={prestataires} />
      </div>
    </section>
  );
}
