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

export interface EleganceDoreeInteractiveProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  rsvpActif?: boolean;
  rsvpDeadline?: string | null;
  rsvpSlug?: string;
  autoPlay?: boolean;
  /** Set a fixed pixel height (for editor preview). Defaults to 100dvh. */
  fixedHeight?: number;
}

export default function EleganceDoreeInteractive({
  coupleNames,
  date,
  lieu,
  message,
  rsvpActif,
  rsvpDeadline,
  rsvpSlug,
  autoPlay = false,
  fixedHeight,
}: EleganceDoreeInteractiveProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [clipExpanded, setClipExpanded] = useState(false);

  const advance = useCallback(() => {
    setPhase(prev => NEXT[prev] ?? prev);
  }, []);

  // Auto-play mode: start after 1.6 s
  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('seal-burst'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  // Phase auto-advance
  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) {
      const t = setTimeout(advance, ms);
      return () => clearTimeout(t);
    }
  }, [phase, advance]);

  // Two-frame trick: set clip-path AFTER transition property is painted
  useEffect(() => {
    if (phase === 'expanding') {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setClipExpanded(true))
      );
      return () => cancelAnimationFrame(raf);
    }
    setClipExpanded(false);
  }, [phase]);

  const handleSealClick = () => {
    if (phase === 'idle') setPhase('seal-burst');
  };

  const showEnvelope = ['idle', 'seal-burst', 'flap-open'].includes(phase);
  const showLetter = !showEnvelope;
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';

  // Clip-path: starts small in letter-rise, expands in expanding (after double RAF)
  const letterClip = (): string => {
    if (phase === 'letter-rise') return 'ellipse(160px 120px at 50% 44%)';
    if (phase === 'expanding') return clipExpanded ? 'ellipse(120vmax 120vmax at 50% 44%)' : 'ellipse(160px 120px at 50% 44%)';
    return 'none';
  };

  const isRsvpOpen =
    !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap');

        .ed * { box-sizing: border-box; }

        @keyframes sealPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,.5), 0 4px 24px rgba(0,0,0,.45); }
          50%      { box-shadow: 0 0 0 11px rgba(201,168,76,0), 0 4px 32px rgba(201,168,76,.35); }
        }
        @keyframes sealCrack {
          0%   { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; filter:brightness(1); }
          25%  { transform: translate(-50%,-50%) scale(1.18) rotate(-6deg); filter:brightness(1.6); }
          60%  { transform: translate(-50%,-50%) scale(1.35) rotate(12deg); opacity:.85; }
          100% { transform: translate(-50%,-50%) scale(.05) rotate(40deg); opacity:0; }
        }
        @keyframes p1 { to { transform: translate(-60px,-65px) scale(0); opacity:0; } }
        @keyframes p2 { to { transform: translate(60px,-65px) scale(0); opacity:0; } }
        @keyframes p3 { to { transform: translate(-82px,4px) scale(0); opacity:0; } }
        @keyframes p4 { to { transform: translate(82px,4px) scale(0); opacity:0; } }
        @keyframes p5 { to { transform: translate(-42px,72px) scale(0); opacity:0; } }
        @keyframes p6 { to { transform: translate(42px,72px) scale(0); opacity:0; } }
        @keyframes p7 { to { transform: translate(-18px,-88px) scale(0); opacity:0; } }
        @keyframes p8 { to { transform: translate(18px,-88px) scale(0); opacity:0; } }
        @keyframes flapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes envelopeIn {
          from { transform: translateY(28px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
        @keyframes hintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity:.75; }
          50%      { transform: translateX(-50%) translateY(5px); opacity:1; }
        }
        @keyframes sparkle {
          0%,100% { opacity:0; transform:scale(0) rotate(0deg); }
          50%      { opacity:.65; transform:scale(1) rotate(180deg); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes goldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes letterReveal {
          from { clip-path: ellipse(160px 120px at 50% 44%); }
          to   { clip-path: ellipse(120vmax 120vmax at 50% 44%); }
        }
        @keyframes ornamentSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .ed-reveal-0  { animation: fadeInUp .75s 0s    ease-out both; }
        .ed-reveal-1  { animation: fadeInUp .75s .25s  ease-out both; }
        .ed-reveal-2  { animation: fadeInUp .75s .5s   ease-out both; }
        .ed-reveal-3  { animation: fadeInUp .75s .75s  ease-out both; }
        .ed-reveal-4  { animation: fadeInUp .75s 1.05s ease-out both; }
        .ed-reveal-5  { animation: fadeInUp .75s 1.35s ease-out both; }
        .ed-reveal-6  { animation: fadeInUp .75s 1.65s ease-out both; }
        .ed-reveal-7  { animation: fadeInUp .75s 1.95s ease-out both; }
        .ed-reveal-8  { animation: fadeInUp .75s 2.25s ease-out both; }

        .ed-gold-text {
          background: linear-gradient(120deg, #8B6914 0%, #C9A84C 30%, #F0D080 50%, #C9A84C 70%, #8B6914 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ed-gold-shimmer {
          animation: goldShimmer 4s 1s linear infinite;
        }
        .ed-letter-scroll {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .ed-letter-fixed {
          overflow: hidden;
        }
        .ed-rsvp-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(201,168,76,.35);
          border-radius: 10px;
          background: rgba(255,253,247,.9);
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          color: #2C1810;
          outline: none;
          transition: border-color .2s;
        }
        .ed-rsvp-input:focus { border-color: #C9A84C; }
        .ed-rsvp-input::placeholder { color: #A89070; }
      `}</style>

      <div
        className="ed"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: fixedHeight ? fixedHeight : showEnvelope ? '100dvh' : 0,
          height: fixedHeight ? fixedHeight : undefined,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* ── DARK SCENE (envelope phases) ─────────────────────────────────── */}
        {showEnvelope && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(155deg, #180E06 0%, #2A1A0C 55%, #1C1008 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 'inherit',
            }}
          >
            {/* Background gold sparkles */}
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: i % 3 === 0 ? 5 : 3,
                  height: i % 3 === 0 ? 5 : 3,
                  background: '#C9A84C',
                  borderRadius: '50%',
                  left: `${8 + (i * 6.2) % 86}%`,
                  top: `${4 + (i * 11.3) % 92}%`,
                  animation: `sparkle ${2.2 + (i * 0.28)}s ${i * 0.35}s infinite ease-in-out`,
                }}
              />
            ))}

            {/* Title hint above envelope */}
            {phase === 'idle' && (
              <div
                style={{
                  textAlign: 'center',
                  animation: 'envelopeIn 1s .6s ease-out both',
                  opacity: 0,
                  marginBottom: 40,
                  pointerEvents: 'none',
                }}
              >
                <p
                  style={{
                    color: 'rgba(201,168,76,.6)',
                    fontSize: 11,
                    letterSpacing: '.28em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Faire-part de mariage
                </p>
                <p
                  style={{
                    color: 'rgba(255,253,247,.85)',
                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                  }}
                >
                  {coupleNames}
                </p>
              </div>
            )}

            {/* Envelope */}
            <div
              style={{
                position: 'relative',
                width: 'min(92vw, 440px)',
                height: 'min(64.5vw, 308px)',
                animation: 'envelopeIn .8s .2s ease-out both',
              }}
            >
              {/* Envelope body */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(160deg, #FDF8EE 0%, #F0E8D5 100%)',
                  borderRadius: 12,
                  border: '1.5px solid #C9A84C',
                  boxShadow: '0 12px 48px rgba(0,0,0,.55), 0 2px 8px rgba(201,168,76,.18)',
                  overflow: 'hidden',
                }}
              >
                {/* Diagonal fold X lines */}
                <svg width="100%" height="100%" viewBox="0 0 308 216" style={{ position: 'absolute', inset: 0 }}>
                  <line x1="0" y1="216" x2="154" y2="108" stroke="#C9A84C" strokeWidth=".6" opacity=".3" />
                  <line x1="308" y1="216" x2="154" y2="108" stroke="#C9A84C" strokeWidth=".6" opacity=".3" />
                </svg>
              </div>

              {/* 3D flap */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '53.7%',
                  perspective: 1000,
                  perspectiveOrigin: '50% 0%',
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    transformOrigin: 'top center',
                    transformStyle: 'preserve-3d',
                    animation: phase === 'flap-open' ? 'flapOpen 1s .05s ease-in-out forwards' : undefined,
                  }}
                >
                  {/* Front face */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, #F5EDDA 0%, #EDD9B8 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                      borderTop: '1.5px solid #C9A84C',
                      borderLeft: '1.5px solid #C9A84C',
                      borderRight: '1.5px solid #C9A84C',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                  {/* Back face (inside flap) */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, #E0D0B8 0%, #C8B89A 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
                      transform: 'rotateX(180deg)',
                      backfaceVisibility: 'hidden',
                    }}
                  />
                </div>
              </div>

              {/* Wax seal */}
              {(phase === 'idle' || phase === 'seal-burst') && (
                <div
                  onClick={handleSealClick}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 38% 32%, #C0392B 0%, #8B1A1A 55%, #5C0E0E 100%)',
                    border: '2.5px solid #C9A84C',
                    cursor: phase === 'idle' ? 'pointer' : 'default',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation:
                      phase === 'idle'
                        ? 'sealPulse 2.2s ease-in-out infinite'
                        : 'sealCrack .52s ease-in forwards',
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* Inner ring + wedding rings SVG */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      border: '1px solid rgba(201,168,76,.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="38"
                      height="28"
                      viewBox="0 0 38 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <radialGradient id="ringGold1" cx="40%" cy="35%" r="60%">
                          <stop offset="0%" stopColor="#F5E07A" />
                          <stop offset="45%" stopColor="#C9A84C" />
                          <stop offset="100%" stopColor="#8A6A1A" />
                        </radialGradient>
                        <radialGradient id="ringGold2" cx="60%" cy="35%" r="60%">
                          <stop offset="0%" stopColor="#F5E07A" />
                          <stop offset="45%" stopColor="#C9A84C" />
                          <stop offset="100%" stopColor="#8A6A1A" />
                        </radialGradient>
                        {/* Mask to create interlocking: right ring passes behind left ring on bottom-left arc */}
                        <mask id="maskLeft">
                          <rect width="38" height="28" fill="white" />
                          {/* Hide the bottom-right portion of left ring where right ring passes in front */}
                          <circle cx="21" cy="14" r="9.5" fill="black" />
                        </mask>
                        <mask id="maskRight">
                          <rect width="38" height="28" fill="white" />
                          {/* Hide the bottom-left portion of right ring where left ring passes in front */}
                          <circle cx="17" cy="14" r="9.5" fill="black" />
                        </mask>
                      </defs>

                      {/* Left ring — back layer (partially hidden by right ring) */}
                      <circle
                        cx="17" cy="14" r="9.5"
                        stroke="url(#ringGold1)"
                        strokeWidth="3"
                        fill="none"
                        mask="url(#maskLeft)"
                      />
                      {/* Right ring — back layer (partially hidden by left ring) */}
                      <circle
                        cx="21" cy="14" r="9.5"
                        stroke="url(#ringGold2)"
                        strokeWidth="3"
                        fill="none"
                        mask="url(#maskRight)"
                      />
                      {/* Left ring — front arc (top half, passes in front of right ring) */}
                      <path
                        d="M 7.5 14 A 9.5 9.5 0 0 1 26.5 14"
                        stroke="url(#ringGold1)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Right ring — front arc (bottom half, passes in front of left ring) */}
                      <path
                        d="M 11.5 14 A 9.5 9.5 0 0 0 30.5 14"
                        stroke="url(#ringGold2)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Highlight shimmer on left ring */}
                      <path
                        d="M 9 8 A 9.5 9.5 0 0 1 17 4.5"
                        stroke="rgba(255,245,180,0.7)"
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Highlight shimmer on right ring */}
                      <path
                        d="M 21 4.5 A 9.5 9.5 0 0 1 29 8"
                        stroke="rgba(255,245,180,0.7)"
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Burst particles */}
                  {phase === 'seal-burst' &&
                    [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          width: i % 2 === 0 ? 9 : 6,
                          height: i % 2 === 0 ? 9 : 6,
                          borderRadius: i % 3 === 0 ? '50%' : 2,
                          background: i % 2 === 0 ? '#C9A84C' : '#C0392B',
                          top: '50%',
                          left: '50%',
                          marginTop: -4,
                          marginLeft: -4,
                          animation: `p${i} .52s ease-out forwards`,
                        }}
                      />
                    ))}
                </div>
              )}

              {/* Tap hint */}
              {phase === 'idle' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -40,
                    left: '50%',
                    color: 'rgba(201,168,76,.8)',
                    fontSize: 12,
                    letterSpacing: '.14em',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    animation: 'hintFloat 2s ease-in-out infinite',
                  }}
                >
                  ✦ Touchez le sceau pour ouvrir ✦
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── LETTER ───────────────────────────────────────────────────────── */}
        {showLetter && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              background: 'linear-gradient(180deg, #FFFDF7 0%, #FDF8EE 40%, #FFFDF7 100%)',
              clipPath: letterClip(),
              transition: showLetter ? 'clip-path .55s cubic-bezier(.25,.46,.45,.94)' : 'none',
            }}
          >
            {/* Letter content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: 420,
                margin: '0 auto',
                padding: '72px 28px 100px',
                textAlign: 'center',
              }}
            >
              {/* Top ornament */}
              {isRevealing && (
                <div className="ed-reveal-0" style={{ marginBottom: 28 }}>
                  <svg width="220" height="36" viewBox="0 0 220 36" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="18" x2="90" y2="18" stroke="#C9A84C" strokeWidth=".6" />
                    <path
                      d="M100 10 L110 18 L100 26 M120 10 L110 18 L120 26"
                      stroke="#C9A84C"
                      strokeWidth=".8"
                      fill="none"
                    />
                    <line x1="130" y1="18" x2="220" y2="18" stroke="#C9A84C" strokeWidth=".6" />
                  </svg>
                </div>
              )}

              {/* Together with their families */}
              {isRevealing && (
                <p
                  className="ed-reveal-1"
                  style={{
                    fontSize: 11,
                    letterSpacing: '.24em',
                    textTransform: 'uppercase',
                    color: '#9B8A6E',
                    marginBottom: 36,
                  }}
                >
                  Unis pour la vie
                </p>
              )}

              {/* Couple names */}
              {isRevealing && (
                <h1
                  className={`ed-reveal-2 ed-gold-text ed-gold-shimmer`}
                  style={{
                    fontSize: 'clamp(2.6rem, 10vw, 3.8rem)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    lineHeight: 1.08,
                    marginBottom: 6,
                    letterSpacing: '-.01em',
                  }}
                >
                  {coupleNames}
                </h1>
              )}

              {/* Subtitle */}
              {isRevealing && (
                <p
                  className="ed-reveal-3"
                  style={{
                    fontSize: 11,
                    letterSpacing: '.2em',
                    textTransform: 'uppercase',
                    color: '#9B8A6E',
                    marginBottom: 44,
                  }}
                >
                  vous invitent à leur mariage
                </p>
              )}

              {/* Diamond divider */}
              {isRevealing && (
                <div className="ed-reveal-4" style={{ marginBottom: 44 }}>
                  <svg width="260" height="22" viewBox="0 0 260 22" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <line x1="0" y1="11" x2="110" y2="11" stroke="#C9A84C" strokeWidth=".5" />
                    <path d="M120 5 L130 11 L120 17 L110 11 Z" fill="none" stroke="#C9A84C" strokeWidth=".9" />
                    <circle cx="130" cy="11" r="2" fill="#C9A84C" />
                    <path d="M140 5 L150 11 L140 17 L130 11 Z" fill="none" stroke="#C9A84C" strokeWidth=".9" />
                    <line x1="150" y1="11" x2="260" y2="11" stroke="#C9A84C" strokeWidth=".5" />
                  </svg>
                </div>
              )}

              {/* Date */}
              {isRevealing && (
                <div
                  className="ed-reveal-5"
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: '.32em',
                      textTransform: 'uppercase',
                      color: '#9B8A6E',
                      marginBottom: 8,
                    }}
                  >
                    Le
                  </p>
                  <p
                    style={{
                      fontSize: 'clamp(1.3rem, 5vw, 1.75rem)',
                      fontWeight: 400,
                      color: '#2C1810',
                      letterSpacing: '.02em',
                    }}
                  >
                    {date}
                  </p>
                </div>
              )}

              {/* Venue */}
              {isRevealing && (
                <div
                  className="ed-reveal-6"
                  style={{
                    marginBottom: message ? 44 : 56,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: '.32em',
                      textTransform: 'uppercase',
                      color: '#9B8A6E',
                      marginBottom: 8,
                    }}
                  >
                    À
                  </p>
                  <p
                    style={{
                      fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      color: '#4A3728',
                      lineHeight: 1.4,
                    }}
                  >
                    {lieu}
                  </p>
                </div>
              )}

              {/* Custom message */}
              {isRevealing && message && (
                <div
                  className="ed-reveal-7"
                  style={{
                    marginBottom: 56,
                    padding: '20px 24px',
                    borderTop: '.5px solid rgba(201,168,76,.3)',
                    borderBottom: '.5px solid rgba(201,168,76,.3)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'clamp(.9rem, 3.5vw, 1.05rem)',
                      fontStyle: 'italic',
                      color: '#6B5744',
                      lineHeight: 1.7,
                    }}
                  >
                    &ldquo;{message}&rdquo;
                  </p>
                </div>
              )}

              {/* RSVP invite */}
              {isRevealing && isRsvpOpen && (
                <div className="ed-reveal-8" style={{ marginBottom: 56 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '10px 36px',
                      border: '1px solid #C9A84C',
                      borderRadius: 2,
                      color: '#8B6914',
                      fontSize: 11,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const el = document.getElementById('ed-rsvp');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && (
                    <p
                      style={{
                        fontSize: 11,
                        color: '#9B8A6E',
                        marginTop: 6,
                        letterSpacing: '.05em',
                      }}
                    >
                      Réponse souhaitée avant le{' '}
                      {new Date(rsvpDeadline).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Bottom ornament */}
              {isRevealing && (
                <div style={{ marginBottom: 72 }}>
                  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                    <path
                      d="M10 16 Q30 6 60 16 Q90 26 110 16"
                      stroke="#C9A84C"
                      strokeWidth=".7"
                      fill="none"
                    />
                    <circle cx="60" cy="16" r="2.5" fill="#C9A84C" />
                    <circle cx="10" cy="16" r="1.5" fill="none" stroke="#C9A84C" strokeWidth=".6" />
                    <circle cx="110" cy="16" r="1.5" fill="none" stroke="#C9A84C" strokeWidth=".6" />
                  </svg>
                </div>
              )}

              {/* ── RSVP FORM ──────────────────────────────────────────────── */}
              {isComplete && isRsvpOpen && rsvpSlug && (
                <div
                  id="ed-rsvp"
                  style={{
                    borderTop: '.5px solid rgba(201,168,76,.25)',
                    paddingTop: 56,
                    marginTop: 16,
                  }}
                >
                  <div style={{ marginBottom: 32 }}>
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: '.3em',
                        textTransform: 'uppercase',
                        color: '#9B8A6E',
                        marginBottom: 10,
                      }}
                    >
                      Je réponds
                    </p>
                    <p
                      style={{
                        fontSize: 'clamp(1.4rem, 5vw, 1.8rem)',
                        fontStyle: 'italic',
                        fontWeight: 300,
                        color: '#2C1810',
                        marginBottom: 8,
                      }}
                    >
                      Confirmer ma présence
                    </p>
                    <p style={{ fontSize: 13, color: '#9B8A6E' }}>
                      Merci de répondre avant que la magie ne commence
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,253,247,.8)',
                      border: '1px solid rgba(201,168,76,.2)',
                      borderRadius: 16,
                      padding: '28px 20px',
                    }}
                  >
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#C9A84C" />
                  </div>
                </div>
              )}

              {/* Footer */}
              {isComplete && (
                <div style={{ marginTop: 64, paddingBottom: 40 }}>
                  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ display: 'block', margin: '0 auto 12px' }}>
                    <line x1="0" y1="10" x2="22" y2="10" stroke="#C9A84C" strokeWidth=".5" />
                    <circle cx="30" cy="10" r="3" fill="none" stroke="#C9A84C" strokeWidth=".6" />
                    <line x1="38" y1="10" x2="60" y2="10" stroke="#C9A84C" strokeWidth=".5" />
                  </svg>
                  <p style={{ fontSize: 11, color: '#BBA890', letterSpacing: '.06em' }}>
                    Faire-part créé avec{' '}
                    <a
                      href="https://instantmariage.fr"
                      style={{ color: '#C9A84C', textDecoration: 'none' }}
                    >
                      InstantMariage.fr
                    </a>
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
