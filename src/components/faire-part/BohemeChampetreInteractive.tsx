'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'seal-break' | 'envelope-open' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'seal-break': 550,
  'envelope-open': 1100,
  'revealing': 2600,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'seal-break': 'envelope-open',
  'envelope-open': 'revealing',
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

const PETALS = [
  { x: '6%',  y: '-6%',  r: '22deg',  delay: '0s',    dur: '7s' },
  { x: '18%', y: '-9%',  r: '-14deg', delay: '.9s',   dur: '8s' },
  { x: '32%', y: '-4%',  r: '35deg',  delay: '1.6s',  dur: '6.5s' },
  { x: '48%', y: '-7%',  r: '-28deg', delay: '.4s',   dur: '7.5s' },
  { x: '63%', y: '-5%',  r: '17deg',  delay: '1.2s',  dur: '6.8s' },
  { x: '77%', y: '-8%',  r: '-42deg', delay: '.7s',   dur: '7.2s' },
  { x: '89%', y: '-5%',  r: '28deg',  delay: '2.1s',  dur: '6.2s' },
  { x: '12%', y: '-10%', r: '-19deg', delay: '1.8s',  dur: '8.5s' },
  { x: '56%', y: '-4%',  r: '50deg',  delay: '2.6s',  dur: '5.9s' },
  { x: '73%', y: '-7%',  r: '-33deg', delay: '3.1s',  dur: '7.8s' },
];

