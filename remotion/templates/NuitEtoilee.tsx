import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface NuitEtoileeProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const NIGHT_DEEP = "#050818";
const NIGHT_MID = "#0D1633";
const SILVER = "#C8D8E8";
const SILVER_BRIGHT = "#E8F0F8";
const MOONLIGHT = "#F0F4FF";
const STAR_GOLD = "#FFE87A";
const INDIGO = "#3A4A8C";

function Star({ x, y, size, delay, frame, fps }: {
  x: number; y: number; size: number; delay: number; frame: number; fps: number;
}) {
  const twinkle = Math.sin((frame / fps) * (2 + delay * 0.3) * Math.PI + delay) * 0.4 + 0.6;
  const appear = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: SILVER_BRIGHT,
      opacity: twinkle * appear * 0.9,
      boxShadow: `0 0 ${size * 3}px ${size}px rgba(200,216,232,0.3)`,
    }} />
  );
}

function ShootingStar({ frame, fps, delay, startX, endX, startY, endY }: {
  frame: number; fps: number; delay: number; startX: number; endX: number; startY: number; endY: number;
}) {
  const duration = 45;
  const localFrame = frame - delay;
  if (localFrame < 0 || localFrame > duration) return null;
  const progress = localFrame / duration;
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);
  const opacity = interpolate(progress, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);
  const tailLength = 80;
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      width: tailLength,
      height: 2,
      background: `linear-gradient(to right, transparent, ${STAR_GOLD})`,
      opacity,
      transform: `rotate(${angle}deg)`,
      transformOrigin: "right center",
    }} />
  );
}

function StarDivider({ opacity }: { opacity: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity, width: "80%" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${SILVER})` }} />
      <span style={{ color: STAR_GOLD, fontSize: 18, lineHeight: 1 }}>★</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${SILVER})` }} />
    </div>
  );
}

