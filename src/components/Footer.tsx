import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/components/NewsletterForm";
import { CookieReopenButton } from "@/components/CookieBanner";
import { CATEGORIES } from "@/data/categories";

const footerLinks = {
  mariees: {
    title: "Espace mariés",
    links: [
      { label: "Liste des invités", href: "https://tableau-de-bord-mariage.vercel.app" },
      { label: "Plan de table", href: "https://tableau-de-bord-mariage.vercel.app" },
      { label: "Rétroplanning", href: "/dashboard/marie/retroplanning" },
      { label: "Budget mariage", href: "/dashboard/marie/budget" },
      { label: "Checklist mariage", href: "/dashboard/marie/checklist" },
      { label: "Guide mariage", href: "/blog" },
    ],
  },
  societe: {
    title: "InstantMariage.fr",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Comment ça marche", href: "/#comment-ca-marche" },
      { label: "Tarifs prestataires", href: "/tarifs" },
      { label: "Blog & Inspirations", href: "/blog" },
    ],
  },
  aide: {
    title: "Aide & Contact",
    links: [
      { label: "FAQ – Questions fréquentes", href: "/faq" },
      { label: "Centre d'aide", href: "/contact" },
      { label: "Contacter le support", href: "/contact" },
      { label: "Signaler un problème", href: "/contact" },
      { label: "Devenir partenaire", href: "/contact" },
    ],
  },
};

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer>
      {/* Newsletter banner — style inchangé */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Inspirations &amp; conseils mariage ✉️
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Recevez chaque semaine nos meilleures idées et bons plans mariage
              </p>
            </div>
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </div>

      {/* Main footer — fond blanc, texte noir */}
      <div className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-5">
                <Image
                  src="/logo.png"
                  alt="InstantMariage"
                  width={40}
                  height={40}
                  style={{ mixBlendMode: "multiply" }}
                />
                <span
                  className="text-xl font-bold whitespace-nowrap"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  <span style={{ color: "#F06292" }}>Instant</span>
                  <span className="text-gray-900">Mariage.fr</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
                La plateforme de référence pour trouver vos prestataires mariage
                et organiser votre grand jour en toute sérénité.
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span>🔒</span> Paiements sécurisés
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span>🇫🇷</span> 100% Français
                </span>
              </div>
            </div>

            {/* Prestataires — 2 columns, driven by CATEGORIES */}
            <div className="lg:col-span-2">
              <h4 className="text-gray-900 font-semibold text-sm mb-4 tracking-wide">
                Prestataires
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      href={`/annuaire?metier=${cat.name}`}
                      className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other link columns */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key}>
                <h4 className="text-gray-900 font-semibold text-sm mb-4 tracking-wide">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 InstantMariage.fr · Tous droits réservés
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "Politique de confidentialité", href: "/confidentialite" },
                { label: "CGU", href: "/cgu" },
                  { label: "Accessibilité", href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-700 text-xs transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <CookieReopenButton className="text-gray-400 hover:text-gray-700 text-xs transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
