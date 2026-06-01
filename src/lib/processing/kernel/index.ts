// Processing kernel — cross-cutting primitives every tool's processing step
// shares. See base-infrastructure-plan §2.
//
// Worker plumbing (runInWorker / runOnMain / progress / cancel / teardown) is
// intentionally NOT included yet — gated on engineering-decisions #8 (which
// tools genuinely need a worker vs main-thread).

export { useBlobUrl } from "./useBlobUrl";
export {
  loadImageBoundedBySize,
  type BoundedBitmap,
  type DecodedPixelGuardOptions,
} from "./decodedPixelGuard";
export { runWithZeroBytesAssert, ZeroBytesViolation } from "./zeroBytesAssert";
