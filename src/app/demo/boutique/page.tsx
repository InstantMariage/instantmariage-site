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

const BASE = 'https://guvayyadovhytvoxugyg.supabase.co/storage/v1/object/public/elite-assets/demo/boutique'

const COLLECTION = [
  { img: `${BASE}/collection-1.jpg`, name: 'Élégance Pure', price: 'À partir de 2 800€' },
  { img: `${BASE}/collection-2.jpg`, name: 'Reine de Saba', price: 'À partir de 3 500€' },
  { img: `${BASE}/collection-3.jpg`, name: 'Bohème Dorée', price: 'À partir de 2 200€' },
  { img: `${BASE}/collection-4.jpg`, name: 'Princesse Céleste', price: 'À partir de 4 200€' },
  { img: `${BASE}/collection-5.jpg`, name: 'Moderne Séduction', price: 'À partir de 3 100€' },
  { img: `${BASE}/collection-6.jpg`, name: 'Douceur Éternelle', price: 'À partir de 2 600€' },
]

const SERVICES_BOUTIQUE = [
  { icon: '👗', title: 'Essayage privé', desc: 'Salon privatisé pour vous et vos proches', img: `${BASE}/boutique-1.jpg` },
  { icon: '✂️', title: 'Sur mesure', desc: 'Chaque robe adaptée à votre silhouette', img: `${BASE}/boutique-2.jpg` },
  { icon: '💫', title: 'Accompagnement', desc: 'De la première visite jusqu\'au jour J', img: `${BASE}/boutique-3.jpg` },
]

const TESTIMONIALS = [
  { quote: 'Je me suis sentie une vraie princesse. L\'équipe a su trouver LA robe parfaite.', author: 'Sophie M.', date: 'mariée en juin 2025' },
  { quote: 'Une boutique d\'exception. Le service sur mesure vaut vraiment chaque euro.', author: 'Camille R.', date: 'mariée en septembre 2025' },
  { quote: 'Mon rêve de petite fille réalisé. Je recommande les yeux fermés.', author: 'Inès B.', date: 'mariée en mars 2026' },
]

