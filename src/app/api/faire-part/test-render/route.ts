export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { renderMediaOnLambda, getRenderProgress, speculateFunctionName } from "@remotion/lambda/client";

const REQUIRED_VARS = [
  "REMOTION_AWS_ACCESS_KEY_ID",
  "REMOTION_AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "REMOTION_FUNCTION_NAME",
  "REMOTION_SERVE_URL",
];

function checkEnvVars() {
  return REQUIRED_VARS.map((key) => ({
    key,
    set: !!process.env[key],
    value: process.env[key] ? `${process.env[key]!.slice(0, 12)}…` : null,
  }));
}

export async function GET() {
  const vars = checkEnvVars();
  const allSet = vars.every((v) => v.set);
  return NextResponse.json({ ok: allSet, vars });
}

export async function POST(req: NextRequest) {
  const { composition = "EleganceDoree", template } = await req.json().catch(() => ({}));

  const vars = checkEnvVars();
  const missing = vars.filter((v) => !v.set).map((v) => v.key);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Variables d'environnement manquantes", missing },
      { status: 500 }
    );
  }

  const region = (process.env.AWS_REGION ?? "eu-west-3") as "eu-west-3";
  const functionName =
    process.env.REMOTION_FUNCTION_NAME ??
    speculateFunctionName({ memorySizeInMb: 2048, diskSizeInMb: 2048, timeoutInSeconds: 120 });
  const serveUrl = process.env.REMOTION_SERVE_URL!;
  const compositionId = template ?? composition;

  try {
    const { renderId, bucketName } = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: compositionId,
      inputProps: {
        coupleNames: "Test & Démo",
        date: "14 Juin 2025",
        lieu: "Château de Versailles, Paris",
        message: "Rendu de test InstantMariage",
        accentColor: "#C9A84C",
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 1,
      framesPerLambda: 80,
      privacy: "public",
      outName: `test-render-${Date.now()}.mp4`,
    });

    // Attendre la fin du rendu (polling rapide, max 90s)
    let progress = { done: false, overallProgress: 0, outputFile: null as string | null, fatalErrorEncountered: false, errors: [] as { message: string }[] };
    const start = Date.now();
    while (!progress.done && !progress.fatalErrorEncountered && Date.now() - start < 90_000) {
      await new Promise((r) => setTimeout(r, 3000));
      const p = await getRenderProgress({ renderId, bucketName, functionName, region });
      progress = {
        done: p.done,
        overallProgress: p.overallProgress,
        outputFile: p.outputFile ?? null,
        fatalErrorEncountered: p.fatalErrorEncountered,
        errors: p.errors,
      };
    }

    if (progress.fatalErrorEncountered) {
      return NextResponse.json(
        { error: "Erreur Lambda durant le rendu", details: progress.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      renderId,
      bucketName,
      done: progress.done,
      progress: progress.overallProgress,
      videoUrl: progress.outputFile,
      composition: compositionId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Échec du rendu", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
