'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'branches-part' | 'reveal-start' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'branches-part': 1400,
  'reveal-start': 380,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'branches-part': 'reveal-start',
  'reveal-start': 'revealing',
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

const LEAVES = Array.from({ length: 16 }, (_, i) => ({
  cx: 10 + (i * 6.1) % 80,
  cy: 5 + (i * 4.3) % 60,
  rx: 4 + (i % 3),
  ry: 2 + (i % 2),
  r: -30 + (i * 14) % 60,
  opacity: 0.25 + (i % 4) * 0.1,
}));

export default function ProvenceOlivierInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('branches-part'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'branches-part', 'reveal-start'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());
  const isParting = phase === 'branches-part' || phase === 'reveal-start';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap');
        .po * { box-sizing: border-box; }
        @keyframes poLeafSway {
          0%,100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }
        @keyframes poBranchLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-52vw); }
        }
        @keyframes poBranchRight {
          from { transform: translateX(0); }
          to   { transform: translateX(52vw); }
        }
        @keyframes poHint {
          0%,100% { opacity: .65; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 1; transform: translateX(-50%) translateY(6px); }
        }
        @keyframes poFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
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

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="po" style={{ position: 'relative', width: '100%', fontFamily: "'EB Garamond', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #F3EDF7 0%, #EDE3F5 35%, #F5F0E8 65%, #EDE3F5 100%)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('branches-part'); }}>

            {/* Left branch */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0, bottom: 0,
              width: '50%',
              marginLeft: -400,
              display: 'flex',
              alignItems: 'center',
              animation: isParting ? 'poBranchLeft 1.35s cubic-bezier(.4,0,.2,1) forwards' : undefined,
            }}>
              <svg width="400" height="500" viewBox="0 0 400 500" fill="none" style={{ position: 'absolute', right: 0 }}>
                {/* Main branch */}
                <path d="M380 250 Q320 200 260 210 Q180 225 120 180 Q80 160 40 140" stroke="#556B2F" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M260 210 Q240 170 220 140 Q200 110 180 90" stroke="#556B2F" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M180 220 Q160 190 130 200 Q100 210 70 195" stroke="#556B2F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M320 205 Q310 175 295 160" stroke="#556B2F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Leaves */}
                {[
                  { x: 200, y: 200, r: -25 }, { x: 170, y: 185, r: 15 }, { x: 240, y: 175, r: -40 },
                  { x: 280, y: 190, r: 20 }, { x: 150, y: 210, r: -15 }, { x: 220, y: 155, r: 30 },
                  { x: 190, y: 140, r: -35 }, { x: 120, y: 185, r: 10 }, { x: 90, y: 170, r: -20 },
                  { x: 310, y: 175, r: 25 }, { x: 300, y: 155, r: -10 }, { x: 260, y: 148, r: 40 },
                  { x: 160, y: 160, r: -30 }, { x: 130, y: 197, r: 15 },
                ].map((l, i) => (
                  <ellipse key={i} cx={l.x} cy={l.y} rx="12" ry="6" fill="#6B8E4E" opacity=".75" transform={`rotate(${l.r} ${l.x} ${l.y})`}
                    style={{ animation: `poLeafSway ${2.5 + i * 0.15}s ${i * 0.2}s ease-in-out infinite`, transformOrigin: `${l.x}px ${l.y}px` }} />
                ))}
                {/* Small lavender flowers */}
                {[{ x: 220, y: 138 }, { x: 190, y: 128 }, { x: 150, y: 165 }, { x: 265, y: 145 }].map((f, i) => (
                  <g key={i}>
                    <circle cx={f.x} cy={f.y} r="4" fill="#9C8FD8" opacity=".65" />
                    <circle cx={f.x} cy={f.y} r="2" fill="#D8D0F5" opacity=".8" />
                  </g>
                ))}
              </svg>
            </div>

            {/* Right branch (mirrored) */}
            <div style={{
              position: 'absolute',
              right: '50%',
              top: 0, bottom: 0,
              width: '50%',
              marginRight: -400,
              display: 'flex',
              alignItems: 'center',
              animation: isParting ? 'poBranchRight 1.35s cubic-bezier(.4,0,.2,1) forwards' : undefined,
            }}>
              <svg width="400" height="500" viewBox="0 0 400 500" fill="none" style={{ position: 'absolute', left: 0, transform: 'scaleX(-1)' }}>
                <path d="M380 250 Q320 200 260 210 Q180 225 120 180 Q80 160 40 140" stroke="#556B2F" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M260 210 Q240 170 220 140 Q200 110 180 90" stroke="#556B2F" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M180 220 Q160 190 130 200 Q100 210 70 195" stroke="#556B2F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M320 205 Q310 175 295 160" stroke="#556B2F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {[
                  { x: 200, y: 200, r: -25 }, { x: 170, y: 185, r: 15 }, { x: 240, y: 175, r: -40 },
                  { x: 280, y: 190, r: 20 }, { x: 150, y: 210, r: -15 }, { x: 220, y: 155, r: 30 },
                  { x: 190, y: 140, r: -35 }, { x: 120, y: 185, r: 10 }, { x: 90, y: 170, r: -20 },
                  { x: 310, y: 175, r: 25 }, { x: 300, y: 155, r: -10 }, { x: 260, y: 148, r: 40 },
                ].map((l, i) => (
                  <ellipse key={i} cx={l.x} cy={l.y} rx="12" ry="6" fill="#6B8E4E" opacity=".75" transform={`rotate(${l.r} ${l.x} ${l.y})`}
                    style={{ animation: `poLeafSway ${2.5 + i * 0.15}s ${i * 0.2}s ease-in-out infinite`, transformOrigin: `${l.x}px ${l.y}px` }} />
                ))}
                {[{ x: 220, y: 138 }, { x: 190, y: 128 }, { x: 150, y: 165 }].map((f, i) => (
                  <g key={i}>
                    <circle cx={f.x} cy={f.y} r="4" fill="#9C8FD8" opacity=".65" />
                    <circle cx={f.x} cy={f.y} r="2" fill="#D8D0F5" opacity=".8" />
                  </g>
                ))}
              </svg>
            </div>

            {/* Center text */}
            <div style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
              <p style={{ color: 'rgba(94,53,177,.6)', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Faire-part de mariage</p>
              <p style={{ color: '#4A2E7A', fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontStyle: 'italic', fontWeight: 400 }}>{coupleNames}</p>
            </div>

            {phase === 'idle' && (
              <p style={{ position: 'absolute', bottom: '12%', left: '50%', color: 'rgba(94,53,177,.6)', fontSize: 12, letterSpacing: '.12em', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'poHint 2s ease-in-out infinite' }}>
                ✦ Touchez pour ouvrir ✦
              </p>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #F5F0FA 0%, #EDE3F5 30%, #F5F0FA 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

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

              <p className="po-r1" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 28, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>Sous les oliviers de Provence</p>

              <h1 className="po-r2 po-lavender-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>

              <p className="po-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 40, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>vous invitent à leur mariage</p>

              <div className="po-r4" style={{ marginBottom: 40 }}>
                <svg width="200" height="24" viewBox="0 0 200 24" fill="none">
                  <line x1="0" y1="12" x2="72" y2="12" stroke="#7B52D3" strokeWidth=".5" opacity=".35" />
                  <ellipse cx="86" cy="10" rx="8" ry="4" fill="#6B8E4E" opacity=".35" transform="rotate(-15 86 10)" />
                  <ellipse cx="100" cy="14" rx="8" ry="4" fill="#6B8E4E" opacity=".4" />
                  <ellipse cx="114" cy="10" rx="8" ry="4" fill="#6B8E4E" opacity=".35" transform="rotate(15 114 10)" />
                  <line x1="128" y1="12" x2="200" y2="12" stroke="#7B52D3" strokeWidth=".5" opacity=".35" />
                </svg>
              </div>

              <div className="po-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: '#2E1B5A', letterSpacing: '.02em' }}>{date}</p>
              </div>

              <div className="po-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7B52D3', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 400, color: '#4A2E7A', lineHeight: 1.4 }}>{lieu}</p>
              </div>

              {message && (
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
