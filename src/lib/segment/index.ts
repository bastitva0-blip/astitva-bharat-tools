// Public surface of the segmentation layer.

export { captureAttribution, getAttribution, resetAttribution } from "./attribution";
export { startSignalCollection, getSignals, resetSignals } from "./signals";
export { scoreSegment } from "./scorer";
export type {
  Attribution,
  ResolvedSignals,
  Segment,
  SegmentResolution,
  SignalState,
} from "./types";

import { getAttribution } from "./attribution";
import { getSignals } from "./signals";
import { scoreSegment } from "./scorer";
import type { SegmentResolution } from "./types";

/**
 * Resolve the current segment in one call. Cheap (reads localStorage + a few
 * map ops) — safe to call on every paywall-gate trigger per
 * engineering-decisions #12 item 2.
 */
export function resolveSegment(): SegmentResolution {
  return scoreSegment(getAttribution(), getSignals());
}
