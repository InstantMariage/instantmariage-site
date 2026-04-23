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
  'revealing': 2600,
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

export default function BohemeChampetreInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [clipExpanded, setClipExpanded] = useState(false);

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('seal-burst'), 1800);
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Lato:wght@300;400&family=Pinyon+Script&display=swap');
        .bc * { box-sizing: border-box; }

        @keyframes bcSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.55; transform:scale(1) rotate(180deg); }
        }
        @keyframes bcSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(198,106,58,.5), 0 4px 24px rgba(0,0,0,.45); }
          50%      { box-shadow: 0 0 0 11px rgba(198,106,58,0), 0 4px 32px rgba(198,106,58,.35); }
        }
        @keyframes bcSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.5); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes bcp1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes bcp2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes bcp3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes bcp4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes bcp5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes bcp6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes bcp7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes bcp8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes bcFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes bcEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes bcHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes bcFadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes bcLeafSway {
          0%,100% { transform: rotate(-3deg) translateX(0); }
          50%      { transform: rotate(3deg) translateX(2px); }
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

      {/* Botanical border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 12, border: '1px solid rgba(139,99,71,0.28)', pointerEvents: 'none', zIndex: 9999, borderRadius: 2 }} />
      <div aria-hidden style={{ position: 'fixed', inset: 18, border: '1px dashed rgba(196,149,106,0.2)', pointerEvents: 'none', zIndex: 9999, borderRadius: 2 }} />

      <div className="bc" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cormorant Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, #2C1A0A 0%, #3E2510 55%, #241508 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Background botanical sparkles */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
                background: i % 2 === 0 ? '#c4a882' : '#c66a3a',
                borderRadius: i % 4 === 0 ? 0 : '50%',
                left: `${8 + (i * 6.2) % 86}%`,
                top: `${4 + (i * 11.3) % 92}%`,
                animation: `bcSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {/* Title hint */}
            {phase === 'idle' && (
              <div style={{
                textAlign: 'center',
                animation: 'bcEnvIn 1s .6s ease-out both', opacity: 0,
                marginBottom: 40, pointerEvents: 'none',
              }}>
                <p style={{ color: 'rgba(196,168,130,.6)', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(253,243,228,.85)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontStyle: 'italic', fontWeight: 300, fontFamily: "'Pinyon Script', cursive" }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'bcEnvIn .8s .2s ease-out both' }}>
              {/* Body */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #D4BA96 0%, #C4A882 40%, #B89870 100%)',
                borderRadius: 12,
                border: '1.5px solid #c66a3a',
                boxShadow: '0 12px 48px rgba(0,0,0,.55), 0 2px 8px rgba(198,106,58,.18)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="#c66a3a" strokeWidth=".6" opacity=".3" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="#c66a3a" strokeWidth=".6" opacity=".3" />
                  {/* Subtle kraft texture lines */}
                  <line x1="0" y1="80" x2="440" y2="80" stroke="#a07848" strokeWidth=".3" opacity=".12" />
                  <line x1="0" y1="160" x2="440" y2="160" stroke="#a07848" strokeWidth=".3" opacity=".1" />
                  <line x1="0" y1="240" x2="440" y2="240" stroke="#a07848" strokeWidth=".3" opacity=".08" />
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'bcFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #C8A878 0%, #B89060 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid #c66a3a',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #A08050 0%, #8B6A38 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — terracotta */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #d4784a 0%, #c66a3a 55%, #8B4010 100%)',
                    border: '2.5px solid #c4a882',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'bcSealPulse 2.2s ease-in-out infinite' : 'bcSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(196,168,130,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Botanical leaf motif */}
                    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                      <path d="M17 6 Q22 11 17 18 Q12 11 17 6Z" fill="#D4A882" opacity=".85" />
                      <path d="M17 18 L17 28" stroke="#C4956A" strokeWidth="1" opacity=".7" />
                      <path d="M12 22 Q17 18 22 22" stroke="#C4956A" strokeWidth=".8" fill="none" opacity=".6" />
                      <path d="M10 15 Q14 12 17 15" stroke="#C4956A" strokeWidth=".7" fill="none" opacity=".5" />
                      <path d="M17 15 Q20 12 24 15" stroke="#C4956A" strokeWidth=".7" fill="none" opacity=".5" />
                      <circle cx="17" cy="5" r="1.5" fill="#D4A882" opacity=".6" />
                      <circle cx="17" cy="29" r="1.2" fill="#C4956A" opacity=".5" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: i % 3 === 0 ? '50%' : 2,
                      background: i % 2 === 0 ? '#c4a882' : '#c66a3a',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `bcp${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {/* Tap hint */}
              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(198,106,58,.8)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'bcHintFloat 2s ease-in-out infinite',
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
            background: 'linear-gradient(180deg, #FDF7EE 0%, #F5EAD8 30%, #FBF4EA 65%, #F0E4CE 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ width: '100%', maxWidth: 440, padding: '80px 32px 108px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="bc-r0" style={{ marginBottom: 32 }}>
                  <svg width="280" height="52" viewBox="0 0 280 52" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="26" x2="96" y2="26" stroke="#C4956A" strokeWidth=".5" opacity=".6" />
                    <path d="M108 20 Q120 10 132 18 Q140 10 148 18 Q160 10 172 20" stroke="#9B7A5C" strokeWidth=".9" fill="none" />
                    <path d="M118 16 Q120 8 124 12" stroke="#C4956A" strokeWidth=".7" fill="none" />
                    <ellipse cx="120" cy="14" rx="4.5" ry="3" fill="#C4956A" opacity=".38" transform="rotate(-20 120 14)" />
                    <path d="M136 14 Q140 6 144 10" stroke="#C4956A" strokeWidth=".7" fill="none" />
                    <ellipse cx="140" cy="10" rx="4" ry="2.5" fill="#C4956A" opacity=".42" />
                    <path d="M152 16 Q156 8 160 12" stroke="#C4956A" strokeWidth=".7" fill="none" />
                    <ellipse cx="158" cy="14" rx="4.5" ry="3" fill="#C4956A" opacity=".38" transform="rotate(20 158 14)" />
                    <circle cx="104" cy="26" r="1.5" fill="#C4956A" opacity=".5" />
                    <circle cx="176" cy="26" r="1.5" fill="#C4956A" opacity=".5" />
                    <line x1="184" y1="26" x2="280" y2="26" stroke="#C4956A" strokeWidth=".5" opacity=".6" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="bc-r1" style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 28, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  Nous avons l&rsquo;immense joie de vous convier
                </p>
              )}

              {isRevealing && (
                <h1 className="bc-r2" style={{ fontSize: 'clamp(2.8rem, 10vw, 4rem)', fontWeight: 400, fontStyle: 'italic', color: '#4A2E1A', lineHeight: 1.05, marginBottom: 4, fontFamily: "'Pinyon Script', cursive", letterSpacing: '.02em' }}>
                  {coupleNames}
                </h1>
              )}

              {isRevealing && (
                <p className="bc-r3" style={{ fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 36, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  vous invitent à célébrer leur union
                </p>
              )}

              {isRevealing && (
                <div className="bc-r4" style={{ marginBottom: 36 }}>
                  <svg width="220" height="24" viewBox="0 0 220 24" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="12" x2="82" y2="12" stroke="#C4956A" strokeWidth=".5" opacity=".5" />
                    <path d="M88 6 Q100 12 112 6 Q100 0 88 6Z" fill="#C4956A" opacity=".28" />
                    <path d="M108 18 Q120 12 132 18 Q120 24 108 18Z" fill="#C4956A" opacity=".22" />
                    <circle cx="110" cy="12" r="2.5" fill="none" stroke="#C4956A" strokeWidth=".7" opacity=".5" />
                    <line x1="138" y1="12" x2="220" y2="12" stroke="#C4956A" strokeWidth=".5" opacity=".5" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="bc-r5" style={{ marginBottom: 22, padding: '18px 24px', background: 'rgba(255,248,238,.7)', border: '1px solid rgba(196,149,106,.2)', borderRadius: 2 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 8, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.25rem, 5.5vw, 1.7rem)', color: '#4A3228', letterSpacing: '.04em', fontWeight: 400 }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="bc-r6" style={{ marginBottom: message ? 36 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 8, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>À</p>
                  <p style={{ fontSize: 'clamp(1rem, 4.5vw, 1.3rem)', fontStyle: 'italic', color: '#6B5040', lineHeight: 1.45 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="bc-r7" style={{ marginBottom: 44, padding: '22px 28px', background: 'rgba(255,248,238,.6)', borderTop: '.5px solid rgba(196,149,106,.28)', borderBottom: '.5px solid rgba(196,149,106,.28)' }}>
                  <svg width="20" height="14" viewBox="0 0 20 14" style={{ display: 'block', margin: '0 auto 10px', opacity: .4 }}>
                    <path d="M0 14 L0 8 Q0 0 8 0 L8 4 Q4 4 4 8 L4 14 Z" fill="#9B7A5C" />
                    <path d="M12 14 L12 8 Q12 0 20 0 L20 4 Q16 4 16 8 L16 14 Z" fill="#9B7A5C" />
                  </svg>
                  <p style={{ fontSize: 'clamp(.9rem, 3.8vw, 1.05rem)', fontStyle: 'italic', color: '#6B5040', lineHeight: 1.75 }}>{message}</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="bc-r8" style={{ marginBottom: 48 }}>
                  <button
                    style={{ display: 'inline-block', padding: '13px 38px', border: '1px solid #C4956A', borderRadius: 2, color: '#8B6347', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontWeight: 400, background: 'transparent', transition: 'all .25s' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(196,149,106,.1)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
                    onClick={() => document.getElementById('bc-rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Confirmer ma présence
                  </button>
                  {rsvpDeadline && (
                    <p style={{ fontSize: 11, color: '#9B7A5C', marginTop: 8, fontFamily: "'Lato', sans-serif", fontStyle: 'italic' }}>
                      Réponse souhaitée avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {isRevealing && (
                <div style={{ marginBottom: 60 }}>
                  <svg width="240" height="40" viewBox="0 0 240 40" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <path d="M20 20 Q60 8 120 20 Q180 32 220 20" stroke="#C4956A" strokeWidth=".7" fill="none" opacity=".55" />
                    <path d="M60 15 Q65 8 70 12 Q65 16 60 15Z" fill="#C4956A" opacity=".28" />
                    <path d="M110 18 Q120 10 130 18 Q120 26 110 18Z" fill="#C4956A" opacity=".22" />
                    <path d="M170 25 Q175 18 180 22 Q175 28 170 25Z" fill="#C4956A" opacity=".28" />
                    <circle cx="120" cy="20" r="3" fill="none" stroke="#C4956A" strokeWidth=".6" opacity=".4" />
                  </svg>
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="bc-rsvp" style={{ borderTop: '.5px solid rgba(196,149,106,.25)', paddingTop: 56, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 6, fontFamily: "'Lato', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)', fontStyle: 'italic', color: '#4A3228', marginBottom: 26, fontFamily: "'Pinyon Script', cursive" }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(253,248,240,.9)', border: '1px solid rgba(196,149,106,.25)', borderRadius: 6, padding: '28px 20px' }}>
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
