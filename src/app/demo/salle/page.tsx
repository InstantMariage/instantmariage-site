'use client'

import { useEffect, useRef, useState } from 'react'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
})

const BASE = 'https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/salle'

const img = (name: string) => `${BASE}/${name}`

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const ESPACES = [
  {
    name: 'La Grande Salle',
    img: img('salle-1.jpg'),
    desc: 'Jusqu\'à 400 invités, scène et piste de danse',
    prix: 'À partir de 8 000€',
  },
  {
    name: 'Le Jardin d\'Hiver',
    img: img('salle-2.jpg'),
    desc: 'Salle lumineuse et végétale, jusqu\'à 200 invités',
    prix: 'À partir de 5 500€',
  },
  {
    name: 'L\'Orangerie',
    img: img('exterieur.jpg'),
    desc: 'Espace en plein air avec vue panoramique',
    prix: 'À partir de 4 000€',
  },
]

const GALERIE_1 = [
  img('ambiance-1.jpg'),
  img('ambiance-2.jpg'),
  img('ambiance-3.jpg'),
  img('ceremonie.jpg'),
  img('table-1.jpg'),
  img('table-2.jpg'),
]

const GALERIE_2 = [
  img('soiree-2.jpg'),
  img('detail-1.jpg'),
  img('detail-2.jpg'),
  img('gateau.jpg'),
]

const SERVICES = [
  { icon: '🍽️', titre: 'Traiteur partenaire', texte: 'Cuisine gastronomique sur mesure' },
  { icon: '🌸', titre: 'Décoration', texte: 'Équipe de décorateurs dédiée' },
  { icon: '🎵', titre: 'Sonorisation', texte: 'Système audio et éclairage professionnel' },
  { icon: '🅿️', titre: 'Parking', texte: '200 places gratuites pour vos invités' },
]

const TEMOIGNAGES = [
  { texte: 'Un lieu magique. Notre mariage était exactement comme dans nos rêves.', auteur: 'Laura & Antoine', date: 'mai 2025' },
  { texte: 'Le personnel est aux petits soins. Tout était parfait du début à la fin.', auteur: 'Camille & Pierre', date: 'septembre 2025' },
  { texte: 'La salle était magnifiquement décorée. Nos invités en parlent encore !', auteur: 'Sophie & Marc', date: 'mars 2026' },
]

