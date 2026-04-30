'use client'

/**
 * Template Luxe Noir — InstantMariage.fr
 * Philosophie : minimalisme Apple, typographie massive, animations scroll fluides
 * Sections : Navbar · Hero · Signature · Galerie · About · Services · Témoignages · Contact · Footer
 */

import { useEffect, useRef, useState } from 'react'
import { Playfair_Display, Inter } from 'next/font/google'
import Image from 'next/image'

/* ─── Fonts ─────────────────────────────────────────────────────────────── */

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/* ─── Hook : Intersection Observer ──────────────────────────────────────── */

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

/* ─── Composant révélation générique ────────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Données statiques — à remplacer par les vraies infos client ─────── */

const PHOTOS = {
  hero:    'https://picsum.photos/seed/mariage-hero/1800/1200',
  gallery: [
    'https://picsum.photos/seed/mg-01/800/1000',
    'https://picsum.photos/seed/mg-02/800/1000',
    'https://picsum.photos/seed/mg-03/800/1000',
  ],
  about:   'https://picsum.photos/seed/sophie-portrait/800/1000',
}

const SERVICES = [
  {
    num: '01',
    title: 'Reportage Complet',
    desc: "De la préparation jusqu’au dîner — chaque instant précieux capturé dans sa vérité.",
    price: 'À partir de 2 500 €',
  },
  {
    num: '02',
    title: 'Formule Cérémonie',
    desc: "L'essentiel : la cérémonie civile ou religieuse et les portraits de couple.",
    price: 'À partir de 1 200 €',
  },
  {
    num: '03',
    title: 'Séance Engagement',
    desc: "Une séance photo avant le mariage pour vous sentir à l'aise devant l'objectif.",
    price: 'À partir de 400 €',
  },
]

const TESTIMONIALS = [
  {
    quote: "« Sophie a saisi une émotion que nous n'avions même pas remarquée sur le moment. Ces photos sont notre plus beau souvenir. »",
    couple: '— Camille & Thomas, Paris 2023',
  },
  {
    quote: '« Un talent rare, une discrétion absolue. Nos photos de mariage nous font pleurer de bonheur à chaque fois. »',
    couple: '— Léa & Antoine, Provence 2024',
  },
]

/* ════════════════════════════════════════════════════════════════════════ */
/*  PAGE PRINCIPALE                                                         */
/* ════════════════════════════════════════════════════════════════════════ */

