import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface CoteAzurProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const AZURE = "#0077B6";
const AZURE_LIGHT = "#48CAE4";
const SEA_FOAM = "#90E0EF";
const SAND_LIGHT = "#F4E9CC";
const WHITE = "#FFFFFF";
const DEEP_SEA = "#03045E";

function Wave({ yOffset, opacity, frame, fps }: { yOffset: number; opacity: number; frame: number; fps: number }) {
  const shift = interpolate(frame, [0, fps * 4], [0, -200], { extrapolateRight: "wrap" as const });
  return (
    <svg
      style={{ position: "absolute", bottom: yOffset, left: shift, opacity, width: "200%", overflow: "visible" }}
      height="80"
      viewBox="0 0 2160 80"
      preserveAspectRatio="none"
    >
      <path
        d="M 0 40 Q 270 10 540 40 Q 810 70 1080 40 Q 1350 10 1620 40 Q 1890 70 2160 40 L 2160 80 L 0 80 Z"
        fill={AZURE_LIGHT}
        opacity="0.6"
      />
    </svg>
  );
}

function MediterraneanDivider({ opacity }: { opacity: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity, width: "80%" }}>
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, transparent, ${AZURE})` }} />
      <span style={{ color: AZURE, fontSize: 20, lineHeight: 1 }}>⚓</span>
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, transparent, ${AZURE})` }} />
    </div>
  );
}

export function CoteAzur({
  coupleNames = "Marine & Jules",
  date = "15 Août 2025",
  lieu = "Villa Ephrussi, Saint-Jean-Cap-Ferrat",
  message = "Sous le soleil de la Méditerranée",
  accentColor = AZURE,
}: CoteAzurProps) {
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

  // Sun rays rotation
  const sunRotate = interpolate(frame, [0, fps * 30], [0, 180]);
  const shimmer = interpolate(Math.sin((frame / fps) * 1.0 * Math.PI), [-1, 1], [0.8, 1.0]);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(175deg, ${DEEP_SEA} 0%, #0057A8 35%, ${AZURE} 65%, ${AZURE_LIGHT} 85%, ${SEA_FOAM} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      overflow: "hidden",
    }}>
      {/* Animated waves */}
      <Wave yOffset={80} opacity={0.5 * bgOpacity} frame={frame} fps={fps} />
      <Wave yOffset={50} opacity={0.35 * bgOpacity} frame={frame} fps={fps} />
      <Wave yOffset={20} opacity={0.25 * bgOpacity} frame={frame} fps={fps} />

      {/* Sun glow */}
      <div style={{
        position: "absolute",
        top: -100,
        left: "50%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,200,80,0.25) 0%, transparent 70%)`,
        transform: "translateX(-50%)",
        opacity: bgOpacity,
      }} />

      {/* Sun rays */}
      <div style={{
        position: "absolute",
        top: 60,
        right: 80,
        width: 120,
        height: 120,
        opacity: 0.25 * bgOpacity,
        transform: `rotate(${sunRotate}deg)`,
        fontSize: 90,
        lineHeight: 1,
      }}>
        ✴
      </div>

      {/* Sparkles on water */}
      {[
        { x: 100, y: 1700 }, { x: 300, y: 1730 }, { x: 550, y: 1710 },
        { x: 750, y: 1740 }, { x: 950, y: 1720 },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: s.x,
          top: s.y,
          fontSize: 20,
          opacity: shimmer * 0.6 * bgOpacity,
          color: WHITE,
        }}>✦</div>
      ))}

      {/* Main card */}
      <div style={{
        position: "absolute",
        inset: 75,
        background: `linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(244,233,204,0.95) 100%)`,
        borderRadius: 18,
        border: `2.5px solid rgba(0,119,182,0.4)`,
        boxShadow: `0 0 80px rgba(0,55,110,0.4), 0 20px 60px rgba(0,0,0,0.3), inset 0 0 40px rgba(144,224,239,0.1)`,
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
          border: `1px solid rgba(0,119,182,0.2)`,
          borderRadius: 12,
          pointerEvents: "none",
        }} />

        {/* Anchor / nautical icon */}
        <div style={{ opacity: fadeIn(30), fontSize: 50, marginBottom: -10 }}>⚓</div>

        {/* Couple names */}
        <div style={{ opacity: fadeIn(50), transform: `translateY(${slideUp(50)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 18, letterSpacing: 6, color: AZURE, textTransform: "uppercase", marginBottom: 10 }}>
            Mariage
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: "normal",
            color: DEEP_SEA,
            letterSpacing: 1,
            lineHeight: 1.2,
            fontStyle: "italic",
          }}>
            {coupleNames}
          </div>
        </div>

        <MediterraneanDivider opacity={fadeIn(95)} />

        {/* Message */}
        <div style={{ opacity: fadeIn(110), transform: `translateY(${slideUp(110)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 27,
            color: DEEP_SEA,
            opacity: 0.7,
            letterSpacing: 1,
            fontStyle: "italic",
            lineHeight: 1.7,
          }}>
            {message}
          </div>
        </div>

        <MediterraneanDivider opacity={fadeIn(150)} />

        {/* Date */}
        <div style={{ opacity: fadeIn(165), transform: `translateY(${slideUp(165)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 42,
            color: AZURE,
            letterSpacing: 2,
            fontWeight: "bold",
            textShadow: `0 0 20px rgba(0,119,182,0.3)`,
          }}>
            {date}
          </div>
        </div>

        {/* Lieu */}
        <div style={{ opacity: fadeIn(200), transform: `translateY(${slideUp(200)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 25, color: DEEP_SEA, opacity: 0.6, letterSpacing: 1.5, lineHeight: 1.5 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom nautical */}
        <div style={{ opacity: fadeIn(235) * shimmer, fontSize: 28, marginTop: -6, letterSpacing: 12 }}>
          🌊 ⛵ 🌊
        </div>
      </div>
    </AbsoluteFill>
  );
}
