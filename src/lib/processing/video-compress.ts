import { monotonic, type ProgressReporter } from "./kernel/progress";
import { runInWorker } from "./kernel/runInWorker";
import type { VideoCompressPayload, VideoCompressWorkerResult } from "./video-compress.worker";

export interface VideoCompressOptions {
  /** Target ceiling in MB — there is no minimum for video, unlike the exam photo tools. */
  targetMb: number;
  onProgress?: ProgressReporter;
}

export interface VideoCompressResult {
  blob: Blob;
  bytes: number;
  durationSec: number;
  width: number;
  height: number;
  hitTarget: boolean;
}

// Cheap, synchronous, no mediabunny import — used to gate the UI before
// paying for the (small, but non-zero) cost of loading the worker at all.
export function isWebCodecsVideoSupported(): boolean {
  return typeof window !== "undefined" && "VideoEncoder" in window && "VideoDecoder" in window;
}

export function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function compressVideoToTargetMb(
  file: File,
  opts: VideoCompressOptions,
): Promise<VideoCompressResult> {
  const worker = new Worker(new URL("./video-compress.worker.ts", import.meta.url));
  const targetBytes = Math.round(opts.targetMb * 1024 * 1024);
  const progress = opts.onProgress ? monotonic(opts.onProgress) : undefined;

  return runInWorker<VideoCompressPayload, VideoCompressWorkerResult>(
    worker,
    { file, targetBytes },
    { progress },
  );
}
