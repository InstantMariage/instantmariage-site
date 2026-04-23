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

export default function JardinJaponaisInteractive({
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&family=Raleway:ital,wght@0,200;0,300;1,200&display=swap');
        .jj * { box-sizing: border-box; }

        @keyframes jjSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.6; transform:scale(1) rotate(180deg); }
        }
        @keyframes jjSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(192,57,43,.5), 0 4px 24px rgba(0,0,0,.45); }
          50%      { box-shadow: 0 0 0 11px rgba(192,57,43,0), 0 4px 32px rgba(192,57,43,.35); }
        }
        @keyframes jjSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.5); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes jjp1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes jjp2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes jjp3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes jjp4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes jjp5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes jjp6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes jjp7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes jjp8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes jjFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes jjEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes jjHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes jjBranchSway {
          0%,100% { transform: rotate(-.5deg); transform-origin: 50% 100%; }
          50%      { transform: rotate(.8deg); transform-origin: 50% 100%; }
        }
        @keyframes jjFadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes jjRedShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        .jj-r0 { animation: jjFadeUp .7s 0s ease-out both; }
        .jj-r1 { animation: jjFadeUp .7s .2s ease-out both; }
        .jj-r2 { animation: jjFadeUp .7s .42s ease-out both; }
        .jj-r3 { animation: jjFadeUp .7s .64s ease-out both; }
        .jj-r4 { animation: jjFadeUp .7s .86s ease-out both; }
        .jj-r5 { animation: jjFadeUp .7s 1.08s ease-out both; }
        .jj-r6 { animation: jjFadeUp .7s 1.3s ease-out both; }
        .jj-r7 { animation: jjFadeUp .7s 1.55s ease-out both; }
        .jj-red-text {
          background: linear-gradient(120deg, #8B0000 0%, #C62828 35%, #EF5350 55%, #C62828 75%, #8B0000 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: jjRedShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Thin crimson border */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(198,40,40,0.2)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="jj" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Noto Serif JP', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, #0c0805 0%, #1a1208 55%, #0a0603 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Cherry blossom branch in background */}
            <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
              style={{ position: 'absolute', inset: 0, opacity: .12, animation: 'jjBranchSway 4s ease-in-out infinite' }}>
              <path d="M-50 500 Q100 380 220 320 Q360 255 480 280 Q600 305 700 240" stroke="#5C2E18" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M220 320 Q200 260 190 200" stroke="#5C2E18" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M350 285 Q340 230 330 175" stroke="#5C2E18" strokeWidth="3" fill="none" strokeLinecap="round" />
              {[[180,210],[220,195],[260,220],[310,200],[350,190],[390,215]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="10" fill="#FFB7C5" opacity=".6" />
              ))}
            </svg>

            {/* Red sparkles */}
            {[...Array(14)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
                background: i % 3 === 0 ? '#FFB7C5' : i % 2 === 0 ? '#C0392B' : 'rgba(255,255,255,.6)',
                borderRadius: '50%',
                left: `${8 + (i * 6.2) % 86}%`,
                top: `${4 + (i * 11.3) % 92}%`,
                animation: `jjSparkle ${2.2 + i * 0.28}s ${i * 0.35}s infinite ease-in-out`,
              }} />
            ))}

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'jjEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(255,183,197,.45)', fontSize: 11, letterSpacing: '.32em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>
                  結婚式 · Mariage
                </p>
                <p style={{ color: 'rgba(255,248,242,.88)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 200, letterSpacing: '.05em' }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope — blanche */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'jjEnvIn .8s .2s ease-out both' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #fefefe 0%, #fafafa 40%, #f5f0ea 100%)',
                borderRadius: 12,
                border: '1.5px solid rgba(192,57,43,.22)',
                boxShadow: '0 12px 48px rgba(0,0,0,.55), 0 2px 8px rgba(192,57,43,.1)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="rgba(192,57,43,.15)" strokeWidth=".6" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="rgba(192,57,43,.15)" strokeWidth=".6" />
                  {/* Subtle sakura petal prints */}
                  {[70,150,230,310,390].map((x, i) => (
                    <g key={i} opacity=".08">
                      {[0,72,144,216,288].map((a, j) => {
                        const rad = a * Math.PI / 180;
                        const cy = i % 2 === 0 ? 80 : 200;
                        return <ellipse key={j} cx={x + Math.cos(rad)*6} cy={cy + Math.sin(rad)*6} rx="5" ry="3" fill="#C0392B" transform={`rotate(${a} ${x + Math.cos(rad)*6} ${cy + Math.sin(rad)*6})`} />;
                      })}
                    </g>
                  ))}
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'jjFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #f8f4ee 0%, #f0e8de 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid rgba(192,57,43,.18)',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #e0d8cc 0%, #c8bfb0 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — rouge japonais */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #e84030 0%, #C0392B 55%, #8B0000 100%)',
                    border: '2.5px solid rgba(255,180,160,.3)',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'jjSealPulse 2.2s ease-in-out infinite' : 'jjSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(255,180,160,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Mon japonais — cercle avec pétales de cerisier */}
                    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                      <circle cx="19" cy="19" r="16" stroke="#fafafa" strokeWidth=".8" opacity=".6" />
                      {[0,72,144,216,288].map((a, i) => {
                        const rad = a * Math.PI / 180;
                        const cx = 19 + Math.cos(rad) * 8;
                        const cy = 19 + Math.sin(rad) * 8;
                        return <ellipse key={i} cx={cx} cy={cy} rx="5" ry="3" fill="#fafafa" opacity=".75" transform={`rotate(${a} ${cx} ${cy})`} />;
                      })}
                      <circle cx="19" cy="19" r="4" fill="#fafafa" opacity=".6" />
                      <circle cx="19" cy="19" r="2" fill="#fafafa" opacity=".8" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: '50%',
                      background: i % 2 === 0 ? '#FFB7C5' : '#C0392B',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `jjp${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(198,40,40,.7)', fontSize: 12,
                  letterSpacing: '.14em', whiteSpace: 'nowrap',
                  animation: 'jjHintFloat 2s ease-in-out infinite',
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
            background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F0EC 40%, #FAFAFA 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            <div style={{ width: '100%', maxWidth: 420, padding: '72px 28px 100px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="jj-r0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="36" viewBox="0 0 220 36" fill="none">
                    <line x1="0" y1="18" x2="80" y2="18" stroke="#C62828" strokeWidth=".5" opacity=".3" />
                    {[88, 100, 112, 124, 132].map((x, i) => {
                      const isCenter = i === 2;
                      return <circle key={i} cx={x} cy={18} r={isCenter ? 3 : 2} fill={isCenter ? '#C62828' : '#FFB7C5'} opacity={isCenter ? .8 : .5} />;
                    })}
                    <line x1="140" y1="18" x2="220" y2="18" stroke="#C62828" strokeWidth=".5" opacity=".3" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <>
                  <p className="jj-r1" style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 6, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>結婚式</p>
                  <p className="jj-r1" style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#666', marginBottom: 28, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Cérémonie de mariage</p>
                </>
              )}

              {isRevealing && (
                <h1 className="jj-r2 jj-red-text" style={{ fontSize: 'clamp(2.4rem, 9vw, 3.4rem)', fontWeight: 200, letterSpacing: '.05em', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>
              )}

              {isRevealing && (
                <p className="jj-r3" style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: '#888', marginBottom: 40, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="jj-r4" style={{ marginBottom: 40 }}>
                  <svg width="180" height="22" viewBox="0 0 180 22" fill="none">
                    <line x1="0" y1="11" x2="70" y2="11" stroke="#C62828" strokeWidth=".4" opacity=".25" />
                    <rect x="76" y="6" width="10" height="10" fill="none" stroke="#C62828" strokeWidth=".7" opacity=".5" transform="rotate(45 81 11)" />
                    <line x1="110" y1="11" x2="180" y2="11" stroke="#C62828" strokeWidth=".4" opacity=".25" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="jj-r5" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', fontWeight: 300, color: '#1A1A1A', letterSpacing: '.03em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="jj-r6" style={{ marginBottom: message ? 40 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>À</p>
                  <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 200, color: '#333', lineHeight: 1.45, fontFamily: "'Raleway', sans-serif" }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
                <div className="jj-r7" style={{ marginBottom: 44, padding: '18px 22px', borderLeft: '2px solid rgba(198,40,40,.3)', textAlign: 'left' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', fontWeight: 200, color: '#444', lineHeight: 1.75, fontFamily: "'Raleway', sans-serif" }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="jj-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid rgba(198,40,40,.5)', color: '#C62828', fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
                    onClick={() => document.getElementById('jj-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#888', marginTop: 6, fontFamily: "'Raleway', sans-serif" }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="jj-rsvp" style={{ borderTop: '.5px solid rgba(198,40,40,.15)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 8, fontFamily: "'Raleway', sans-serif" }}>ご返信</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontWeight: 200, letterSpacing: '.04em', color: '#1A1A1A', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(250,248,245,.9)', border: '1px solid rgba(198,40,40,.12)', borderRadius: 4, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#C62828" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#BBB', letterSpacing: '.05em', fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#C62828', textDecoration: 'none' }}>InstantMariage.fr</a>
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
