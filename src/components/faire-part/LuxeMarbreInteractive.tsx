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

export default function LuxeMarbreInteractive({
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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&display=swap');
        .lm * { box-sizing: border-box; }

        @keyframes lmSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.7; transform:scale(1) rotate(180deg); }
        }
        @keyframes lmSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,.55), 0 4px 24px rgba(0,0,0,.6); }
          50%      { box-shadow: 0 0 0 12px rgba(201,168,76,0), 0 4px 36px rgba(201,168,76,.4); }
        }
        @keyframes lmSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.2) rotate(-6deg); filter:brightness(1.8); }
          60%  { transform: translate(-50%,-50%) scale(1.4) rotate(12deg); opacity:.8; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes lmp1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes lmp2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes lmp3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes lmp4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes lmp5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes lmp6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes lmp7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes lmp8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes lmFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes lmEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes lmHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes lmFadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lmGoldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        .lm-r0 { animation: lmFadeUp .75s 0s ease-out both; }
        .lm-r1 { animation: lmFadeUp .75s .22s ease-out both; }
        .lm-r2 { animation: lmFadeUp .75s .44s ease-out both; }
        .lm-r3 { animation: lmFadeUp .75s .66s ease-out both; }
        .lm-r4 { animation: lmFadeUp .75s .88s ease-out both; }
        .lm-r5 { animation: lmFadeUp .75s 1.1s ease-out both; }
        .lm-r6 { animation: lmFadeUp .75s 1.35s ease-out both; }
        .lm-r7 { animation: lmFadeUp .75s 1.6s ease-out both; }
        .lm-gold-text {
          background: linear-gradient(120deg, #8B6914 0%, #C9A84C 30%, #F0D080 50%, #C9A84C 70%, #8B6914 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lmGoldShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="lm" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cinzel', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, #0E0E0E 0%, #1A1A1A 55%, #0A0A0A 100%)',
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
                animation: `lmSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'lmEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(201,168,76,.5)', fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 300, letterSpacing: '.04em' }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope — marbled dark gray */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'lmEnvIn .8s .2s ease-out both' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #2E2E2E 0%, #252525 40%, #1C1C1C 100%)',
                borderRadius: 12,
                border: '1.5px solid #C9A84C',
                boxShadow: '0 12px 48px rgba(0,0,0,.7), 0 2px 8px rgba(201,168,76,.2)',
                overflow: 'hidden',
              }}>
                {/* Marble veins */}
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0, opacity: .18 }}>
                  <path d="M0 70 Q110 50 220 90 Q330 130 440 80" stroke="white" strokeWidth="1.5" fill="none" />
                  <path d="M0 180 Q120 155 240 200 Q340 240 440 170" stroke="white" strokeWidth="1" fill="none" />
                  <path d="M60 0 Q80 80 65 160 Q50 240 80 284" stroke="white" strokeWidth=".8" fill="none" />
                  <path d="M380 0 Q355 90 370 180 Q385 250 360 284" stroke="white" strokeWidth=".7" fill="none" />
                  <path d="M0 284" stroke="white" strokeWidth=".6" fill="none" />
                  {/* Gold fold lines */}
                  <line x1="0" y1="284" x2="220" y2="142" stroke="#C9A84C" strokeWidth=".6" opacity=".35" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="#C9A84C" strokeWidth=".6" opacity=".35" />
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'lmFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #303030 0%, #252525 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid #C9A84C',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #1C1C1C 0%, #141414 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — brilliant gold */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, #FFE57A 0%, #C9A84C 45%, #8B6914 100%)',
                    border: '2.5px solid rgba(255,229,122,.4)',
                    boxShadow: '0 0 16px rgba(201,168,76,.5)',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'lmSealPulse 2.2s ease-in-out infinite' : 'lmSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(26,26,26,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Crown / monogram motif */}
                    <svg width="38" height="32" viewBox="0 0 38 32" fill="none">
                      <path d="M4 24 L4 14 L10 20 L19 8 L28 20 L34 14 L34 24 Z" stroke="#1a1a1a" strokeWidth="1.4" fill="rgba(26,26,26,.2)" strokeLinejoin="round" opacity=".8" />
                      <line x1="4" y1="26" x2="34" y2="26" stroke="#1a1a1a" strokeWidth="1.2" opacity=".7" />
                      <circle cx="10" cy="12" r="2" fill="#1a1a1a" opacity=".55" />
                      <circle cx="19" cy="6" r="2.5" fill="#1a1a1a" opacity=".6" />
                      <circle cx="28" cy="12" r="2" fill="#1a1a1a" opacity=".55" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: i % 3 === 0 ? 0 : '50%',
                      background: '#C9A84C',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `lmp${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(201,168,76,.8)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'lmHintFloat 2s ease-in-out infinite',
                  fontFamily: "'Cormorant Garamond', serif",
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
            background: 'linear-gradient(160deg, #FEFCF7 0%, #F8F4EC 50%, #FEFCF7 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ width: '100%', maxWidth: 420, padding: '72px 28px 100px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="lm-r0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="36" viewBox="0 0 220 36" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="18" x2="88" y2="18" stroke="#C9A84C" strokeWidth=".6" opacity=".6" />
                    <polygon points="100,10 110,18 100,26 90,18" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".8" />
                    <circle cx="110" cy="18" r="2" fill="#C9A84C" />
                    <polygon points="120,10 130,18 120,26 110,18" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".8" />
                    <line x1="130" y1="18" x2="220" y2="18" stroke="#C9A84C" strokeWidth=".6" opacity=".6" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="lm-r1" style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 28, fontFamily: "'Cinzel', serif" }}>Mariage</p>
              )}

              {isRevealing && (
                <h1 className="lm-r2 lm-gold-text" style={{ fontSize: 'clamp(2.4rem, 9vw, 3.5rem)', fontWeight: 300, letterSpacing: '.04em', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>
              )}

              {isRevealing && (
                <p className="lm-r3" style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 40 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="lm-r4" style={{ marginBottom: 40 }}>
                  <svg width="260" height="22" viewBox="0 0 260 22" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="11" x2="105" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                    <path d="M115 5 L125 11 L115 17 L105 11 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" />
                    <circle cx="130" cy="11" r="2.5" fill="#C9A84C" opacity=".7" />
                    <path d="M145 5 L155 11 L145 17 L135 11 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" />
                    <line x1="155" y1="11" x2="260" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="lm-r5" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 8 }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#2C1810', letterSpacing: '.03em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="lm-r6" style={{ marginBottom: message ? 40 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 8 }}>À</p>
                  <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, color: '#4A3728', lineHeight: 1.4 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="lm-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(201,168,76,.3)', borderBottom: '.5px solid rgba(201,168,76,.3)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#6B5744', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="lm-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 36px', border: '1px solid #C9A84C', color: '#8B6914', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer' }}
                    onClick={() => document.getElementById('lm-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#9B8A6E', marginTop: 6, fontFamily: "'Cormorant Garamond', serif" }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="lm-rsvp" style={{ borderTop: '.5px solid rgba(201,168,76,.22)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 8 }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, color: '#2C1810', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(254,252,247,.85)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 12, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#C9A84C" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#BBA890', letterSpacing: '.05em', fontFamily: "'Cormorant Garamond', serif" }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#C9A84C', textDecoration: 'none' }}>InstantMariage.fr</a>
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
