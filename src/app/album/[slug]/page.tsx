import { createClient } from "@supabase/supabase-js";
import AlbumUploadClient from "./AlbumUploadClient";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function AlbumPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supabase = serviceClient();

  const { data: marie } = await supabase
    .from("maries")
    .select("id, prenom_marie1, prenom_marie2, date_mariage")
    .eq("album_slug", slug)
    .eq("album_actif", true)
    .single();

  if (!marie) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#FEF0F5" }}>
        <div className="text-center px-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#FFF0F5" }}
          >
            <svg className="w-8 h-8" style={{ color: "#F06292" }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Album introuvable</h1>
          <p className="text-sm text-gray-500">Ce lien est invalide ou l&apos;album n&apos;est plus actif.</p>
        </div>
      </main>
    );
  }

  return (
    <AlbumUploadClient
      slug={slug}
      prenom1={marie.prenom_marie1}
      prenom2={marie.prenom_marie2}
      dateMariage={marie.date_mariage}
    />
  );
}
