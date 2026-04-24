import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("statut", "publie")
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment views (fire and forget — race condition acceptable for a view counter)
  supabase
    .from("articles")
    .update({ nb_vues: (data.nb_vues ?? 0) + 1 })
    .eq("slug", slug)
    .then(() => {});

  return NextResponse.json(data);
}
