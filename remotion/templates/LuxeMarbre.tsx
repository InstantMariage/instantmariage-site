import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface LuxeMarbreProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const MARBLE_DARK = "#1C1C1C";
const MARBLE_MID = "#2E2E2E";
const GOLD = "#BFA76A";
const GOLD_LIGHT = "#D4C08A";
const CREAM = "#F2EDE4";
const MARBLE_VEIN = "#3A3A3A";

function MarbleVeins() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} viewBox="0 0 1080 1920" preserveAspectRatio="none">
      <path d="M 100 0 Q 300 400 200 800 Q 100 1200 400 1920" stroke={CREAM} strokeWidth="3" fill="none" />
      <path d="M 600 0 Q 800 300 750 600 Q 700 900 900 1200 Q 1050 1500 800 1920" stroke={CREAM} strokeWidth="2" fill="none" />
      <path d="M 0 400 Q 200 500 400 450 Q 600 400 800 500 Q 900 550 1080 480" stroke={CREAM} strokeWidth="1.5" fill="none" />
      <path d="M 0 1100 Q 300 1050 500 1150 Q 700 1250 1080 1100" stroke={CREAM} strokeWidth="1.5" fill="none" />
      <path d="M 300 0 Q 200 200 350 500 Q 500 800 300 1100 Q 100 1400 300 1920" stroke={CREAM} strokeWidth="1" fill="none" />
    </svg>
  );
}

function GoldOrnament({ opacity, shimmer }: { opacity: number; shimmer: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity, width: "80%" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <div style={{
        width: 28,
        height: 28,
        border: `1.5px solid ${GOLD}`,
        transform: "rotate(45deg)",
        opacity: shimmer,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  );
}

export function LuxeMarbre({
  coupleNames = "Élise & Raphaël",
  date = "5 Avril 2026",
  lieu = "Grand Palais, Paris",
  message = "Vous êtes conviés à notre mariage",
  accentColor = GOLD,
}: LuxeMarbreProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = (start: number) =>
    interpolate(frame, [start, start + 35], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const slideUp = (start: number, dist = 24) =>
    interpolate(frame, [start, start + 35], [dist, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const cardScale = spring({ frame, fps, from: 0.88, to: 1, config: { damping: 22, stiffness: 70 }, durationInFrames: 55 });
  const cardOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  // Gold shimmer pulse
  const shimmer = interpolate(Math.sin((frame / fps) * 1.2 * Math.PI), [-1, 1], [0.75, 1.0]);

  // Rotating gold ring
  const ringRotate = interpolate(frame, [0, 900], [0, 360]);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 40% 30%, ${MARBLE_MID} 0%, ${MARBLE_DARK} 60%, #0E0E0E 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      overflow: "hidden",
    }}>
      <MarbleVeins />

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(191,167,106,0.07) 0%, transparent 65%)`,
        opacity: shimmer,
      }} />

      {/* Rotating outer ring */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 900,
        height: 900,
        border: `1px solid rgba(191,167,106,0.12)`,
        borderRadius: "50%",
        transform: `translate(-50%, -50%) rotate(${ringRotate}deg)`,
      }} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 700,
        height: 700,
        border: `1px solid rgba(191,167,106,0.08)`,
        borderRadius: "50%",
        transform: `translate(-50%, -50%) rotate(${-ringRotate * 0.7}deg)`,
      }} />

      {/* Main marble card */}
      <div style={{
        position: "absolute",
        inset: 70,
        background: `linear-gradient(135deg, #F7F2E8 0%, #EDE8DC 30%, #F2EDE4 70%, #EAE4D8 100%)`,
        borderRadius: 4,
        border: `2px solid ${GOLD}`,
        boxShadow: `0 0 100px rgba(0,0,0,0.8), 0 0 40px rgba(191,167,106,0.15), inset 0 0 60px rgba(191,167,106,0.04)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 80px",
        gap: 30,
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        overflow: "hidden",
      }}>
        {/* Marble texture on card */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 940 1780" preserveAspectRatio="none">
          <path d="M 0 300 Q 200 280 400 350 Q 600 420 940 300" stroke={MARBLE_VEIN} strokeWidth="3" fill="none" />
          <path d="M 100 800 Q 300 750 500 820 Q 700 890 940 770" stroke={MARBLE_VEIN} strokeWidth="2" fill="none" />
          <path d="M 0 1300 Q 400 1250 600 1350 Q 800 1450 940 1320" stroke={MARBLE_VEIN} strokeWidth="2.5" fill="none" />
        </svg>

        {/* Inner gold frame */}
        <div style={{
          position: "absolute",
          inset: 24,
          border: `1px solid ${GOLD}`,
          borderRadius: 2,
          opacity: 0.4 * shimmer,
          pointerEvents: "none",
        }} />

        {/* Crown ornament */}
        <div style={{ opacity: fadeIn(35), color: accentColor, fontSize: 28, letterSpacing: 8, marginBottom: -8 }}>◆ ◆ ◆</div>

        {/* Couple names */}
        <div style={{ opacity: fadeIn(55), transform: `translateY(${slideUp(55)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 14, letterSpacing: 8, color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>
            Mariage de
          </div>
          <div style={{
            fontSize: 66,
            fontWeight: "normal",
            color: MARBLE_DARK,
            letterSpacing: 1.5,
            lineHeight: 1.2,
            fontStyle: "italic",
          }}>
            {coupleNames}
          </div>
        </div>

        <GoldOrnament opacity={fadeIn(95)} shimmer={shimmer} />

        {/* Message */}
        <div style={{ opacity: fadeIn(110), transform: `translateY(${slideUp(110)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 26,
            color: MARBLE_DARK,
            opacity: 0.65,
            letterSpacing: 1.5,
            fontStyle: "italic",
            lineHeight: 1.7,
          }}>
            {message}
          </div>
        </div>

        <GoldOrnament opacity={fadeIn(150)} shimmer={shimmer} />

        {/* Date */}
        <div style={{ opacity: fadeIn(165), transform: `translateY(${slideUp(165)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 42,
            color: GOLD,
            letterSpacing: 4,
            fontWeight: "bold",
            textShadow: `0 0 30px rgba(191,167,106,0.3)`,
          }}>
            {date}
          </div>
        </div>

        {/* Lieu */}
        <div style={{ opacity: fadeIn(200), transform: `translateY(${slideUp(200)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 26, color: MARBLE_DARK, opacity: 0.55, letterSpacing: 2 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom ornament */}
        <div style={{ opacity: fadeIn(235) * shimmer, color: GOLD, fontSize: 22, letterSpacing: 8 }}>◆ ◆ ◆</div>
      </div>
    </AbsoluteFill>
  );
}
