import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from "remotion";

export interface EleganceDoreeProps {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#F0D080";
const CREAM = "#FAF6EE";
const DARK = "#2C1A0E";

function EnvelopFlap({ frame, fps }: { frame: number; fps: number }) {
  const openProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 18, stiffness: 80, mass: 1 },
    durationInFrames: 40,
  });

  const rotateX = interpolate(openProgress, [0, 1], [0, -160]);
  const shadowOpacity = interpolate(openProgress, [0, 0.5, 1], [0.3, 0.6, 0]);

  return (
    <>
      {/* Envelope body */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100%",
          backgroundColor: CREAM,
          borderRadius: 12,
          boxShadow: `0 8px 40px rgba(0,0,0,${shadowOpacity})`,
          border: `3px solid ${GOLD}`,
        }}
      />
      {/* Flap */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "55%",
          transformOrigin: "top center",
          transform: `perspective(800px) rotateX(${rotateX}deg)`,
          backgroundColor: CREAM,
          borderRadius: "12px 12px 0 0",
          border: `3px solid ${GOLD}`,
          borderBottom: "none",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 32,
          zIndex: 10,
          backfaceVisibility: "hidden",
        }}
      >
        {/* Wax seal */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${GOLD_LIGHT}, ${GOLD})`,
            boxShadow: `0 4px 16px rgba(201,168,76,0.6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}
        >
          ♥
        </div>
      </div>
      {/* Envelope V fold lines */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,240 200,120 400,240"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.5"
          opacity="0.4"
        />
      </svg>
    </>
  );
}

function OrnementalDivider({ opacity }: { opacity: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity, width: "80%" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <span style={{ color: GOLD, fontSize: 20 }}>❧</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  );
}

export function EleganceDoree({
  coupleNames = "Sophie & Antoine",
  date = "14 Juin 2025",
  lieu = "Château de Versailles, Paris",
  message = "Nous vous invitons à célébrer notre union",
  accentColor = GOLD,
}: EleganceDoreeProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Envelope appears (0-30f)
  const envelopeScale = spring({ frame, fps, from: 0.6, to: 1, config: { damping: 20, stiffness: 100 }, durationInFrames: 30 });
  const envelopeOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Phase 2: Flap opens (30-70f)
  const flapFrame = Math.max(0, frame - 30);

  // Phase 3: Card rises (70-110f)
  const cardRiseProgress = spring({ frame: Math.max(0, frame - 70), fps, from: 0, to: 1, config: { damping: 22, stiffness: 90 }, durationInFrames: 40 });
  const cardY = interpolate(cardRiseProgress, [0, 1], [60, -320]);
  const cardOpacity = interpolate(frame, [70, 95], [0, 1], { extrapolateRight: "clamp" });

  // Phase 4: Text reveals (110-600f)
  const textDelay = (startFrame: number) =>
    interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const titleOpacity = textDelay(110);
  const titleY = interpolate(frame, [110, 140], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const divider1Opacity = textDelay(145);
  const msgOpacity = textDelay(160);
  const msgY = interpolate(frame, [160, 190], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const divider2Opacity = textDelay(195);
  const dateOpacity = textDelay(210);
  const dateY = interpolate(frame, [210, 240], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  const lieuOpacity = textDelay(240);
  const lieuY = interpolate(frame, [240, 270], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // Ambient particle shimmer
  const shimmer = interpolate(Math.sin((frame / fps) * 1.5 * Math.PI), [-1, 1], [0.7, 1.0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #1a0e05 0%, #2C1A0E 50%, #1a0e05 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Background ornament */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)`,
        }}
      />

      {/* Corner ornaments */}
      {[
        { top: 40, left: 40, transform: "rotate(0deg)" },
        { top: 40, right: 40, transform: "rotate(90deg)" },
        { bottom: 40, right: 40, transform: "rotate(180deg)" },
        { bottom: 40, left: 40, transform: "rotate(270deg)" },
      ].map((style, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...style,
            color: accentColor,
            opacity: 0.4 * shimmer,
            fontSize: 48,
            lineHeight: 1,
          }}
        >
          ✦
        </div>
      ))}

      {/* Envelope container */}
      <Sequence from={0} durationInFrames={110}>
        <div
          style={{
            position: "relative",
            width: 700,
            height: 420,
            transform: `scale(${envelopeScale})`,
            opacity: envelopeOpacity,
          }}
        >
          <EnvelopFlap frame={flapFrame} fps={fps} />

          {/* Letter peeking out */}
          {frame > 70 && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "10%",
                right: "10%",
                height: 280,
                backgroundColor: CREAM,
                borderRadius: 8,
                transform: `translateY(${cardY}px)`,
                opacity: cardOpacity,
                border: `2px solid ${GOLD}`,
                boxShadow: `0 -8px 32px rgba(201,168,76,0.3)`,
              }}
            />
          )}
        </div>
      </Sequence>

      {/* Invitation card content */}
      <Sequence from={110}>
        <div
          style={{
            position: "absolute",
            inset: 60,
            backgroundColor: CREAM,
            borderRadius: 16,
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 60px rgba(201,168,76,0.25), inset 0 0 40px rgba(201,168,76,0.05)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
            gap: 28,
          }}
        >
          {/* Inner border */}
          <div
            style={{
              position: "absolute",
              inset: 20,
              border: `1px solid ${accentColor}`,
              borderRadius: 10,
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />

          {/* Top ornament */}
          <div style={{ color: accentColor, fontSize: 36, opacity: shimmer, marginBottom: -8 }}>❧</div>

          {/* Couple names */}
          <div
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: "normal",
                color: DARK,
                letterSpacing: 2,
                lineHeight: 1.2,
                fontStyle: "italic",
              }}
            >
              {coupleNames}
            </div>
          </div>

          <OrnementalDivider opacity={divider1Opacity} />

          {/* Message */}
          <div
            style={{
              opacity: msgOpacity,
              transform: `translateY(${msgY}px)`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 30,
                color: DARK,
                opacity: 0.75,
                letterSpacing: 1.5,
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              {message}
            </div>
          </div>

          <OrnementalDivider opacity={divider2Opacity} />

          {/* Date */}
          <div
            style={{
              opacity: dateOpacity,
              transform: `translateY(${dateY}px)`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 42,
                color: accentColor,
                letterSpacing: 3,
                fontWeight: "bold",
                textShadow: `0 0 20px rgba(201,168,76,0.4)`,
              }}
            >
              {date}
            </div>
          </div>

          {/* Lieu */}
          <div
            style={{
              opacity: lieuOpacity,
              transform: `translateY(${lieuY}px)`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: DARK,
                opacity: 0.65,
                letterSpacing: 2,
              }}
            >
              {lieu}
            </div>
          </div>

          {/* Bottom ornament */}
          <div style={{ color: accentColor, fontSize: 28, opacity: lieuOpacity * shimmer, marginTop: -8 }}>
            ✦ ✦ ✦
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
}
