"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function FairePartDashboardBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: marie } = await supabase
        .from("maries")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!marie) return;
      const { count } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("marie_id", marie.id);
      if (count && count > 0) setShow(true);
    });
  }, []);

  if (!show) return null;

  return (
    <div
      className="w-full"
      style={{ background: "linear-gradient(90deg, #F06292 0%, #e91e8c 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-white">
          Vous avez déjà des faire-parts créés sur votre compte.
        </p>
        <Link
          href="/dashboard/marie/faire-part"
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "rgba(255,255,255,0.22)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }}
        >
          Voir mes faire-parts déjà créés →
        </Link>
      </div>
    </div>
  );
}
