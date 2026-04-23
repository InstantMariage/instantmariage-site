"use client";
import { useEffect } from "react";

export default function ScrollRestorer() {
  useEffect(() => {
    const saved = sessionStorage.getItem("annuaire-scroll-position");
    if (saved) {
      sessionStorage.removeItem("annuaire-scroll-position");
      window.scrollTo(0, parseInt(saved, 10));
    }
  }, []);
  return null;
}
