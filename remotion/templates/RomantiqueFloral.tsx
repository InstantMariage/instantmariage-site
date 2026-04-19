import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface RomantiqueFloralProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const ROSE_DEEP = "#C2637A";
const ROSE_LIGHT = "#E8A0B0";
const BLUSH = "#F9E8EC";
const PETAL = "#FDF0F3";
const DARK_ROSE = "#3D1220";
const LEAF = "#5A7A55";

function Petal({ x, y, size, delay, frame, fps, emoji }: {
  x: number; y: number; size: number; delay: number; frame: number; fps: number; emoji: string;
}) {
  const drift = Math.sin((frame / fps) * 0.6 + delay) * 8;
  const fall = interpolate(frame - delay, [0, 900], [y, y + 200], { extrapolateLeft: "clamp" });
  const opacity = interpolate(frame, [delay, delay + 30, 850, 900], [0, 0.8, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute",
      left: x + drift,
      top: fall,
      fontSize: size,
      opacity,
      transform: `rotate(${drift * 5}deg)`,
    }}>
      {emoji}
    </div>
  );
}

function FloralDivider({ opacity }: { opacity: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity, width: "80%" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${ROSE_LIGHT})` }} />
      <span style={{ color: ROSE_DEEP, fontSize: 24, lineHeight: 1 }}>❀</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${ROSE_LIGHT})` }} />
    </div>
  );
}

export function RomantiqueFloral({
  coupleNames = "Camille & Nicolas",
  date = "8 Juin 2025",
  lieu = "Domaine des Roses, Grasse",
  message = "Avec toute notre joie, nous vous invitons",
  accentColor = ROSE_DEEP,
}: RomantiqueFloralProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = (start: number) =>
    interpolate(frame, [start, start + 35], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const slideUp = (start: number) =>
    interpolate(frame, [start, start + 35], [24, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const cardScale = spring({ frame, fps, from: 0.9, to: 1, config: { damping: 20, stiffness: 75 }, durationInFrames: 50 });
  const cardOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const shimmer = interpolate(Math.sin((frame / fps) * Math.PI), [-1, 1], [0.85, 1.0]);

  const petals = [
    { x: 60, y: -20, size: 36, delay: 10, emoji: "🌸" },
    { x: 200, y: -40, size: 28, delay: 40, emoji: "🌺" },
    { x: 400, y: -10, size: 32, delay: 70, emoji: "🌸" },
    { x: 600, y: -30, size: 30, delay: 20, emoji: "🌹" },
    { x: 800, y: -15, size: 34, delay: 55, emoji: "🌸" },
    { x: 950, y: -25, size: 26, delay: 85, emoji: "🌺" },
    { x: 150, y: 1600, size: 30, delay: 15, emoji: "🌸" },
    { x: 500, y: 1620, size: 36, delay: 45, emoji: "🌹" },
    { x: 850, y: 1590, size: 28, delay: 75, emoji: "🌸" },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(165deg, #1A0510 0%, #2A0C18 40%, #1A0510 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(ellipse at 30% 25%, rgba(194,99,122,0.1) 0%, transparent 55%),
                          radial-gradient(ellipse at 70% 75%, rgba(232,160,176,0.08) 0%, transparent 50%)`,
        opacity: cardOpacity,
      }} />

      {/* Falling petals */}
      {petals.map((p, i) => (
        <Petal key={i} {...p} frame={frame} fps={fps} />
      ))}

      {/* Corner flower clusters */}
      {[
        { top: 30, left: 30 }, { top: 30, right: 30 },
        { bottom: 30, left: 30 }, { bottom: 30, right: 30 },
      ].map((style, i) => (
        <div key={i} style={{
          position: "absolute",
          ...style,
          fontSize: 52,
          opacity: 0.5 * shimmer,
        }}>
          🌸
        </div>
      ))}

      {/* Main card */}
      <div style={{
        position: "absolute",
        inset: 75,
        backgroundColor: PETAL,
        borderRadius: 18,
        border: `2.5px solid ${ROSE_LIGHT}`,
        boxShadow: `0 0 80px rgba(194,99,122,0.2), inset 0 0 50px rgba(249,232,236,0.3)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 70px",
        gap: 28,
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
      }}>
        {/* Rose border detail */}
        <div style={{
          position: "absolute",
          inset: 20,
          border: `1px solid ${ROSE_LIGHT}`,
          borderRadius: 12,
          opacity: 0.5,
          pointerEvents: "none",
        }} />

        {/* Floral crown */}
        <div style={{ opacity: fadeIn(30), fontSize: 48, marginBottom: -12, letterSpacing: 8 }}>🌹</div>

        {/* Couple names */}
        <div style={{ opacity: fadeIn(50), transform: `translateY(${slideUp(50)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 20, letterSpacing: 6, color: ROSE_DEEP, textTransform: "uppercase", marginBottom: 10, fontStyle: "normal" }}>
            Le mariage de
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: "normal",
            color: DARK_ROSE,
            letterSpacing: 1,
            lineHeight: 1.2,
            fontStyle: "italic",
          }}>
            {coupleNames}
          </div>
        </div>

        <FloralDivider opacity={fadeIn(95)} />

        {/* Message */}
        <div style={{ opacity: fadeIn(110), transform: `translateY(${slideUp(110)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 26,
            color: DARK_ROSE,
            opacity: 0.7,
            letterSpacing: 1,
            fontStyle: "italic",
            lineHeight: 1.75,
          }}>
            {message}
          </div>
        </div>

        <FloralDivider opacity={fadeIn(150)} />

        {/* Date */}
        <div style={{ opacity: fadeIn(165), transform: `translateY(${slideUp(165)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 42,
            color: ROSE_DEEP,
            letterSpacing: 2,
            fontWeight: "bold",
            textShadow: `0 0 20px rgba(194,99,122,0.3)`,
          }}>
            {date}
          </div>
        </div>

        {/* Lieu */}
        <div style={{ opacity: fadeIn(200), transform: `translateY(${slideUp(200)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 26, color: DARK_ROSE, opacity: 0.6, letterSpacing: 1.5, lineHeight: 1.5 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom botanical */}
        <div style={{ opacity: fadeIn(235) * shimmer, fontSize: 32, marginTop: -6 }}>
          🌸 ❀ 🌸
        </div>
      </div>
    </AbsoluteFill>
  );
}
