'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'constellation-draw' | 'starburst' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'constellation-draw': 2000,
  'starburst': 700,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'constellation-draw': 'starburst',
  'starburst': 'revealing',
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

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: `${2 + (i * 1.65) % 96}%`,
  y: `${2 + (i * 1.58) % 96}%`,
  size: 1 + (i % 3),
  delay: `${(i * 0.18) % 4}s`,
  dur: `${2 + (i % 5) * 0.4}s`,
}));

// Constellation star positions (normalized 0-800 x 0-600)
const CONST_STARS = [
  { x: 200, y: 200 }, { x: 300, y: 150 }, { x: 400, y: 180 },
  { x: 500, y: 160 }, { x: 580, y: 220 }, { x: 560, y: 320 },
  { x: 480, y: 380 }, { x: 400, y: 400 }, { x: 300, y: 380 },
  { x: 220, y: 320 }, { x: 400, y: 300 },
];
const CONST_LINES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [6, 7], [7, 8], [8, 9], [9, 0], [1, 10], [7, 10],
];

export default function NuitEtoileeInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('constellation-draw'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'constellation-draw', 'starburst'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());
  const isDrawing = phase === 'constellation-draw';
  const isBurst = phase === 'starburst';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Raleway:ital,wght@0,200;0,300;1,200;1,300&display=swap');
        .ne * { box-sizing: border-box; }
        @keyframes neTwinkle {
          0%,100% { opacity: .2; transform: scale(.8); }
          50%      { opacity: 1; transform: scale(1.4); }
        }
        @keyframes neHint {
          0%,100% { opacity: .55; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 1; transform: translateX(-50%) translateY(6px); }
        }
        @keyframes neConstDraw {
          from { stroke-dashoffset: 2000; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: .7; }
        }
        @keyframes neStarGlow {
          0%,100% { r: 4; opacity: .8; }
          50%      { r: 8; opacity: 1; }
        }
        @keyframes neBurstRay {
          from { opacity: 1; stroke-width: 2; }
          to   { opacity: 0; stroke-width: .1; stroke-dashoffset: -300; }
        }
        @keyframes neBurstFlash {
          0%  { opacity: 0; }
          30% { opacity: .9; }
          100%{ opacity: 0; }
        }
        @keyframes neFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes neGoldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .ne-r0 { animation: neFadeUp .75s 0s ease-out both; }
        .ne-r1 { animation: neFadeUp .75s .2s ease-out both; }
        .ne-r2 { animation: neFadeUp .75s .42s ease-out both; }
        .ne-r3 { animation: neFadeUp .75s .64s ease-out both; }
        .ne-r4 { animation: neFadeUp .75s .86s ease-out both; }
        .ne-r5 { animation: neFadeUp .75s 1.08s ease-out both; }
        .ne-r6 { animation: neFadeUp .75s 1.3s ease-out both; }
        .ne-r7 { animation: neFadeUp .75s 1.55s ease-out both; }
        .ne-star-text {
          background: linear-gradient(120deg, #B8860B 0%, #C9A84C 30%, #F0D080 50%, #C9A84C 70%, #B8860B 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: neGoldShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="ne" style={{ position: 'relative', width: '100%', fontFamily: "'Cinzel', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 35%, #1A237E 0%, #0A0E27 55%, #050714 100%)', overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('constellation-draw'); }}>

            {/* Milky way background */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 40% at 45% 40%, rgba(100,120,255,.06) 0%, transparent 100%)' }} />

            {/* Background stars */}
            {STARS.map((s, i) => (
              <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.size, height: s.size, borderRadius: '50%', background: i % 7 === 0 ? '#C9A84C' : 'white', animation: `neTwinkle ${s.dur} ${s.delay} ease-in-out infinite` }} />
            ))}

            {/* Constellation SVG */}
            {(isDrawing || isBurst) && (
              <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                {/* Constellation lines */}
                {CONST_LINES.map(([a, b], i) => {
                  const s1 = CONST_STARS[a], s2 = CONST_STARS[b];
                  const len = Math.sqrt((s2.x - s1.x) ** 2 + (s2.y - s1.y) ** 2);
                  return (
                    <line key={i} x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
                      stroke="#C9A84C" strokeWidth=".8"
                      strokeDasharray={len}
                      style={{ strokeDashoffset: len, opacity: 0, animation: `neConstDraw .4s ${i * 0.12}s ease-out forwards` }} />
                  );
                })}
                {/* Constellation stars */}
                {CONST_STARS.map((s, i) => (
                  <g key={i}>
                    <circle cx={s.x} cy={s.y} r="3" fill="#C9A84C"
                      style={{ animation: `neTwinkle ${1.5 + i * 0.2}s ${i * 0.15}s ease-in-out infinite` }} />
                    <circle cx={s.x} cy={s.y} r="6" fill="none" stroke="#C9A84C" strokeWidth=".3" opacity=".4" />
                  </g>
                ))}
                {/* Burst rays */}
                {isBurst && [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 400, y1 = 300;
                  const x2 = x1 + Math.cos(rad) * 20, y2 = y1 + Math.sin(rad) * 20;
                  const x3 = x1 + Math.cos(rad) * 320, y3 = y1 + Math.sin(rad) * 320;
                  return <line key={i} x1={x2} y1={y2} x2={x3} y2={y3} stroke="#C9A84C" strokeWidth="1.5"
                    strokeDasharray={300} style={{ strokeDashoffset: 300, opacity: 1, animation: `neBurstRay .65s ${i * 0.04}s ease-out forwards` }} />;
                })}
                {/* Flash */}
                {isBurst && <rect x="0" y="0" width="800" height="600" fill="rgba(201,168,76,.15)" style={{ animation: 'neBurstFlash .65s ease-out forwards' }} />}
              </svg>
            )}

            {/* Center text */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, pointerEvents: 'none' }}>
              <p style={{ color: 'rgba(201,168,76,.55)', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Faire-part de mariage</p>
              <p style={{ color: 'rgba(240,208,128,.9)', fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontWeight: 300, letterSpacing: '.06em', textAlign: 'center' }}>{coupleNames}</p>
            </div>

            {phase === 'idle' && (
              <p style={{ position: 'absolute', bottom: '12%', left: '50%', color: 'rgba(201,168,76,.6)', fontSize: 12, letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'neHint 2s ease-in-out infinite', fontFamily: "'Raleway', sans-serif" }}>
                ✦ Touchez pour dessiner la constellation ✦
              </p>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #090D22 0%, #0D1135 40%, #090D22 100%)', minHeight: '100dvh' }}>

            {/* Stars decoration on content */}
            {STARS.slice(0, 30).map((s, i) => (
              <div key={i} style={{ position: 'fixed', left: s.x, top: s.y, width: s.size, height: s.size, borderRadius: '50%', background: i % 7 === 0 ? '#C9A84C' : 'rgba(255,255,255,.7)', animation: `neTwinkle ${s.dur} ${s.delay} ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
            ))}

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              <div className="ne-r0" style={{ marginBottom: 28 }}>
                <svg width="220" height="36" viewBox="0 0 220 36" fill="none">
                  <line x1="0" y1="18" x2="88" y2="18" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                  {[100, 110, 120].map((x, i) => (
                    <path key={i} d={`M${x} 12 L${x + 4} 18 L${x} 24 L${x - 4} 18 Z`} fill="none" stroke="#C9A84C" strokeWidth=".8" opacity={.4 + i * .15} />
                  ))}
                  <line x1="132" y1="18" x2="220" y2="18" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                </svg>
              </div>

              <p className="ne-r1" style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,.7)', marginBottom: 28, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Unis sous les étoiles</p>

              <h1 className="ne-r2 ne-star-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 300, letterSpacing: '.04em', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>

              <p className="ne-r3" style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 40, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>vous invitent à leur mariage</p>

              <div className="ne-r4" style={{ marginBottom: 40 }}>
                <svg width="200" height="22" viewBox="0 0 200 22" fill="none">
                  <line x1="0" y1="11" x2="85" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".35" />
                  <circle cx="100" cy="11" r="3.5" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".6" />
                  <circle cx="100" cy="11" r="1.5" fill="#C9A84C" opacity=".6" />
                  <line x1="115" y1="11" x2="200" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".35" />
                </svg>
              </div>

              <div className="ne-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: 'rgba(240,208,128,.92)', letterSpacing: '.03em' }}>{date}</p>
              </div>

              <div className="ne-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontFamily: "'Raleway', sans-serif", fontStyle: 'italic', fontWeight: 200, color: 'rgba(200,185,240,.85)', lineHeight: 1.45 }}>{lieu}</p>
              </div>

              {message && (
                <div className="ne-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(201,168,76,.2)', borderBottom: '.5px solid rgba(201,168,76,.2)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontFamily: "'Raleway', sans-serif", fontStyle: 'italic', fontWeight: 200, color: 'rgba(200,185,240,.8)', lineHeight: 1.75 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="ne-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid rgba(201,168,76,.5)', color: '#C9A84C', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}
                    onClick={() => document.getElementById('ne-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: 'rgba(201,168,76,.6)', marginTop: 6, fontFamily: "'Raleway', sans-serif" }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="ne-rsvp" style={{ borderTop: '.5px solid rgba(201,168,76,.18)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8, fontFamily: "'Raleway', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontWeight: 300, letterSpacing: '.03em', color: 'rgba(240,208,128,.9)', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(13,17,53,.7)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#C9A84C" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: 'rgba(201,168,76,.4)', letterSpacing: '.05em', fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: 'rgba(201,168,76,.7)', textDecoration: 'none' }}>InstantMariage.fr</a>
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
