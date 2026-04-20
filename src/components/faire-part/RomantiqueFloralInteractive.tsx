'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'bloom-open' | 'petals-fly' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'bloom-open': 1500,
  'petals-fly': 700,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'bloom-open': 'petals-fly',
  'petals-fly': 'revealing',
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

const FALLING_PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: `${4 + (i * 5.4) % 92}%`,
  delay: `${(i * 0.3).toFixed(1)}s`,
  dur: `${5 + (i * 0.4)}s`,
  size: 10 + (i % 5) * 3,
  color: ['#F48FB1', '#F06292', '#FCB8D0', '#E91E8C', '#FDDDE6'][i % 5],
}));

export default function RomantiqueFloralInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('bloom-open'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'bloom-open', 'petals-fly'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());
  const isBloomOpen = phase === 'bloom-open' || phase === 'petals-fly';
  const isPetalsFly = phase === 'petals-fly';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Lato:wght@300;400&display=swap');
        .rf * { box-sizing: border-box; }
        @keyframes rfPetalFall {
          0%   { transform: translateY(-10px) rotate(0deg) translateX(0); opacity: .9; }
          25%  { transform: translateY(25vh) rotate(90deg) translateX(20px); }
          50%  { transform: translateY(55vh) rotate(180deg) translateX(-15px); opacity: .8; }
          75%  { transform: translateY(80vh) rotate(270deg) translateX(10px); opacity: .4; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(0); opacity: 0; }
        }
        @keyframes rfPetalUnfold {
          from { transform: rotate(var(--start-r)) scale(0.05) translateY(0); opacity: 0; }
          to   { transform: rotate(var(--end-r)) scale(1) translateY(-38px); opacity: 1; }
        }
        @keyframes rfPetalFly {
          to { transform: rotate(var(--fly-r)) scale(.4) translateY(-200px) translateX(var(--fly-x)); opacity: 0; }
        }
        @keyframes rfCenterBloom {
          from { transform: scale(.1); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes rfHint {
          0%,100% { opacity: .65; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 1; transform: translateX(-50%) translateY(6px); }
        }
        @keyframes rfFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rfRoseShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .rf-r0 { animation: rfFadeUp .7s 0s ease-out both; }
        .rf-r1 { animation: rfFadeUp .7s .2s ease-out both; }
        .rf-r2 { animation: rfFadeUp .7s .42s ease-out both; }
        .rf-r3 { animation: rfFadeUp .7s .64s ease-out both; }
        .rf-r4 { animation: rfFadeUp .7s .86s ease-out both; }
        .rf-r5 { animation: rfFadeUp .7s 1.08s ease-out both; }
        .rf-r6 { animation: rfFadeUp .7s 1.3s ease-out both; }
        .rf-r7 { animation: rfFadeUp .7s 1.55s ease-out both; }
        .rf-rose-text {
          background: linear-gradient(120deg, #B5224A 0%, #E91E8C 35%, #FCB8D0 55%, #E91E8C 75%, #B5224A 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rfRoseShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="rf" style={{ position: 'relative', width: '100%', fontFamily: "'Cormorant Garamond', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #FCE4EC 0%, #F8BBD0 40%, #FCE4EC 80%, #FFF0F3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('bloom-open'); }}>

            {/* Continuous falling petals */}
            {FALLING_PETALS.map((p, i) => (
              <div key={i} style={{ position: 'absolute', top: '-5%', left: p.left, animation: `rfPetalFall ${p.dur} ${p.delay} ease-in infinite`, pointerEvents: 'none' }}>
                <svg width={p.size} height={p.size + 4} viewBox="0 0 20 24"><ellipse cx="10" cy="12" rx="7" ry="11" fill={p.color} opacity=".8" /></svg>
              </div>
            ))}

            {/* Rose bloom — SVG with petals */}
            <div style={{ position: 'relative', zIndex: 3 }}>
              {/* Petals at 8 positions */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const isOpen = isBloomOpen;
                const isFly = isPetalsFly;
                const colors = ['#F48FB1', '#F06292', '#EC407A', '#E91E8C', '#F48FB1', '#F06292', '#EC407A', '#E91E8C'];
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 52,
                    height: 52,
                    marginTop: -26,
                    marginLeft: -26,
                    transformOrigin: '50% 80%',
                    ['--start-r' as any]: `${angle}deg`,
                    ['--end-r' as any]: `${angle}deg`,
                    ['--fly-r' as any]: `${angle}deg`,
                    ['--fly-x' as any]: `${Math.sin((angle * Math.PI) / 180) * 160}px`,
                    animation: isFly
                      ? `rfPetalFly .6s ${i * 0.04}s ease-in forwards`
                      : isOpen
                        ? `rfPetalUnfold 1.3s ${i * 0.08}s cubic-bezier(.34,1.56,.64,1) both`
                        : undefined,
                    opacity: isOpen ? 1 : 0,
                  }}>
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <ellipse cx="26" cy="34" rx="14" ry="20" fill={colors[i]} opacity=".88" />
                    </svg>
                  </div>
                );
              })}

              {/* Inner circle / bud */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, #FCE4EC 0%, #F06292 50%, #B5224A 100%)',
                border: '2px solid rgba(233,30,140,.3)',
                position: 'relative',
                zIndex: 2,
                animation: isBloomOpen ? 'rfCenterBloom .5s .2s ease-out both' : undefined,
                opacity: isBloomOpen ? 1 : 1,
                boxShadow: '0 4px 20px rgba(233,30,140,.25)',
              }} />
            </div>

            {/* Hint */}
            {phase === 'idle' && (
              <>
                <p style={{ position: 'absolute', top: '28%', left: '50%', transform: 'translateX(-50%)', color: 'rgba(176,42,100,.8)', fontSize: 'clamp(1.3rem, 5vw, 1.7rem)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{coupleNames}</p>
                <p style={{ position: 'absolute', bottom: '14%', left: '50%', color: 'rgba(176,42,100,.65)', fontSize: 12, letterSpacing: '.12em', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'rfHint 2s ease-in-out infinite' }}>
                  ✦ Touchez la rose pour ouvrir ✦
                </p>
              </>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #FFF5F8 0%, #FCE8EF 40%, #FFF5F8 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              <div className="rf-r0" style={{ marginBottom: 28 }}>
                <svg width="220" height="40" viewBox="0 0 220 40" fill="none">
                  <line x1="0" y1="20" x2="80" y2="20" stroke="#E91E8C" strokeWidth=".5" opacity=".3" />
                  {[0,1,2,3,4].map(i => (
                    <ellipse key={i} cx={95 + i*8} cy={20 - (i === 2 ? 6 : i % 2 === 0 ? 3 : 0)} rx="5" ry="3" fill="#F48FB1" opacity=".5" transform={`rotate(${i*15 - 30} ${95 + i*8} ${20 - (i === 2 ? 6 : i % 2 === 0 ? 3 : 0)})`} />
                  ))}
                  <line x1="135" y1="20" x2="220" y2="20" stroke="#E91E8C" strokeWidth=".5" opacity=".3" />
                </svg>
              </div>

              <p className="rf-r1" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 28, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Ensemble pour toujours</p>

              <h1 className="rf-r2 rf-rose-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>

              <p className="rf-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 40, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>vous invitent à leur mariage</p>

              <div className="rf-r4" style={{ marginBottom: 40 }}>
                <svg width="200" height="22" viewBox="0 0 200 22" fill="none">
                  <line x1="0" y1="11" x2="80" y2="11" stroke="#F48FB1" strokeWidth=".5" />
                  <path d="M89 5 Q100 1 111 5 Q100 11 89 5Z" fill="#F48FB1" opacity=".6" />
                  <circle cx="100" cy="11" r="2" fill="#E91E8C" opacity=".7" />
                  <path d="M89 17 Q100 21 111 17 Q100 11 89 17Z" fill="#F48FB1" opacity=".4" />
                  <line x1="120" y1="11" x2="200" y2="11" stroke="#F48FB1" strokeWidth=".5" />
                </svg>
              </div>

              <div className="rf-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: '#3D1022', letterSpacing: '.02em' }}>{date}</p>
              </div>

              <div className="rf-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 300, color: '#5C2A3C', lineHeight: 1.4 }}>{lieu}</p>
              </div>

              {message && (
                <div className="rf-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(233,30,140,.2)', borderBottom: '.5px solid rgba(233,30,140,.2)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#5C2A3C', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="rf-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid #E91E8C', borderRadius: 2, color: '#B5224A', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
                    onClick={() => document.getElementById('rf-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#B5447A', marginTop: 6 }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="rf-rsvp" style={{ borderTop: '.5px solid rgba(233,30,140,.18)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#B5447A', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontStyle: 'italic', fontWeight: 300, color: '#3D1022', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(255,245,248,.85)', border: '1px solid rgba(233,30,140,.18)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#E91E8C" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#CC90AC', letterSpacing: '.05em', fontFamily: "'Lato', sans-serif" }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#E91E8C', textDecoration: 'none' }}>InstantMariage.fr</a>
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
