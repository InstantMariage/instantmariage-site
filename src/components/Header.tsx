"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const prestataires = [
  { label: "Photographe", icon: "📷", href: "#photographes" },
  { label: "Vidéaste", icon: "🎥", href: "#videaste" },
  { label: "DJ & Musicien", icon: "🎵", href: "#dj" },
  { label: "Traiteur", icon: "🍽️", href: "#traiteur" },
  { label: "Fleuriste", icon: "💐", href: "#fleuriste" },
  { label: "Décorateur", icon: "✨", href: "#decorateur" },
  { label: "Coiffure & Makeup", icon: "💄", href: "#beaute" },
  { label: "Lieu de réception", icon: "🏛️", href: "#lieux" },
  { label: "Officiant", icon: "💍", href: "#officiant" },
  { label: "Wedding Planner", icon: "📋", href: "#wedding-planner" },
  { label: "Animation enfants", icon: "🎈", href: "#animation" },
  { label: "Transport", icon: "🚗", href: "#transport" },
];

const outils = [
  {
    label: "Liste d'invités",
    icon: "👥",
    href: "#invites",
    desc: "Gérez vos invitations",
  },
  {
    label: "Plan de table",
    icon: "🪑",
    href: "#plan-table",
    desc: "Organisez vos tables",
  },
  {
    label: "Rétroplanning",
    icon: "📅",
    href: "#retroplanning",
    desc: "Planifiez chaque étape",
  },
  {
    label: "Budget mariage",
    icon: "💰",
    href: "#budget",
    desc: "Suivez vos dépenses",
  },
  {
    label: "Checklist",
    icon: "✅",
    href: "#checklist",
    desc: "Ne rien oublier",
  },
];

type DropdownKey = "prestataires" | "outils" | null;

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<DropdownKey>(null);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async (uid: string) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("destinataire_id", uid)
      .eq("lu", false);
    setUnreadCount(count ?? 0);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email ?? "",
          role: session.user.user_metadata?.role ?? "marie",
        };
        setUser(u);
        loadUnreadCount(u.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = {
          id: session.user.id,
          email: session.user.email ?? "",
          role: session.user.user_metadata?.role ?? "marie",
        };
        setUser(u);
        loadUnreadCount(u.id);
      } else {
        setUser(null);
        setUnreadCount(0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Realtime : badge non-lu
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("header-unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => loadUnreadCount(user.id)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const openDropdown = (key: DropdownKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  };

  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const toggleMobileExpanded = (key: DropdownKey) => {
    setMobileExpanded((prev) => (prev === key ? null : key));
  };

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
              <span style={{ color: "#F06292" }} className="instant-label">Instant</span>
              <span className="text-gray-900">Mariage.fr</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 ml-16">

            {/* Trouver un prestataire */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("prestataires")}
              onMouseLeave={closeDropdown}
            >
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
              >
                Trouver un prestataire
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "prestataires" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
              </button>

              {/* Dropdown prestataires */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${
                  activeDropdown === "prestataires"
                    ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                }`}
                onMouseEnter={() => openDropdown("prestataires")}
                onMouseLeave={closeDropdown}
              >
                <div className="px-5 pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Catégories de prestataires
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-px px-4 pb-4">
                  {prestataires.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 group/item transition-colors duration-150"
                    >
                      <span className="text-lg leading-none">{item.icon}</span>
                      <span className="text-sm text-gray-700 group-hover/item:text-rose-500 font-medium transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/60">
                  <Link
                    href="#prestataires"
                    className="text-xs text-rose-500 font-semibold hover:text-rose-600 transition-colors flex items-center gap-1"
                  >
                    Voir tous les prestataires
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Outils mariés */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("outils")}
              onMouseLeave={closeDropdown}
            >
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
              >
                Outils mariés
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "outils" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
              </button>

              {/* Dropdown outils */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${
                  activeDropdown === "outils"
                    ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
                }`}
                onMouseEnter={() => openDropdown("outils")}
                onMouseLeave={closeDropdown}
              >
                <div className="px-5 pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Vos outils de mariage
                  </p>
                </div>
                <div className="px-3 pb-3 space-y-0.5">
                  {outils.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-50 group/item transition-colors duration-150"
                    >
                      <span className="text-xl leading-none">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 group-hover/item:text-rose-500 transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Autres liens simples */}
            <Link
              href="/annuaire"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
            >
              Annuaire
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </Link>
            <Link
              href="/tarifs"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
            >
              Tarifs
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
            >
              Blog
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </Link>
            <Link
              href="/inspiration"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
            >
              Inspiration
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </Link>
            <Link
              href="/a-propos"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
            >
              À propos
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors duration-200 relative group py-2"
            >
              Contact
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rose-400 group-hover:w-full transition-all duration-200" />
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Icône messages avec badge */}
                <Link
                  href="/messages"
                  className="relative p-2 rounded-full hover:bg-rose-50 text-gray-500 hover:text-rose-400 transition-colors"
                  title="Messages"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "#F06292" }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/dashboard/${user.role}`}
                  className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors px-4 py-2"
                >
                  Mon espace
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white transition-all duration-200"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-rose-500 text-sm font-medium transition-colors px-4 py-2"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Inscription gratuite
                </Link>
              </>
            )}
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

            {/* Trouver un prestataire (mobile) */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
                onClick={() => toggleMobileExpanded("prestataires")}
              >
                Trouver un prestataire
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === "prestataires" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpanded === "prestataires" && (
                <div className="mt-1 ml-4 grid grid-cols-2 gap-1 pb-2">
                  {prestataires.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Outils mariés (mobile) */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
                onClick={() => toggleMobileExpanded("outils")}
              >
                Outils mariés
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === "outils" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpanded === "outils" && (
                <div className="mt-1 ml-4 space-y-0.5 pb-2">
                  {outils.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{item.icon}</span>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/annuaire"
              className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Annuaire
            </Link>
            <Link
              href="/tarifs"
              className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Tarifs
            </Link>
            <Link
              href="/blog"
              className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/inspiration"
              className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Inspiration
            </Link>
            <Link
              href="/a-propos"
              className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-3 text-gray-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-3 px-4 flex flex-col gap-2 border-t border-rose-100">
              {user ? (
                <>
                  <Link
                    href="/messages"
                    className="flex items-center justify-between border-2 border-rose-100 text-gray-700 hover:border-rose-300 font-medium px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span
                        className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        style={{ background: "#F06292" }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={`/dashboard/${user.role}`}
                    className="text-center border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Mon espace
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="text-center bg-rose-400 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-center border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="text-center bg-rose-400 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Inscription gratuite
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
