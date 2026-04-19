import React from "react";
import { Composition } from "remotion";
import { EleganceDoree, EleganceDoreeProps } from "./EleganceDoree";
import { BohemeChampetre, BohemeChampetreProps } from "./templates/BohemeChampetre";
import { ModerneMinimal, ModerneMinimalProps } from "./templates/ModerneMinimal";
import { LuxeMarbre, LuxeMarbreProps } from "./templates/LuxeMarbre";
import { RomantiqueFloral, RomantiqueFloralProps } from "./templates/RomantiqueFloral";
import { CoteAzur, CoteAzurProps } from "./templates/CoteAzur";
import { ProvenceOlivier, ProvenceOlivierProps } from "./templates/ProvenceOlivier";
import { NuitEtoilee, NuitEtoileeProps } from "./templates/NuitEtoilee";

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

      <Composition
        id="BohemeChampetre"
        component={BohemeChampetre as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Léa & Théo",
          date: "12 Juillet 2025",
          lieu: "Domaine de la Bergerie, Luberon",
          message: "Rejoignez-nous pour célébrer notre amour",
          accentColor: "#C4714A",
        } satisfies BohemeChampetreProps}
      />

      <Composition
        id="ModerneMinimal"
        component={ModerneMinimal as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Clara & Marc",
          date: "20 Septembre 2025",
          lieu: "Galerie Lafayette, Paris",
          message: "Nous avons l'honneur de vous convier",
          accentColor: "#0A0A0A",
        } satisfies ModerneMinimalProps}
      />

      <Composition
        id="LuxeMarbre"
        component={LuxeMarbre as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Élise & Raphaël",
          date: "5 Avril 2026",
          lieu: "Grand Palais, Paris",
          message: "Vous êtes conviés à notre mariage",
          accentColor: "#BFA76A",
        } satisfies LuxeMarbreProps}
      />

      <Composition
        id="RomantiqueFloral"
        component={RomantiqueFloral as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Camille & Nicolas",
          date: "8 Juin 2025",
          lieu: "Domaine des Roses, Grasse",
          message: "Avec toute notre joie, nous vous invitons",
          accentColor: "#C2637A",
        } satisfies RomantiqueFloralProps}
      />

      <Composition
        id="CoteAzur"
        component={CoteAzur as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Marine & Jules",
          date: "15 Août 2025",
          lieu: "Villa Ephrussi, Saint-Jean-Cap-Ferrat",
          message: "Sous le soleil de la Méditerranée",
          accentColor: "#0077B6",
        } satisfies CoteAzurProps}
      />

      <Composition
        id="ProvenceOlivier"
        component={ProvenceOlivier as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Isabelle & Florent",
          date: "10 Mai 2025",
          lieu: "Mas des Oliviers, Alpilles",
          message: "Au cœur de la Provence, nous vous attendons",
          accentColor: "#7B6FA0",
        } satisfies ProvenceOlivierProps}
      />

      <Composition
        id="NuitEtoilee"
        component={NuitEtoilee as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          coupleNames: "Anaïs & Mathieu",
          date: "21 Juin 2025",
          lieu: "Observatoire de Paris, Île-de-France",
          message: "Sous les étoiles, nous vous attendons",
          accentColor: "#C8D8E8",
        } satisfies NuitEtoileeProps}
      />
    </>
  );
}
