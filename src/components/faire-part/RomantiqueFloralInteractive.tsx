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
  'revealing': 2200,
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

export default function RomantiqueFloralInteractive({
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Lato:wght@300;400&display=swap');
        .rf * { box-sizing: border-box; }

        @keyframes rfSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.6; transform:scale(1) rotate(180deg); }
        }
        @keyframes rfSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(139,26,58,.5), 0 4px 24px rgba(0,0,0,.5); }
          50%      { box-shadow: 0 0 0 11px rgba(139,26,58,0), 0 4px 32px rgba(139,26,58,.35); }
        }
        @keyframes rfSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.5); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes rfp1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes rfp2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes rfp3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes rfp4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes rfp5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes rfp6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes rfp7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes rfp8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes rfFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes rfEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes rfHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes rfFadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes rfRoseShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        .rf-r0 { animation: rfFadeUp .7s 0s ease-out both; }
        .rf-r1 { animation: rfFadeUp .7s .2s ease-out both; }
        .rf-r2 { animation: rfFadeUp .7s .42s ease-out both; }
        .rf-r3 { animation: rfFadeUp .7s .64s ease-out both; }
        .rf-r4 { animation: rfFadeUp .7s .86s ease-out both; }
        .rf-r5 { animation: rfFadeUp .7s 1.08s ease-out both; }
        .rf-r6 { animation: rfFadeUp .7s 1.3s ease-out both; }
        .rf-r7 { animation: rfFadeUp .7s 1.55s ease-out both; }
        .rf-rose-text {
          background: linear-gradient(120deg, #B5224A 0%, #E91E8C 35%, #FCB8D0 55%, #E91E8C 75%, #B5224A 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rfRoseShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Floral border */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(233,30,140,0.25)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="rf" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cormorant Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, #2e0f18 0%, #4a1525 55%, #280c14 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Rose sparkles */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
                background: i % 2 === 0 ? '#f8e8e8' : '#E91E8C',
                borderRadius: '50%',
                left: `${8 + (i * 6.2) % 86}%`,
                top: `${4 + (i * 11.3) % 92}%`,
                animation: `rfSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'rfEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(248,200,200,.55)', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(255,240,248,.88)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontStyle: 'italic', fontWeight: 300 }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope — rose poudré */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'rfEnvIn .8s .2s ease-out both' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #fdf0f2 0%, #f8e8e8 40%, #f5dde0 100%)',
                borderRadius: 12,
                border: '1.5px solid rgba(139,26,58,.3)',
                boxShadow: '0 12px 48px rgba(0,0,0,.55), 0 2px 8px rgba(139,26,58,.15)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="#8B1A3A" strokeWidth=".6" opacity=".18" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="#8B1A3A" strokeWidth=".6" opacity=".18" />
                  {/* Delicate floral pattern */}
                  {[60, 180, 260, 380].map((x, i) => (
                    <g key={i} opacity=".12">
                      <circle cx={x} cy={i % 2 === 0 ? 80 : 200} r="12" fill="none" stroke="#8B1A3A" strokeWidth=".5" />
                      <circle cx={x} cy={i % 2 === 0 ? 80 : 200} r="5" fill="#E91E8C" opacity=".3" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'rfFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #f5e0e4 0%, #eed0d5 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid rgba(139,26,58,.25)',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #e0c0c8 0%, #c8a0a8 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — bordeaux fleuri */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #c4556a 0%, #8B1A3A 55%, #5C0E25 100%)',
                    border: '2.5px solid rgba(248,200,200,.6)',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'rfSealPulse 2.2s ease-in-out infinite' : 'rfSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(248,180,200,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Rose fleurie */}
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      {[0,60,120,180,240,300].map((a, i) => {
                        const rad = a * Math.PI / 180;
                        const cx = 18 + Math.cos(rad) * 9;
                        const cy = 18 + Math.sin(rad) * 9;
                        return <ellipse key={i} cx={cx} cy={cy} rx="6" ry="4" fill="#FDDDE6" opacity=".8" transform={`rotate(${a} ${cx} ${cy})`} />;
                      })}
                      <circle cx="18" cy="18" r="5" fill="#FCB8D0" opacity=".9" />
                      <circle cx="18" cy="18" r="2.5" fill="#f8e8e8" opacity=".8" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: '50%',
                      background: i % 2 === 0 ? '#f8e8e8' : '#8B1A3A',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `rfp${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(248,200,200,.85)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'rfHintFloat 2s ease-in-out infinite',
                  fontFamily: "'Lato', sans-serif",
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
            background: 'linear-gradient(180deg, #FFF5F8 0%, #FCE8EF 40%, #FFF5F8 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ width: '100%', maxWidth: 420, padding: '72px 28px 100px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="rf-r0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="40" viewBox="0 0 220 40" fill="none">
                    <line x1="0" y1="20" x2="80" y2="20" stroke="#E91E8C" strokeWidth=".5" opacity=".3" />
                    {[0,1,2,3,4].map(i => (
                      <ellipse key={i} cx={95 + i*8} cy={20 - (i === 2 ? 6 : i % 2 === 0 ? 3 : 0)} rx="5" ry="3" fill="#F48FB1" opacity=".5" transform={`rotate(${i*15 - 30} ${95 + i*8} ${20 - (i === 2 ? 6 : i % 2 === 0 ? 3 : 0)})`} />
                    ))}
                    <line x1="135" y1="20" x2="220" y2="20" stroke="#E91E8C" strokeWidth=".5" opacity=".3" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="rf-r1" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 28, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Ensemble pour toujours</p>
              )}

              {isRevealing && (
                <h1 className="rf-r2 rf-rose-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>
              )}

              {isRevealing && (
                <p className="rf-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 40, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="rf-r4" style={{ marginBottom: 40 }}>
                  <svg width="200" height="22" viewBox="0 0 200 22" fill="none">
                    <line x1="0" y1="11" x2="80" y2="11" stroke="#F48FB1" strokeWidth=".5" />
                    <path d="M89 5 Q100 1 111 5 Q100 11 89 5Z" fill="#F48FB1" opacity=".6" />
                    <circle cx="100" cy="11" r="2" fill="#E91E8C" opacity=".7" />
                    <path d="M89 17 Q100 21 111 17 Q100 11 89 17Z" fill="#F48FB1" opacity=".4" />
                    <line x1="120" y1="11" x2="200" y2="11" stroke="#F48FB1" strokeWidth=".5" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="rf-r5" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: '#3D1022', letterSpacing: '.02em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="rf-r6" style={{ marginBottom: message ? 40 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>À</p>
                  <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 300, color: '#5C2A3C', lineHeight: 1.4 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="rf-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(233,30,140,.2)', borderBottom: '.5px solid rgba(233,30,140,.2)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#5C2A3C', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="rf-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid #E91E8C', borderRadius: 2, color: '#B5224A', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
                    onClick={() => document.getElementById('rf-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#B5447A', marginTop: 6 }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="rf-rsvp" style={{ borderTop: '.5px solid rgba(233,30,140,.18)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontStyle: 'italic', fontWeight: 300, color: '#3D1022', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(255,245,248,.85)', border: '1px solid rgba(233,30,140,.18)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#E91E8C" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#CC90AC', letterSpacing: '.05em', fontFamily: "'Lato', sans-serif" }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#E91E8C', textDecoration: 'none' }}>InstantMariage.fr</a>
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
