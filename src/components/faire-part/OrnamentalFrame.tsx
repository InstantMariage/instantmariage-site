'use client';

import React from 'react';

const SZ = 70;

function CornerSVG() {
  return (
    <svg width={SZ} height={SZ} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Thick outer L-border */}
      <line x1="0" y1="2" x2="64" y2="2" stroke="#C9A84C" strokeWidth="3.2" />
      <line x1="2" y1="0" x2="2" y2="64" stroke="#C9A84C" strokeWidth="3.2" />
      {/* Thin inner L-border */}
      <line x1="11" y1="11" x2="58" y2="11" stroke="#C9A84C" strokeWidth="0.7" opacity="0.45" />
      <line x1="11" y1="11" x2="11" y2="58" stroke="#C9A84C" strokeWidth="0.7" opacity="0.45" />
      {/* Solid corner accent */}
      <rect x="0" y="0" width="5.5" height="5.5" fill="#C9A84C" />
      {/* Inner corner diamond */}
      <path d="M11 11 L14.5 7.5 L18 11 L14.5 14.5 Z" stroke="#C9A84C" strokeWidth="0.65" fill="rgba(201,168,76,0.3)" />
      {/* Mid-line accent dots */}
      <circle cx="33" cy="2" r="3.2" fill="#C9A84C" opacity="0.72" />
      <circle cx="2" cy="33" r="3.2" fill="#C9A84C" opacity="0.72" />
      {/* Arabesque: outer floral oval */}
      <path
        d="M11 30 C11 19,18 11,29 11 C40 11,48 19,48 30 C48 41,40 48,29 47 C18 46,11 38,11 31 Z"
        stroke="#C9A84C" strokeWidth="0.95" fill="none" opacity="0.58"
      />
      {/* Arabesque: inner circle */}
      <path
        d="M17 29 C17 22,22 17,29 17 C36 17,41 22,41 29 C41 36,36 41,29 41 C22 41,17 36,17 30 Z"
        stroke="#C9A84C" strokeWidth="0.65" fill="none" opacity="0.38"
      />
      {/* Center jewel diamond */}
      <path d="M25 29 L29 25 L33 29 L29 33 Z" stroke="#C9A84C" strokeWidth="0.85" fill="rgba(201,168,76,0.28)" />
      <circle cx="29" cy="29" r="2.2" fill="#C9A84C" opacity="0.62" />
      {/* Leaf tendrils from inner corner */}
      <path d="M11 11 C14 20,20 22,18 30" stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.42" />
      <path d="M11 11 C20 14,22 20,30 18" stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.42" />
      {/* Small dots at arabesque entry */}
      <circle cx="11" cy="30" r="1.4" fill="#C9A84C" opacity="0.38" />
      <circle cx="30" cy="11" r="1.4" fill="#C9A84C" opacity="0.38" />
    </svg>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transforms: Record<string, string | undefined> = {
    tl: undefined,
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1,-1)',
  };
  const placements: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return (
    <div style={{
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 10,
      transform: transforms[pos],
      ...placements[pos],
    }}>
      <CornerSVG />
    </div>
  );
}

/** Dark luxury page wrapper with golden ornamental frame – for classic invitation layouts */
export function OrnamentalFrameWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #060606 0%, #0d0b06 35%, #0a0a0a 65%, #060606 100%)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 'clamp(20px, 4vw, 52px) clamp(10px, 3vw, 32px)',
    }}>
      {/* Static starfield */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(22)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 5 === 0 ? 2.5 : 1.5,
            height: i % 5 === 0 ? 2.5 : 1.5,
            background: '#C9A84C',
            borderRadius: '50%',
            left: `${3 + (i * 4.7) % 94}%`,
            top: `${2 + (i * 8.1) % 96}%`,
            opacity: 0.05 + (i % 6) * 0.025,
          }} />
        ))}
      </div>

      {/* Ornamental card frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 680,
        zIndex: 1,
        border: '1.5px solid rgba(201,168,76,0.62)',
        boxShadow: [
          '0 0 0 1px rgba(201,168,76,0.07)',
          '0 0 50px rgba(201,168,76,0.09)',
          '0 24px 90px rgba(0,0,0,0.88)',
        ].join(', '),
      }}>
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
        {children}
      </div>
    </div>
  );
}

/** Fixed decorative frame overlay – for full-screen invitation experiences (EleganceDoree, etc.) */
export function OrnamentalFrameOverlay() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 200,
      border: '1.5px solid rgba(201,168,76,0.4)',
    }}>
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
    </div>
  );
}
