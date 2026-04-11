"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

async function getSenderName(senderId: string): Promise<string> {
  const { data: prest } = await supabase
    .from("prestataires")
    .select("nom_entreprise")
    .eq("user_id", senderId)
    .maybeSingle();
  if (prest?.nom_entreprise) return prest.nom_entreprise;

  const { data: marie } = await supabase
    .from("maries")
    .select("prenom_marie1, prenom_marie2")
    .eq("user_id", senderId)
    .maybeSingle();
  if (marie?.prenom_marie1) {
    return marie.prenom_marie2
      ? `${marie.prenom_marie1} & ${marie.prenom_marie2}`
      : marie.prenom_marie1;
  }

  return "Nouveau message";
}

async function showPushNotification(
  title: string,
  body: string,
  conversationId: string
) {
  if (!("serviceWorker" in navigator)) return;
  if (Notification.permission !== "granted") return;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: `/messages/${conversationId}` },
      tag: `message-${conversationId}`,
      renotify: true,
      vibrate: [200, 100, 200],
    } as NotificationOptions);
  } catch (err) {
    console.error("[PushNotifications] showNotification error:", err);
  }
}

export default function PushNotifications() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Maintenir une ref à jour pour les callbacks Realtime (évite les closures périmées)
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // 1. Enregistre le Service Worker une seule fois
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("[SW] Registration failed:", err));
  }, []);

  // 2. Demande la permission notifications :
  //    - uniquement en mode PWA standalone (iOS/Android)
  //    - uniquement si l'utilisateur est connecté
  //    - uniquement si la permission n'a pas encore été décidée
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (!window.matchMedia("(display-mode: standalone)").matches) return;

    let timer: ReturnType<typeof setTimeout>;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      timer = setTimeout(() => {
        Notification.requestPermission();
      }, 4000);
    });

    return () => clearTimeout(timer);
  }, []);

  // 3. Écoute les nouveaux messages via Supabase Realtime
  useEffect(() => {
    if (!("Notification" in window)) return;

    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;

      channelRef = supabase
        .channel(`push-notif-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `destinataire_id=eq.${uid}`,
          },
          async (payload) => {
            // Ne pas notifier si l'utilisateur est déjà sur la messagerie
            if (pathnameRef.current.startsWith("/messages")) return;

            if (Notification.permission !== "granted") return;

            const { conversation_id, expediteur_id, contenu } = payload.new as {
              conversation_id: string;
              expediteur_id: string;
              contenu: string;
            };

            const senderName = await getSenderName(expediteur_id);
            const preview =
              contenu && contenu.length > 80
                ? contenu.substring(0, 80) + "…"
                : contenu ?? "";

            await showPushNotification(senderName, preview, conversation_id);
          }
        )
        .subscribe();
    });

    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, []); // S'abonne une seule fois, utilise la ref pour le pathname

  return null;
}
