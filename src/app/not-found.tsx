import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <Image src="/logo.png" alt="InstantMariage" width={48} height={48} style={{ mixBlendMode: "multiply" }} />
        <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>
          <span style={{ color: "#F06292" }}>Instant</span>
          <span className="text-gray-900">Mariage.fr</span>
        </span>
      </Link>

      {/* Illustration */}
      <div
        className="text-8xl mb-6 select-none"
        aria-hidden="true"
      >
        💍
      </div>

      {/* Texts */}
      <h1
        className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Oups, cette page n&apos;existe pas
      </h1>
      <p className="text-gray-500 text-lg text-center max-w-md mb-10">
        Mais vous pouvez trouver les meilleurs prestataires mariage ici&nbsp;!
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/annuaire"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
          style={{ backgroundColor: "#F06292" }}
        >
          Parcourir l&apos;annuaire →
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border-2 border-rose-300 text-rose-500 hover:bg-rose-50 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>

      {/* Error code */}
      <p className="mt-14 text-gray-300 text-sm tracking-widest font-mono">404</p>
    </main>
  );
}
