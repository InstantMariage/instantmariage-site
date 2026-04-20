'use client';

import { useState, useEffect, useCallback } from 'react';
import RsvpForm from '@/app/invitation/[slug]/RsvpForm';

type Phase = 'idle' | 'ribbon-untie' | 'card-open' | 'revealing' | 'complete';

const PHASE_MS: Partial<Record<Phase, number>> = {
  'ribbon-untie': 700,
  'card-open': 950,
  'revealing': 2400,
};
const NEXT: Partial<Record<Phase, Phase>> = {
  'ribbon-untie': 'card-open',
  'card-open': 'revealing',
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

const PETALS = [
  { x: '8%', y: '-5%', r: '20deg', delay: '0s', dur: '6s' },
  { x: '22%', y: '-8%', r: '-15deg', delay: '.8s', dur: '7s' },
  { x: '38%', y: '-3%', r: '30deg', delay: '1.4s', dur: '5.5s' },
  { x: '55%', y: '-6%', r: '-25deg', delay: '.3s', dur: '6.5s' },
  { x: '70%', y: '-4%', r: '18deg', delay: '1.1s', dur: '7.2s' },
  { x: '85%', y: '-7%', r: '-10deg', delay: '.6s', dur: '5.8s' },
  { x: '15%', y: '-9%', r: '40deg', delay: '2s', dur: '6.8s' },
  { x: '60%', y: '-5%', r: '-35deg', delay: '1.7s', dur: '5.2s' },
];

export default function BohemeChampetreInteractive({
  coupleNames, date, lieu, message, rsvpActif, rsvpDeadline, rsvpSlug,
  autoPlay = false, fixedHeight,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  const advance = useCallback(() => setPhase(prev => NEXT[prev] ?? prev), []);

  useEffect(() => {
    if (phase === 'idle' && autoPlay) {
      const t = setTimeout(() => setPhase('ribbon-untie'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, autoPlay]);

  useEffect(() => {
    const ms = PHASE_MS[phase];
    if (ms && NEXT[phase]) { const t = setTimeout(advance, ms); return () => clearTimeout(t); }
  }, [phase, advance]);

  const showOpening = ['idle', 'ribbon-untie', 'card-open'].includes(phase);
  const isRevealing = phase === 'revealing' || phase === 'complete';
  const isComplete = phase === 'complete';
  const isRsvpOpen = !!rsvpActif && (!rsvpDeadline || new Date(rsvpDeadline) >= new Date());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap');
        .bc * { box-sizing: border-box; }
        @keyframes bcPetalFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: .9; }
          80%  { opacity: .7; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bcRibbonUntie {
          0%   { transform: scale(1) rotate(0deg); opacity: 1; }
          40%  { transform: scale(1.2) rotate(-20deg); }
          100% { transform: scale(0) rotate(60deg); opacity: 0; }
        }
        @keyframes bcCardOpen {
          0%   { transform: perspective(900px) rotateY(0deg); }
          100% { transform: perspective(900px) rotateY(-180deg); }
        }
        @keyframes bcCardEntry {
          from { transform: translateY(30px) scale(.96); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bcHintFloat {
          0%,100% { transform: translateX(-50%) translateY(0); opacity: .75; }
          50%      { transform: translateX(-50%) translateY(6px); opacity: 1; }
        }
        @keyframes bcFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bcLeafSway {
          0%,100% { transform: rotate(-4deg); }
          50%      { transform: rotate(4deg); }
        }
        .bc-r0 { animation: bcFadeUp .7s 0s ease-out both; }
        .bc-r1 { animation: bcFadeUp .7s .2s ease-out both; }
        .bc-r2 { animation: bcFadeUp .7s .45s ease-out both; }
        .bc-r3 { animation: bcFadeUp .7s .7s ease-out both; }
        .bc-r4 { animation: bcFadeUp .7s .95s ease-out both; }
        .bc-r5 { animation: bcFadeUp .7s 1.2s ease-out both; }
        .bc-r6 { animation: bcFadeUp .7s 1.5s ease-out both; }
        .bc-r7 { animation: bcFadeUp .7s 1.8s ease-out both; }
      `}</style>

      {/* Golden border frame */}
      <div aria-hidden style={{ position: 'fixed', inset: 15, border: '1px solid rgba(201,168,76,0.55)', pointerEvents: 'none', zIndex: 9999 }} />

      <div className="bc" style={{ position: 'relative', width: '100%', fontFamily: "'Playfair Display', serif", minHeight: fixedHeight ? fixedHeight : showOpening ? '100dvh' : 0, height: fixedHeight ?? undefined }}>

        {/* ── OPENING SCENE ── */}
        {showOpening && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #F5EAD8 0%, #EDD9C0 50%, #F0E2CC 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

            {/* Falling dried flowers */}
            {PETALS.map((p, i) => (
              <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, animation: `bcPetalFall ${p.dur} ${p.delay} linear infinite`, pointerEvents: 'none' }}>
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                  <ellipse cx="9" cy="11" rx="5" ry="9" fill={i % 2 === 0 ? '#C4956A' : '#D4A882'} opacity=".75" transform={`rotate(${p.r} 9 11)`} />
                  <line x1="9" y1="11" x2="9" y2="21" stroke="#8B6347" strokeWidth=".8" opacity=".5" />
                </svg>
              </div>
            ))}

            {/* Corner botanical ornaments */}
            {[
              { top: 20, left: 20, r: '0deg' },
              { top: 20, right: 20, r: '90deg' },
              { bottom: 20, right: 20, r: '180deg' },
              { bottom: 20, left: 20, r: '270deg' },
            ].map((pos, i) => (
              <svg key={i} width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', ...pos, opacity: .35 }}>
                <path d="M5 55 Q15 35 30 30 Q45 25 55 5" stroke="#8B6347" strokeWidth="1" fill="none" />
                <ellipse cx="18" cy="40" rx="7" ry="4" fill="#C4956A" opacity=".6" transform="rotate(-30 18 40)" />
                <ellipse cx="30" cy="30" rx="6" ry="3.5" fill="#C4956A" opacity=".5" transform="rotate(10 30 30)" />
                <ellipse cx="42" cy="18" rx="5" ry="3" fill="#C4956A" opacity=".4" transform="rotate(-20 42 18)" />
              </svg>
            ))}

            {/* Card */}
            <div style={{ position: 'relative', width: 'min(88vw, 380px)', animation: 'bcCardEntry .75s .15s ease-out both', opacity: 0 }}>
              {/* Ribbon vertical */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 18, marginLeft: -9, background: 'linear-gradient(90deg, #B5734A, #C4956A, #B5734A)', borderRadius: 2, zIndex: 2, opacity: phase === 'ribbon-untie' ? 0 : 1, transition: 'opacity .3s .4s' }} />
              {/* Ribbon horizontal */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 18, marginTop: -9, background: 'linear-gradient(180deg, #B5734A, #C4956A, #B5734A)', borderRadius: 2, zIndex: 2, opacity: phase === 'ribbon-untie' ? 0 : 1, transition: 'opacity .3s .2s' }} />

              {/* Bow */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 60, height: 40, marginTop: -20, marginLeft: -30, zIndex: 4, animation: phase === 'ribbon-untie' ? 'bcRibbonUntie .65s ease-in forwards' : undefined }}>
                <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                  <ellipse cx="18" cy="20" rx="15" ry="10" fill="#C4956A" opacity=".9" transform="rotate(-10 18 20)" />
                  <ellipse cx="42" cy="20" rx="15" ry="10" fill="#B5734A" opacity=".9" transform="rotate(10 42 20)" />
                  <ellipse cx="30" cy="20" rx="7" ry="6" fill="#C4956A" />
                  <ellipse cx="30" cy="20" rx="4" ry="3" fill="#D4A882" opacity=".6" />
                </svg>
              </div>

              {/* Card body */}
              <div style={{ background: 'linear-gradient(160deg, #FDF8F0 0%, #F5ECD8 100%)', borderRadius: 8, border: '1px solid rgba(196,149,106,.35)', boxShadow: '0 12px 40px rgba(92,61,46,.2)', padding: '48px 32px 40px', textAlign: 'center', overflow: 'hidden', transformOrigin: 'left center', animation: phase === 'card-open' ? 'bcCardOpen .9s ease-in-out forwards' : undefined }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 14 }}>Faire-part de mariage</p>
                <p style={{ fontSize: 'clamp(1.5rem, 7vw, 2rem)', fontStyle: 'italic', fontWeight: 400, color: '#5C3D2E', lineHeight: 1.2 }}>{coupleNames}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
                  <div style={{ height: .5, width: 40, background: '#C4956A' }} />
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1 L8.5 5.5 L13 5.5 L9.5 8.5 L11 13 L7 10 L3 13 L4.5 8.5 L1 5.5 L5.5 5.5 Z" fill="#C4956A" /></svg>
                  <div style={{ height: .5, width: 40, background: '#C4956A' }} />
                </div>
              </div>
            </div>

            {/* Hint */}
            {phase === 'idle' && (
              <div style={{ position: 'absolute', bottom: 52, left: '50%', color: 'rgba(139,99,71,.85)', fontSize: 12, fontFamily: "'Lato', sans-serif", letterSpacing: '.1em', fontStyle: 'italic', whiteSpace: 'nowrap', animation: 'bcHintFloat 2s ease-in-out infinite' }}>
                ✦ Touchez le ruban pour ouvrir ✦
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {isRevealing && (
          <div style={{ width: '100%', background: 'linear-gradient(180deg, #FDF8F0 0%, #F5ECD8 40%, #FDF8F0 100%)', minHeight: '100dvh' }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '72px 28px 100px', textAlign: 'center' }}>

              {/* Botanical top ornament */}
              <div className="bc-r0" style={{ marginBottom: 28 }}>
                <svg width="240" height="48" viewBox="0 0 240 48" fill="none">
                  <line x1="0" y1="24" x2="85" y2="24" stroke="#C4956A" strokeWidth=".6" />
                  <path d="M90 14 Q105 8 120 14 Q135 20 150 14" stroke="#C4956A" strokeWidth=".8" fill="none" />
                  <ellipse cx="97" cy="12" rx="5" ry="3" fill="#C4956A" opacity=".4" transform="rotate(-20 97 12)" />
                  <ellipse cx="120" cy="18" rx="5" ry="3" fill="#C4956A" opacity=".5" />
                  <ellipse cx="143" cy="12" rx="5" ry="3" fill="#C4956A" opacity=".4" transform="rotate(20 143 12)" />
                  <line x1="155" y1="24" x2="240" y2="24" stroke="#C4956A" strokeWidth=".6" />
                </svg>
              </div>

              <p className="bc-r1" style={{ fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 32, fontFamily: "'Lato', sans-serif" }}>Ensemble pour la vie</p>

              <h1 className="bc-r2" style={{ fontSize: 'clamp(2.4rem, 9vw, 3.4rem)', fontWeight: 400, fontStyle: 'italic', color: '#5C3D2E', lineHeight: 1.1, marginBottom: 6 }}>{coupleNames}</h1>

              <p className="bc-r3" style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 40, fontFamily: "'Lato', sans-serif" }}>vous invitent à leur mariage</p>

              <div className="bc-r4" style={{ marginBottom: 40 }}>
                <svg width="200" height="20" viewBox="0 0 200 20" fill="none">
                  <line x1="0" y1="10" x2="82" y2="10" stroke="#C4956A" strokeWidth=".5" />
                  <path d="M90 4 L100 10 L90 16 L80 10 Z" fill="none" stroke="#C4956A" strokeWidth=".8" />
                  <circle cx="100" cy="10" r="2" fill="#C4956A" />
                  <path d="M110 4 L120 10 L110 16 L100 10 Z" fill="none" stroke="#C4956A" strokeWidth=".8" />
                  <line x1="118" y1="10" x2="200" y2="10" stroke="#C4956A" strokeWidth=".5" />
                </svg>
              </div>

              <div className="bc-r5" style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Le</p>
                <p style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', color: '#4A3228', letterSpacing: '.02em' }}>{date}</p>
              </div>

              <div className="bc-r6" style={{ marginBottom: message ? 40 : 52 }}>
                <p style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>À</p>
                <p style={{ fontSize: 'clamp(.95rem, 4vw, 1.2rem)', fontStyle: 'italic', color: '#6B5040', lineHeight: 1.4 }}>{lieu}</p>
              </div>

              {message && (
                <div className="bc-r7" style={{ marginBottom: 48, padding: '18px 22px', borderTop: '.5px solid rgba(196,149,106,.3)', borderBottom: '.5px solid rgba(196,149,106,.3)' }}>
                  <p style={{ fontSize: 'clamp(.88rem, 3.5vw, 1rem)', fontStyle: 'italic', color: '#6B5040', lineHeight: 1.7 }}>&ldquo;{message}&rdquo;</p>
                </div>
              )}

              {isRevealing && isRsvpOpen && (
                <div className="bc-r7" style={{ marginBottom: 48 }}>
                  <div style={{ display: 'inline-block', padding: '10px 32px', border: '1px solid #C4956A', borderRadius: 2, color: '#8B6347', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
                    onClick={() => document.getElementById('bc-rsvp')?.scrollIntoView({ behavior: 'smooth' })}>
                    Confirmer ma présence
                  </div>
                  {rsvpDeadline && <p style={{ fontSize: 11, color: '#9B7A5C', marginTop: 6 }}>Réponse souhaitée avant le {new Date(rsvpDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                </div>
              )}

              <div style={{ marginBottom: 64 }}>
                <svg width="200" height="36" viewBox="0 0 200 36" fill="none">
                  <path d="M20 18 Q60 8 100 18 Q140 28 180 18" stroke="#C4956A" strokeWidth=".7" fill="none" />
                  <ellipse cx="100" cy="18" rx="4" ry="4" fill="none" stroke="#C4956A" strokeWidth=".6" />
                  <ellipse cx="55" cy="13" rx="6" ry="3.5" fill="#C4956A" opacity=".25" transform="rotate(-15 55 13)" />
                  <ellipse cx="145" cy="23" rx="6" ry="3.5" fill="#C4956A" opacity=".25" transform="rotate(15 145 23)" />
                </svg>
              </div>

              {isComplete && isRsvpOpen && rsvpSlug && (
                <div id="bc-rsvp" style={{ borderTop: '.5px solid rgba(196,149,106,.22)', paddingTop: 52, marginTop: 16 }}>
                  <p style={{ fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#9B7A5C', marginBottom: 8, fontFamily: "'Lato', sans-serif" }}>Je réponds</p>
                  <p style={{ fontSize: 'clamp(1.3rem, 5vw, 1.7rem)', fontStyle: 'italic', color: '#4A3228', marginBottom: 24 }}>Confirmer ma présence</p>
                  <div style={{ background: 'rgba(253,248,240,.85)', border: '1px solid rgba(196,149,106,.22)', borderRadius: 14, padding: '26px 18px' }}>
                    <RsvpForm slug={rsvpSlug} couleurPrimaire="#C4956A" />
                  </div>
                </div>
              )}

              {isComplete && (
                <div style={{ marginTop: 56, paddingBottom: 36 }}>
                  <p style={{ fontSize: 11, color: '#B8967A', letterSpacing: '.05em', fontFamily: "'Lato', sans-serif" }}>
                    Faire-part créé avec <a href="https://instantmariage.fr" style={{ color: '#C4956A', textDecoration: 'none' }}>InstantMariage.fr</a>
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
