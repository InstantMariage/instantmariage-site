import {
  renderMediaOnLambda,
  getRenderProgress,
  speculateFunctionName,
} from "@remotion/lambda/client";

const REGION = (process.env.AWS_REGION ?? "eu-west-3") as "eu-west-3";

const FUNCTION_NAME =
  process.env.REMOTION_FUNCTION_NAME ??
  speculateFunctionName({
    memorySizeInMb: 2048,
    diskSizeInMb: 2048,
    timeoutInSeconds: 120,
  });

const SERVE_URL = process.env.REMOTION_SERVE_URL ?? "";

export interface RenderInvitationVideoParams extends Record<string, unknown> {
  coupleNames: string;
  date: string;
  lieu: string;
  message?: string;
  accentColor?: string;
}

export interface RenderResult {
  renderId: string;
  bucketName: string;
}

export async function renderInvitationVideo(
  params: RenderInvitationVideoParams
): Promise<RenderResult> {
  const { renderId, bucketName } = await renderMediaOnLambda({
    region: REGION,
    functionName: FUNCTION_NAME,
    serveUrl: SERVE_URL,
    composition: "EleganceDoree",
    inputProps: params,
    codec: "h264",
    imageFormat: "jpeg",
    maxRetries: 3,
    concurrencyPerLambda: 1,
    framesPerLambda: 80,
    privacy: "public",
    outName: `invitation-${Date.now()}.mp4`,
  });

  return { renderId, bucketName };
}

export interface RenderStatus {
  done: boolean;
  overallProgress: number;
  outputFile: string | null;
  fatalErrorEncountered: boolean;
  errors: { message: string }[];
}

export async function checkRenderStatus(
  renderId: string,
  bucketName: string
): Promise<RenderStatus> {
  const progress = await getRenderProgress({
    renderId,
    bucketName,
    functionName: FUNCTION_NAME,
    region: REGION,
  });

  return {
    done: progress.done,
    overallProgress: progress.overallProgress,
    outputFile: progress.outputFile ?? null,
    fatalErrorEncountered: progress.fatalErrorEncountered,
    errors: progress.errors,
  };
}
