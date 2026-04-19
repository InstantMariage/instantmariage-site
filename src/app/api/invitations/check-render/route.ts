export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRenderStatus } from "../../../../../lib/remotion-lambda";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Variables Supabase manquantes");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId requis" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: fetchErr } = await supabase
      .from("invitation_orders")
      .select("id, render_id, render_bucket, render_statut, video_url, invitation_id")
      .eq("id", orderId)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Statut terminal déjà en base
    if (order.render_statut === "done") {
      return NextResponse.json({ done: true, progress: 1, videoUrl: order.video_url });
    }
    if (order.render_statut === "error") {
      return NextResponse.json({ done: false, progress: 0, error: "Erreur de rendu" });
    }

    if (!order.render_id || !order.render_bucket) {
      return NextResponse.json({ done: false, progress: 0, renderStatut: order.render_statut });
    }

    const status = await checkRenderStatus(order.render_id, order.render_bucket);

    if (status.fatalErrorEncountered) {
      await supabase
        .from("invitation_orders")
        .update({ render_statut: "error" })
        .eq("id", orderId);

      console.error("[check-render] Erreur Lambda:", status.errors);
      return NextResponse.json({ done: false, progress: status.overallProgress, error: "Erreur de rendu Lambda" });
    }

    if (status.done && status.outputFile) {
      await supabase
        .from("invitation_orders")
        .update({ render_statut: "done", video_url: status.outputFile })
        .eq("id", orderId);

      // Propage la video_url sur l'invitation parente si présente
      if (order.invitation_id) {
        await supabase
          .from("invitations")
          .update({ apercu_url: status.outputFile })
          .eq("id", order.invitation_id);
      }

      return NextResponse.json({ done: true, progress: 1, videoUrl: status.outputFile });
    }

    return NextResponse.json({ done: false, progress: status.overallProgress });
  } catch (err) {
    console.error("[check-render] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur interne", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
