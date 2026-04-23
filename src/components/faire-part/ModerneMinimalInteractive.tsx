'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase =
  | 'idle'
  | 'seal-burst'
  | 'flap-open'
  | 'letter-rise'
  | 'expanding'
  | 'revealing'
  | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'seal-burst': 560,
  'flap-open': 1050,
  'letter-rise': 820,
  'expanding': 540,
  'revealing': 2400,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'seal-burst': 'flap-open',
  'flap-open': 'letter-rise',
  'letter-rise': 'expanding',
  'expanding': 'revealing',
  'revealing': 'complete',
};

interface Props {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  rsvpActif?: boolean;
  rsvpDeadline?: string | null;
  rsvpSlug?: string;
  autoPlay?: boolean;
  fixedHeight?: number;
}

export default function ModerneMinimalInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [clipExpanded, setClipExpanded] = useState(false);

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('seal-burst'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  useEffect(() => {
    if (phase === 'expanding') {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setClipExpanded(true)));
      return () => cancelAnimationFrame(raf);
    }
    setClipExpanded(false);
  }, [phase]);

  const handleSealClick = () => { if (phase === 'idle') setPhase('seal-burst'); };

  const showEnvelope = ['idle', 'seal-burst', 'flap-open'].includes(phase);
  const showLetter = !showEnvelope;
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());

  const letterClip = (): string => {
    if (phase === 'letter-rise') return 'ellipse(160px 120px at 50% 44%)';
    if (phase === 'expanding') return clipExpanded ? 'ellipse(120vmax 120vmax at 50% 44%)' : 'ellipse(160px 120px at 50% 44%)';
    return 'none';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Raleway:wght@200;300;400;500&display=swap');
        .mm * { box-sizing: border-box; }

        @keyframes mmSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.6; transform:scale(1) rotate(180deg); }
        }
        @keyframes mmSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,.5), 0 4px 24px rgba(0,0,0,.6); }
          50%      { box-shadow: 0 0 0 11px rgba(201,168,76,0), 0 4px 32px rgba(201,168,76,.3); }
        }
        @keyframes mmSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.7); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes mmp1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes mmp2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes mmp3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes mmp4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes mmp5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes mmp6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes mmp7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes mmp8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes mmFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes mmEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes mmHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes mmSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes mmGoldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        .mm-r0 { animation: mmSlideUp .7s 0s ease-out both; }
        .mm-r1 { animation: mmSlideUp .7s .2s ease-out both; }
        .mm-r2 { animation: mmSlideUp .7s .42s ease-out both; }
        .mm-r3 { animation: mmSlideUp .7s .64s ease-out both; }
        .mm-r4 { animation: mmSlideUp .7s .85s ease-out both; }
        .mm-r5 { animation: mmSlideUp .7s 1.05s ease-out both; }
        .mm-r6 { animation: mmSlideUp .7s 1.28s ease-out both; }
        .mm-r7 { animation: mmSlideUp .7s 1.52s ease-out both; }
        .mm-r8 { animation: mmSlideUp .7s 1.78s ease-out both; }
      `}</style>

      {/* Minimal corner marks */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
        <div style={{ position: 'absolute', top: 20, left: 20, width: 24, height: 24, borderTop: '1.5px solid rgba(201,168,76,.6)', borderLeft: '1.5px solid rgba(201,168,76,.6)' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 24, height: 24, borderTop: '1.5px solid rgba(201,168,76,.6)', borderRight: '1.5px solid rgba(201,168,76,.6)' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 20, width: 24, height: 24, borderBottom: '1.5px solid rgba(201,168,76,.6)', borderLeft: '1.5px solid rgba(201,168,76,.6)' }} />
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: 24, height: 24, borderBottom: '1.5px solid rgba(201,168,76,.6)', borderRight: '1.5px solid rgba(201,168,76,.6)' }} />
      </div>

      <div className="mm" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cormorant Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: '#050505',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Gold sparkles */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
                background: '#C9A84C',
                borderRadius: i % 4 === 0 ? 0 : '50%',
                left: `${8 + (i * 6.2) % 86}%`,
                top: `${4 + (i * 11.3) % 92}%`,
                animation: `mmSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {/* Title hint */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'mmEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(201,168,76,.5)', fontSize: 11, letterSpacing: '.38em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontStyle: 'italic', fontWeight: 300 }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'mmEnvIn .8s .2s ease-out both' }}>
              {/* Body — matte black */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #252525 0%, #1a1a1a 40%, #111111 100%)',
                borderRadius: 12,
                border: '1.5px solid #C9A84C',
                boxShadow: '0 12px 48px rgba(0,0,0,.8), 0 2px 8px rgba(201,168,76,.15)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="#C9A84C" strokeWidth=".6" opacity=".2" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="#C9A84C" strokeWidth=".6" opacity=".2" />
                  {/* Geometric grid */}
                  <rect x="20" y="20" width="400" height="244" fill="none" stroke="#C9A84C" strokeWidth=".3" opacity=".08" />
                  <line x1="220" y1="20" x2="220" y2="264" stroke="#C9A84C" strokeWidth=".25" opacity=".06" />
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'mmFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #222 0%, #1a1a1a 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid #C9A84C',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — geometric gold */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #F0D080 0%, #C9A84C 45%, #8B6914 100%)',
                    border: '2.5px solid #1a1a1a',
                    boxShadow: '0 0 0 1.5px #C9A84C',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'mmSealPulse 2.2s ease-in-out infinite' : 'mmSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(26,26,26,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Geometric diamond motif */}
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M18 6 L30 18 L18 30 L6 18 Z" stroke="#1a1a1a" strokeWidth="1.4" fill="none" opacity=".7" />
                      <path d="M18 11 L25 18 L18 25 L11 18 Z" stroke="#1a1a1a" strokeWidth=".8" fill="rgba(26,26,26,.15)" opacity=".8" />
                      <circle cx="18" cy="18" r="2.5" fill="#1a1a1a" opacity=".6" />
                      <line x1="18" y1="6" x2="18" y2="11" stroke="#1a1a1a" strokeWidth=".6" opacity=".5" />
                      <line x1="18" y1="25" x2="18" y2="30" stroke="#1a1a1a" strokeWidth=".6" opacity=".5" />
                      <line x1="6" y1="18" x2="11" y2="18" stroke="#1a1a1a" strokeWidth=".6" opacity=".5" />
                      <line x1="25" y1="18" x2="30" y2="18" stroke="#1a1a1a" strokeWidth=".6" opacity=".5" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: i % 3 === 0 ? 0 : '50%',
                      background: i % 2 === 0 ? '#C9A84C' : '#111',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `mmp${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(201,168,76,.8)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'mmHintFloat 2s ease-in-out infinite',
                  fontFamily: "'Raleway', sans-serif", fontWeight: 200,
                }}>
                  ✦ Touchez le sceau pour ouvrir ✦
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LETTRE ── */}
        {showLetter && (
          <div style={{
            position: 'relative', width: '100%',
            minHeight: fixedHeight ? fixedHeight : '100dvh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#F8F5F0',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ width: '100%', maxWidth: 440, padding: '80px 32px 108px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="mm-r0" style={{ marginBottom: 36 }}>
                  <svg width="240" height="28" viewBox="0 0 240 28" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="14" x2="96" y2="14" stroke="#1A1A1A" strokeWidth=".5" opacity=".18" />
                    <path d="M100 7 L110 14 L100 21 L90 14 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".65" />
                    <path d="M110 14 L120 7 L130 14 L120 21 Z" fill="#C9A84C" opacity=".12" stroke="#C9A84C" strokeWidth=".6" />
                    <path d="M130 7 L140 14 L130 21 L120 14 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".65" />
                    <line x1="144" y1="14" x2="240" y2="14" stroke="#1A1A1A" strokeWidth=".5" opacity=".18" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="mm-r1" style={{ fontSize: 9, letterSpacing: '.36em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 26, fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}>Mariage</p>
              )}

              {isRevealing && (
                <h1 className="mm-r2" style={{ fontSize: 'clamp(2.6rem, 9.5vw, 3.8rem)', fontWeight: 300, fontStyle: 'italic', color: '#111', lineHeight: 1.06, marginBottom: 6, letterSpacing: '.02em' }}>
                  {coupleNames}
                </h1>
              )}

              {isRevealing && (
                <p className="mm-r3" style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#888', marginBottom: 40, fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="mm-r4" style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, height: .5, background: '#C9A84C', opacity: .35 }} />
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="#C9A84C" opacity=".6" />
                  </svg>
                  <div style={{ flex: 1, height: .5, background: '#C9A84C', opacity: .35 }} />
                </div>
              )}

              {isRevealing && (
                <div className="mm-r5" style={{ marginBottom: 24, padding: '20px 24px', border: '1px solid rgba(26,26,26,.08)', background: 'rgba(255,255,255,.7)' }}>
                  <p style={{ fontSize: 9, letterSpacing: '.38em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.25rem, 5.5vw, 1.7rem)', fontWeight: 300, color: '#111', letterSpacing: '.04em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="mm-r6" style={{ marginBottom: message ? 40 : 52 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.38em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>À</p>
                  <p style={{ fontSize: 'clamp(1rem, 4.5vw, 1.25rem)', fontStyle: 'italic', fontWeight: 300, color: '#444', lineHeight: 1.5 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="mm-r7" style={{ marginBottom: 48, padding: '22px 28px', borderLeft: '2px solid #C9A84C', background: 'rgba(255,255,255,.6)', textAlign: 'left' }}>
                  <p style={{ fontSize: 'clamp(.9rem, 3.8vw, 1.05rem)', fontStyle: 'italic', fontWeight: 300, color: '#555', lineHeight: 1.78 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="mm-r8" style={{ marginBottom: 48 }}>
                  <button
                    style={{ display: 'inline-block', padding: '13px 40px', background: '#111', color: '#C9A84C', border: '1px solid #111', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontWeight: 400, transition: 'all .25s' }}
                    onMouseEnter={e => { const el = e.target as HTMLElement; el.style.background = '#C9A84C'; el.style.color = '#111'; }}
                    onMouseLeave={e => { const el = e.target as HTMLElement; el.style.background = '#111'; el.style.color = '#C9A84C'; }}
                    onClick={() => document.getElementById('mm-rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Confirmer ma présence
                  </button>
                  {rsvpDeadline && (
                    <p style={{ fontSize: 11, color: '#AAA', marginTop: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}>
                      Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {isRevealing && (
                <div style={{ marginBottom: 64 }}>
                  <svg width="220" height="20" viewBox="0 0 220 20" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="10" x2="90" y2="10" stroke="#1A1A1A" strokeWidth=".5" opacity=".15" />
                    <path d="M94 4 L100 10 L94 16 L88 10 Z" fill="none" stroke="#C9A84C" strokeWidth=".7" opacity=".55" />
                    <circle cx="110" cy="10" r="2.5" fill="none" stroke="#C9A84C" strokeWidth=".7" opacity=".4" />
                    <path d="M120 4 L126 10 L120 16 L114 10 Z" fill="none" stroke="#C9A84C" strokeWidth=".7" opacity=".55" />
                    <line x1="130" y1="10" x2="220" y2="10" stroke="#1A1A1A" strokeWidth=".5" opacity=".15" />
                  </svg>
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="mm-rsvp" style={{ paddingTop: 52, marginTop: 8, borderTop: '1px solid rgba(26,26,26,.08)' }}>
                  <p style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}>Répondre</p>
                  <p style={{ fontSize: 'clamp(1.4rem, 5.5vw, 1.9rem)', fontStyle: 'italic', fontWeight: 300, color: '#111', marginBottom: 26 }}>Confirmer ma présence</p>
                  <div style={{ background: '#FFF', border: '1px solid rgba(26,26,26,.09)', padding: '28px 20px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#111111" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#CCC', letterSpacing: '.06em', fontFamily: "'Raleway', sans-serif", fontWeight: 300 }}>
                    Créé avec{' '}
                    <a href="https://instantmariage.fr" style={{ color: '#C9A84C', textDecoration: 'none' }}>InstantMariage.fr</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
