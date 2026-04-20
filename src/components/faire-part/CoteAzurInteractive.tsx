'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'wave-rise' | 'wave-crash' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'wave-rise': 900,
  'wave-crash': 1100,
  'revealing': 2200,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'wave-rise': 'wave-crash',
  'wave-crash': 'revealing',
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

export default function CoteAzurInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('wave-rise'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'wave-rise', 'wave-crash'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());
  const isWaveRise = phase === 'wave-rise';
  const isWaveCrash = phase === 'wave-crash';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Montserrat:wght@200;300;400&display=swap');
        .ca * { box-sizing: border-box; }
        @keyframes caWave1 {
          0%,100% { d: path("M0 60 Q200 30 400 60 Q600 90 800 60 L800 120 L0 120Z"); }
          50%      { d: path("M0 60 Q200 90 400 60 Q600 30 800 60 L800 120 L0 120Z"); }
        }
        @keyframes caWave2 {
          0%,100% { d: path("M0 80 Q200 50 400 80 Q600 110 800 80 L800 120 L0 120Z"); }
          50%      { d: path("M0 80 Q200 110 400 80 Q600 50 800 80 L800 120 L0 120Z"); }
        }
        @keyframes caWaveAnimate {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes caWaveRise {
          from { transform: translateY(0); }
          to   { transform: translateY(-40vh); }
        }
        @keyframes caWaveCrash {
          0%   { transform: translateY(-40vh) scaleY(1); opacity: 1; }
          40%  { transform: translateY(-120vh) scaleY(2); opacity: 1; }
          100% { transform: translateY(-140vh) scaleY(.1); opacity: 0; }
        }
        @keyframes caHint {
          0%,100% { opacity: .65; transform: translateX(-50%) translateY(0); }
          50%      { opacity: 1; transform: translateX(-50%) translateY(6px); }
        }
        @keyframes caBoat {
          0%,100% { transform: translateX(0) rotate(-2deg); }
          50%      { transform: translateX(8px) rotate(2deg); }
        }
        @keyframes caFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes caAzurShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        .ca-r0 { animation: caFadeUp .7s 0s ease-out both; }
        .ca-r1 { animation: caFadeUp .7s .2s ease-out both; }
        .ca-r2 { animation: caFadeUp .7s .4s ease-out both; }
        .ca-r3 { animation: caFadeUp .7s .6s ease-out both; }
        .ca-r4 { animation: caFadeUp .7s .8s ease-out both; }
        .ca-r5 { animation: caFadeUp .7s 1.0s ease-out both; }
        .ca-r6 { animation: caFadeUp .7s 1.22s ease-out both; }
        .ca-r7 { animation: caFadeUp .7s 1.46s ease-out both; }
        .ca-azur-text {
          background: linear-gradient(120deg, #0277BD 0%, #039BE5 35%, #81D4FA 55%, #039BE5 75%, #0277BD 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: caAzurShimmer 4s 1s linear infinite;
        }
      `}</style>

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="ca" style={{ position: 'relative', width: '100%', fontFamily: "'Cormorant Garamond', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #E3F2FD 0%, #90CAF9 25%, #1565C0 60%, #0D47A1 100%)', overflow: 'hidden', cursor: phase === 'idle' ? 'pointer' : 'default' }}
            onClick={() => { if (phase === 'idle') setPhase('wave-rise'); }}>

            {/* Sky light */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '35%', background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.25) 0%, transparent 70%)' }} />

            {/* Sun / light orb */}
            <div style={{ position: 'absolute', top: '12%', left: '50%', marginLeft: -30, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,252,200,.9) 0%, rgba(255,240,100,.5) 40%, transparent 70%)', boxShadow: '0 0 40px rgba(255,240,100,.4)' }} />

            {/* Animated wave layers */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '55%',
              animation: (isWaveRise || isWaveCrash)
                ? (isWaveCrash ? 'caWaveCrash 1.1s ease-in forwards' : 'caWaveRise .9s ease-out forwards')
                : undefined,
            }}>
              {/* Wave layer 1 */}
              <svg width="200%" height="100%" viewBox="0 0 1600 300" style={{ position: 'absolute', bottom: 0, left: 0, animation: 'caWaveAnimate 4s linear infinite' }} preserveAspectRatio="none">
                <path d="M0 80 Q100 40 200 80 Q300 120 400 80 Q500 40 600 80 Q700 120 800 80 Q900 40 1000 80 Q1100 120 1200 80 Q1300 40 1400 80 Q1500 120 1600 80 L1600 300 L0 300Z" fill="rgba(13,71,161,.85)" />
              </svg>
              {/* Wave layer 2 */}
              <svg width="200%" height="100%" viewBox="0 0 1600 300" style={{ position: 'absolute', bottom: 0, left: 0, animation: 'caWaveAnimate 5.5s linear infinite reverse' }} preserveAspectRatio="none">
                <path d="M0 100 Q100 60 200 100 Q300 140 400 100 Q500 60 600 100 Q700 140 800 100 Q900 60 1000 100 Q1100 140 1200 100 Q1300 60 1400 100 Q1500 140 1600 100 L1600 300 L0 300Z" fill="rgba(21,101,192,.75)" />
              </svg>
              {/* Wave layer 3 — whitecaps */}
              <svg width="200%" height="100%" viewBox="0 0 1600 300" style={{ position: 'absolute', bottom: 0, left: 0, animation: 'caWaveAnimate 3s linear infinite' }} preserveAspectRatio="none">
                <path d="M0 120 Q80 90 160 120 Q240 150 320 120 Q400 90 480 120 Q560 150 640 120 Q720 90 800 120 Q880 150 960 120 Q1040 90 1120 120 Q1200 150 1280 120 Q1360 90 1440 120 L1440 300 L0 300Z" fill="rgba(100,181,246,.45)" />
              </svg>
            </div>

            {/* Center content */}
            <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', zIndex: 4, pointerEvents: 'none' }}>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>Faire-part de mariage</p>
              <p style={{ color: 'rgba(255,255,255,.92)', fontSize: 'clamp(1.6rem, 7vw, 2.4rem)', fontStyle: 'italic', fontWeight: 300, textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>{coupleNames}</p>
            </div>

            {phase === 'idle' && (
              <p style={{ position: 'absolute', bottom: '8%', left: '50%', color: 'rgba(255,255,255,.7)', fontSize: 12, letterSpacing: '.12em', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'caHint 2s ease-in-out infinite' }}>
                ✦ Touchez pour ouvrir ✦
              </p>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #E3F2FD 0%, #F0F8FF 30%, #E8F4FD 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              <div className="ca-r0" style={{ marginBottom: 28 }}>
                <svg width="220" height="30" viewBox="0 0 220 30" fill="none">
                  <line x1="0" y1="15" x2="85" y2="15" stroke="#039BE5" strokeWidth=".5" opacity=".5" />
                  <path d="M92 8 Q110 2 128 8 Q110 15 92 8Z" fill="#039BE5" opacity=".35" />
                  <circle cx="110" cy="15" r="2.5" fill="#039BE5" opacity=".6" />
                  <path d="M92 22 Q110 28 128 22 Q110 15 92 22Z" fill="#039BE5" opacity=".25" />
                  <line x1="135" y1="15" x2="220" y2="15" stroke="#039BE5" strokeWidth=".5" opacity=".5" />
                </svg>
              </div>

              <p className="ca-r1" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 28, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>Ensemble sur les flots</p>

              <h1 className="ca-r2 ca-azur-text" style={{ fontSize: 'clamp(2.5rem, 9vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>

              <p className="ca-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 40, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>vous invitent à leur mariage</p>

              <div className="ca-r4" style={{ marginBottom: 40 }}>
                <svg width="220" height="22" viewBox="0 0 220 22" fill="none">
                  <line x1="0" y1="11" x2="85" y2="11" stroke="#039BE5" strokeWidth=".5" opacity=".4" />
                  <path d="M90 11 Q100 4 110 11 Q120 18 130 11" stroke="#039BE5" strokeWidth="1" fill="none" opacity=".6" />
                  <line x1="135" y1="11" x2="220" y2="11" stroke="#039BE5" strokeWidth=".5" opacity=".4" />
                </svg>
              </div>

              <div className="ca-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 8, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.65rem)', color: '#0D2B5E', letterSpacing: '.02em' }}>{date}</p>
              </div>

              <div className="ca-r6" style={{ marginBottom: message ? 40 : 48 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 8, fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', fontWeight: 300, color: '#1A3A6A', lineHeight: 1.4 }}>{lieu}</p>
              </div>

              {message && (
                <div className="ca-r7" style={{ marginBottom: 44, padding: '18px 22px', borderTop: '.5px solid rgba(3,155,229,.25)', borderBottom: '.5px solid rgba(3,155,229,.25)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#1A3A6A', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="ca-r7" style={{ marginBottom: 44 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid #039BE5', borderRadius: 2, color: '#0277BD', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                    onClick={() => document.getElementById('ca-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#1565C0', marginTop: 6 }}>Avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="ca-rsvp" style={{ borderTop: '.5px solid rgba(3,155,229,.22)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#1565C0', marginBottom: 8, fontFamily: "'Montserrat', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.75rem)', fontStyle: 'italic', fontWeight: 300, color: '#0D2B5E', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(240,248,255,.85)', border: '1px solid rgba(3,155,229,.2)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#039BE5" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#90B8D8', letterSpacing: '.05em', fontFamily: "'Montserrat', sans-serif", fontWeight: 200 }}>
                    Créé avec <a href="https://instantmariage.fr" style={{ color: '#039BE5', textDecoration: 'none' }}>InstantMariage.fr</a>
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
