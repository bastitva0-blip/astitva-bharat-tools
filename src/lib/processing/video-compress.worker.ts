// Video compression worker — moves mediabunny's demux/encode/mux pipeline
// off the main thread. Unlike a JPEG re-encode, a video transcode can run
// for tens of seconds to minutes; doing that on the main thread would freeze
// the whole tab (buttons, scroll, the submit spinner itself).
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";
import { handleWorkerRequest } from "./kernel/runInWorker";

export interface VideoCompressPayload {
  file: File;
  targetBytes: number;
}

export interface VideoCompressWorkerResult {
  blob: Blob;
  bytes: number;
  durationSec: number;
  width: number;
  height: number;
  hitTarget: boolean;
}

// Reasonable default for compressed speech/background audio — kept fixed so
// the bitrate math below only has to solve for the video track.
const AUDIO_BITRATE = 96_000;
// Never request an encode this low — WebCodecs encoders produce unusable
// output below this, and it protects against a near-zero result on an
// extremely tight target combined with a long video.
const MIN_VIDEO_BITRATE = 150_000;
// Reserve headroom for MP4 container/moov overhead so the encoded track
// itself lands a little under the raw target, not right at the edge of it.
const CONTAINER_SAFETY_MARGIN = 0.9;
// Extra pullback applied on top of the *measured* correction ratio each
// pass, so passes converge from above instead of oscillating around the
// target.
const CORRECTION_SAFETY = 0.9;
// Video encodes are far more expensive than a JPEG quality search, but
// hitting the promised target is this tool's entire point — some encoders
// (particularly hardware ones) track a requested bitrate loosely, so a
// couple of extra corrective passes buys real convergence, not just cost.
const MAX_PASSES = 5;

async function convertOnce(
  input: Input,
  bitrate: number,
  onProgress: (progress: number) => void,
): Promise<Blob> {
  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat(), target });

  const conversion = await Conversion.init({
    input,
    output,
    // Software encoders track a requested bitrate far more precisely than
    // many hardware implementations, which matters more here than encode
    // speed — this tool's whole promise is landing at or under the target.
    video: { codec: "avc", bitrate, hardwareAcceleration: "prefer-software" },
    audio: { bitrate: AUDIO_BITRATE },
  });

  if (!conversion.isValid) {
    throw new Error("This video can't be converted — unsupported codec or track combination.");
  }

  conversion.onProgress = onProgress;
  await conversion.execute();

  if (!target.buffer) {
    throw new Error("Conversion finished without producing output.");
  }
  return new Blob([target.buffer], { type: "video/mp4" });
}

handleWorkerRequest<VideoCompressPayload, VideoCompressWorkerResult>(async (payload, ctx) => {
  const { file, targetBytes } = payload;
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });

  try {
    if (!(await input.canRead())) {
      throw new Error("This file isn't a recognized video format.");
    }

    const track = await input.getPrimaryVideoTrack();
    if (!track) {
      throw new Error("No video track found in this file.");
    }

    const [width, height, durationSec] = await Promise.all([
      track.getDisplayWidth(),
      track.getDisplayHeight(),
      input.computeDuration(),
    ]);
    if (!(durationSec > 0)) {
      throw new Error("Could not determine the video's duration.");
    }

    let bitrate = Math.max(
      MIN_VIDEO_BITRATE,
      Math.floor((targetBytes * 8 * CONTAINER_SAFETY_MARGIN) / durationSec) - AUDIO_BITRATE,
    );

    let best: { blob: Blob; bytes: number } | null = null;
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const blob = await convertOnce(input, bitrate, (p) =>
        ctx.progress((pass + p) / MAX_PASSES, "encode", `Pass ${pass + 1} of ${MAX_PASSES}`),
      );
      if (!best || blob.size < best.bytes) best = { blob, bytes: blob.size };
      if (blob.size <= targetBytes) break;

      // Scale the bitrate by how far off the *measured* output actually was,
      // rather than a fixed percentage cut. The nominal bitrate we request
      // is only a target — some encoders (particularly hardware ones) don't
      // track it closely, so a flat decay can under-correct for several
      // passes in a row. Measuring the real ratio converges in far fewer
      // passes regardless of *why* the first guess was off.
      const ratio = targetBytes / blob.size;
      bitrate = Math.max(MIN_VIDEO_BITRATE, Math.floor(bitrate * ratio * CORRECTION_SAFETY));
    }

    if (!best) throw new Error("Compression failed.");

    // A "compressed" result that isn't actually smaller than the source is
    // not a usable success — surface it as a clear failure instead of
    // silently handing back a bigger file than what was uploaded.
    if (best.bytes >= file.size) {
      throw new Error(
        "Could not make this video smaller — it may already be efficiently encoded, or too short for the requested target.",
      );
    }

    return {
      blob: best.blob,
      bytes: best.bytes,
      durationSec,
      width,
      height,
      hitTarget: best.bytes <= targetBytes,
    };
  } finally {
    input.dispose();
  }
});
