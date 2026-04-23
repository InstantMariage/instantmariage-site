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

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: `${2 + (i * 1.65) % 96}%`,
  y: `${2 + (i * 1.58) % 96}%`,
  size: 1 + (i % 3),
  delay: `${(i * 0.18) % 4}s`,
  dur: `${2 + (i % 5) * 0.4}s`,
}));

export default function NuitEtoileeInteractive({
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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Raleway:ital,wght@0,200;0,300;1,200;1,300&display=swap');
        .ne * { box-sizing: border-box; }

        @keyframes neTwinkle {
          0%,100% { opacity:.2; transform:scale(.8); }
          50%      { opacity:1; transform:scale(1.4); }
        }
        @keyframes neSparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.7; transform:scale(1) rotate(180deg); }
        }
        @keyframes neSealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(192,200,220,.45), 0 4px 24px rgba(0,0,0,.6); }
          50%      { box-shadow: 0 0 0 11px rgba(192,200,220,0), 0 4px 32px rgba(192,200,220,.35); }
        }
        @keyframes neSealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.6); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes nep1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes nep2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes nep3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes nep4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes nep5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes nep6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes nep7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes nep8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes neFlapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes neEnvIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes neHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes neFadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
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

      {/* Gold border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.45)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="ne" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cinzel', serif",
        minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
        height: fixedHeight ?? undefined,
      }}>

        {/* ── ENVELOPE SCENE ── */}
        {showEnvelope && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 40% 35%, #1A237E 0%, #0A0E27 55%, #050714 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', borderRadius: 'inherit',
          }}>
            {/* Background stars */}
            {STARS.map((s, i) => (
              <div key={i} style={{
                position: 'absolute', left: s.x, top: s.y,
                width: s.size, height: s.size, borderRadius: '50%',
                background: i % 7 === 0 ? '#C9A84C' : 'white',
                animation: `neTwinkle ${s.dur} ${s.delay} ease-in-out infinite`,
              }} />
            ))}

            {/* Silver sparkles */}
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 2 === 0 ? 6 : 4, height: i % 2 === 0 ? 6 : 4,
                background: 'rgba(192,200,220,.8)',
                borderRadius: i % 3 === 0 ? 0 : '50%',
                left: `${12 + (i * 9.8) % 76}%`,
                top: `${8 + (i * 13.4) % 80}%`,
                animation: `neSparkle ${2.5 + i * 0.3}s ${i * 0.4}s infinite ease-in-out`,
              }} />
            ))}

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'neEnvIn 1s .6s ease-out both', opacity: 0, marginBottom: 40, pointerEvents: 'none' }}>
                <p style={{ color: 'rgba(201,168,76,.55)', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>
                  Faire-part de mariage
                </p>
                <p style={{ color: 'rgba(240,208,128,.9)', fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 300, letterSpacing: '.06em' }}>
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope — bleu nuit */}
            <div style={{ position: 'relative', width: 'min(92vw, 440px)', height: 'min(64.5vw, 308px)', animation: 'neEnvIn .8s .2s ease-out both' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #0e1e38 0%, #0a1628 40%, #060e1e 100%)',
                borderRadius: 12,
                border: '1.5px solid rgba(192,200,220,.3)',
                boxShadow: '0 12px 48px rgba(0,0,0,.75), 0 2px 8px rgba(192,200,220,.1)',
                overflow: 'hidden',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 440 284" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="284" x2="220" y2="142" stroke="rgba(192,200,220,.25)" strokeWidth=".6" opacity=".4" />
                  <line x1="440" y1="284" x2="220" y2="142" stroke="rgba(192,200,220,.25)" strokeWidth=".6" opacity=".4" />
                  {/* Star dots */}
                  {[60,130,210,290,370,100,260,380].map((x, i) => (
                    <circle key={i} cx={x} cy={i % 2 === 0 ? 80 : 190} r="1" fill="white" opacity=".3" />
                  ))}
                </svg>
              </div>

              {/* 3D flap */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '53.7%', perspective: 1000, perspectiveOrigin: '50% 0%', zIndex: 3 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transformOrigin: 'top center', transformStyle: 'preserve-3d',
                  animation: phase === 'flap-open' ? 'neFlapOpen 1s .05s ease-in-out forwards' : undefined,
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #101e38 0%, #0a1628 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    border: '1.5px solid rgba(192,200,220,.25)',
                    backfaceVisibility: 'hidden',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #060e1e 0%, #040a16 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                    transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
                  }} />
                </div>
              </div>

              {/* Wax seal — étoile argentée */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #E0E8F0 0%, #A8B4C8 45%, #606A80 100%)',
                    border: '2.5px solid rgba(220,228,240,.4)',
                    boxShadow: '0 0 14px rgba(160,180,210,.3)',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: phase === 'idle' ? 'neSealPulse 2.2s ease-in-out infinite' : 'neSealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(6,14,30,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Étoile 8 branches */}
                    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                      {[0,45,90,135,180,225,270,315].map((a, i) => {
                        const rad = a * Math.PI / 180;
                        const r = i % 2 === 0 ? 16 : 12;
                        return <line key={i} x1="19" y1="19" x2={19 + Math.cos(rad)*r} y2={19 + Math.sin(rad)*r} stroke="#060e1e" strokeWidth={i % 2 === 0 ? "1.5" : "1"} opacity=".75" />;
                      })}
                      <circle cx="19" cy="19" r="5" fill="#060e1e" opacity=".3" />
                      <circle cx="19" cy="19" r="2.5" fill="#060e1e" opacity=".5" />
                    </svg>
                  </div>
                  {phase === 'seal-burst' && [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      position: 'absolute', width: i % 2 === 0 ? 9 : 6, height: i % 2 === 0 ? 9 : 6,
                      borderRadius: i % 3 === 0 ? 0 : '50%',
                      background: i % 2 === 0 ? '#E0E8F0' : '#0a1628',
                      top: '50%', left: '50%', marginTop: -4, marginLeft: -4,
                      animation: `nep${i} .52s ease-out forwards`,
                    }} />
                  ))}
                </div>
              )}

              {phase === 'idle' && (
                <div style={{
                  position: 'absolute', bottom: -40, left: '50%',
                  color: 'rgba(192,200,220,.8)', fontSize: 12,
                  letterSpacing: '.14em', fontStyle: 'italic', whiteSpace: 'nowrap',
                  animation: 'neHintFloat 2s ease-in-out infinite',
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
            background: 'linear-gradient(180deg, #090D22 0%, #0D1135 40%, #090D22 100%)',
            clipPath: letterClip(),
            transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
          }}>
            {/* Stars decoration on content */}
            {STARS.slice(0, 30).map((s, i) => (
              <div key={i} style={{ position: 'fixed', left: s.x, top: s.y, width: s.size, height: s.size, borderRadius: '50%', background: i % 7 === 0 ? '#C9A84C' : 'rgba(255,255,255,.7)', animation: `neTwinkle ${s.dur} ${s.delay} ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
            ))}

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '72px 28px 100px', textAlign: 'center' }}>

              {isRevealing && (
                <div className="ne-r0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="36" viewBox="0 0 220 36" fill="none">
                    <line x1="0" y1="18" x2="88" y2="18" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                    {[100, 110, 120].map((x, i) => (
                      <path key={i} d={`M${x} 12 L${x + 4} 18 L${x} 24 L${x - 4} 18 Z`} fill="none" stroke="#C9A84C" strokeWidth=".8" opacity={.4 + i * .15} />
                    ))}
                    <line x1="132" y1="18" x2="220" y2="18" stroke="#C9A84C" strokeWidth=".5" opacity=".5" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <p className="ne-r1" style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,.7)', marginBottom: 28, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Unis sous les étoiles</p>
              )}

              {isRevealing && (
                <h1 className="ne-r2 ne-star-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 300, letterSpacing: '.04em', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>
              )}

              {isRevealing && (
                <p className="ne-r3" style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 40, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>vous invitent à leur mariage</p>
              )}

              {isRevealing && (
                <div className="ne-r4" style={{ marginBottom: 40 }}>
                  <svg width="200" height="22" viewBox="0 0 200 22" fill="none">
                    <line x1="0" y1="11" x2="85" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".35" />
                    <circle cx="100" cy="11" r="3.5" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".6" />
                    <circle cx="100" cy="11" r="1.5" fill="#C9A84C" opacity=".6" />
                    <line x1="115" y1="11" x2="200" y2="11" stroke="#C9A84C" strokeWidth=".5" opacity=".35" />
                  </svg>
                </div>
              )}

              {isRevealing && (
                <div className="ne-r5" style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>Le</p>
                  <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: 'rgba(240,208,128,.92)', letterSpacing: '.03em' }}>{date}</p>
                </div>
              )}

              {isRevealing && (
                <div className="ne-r6" style={{ marginBottom: message ? 40 : 48 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(201,168,76,.6)', marginBottom: 8, fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>À</p>
                  <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontFamily: "'Raleway', sans-serif", fontStyle: 'italic', fontWeight: 200, color: 'rgba(200,185,240,.85)', lineHeight: 1.45 }}>{lieu}</p>
                </div>
              )}

              {isRevealing && message && (
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
