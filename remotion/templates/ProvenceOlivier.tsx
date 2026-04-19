import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface ProvenceOlivierProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const LAVENDER = "#7B6FA0";
const LAVENDER_LIGHT = "#B8A9D4";
const OLIVE = "#6B7C3A";
const OLIVE_LIGHT = "#A3B05A";
const OCHRE = "#C8943A";
const PARCHMENT = "#F5EDD5";
const EARTH = "#3D2E12";
const TERRACOTTA_WARM = "#B5663A";

function OliveBranch({ side, opacity, sway }: { side: "left" | "right"; opacity: number; sway: number }) {
  const flip = side === "right" ? "scaleX(-1)" : "scaleX(1)";
  return (
    <div style={{
      position: "absolute",
      [side]: 50,
      top: "20%",
      opacity,
      transform: `${flip} rotate(${sway * (side === "left" ? 1 : -1)}deg)`,
      transformOrigin: "bottom center",
      fontSize: 80,
      lineHeight: 1,
    }}>
      🌿
    </div>
  );
}

function LavenderDivider({ opacity }: { opacity: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity, width: "80%" }}>
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to right, transparent, ${LAVENDER})` }} />
      <span style={{ fontSize: 20, lineHeight: 1 }}>💜</span>
      <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, transparent, ${LAVENDER})` }} />
    </div>
  );
}

export function ProvenceOlivier({
  coupleNames = "Isabelle & Florent",
  date = "10 Mai 2025",
  lieu = "Mas des Oliviers, Alpilles",
  message = "Au cœur de la Provence, nous vous attendons",
  accentColor = LAVENDER,
}: ProvenceOlivierProps) {
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
  const bgOpacity = interpolate(frame, [0, 35], [0, 1], { extrapolateRight: "clamp" });

  const sway = Math.sin((frame / fps) * 0.6 * Math.PI) * 3;
  const shimmer = interpolate(Math.sin((frame / fps) * 0.9 * Math.PI), [-1, 1], [0.85, 1.0]);

  // Cicada shimmer effect (opacity pulse)
  const heatShimmer = interpolate(Math.sin((frame / fps) * 2.5 * Math.PI), [-1, 1], [0.96, 1.0]);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(175deg, #1A1008 0%, #2A1E0C 30%, #3A2E18 60%, #2A200A 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      overflow: "hidden",
    }}>
      {/* Sky gradient overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "40%",
        background: `linear-gradient(180deg, rgba(123,111,160,0.15) 0%, transparent 100%)`,
        opacity: bgOpacity,
      }} />

      {/* Lavender field hint */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(ellipse at 50% 15%, rgba(184,169,212,0.08) 0%, transparent 50%),
                          radial-gradient(ellipse at 20% 80%, rgba(107,124,58,0.08) 0%, transparent 40%),
                          radial-gradient(ellipse at 80% 70%, rgba(200,148,58,0.06) 0%, transparent 40%)`,
        opacity: bgOpacity,
      }} />

      {/* Olive branches */}
      <OliveBranch side="left" opacity={0.4 * bgOpacity} sway={sway} />
      <OliveBranch side="right" opacity={0.4 * bgOpacity} sway={sway} />

      {/* Corner lavender sprigs */}
      {[
        { top: 40, left: 40 }, { top: 40, right: 40 },
        { bottom: 40, left: 40 }, { bottom: 40, right: 40 },
      ].map((style, i) => (
        <div key={i} style={{
          position: "absolute",
          ...style,
          fontSize: 40,
          opacity: 0.4 * shimmer * bgOpacity,
        }}>🌾</div>
      ))}

      {/* Main card */}
      <div style={{
        position: "absolute",
        inset: 75,
        backgroundColor: PARCHMENT,
        borderRadius: 16,
        border: `2px solid ${LAVENDER_LIGHT}`,
        boxShadow: `0 0 80px rgba(123,111,160,0.2), inset 0 0 60px rgba(200,148,58,0.06)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 70px",
        gap: 28,
        transform: `scale(${cardScale}) scaleX(${heatShimmer})`,
        opacity: bgOpacity,
      }}>
        <div style={{
          position: "absolute",
          inset: 20,
          border: `1px solid ${LAVENDER_LIGHT}`,
          borderRadius: 10,
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        {/* Lavender bunch */}
        <div style={{ opacity: fadeIn(30), fontSize: 48, marginBottom: -12, letterSpacing: 8 }}>💐</div>

        {/* Couple names */}
        <div style={{ opacity: fadeIn(50), transform: `translateY(${slideUp(50)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 18, letterSpacing: 6, color: LAVENDER, textTransform: "uppercase", marginBottom: 10 }}>
            Mariage en Provence
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: "normal",
            color: EARTH,
            letterSpacing: 1,
            lineHeight: 1.2,
            fontStyle: "italic",
          }}>
            {coupleNames}
          </div>
        </div>

        <LavenderDivider opacity={fadeIn(95)} />

        {/* Message */}
        <div style={{ opacity: fadeIn(110), transform: `translateY(${slideUp(110)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 26,
            color: EARTH,
            opacity: 0.7,
            letterSpacing: 1,
            fontStyle: "italic",
            lineHeight: 1.75,
          }}>
            {message}
          </div>
        </div>

        <LavenderDivider opacity={fadeIn(150)} />

        {/* Date */}
        <div style={{ opacity: fadeIn(165), transform: `translateY(${slideUp(165)}px)`, textAlign: "center" }}>
          <div style={{
            fontSize: 42,
            color: OCHRE,
            letterSpacing: 2,
            fontWeight: "bold",
            textShadow: `0 0 20px rgba(200,148,58,0.3)`,
          }}>
            {date}
          </div>
        </div>

        {/* Lieu */}
        <div style={{ opacity: fadeIn(200), transform: `translateY(${slideUp(200)}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 25, color: EARTH, opacity: 0.6, letterSpacing: 1.5, lineHeight: 1.5 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom provence icons */}
        <div style={{ opacity: fadeIn(235) * shimmer, fontSize: 28, marginTop: -6, letterSpacing: 10 }}>
          🫒 🌿 🫒
        </div>
      </div>
    </AbsoluteFill>
  );
}
