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

export default function CoteAzurInteractive({
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Montserrat:wght@200;300;400&display=swap');
        .ca * { box-sizing: border-box; }

        @keyframes caSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.65; transform:scale(1) rotate(180deg); }
        }
        @keyframes caSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,179,0,.5), 0 4px 24px rgba(0,0,0,.55); }
          50%      { box-shadow: 0 0 0 11px rgba(255,179,0,0), 0 4px 32px rgba(255,179,0,.4); }
        }
        @keyframes caSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.6); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes cap1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes cap2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes cap3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes cap4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes cap5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes cap6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes cap7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes cap8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes caFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes caEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes caHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes caWaveAnim {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes caFadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes caAzurShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        .ca-r0 { animation: caFadeUp .7s 0s ease-out both; }
        .ca-r1 { animation: caFadeUp .7s .2s ease-out both; }
        .ca-r2 { animation: caFadeUp .7s .4s ease-out both; }
        .ca-r3 { animation: caFadeUp .7s .6s ease-out both; }
        .ca-r4 { animation: caFadeUp .7s .8s ease-out both; }
        .ca-r5 { animation: caFadeUp .7s 1.0s ease-out both; }
        .ca-r6 { animation: caFadeUp .7s 1.22s ease-out both; }
        .ca-r7 { animation: caFadeUp .7s 1.46s ease-out both; }
        .ca-azur-text {
          background: linear-gradient(120deg, #0277BD 0%, #039BE5 35%, #81D4FA 55%, #039BE5 75%, #0277BD 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: caAzurShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Azur border */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(3,155,229,0.35)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="ca" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cormorant Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #0a1e38 0%, #0d2a52 55%, #071428 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Animated mini waves in background */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', opacity: .3, overflow: 'hidden' }}>
              <svg width="200%" height="100%" viewBox="0 0 1600 160" style={{ position: 'absolute', bottom: 0, animation: 'caWaveAnim 6s linear infinite' }} preserveAspectRatio="none">
                <path d="M0 60 Q100 30 200 60 Q300 90 400 60 Q500 30 600 60 Q700 90 800 60 Q900 30 1000 60 Q1100 90 1200 60 Q1300 30 1400 60 Q1500 90 1600 60 L1600 160 L0 160Z" fill="rgba(3,155,229,.4)" />
              </svg>
            </div>

            {/* Gold/white sparkles */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
                background: i % 3 === 0 ? '#FFD700' : 'rgba(255,255,255,.7)',
                borderRadius: '50%',
                left: `${8 + (i * 6.2) % 86}%`,
                top: `${4 + (i * 11.3) % 92}%`,
                animation: `caSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'caEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(129,212,250,.6)', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(255,255,255,.88)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontStyle: 'italic', fontWeight: 300 }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope — bleu méditerranéen */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'caEnvIn .8s .2s ease-out both' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #2470a0 0%, #1e5f8e 40%, #174f7a 100%)',
                borderRadius: 12,
                border: '1.5px solid rgba(255,215,100,.45)',
                boxShadow: '0 12px 48px rgba(0,0,0,.6), 0 2px 8px rgba(255,215,100,.12)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="rgba(255,215,100,.3)" strokeWidth=".6" opacity=".4" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="rgba(255,215,100,.3)" strokeWidth=".6" opacity=".4" />
                  {/* Subtle wave pattern */}
                  <path d="M0 200 Q110 185 220 200 Q330 215 440 200" stroke="rgba(255,255,255,.1)" strokeWidth="1" fill="none" />
                  <path d="M0 230 Q110 218 220 230 Q330 242 440 230" stroke="rgba(255,255,255,.07)" strokeWidth="1" fill="none" />
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'caFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #2880b0 0%, #1e6898 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid rgba(255,215,100,.35)',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #145078 0%, #0e3858 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — soleil doré */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #FFE082 0%, #FFB300 50%, #E65100 100%)',
                    border: '2.5px solid rgba(255,200,80,.5)',
                    boxShadow: '0 0 12px rgba(255,179,0,.4)',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'caSealPulse 2.2s ease-in-out infinite' : 'caSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(230,81,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Soleil rays */}
                    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
                        const rad = a * Math.PI / 180;
                        const r1 = i % 2 === 0 ? 14 : 12;
                        const r2 = i % 2 === 0 ? 18 : 16;
                        return <line key={i} x1={19 + Math.cos(rad)*r1} y1={19 + Math.sin(rad)*r1} x2={19 + Math.cos(rad)*r2} y2={19 + Math.sin(rad)*r2} stroke="#7B3F00" strokeWidth={i % 2 === 0 ? "1.5" : "1"} opacity=".7" />;
                      })}
                      <circle cx="19" cy="19" r="8" fill="#7B3F00" opacity=".25" />
                      <circle cx="19" cy="19" r="5" fill="#7B3F00" opacity=".4" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: i % 3 === 0 ? 0 : '50%',
                      background: i % 2 === 0 ? '#FFE082' : '#1e5f8e',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `cap${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(255,215,100,.85)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'caHintFloat 2s ease-in-out infinite',
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 200,
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
            background: 'linear-gradient(180deg, #E3F2FD 0%, #F0F8FF 30%, #E8F4FD 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="ca-r0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="30" viewBox="0 0 220 30" fill="none">
                    <line x1="0" y1="15" x2="85" y2="15" stroke="#039BE5" strokeWidth=".5" opacity=".5" />
                    <path d="M92 8 Q110 2 128 8 Q110 15 92 8Z" fill="#039BE5" opacity=".35" />
                    <circle cx="110" cy="15" r="2.5" fill="#039BE5" opacity=".6" />
                    <path d="M92 22 Q110 28 128 22 Q110 15 92 22Z" fill="#039BE5" opacity=".25" />
                    <line x1="135" y1="15" x2="220" y2="15" stroke="#039BE5" strokeWidth=".5" opacity=".5" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="ca-r1" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 28, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>Ensemble sur les flots</p>
              )}

              {isRevealing && (
                <h1 className="ca-r2 ca-azur-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>
              )}

              {isRevealing && (
                <p className="ca-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 40, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="ca-r4" style={{ marginBottom: 40 }}>
                  <svg width="220" height="22" viewBox="0 0 220 22" fill="none">
                    <line x1="0" y1="11" x2="85" y2="11" stroke="#039BE5" strokeWidth=".5" opacity=".4" />
                    <path d="M90 11 Q100 4 110 11 Q120 18 130 11" stroke="#039BE5" strokeWidth="1" fill="none" opacity=".6" />
                    <line x1="135" y1="11" x2="220" y2="11" stroke="#039BE5" strokeWidth=".5" opacity=".4" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="ca-r5" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 8, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: '#0D2B5E', letterSpacing: '.02em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="ca-r6" style={{ marginBottom: message ? 40 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 8, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>À</p>
                  <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 300, color: '#1A3A6A', lineHeight: 1.4 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="ca-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(3,155,229,.25)', borderBottom: '.5px solid rgba(3,155,229,.25)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#1A3A6A', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="ca-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid #039BE5', borderRadius: 2, color: '#0277BD', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                    onClick={() => document.getElementById('ca-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#1565C0', marginTop: 6 }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="ca-rsvp" style={{ borderTop: '.5px solid rgba(3,155,229,.22)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 8, fontFamily: "'Montserrat', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontStyle: 'italic', fontWeight: 300, color: '#0D2B5E', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(240,248,255,.85)', border: '1px solid rgba(3,155,229,.2)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#039BE5" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#90B8D8', letterSpacing: '.05em', fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#039BE5', textDecoration: 'none' }}>InstantMariage.fr</a>
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
