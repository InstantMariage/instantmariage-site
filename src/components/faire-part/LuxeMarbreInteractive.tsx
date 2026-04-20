'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'crack-spread' | 'shatter' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'crack-spread': 1400,
  'shatter': 700,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'crack-spread': 'shatter',
  'shatter': 'revealing',
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

const GOLD_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: `${5 + (i * 4.8) % 90}%`,
  y: `${5 + (i * 7.3) % 88}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.22).toFixed(1)}s`,
  dur: `${2.5 + (i * 0.18)}s`,
}));

export default function LuxeMarbreInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('crack-spread'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'crack-spread', 'shatter'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());
  const isCracking = phase === 'crack-spread';
  const isShatter = phase === 'shatter';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&display=swap');
        .lm * { box-sizing: border-box; }
        @keyframes lmGoldPulse {
          0%,100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50%      { opacity: .7; transform: scale(1) rotate(180deg); }
        }
        @keyframes lmMonogramPulse {
          0%,100% { filter: brightness(1); }
          50%      { filter: brightness(1.4); }
        }
        @keyframes lmHint {
          0%,100% { opacity: .55; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 1; transform: translateX(-50%) translateY(5px); }
        }
        @keyframes lmCrack {
          from { stroke-dashoffset: 1000; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes lmShatterTL { to { transform: translate(-55vw,-55vh) rotate(-15deg); opacity: 0; } }
        @keyframes lmShatterTR { to { transform: translate(55vw,-55vh) rotate(15deg); opacity: 0; } }
        @keyframes lmShatterBL { to { transform: translate(-55vw,55vh) rotate(-10deg); opacity: 0; } }
        @keyframes lmShatterBR { to { transform: translate(55vw,55vh) rotate(10deg); opacity: 0; } }
        @keyframes lmShatterT  { to { transform: translateY(-60vh) rotate(5deg); opacity: 0; } }
        @keyframes lmShatterB  { to { transform: translateY(60vh) rotate(-5deg); opacity: 0; } }
        @keyframes lmFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
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

      <div className="lm" style={{ position: 'relative', width: '100%', fontFamily: "'Cinzel', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('crack-spread'); }}>

            {/* Marble panels — shatter apart */}
            {(['TL', 'TR', 'BL', 'BR', 'T', 'B'] as const).map((pos) => {
              const clips: Record<string, string> = {
                TL: 'polygon(0 0, 55% 0, 45% 55%, 0 45%)',
                TR: 'polygon(45% 0, 100% 0, 100% 45%, 55% 55%)',
                BL: 'polygon(0 55%, 45% 45%, 55% 100%, 0 100%)',
                BR: 'polygon(55% 45%, 100% 55%, 100% 100%, 45% 100%)',
                T: 'polygon(45% 0, 55% 0, 55% 55%, 45% 55%)',
                B: 'polygon(45% 45%, 55% 45%, 55% 100%, 45% 100%)',
              };
              const anims: Record<string, string> = {
                TL: 'lmShatterTL', TR: 'lmShatterTR', BL: 'lmShatterBL',
                BR: 'lmShatterBR', T: 'lmShatterT', B: 'lmShatterB',
              };
              return (
                <div key={pos} style={{
                  position: 'absolute', inset: 0,
                  background: `
                    radial-gradient(ellipse at 20% 30%, rgba(255,255,255,.04) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 70%, rgba(255,255,255,.03) 0%, transparent 60%),
                    linear-gradient(145deg, #1C1C1C 0%, #2A2A2A 30%, #1A1A1A 55%, #222 80%, #181818 100%)
                  `,
                  clipPath: clips[pos],
                  animation: isShatter ? `${anims[pos]} .65s ease-in forwards` : undefined,
                }}>
                  {/* Marble veins */}
                  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: .12 }} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                    <path d="M0 120 Q200 80 400 160 Q600 240 800 180" stroke="white" strokeWidth="1.5" fill="none" />
                    <path d="M0 300 Q180 260 380 340 Q560 420 800 360" stroke="white" strokeWidth="1" fill="none" />
                    <path d="M100 0 Q160 150 120 300 Q80 450 140 600" stroke="white" strokeWidth=".8" fill="none" />
                    <path d="M650 0 Q580 180 640 380 Q700 540 620 600" stroke="white" strokeWidth=".8" fill="none" />
                    <path d="M0 480 Q300 430 500 500 Q700 570 800 480" stroke="white" strokeWidth=".6" fill="none" />
                  </svg>
                </div>
              );
            })}

            {/* Gold particles */}
            {GOLD_PARTICLES.map((p, i) => (
              <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size, borderRadius: i % 4 === 0 ? 0 : '50%', background: '#C9A84C', animation: `lmGoldPulse ${p.dur} ${p.delay} ease-in-out infinite`, zIndex: 2 }} />
            ))}

            {/* Center monogram */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, pointerEvents: 'none' }}>
              <div style={{ animation: phase === 'idle' ? 'lmMonogramPulse 3s ease-in-out infinite' : undefined }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".6" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#C9A84C" strokeWidth=".4" opacity=".35" />
                  <path d="M25 55 L25 25 L40 48 L55 25 L55 55" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {phase === 'idle' && (
                <>
                  <p style={{ color: 'rgba(201,168,76,.7)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 18, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>{coupleNames}</p>
                  <p style={{ position: 'absolute', bottom: '14%', left: '50%', color: 'rgba(201,168,76,.5)', fontSize: 11, letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'lmHint 2.2s ease-in-out infinite', fontFamily: "'Cormorant Garamond', serif" }}>
                    ✦ Touchez le monogramme ✦
                  </p>
                </>
              )}
            </div>

            {/* Crack lines SVG (appear during crack-spread) */}
            {isCracking && (
              <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, zIndex: 4 }}>
                <path d="M400 300 L340 220 L280 180 L200 160" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeDasharray="300" style={{ animation: 'lmCrack .6s .0s ease-out forwards', strokeDashoffset: 300, opacity: 0 }} />
                <path d="M400 300 L460 210 L520 170 L600 130" stroke="#C9A84C" strokeWidth="1" fill="none" strokeDasharray="280" style={{ animation: 'lmCrack .6s .1s ease-out forwards', strokeDashoffset: 280, opacity: 0 }} />
                <path d="M400 300 L350 370 L300 440 L240 520" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeDasharray="290" style={{ animation: 'lmCrack .6s .15s ease-out forwards', strokeDashoffset: 290, opacity: 0 }} />
                <path d="M400 300 L460 380 L510 460 L560 560" stroke="#C9A84C" strokeWidth="1" fill="none" strokeDasharray="300" style={{ animation: 'lmCrack .6s .2s ease-out forwards', strokeDashoffset: 300, opacity: 0 }} />
                <path d="M400 300 L480 295 L580 290 L720 285" stroke="#C9A84C" strokeWidth=".8" fill="none" strokeDasharray="320" style={{ animation: 'lmCrack .6s .25s ease-out forwards', strokeDashoffset: 320, opacity: 0 }} />
                <path d="M400 300 L320 298 L200 294 L80 290" stroke="#C9A84C" strokeWidth=".8" fill="none" strokeDasharray="320" style={{ animation: 'lmCrack .6s .3s ease-out forwards', strokeDashoffset: 320, opacity: 0 }} />
              </svg>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(160deg, #FEFCF7 0%, #F8F4EC 50%, #FEFCF7 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              <div className="lm-r0" style={{ marginBottom: 28 }}>
                <svg width="220" height="36" viewBox="0 0 220 36" fill="none">
                  <line x1="0" y1="18" x2="88" y2="18" stroke="#C9A84C" strokeWidth=".6" opacity=".6" />
                  <polygon points="100,10 110,18 100,26 90,18" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".8" />
                  <circle cx="110" cy="18" r="2" fill="#C9A84C" />
                  <polygon points="120,10 130,18 120,26 110,18" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".8" />
                  <line x1="130" y1="18" x2="220" y2="18" stroke="#C9A84C" strokeWidth=".6" opacity=".6" />
                </svg>
              </div>

              <p className="lm-r1" style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 28, fontFamily: "'Cinzel', serif" }}>Mariage</p>

              <h1 className={`lm-r2 lm-gold-text`} style={{ fontSize: 'clamp(2.4rem, 9vw, 3.5rem)', fontWeight: 300, letterSpacing: '.04em', lineHeight: 1.1, marginBottom: 6, fontStyle: 'normal' }}>{coupleNames}</h1>

              <p className="lm-r3" style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 40 }}>vous invitent à leur mariage</p>

              <div className="lm-r4" style={{ marginBottom: 40 }}>
                <svg width="260" height="22" viewBox="0 0 260 22" fill="none">
                  <line x1="0" y1="11" x2="105" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                  <path d="M115 5 L125 11 L115 17 L105 11 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" />
                  <circle cx="130" cy="11" r="2.5" fill="#C9A84C" opacity=".7" />
                  <path d="M145 5 L155 11 L145 17 L135 11 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" />
                  <line x1="155" y1="11" x2="260" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                </svg>
              </div>

              <div className="lm-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 8 }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#2C1810', letterSpacing: '.03em' }}>{date}</p>
              </div>

              <div className="lm-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#9B8A6E', marginBottom: 8 }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, color: '#4A3728', lineHeight: 1.4 }}>{lieu}</p>
              </div>

              {message && (
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
