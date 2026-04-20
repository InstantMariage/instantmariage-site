'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'lines-extend' | 'frame-complete' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'lines-extend': 1200,
  'frame-complete': 480,
  'revealing': 2400,
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Raleway:wght@200;300;400;500&display=swap');
        .mm * { box-sizing: border-box; }

        @keyframes mmPulse {
          0%,100% { transform: scale(1); opacity: .9; box-shadow: 0 0 0 0 rgba(201,168,76,.4); }
          50%      { transform: scale(1.08); opacity: 1; box-shadow: 0 0 0 8px rgba(201,168,76,0); }
        }
        @keyframes mmLineH {
          from { stroke-dashoffset: 800; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mmLineV {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mmDiag {
          from { stroke-dashoffset: 400; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes mmFlash {
          0%   { opacity: 0; }
          30%  { opacity: .9; }
          100% { opacity: .25; }
        }
        @keyframes mmFadeReveal {
          0%  { opacity: 0; transform: translateY(14px); }
          100%{ opacity: 1; transform: translateY(0); }
        }
        @keyframes mmSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mmHint {
          0%,100% { opacity: .4; transform: translateX(-50%) scale(1); }
          50%      { opacity: .8; transform: translateX(-50%) scale(1.02); }
        }
        @keyframes mmGoldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .mm-r0 { animation: mmSlideUp .7s 0s ease-out both; }
        .mm-r1 { animation: mmSlideUp .7s .2s ease-out both; }
        .mm-r2 { animation: mmSlideUp .7s .42s ease-out both; }
        .mm-r3 { animation: mmSlideUp .7s .64s ease-out both; }
        .mm-r4 { animation: mmSlideUp .7s .85s ease-out both; }
        .mm-r5 { animation: mmSlideUp .7s 1.05s ease-out both; }
        .mm-r6 { animation: mmSlideUp .7s 1.28s ease-out both; }
        .mm-r7 { animation: mmSlideUp .7s 1.52s ease-out both; }
        .mm-r8 { animation: mmSlideUp .7s 1.78s ease-out both; }
      `}</style>

      {/* Minimal corner marks frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
        {/* TL */}
        <div style={{ position: 'absolute', top: 20, left: 20, width: 24, height: 24, borderTop: '1.5px solid rgba(201,168,76,.6)', borderLeft: '1.5px solid rgba(201,168,76,.6)' }} />
        {/* TR */}
        <div style={{ position: 'absolute', top: 20, right: 20, width: 24, height: 24, borderTop: '1.5px solid rgba(201,168,76,.6)', borderRight: '1.5px solid rgba(201,168,76,.6)' }} />
        {/* BL */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, width: 24, height: 24, borderBottom: '1.5px solid rgba(201,168,76,.6)', borderLeft: '1.5px solid rgba(201,168,76,.6)' }} />
        {/* BR */}
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: 24, height: 24, borderBottom: '1.5px solid rgba(201,168,76,.6)', borderRight: '1.5px solid rgba(201,168,76,.6)' }} />
      </div>

      <div className="mm" style={{
        position: 'relative', width: '100%',
        fontFamily: "'Cormorant Garamond', serif",
        minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0,
        height: fixedHeight ?? undefined
      }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default'
            }}
            onClick={() => { if (phase === 'idle') setPhase('lines-extend'); }}
          >
            {/* Geometric construction SVG */}
            <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
              style={{ position: 'absolute', inset: 0 }}>

              {lineAnim && <>
                {/* Primary cross lines */}
                <line x1="400" y1="300" x2="0" y2="300" stroke="#C9A84C" strokeWidth=".5" opacity=".35"
                  style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'mmLineH .9s ease-out forwards' }} />
                <line x1="400" y1="300" x2="800" y2="300" stroke="#C9A84C" strokeWidth=".5" opacity=".35"
                  style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'mmLineH .9s .05s ease-out forwards' }} />
                <line x1="400" y1="300" x2="400" y2="0" stroke="#C9A84C" strokeWidth=".5" opacity=".35"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'mmLineV .9s .1s ease-out forwards' }} />
                <line x1="400" y1="300" x2="400" y2="600" stroke="#C9A84C" strokeWidth=".5" opacity=".35"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'mmLineV .9s .15s ease-out forwards' }} />

                {/* Outer rectangle */}
                <rect x="100" y="70" width="600" height="460" fill="none" stroke="white" strokeWidth=".6" opacity=".12"
                  style={{ strokeDasharray: 2120, strokeDashoffset: 2120, animation: 'mmLineH 1.1s .18s ease-out forwards' }} />

                {/* Golden inner rectangle */}
                <rect x="148" y="110" width="504" height="380" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".22"
                  style={{ strokeDasharray: 1768, strokeDashoffset: 1768, animation: 'mmLineH 1.1s .3s ease-out forwards' }} />

                {/* Diagonal accents */}
                <line x1="100" y1="70" x2="220" y2="190" stroke="#C9A84C" strokeWidth=".5" opacity=".18"
                  style={{ strokeDasharray: 170, strokeDashoffset: 170, animation: 'mmDiag .6s .45s ease-out forwards' }} />
                <line x1="700" y1="70" x2="580" y2="190" stroke="#C9A84C" strokeWidth=".5" opacity=".18"
                  style={{ strokeDasharray: 170, strokeDashoffset: 170, animation: 'mmDiag .6s .5s ease-out forwards' }} />
                <line x1="100" y1="530" x2="220" y2="410" stroke="#C9A84C" strokeWidth=".5" opacity=".18"
                  style={{ strokeDasharray: 170, strokeDashoffset: 170, animation: 'mmDiag .6s .55s ease-out forwards' }} />
                <line x1="700" y1="530" x2="580" y2="410" stroke="#C9A84C" strokeWidth=".5" opacity=".18"
                  style={{ strokeDasharray: 170, strokeDashoffset: 170, animation: 'mmDiag .6s .6s ease-out forwards' }} />

                {/* Corner bracket marks */}
                <path d="M100 90 L100 70 L120 70" stroke="#C9A84C" strokeWidth="1.4" fill="none" opacity=".7"
                  style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'mmLineH .4s .42s ease-out forwards' }} />
                <path d="M700 90 L700 70 L680 70" stroke="#C9A84C" strokeWidth="1.4" fill="none" opacity=".7"
                  style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'mmLineH .4s .47s ease-out forwards' }} />
                <path d="M100 510 L100 530 L120 530" stroke="#C9A84C" strokeWidth="1.4" fill="none" opacity=".7"
                  style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'mmLineH .4s .52s ease-out forwards' }} />
                <path d="M700 510 L700 530 L680 530" stroke="#C9A84C" strokeWidth="1.4" fill="none" opacity=".7"
                  style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'mmLineH .4s .57s ease-out forwards' }} />

                {/* Center small diamond */}
                <path d="M400 280 L415 300 L400 320 L385 300 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".4"
                  style={{ strokeDasharray: 80, strokeDashoffset: 80, animation: 'mmLineH .5s .62s ease-out forwards' }} />
              </>}

              {/* Flash on frame-complete */}
              {frameDone && (
                <rect x="100" y="70" width="600" height="460" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity=".0"
                  style={{ animation: 'mmFlash .48s ease-out forwards' }} />
              )}
            </svg>

            {/* Center content */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none' }}>
              {phase === 'idle' && (
                <>
                  <div style={{
                    width: 7, height: 7, background: '#C9A84C', margin: '0 auto 18px',
                    transform: 'rotate(45deg)',
                    animation: 'mmPulse 2.4s ease-in-out infinite'
                  }} />
                  <p style={{
                    position: 'absolute', top: 32, left: '50%',
                    color: 'rgba(255,255,255,.38)', fontSize: 10,
                    letterSpacing: '.28em', textTransform: 'uppercase',
                    fontFamily: "'Raleway', sans-serif", fontWeight: 200,
                    whiteSpace: 'nowrap', animation: 'mmHint 2.4s ease-in-out infinite'
                  }}>
                    Touchez pour révéler
                  </p>
                </>
              )}
              {lineAnim && (
                <div style={{ animation: 'mmFadeReveal .6s .5s ease-out both', opacity: 0 }}>
                  <p style={{
                    fontSize: 9, letterSpacing: '.38em', textTransform: 'uppercase',
                    color: 'rgba(201,168,76,.7)', marginBottom: 12,
                    fontFamily: "'Raleway', sans-serif", fontWeight: 200
                  }}>Mariage</p>
                  <p style={{
                    fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
                    fontStyle: 'italic', fontWeight: 300,
                    color: 'rgba(255,255,255,.9)', letterSpacing: '.04em'
                  }}>{coupleNames}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: '#F8F5F0', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 440, margin: '0 auto', padding: '80px 32px 108px', textAlign: 'center' }}>

              {/* Top geometric ornament */}
              <div className="mm-r0" style={{ marginBottom: 36 }}>
                <svg width="240" height="28" viewBox="0 0 240 28" fill="none">
                  <line x1="0" y1="14" x2="96" y2="14" stroke="#1A1A1A" strokeWidth=".5" opacity=".18" />
                  <path d="M100 7 L110 14 L100 21 L90 14 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".65" />
                  <path d="M110 14 L120 7 L130 14 L120 21 Z" fill="#C9A84C" opacity=".12" stroke="#C9A84C" strokeWidth=".6" />
                  <path d="M130 7 L140 14 L130 21 L120 14 Z" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".65" />
                  <line x1="144" y1="14" x2="240" y2="14" stroke="#1A1A1A" strokeWidth=".5" opacity=".18" />
                </svg>
              </div>

              <p className="mm-r1" style={{
                fontSize: 9, letterSpacing: '.36em', textTransform: 'uppercase',
                color: '#C9A84C', marginBottom: 26,
                fontFamily: "'Raleway', sans-serif", fontWeight: 300
              }}>Mariage</p>

              <h1 className="mm-r2" style={{
                fontSize: 'clamp(2.6rem, 9.5vw, 3.8rem)',
                fontWeight: 300, fontStyle: 'italic',
                color: '#111',
                lineHeight: 1.06, marginBottom: 6,
                letterSpacing: '.02em'
              }}>{coupleNames}</h1>

              <p className="mm-r3" style={{
                fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase',
                color: '#888', marginBottom: 40,
                fontFamily: "'Raleway', sans-serif", fontWeight: 300
              }}>vous invitent à leur mariage</p>

              {/* Gold divider */}
              <div className="mm-r4" style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: .5, background: '#C9A84C', opacity: .35 }} />
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="#C9A84C" opacity=".6" />
                </svg>
                <div style={{ flex: 1, height: .5, background: '#C9A84C', opacity: .35 }} />
              </div>

              <div className="mm-r5" style={{
                marginBottom: 24,
                padding: '20px 24px',
                border: '1px solid rgba(26,26,26,.08)',
                background: 'rgba(255,255,255,.7)'
              }}>
                <p style={{
                  fontSize: 9, letterSpacing: '.38em', textTransform: 'uppercase',
                  color: '#C9A84C', marginBottom: 8,
                  fontFamily: "'Raleway', sans-serif", fontWeight: 200
                }}>Le</p>
                <p style={{
                  fontSize: 'clamp(1.25rem, 5.5vw, 1.7rem)',
                  fontWeight: 300, color: '#111', letterSpacing: '.04em'
                }}>{date}</p>
              </div>

              <div className="mm-r6" style={{ marginBottom: message ? 40 : 52 }}>
                <p style={{
                  fontSize: 9, letterSpacing: '.38em', textTransform: 'uppercase',
                  color: '#C9A84C', marginBottom: 8,
                  fontFamily: "'Raleway', sans-serif", fontWeight: 200
                }}>À</p>
                <p style={{
                  fontSize: 'clamp(1rem, 4.5vw, 1.25rem)',
                  fontStyle: 'italic', fontWeight: 300, color: '#444', lineHeight: 1.5
                }}>{lieu}</p>
              </div>

              {message && (
                <div className="mm-r7" style={{
                  marginBottom: 48,
                  padding: '22px 28px',
                  borderLeft: '2px solid #C9A84C',
                  background: 'rgba(255,255,255,.6)',
                  textAlign: 'left'
                }}>
                  <p style={{
                    fontSize: 'clamp(.9rem, 3.8vw, 1.05rem)',
                    fontStyle: 'italic', fontWeight: 300, color: '#555', lineHeight: 1.78
                  }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="mm-r8" style={{ marginBottom: 48 }}>
                  <button
                    style={{
                      display: 'inline-block', padding: '13px 40px',
                      background: '#111', color: '#C9A84C',
                      border: '1px solid #111',
                      fontSize: 10, letterSpacing: '.22em',
                      textTransform: 'uppercase', cursor: 'pointer',
                      fontFamily: "'Raleway', sans-serif", fontWeight: 400,
                      transition: 'all .25s'
                    }}
                    onMouseEnter={e => {
                      const el = e.target as HTMLElement;
                      el.style.background = '#C9A84C';
                      el.style.color = '#111';
                    }}
                    onMouseLeave={e => {
                      const el = e.target as HTMLElement;
                      el.style.background = '#111';
                      el.style.color = '#C9A84C';
                    }}
                    onClick={() => document.getElementById('mm-rsvp')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Confirmer ma présence
                  </button>
                  {rsvpDeadline && (
                    <p style={{
                      fontSize: 11, color: '#AAA', marginTop: 8,
                      fontFamily: "'Raleway', sans-serif", fontWeight: 300
                    }}>
                      Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )}

              {/* Bottom geometric ornament */}
              <div style={{ marginBottom: 64 }}>
                <svg width="220" height="20" viewBox="0 0 220 20" fill="none">
                  <line x1="0" y1="10" x2="90" y2="10" stroke="#1A1A1A" strokeWidth=".5" opacity=".15" />
                  <path d="M94 4 L100 10 L94 16 L88 10 Z" fill="none" stroke="#C9A84C" strokeWidth=".7" opacity=".55" />
                  <circle cx="110" cy="10" r="2.5" fill="none" stroke="#C9A84C" strokeWidth=".7" opacity=".4" />
                  <path d="M120 4 L126 10 L120 16 L114 10 Z" fill="none" stroke="#C9A84C" strokeWidth=".7" opacity=".55" />
                  <line x1="130" y1="10" x2="220" y2="10" stroke="#1A1A1A" strokeWidth=".5" opacity=".15" />
                </svg>
              </div>

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="mm-rsvp" style={{
                  paddingTop: 52, marginTop: 8,
                  borderTop: '1px solid rgba(26,26,26,.08)'
                }}>
                  <p style={{
                    fontSize: 9, letterSpacing: '.34em', textTransform: 'uppercase',
                    color: '#C9A84C', marginBottom: 8,
                    fontFamily: "'Raleway', sans-serif", fontWeight: 300
                  }}>Répondre</p>
                  <p style={{
                    fontSize: 'clamp(1.4rem, 5.5vw, 1.9rem)',
                    fontStyle: 'italic', fontWeight: 300,
                    color: '#111', marginBottom: 26
                  }}>Confirmer ma présence</p>
                  <div style={{
                    background: '#FFF',
                    border: '1px solid rgba(26,26,26,.09)',
                    padding: '28px 20px'
                  }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#111111" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{
                    fontSize: 11, color: '#CCC', letterSpacing: '.06em',
                    fontFamily: "'Raleway', sans-serif", fontWeight: 300
                  }}>
                    Créé avec{' '}
                    <a href="https://instantmariage.fr" style={{ color: '#C9A84C', textDecoration: 'none' }}>InstantMariage.fr</a>
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
