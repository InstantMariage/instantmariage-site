"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Trouver un prestataire", href: "#prestaires" },
    { label: "Outils mariés", href: "#outils" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Blog", href: "#blog" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div style={{ mixBlendMode: "multiply" }} className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="InstantMariage logo"
                width={40}
                height={40}
              />
            </div>
            <span
              className="text-xl md:text-2xl font-bold whitespace-nowrap"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <span style={{ color: "#F06292" }}>Instant</span><span className="text-gray-900">Mariage.fr</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              href="#"
              className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Inscription gratuite
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-rose-500 hover:bg-rose-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-rose-100 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 px-4 flex flex-col gap-2 border-t border-rose-100">
              <Link
                href="#"
                className="text-center border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
              >
                Connexion
              </Link>
              <Link
                href="#"
                className="text-center bg-rose-400 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
              >
                Inscription gratuite
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
