'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'lines-extend' | 'frame-complete' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'lines-extend': 1100,
  'frame-complete': 420,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'lines-extend': 'frame-complete',
  'frame-complete': 'revealing',
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

export default function ModerneMinimalInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('lines-extend'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'lines-extend', 'frame-complete'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());

  const lineAnim = phase === 'lines-extend' || phase === 'frame-complete';
  const frameDone = phase === 'frame-complete';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Inter:wght@200;300;400&display=swap');
        .mm * { box-sizing: border-box; }
        @keyframes mmDot {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: .5; }
        }
        @keyframes mmLineH {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mmLineV {
          from { stroke-dashoffset: 400; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mmHint {
          0%,100% { opacity: .5; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 1; transform: translate(-50%,-50%) scale(1.04); }
        }
        @keyframes mmFrameFlash {
          0%  { opacity: 1; }
          50% { opacity: .2; }
          100%{ opacity: 1; }
        }
        @keyframes mmSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mmSlideIn {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }
        .mm-r0 { animation: mmSlideUp .65s 0s ease-out both; }
        .mm-r1 { animation: mmSlideUp .65s .18s ease-out both; }
        .mm-r2 { animation: mmSlideUp .65s .38s ease-out both; }
        .mm-r3 { animation: mmSlideUp .65s .58s ease-out both; }
        .mm-r4 { animation: mmSlideUp .65s .78s ease-out both; }
        .mm-r5 { animation: mmSlideUp .65s .98s ease-out both; }
        .mm-r6 { animation: mmSlideUp .65s 1.2s ease-out both; }
        .mm-r7 { animation: mmSlideUp .65s 1.45s ease-out both; }
        .mm-line-in { animation: mmSlideIn .4s ease-out both; transform-origin: left; }
      `}</style>

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="mm" style={{ position: 'relative', width: '100%', fontFamily: "'Cormorant Garamond', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('lines-extend'); }}>

            {/* Geometric line drawing SVG */}
            <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
              {/* Horizontal lines from center */}
              {lineAnim && <>
                <line x1="400" y1="300" x2="0" y2="300" stroke="white" strokeWidth=".6" opacity=".3"
                  style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'mmLineH 1s ease-out forwards' }} />
                <line x1="400" y1="300" x2="800" y2="300" stroke="white" strokeWidth=".6" opacity=".3"
                  style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'mmLineH 1s .05s ease-out forwards' }} />
                {/* Vertical */}
                <line x1="400" y1="300" x2="400" y2="0" stroke="white" strokeWidth=".6" opacity=".3"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'mmLineV 1s .1s ease-out forwards' }} />
                <line x1="400" y1="300" x2="400" y2="600" stroke="white" strokeWidth=".6" opacity=".3"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'mmLineV 1s .15s ease-out forwards' }} />
                {/* Rectangle frame */}
                <rect x="120" y="80" width="560" height="440" fill="none" stroke="white" strokeWidth=".8" opacity=".2"
                  style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'mmLineH 1.1s .2s ease-out forwards' }} />
                {/* Inner rectangle */}
                <rect x="160" y="120" width="480" height="360" fill="none" stroke="white" strokeWidth=".4" opacity=".12"
                  style={{ strokeDasharray: 1680, strokeDashoffset: 1680, animation: 'mmLineH 1.1s .35s ease-out forwards' }} />
                {/* Corner marks */}
                <path d="M120 100 L120 80 L140 80" stroke="white" strokeWidth="1.2" fill="none" opacity=".6"
                  style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'mmLineH .5s .4s ease-out forwards' }} />
                <path d="M660 100 L660 80 L640 80" stroke="white" strokeWidth="1.2" fill="none" opacity=".6"
                  style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'mmLineH .5s .45s ease-out forwards' }} />
                <path d="M120 500 L120 520 L140 520" stroke="white" strokeWidth="1.2" fill="none" opacity=".6"
                  style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'mmLineH .5s .5s ease-out forwards' }} />
                <path d="M660 500 L660 520 L640 520" stroke="white" strokeWidth="1.2" fill="none" opacity=".6"
                  style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'mmLineH .5s .55s ease-out forwards' }} />
              </>}

              {/* Flash effect on frame-complete */}
              {frameDone && (
                <rect x="120" y="80" width="560" height="440" fill="none" stroke="white" strokeWidth="2" opacity=".8"
                  style={{ animation: 'mmFrameFlash .4s ease-in-out' }} />
              )}
            </svg>

            {/* Center element */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', margin: '0 auto', animation: phase === 'idle' ? 'mmDot 2s ease-in-out infinite' : undefined }} />
              {phase === 'idle' && (
                <p style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.45)', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', fontWeight: 200 }}>
                  Touchez pour révéler
                </p>
              )}
              {lineAnim && (
                <p style={{ marginTop: 28, color: 'rgba(255,255,255,.7)', fontSize: 'clamp(1.4rem, 6vw, 2.2rem)', fontStyle: 'italic', fontWeight: 300, letterSpacing: '.04em' }}>{coupleNames}</p>
              )}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: '#FAFAFA', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              <div className="mm-r0" style={{ marginBottom: 32 }}>
                <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
                  <line x1="0" y1="12" x2="95" y2="12" stroke="#1A1A1A" strokeWidth=".5" opacity=".3" />
                  <rect x="100" y="7" width="20" height="10" fill="none" stroke="#1A1A1A" strokeWidth=".8" opacity=".5" />
                  <line x1="125" y1="12" x2="220" y2="12" stroke="#1A1A1A" strokeWidth=".5" opacity=".3" />
                </svg>
              </div>

              <p className="mm-r1" style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: '#888', marginBottom: 28, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>Mariage</p>

              <h1 className="mm-r2" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.6rem)', fontWeight: 300, fontStyle: 'italic', color: '#111', lineHeight: 1.08, marginBottom: 8 }}>{coupleNames}</h1>

              <p className="mm-r3" style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: '#888', marginBottom: 40, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>vous invitent à leur mariage</p>

              <div className="mm-r4" style={{ marginBottom: 40 }}>
                <div style={{ height: .5, background: '#1A1A1A', opacity: .15, marginBottom: 24 }} />
              </div>

              <div className="mm-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: '#999', marginBottom: 8, fontFamily: "'Inter', sans-serif", fontWeight: 200 }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 300, color: '#111', letterSpacing: '.03em' }}>{date}</p>
              </div>

              <div className="mm-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: '#999', marginBottom: 8, fontFamily: "'Inter', sans-serif", fontWeight: 200 }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 300, color: '#333', lineHeight: 1.45 }}>{lieu}</p>
              </div>

              {message && (
                <div className="mm-r7" style={{ marginBottom: 44, padding: '18px 24px', borderLeft: '2px solid #1A1A1A', textAlign: 'left' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#555', lineHeight: 1.75 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="mm-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '11px 36px', background: '#111', color: '#FFF', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                    onClick={() => document.getElementById('mm-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#999', marginTop: 8, fontFamily: "'Inter', sans-serif" }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              <div style={{ height: .5, background: '#1A1A1A', opacity: .12, marginBottom: 64 }} />

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="mm-rsvp" style={{ paddingTop: 48, marginTop: 8 }}>
                  <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#888', marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Répondre</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontStyle: 'italic', fontWeight: 300, color: '#111', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: '#FFF', border: '1px solid rgba(0,0,0,.1)', borderRadius: 4, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#111111" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 52, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#BBB', letterSpacing: '.05em', fontFamily: "'Inter', sans-serif" }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#888', textDecoration: 'none' }}>InstantMariage.fr</a>
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
