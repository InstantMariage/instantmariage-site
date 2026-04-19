import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface BohemeChampetreProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const TERRACOTTA = "#C4714A";
const SAGE = "#8A9E7A";
const WHEAT = "#E8D5A3";
const SAND = "#F5EDD8";
const BARK = "#4A3728";

function Wildflower({ x, y, delay, frame, fps }: { x: number; y: number; delay: number; frame: number; fps: number }) {
  const grow = spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: { damping: 14, stiffness: 60 }, durationInFrames: 50 });
  const sway = Math.sin((frame / fps) * 1.2 + delay * 0.5) * 4;
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${grow}) rotate(${sway}deg)`,
      transformOrigin: "bottom center",
      fontSize: 48,
      lineHeight: 1,
    }}>
      {["🌸", "🌼", "🌿", "🌾"][delay % 4]}
    </div>
  );
}

function WeavingLine({ opacity }: { opacity: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, opacity, width: "75%" }}>
      <div style={{ flex: 1, height: 2, background: `linear-gradient(to right, transparent, ${TERRACOTTA})`, borderRadius: 2 }} />
      <span style={{ color: TERRACOTTA, fontSize: 22, lineHeight: 1 }}>✿</span>
      <div style={{ flex: 1, height: 2, background: `linear-gradient(to left, transparent, ${TERRACOTTA})`, borderRadius: 2 }} />
    </div>
  );
}

export function BohemeChampetre({
  coupleNames = "Léa & Théo",
  date = "12 Juillet 2025",
  lieu = "Domaine de la Bergerie, Luberon",
  message = "Rejoignez-nous pour célébrer notre amour",
  accentColor = TERRACOTTA,
}: BohemeChampetreProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  const fadeIn = (start: number) =>
    interpolate(frame, [start, start + 35], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const slideUp = (start: number) =>
    interpolate(frame, [start, start + 35], [28, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const wrapScale = spring({ frame, fps, from: 0.92, to: 1, config: { damping: 20, stiffness: 80 }, durationInFrames: 50 });
  const sway = Math.sin((frame / fps) * 0.8) * 1.5;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(175deg, #2D1F14 0%, #3D2B1A 40%, #2D1F14 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      overflow: "hidden",
    }}>
      {/* Textured background overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(196,113,74,0.12) 0%, transparent 50%),
                          radial-gradient(ellipse at 70% 80%, rgba(138,158,122,0.1) 0%, transparent 50%)`,
        opacity: bgOpacity,
      }} />

      {/* Wildflowers bottom */}
      {[
        { x: 40, y: 1550, delay: 20 }, { x: 120, y: 1530, delay: 35 },
        { x: 220, y: 1560, delay: 50 }, { x: 800, y: 1540, delay: 25 },
        { x: 900, y: 1555, delay: 40 }, { x: 980, y: 1525, delay: 55 },
      ].map((f, i) => (
        <Wildflower key={i} x={f.x} y={f.y} delay={f.delay} frame={frame} fps={fps} />
      ))}

      {/* Wildflowers top */}
      {[
        { x: 60, y: 100, delay: 30 }, { x: 950, y: 80, delay: 45 },
      ].map((f, i) => (
        <Wildflower key={`t${i}`} x={f.x} y={f.y} delay={f.delay} frame={frame} fps={fps} />
      ))}

      {/* Main card */}
      <div style={{
        position: "absolute",
        inset: 80,
        backgroundColor: SAND,
        borderRadius: 20,
        border: `3px solid ${WHEAT}`,
        boxShadow: `0 0 80px rgba(196,113,74,0.2), inset 0 0 60px rgba(232,213,163,0.1)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "70px 70px",
        gap: 32,
        transform: `scale(${wrapScale}) rotate(${sway * 0.15}deg)`,
        opacity: bgOpacity,
      }}>
        {/* Macramé-like border pattern */}
        <div style={{
          position: "absolute",
          inset: 18,
          border: `1.5px dashed ${WHEAT}`,
          borderRadius: 14,
          opacity: 0.6,
          pointerEvents: "none",
        }} />

        {/* Leaf crown */}
        <div style={{ opacity: fadeIn(40), fontSize: 52, marginBottom: -10 }}>🌿</div>

        {/* Couple names */}
        <div style={{ opacity: fadeIn(60), transform: `translateY(${slideUp(60)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 28, color: TERRACOTTA, letterSpacing: 5, textTransform: "uppercase", marginBottom: 8 }}>
            Mariage de
          </div>
          <div style={{ fontSize: 68, fontWeight: "normal", color: BARK, letterSpacing: 1, lineHeight: 1.15, fontStyle: "italic" }}>
            {coupleNames}
          </div>
        </div>

        <WeavingLine opacity={fadeIn(100)} />

        {/* Message */}
        <div style={{ opacity: fadeIn(115), transform: `translateY(${slideUp(115)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 28, color: BARK, opacity: 0.7, letterSpacing: 1, fontStyle: "italic", lineHeight: 1.7 }}>
            {message}
          </div>
        </div>

        <WeavingLine opacity={fadeIn(150)} />

        {/* Date */}
        <div style={{ opacity: fadeIn(165), transform: `translateY(${slideUp(165)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 44, color: TERRACOTTA, letterSpacing: 2, fontWeight: "bold" }}>
            {date}
          </div>
        </div>

        {/* Lieu */}
        <div style={{ opacity: fadeIn(200), transform: `translateY(${slideUp(200)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 26, color: BARK, opacity: 0.6, letterSpacing: 1.5, lineHeight: 1.5 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom botanical */}
        <div style={{ opacity: fadeIn(235), fontSize: 36, marginTop: -8 }}>🌾 🌼 🌾</div>
      </div>
    </AbsoluteFill>
  );
}