export default function LuxeNoirTemplate() {
  const [navScrolled, setNavScrolled] = useState(false)

  /* Navbar : devient légèrement opaque au scroll */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`${playfair.variable} ${inter.variable}`} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>

      {/* ── 1. NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          backgroundColor: navScrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(20px)' : 'none',
          transition: 'background-color 0.4s ease',
          borderBottom: navScrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#000',
          }}
        >
          Sophie Martin
        </span>

        {/* Liens */}
        <div style={{ display: 'flex', gap: 32 }}>
          {['Galerie', 'Services', 'À propos', 'Contact'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace('à propos', 'about').replace(' ', '-')}`}
              style={{
                fontSize: 13,
                color: '#666',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#000')}
              onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#666')}
            >
              {link}
            </a>
          ))}
        </div>
      </nav>

      {/* ── 2. HERO — fond NOIR ───────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          minHeight: 600,
          backgroundColor: '#000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 80,
        }}
      >
        {/* Photo plein écran */}
        <Image
          src={PHOTOS.hero}
          alt="Mariage — photographie d'ambiance"
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.65 }}
          sizes="100vw"
        />

        {/* Texte hero */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
            }}
          >
            La photographie qui<br />raconte votre histoire
          </h1>
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: 0,
              fontWeight: 300,
            }}
          >
            Photographe de mariage — Paris &amp; France entière
          </p>
        </div>

        {/* Scroll indicator — ligne animée */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Défiler
          </span>
          <div style={{ position: 'relative', width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '40%',
                backgroundColor: '#fff',
                animation: 'scrollLine 1.8s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── 3. SECTION SIGNATURE — fond BLANC ────────────────────────────── */}
      <section
        id="signature"
        style={{
          backgroundColor: '#fff',
          padding: 'clamp(80px, 12vw, 160px) 24px',
          textAlign: 'center',
        }}
      >
        <Reveal>
          <blockquote
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(28px, 5vw, 64px)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#000',
              lineHeight: 1.25,
              margin: '0 auto',
              maxWidth: 900,
            }}
          >
            "Chaque mariage est unique.<br />Chaque photo l'est aussi."
          </blockquote>
        </Reveal>
      </section>

      {/* ── 4. GALERIE — fond NOIR ────────────────────────────────────────── */}
      <section
        id="galerie"
        style={{ backgroundColor: '#000', padding: '0 0 80px' }}
      >
        {/* 3 photos côte à côte */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
          }}
        >
          {PHOTOS.gallery.map((src, i) => (
            <Reveal key={src} delay={i * 120}>
              <div
                style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', cursor: 'pointer' }}
                onMouseEnter={(e) => ((e.currentTarget.querySelector('img') as HTMLImageElement).style.opacity = '1')}
                onMouseLeave={(e) => ((e.currentTarget.querySelector('img') as HTMLImageElement).style.opacity = '0.8')}
              >
                <Image
                  src={src}
                  alt={`Mariage photo ${i + 1}`}
                  fill
                  style={{ objectFit: 'cover', opacity: 0.8, transition: 'opacity 0.4s ease' }}
                  sizes="33vw"
                />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Compteur */}
        <Reveal>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: 48,
              fontWeight: 300,
            }}
          >
            300+ mariages capturés
          </p>
        </Reveal>
      </section>

      {/* ── 5. ABOUT — fond BLANC ─────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          backgroundColor: '#fff',
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {/* Photo portrait */}
          <Reveal>
            <div style={{ position: 'relative', aspectRatio: '4/5', maxHeight: 600 }}>
              <Image
                src={PHOTOS.about}
                alt="Sophie Martin, photographe de mariage"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          </Reveal>

          {/* Texte */}
          <Reveal delay={150}>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: 'clamp(40px, 5vw, 72px)',
                  fontWeight: 700,
                  color: '#000',
                  margin: '0 0 8px',
                  lineHeight: 1.05,
                }}
              >
                Sophie Martin
              </h2>
              <p
                style={{
                  fontSize: 14,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#999',
                  margin: '0 0 40px',
                  fontWeight: 400,
                }}
              >
                Photographe depuis 12 ans
              </p>
              <p
                style={{
                  fontSize: 'clamp(15px, 1.5vw, 17px)',
                  lineHeight: 1.8,
                  color: '#444',
                  margin: '0 0 48px',
                  maxWidth: 480,
                }}
              >
                Je crois que les plus belles photos de mariage ne se décrètent pas — elles se découvrent.
                Mon rôle est de disparaître, d'observer, d'être là au bon moment. Chaque couple mérite
                des images qui lui ressemblent vraiment.
              </p>

              {/* Chiffres clés */}
              <div
                style={{
                  display: 'flex',
                  gap: 0,
                  flexWrap: 'wrap',
                }}
              >
                {['300+ mariages', '12 ans', '5 pays'].map((stat, i, arr) => (
                  <div key={stat} style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#000',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {stat}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ color: '#ccc', margin: '0 16px', fontSize: 16 }}>·</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6. SERVICES — fond NOIR ───────────────────────────────────────── */}
      <section
        id="services"
        style={{
          backgroundColor: '#000',
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px)',
        }}
      >
        <Reveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              margin: '0 0 64px',
              maxWidth: 1200,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Formules
          </p>
        </Reveal>

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {SERVICES.map((service, i) => (
            <ServiceItem key={service.num} service={service} delay={i * 80} isLast={i === SERVICES.length - 1} />
          ))}
        </div>
      </section>

      {/* ── 7. TÉMOIGNAGES — fond BLANC ───────────────────────────────────── */}
      <section
        id="temoignages"
        style={{
          backgroundColor: '#fff',
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 8vw, 80px)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 72 }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ textAlign: 'center' }}>
                {/* Étoiles minimalistes */}
                <div style={{ marginBottom: 24, letterSpacing: 6, color: '#000', fontSize: 12 }}>
                  ★ ★ ★ ★ ★
                </div>
                <blockquote
                  style={{
                    fontFamily: 'var(--font-playfair), serif',
                    fontSize: 'clamp(20px, 3vw, 28px)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: '#111',
                    lineHeight: 1.5,
                    margin: '0 0 20px',
                  }}
                >
                  {t.quote}
                </blockquote>
                <p
                  style={{
                    fontSize: 13,
                    color: '#999',
                    letterSpacing: '0.1em',
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  {t.couple}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 8. CONTACT — fond NOIR ────────────────────────────────────────── */}
      <section
        id="contact"
        style={{
          backgroundColor: '#000',
          padding: 'clamp(80px, 10vw, 140px) clamp(24px, 8vw, 80px)',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(36px, 6vw, 72px)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.1,
                textAlign: 'center',
                margin: '0 0 64px',
              }}
            >
              Parlons de<br />votre mariage
            </h2>
          </Reveal>

          {/* Formulaire minimaliste */}
          <Reveal delay={100}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {[
                { id: 'nom',    label: 'Vos prénoms',      type: 'text',  placeholder: 'Camille & Thomas' },
                { id: 'date',   label: 'Date du mariage',  type: 'date',  placeholder: '' },
                { id: 'lieu',   label: 'Lieu',             type: 'text',  placeholder: 'Paris, Île-de-France' },
                { id: 'email',  label: 'Email',            type: 'email', placeholder: 'vous@exemple.fr' },
              ].map((field) => (
                <MinimalField key={field.id} {...field} />
              ))}

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 12 }}
                >
                  Votre message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Parlez-moi de votre projet…"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: 16,
                    padding: '8px 0',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}
                />
              </div>

              {/* Bouton carré style Apple */}
              <button
                type="submit"
                style={{
                  marginTop: 16,
                  backgroundColor: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '18px 48px',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 0,
                  alignSelf: 'flex-start',
                  transition: 'background-color 0.2s, color 0.2s',
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget
                  btn.style.backgroundColor = 'rgba(255,255,255,0.85)'
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget
                  btn.style.backgroundColor = '#fff'
                }}
              >
                Envoyer
              </button>
            </form>
          </Reveal>

          {/* Liens réseaux */}
          <Reveal delay={200}>
            <div style={{ display: 'flex', gap: 32, marginTop: 64, justifyContent: 'center' }}>
              {['Instagram', 'Pinterest'].map((network) => (
                <a
                  key={network}
                  href="#"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    fontSize: 13,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#fff')}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)')}
                >
                  {network}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 9. FOOTER — fond NOIR ─────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: '#000',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '24px clamp(24px, 8vw, 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <span style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          Sophie Martin
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Mentions légales', 'Galerie', 'Contact'].map((link) => (
            <a
              key={link}
              href="#"
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em' }}
            >
              {link}
            </a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
          Site réalisé par{' '}
          <a href="https://instantmariage.fr" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            InstantMariage.fr
          </a>
        </span>
      </footer>

      {/* ── Animation CSS globale pour le scroll indicator ─────────────────── */}
      <style>{`
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }

        /* Placeholder couleur dans les champs du formulaire */
        ::placeholder { color: rgba(255,255,255,0.25); }

        /* Scrollbar discrète */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

        /* Focus visible accessible */
        input:focus, textarea:focus {
          outline: none;
          border-bottom-color: rgba(255,255,255,0.6) !important;
        }
      `}</style>
    </div>
  )
}

/* ─── Sous-composant : ligne de service ──────────────────────────────────── */

function ServiceItem({
  service,
  delay,
  isLast,
}: {
  service: { num: string; title: string; desc: string; price: string }
  delay: number
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr auto',
          gap: 'clamp(16px, 4vw, 48px)',
          alignItems: 'start',
          padding: 'clamp(28px, 4vw, 40px) 0',
          borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.08)',
          cursor: 'default',
        }}
      >
        {/* Numéro */}
        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            paddingTop: 6,
            fontWeight: 400,
          }}
        >
          {service.num}
        </span>

        {/* Titre + description */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(22px, 3vw, 36px)',
              fontWeight: 600,
              color: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
              margin: '0 0 10px',
              transition: 'color 0.3s ease',
              lineHeight: 1.2,
            }}
          >
            {service.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 460,
            }}
          >
            {service.desc}
          </p>
        </div>

        {/* Prix */}
        <span
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            whiteSpace: 'nowrap',
            paddingTop: 6,
            textAlign: 'right',
          }}
        >
          {service.price}
        </span>
      </div>
    </Reveal>
  )
}

/* ─── Sous-composant : champ de formulaire minimaliste ──────────────────── */

function MinimalField({
  id,
  label,
  type,
  placeholder,
}: {
  id: string
  label: string
  type: string
  placeholder: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: 11,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          marginBottom: 12,
          fontFamily: 'var(--font-inter), sans-serif',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: 16,
          padding: '8px 0',
          outline: 'none',
          fontFamily: 'var(--font-inter), sans-serif',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
