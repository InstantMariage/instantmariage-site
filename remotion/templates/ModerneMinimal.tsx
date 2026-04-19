import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

export interface ModerneMinimalProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const BLACK = "#0A0A0A";
const WHITE = "#F8F8F8";
const ACCENT = "#1A1A1A";
const LINE = "#333333";

function AnimatedLine({ progress, vertical = false }: { progress: number; vertical?: boolean }) {
  if (vertical) {
    return (
      <div style={{
        width: 1,
        height: interpolate(progress, [0, 1], [0, 120]),
        backgroundColor: LINE,
        transition: "none",
      }} />
    );
  }
  return (
    <div style={{
      height: 1,
      width: interpolate(progress, [0, 1], [0, 300]),
      backgroundColor: LINE,
    }} />
  );
}

export function ModerneMinimal({
  coupleNames = "Clara & Marc",
  date = "20 Septembre 2025",
  lieu = "Galerie Lafayette, Paris",
  message = "Nous avons l'honneur de vous convier",
  accentColor = BLACK,
}: ModerneMinimalProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = (start: number, duration = 30) =>
    interpolate(frame, [start, start + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    });

  const slideLeft = (start: number) =>
    interpolate(frame, [start, start + 40], [-40, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const lineProgress = (start: number) =>
    interpolate(frame, [start, start + 45], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

  // Counter animation for year
  const yearReveal = interpolate(frame, [120, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgReveal = spring({ frame, fps, from: 0, to: 1, config: { damping: 25, stiffness: 60 }, durationInFrames: 60 });

  return (
    <AbsoluteFill style={{
      backgroundColor: WHITE,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      overflow: "hidden",
    }}>
      {/* Black reveal block from top */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: interpolate(bgReveal, [0, 1], [1920, 480]),
        backgroundColor: BLACK,
        transition: "none",
      }} />

      {/* Top section — white text on black */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "0 80px",
      }}>
        {/* M label */}
        <div style={{
          opacity: fadeIn(30),
          transform: `translateX(${slideLeft(30)}px)`,
          fontSize: 14,
          color: WHITE,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}>
          Mariage
        </div>

        <AnimatedLine progress={lineProgress(45)} />

        {/* Couple names */}
        <div style={{
          opacity: fadeIn(60),
          transform: `translateX(${slideLeft(60)}px)`,
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 64,
            fontWeight: 300,
            color: WHITE,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}>
            {coupleNames.split(" & ")[0]}
          </div>
          <div style={{
            fontSize: 18,
            color: WHITE,
            opacity: 0.5,
            letterSpacing: 6,
            margin: "12px 0",
          }}>
            &amp;
          </div>
          <div style={{
            fontSize: 64,
            fontWeight: 300,
            color: WHITE,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}>
            {coupleNames.split(" & ")[1] || ""}
          </div>
        </div>

        <AnimatedLine progress={lineProgress(100)} />
      </div>

      {/* Bottom section — black text on white */}
      <div style={{
        position: "absolute",
        top: 530,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "60px 80px",
        gap: 40,
      }}>
        {/* Message */}
        <div style={{
          opacity: fadeIn(130),
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 22,
            color: ACCENT,
            letterSpacing: 2,
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            {message}
          </div>
        </div>

        {/* Date block */}
        <div style={{
          opacity: fadeIn(160),
          textAlign: "center",
          borderLeft: `3px solid ${BLACK}`,
          paddingLeft: 24,
          alignSelf: "flex-start",
          marginLeft: 80,
        }}>
          <div style={{ fontSize: 13, letterSpacing: 5, color: ACCENT, opacity: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
            Date
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, color: BLACK, letterSpacing: 1 }}>
            {date}
          </div>
        </div>

        {/* Lieu block */}
        <div style={{
          opacity: fadeIn(200),
          textAlign: "center",
          borderLeft: `3px solid ${BLACK}`,
          paddingLeft: 24,
          alignSelf: "flex-start",
          marginLeft: 80,
        }}>
          <div style={{ fontSize: 13, letterSpacing: 5, color: ACCENT, opacity: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
            Lieu
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: BLACK, letterSpacing: 0.5, lineHeight: 1.4 }}>
            {lieu}
          </div>
        </div>

        {/* Bottom line decoration */}
        <div style={{
          marginTop: "auto",
          opacity: fadeIn(240),
          display: "flex",
          alignItems: "center",
          gap: 16,
          width: "80%",
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: LINE }} />
          <div style={{ fontSize: 11, letterSpacing: 4, color: ACCENT, opacity: 0.4, textTransform: "uppercase" }}>
            RSVP
          </div>
          <div style={{ flex: 1, height: 1, backgroundColor: LINE }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}