export default function SallePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredEspace, setHoveredEspace] = useState<number | null>(null)
  const [hoveredGalerie, setHoveredGalerie] = useState<number | null>(null)
  const [hoveredGalerie2, setHoveredGalerie2] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', date: '',
    invites: '', espace: '', message: '',
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`${cormorant.variable} ${dmSans.variable}`} style={{ fontFamily: 'var(--font-dm-sans)', color: '#1A1A1A', background: '#FAFAFA' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(250,250,250,0.92)' : 'rgba(250,250,250,0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <span
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 18,
              letterSpacing: '0.18em',
              fontWeight: 500,
              color: '#1A1A1A',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
            onClick={() => scrollTo('hero')}
          >
            DOMAINE DES LUMIÈRES
          </span>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }} className="nav-desktop">
            {[
              { label: 'Le Domaine', id: 'stats' },
              { label: 'Espaces', id: 'espaces' },
              { label: 'Galerie', id: 'galerie' },
              { label: 'Contact', id: 'contact' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', fontSize: 13, letterSpacing: '0.08em',
                  color: '#1A1A1A', fontWeight: 400, padding: '4px 0',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              style={{
                background: 'none', border: '1px solid #1A1A1A', cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.12em',
                color: '#1A1A1A', padding: '10px 24px', textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1A1A1A'; e.currentTarget.style.color = '#FAFAFA' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#1A1A1A' }}
            >
              Demander un devis
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            <div style={{ width: 24, height: 1, background: '#1A1A1A', marginBottom: 6 }} />
            <div style={{ width: 24, height: 1, background: '#1A1A1A', marginBottom: 6 }} />
            <div style={{ width: 16, height: 1, background: '#1A1A1A' }} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#FAFAFA', borderTop: '1px solid rgba(201,168,76,0.2)', padding: '20px 32px 24px' }}>
            {[
              { label: 'Le Domaine', id: 'stats' },
              { label: 'Espaces', id: 'espaces' },
              { label: 'Galerie', id: 'galerie' },
              { label: 'Contact', id: 'contact' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)', fontSize: 15,
                  color: '#1A1A1A', padding: '12px 0',
                  borderBottom: '1px solid rgba(201,168,76,0.15)',
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              style={{
                marginTop: 16, width: '100%', background: '#1A1A1A', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.12em',
                color: '#FAFAFA', padding: '14px 24px', textTransform: 'uppercase',
              }}
            >
              Demander un devis
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        style={{
          position: 'relative', height: '100vh', minHeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        <img
          src={img('soiree-1.jpg')}
          alt="Domaine des Lumières"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.45)' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(52px, 8vw, 88px)',
            fontStyle: 'italic', fontWeight: 300, color: '#FAFAFA',
            lineHeight: 1.1, marginBottom: 24, letterSpacing: '0.01em',
          }}>
            Votre mariage de rêve<br />dans un écrin d'exception
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(13px, 1.8vw, 15px)',
            color: 'rgba(250,250,250,0.82)', letterSpacing: '0.12em', marginBottom: 48,
            textTransform: 'uppercase',
          }}>
            Salle de réception haut de gamme — jusqu'à 400 invités — Île-de-France
          </p>
          <button
            onClick={() => scrollTo('espaces')}
            style={{
              background: 'none', border: '1px solid #FAFAFA', cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.16em',
              color: '#FAFAFA', padding: '16px 40px', textTransform: 'uppercase',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.color = '#1A1A1A' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#FAFAFA' }}
          >
            Découvrir le domaine
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 1, height: 56, background: '#C9A84C', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── CHIFFRES ── */}
      <section id="stats" style={{ background: '#FAFAFA', padding: '80px 24px' }}>
        <FadeIn>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
            gap: 0, maxWidth: 1000, margin: '0 auto',
          }}>
            {[
              { val: '15 ans', label: "d'expérience" },
              { val: '400', label: 'invités max' },
              { val: '5', label: 'espaces' },
              { val: '200+', label: 'mariages' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '20px 48px' }}>
                  <div style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 5vw, 56px)',
                    color: '#C9A84C', fontWeight: 400, lineHeight: 1,
                  }}>
                    {stat.val}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 11, letterSpacing: '0.14em',
                    color: '#888', textTransform: 'uppercase', marginTop: 8,
                  }}>
                    {stat.label}
                  </div>
                </div>
                {i < 3 && (
                  <div style={{ width: 1, height: 64, background: 'rgba(201,168,76,0.35)', flexShrink: 0 }} className="stat-divider" />
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── NOS ESPACES ── */}
      <section id="espaces" style={{ background: '#F5EDD8', padding: '100px 24px' }}>
        <FadeIn>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(42px, 6vw, 64px)',
            fontWeight: 400, textAlign: 'center', color: '#1A1A1A',
            marginBottom: 16, letterSpacing: '0.02em',
          }}>
            Nos espaces
          </h2>
          <div style={{
            width: 48, height: 1, background: '#C9A84C', margin: '0 auto 64px',
          }} />
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32, maxWidth: 1200, margin: '0 auto',
        }}>
          {ESPACES.map((espace, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div
                style={{
                  background: '#FAFAFA', overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: hoveredEspace === i ? '0 20px 60px rgba(26,26,26,0.12)' : '0 4px 20px rgba(26,26,26,0.06)',
                  transition: 'box-shadow 0.4s ease',
                }}
                onMouseEnter={() => setHoveredEspace(i)}
                onMouseLeave={() => setHoveredEspace(null)}
              >
                <div style={{ overflow: 'hidden', height: 280 }}>
                  <img
                    src={espace.img}
                    alt={espace.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transform: hoveredEspace === i ? 'scale(1.06)' : 'scale(1)',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                </div>
                <div style={{ padding: '32px 28px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: 28, fontWeight: 400,
                    color: '#1A1A1A', marginBottom: 12, letterSpacing: '0.02em',
                  }}>
                    {espace.name}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#666',
                    lineHeight: 1.7, marginBottom: 20,
                  }}>
                    {espace.desc}
                  </p>
                  <div style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: 22, color: '#C9A84C',
                    fontWeight: 500,
                  }}>
                    {espace.prix}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── GALERIE 1 ── */}
      <section id="galerie" style={{ background: '#1A1A1A', padding: '4px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
        }}>
          {GALERIE_1.map((src, i) => (
            <div
              key={i}
              style={{ overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredGalerie(i)}
              onMouseLeave={() => setHoveredGalerie(null)}
            >
              <img
                src={src}
                alt={`Galerie ${i + 1}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: hoveredGalerie === i ? 'brightness(1.12)' : 'brightness(0.88)',
                  transform: hoveredGalerie === i ? 'scale(1.04)' : 'scale(1)',
                  transition: 'filter 0.4s ease, transform 0.6s ease',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ background: '#FAFAFA', padding: '100px 24px' }}>
        <FadeIn>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(38px, 5vw, 56px)',
            fontWeight: 400, textAlign: 'center', color: '#1A1A1A',
            marginBottom: 16,
          }}>
            Tout est inclus
          </h2>
          <div style={{ width: 48, height: 1, background: '#C9A84C', margin: '0 auto 64px' }} />
        </FadeIn>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40, maxWidth: 1100, margin: '0 auto',
        }}>
          {SERVICES.map((s, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div style={{ textAlign: 'center', padding: '8px 16px' }}>
                <div style={{ fontSize: 36, marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 400,
                  color: '#1A1A1A', marginBottom: 12, letterSpacing: '0.02em',
                }}>
                  {s.titre}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#888',
                  lineHeight: 1.7,
                }}>
                  {s.texte}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── GALERIE AMBIANCE ── */}
      <section style={{ background: '#1A1A1A', display: 'flex', gap: 2, height: 'clamp(280px, 35vw, 450px)' }}>
        {GALERIE_2.map((src, i) => (
          <div
            key={i}
            style={{ flex: 1, overflow: 'hidden', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredGalerie2(i)}
            onMouseLeave={() => setHoveredGalerie2(null)}
          >
            <img
              src={src}
              alt={`Ambiance ${i + 1}`}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: hoveredGalerie2 === i ? 'brightness(1.1)' : 'brightness(0.82)',
                transform: hoveredGalerie2 === i ? 'scale(1.04)' : 'scale(1)',
                transition: 'filter 0.4s ease, transform 0.6s ease',
              }}
            />
          </div>
        ))}
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{ background: '#F5EDD8', padding: '100px 24px' }}>
        <FadeIn>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(38px, 5vw, 52px)',
            fontWeight: 400, textAlign: 'center', color: '#1A1A1A', marginBottom: 16,
          }}>
            Ils nous ont fait confiance
          </h2>
          <div style={{ width: 48, height: 1, background: '#C9A84C', margin: '0 auto 64px' }} />
        </FadeIn>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 28, maxWidth: 1100, margin: '0 auto',
        }}>
          {TEMOIGNAGES.map((t, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div style={{
                background: '#FAFAFA',
                border: '1px solid rgba(201,168,76,0.25)',
                padding: '40px 36px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 20, color: '#C9A84C',
                  marginBottom: 20, letterSpacing: '0.04em',
                }}>
                  ❝
                </div>
                <p style={{
                  fontFamily: 'var(--font-cormorant)', fontSize: 20, fontStyle: 'italic',
                  color: '#1A1A1A', lineHeight: 1.7, marginBottom: 28,
                }}>
                  {t.texte}
                </p>
                <div style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.1em',
                  color: '#C9A84C', textTransform: 'uppercase',
                }}>
                  {t.auteur} — {t.date}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CONTACT / DEVIS ── */}
      <section id="contact" style={{ background: '#1A1A1A', padding: '100px 24px 120px' }}>
        <FadeIn>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(44px, 6vw, 72px)',
            fontWeight: 400, textAlign: 'center', color: '#C9A84C', marginBottom: 16,
            letterSpacing: '0.02em',
          }}>
            Réservez votre date
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 14, textAlign: 'center',
            color: 'rgba(250,250,250,0.7)', letterSpacing: '0.06em', marginBottom: 64,
          }}>
            Les dates se réservent rapidement — contactez-nous dès maintenant
          </p>
        </FadeIn>

        <form
          onSubmit={e => e.preventDefault()}
          style={{ maxWidth: 680, margin: '0 auto' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }} className="form-grid">
            {[
              { label: 'Prénom & Nom', key: 'nom', type: 'text', col: 2 },
              { label: 'Email', key: 'email', type: 'email', col: 1 },
              { label: 'Téléphone', key: 'telephone', type: 'tel', col: 1 },
              { label: 'Date souhaitée', key: 'date', type: 'date', col: 1 },
              { label: "Nombre d'invités", key: 'invites', type: 'number', col: 1 },
            ].map(({ label, key, type, col }) => (
              <div key={key} style={{ gridColumn: `span ${col}`, marginBottom: 36 }}>
                <label style={{
                  display: 'block', fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                  letterSpacing: '0.16em', color: 'rgba(250,250,250,0.5)',
                  textTransform: 'uppercase', marginBottom: 10,
                }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={formData[key as keyof typeof formData]}
                  onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    borderBottom: '1px solid rgba(201,168,76,0.5)',
                    color: '#FAFAFA', fontFamily: 'var(--font-dm-sans)', fontSize: 15,
                    padding: '8px 0', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.3s',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => (e.target.style.borderBottomColor = '#C9A84C')}
                  onBlur={e => (e.target.style.borderBottomColor = 'rgba(201,168,76,0.5)')}
                />
              </div>
            ))}

            {/* Select espace */}
            <div style={{ gridColumn: 'span 2', marginBottom: 36 }}>
              <label style={{
                display: 'block', fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                letterSpacing: '0.16em', color: 'rgba(250,250,250,0.5)',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                Espace souhaité
              </label>
              <select
                value={formData.espace}
                onChange={e => setFormData(p => ({ ...p, espace: e.target.value }))}
                style={{
                  width: '100%', background: '#1A1A1A', border: 'none',
                  borderBottom: '1px solid rgba(201,168,76,0.5)',
                  color: formData.espace ? '#FAFAFA' : 'rgba(250,250,250,0.4)',
                  fontFamily: 'var(--font-dm-sans)', fontSize: 15,
                  padding: '8px 0', outline: 'none', boxSizing: 'border-box',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A84C')}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(201,168,76,0.5)')}
              >
                <option value="" disabled>Choisir un espace</option>
                <option value="grande-salle">La Grande Salle</option>
                <option value="jardin-hiver">Le Jardin d'Hiver</option>
                <option value="orangerie">L'Orangerie</option>
              </select>
            </div>

            {/* Message */}
            <div style={{ gridColumn: 'span 2', marginBottom: 48 }}>
              <label style={{
                display: 'block', fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                letterSpacing: '0.16em', color: 'rgba(250,250,250,0.5)',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                Message
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  borderBottom: '1px solid rgba(201,168,76,0.5)',
                  color: '#FAFAFA', fontFamily: 'var(--font-dm-sans)', fontSize: 15,
                  padding: '8px 0', outline: 'none', resize: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.3s',
                }}
                onFocus={e => (e.target.style.borderBottomColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderBottomColor = 'rgba(201,168,76,0.5)')}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                background: '#C9A84C', border: 'none', borderRadius: 0,
                cursor: 'pointer', fontFamily: 'var(--font-dm-sans)',
                fontSize: 12, letterSpacing: '0.18em', color: '#1A1A1A',
                padding: '18px 64px', textTransform: 'uppercase', fontWeight: 500,
                transition: 'opacity 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Envoyer ma demande
            </button>
          </div>
        </form>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#050505', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-cormorant)', fontSize: 20, letterSpacing: '0.2em',
          color: '#C9A84C', fontWeight: 400, marginBottom: 16, textTransform: 'uppercase',
        }}>
          DOMAINE DES LUMIÈRES
        </div>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.1em',
          color: 'rgba(250,250,250,0.4)', marginBottom: 28, textTransform: 'uppercase',
        }}>
          Île-de-France • Accueil sur rendez-vous
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40 }}>
          {['Instagram', 'Pinterest', 'Facebook'].map(r => (
            <span
              key={r}
              style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: 11, letterSpacing: '0.14em',
                color: 'rgba(250,250,250,0.45)', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,250,0.45)')}
            >
              {r}
            </span>
          ))}
        </div>
        <div style={{
          width: 48, height: 1, background: 'rgba(201,168,76,0.25)', margin: '0 auto 28px',
        }} />
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'rgba(250,250,250,0.2)',
          letterSpacing: '0.06em',
        }}>
          © 2026 Domaine des Lumières — Site réalisé par InstantMariage.fr
        </p>
      </footer>

      <style>{`
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .form-grid > div { grid-column: span 1 !important; }
          .stat-divider { display: none; }
        }
        @media (min-width: 769px) {
          .nav-mobile { display: none !important; }
        }
        @media (max-width: 600px) {
          section[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
        }
        select option {
          background: #1A1A1A;
          color: #FAFAFA;
        }
      `}</style>
    </div>
  )
}
