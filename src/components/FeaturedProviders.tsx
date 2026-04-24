import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type FeaturedPrestataire = {
  id: string;
  nom_entreprise: string;
  categorie: string;
  ville: string | null;
  cover_url: string | null;
  photos: string[] | null;
  note_moyenne: number;
  nb_avis: number;
};

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

function StarRating({ note }: { note: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(note) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
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

        {prestataires.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl shadow-card border border-rose-100 text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-6">💍</div>
            <h3
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Soyez parmi les premiers prestataires sur InstantMariage&nbsp;!
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              La plateforme est en plein lancement. Inscrivez-vous gratuitement dès maintenant et gagnez en visibilité auprès des futurs mariés.
            </p>
            <a
              href="/inscription"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #F06292 0%, #e91e8c 100%)" }}
            >
              S&apos;inscrire gratuitement
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prestataires.map((p) => {
              const photo = p.cover_url ?? p.photos?.[0] ?? null;
              return (
                <Link
                  key={p.id}
                  href={`/prestataires/${p.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 bg-rose-50 overflow-hidden">
                    {photo ? (
                      <img
                        src={photo}
                        alt={p.nom_entreprise}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-rose-200">
                        💍
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-1.5 flex-1">
                    <p className="text-xs font-semibold text-[#F06292] uppercase tracking-wide">
                      {p.categorie.replace(/_/g, " ")}
                    </p>
                    <h3
                      className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#F06292] transition-colors"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {p.nom_entreprise}
                    </h3>
                    {p.ville && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.ville}
                      </p>
                    )}
                    {p.nb_avis > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating note={p.note_moyenne} />
                        <span className="text-xs text-gray-500">
                          {p.note_moyenne.toFixed(1)} ({p.nb_avis} avis)
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
