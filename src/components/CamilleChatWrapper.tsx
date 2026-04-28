"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CamilleChat from "./CamilleChat";

export default function CamilleChatWrapper() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) return null;
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard/prestataire")) return null;
  return <CamilleChat />;
}
