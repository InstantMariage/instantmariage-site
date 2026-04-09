"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function VendorBanner() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-16 sm:py-16 text-white text-center shadow-xl"
          style={{
            background: "linear-gradient(135deg, #F06292 0%, #e91e8c 50%, #c2185b 100%)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.98)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
            aria-hidden="true"
          />

          {/* Sparkle icon */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" aria-hidden="true">
                <path
                  d="M12 2l1.8 5.4L19 9l-5.2 3.6L15.6 18 12 14.8 8.4 18l1.8-5.4L5 9l5.2-1.6L12 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="currentColor"
                  fillOpacity="0.3"
                />
              </svg>
            </span>
          </div>

          <p className="text-white/80 text-sm font-semibold tracking-widest uppercase mb-3">
            Prestataires
          </p>

          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Vous êtes prestataire&nbsp;?
          </h2>

          <p className="text-white/90 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Rejoignez InstantMariage et trouvez de nouveaux clients pour votre activité mariage.
          </p>

          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 bg-white text-pink-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
          >
            Rejoindre gratuitement
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
