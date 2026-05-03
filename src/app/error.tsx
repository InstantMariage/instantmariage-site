"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <Image
          src="/logo.png"
          alt="InstantMariage"
          width={160}
          height={48}
          className="mb-2"
        />

        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FFF0F5" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F06292"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oups, une erreur est survenue
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Nous travaillons à résoudre ce problème. Revenez dans quelques
            instants.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F06292" }}
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="flex-1 px-5 py-2.5 rounded-full text-sm font-medium text-center border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#F06292", color: "#F06292" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
