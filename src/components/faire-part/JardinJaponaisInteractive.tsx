'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'petals-fall' | 'petals-swirl' | 'reveal-burst' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'petals-fall': 1200,
  'petals-swirl': 900,
  'reveal-burst': 550,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'petals-fall': 'petals-swirl',
  'petals-swirl': 'reveal-burst',
  'reveal-burst': 'revealing',
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

const SAKURA_PETALS = Array.from({ length: 24 }, (_, i) => ({
  startX: `${3 + (i * 4.1) % 94}%`,
  angle: i * 15,
  delay: `${(i * 0.12).toFixed(2)}s`,
  dur: `${3.5 + (i * 0.22)}s`,
  size: 14 + (i % 4) * 3,
  color: ['#FFB7C5', '#FFC5CD', '#FF8FAB', '#FFCAD4', '#F48FB1'][i % 5],
}));

const SWIRL_PETALS = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * 360,
  radius: 80 + (i % 3) * 30,
  delay: `${i * 0.05}s`,
  color: ['#FFB7C5', '#F48FB1', '#FFC5CD', '#FF8FAB'][i % 4],
}));

export default function JardinJaponaisInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('petals-fall'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'petals-fall', 'petals-swirl', 'reveal-burst'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());
  const isPetalsFall = phase === 'petals-fall' || phase === 'petals-swirl' || phase === 'reveal-burst';
  const isSwirling = phase === 'petals-swirl' || phase === 'reveal-burst';
  const isBurst = phase === 'reveal-burst';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&family=Raleway:ital,wght@0,200;0,300;1,200&display=swap');
        .jj * { box-sizing: border-box; }
        @keyframes jjPetalFall {
          0%   { transform: translateY(-5%) rotate(0deg) translateX(0); opacity: .95; }
          30%  { transform: translateY(30vh) rotate(120deg) translateX(15px); }
          60%  { transform: translateY(65vh) rotate(240deg) translateX(-12px); opacity: .7; }
          100% { transform: translateY(115vh) rotate(360deg) translateX(5px); opacity: 0; }
        }
        @keyframes jjPetalSwirl {
          0%   { transform: rotate(var(--a)) translateX(var(--r)) rotate(0deg) scale(1); opacity: .9; }
          50%  { transform: rotate(calc(var(--a) + 180deg)) translateX(calc(var(--r) * .6)) rotate(90deg) scale(.7); opacity: .7; }
          100% { transform: rotate(calc(var(--a) + 360deg)) translateX(var(--r)) rotate(180deg) scale(.4); opacity: 0; }
        }
        @keyframes jjBurst {
          0%   { transform: scale(0); opacity: .9; }
          60%  { transform: scale(1.5); opacity: .6; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes jjHint {
          0%,100% { opacity: .6; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 1; transform: translateX(-50%) translateY(6px); }
        }
        @keyframes jjFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jjRedShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes jjBranchSway {
          0%,100% { transform: rotate(-.5deg); transform-origin: 50% 100%; }
          50%      { transform: rotate(.8deg); transform-origin: 50% 100%; }
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

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="jj" style={{ position: 'relative', width: '100%', fontFamily: "'Noto Serif JP', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #FAFAFA 0%, #F5F0EC 50%, #FAF8F5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('petals-fall'); }}>

            {/* Cherry blossom tree SVG */}
            <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: .85, animation: 'jjBranchSway 4s ease-in-out infinite' }}>
              {/* Trunk */}
              <path d="M400 600 Q395 520 390 460 Q385 400 400 350" stroke="#2C1810" strokeWidth="8" fill="none" strokeLinecap="round" />
              {/* Main branches */}
              <path d="M400 400 Q360 360 310 340 Q270 325 230 300" stroke="#2C1810" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M400 400 Q440 360 490 340 Q530 325 570 300" stroke="#2C1810" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M400 370 Q390 330 380 300 Q370 275 360 250" stroke="#2C1810" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M400 370 Q415 330 425 305 Q440 275 450 250" stroke="#2C1810" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Sub-branches */}
              <path d="M310 340 Q280 310 250 320 Q225 328 200 315" stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M310 340 Q295 300 280 280" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M490 340 Q520 310 550 320 Q575 328 600 315" stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M490 340 Q505 300 520 280" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Blossoms */}
              {[
                { x: 230, y: 300 }, { x: 250, y: 320 }, { x: 280, y: 280 }, { x: 310, y: 335 },
                { x: 360, y: 250 }, { x: 380, y: 300 }, { x: 400, y: 265 }, { x: 420, y: 295 },
                { x: 450, y: 250 }, { x: 490, y: 335 }, { x: 520, y: 280 }, { x: 550, y: 320 },
                { x: 575, y: 298 }, { x: 200, y: 315 }, { x: 600, y: 313 }, { x: 300, y: 308 },
              ].map((b, i) => (
                <g key={i}>
                  {[0, 72, 144, 216, 288].map((a, j) => {
                    const rad = (a * Math.PI) / 180;
                    return <ellipse key={j} cx={b.x + Math.cos(rad) * 7} cy={b.y + Math.sin(rad) * 7} rx="6" ry="4"
                      fill="#FFB7C5" opacity=".8" transform={`rotate(${a} ${b.x + Math.cos(rad) * 7} ${b.y + Math.sin(rad) * 7})`} />;
                  })}
                  <circle cx={b.x} cy={b.y} r="3" fill="#FF8FAB" />
                </g>
              ))}
            </svg>

            {/* Falling sakura petals */}
            {isPetalsFall && SAKURA_PETALS.map((p, i) => (
              <div key={i} style={{ position: 'absolute', top: '-8%', left: p.startX, animation: isSwirling ? undefined : `jjPetalFall ${p.dur} ${p.delay} ease-in ${isBurst ? '1' : 'infinite'}`, pointerEvents: 'none' }}>
                <svg width={p.size} height={p.size + 3} viewBox="0 0 20 22" fill="none">
                  <ellipse cx="10" cy="11" rx="7" ry="10" fill={p.color} opacity=".85" transform={`rotate(${p.angle} 10 11)`} />
                </svg>
              </div>
            ))}

            {/* Swirl petals */}
            {isSwirling && SWIRL_PETALS.map((p, i) => {
              const rad = (p.angle * Math.PI) / 180;
              const cx = 50 + Math.cos(rad) * (p.radius / 8);
              const cy = 50 + Math.sin(rad) * (p.radius / 8);
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: -8,
                  marginTop: -8,
                  ['--a' as any]: `${p.angle}deg`,
                  ['--r' as any]: `${p.radius}px`,
                  transformOrigin: '8px 8px',
                  animation: `jjPetalSwirl .85s ${p.delay} ease-in-out forwards`,
                  opacity: 0,
                }}>
                  <svg width="16" height="18" viewBox="0 0 20 22" fill="none">
                    <ellipse cx="10" cy="11" rx="7" ry="10" fill={p.color} opacity=".9" />
                  </svg>
                </div>
              );
            })}

            {/* Burst circle */}
            {isBurst && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -80, marginLeft: -80, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,183,197,.6) 0%, rgba(255,183,197,0) 70%)', animation: 'jjBurst .55s ease-out forwards' }} />
            )}

            {/* Center text */}
            <div style={{ position: 'relative', zIndex: 4, textAlign: 'center', bottom: '-12%' }}>
              <p style={{ color: 'rgba(44,24,16,.45)', fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>結婚式 · Mariage</p>
              <p style={{ color: '#2C1810', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 200, letterSpacing: '.05em' }}>{coupleNames}</p>
            </div>

            {phase === 'idle' && (
              <p style={{ position: 'absolute', bottom: '10%', left: '50%', color: 'rgba(198,40,40,.55)', fontSize: 12, letterSpacing: '.14em', whiteSpace: 'nowrap', animation: 'jjHint 2s ease-in-out infinite', fontFamily: "'Raleway', sans-serif" }}>
                ✦ Touchez pour ouvrir ✦
              </p>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F0EC 40%, #FAFAFA 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

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

              <p className="jj-r1" style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 6, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>結婚式</p>
              <p className="jj-r1" style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#666', marginBottom: 28, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Cérémonie de mariage</p>

              <h1 className="jj-r2 jj-red-text" style={{ fontSize: 'clamp(2.4rem, 9vw, 3.4rem)', fontWeight: 200, letterSpacing: '.05em', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>

              <p className="jj-r3" style={{ fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: '#888', marginBottom: 40, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>vous invitent à leur mariage</p>

              <div className="jj-r4" style={{ marginBottom: 40 }}>
                <svg width="180" height="22" viewBox="0 0 180 22" fill="none">
                  <line x1="0" y1="11" x2="70" y2="11" stroke="#C62828" strokeWidth=".4" opacity=".25" />
                  <rect x="76" y="6" width="10" height="10" fill="none" stroke="#C62828" strokeWidth=".7" opacity=".5" transform="rotate(45 81 11)" />
                  <line x1="110" y1="11" x2="180" y2="11" stroke="#C62828" strokeWidth=".4" opacity=".25" />
                </svg>
              </div>

              <div className="jj-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', fontWeight: 300, color: '#1A1A1A', letterSpacing: '.03em' }}>{date}</p>
              </div>

              <div className="jj-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase', color: '#8B0000', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 200, color: '#333', lineHeight: 1.45, fontFamily: "'Raleway', sans-serif" }}>{lieu}</p>
              </div>

              {message && (
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
