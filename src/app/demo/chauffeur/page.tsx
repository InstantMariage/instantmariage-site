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

const BASE = 'https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/chauffeur'

const FLEET = [
  { img: `${BASE}/car-1.jpg`, name: 'Mercedes Classe S', tagline: 'Élégance et raffinement' },
  { img: `${BASE}/g63.jpg`, name: 'Mercedes AMG G63', tagline: 'Puissance et prestance' },
  { img: `${BASE}/bentley.jpg`, name: 'Bentley Continental GT', tagline: 'Raffinement britannique' },
  { img: `${BASE}/car-4.jpg`, name: 'Rolls-Royce Silver Cloud', tagline: 'La quintessence du luxe' },
  { img: `${BASE}/car-5.jpg`, name: 'Mercedes Maybach S580', tagline: 'Confort et prestige absolu' },
  { img: `${BASE}/urus.jpg`, name: 'Lamborghini Urus', tagline: 'Pour les mariés audacieux' },
]

const SERVICES = [
  { num: '01', name: 'Transfert Cérémonie', desc: 'Prise en charge domicile → mairie → église', price: 'À partir de 350€' },
  { num: '02', name: 'Journée Complète', desc: 'Disponibilité 8h, décoration florale incluse', price: 'À partir de 890€' },
  { num: '03', name: 'Cortège Nuptial', desc: 'Coordination de plusieurs véhicules', price: 'Sur devis' },
]

const STATS = [
  { icon: '◆', number: '12 ans', label: "D'expérience dans le prestige" },
  { icon: '◈', number: '24 véhicules', label: 'Dans notre flotte' },
  { icon: '◇', number: '500+', label: 'Mariages accompagnés' },
  { icon: '◉', number: '100%', label: 'Ponctualité garantie' },
]

const TESTIMONIALS = [
  { quote: 'Notre chauffeur était impeccable. La Rolls était décorée à la perfection.', couple: 'Marie & Thomas', date: 'Juin 2025' },
  { quote: 'Professionnalisme exemplaire. Nous avons été traités comme des VIP toute la journée.', couple: 'Sophie & Alexandre', date: 'Septembre 2025' },
  { quote: 'Le cortège était magnifique. Tous nos invités ont été impressionnés.', couple: 'Camille & Julien', date: 'Mars 2026' },
]

const VEHICLES = ['Mercedes Classe S', 'Mercedes AMG G63', 'Bentley Continental GT', 'Rolls-Royce Silver Cloud', 'Mercedes Maybach S580', 'Lamborghini Urus']

function FadeSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function ChauffeurPage() {
  const [heroVisible, setHeroVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <div className={`${cormorant.variable} ${dmSans.variable}`} style={{ backgroundColor: '#0A0A0A', color: '#FAFAFA', fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: scrolled ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 40px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <span style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 22,
            letterSpacing: '0.35em',
            color: '#C9A84C',
            fontWeight: 400,
            textTransform: 'uppercase',
          }}>
            PRESTIGE
          </span>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }} className="nav-desktop">
            {['Flotte', 'Services', 'À propos', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace('à propos', 'apropos')}`} style={{
                color: 'rgba(250,250,250,0.8)',
                textDecoration: 'none',
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 400,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,250,0.8)')}
              >
                {link}
              </a>
            ))}
            <a href="#contact" style={{
              border: '1px solid #C9A84C',
              color: '#C9A84C',
              padding: '10px 28px',
              textDecoration: 'none',
              fontSize: 12,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A84C'; e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C9A84C' }}
            >
              Réserver
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }}
            className="nav-burger"
            aria-label="Menu"
          >
            <div style={{ width: 24, height: 2, backgroundColor: '#C9A84C', marginBottom: 5, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <div style={{ width: 24, height: 2, backgroundColor: '#C9A84C', marginBottom: 5, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.3s' }} />
            <div style={{ width: 24, height: 2, backgroundColor: '#C9A84C', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ backgroundColor: 'rgba(10,10,10,0.98)', padding: '24px 40px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
            {['Flotte', 'Services', 'À propos', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{
                display: 'block', color: '#FAFAFA', textDecoration: 'none',
                padding: '14px 0', fontSize: 15, letterSpacing: '0.1em', borderBottom: '1px solid rgba(201,168,76,0.1)',
              }}>
                {link}
              </a>
            ))}
            <a href="#contact" onClick={() => setMenuOpen(false)} style={{
              display: 'block', marginTop: 20, textAlign: 'center',
              border: '1px solid #C9A84C', color: '#C9A84C', padding: '14px',
              textDecoration: 'none', letterSpacing: '0.15em', fontSize: 13, textTransform: 'uppercase',
            }}>
              Réserver
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden', backgroundColor: '#0A0A0A' }}>
        <img
          src={`${BASE}/hero.jpg`}
          alt="Rolls-Royce avec roses"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: heroVisible ? 0.55 : 0,
            transition: 'opacity 1.6s ease',
            filter: 'grayscale(15%)',
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.15) 40%, rgba(10,10,10,0.65) 100%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10,
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '0 24px',
        }}>
          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 1.2s ease 0.4s, transform 1.2s ease 0.4s',
          }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase',
              color: '#C9A84C', marginBottom: 28, fontWeight: 500,
            }}>
              Chauffeur Privé de Luxe
            </p>
            <h1 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(52px, 8vw, 88px)',
              fontWeight: 400, fontStyle: 'italic',
              lineHeight: 1.1, color: '#FAFAFA',
              marginBottom: 24, letterSpacing: '-0.01em',
            }}>
              L&apos;élégance à votre service<br />
              <span style={{ color: '#C9A84C' }}>le jour le plus important</span>
            </h1>
            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 18px)',
              color: 'rgba(250,250,250,0.75)',
              letterSpacing: '0.05em',
              fontWeight: 300,
              maxWidth: 540,
              margin: '0 auto 48px',
            }}>
              Chauffeur privé de luxe pour mariages — Île-de-France
            </p>
            <a href="#flotte" style={{
              border: '1px solid #C9A84C',
              color: '#C9A84C',
              padding: '16px 48px',
              textDecoration: 'none',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A84C'; e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#C9A84C' }}
            >
              Découvrir la flotte
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 1s ease 1.4s',
        }}>
          <span style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase' }}>Défiler</span>
          <div style={{
            width: 1,
            height: 48,
            background: 'linear-gradient(to bottom, #C9A84C, transparent)',
            animation: 'scrollPulse 2s ease-in-out infinite',
          }} />
        </div>
      </section>

      {/* ── FLOTTE ─────────────────────────────────────────────────────── */}
      <section id="flotte" style={{ backgroundColor: '#0A0A0A', padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)' }}>
        <FadeSection>
          <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16, fontWeight: 500 }}>
            Notre Collection
          </p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 400, textAlign: 'center',
            color: '#C9A84C', marginBottom: 72,
            letterSpacing: '-0.01em',
          }}>
            Notre flotte d&apos;exception
          </h2>
        </FadeSection>

        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
          gap: 24,
        }}>
          {FLEET.map((car, i) => (
            <FleetCard key={car.name} car={car} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────────────────────────── */}
      <section id="services" style={{ backgroundColor: '#1A1A1A', padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeSection>
            <p style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16, fontWeight: 500 }}>
              Nos Formules
            </p>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 400, color: '#FAFAFA',
              marginBottom: 64, letterSpacing: '-0.01em',
            }}>
              Des prestations<br />
              <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>sur-mesure</span>
            </h2>
          </FadeSection>

          {SERVICES.map((svc, i) => (
            <FadeSection key={svc.num} delay={i * 120}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 40,
                padding: '40px 0',
                borderBottom: '1px solid rgba(201,168,76,0.2)',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: 13, color: 'rgba(201,168,76,0.5)',
                  letterSpacing: '0.15em', minWidth: 32, paddingTop: 4,
                }}>
                  {svc.num}
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: 28, fontWeight: 500, color: '#FAFAFA',
                    marginBottom: 8, letterSpacing: '0.02em',
                  }}>
                    {svc.name}
                  </h3>
                  <p style={{ color: 'rgba(250,250,250,0.55)', fontSize: 15, lineHeight: 1.6, fontWeight: 300 }}>
                    {svc.desc}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: 20, color: '#C9A84C', fontStyle: 'italic',
                  whiteSpace: 'nowrap', paddingTop: 4,
                }}>
                  {svc.price}
                </span>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── GALERIE AMBIANCE ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0A0A0A', overflow: 'hidden' }}>
        <FadeSection>
          <div style={{ display: 'flex', gap: 2, height: 'clamp(260px, 40vw, 500px)' }}>
            {[`${BASE}/couple-1.jpg`, `${BASE}/car-7.jpg`, `${BASE}/detail.jpg`, `${BASE}/couple-2.jpg`].map((src, i) => (
              <div key={i} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={src}
                  alt=""
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.6s ease, filter 0.4s ease',
                    filter: 'brightness(0.7)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.95)'; (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.7)'; (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
                />
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── POURQUOI NOUS ──────────────────────────────────────────────── */}
      <section id="apropos" style={{ backgroundColor: '#FAFAFA', padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeSection>
            <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16, fontWeight: 500 }}>
              Notre Engagement
            </p>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 400, textAlign: 'center',
              color: '#0A0A0A', marginBottom: 72,
            }}>
              Pourquoi nous choisir
            </h2>
          </FadeSection>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
            gap: 48,
          }}>
            {STATS.map((stat, i) => (
              <FadeSection key={stat.number} delay={i * 100}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, color: '#C9A84C', marginBottom: 16 }}>{stat.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: 'clamp(36px, 4vw, 52px)',
                    fontWeight: 400, color: '#0A0A0A',
                    lineHeight: 1, marginBottom: 12,
                  }}>
                    {stat.number}
                  </div>
                  <div style={{ width: 32, height: 1, backgroundColor: '#C9A84C', margin: '0 auto 16px' }} />
                  <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, fontWeight: 300 }}>
                    {stat.label}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET EXTENDED ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1A1A1A', padding: 'clamp(60px, 8vw, 100px) 0', overflow: 'hidden' }}>
        <FadeSection>
          <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 20, fontWeight: 500 }}>
            Galerie Véhicules
          </p>
        </FadeSection>
        <div style={{ display: 'flex', gap: 3, overflowX: 'auto', padding: '0 clamp(24px, 4vw, 60px)', scrollbarWidth: 'none' }}>
          {[`${BASE}/car-8.jpg`, `${BASE}/car-9.jpg`, `${BASE}/car-10.jpg`, `${BASE}/car-11.jpg`, `${BASE}/car-12.jpg`, `${BASE}/car-13.jpg`].map((src, i) => (
            <div key={i} style={{ flex: '0 0 clamp(260px, 30vw, 380px)', height: 280, overflow: 'hidden', borderRadius: 0 }}>
              <img src={src} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.5s ease, filter 0.4s ease',
                filter: 'brightness(0.75)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; (e.currentTarget as HTMLImageElement).style.filter = 'brightness(1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.75)' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── TÉMOIGNAGES ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#0A0A0A', padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <FadeSection>
            <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16, fontWeight: 500 }}>
              Ils nous ont fait confiance
            </p>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 400, textAlign: 'center',
              color: '#FAFAFA', marginBottom: 72,
            }}>
              Témoignages
            </h2>
          </FadeSection>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: 24,
          }}>
            {TESTIMONIALS.map((t, i) => (
              <FadeSection key={i} delay={i * 120}>
                <div style={{
                  backgroundColor: '#111',
                  border: '1px solid rgba(201,168,76,0.2)',
                  padding: '40px 32px',
                  transition: 'border-color 0.3s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)')}
                >
                  <div style={{ fontSize: 40, color: '#C9A84C', lineHeight: 1, marginBottom: 20, opacity: 0.6, fontFamily: 'Georgia, serif' }}>"</div>
                  <p style={{
                    fontSize: 16, lineHeight: 1.75, color: 'rgba(250,250,250,0.8)',
                    fontStyle: 'italic', marginBottom: 28, fontWeight: 300,
                    fontFamily: 'var(--font-cormorant), serif',
                  }}>
                    {t.quote}
                  </p>
                  <div style={{ width: 24, height: 1, backgroundColor: '#C9A84C', marginBottom: 16 }} />
                  <p style={{ fontSize: 13, color: '#C9A84C', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 500 }}>
                    {t.couple}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)', letterSpacing: '0.05em' }}>
                    {t.date}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / RÉSERVATION ──────────────────────────────────────── */}
      <section id="contact" style={{ backgroundColor: '#0A0A0A', padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <FadeSection>
            <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 16, fontWeight: 500 }}>
              Disponibilités Limitées
            </p>
            <h2 style={{
              fontFamily: 'var(--font-cormorant), serif',
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 400, textAlign: 'center',
              color: '#C9A84C', marginBottom: 16,
              letterSpacing: '-0.01em',
            }}>
              Réservez votre véhicule
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(250,250,250,0.6)', fontSize: 15, marginBottom: 60, fontWeight: 300 }}>
              Disponibilités limitées — contactez-nous rapidement
            </p>
          </FadeSection>

          <FadeSection delay={200}>
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="form-grid">
                <InputField label="Prénom & Nom" type="text" placeholder="Jean Dupont" />
                <InputField label="Email" type="email" placeholder="jean@example.com" />
                <InputField label="Téléphone" type="tel" placeholder="+33 6 00 00 00 00" />
                <InputField label="Date du mariage" type="date" placeholder="" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 12 }}>
                  Véhicule souhaité
                </label>
                <select style={{
                  width: '100%', background: 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(201,168,76,0.4)',
                  color: '#FAFAFA', fontSize: 15, padding: '12px 0',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  transition: 'border-color 0.3s',
                }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A84C')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(201,168,76,0.4)')}
                >
                  <option value="" style={{ backgroundColor: '#111' }}>Choisissez un véhicule</option>
                  {VEHICLES.map(v => <option key={v} value={v} style={{ backgroundColor: '#111' }}>{v}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 12 }}>
                  Message
                </label>
                <textarea
                  placeholder="Décrivez vos besoins, le lieu de la cérémonie, le nombre d'invités..."
                  rows={4}
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(201,168,76,0.4)',
                    color: '#FAFAFA', fontSize: 15, padding: '12px 0',
                    outline: 'none', resize: 'none',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontWeight: 300, lineHeight: 1.6,
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A84C')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(201,168,76,0.4)')}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#C9A84C',
                  color: '#0A0A0A',
                  border: 'none',
                  padding: '20px 64px',
                  fontSize: 12,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: 0,
                  transition: 'all 0.3s ease',
                  alignSelf: 'center',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b8952e'; e.currentTarget.style.letterSpacing = '0.25em' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C9A84C'; e.currentTarget.style.letterSpacing = '0.2em' }}
              >
                Envoyer la demande
              </button>
            </form>
          </FadeSection>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#050505', padding: '64px 40px 40px', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 20, letterSpacing: '0.4em',
            color: '#C9A84C', textTransform: 'uppercase',
            marginBottom: 12, fontWeight: 400,
          }}>
            Prestige Wedding Cars
          </p>
          <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', letterSpacing: '0.15em', marginBottom: 40, textTransform: 'uppercase' }}>
            Île-de-France &nbsp;•&nbsp; Disponible partout en France
          </p>

          {/* Social */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48 }}>
            {['Instagram', 'Facebook', 'WhatsApp'].map(s => (
              <a key={s} href="#" style={{
                color: 'rgba(250,250,250,0.4)',
                textDecoration: 'none', fontSize: 12,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,250,0.4)')}
              >
                {s}
              </a>
            ))}
          </div>

          <div style={{ width: 40, height: 1, backgroundColor: 'rgba(201,168,76,0.3)', margin: '0 auto 32px' }} />

          <p style={{ fontSize: 12, color: 'rgba(250,250,250,0.25)', letterSpacing: '0.08em', lineHeight: 1.8 }}>
            © 2026 Prestige Wedding Cars — Site réalisé par{' '}
            <span style={{ color: 'rgba(201,168,76,0.5)' }}>InstantMariage.fr</span>
          </p>
        </div>
      </footer>

      {/* ── STYLES ─────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.4; transform: scaleY(0.6); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: rgba(250,250,250,0.25); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.3); }
        ::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-burger { display: block !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function FleetCard({ car, delay }: { car: { img: string; name: string; tagline: string }; delay: number }) {
  const { ref, inView } = useInView()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(50px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: '#111',
          border: hovered ? '1px solid rgba(201,168,76,0.65)' : '1px solid rgba(201,168,76,0.18)',
          overflow: 'hidden',
          transition: 'border-color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
      >
        <div style={{ height: 240, overflow: 'hidden' }}>
          <img
            src={car.img}
            alt={car.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s ease, filter 0.4s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              filter: hovered ? 'brightness(0.9)' : 'brightness(0.75)',
            }}
          />
        </div>
        <div style={{ padding: '24px 28px' }}>
          <h3 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontSize: 22, fontWeight: 500,
            color: '#FAFAFA', marginBottom: 6,
            letterSpacing: '0.02em',
          }}>
            {car.name}
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.5)', marginBottom: 20, fontWeight: 300 }}>
            {car.tagline}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 16, color: '#C9A84C', fontStyle: 'italic' }}>
              Sur devis
            </span>
            <span style={{
              fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: hovered ? '#C9A84C' : 'rgba(201,168,76,0.5)',
              transition: 'color 0.3s',
            }}>
              En savoir plus →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 12,
      }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'transparent',
          border: 'none', borderBottom: '1px solid rgba(201,168,76,0.4)',
          color: '#FAFAFA', fontSize: 15, padding: '12px 0',
          outline: 'none',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontWeight: 300,
          transition: 'border-color 0.3s',
        }}
        onFocus={e => (e.currentTarget.style.borderBottomColor = '#C9A84C')}
        onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(201,168,76,0.4)')}
      />
    </div>
  )
}