export default function BoutiquePage() {
  const [scrolled, setScrolled] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [formData, setFormData] = useState({ prenom: '', email: '', telephone: '', date: '', message: '' })

  const collectionSection = useInView()
  const experienceSection = useInView()
  const galerieSection = useInView()
  const testimonialsSection = useInView()
  const rdvSection = useInView()

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 120)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`${cormorant.variable} ${dmSans.variable}`} style={{ fontFamily: 'var(--font-dm-sans), sans-serif', backgroundColor: '#FAFAFA', color: '#1A1A1A' }}>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .collection-grid { grid-template-columns: 1fr !important; }
          .experience-grid { grid-template-columns: 1fr !important; }
          .galerie-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-title { font-size: 52px !important; }
          .hero-subtitle { font-size: 14px !important; }
          .section-title-lg { font-size: 40px !important; }
          .section-title-xl { font-size: 48px !important; }
          .rdv-form { grid-template-columns: 1fr !important; }
          .footer-links { flex-direction: column !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .galerie-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 40px !important; }
        }
        .card-zoom img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) !important; }
        .card-zoom:hover img { transform: scale(1.06) !important; }
        .galerie-img { transition: filter 0.4s ease; }
        .galerie-img:hover { filter: brightness(1.12); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        backgroundColor: scrolled ? 'rgba(250,250,250,0.96)' : 'rgba(250,250,250,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)'}`,
        transition: 'all 0.4s ease',
      }}>
        <button onClick={() => scrollTo('hero')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 17, letterSpacing: '0.22em', fontWeight: 600, color: '#1A1A1A', userSelect: 'none' }}>
            MAISON BLANCHE
          </span>
        </button>

        <div className="nav-links" style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {[['Collection', 'collection'], ['Boutique', 'experience'], ['Rendez-vous', 'rdv'], ['Contact', 'rdv']].map(([label, id]) => (
            <button key={label} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em', color: '#1A1A1A', fontFamily: 'var(--font-dm-sans)', fontWeight: 400, transition: 'opacity 0.2s', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.45')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {label}
            </button>
          ))}
          <button onClick={() => scrollTo('rdv')}
            style={{ border: '1px solid #1A1A1A', background: 'none', cursor: 'pointer', padding: '7px 20px', fontSize: 11, letterSpacing: '0.14em', color: '#1A1A1A', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, transition: 'all 0.25s', borderRadius: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#FAFAFA' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1A1A1A' }}
          >
            PRENDRE RDV
          </button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexDirection: 'column', gap: 5 }}
          aria-label="Menu"
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{ display: 'block', width: 22, height: 1, backgroundColor: '#1A1A1A', transition: 'all 0.3s', transform: menuOpen && i === 0 ? 'rotate(45deg) translate(4px,4px)' : menuOpen && i === 2 ? 'rotate(-45deg) translate(4px,-4px)' : 'none', opacity: menuOpen && i === 1 ? 0 : 1 }} />
          ))}
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 52, left: 0, right: 0, zIndex: 99, backgroundColor: 'rgba(250,250,250,0.98)', backdropFilter: 'blur(16px)', padding: '28px 48px', display: 'flex', flexDirection: 'column', gap: 22, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {[['Collection', 'collection'], ['Boutique', 'experience'], ['Rendez-vous', 'rdv'], ['Contact', 'rdv']].map(([label, id]) => (
            <button key={label} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, fontFamily: 'var(--font-cormorant)', color: '#1A1A1A', textAlign: 'left', fontWeight: 400 }}>
              {label}
            </button>
          ))}
          <button onClick={() => scrollTo('rdv')} style={{ border: '1px solid #1A1A1A', background: 'none', cursor: 'pointer', padding: '11px 0', fontSize: 12, letterSpacing: '0.12em', color: '#1A1A1A', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>
            PRENDRE RDV
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="hero" style={{ position: 'relative', height: '100svh', minHeight: 620, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F5F0E8' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${BASE}/hero.jpg`} alt="Mariage luxe" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: '15vh 24px 0', transition: 'all 1.1s cubic-bezier(0.25,0.46,0.45,0.94)', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(28px)' }}>
          <h1 className="hero-title" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 88, fontWeight: 400, fontStyle: 'italic', color: '#FFFFFF', lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            La robe de vos rêves<br />vous attend
          </h1>
          <p className="hero-subtitle" style={{ fontSize: 16, letterSpacing: '0.12em', color: '#FFFFFF', opacity: 0.82, margin: '0 0 40px', fontWeight: 300 }}>
            Boutique de robes de mariée sur mesure — Paris 8ème
          </p>
          <button onClick={() => scrollTo('collection')}
            style={{ backgroundColor: '#FFFFFF', color: '#1A1A1A', border: 'none', cursor: 'pointer', padding: '15px 36px', fontSize: 12, letterSpacing: '0.14em', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, borderRadius: 0, transition: 'all 0.25s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            DÉCOUVRIR LA COLLECTION
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: heroVisible ? 0.5 : 0, transition: 'opacity 1.4s ease' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFFFFF' }}>DÉFILER</span>
          <div style={{ width: 1, height: 36, backgroundColor: '#FFFFFF', animation: 'pulse 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── COLLECTION ── */}
      <section id="collection" style={{ backgroundColor: '#FAFAFA', padding: '100px 48px' }}>
        <div ref={collectionSection.ref} style={{ maxWidth: 1280, margin: '0 auto', transition: 'all 0.9s ease', opacity: collectionSection.inView ? 1 : 0, transform: collectionSection.inView ? 'translateY(0)' : 'translateY(40px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.22em', color: '#C9A84C', marginBottom: 14, fontWeight: 500 }}>HAUTE COUTURE</p>
            <h2 className="section-title-lg" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 64, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>Collection 2026</h2>
          </div>

          <div className="collection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {COLLECTION.map((item, i) => (
              <div key={i} className="card-zoom"
                style={{ cursor: 'pointer', transition: `opacity 0.7s ease ${i * 0.1}s, transform 0.7s ease ${i * 0.1}s`, opacity: collectionSection.inView ? 1 : 0, transform: collectionSection.inView ? 'translateY(0)' : 'translateY(30px)' }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', backgroundColor: '#F5F0E8' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(26,26,26,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hoveredCard === i ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                    <span style={{ border: '1px solid #FAFAFA', color: '#FAFAFA', padding: '10px 24px', fontSize: 11, letterSpacing: '0.14em', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>
                      VOIR LA ROBE
                    </span>
                  </div>
                </div>
                <div style={{ padding: '18px 4px 8px' }}>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 22, fontWeight: 500, margin: '0 0 6px', letterSpacing: '0.02em' }}>{item.name}</h3>
                  <p style={{ fontSize: 13, color: '#C9A84C', margin: 0, letterSpacing: '0.05em', fontWeight: 400 }}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <button onClick={() => scrollTo('rdv')}
              style={{ border: '1px solid #1A1A1A', background: 'none', cursor: 'pointer', padding: '13px 36px', fontSize: 11, letterSpacing: '0.14em', color: '#1A1A1A', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, borderRadius: 0, transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#FAFAFA' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1A1A1A' }}
            >
              PRENDRE RENDEZ-VOUS
            </button>
          </div>
        </div>
      </section>

      {/* ── EXPÉRIENCE BOUTIQUE ── */}
      <section id="experience" style={{ backgroundColor: '#F5F0E8', padding: '100px 48px' }}>
        <div ref={experienceSection.ref} style={{ maxWidth: 1280, margin: '0 auto', transition: 'all 0.9s ease', opacity: experienceSection.inView ? 1 : 0, transform: experienceSection.inView ? 'translateY(0)' : 'translateY(40px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.22em', color: '#C9A84C', marginBottom: 14, fontWeight: 500 }}>NOTRE UNIVERS</p>
            <h2 className="section-title-lg" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 56, fontWeight: 400, margin: 0 }}>Une expérience unique</h2>
          </div>

          <div className="experience-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {SERVICES_BOUTIQUE.map((svc, i) => (
              <div key={i} style={{ position: 'relative', overflow: 'hidden', borderRadius: 0, transition: `opacity 0.8s ease ${i * 0.15}s, transform 0.8s ease ${i * 0.15}s`, opacity: experienceSection.inView ? 1 : 0, transform: experienceSection.inView ? 'translateY(0)' : 'translateY(30px)' }}>
                <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={svc.img} alt={svc.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.6s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,26,26,0.1) 0%, rgba(26,26,26,0.55) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28 }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{svc.icon}</div>
                    <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 500, color: '#FAFAFA', margin: '0 0 8px' }}>{svc.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.82)', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>{svc.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERIE AMBIANCE ── */}
      <section id="galerie" style={{ backgroundColor: '#1A1A1A', padding: 0 }}>
        <div ref={galerieSection.ref} style={{ transition: 'opacity 0.9s ease', opacity: galerieSection.inView ? 1 : 0 }}>
          <div className="galerie-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {[`${BASE}/boutique-4.jpg`, `${BASE}/boutique-5.jpg`, `${BASE}/essayage.jpg`, `${BASE}/collection-3.jpg`].map((img, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="galerie-img" src={img} alt={`Galerie ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" style={{ backgroundColor: '#FAFAFA', padding: '100px 48px' }}>
        <div ref={testimonialsSection.ref} style={{ maxWidth: 1100, margin: '0 auto', transition: 'all 0.9s ease', opacity: testimonialsSection.inView ? 1 : 0, transform: testimonialsSection.inView ? 'translateY(0)' : 'translateY(40px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.22em', color: '#C9A84C', marginBottom: 14, fontWeight: 500 }}>ELLES NOUS FONT CONFIANCE</p>
            <h2 className="section-title-lg" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 52, fontWeight: 400, margin: 0 }}>Ce qu'elles disent</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ padding: '40px 36px', border: '1px solid rgba(201,168,76,0.25)', backgroundColor: '#FAFAFA', transition: `opacity 0.8s ease ${i * 0.15}s, transform 0.8s ease ${i * 0.15}s`, opacity: testimonialsSection.inView ? 1 : 0, transform: testimonialsSection.inView ? 'translateY(0)' : 'translateY(24px)' }}>
                <div style={{ color: '#C9A84C', fontSize: 18, marginBottom: 20, letterSpacing: 4 }}>★★★★★</div>
                <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 24px', color: '#1A1A1A', fontWeight: 400 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 3px', letterSpacing: '0.05em' }}>{t.author}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: 0, letterSpacing: '0.08em' }}>{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RENDEZ-VOUS ── */}
      <section id="rdv" style={{ backgroundColor: '#F5F0E8', padding: '100px 48px' }}>
        <div ref={rdvSection.ref} style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', transition: 'all 0.9s ease', opacity: rdvSection.inView ? 1 : 0, transform: rdvSection.inView ? 'translateY(0)' : 'translateY(40px)' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.22em', color: '#C9A84C', marginBottom: 16, fontWeight: 500 }}>PRENONS LE TEMPS</p>
          <h2 className="section-title-xl" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 72, fontWeight: 400, margin: '0 0 20px', lineHeight: 1.1 }}>Prenez rendez-vous</h2>
          <p style={{ fontSize: 14, color: '#555', margin: '0 0 56px', lineHeight: 1.8, letterSpacing: '0.04em' }}>
            Nos stylistes vous accueillent du mardi au samedi, de 10h à 19h
          </p>

          <form onSubmit={e => e.preventDefault()} style={{ textAlign: 'left' }}>
            <div className="rdv-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {[
                { key: 'prenom', label: 'Prénom', type: 'text', placeholder: 'Votre prénom' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'votre@email.fr' },
                { key: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '+33 6 00 00 00 00' },
                { key: 'date', label: 'Date souhaitée', type: 'date', placeholder: '' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', color: '#1A1A1A', marginBottom: 8, fontWeight: 500 }}>{field.label.toUpperCase()}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: '100%', padding: '13px 16px', border: '1px solid rgba(26,26,26,0.2)', backgroundColor: 'transparent', fontSize: 14, color: '#1A1A1A', outline: 'none', fontFamily: 'var(--font-dm-sans)', borderRadius: 0, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.2)')}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', color: '#1A1A1A', marginBottom: 8, fontWeight: 500 }}>MESSAGE</label>
              <textarea
                placeholder="Parlez-nous de vos envies, style recherché, date du mariage..."
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '13px 16px', border: '1px solid rgba(26,26,26,0.2)', backgroundColor: 'transparent', fontSize: 14, color: '#1A1A1A', outline: 'none', fontFamily: 'var(--font-dm-sans)', borderRadius: 0, resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.2)')}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button type="submit"
                style={{ backgroundColor: '#1A1A1A', color: '#FAFAFA', border: 'none', cursor: 'pointer', padding: '16px 48px', fontSize: 12, letterSpacing: '0.16em', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, borderRadius: 0, transition: 'opacity 0.25s', width: '100%' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                CONFIRMER MON RENDEZ-VOUS
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#1A1A1A', padding: '64px 48px 40px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 24, letterSpacing: '0.2em', color: '#FAFAFA', margin: '0 0 12px', fontWeight: 400 }}>
          MAISON BLANCHE BRIDAL
        </p>
        <div style={{ width: 40, height: 1, backgroundColor: '#C9A84C', margin: '0 auto 24px' }} />
        <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.55)', margin: '0 0 32px', letterSpacing: '0.05em' }}>
          12 rue du Faubourg Saint-Honoré, Paris 8ème
        </p>

        <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 40 }}>
          {['Instagram', 'Pinterest', 'Facebook'].map(social => (
            <a key={social} href="#" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'rgba(250,250,250,0.55)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,250,0.55)')}
            >
              {social.toUpperCase()}
            </a>
          ))}
        </div>

        <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(250,250,250,0.08)', marginBottom: 28 }} />
        <p style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', margin: 0, letterSpacing: '0.06em' }}>
          © 2026 Maison Blanche Bridal — Site réalisé par{' '}
          <a href="https://instantmariage.fr" style={{ color: '#C9A84C', textDecoration: 'none' }}>InstantMariage.fr</a>
        </p>
      </footer>

    </div>
  )
}
