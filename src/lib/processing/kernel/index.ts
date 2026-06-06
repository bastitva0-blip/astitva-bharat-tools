// Processing kernel — cross-cutting primitives every tool's processing step
// shares. See base-infrastructure-plan §2.
//
// Composition: a tool's main-thread processing fn typically calls
// `runOnMain({ toolId, signal, progress }, async (ctx) => { ... })`, which
// wraps it in zero-bytes assert + cancel + DisposableBag. Worker-backed
// tools use `runInWorker(worker, payload, { signal, progress })` instead.

export { useBlobUrl } from "./useBlobUrl";
export {
  loadImageBoundedBySize,
  type BoundedBitmap,
  type DecodedPixelGuardOptions,
} from "./decodedPixelGuard";
export { runWithZeroBytesAssert, ZeroBytesViolation } from "./zeroBytesAssert";

export { CancellationError, abortable, isCancellation, throwIfAborted } from "./cancel";
export {
  monotonic,
  noopProgress,
  slice,
  type ProgressEvent,
  type ProgressReporter,
} from "./progress";
export { DisposableBag } from "./teardown";
export {
  runOnMain,
  type ProcessingContext,
  type RunOnMainOptions,
} from "./runOnMain";
export {
  handleWorkerRequest,
  runInWorker,
  type WorkerCallOptions,
} from "./runInWorker";