export function NuitEtoilee({
  coupleNames = "Anaïs & Mathieu",
  date = "21 Juin 2025",
  lieu = "Observatoire de Paris, Île-de-France",
  message = "Sous les étoiles, nous vous attendons",
  accentColor = SILVER,
}: NuitEtoileeProps) {
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

  const cardScale = spring({ frame, fps, from: 0.9, to: 1, config: { damping: 20, stiffness: 75 }, durationInFrames: 55 });
  const bgOpacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });

  // Moon glow pulse
  const moonPulse = interpolate(Math.sin((frame / fps) * 0.5 * Math.PI), [-1, 1], [0.85, 1.0]);

  const stars = [
    { x: 50, y: 80, size: 3, delay: 5 }, { x: 150, y: 40, size: 2, delay: 15 },
    { x: 280, y: 120, size: 4, delay: 8 }, { x: 420, y: 60, size: 2, delay: 25 },
    { x: 560, y: 30, size: 3, delay: 12 }, { x: 700, y: 90, size: 2, delay: 20 },
    { x: 850, y: 50, size: 4, delay: 7 }, { x: 970, y: 130, size: 2, delay: 30 },
    { x: 120, y: 200, size: 2, delay: 35 }, { x: 380, y: 170, size: 3, delay: 18 },
    { x: 650, y: 210, size: 2, delay: 28 }, { x: 900, y: 180, size: 3, delay: 10 },
    { x: 30, y: 1700, size: 3, delay: 22 }, { x: 200, y: 1750, size: 2, delay: 40 },
    { x: 500, y: 1720, size: 4, delay: 14 }, { x: 780, y: 1760, size: 2, delay: 32 },
    { x: 1020, y: 1730, size: 3, delay: 18 },
  ];

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 0%, ${NIGHT_MID} 0%, ${NIGHT_DEEP} 60%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      overflow: "hidden",
    }}>
      {/* Milky way glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(ellipse at 40% 30%, rgba(58,74,140,0.15) 0%, transparent 60%),
                          radial-gradient(ellipse at 60% 70%, rgba(58,74,140,0.1) 0%, transparent 50%)`,
        opacity: bgOpacity,
      }} />

      {/* Stars */}
      {stars.map((s, i) => (
        <Star key={i} {...s} frame={frame} fps={fps} />
      ))}

      {/* Shooting stars */}
      <ShootingStar frame={frame} fps={fps} delay={120} startX={800} endX={400} startY={100} endY={300} />
      <ShootingStar frame={frame} fps={fps} delay={450} startX={900} endX={500} startY={50} endY={200} />
      <ShootingStar frame={frame} fps={fps} delay={720} startX={700} endX={300} startY={80} endY={250} />

      {/* Moon */}
      <div style={{
        position: "absolute",
        top: 60,
        right: 100,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${MOONLIGHT} 0%, #D0DCEF 50%, #B0C0D8 100%)`,
        boxShadow: `0 0 60px 20px rgba(200,216,232,0.2)`,
        opacity: moonPulse * bgOpacity,
      }} />

      {/* Stars constellation lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1 * bgOpacity }}
        viewBox="0 0 1080 1920">
        <line x1="50" y1="80" x2="150" y2="40" stroke={SILVER} strokeWidth="0.5" />
        <line x1="150" y1="40" x2="280" y2="120" stroke={SILVER} strokeWidth="0.5" />
        <line x1="560" y1="30" x2="700" y2="90" stroke={SILVER} strokeWidth="0.5" />
        <line x1="700" y1="90" x2="850" y2="50" stroke={SILVER} strokeWidth="0.5" />
      </svg>

      {/* Main card */}
      <div style={{
        position: "absolute",
        inset: 75,
        background: `linear-gradient(155deg, rgba(13,22,51,0.98) 0%, rgba(5,8,24,0.99) 100%)`,
        borderRadius: 18,
        border: `1.5px solid rgba(200,216,232,0.25)`,
        boxShadow: `0 0 100px rgba(200,216,232,0.08), inset 0 0 80px rgba(58,74,140,0.1)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 70px",
        gap: 28,
        transform: `scale(${cardScale})`,
        opacity: bgOpacity,
      }}>
        <div style={{
          position: "absolute",
          inset: 20,
          border: `1px solid rgba(200,216,232,0.12)`,
          borderRadius: 12,
          pointerEvents: "none",
        }} />

        {/* Moon/star crown */}
        <div style={{ opacity: fadeIn(30), fontSize: 50, marginBottom: -10, letterSpacing: 8 }}>✨</div>

        {/* Couple names */}
        <div style={{ opacity: fadeIn(50), transform: `translateY(${slideUp(50)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 18, letterSpacing: 6, color: SILVER, textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>
            Mariage
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: "normal",
            color: SILVER_BRIGHT,
            letterSpacing: 1,
            lineHeight: 1.2,
            fontStyle: "italic",
          }}>
            {coupleNames}
          </div>
        </div>

        <StarDivider opacity={fadeIn(95)} />

        {/* Message */}
        <div style={{ opacity: fadeIn(110), transform: `translateY(${slideUp(110)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 26,
            color: SILVER,
            opacity: 0.7,
            letterSpacing: 1.5,
            fontStyle: "italic",
            lineHeight: 1.75,
          }}>
            {message}
          </div>
        </div>

        <StarDivider opacity={fadeIn(150)} />

        {/* Date */}
        <div style={{ opacity: fadeIn(165), transform: `translateY(${slideUp(165)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 42,
            color: STAR_GOLD,
            letterSpacing: 2,
            fontWeight: "bold",
            textShadow: `0 0 30px rgba(255,232,122,0.5)`,
          }}>
            {date}
          </div>
        </div>

        {/* Lieu */}
        <div style={{ opacity: fadeIn(200), transform: `translateY(${slideUp(200)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 25, color: SILVER, opacity: 0.55, letterSpacing: 1.5, lineHeight: 1.5 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom star cluster */}
        <div style={{ opacity: fadeIn(235) * moonPulse, color: STAR_GOLD, fontSize: 22, marginTop: -8, letterSpacing: 10 }}>
          ★ ✦ ★
        </div>
      </div>
    </AbsoluteFill>
  );
}
