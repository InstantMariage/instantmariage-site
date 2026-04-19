import React from "react";
import { Composition } from "remotion";
import { EleganceDoree, EleganceDoreeProps } from "./EleganceDoree";

const FPS = 30;
const DURATION_SECONDS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="EleganceDoree"
        component={EleganceDoree as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Sophie & Antoine",
          date: "14 Juin 2025",
          lieu: "Château de Versailles, Paris",
          message: "Nous vous invitons à célébrer notre union",
          accentColor: "#C9A84C",
        } satisfies EleganceDoreeProps}
      />
    </>
  );
}
