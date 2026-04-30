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

function useInView(threshold = 0.15) {
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

const SUPABASE_BASE = 'https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/photographe'

const GALLERY_PHOTOS = [
  `${SUPABASE_BASE}/galerie-1.jpg`,
  `${SUPABASE_BASE}/galerie-2.jpg`,
  `${SUPABASE_BASE}/galerie-3.jpg`,
  `${SUPABASE_BASE}/galerie-4.jpg`,
  `${SUPABASE_BASE}/galerie-5.jpg`,
  `${SUPABASE_BASE}/galerie-6.jpg`,
]

const SERVICES = [
  { num: '01', name: 'Reportage Complet', desc: 'Cérémonie + cocktail + soirée, livraison 400+ photos', price: 'À partir de 2 500€' },
  { num: '02', name: 'Engagement Session', desc: 'Séance photo couple avant le mariage', price: 'À partir de 800€' },
  { num: '03', name: 'Fine Art Album', desc: 'Album premium 30×30 cm, 60 pages', price: 'À partir de 650€' },
]

const TESTIMONIALS = [
  { quote: 'Léa a su saisir chaque émotion avec une discrétion absolue. Nos photos sont à couper le souffle.', couple: 'Sophie & Thomas', date: 'Juin 2024' },
  { quote: 'Une artiste à part entière. Elle a capturé notre mariage comme un film — chaque regard, chaque larme.', couple: 'Camille & Hugo', date: 'Septembre 2024' },
  { quote: 'Professionnalisme, délicatesse, talent. Nos invités ne la voyaient même pas. Le résultat est magique.', couple: 'Inès & Raphaël', date: 'Mai 2024' },
]

export default function PhotographePage() {
  const [scrolled, setScrolled] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const statsSection = useInView()
  const gallerySection = useInView()
  const aboutSection = useInView()
  const servicesSection = useInView()
  const testimonialsSection = useInView()
  const contactSection = useInView()

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`${cormorant.variable} ${dmSans.variable}`} style={{ fontFamily: 'var(--font-dm-sans), sans-serif', backgroundColor: '#0A0A0A', color: '#FAFAFA' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        backgroundColor: scrolled ? 'rgba(250,250,250,0.92)' : 'rgba(250,250,250,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        transition: 'background-color 0.4s ease',
      }}>
        <span
          onClick={() => scrollTo('hero')}
          style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, letterSpacing: '0.15em', fontWeight: 600, color: '#0A0A0A', cursor: 'pointer', userSelect: 'none' }}
        >
          LÉA MARTIN
        </span>

        {/* Desktop nav */}
        <div className="nav-links" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[['Portfolio', 'gallery'], ['À propos', 'about'], ['Tarifs', 'services'], ['Contact', 'contact']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.08em', color: '#0A0A0A', fontFamily: 'var(--font-dm-sans)', fontWeight: 400, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {label}
            </button>
          ))}
          <button onClick={() => scrollTo('contact')} style={{ border: '1px solid #0A0A0A', background: 'none', cursor: 'pointer', padding: '6px 18px', fontSize: 12, letterSpacing: '0.12em', color: '#0A0A0A', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0A0A0A'; e.currentTarget.style.color = '#FAFAFA' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0A0A0A' }}
          >
            RÉSERVER
          </button>
        </div>

        {/* Hamburger mobile */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexDirection: 'column', gap: 5 }}
          aria-label="Menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: 22, height: 1, backgroundColor: '#0A0A0A', transition: 'all 0.3s', transform: menuOpen && i === 0 ? 'rotate(45deg) translate(4px,4px)' : menuOpen && i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none', opacity: menuOpen && i === 1 ? 0 : 1 }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 48, left: 0, right: 0, zIndex: 99, backgroundColor: 'rgba(250,250,250,0.97)', backdropFilter: 'blur(12px)', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {[['Portfolio', 'gallery'], ['À propos', 'about'], ['Tarifs', 'services'], ['Contact', 'contact']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, fontFamily: 'var(--font-cormorant)', color: '#0A0A0A', textAlign: 'left' }}>
              {label}
            </button>
          ))}
          <button onClick={() => scrollTo('contact')} style={{ border: '1px solid #0A0A0A', background: 'none', cursor: 'pointer', padding: '10px 0', fontSize: 13, letterSpacing: '0.1em', color: '#0A0A0A', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>
            RÉSERVER
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="hero" style={{ position: 'relative', height: '100svh', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SUPABASE_BASE}/hero.jpg`}
          alt="Mariage"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 50%, rgba(10,10,10,0.65) 100%)' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 1s ease 0.5s, transform 1s ease 0.5s' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, letterSpacing: '0.3em', color: '#C9A84C', marginBottom: 24, fontWeight: 400 }}>PARIS & PARTOUT EN FRANCE</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(52px, 8vw, 88px)', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.08, color: '#FAFAFA', margin: 0 }}>
            Photographe<br />de mariage
          </h1>
          <div style={{ width: 48, height: 1, backgroundColor: '#C9A84C', margin: '36px auto 0' }} />
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', color: 'rgba(250,250,250,0.5)', fontFamily: 'var(--font-dm-sans)' }}>SCROLL</span>
          <div style={{ width: 1, height: 48, backgroundColor: 'rgba(250,250,250,0.4)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: '#FAFAFA', animation: 'scrollPulse 1.8s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" style={{ backgroundColor: '#FAFAFA', padding: '80px 40px' }}>
        <div ref={statsSection.ref} style={{ opacity: statsSection.inView ? 1 : 0, transform: statsSection.inView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s ease, transform 0.9s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '0 0' }}>
          {[
            { value: "12 ans", label: "d'expérience" },
            { value: "300+", label: "mariages" },
            { value: "8 pays", label: "photographiés" },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0 48px' }}>
                <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 400, color: '#0A0A0A', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.12em', color: '#888', marginTop: 6, fontWeight: 400 }}>{stat.label.toUpperCase()}</div>
              </div>
              {i < 2 && <div style={{ width: 1, height: 56, backgroundColor: 'rgba(0,0,0,0.12)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" style={{ backgroundColor: '#0A0A0A', padding: '0 0 3px' }}>
        <div ref={gallerySection.ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {GALLERY_PHOTOS.map((photoUrl, i) => (
            <div key={photoUrl} style={{ overflow: 'hidden', height: 380, opacity: gallerySection.inView ? 1 : 0, transform: gallerySection.inView ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 0.8s ease ${i * 0.1}s, transform 0.8s ease ${i * 0.1}s` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={`Photo mariage ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.88)', transition: 'filter 0.5s ease, transform 0.6s ease', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.0)'; e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(0.88)'; e.currentTarget.style.transform = 'scale(1)' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ backgroundColor: '#FAFAFA', padding: '100px 40px' }}>
        <div ref={aboutSection.ref} style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', opacity: aboutSection.inView ? 1 : 0, transform: aboutSection.inView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
          <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80&auto=format&fit=crop" alt="Léa Martin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(44px, 5vw, 64px)', fontWeight: 400, color: '#0A0A0A', margin: '0 0 12px', lineHeight: 1.05 }}>Léa Martin</h2>
            <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontStyle: 'italic', color: '#C9A84C', margin: '0 0 32px', fontWeight: 400 }}>Capturer l'éternité de votre instant</p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, lineHeight: 1.85, color: '#444', margin: '0 0 36px', fontWeight: 300 }}>
              Je crois que chaque mariage est une histoire unique. Mon approche est discrète et authentique — je capture les émotions vraies, les regards complices, les larmes de joie. Sans mise en scène excessive, juste la vie telle qu'elle se déroule.
            </p>
            <div style={{ width: '100%', height: 1, backgroundColor: '#C9A84C', opacity: 0.4, margin: '0 0 28px' }} />
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.18em', color: '#0A0A0A', fontWeight: 500 }}>DISPONIBLE POUR 2026 & 2027</p>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ backgroundColor: '#0A0A0A', padding: '100px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div ref={servicesSection.ref} style={{ opacity: servicesSection.inView ? 1 : 0, transform: servicesSection.inView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, letterSpacing: '0.28em', color: '#C9A84C', marginBottom: 16, fontWeight: 400 }}>FORMULES</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 300, color: '#FAFAFA', margin: '0 0 60px', fontStyle: 'italic' }}>Nos offres</h2>
            <div>
              {SERVICES.map((s, i) => (
                <div key={i} style={{ borderTop: '1px solid rgba(250,250,250,0.1)', padding: '28px 20px', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 24, alignItems: 'center', transition: 'background-color 0.25s ease', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(250,250,250,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
                >
                  <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 14, color: '#C9A84C', fontWeight: 600, letterSpacing: '0.05em' }}>{s.num}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, color: '#FAFAFA', fontWeight: 500, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'rgba(250,250,250,0.45)', fontWeight: 300 }}>{s.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, color: '#FAFAFA', fontWeight: 400, whiteSpace: 'nowrap' }}>{s.price}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(250,250,250,0.1)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ backgroundColor: '#FAFAFA', padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, letterSpacing: '0.28em', color: '#C9A84C', marginBottom: 16, fontWeight: 400 }}>TÉMOIGNAGES</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(36px, 4vw, 52px)', fontStyle: 'italic', fontWeight: 300, color: '#0A0A0A', margin: 0 }}>Ils nous ont fait confiance</h2>
          </div>
          <div ref={testimonialsSection.ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, opacity: testimonialsSection.inView ? 1 : 0, transform: testimonialsSection.inView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ backgroundColor: '#FFF', padding: '36px 32px', boxShadow: '0 2px 24px rgba(0,0,0,0.06)', opacity: testimonialsSection.inView ? 1 : 0, transform: testimonialsSection.inView ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s` }}>
                <div style={{ color: '#C9A84C', fontSize: 14, letterSpacing: 3, marginBottom: 20 }}>★★★★★</div>
                <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, fontStyle: 'italic', fontWeight: 400, color: '#0A0A0A', lineHeight: 1.7, margin: '0 0 28px' }}>« {t.quote} »</p>
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 20 }}>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 500, color: '#0A0A0A', letterSpacing: '0.08em' }}>{t.couple}</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: '#AAA', marginTop: 3, letterSpacing: '0.06em' }}>{t.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ backgroundColor: '#0A0A0A', padding: '100px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div ref={contactSection.ref} style={{ opacity: contactSection.inView ? 1 : 0, transform: contactSection.inView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.9s ease, transform 0.9s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 'clamp(44px, 6vw, 72px)', fontStyle: 'italic', fontWeight: 300, color: '#FAFAFA', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.05 }}>Parlons de<br />votre mariage</h2>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.18em', color: 'rgba(250,250,250,0.45)', textAlign: 'center', margin: '0 0 60px', fontWeight: 300 }}>DISPONIBILITÉS LIMITÉES — RÉSERVEZ TÔT</p>

            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {[
                { label: 'PRÉNOM & NOM', type: 'text', name: 'name', placeholder: 'Sophie & Thomas Dupont' },
                { label: 'EMAIL', type: 'email', name: 'email', placeholder: 'votre@email.com' },
                { label: 'DATE DU MARIAGE', type: 'text', name: 'date', placeholder: 'Juin 2026' },
                { label: 'LIEU ENVISAGÉ', type: 'text', name: 'lieu', placeholder: 'Château de Versailles, Paris...' },
              ].map(f => (
                <div key={f.name} style={{ position: 'relative' }}>
                  <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, letterSpacing: '0.22em', color: 'rgba(250,250,250,0.4)', display: 'block', marginBottom: 10, fontWeight: 400 }}>{f.label}</label>
                  <input type={f.type} name={f.name} placeholder={f.placeholder} style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(250,250,250,0.2)', padding: '8px 0', color: '#FAFAFA', fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 300, outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box' }}
                    onFocus={e => { e.currentTarget.style.borderBottomColor = '#C9A84C' }}
                    onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(250,250,250,0.2)' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, letterSpacing: '0.22em', color: 'rgba(250,250,250,0.4)', display: 'block', marginBottom: 10, fontWeight: 400 }}>MESSAGE</label>
                <textarea name="message" rows={4} placeholder="Parlez-moi de votre mariage..." style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid rgba(250,250,250,0.2)', padding: '8px 0', color: '#FAFAFA', fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 300, outline: 'none', resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = '#C9A84C' }}
                  onBlur={e => { e.currentTarget.style.borderBottomColor = 'rgba(250,250,250,0.2)' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#FAFAFA', color: '#0A0A0A', border: 'none', borderRadius: 0, padding: '18px 0', fontFamily: 'var(--font-dm-sans)', fontSize: 12, letterSpacing: '0.22em', fontWeight: 500, cursor: 'pointer', marginTop: 8, transition: 'background-color 0.2s, color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C9A84C'; e.currentTarget.style.color = '#FAFAFA' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.color = '#0A0A0A' }}
              >
                ENVOYER MA DEMANDE
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0A0A0A', borderTop: '1px solid rgba(250,250,250,0.08)', padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, letterSpacing: '0.2em', color: '#FAFAFA', marginBottom: 28, fontWeight: 500 }}>LÉA MARTIN PHOTOGRAPHIE</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
          {['Instagram', 'Pinterest', 'Facebook'].map(s => (
            <a key={s} href="#" onClick={e => e.preventDefault()} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, letterSpacing: '0.14em', color: 'rgba(250,250,250,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(250,250,250,0.4)' }}
            >
              {s.toUpperCase()}
            </a>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'rgba(250,250,250,0.22)', letterSpacing: '0.06em', lineHeight: 1.8 }}>
          © 2025 Léa Martin Photographie<br />
          <span style={{ color: 'rgba(250,250,250,0.14)' }}>Site réalisé par InstantMariage.fr</span>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ::placeholder { color: rgba(250,250,250,0.2); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0A0A0A inset !important; -webkit-text-fill-color: #FAFAFA !important; }

        @keyframes scrollPulse {
          0% { transform: translateY(-100%); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }

        @media (max-width: 768px) {
          #gallery > div { grid-template-columns: 1fr 1fr !important; }
          #gallery > div > div { height: 220px !important; }
        }

        @media (max-width: 600px) {
          #about > div { grid-template-columns: 1fr !important; gap: 40px !important; }
          #testimonials > div > div:last-child { grid-template-columns: 1fr !important; }
          #services > div > div > div > div { grid-template-columns: 36px 1fr !important; }
          #services > div > div > div > div > span:last-child { display: none; }
        }
      `}</style>
    </div>
  )
}
