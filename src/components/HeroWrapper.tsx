export const revalidate = 3600;

import { createClient } from "@supabase/supabase-js";
import Hero from "./Hero";

async function getActiveCount(): Promise<number> {
  const { count } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
    .from("prestataires")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function HeroWrapper() {
  const targetCount = await getActiveCount();
  return <Hero targetCount={targetCount} />;
}
