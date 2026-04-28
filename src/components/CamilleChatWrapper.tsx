"use client";

import { usePathname } from "next/navigation";
import CamilleChat from "./CamilleChat";

export default function CamilleChatWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard/prestataire")) return null;
  return <CamilleChat />;
}
