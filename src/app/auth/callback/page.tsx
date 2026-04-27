"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Connexion en cours…");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as "signup" | "email_change" | "recovery" | null;

      // Confirmation d'email (signup ou email_change)
      if (tokenHash && type) {
        setStatus("Confirmation de votre email…");
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error || !data.session) {
          setStatus("Lien invalide ou expiré. Redirection…");
          setTimeout(() => router.push("/login?error=email_confirm_failed"), 2000);
          return;
        }

        if (type === "email_change") {
          setStatus("Email modifié avec succès ! Redirection…");
          const role = data.session.user.user_metadata?.role as string | undefined;
          setTimeout(() => router.push(role === "prestataire" ? "/dashboard/prestataire" : "/dashboard/marie"), 1500);
          return;
        }

        // type === "signup"
        setStatus("Email confirmé ! Redirection…");
        const user = data.session.user;
        const role = user.user_metadata?.role as string | undefined;
        setTimeout(() => router.push(role === "prestataire" ? "/dashboard/prestataire" : "/dashboard/marie"), 1500);
        return;
      }

      // ── Flux OAuth (Google, etc.) ──────────────────────────────────────────

      if (!code) {
        setStatus("Erreur : paramètre manquant.");
        setTimeout(() => router.push("/login?error=oauth_failed"), 2000);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        setStatus("Erreur lors de la connexion. Redirection…");
        setTimeout(() => router.push("/login?error=oauth_failed"), 2000);
        return;
      }

      const user = data.session.user;
      let role = user.user_metadata?.role as string | undefined;

      // FIX BUG #3 — Récupère le rôle depuis localStorage si absent du metadata
      if (!role) {
        const intendedRole = localStorage.getItem("oauth_intended_role");
        if (intendedRole === "marie" || intendedRole === "prestataire") {
          role = intendedRole;
          await supabase.auth.updateUser({ data: { role } });
        }
      }
      localStorage.removeItem("oauth_intended_role");

      // FIX BUG #3 — Si toujours pas de rôle : renvoie choisir plutôt qu'assigner par défaut
      if (!role) {
        router.push("/inscription?oauth=true");
        return;
      }

      // FIX BUG #1 — Crée le profil s'il n'existe pas encore en base
      setStatus("Finalisation de votre compte…");

      if (role === "prestataire") {
        const { data: existing } = await supabase
          .from("prestataires")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          const nomEntreprise =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Mon entreprise";

          await fetch("/api/inscription/prestataire", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              nom_entreprise: nomEntreprise,
              categorie: "Autre",
            }),
          });
        }

        router.push("/dashboard/prestataire");
      } else {
        const { data: existing } = await supabase
          .from("maries")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          const prenomMarie1 = fullName.split(" ")[0] || "Prénom";

          await fetch("/api/inscription/marie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              prenom_marie1: prenomMarie1,
            }),
          });
        }

        router.push("/dashboard/marie");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Connexion en cours…</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