export default function BohemeChampetreInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('seal-break'), 1800);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'seal-break', 'envelope-open'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());

  const sealBreaking = phase === 'seal-break';
  const envelopeOpening = phase === 'envelope-open';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Lato:wght@300;400&family=Pinyon+Script&display=swap');
        .bc * { box-sizing: border-box; }

        @keyframes bcPetalFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: .85; }
          70%  { opacity: .5; }
          100% { transform: translateY(105vh) rotate(540deg) scale(.7); opacity: 0; }
        }
        @keyframes bcSealPulse {
          0%,100% { transform: scale(1); filter: drop-shadow(0 2px 6px rgba(139,79,57,.35)); }
          50%      { transform: scale(1.06); filter: drop-shadow(0 4px 12px rgba(139,79,57,.55)); }
        }
        @keyframes bcSealCrack {
          0%   { transform: scale(1) rotate(0deg); opacity: 1; }
          30%  { transform: scale(1.25) rotate(-8deg); }
          60%  { transform: scale(.9) rotate(12deg); opacity: .7; }
          100% { transform: scale(0) rotate(30deg); opacity: 0; }
        }
        @keyframes bcFlapOpen {
          0%   { transform: perspective(600px) rotateX(0deg); }
          100% { transform: perspective(600px) rotateX(-160deg); }
        }
        @keyframes bcCardRise {
          0%   { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes bcHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity: .65; }
          50%      { transform: translateX(-50%) translateY(8px); opacity: 1; }
        }
        @keyframes bcFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bcLeafSway {
          0%,100% { transform: rotate(-3deg) translateX(0); }
          50%      { transform: rotate(3deg) translateX(2px); }
        }
        @keyframes bcShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .bc-r0 { animation: bcFadeUp .75s 0s ease-out both; }
        .bc-r1 { animation: bcFadeUp .75s .22s ease-out both; }
        .bc-r2 { animation: bcFadeUp .75s .48s ease-out both; }
        .bc-r3 { animation: bcFadeUp .75s .72s ease-out both; }
        .bc-r4 { animation: bcFadeUp .75s .96s ease-out both; }
        .bc-r5 { animation: bcFadeUp .75s 1.18s ease-out both; }
        .bc-r6 { animation: bcFadeUp .75s 1.42s ease-out both; }
        .bc-r7 { animation: bcFadeUp .75s 1.68s ease-out both; }
        .bc-r8 { animation: bcFadeUp .75s 1.95s ease-out both; }
        .bc-leaf-sway { animation: bcLeafSway 4s ease-in-out infinite; }
      `}</style>

      {/* Thin botanical border frame */}
      <div aria-hidden style={{
        position: 'fixed', inset: 12,
        border: '1px solid rgba(139,99,71,0.28)',
        pointerEvents: 'none', zIndex: 9999,
        borderRadius: 2
      }} />
      <div aria-hidden style={{
        position: 'fixed', inset: 18,
        border: '1px dashed rgba(196,149,106,0.2)',
        pointerEvents: 'none', zIndex: 9999,
        borderRadius: 2
      }} />

      <div className="bc" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cormorant Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0,
        height: fixedHeight ?? undefined
      }}>

        {/* ── OPENING SCENE ── */}
        {showOpening && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(155deg, #F9F0E4 0%, #EED9C4 35%, #F5E8D5 65%, #EDD5B8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default'
            }}
            onClick={() => { if (phase === 'idle') setPhase('seal-break'); }}
          >
            {/* Falling dried botanicals */}
            {PETALS.map((p, i) => (
              <div key={i} style={{
                position: 'absolute', left: p.x, top: p.y,
                animation: `bcPetalFall ${p.dur} ${p.delay} linear infinite`,
                pointerEvents: 'none'
              }}>
                {i % 3 === 0 ? (
                  <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                    <path d="M8 2 Q12 8 8 14 Q4 8 8 2Z" fill={i % 2 === 0 ? '#B8856A' : '#C9A077'} opacity=".72" transform={`rotate(${p.r} 8 12)`} />
                    <line x1="8" y1="14" x2="8" y2="22" stroke="#8B6347" strokeWidth=".9" opacity=".5" />
                  </svg>
                ) : i % 3 === 1 ? (
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                    <path d="M1 7 Q5 1 10 7 Q15 13 19 7" stroke="#9B7A5C" strokeWidth="1.2" fill="none" opacity=".6" />
                    <path d="M4 4 Q10 0 16 4 Q10 8 4 4Z" fill="#C4956A" opacity=".35" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4" fill="none" stroke="#B8856A" strokeWidth=".8" opacity=".55" />
                    <circle cx="6" cy="6" r="1.5" fill="#C4956A" opacity=".45" />
                  </svg>
                )}
              </div>
            ))}

            {/* Corner botanical illustrations */}
            {[
              { style: { top: 24, left: 24 }, rot: '0deg' },
              { style: { top: 24, right: 24 }, rot: '90deg' },
              { style: { bottom: 24, right: 24 }, rot: '180deg' },
              { style: { bottom: 24, left: 24 }, rot: '270deg' },
            ].map((c, i) => (
              <svg key={i} width="72" height="72" viewBox="0 0 72 72"
                style={{ position: 'absolute', ...c.style, opacity: .32, transform: `rotate(${c.rot})` }}>
                <path d="M8 64 Q18 44 32 32 Q46 20 64 8" stroke="#7A5C42" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                {/* Leaves along the stem */}
                <path d="M20 52 Q12 44 16 38 Q22 42 20 52Z" fill="#8A7A5A" opacity=".55" />
                <path d="M30 38 Q22 30 28 24 Q34 28 30 38Z" fill="#9B7A5C" opacity=".5" />
                <path d="M44 24 Q38 16 42 10 Q48 14 44 24Z" fill="#B8856A" opacity=".4" />
                {/* Small flowers */}
                <circle cx="18" cy="45" r="2.5" fill="#D4A882" opacity=".45" />
                <circle cx="30" cy="31" r="2" fill="#C4956A" opacity=".4" />
                <circle cx="44" cy="17" r="1.8" fill="#B8856A" opacity=".4" />
              </svg>
            ))}

            {/* Envelope */}
            <div style={{ position: 'relative', width: 'min(84vw, 360px)' }}>
              {/* Envelope body */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(180deg, #F5EAD8 0%, #EDD9C0 100%)',
                borderRadius: 6,
                border: '1px solid rgba(196,149,106,.45)',
                boxShadow: '0 16px 48px rgba(92,61,46,.22), 0 4px 12px rgba(92,61,46,.12)',
                overflow: 'hidden',
                paddingTop: '65%'
              }}>
                {/* Envelope interior */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(160deg, #F9F2E8 0%, #F0E0C8 100%)'
                }} />

                {/* Inner lines pattern */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .15 }}
                  viewBox="0 0 360 235" preserveAspectRatio="xMidYMid slice">
                  <line x1="0" y1="0" x2="180" y2="117" stroke="#8B6347" strokeWidth=".8" />
                  <line x1="360" y1="0" x2="180" y2="117" stroke="#8B6347" strokeWidth=".8" />
                </svg>

                {/* Card rising from envelope */}
                {(envelopeOpening || sealBreaking) && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '10%', right: '10%',
                    animation: envelopeOpening ? 'bcCardRise .9s .15s ease-out both' : undefined,
                    opacity: envelopeOpening ? undefined : 0
                  }}>
                    <div style={{
                      background: 'linear-gradient(160deg, #FDF8F0 0%, #F5ECD8 100%)',
                      border: '1px solid rgba(196,149,106,.3)',
                      borderRadius: '4px 4px 0 0',
                      padding: '22px 20px 28px',
                      textAlign: 'center',
                      boxShadow: '0 -8px 24px rgba(92,61,46,.1)'
                    }}>
                      <p style={{ fontSize: 8, letterSpacing: '.32em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 10, fontFamily: "'Lato', sans-serif" }}>
                        Faire-part de mariage
                      </p>
                      <p style={{
                        fontSize: 'clamp(1.2rem, 6vw, 1.7rem)',
                        fontStyle: 'italic', fontWeight: 400,
                        color: '#4A3228', lineHeight: 1.2,
                        fontFamily: "'Pinyon Script', cursive"
                      }}>{coupleNames}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                        <div style={{ height: .5, width: 36, background: '#C4956A', opacity: .6 }} />
                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1L6.2 4H9.5L7 6.2L7.9 9.5L5 7.5L2.1 9.5L3 6.2L.5 4H3.8Z" fill="#C4956A" opacity=".7" /></svg>
                        <div style={{ height: .5, width: 36, background: '#C4956A', opacity: .6 }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Envelope flap */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  transformOrigin: 'top center',
                  animation: envelopeOpening ? 'bcFlapOpen 1s ease-in-out forwards' : undefined,
                  zIndex: 3
                }}>
                  <svg width="100%" viewBox="0 0 360 120" preserveAspectRatio="none">
                    <path d="M0 0 L360 0 L180 110 Z"
                      fill="url(#flapGrad)" stroke="rgba(196,149,106,.3)" strokeWidth=".8" />
                    <defs>
                      <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EDD9C0" />
                        <stop offset="100%" stopColor="#E2C9A8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Wax seal */}
                <div style={{
                  position: 'absolute', top: '42%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 4,
                  animation: phase === 'idle' ? 'bcSealPulse 2.5s ease-in-out infinite' : sealBreaking ? 'bcSealCrack .5s ease-in forwards' : 'none'
                }}>
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    {/* Seal background */}
                    <circle cx="28" cy="28" r="26" fill="#8B4513" />
                    <circle cx="28" cy="28" r="24" fill="#9B5523" />
                    <circle cx="28" cy="28" r="22" fill="#7A3E12" opacity=".6" />
                    {/* Seal edge serration */}
                    {Array.from({ length: 16 }, (_, i) => {
                      const angle = (i * 360) / 16;
                      const rad = (angle * Math.PI) / 180;
                      const x1 = 28 + 22 * Math.cos(rad);
                      const y1 = 28 + 22 * Math.sin(rad);
                      const x2 = 28 + 26 * Math.cos(rad);
                      const y2 = 28 + 26 * Math.sin(rad);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C4956A" strokeWidth=".8" opacity=".5" />;
                    })}
                    {/* Monogram area */}
                    <circle cx="28" cy="28" r="16" fill="none" stroke="#C4956A" strokeWidth=".6" opacity=".4" />
                    {/* Botanical in seal */}
                    <path d="M28 16 Q32 20 28 26 Q24 20 28 16Z" fill="#D4A882" opacity=".7" />
                    <path d="M28 26 L28 38" stroke="#C4956A" strokeWidth=".8" opacity=".5" />
                    <path d="M22 30 Q28 26 34 30" stroke="#C4956A" strokeWidth=".8" fill="none" opacity=".5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hint */}
            {phase === 'idle' && (
              <div style={{
                position: 'absolute', bottom: 52, left: '50%',
                color: 'rgba(139,99,71,.75)', fontSize: 11,
                fontFamily: "'Lato', sans-serif", letterSpacing: '.12em',
                fontStyle: 'italic', whiteSpace: 'nowrap',
                animation: 'bcHintFloat 2.2s ease-in-out infinite',
                textAlign: 'center'
              }}>
                ✦ Brisez le cachet pour ouvrir ✦
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #FDF7EE 0%, #F5EAD8 30%, #FBF4EA 65%, #F0E4CE 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 440, margin: '0 auto', padding: '80px 32px 108px', textAlign: 'center' }}>

              {/* Top ornament */}
              <div className="bc-r0" style={{ marginBottom: 32 }}>
                <svg width="280" height="52" viewBox="0 0 280 52" fill="none">
                  <line x1="0" y1="26" x2="96" y2="26" stroke="#C4956A" strokeWidth=".5" opacity=".6" />
                  {/* Center botanical cluster */}
                  <path d="M108 20 Q120 10 132 18 Q140 10 148 18 Q160 10 172 20" stroke="#9B7A5C" strokeWidth=".9" fill="none" />
                  <path d="M118 16 Q120 8 124 12" stroke="#C4956A" strokeWidth=".7" fill="none" />
                  <ellipse cx="120" cy="14" rx="4.5" ry="3" fill="#C4956A" opacity=".38" transform="rotate(-20 120 14)" />
                  <path d="M136 14 Q140 6 144 10" stroke="#C4956A" strokeWidth=".7" fill="none" />
                  <ellipse cx="140" cy="10" rx="4" ry="2.5" fill="#C4956A" opacity=".42" />
                  <path d="M152 16 Q156 8 160 12" stroke="#C4956A" strokeWidth=".7" fill="none" />
                  <ellipse cx="158" cy="14" rx="4.5" ry="3" fill="#C4956A" opacity=".38" transform="rotate(20 158 14)" />
                  {/* Small dots */}
                  <circle cx="104" cy="26" r="1.5" fill="#C4956A" opacity=".5" />
                  <circle cx="176" cy="26" r="1.5" fill="#C4956A" opacity=".5" />
                  <line x1="184" y1="26" x2="280" y2="26" stroke="#C4956A" strokeWidth=".5" opacity=".6" />
                </svg>
              </div>

              <p className="bc-r1" style={{
                fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase',
                color: '#9B7A5C', marginBottom: 28,
                fontFamily: "'Lato', sans-serif", fontWeight: 300
              }}>
                Nous avons l&rsquo;immense joie de vous convier
              </p>

              <h1 className="bc-r2" style={{
                fontSize: 'clamp(2.8rem, 10vw, 4rem)',
                fontWeight: 400, fontStyle: 'italic',
                color: '#4A2E1A',
                lineHeight: 1.05, marginBottom: 4,
                fontFamily: "'Pinyon Script', cursive",
                letterSpacing: '.02em'
              }}>{coupleNames}</h1>

              <p className="bc-r3" style={{
                fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase',
                color: '#9B7A5C', marginBottom: 36,
                fontFamily: "'Lato', sans-serif", fontWeight: 300
              }}>
                vous invitent à célébrer leur union
              </p>

              {/* Divider with leaves */}
              <div className="bc-r4" style={{ marginBottom: 36 }}>
                <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
                  <line x1="0" y1="12" x2="82" y2="12" stroke="#C4956A" strokeWidth=".5" opacity=".5" />
                  <path d="M88 6 Q100 12 112 6 Q100 0 88 6Z" fill="#C4956A" opacity=".28" />
                  <path d="M108 18 Q120 12 132 18 Q120 24 108 18Z" fill="#C4956A" opacity=".22" />
                  <circle cx="110" cy="12" r="2.5" fill="none" stroke="#C4956A" strokeWidth=".7" opacity=".5" />
                  <line x1="138" y1="12" x2="220" y2="12" stroke="#C4956A" strokeWidth=".5" opacity=".5" />
                </svg>
              </div>

              <div className="bc-r5" style={{
                marginBottom: 22,
                padding: '18px 24px',
                background: 'rgba(255,248,238,.7)',
                border: '1px solid rgba(196,149,106,.2)',
                borderRadius: 2
              }}>
                <p style={{
                  fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase',
                  color: '#9B7A5C', marginBottom: 8,
                  fontFamily: "'Lato', sans-serif", fontWeight: 300
                }}>Le</p>
                <p style={{
                  fontSize: 'clamp(1.25rem, 5.5vw, 1.7rem)',
                  color: '#4A3228', letterSpacing: '.04em', fontWeight: 400
                }}>{date}</p>
              </div>

              <div className="bc-r6" style={{ marginBottom: message ? 36 : 48 }}>
                <p style={{
                  fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase',
                  color: '#9B7A5C', marginBottom: 8,
                  fontFamily: "'Lato', sans-serif", fontWeight: 300
                }}>À</p>
                <p style={{
                  fontSize: 'clamp(1rem, 4.5vw, 1.3rem)',
                  fontStyle: 'italic', color: '#6B5040', lineHeight: 1.45
                }}>{lieu}</p>
              </div>

              {message && (
                <div className="bc-r7" style={{
                  marginBottom: 44,
                  padding: '22px 28px',
                  background: 'rgba(255,248,238,.6)',
                  borderTop: '.5px solid rgba(196,149,106,.28)',
                  borderBottom: '.5px solid rgba(196,149,106,.28)'
                }}>
                  <svg width="20" height="14" viewBox="0 0 20 14" style={{ marginBottom: 10, opacity: .4 }}>
                    <path d="M0 14 L0 8 Q0 0 8 0 L8 4 Q4 4 4 8 L4 14 Z" fill="#9B7A5C" />
                    <path d="M12 14 L12 8 Q12 0 20 0 L20 4 Q16 4 16 8 L16 14 Z" fill="#9B7A5C" />
                  </svg>
                  <p style={{
                    fontSize: 'clamp(.9rem, 3.8vw, 1.05rem)',
                    fontStyle: 'italic', color: '#6B5040', lineHeight: 1.75
                  }}>{message}</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="bc-r8" style={{ marginBottom: 48 }}>
                  <button
                    style={{
                      display: 'inline-block', padding: '13px 38px',
                      border: '1px solid #C4956A', borderRadius: 2,
                      color: '#8B6347', fontSize: 10, letterSpacing: '.18em',
                      textTransform: 'uppercase', cursor: 'pointer',
                      fontFamily: "'Lato', sans-serif", fontWeight: 400,
                      background: 'transparent', transition: 'all .25s'
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(196,149,106,.1)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
                    onClick={() => document.getElementById('bc-rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Confirmer ma présence
                  </button>
                  {rsvpDeadline && (
                    <p style={{
                      fontSize: 11, color: '#9B7A5C', marginTop: 8,
                      fontFamily: "'Lato', sans-serif", fontStyle: 'italic'
                    }}>
                      Réponse souhaitée avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {/* Bottom botanical ornament */}
              <div style={{ marginBottom: 60 }}>
                <svg width="240" height="40" viewBox="0 0 240 40" fill="none">
                  <path d="M20 20 Q60 8 120 20 Q180 32 220 20" stroke="#C4956A" strokeWidth=".7" fill="none" opacity=".55" />
                  <path d="M60 15 Q65 8 70 12 Q65 16 60 15Z" fill="#C4956A" opacity=".28" />
                  <path d="M110 18 Q120 10 130 18 Q120 26 110 18Z" fill="#C4956A" opacity=".22" />
                  <path d="M170 25 Q175 18 180 22 Q175 28 170 25Z" fill="#C4956A" opacity=".28" />
                  <circle cx="120" cy="20" r="3" fill="none" stroke="#C4956A" strokeWidth=".6" opacity=".4" />
                </svg>
              </div>

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="bc-rsvp" style={{
                  borderTop: '.5px solid rgba(196,149,106,.25)',
                  paddingTop: 56, marginTop: 16
                }}>
                  <p style={{
                    fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase',
                    color: '#9B7A5C', marginBottom: 6,
                    fontFamily: "'Lato', sans-serif"
                  }}>Je réponds</p>
                  <p style={{
                    fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)',
                    fontStyle: 'italic', color: '#4A3228', marginBottom: 26,
                    fontFamily: "'Pinyon Script', cursive"
                  }}>Confirmer ma présence</p>
                  <div style={{
                    background: 'rgba(253,248,240,.9)',
                    border: '1px solid rgba(196,149,106,.25)',
                    borderRadius: 6, padding: '28px 20px'
                  }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#9B7A5C" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 60, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#B8967A', letterSpacing: '.05em', fontFamily: "'Lato', sans-serif" }}>
                    Faire-part créé avec{' '}
                    <a href="https://instantmariage.fr" style={{ color: '#C4956A', textDecoration: 'none' }}>InstantMariage.fr</a>
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
