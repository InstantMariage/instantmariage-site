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

export default function ProvenceOlivierInteractive({
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
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap');
        .po * { box-sizing: border-box; }

        @keyframes poSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.55; transform:scale(1) rotate(180deg); }
        }
        @keyframes poSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(107,142,35,.5), 0 4px 24px rgba(0,0,0,.45); }
          50%      { box-shadow: 0 0 0 11px rgba(107,142,35,0), 0 4px 32px rgba(107,142,35,.3); }
        }
        @keyframes poSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.5); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes pop1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes pop2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes pop3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes pop4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes pop5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes pop6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes pop7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes pop8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes poFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes poEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes poHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes poFadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes poLavendrShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        .po-r0 { animation: poFadeUp .7s 0s ease-out both; }
        .po-r1 { animation: poFadeUp .7s .2s ease-out both; }
        .po-r2 { animation: poFadeUp .7s .42s ease-out both; }
        .po-r3 { animation: poFadeUp .7s .64s ease-out both; }
        .po-r4 { animation: poFadeUp .7s .86s ease-out both; }
        .po-r5 { animation: poFadeUp .7s 1.08s ease-out both; }
        .po-r6 { animation: poFadeUp .7s 1.3s ease-out both; }
        .po-r7 { animation: poFadeUp .7s 1.55s ease-out both; }
        .po-lavender-text {
          background: linear-gradient(120deg, #5E35B1 0%, #7B52D3 35%, #AE8FE8 55%, #7B52D3 75%, #5E35B1 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: poLavendrShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Lavender border */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(123,82,211,0.3)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="po" style={{
        position: 'relative', width: '100%',
        fontFamily: "'EB Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, #1a1228 0%, #251838 55%, #140e20 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Lavender + olive sparkles */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
                background: i % 3 === 0 ? '#9C8FD8' : i % 2 === 0 ? '#e8e4f0' : '#6B8E23',
                borderRadius: i % 4 === 0 ? 0 : '50%',
                left: `${8 + (i * 6.2) % 86}%`,
                top: `${4 + (i * 11.3) % 92}%`,
                animation: `poSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'poEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(200,190,230,.55)', fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(240,235,255,.88)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontStyle: 'italic', fontWeight: 400 }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope — lavande */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'poEnvIn .8s .2s ease-out both' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #f0ecf8 0%, #e8e4f0 40%, #dcd5ea 100%)',
                borderRadius: 12,
                border: '1.5px solid rgba(92,122,42,.35)',
                boxShadow: '0 12px 48px rgba(0,0,0,.55), 0 2px 8px rgba(107,142,35,.12)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="#6B8E23" strokeWidth=".6" opacity=".2" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="#6B8E23" strokeWidth=".6" opacity=".2" />
                  {/* Tiny olive leaf prints */}
                  {[60,140,220,300,380].map((x, i) => (
                    <ellipse key={i} cx={x} cy={i % 2 === 0 ? 70 : 210} rx="8" ry="4" fill="#6B8E23" opacity=".08" transform={`rotate(${-20 + i*10} ${x} ${i % 2 === 0 ? 70 : 210})`} />
                  ))}
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'poFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #ddd8ec 0%, #ccc4e0 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid rgba(92,122,42,.28)',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #b8aad0 0%, #a098c0 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — vert olive */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #9aac4a 0%, #6B8E23 55%, #4a6318 100%)',
                    border: '2.5px solid rgba(200,210,160,.55)',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'poSealPulse 2.2s ease-in-out infinite' : 'poSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(200,220,160,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Olive branch */}
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M8 28 Q14 20 18 14 Q22 8 28 6" stroke="#2E4A12" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".8" />
                      {[[12,24],[15,19],[19,15],[22,11],[25,8]].map(([x,y], i) => (
                        <ellipse key={i} cx={x} cy={y} rx="4" ry="2.5" fill="#c8d890" opacity=".85" transform={`rotate(${-50 + i*12} ${x} ${y})`} />
                      ))}
                      <circle cx="28" cy="6" r="2" fill="#c8d890" opacity=".7" />
                      <circle cx="8" cy="28" r="2" fill="#c8d890" opacity=".6" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: i % 3 === 0 ? 0 : '50%',
                      background: i % 2 === 0 ? '#e8e4f0' : '#6B8E23',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `pop${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(180,170,220,.85)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'poHintFloat 2s ease-in-out infinite',
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
            background: 'linear-gradient(180deg, #F5F0FA 0%, #EDE3F5 30%, #F5F0FA 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="po-r0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="36" viewBox="0 0 220 36" fill="none">
                    <line x1="0" y1="18" x2="80" y2="18" stroke="#7B52D3" strokeWidth=".5" opacity=".4" />
                    <ellipse cx="96" cy="14" rx="8" ry="4" fill="#6B8E4E" opacity=".4" transform="rotate(-20 96 14)" />
                    <ellipse cx="110" cy="20" rx="8" ry="4" fill="#6B8E4E" opacity=".5" transform="rotate(10 110 20)" />
                    <ellipse cx="124" cy="14" rx="8" ry="4" fill="#6B8E4E" opacity=".4" transform="rotate(20 124 14)" />
                    <circle cx="110" cy="18" r="3" fill="#9C8FD8" opacity=".6" />
                    <line x1="138" y1="18" x2="220" y2="18" stroke="#7B52D3" strokeWidth=".5" opacity=".4" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="po-r1" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 28, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Sous les oliviers de Provence</p>
              )}

              {isRevealing && (
                <h1 className="po-r2 po-lavender-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>
              )}

              {isRevealing && (
                <p className="po-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 40, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="po-r4" style={{ marginBottom: 40 }}>
                  <svg width="200" height="24" viewBox="0 0 200 24" fill="none">
                    <line x1="0" y1="12" x2="72" y2="12" stroke="#7B52D3" strokeWidth=".5" opacity=".35" />
                    <ellipse cx="86" cy="10" rx="8" ry="4" fill="#6B8E4E" opacity=".35" transform="rotate(-15 86 10)" />
                    <ellipse cx="100" cy="14" rx="8" ry="4" fill="#6B8E4E" opacity=".4" />
                    <ellipse cx="114" cy="10" rx="8" ry="4" fill="#6B8E4E" opacity=".35" transform="rotate(15 114 10)" />
                    <line x1="128" y1="12" x2="200" y2="12" stroke="#7B52D3" strokeWidth=".5" opacity=".35" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="po-r5" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: '#2E1B5A', letterSpacing: '.02em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="po-r6" style={{ marginBottom: message ? 40 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>À</p>
                  <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 400, color: '#4A2E7A', lineHeight: 1.4 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="po-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(123,82,211,.22)', borderBottom: '.5px solid rgba(123,82,211,.22)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#4A2E7A', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="po-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid #7B52D3', borderRadius: 2, color: '#5E35B1', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
                    onClick={() => document.getElementById('po-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#7B52D3', marginTop: 6 }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="po-rsvp" style={{ borderTop: '.5px solid rgba(123,82,211,.2)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontStyle: 'italic', color: '#2E1B5A', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(245,240,250,.85)', border: '1px solid rgba(123,82,211,.18)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#7B52D3" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#A890CC', letterSpacing: '.05em', fontFamily: "'Lato', sans-serif" }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#7B52D3', textDecoration: 'none' }}>InstantMariage.fr</a>
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
