// Determinate progress reporting for processing operations
// (base-infrastructure-plan §2.1).
//
// Single shape across every tool. UIs render whichever subset they care about
// (a value-only bar, a label-only message, or both).
//
// Conventions:
//   - `value` is 0..1. Tools that genuinely don't know progress should emit
//     `phase: "indeterminate"` instead of inventing a fake percentage.
//   - `phase` is a short stable token ("decode", "encode", "iter-3-of-7").
//     Use it for telemetry / debug, not localized UI copy.
//   - `label` is optional localized copy, e.g. dict.shell.processing.

export interface ProgressEvent {
  value: number;
  phase?: string;
  label?: string;
  indeterminate?: boolean;
}

export type ProgressReporter = (event: ProgressEvent) => void;

/**
 * Wraps a reporter so that progress values monotonically increase. Some
 * operations (binary-search compressors, multi-pass encoders) naturally
 * report fluctuating estimates; the UI is calmer when those are clamped.
 */
export function monotonic(reporter: ProgressReporter): ProgressReporter {
  let high = 0;
  return (event) => {
    const next = Math.max(high, Math.min(1, event.value));
    high = next;
    reporter({ ...event, value: next });
  };
}

/**
 * Returns a sub-reporter that maps its 0..1 input into the [from, to] slice
 * of the parent reporter. Useful when one operation has N sequential phases
 * (e.g. decode 0..0.3, transform 0.3..0.7, encode 0.7..1).
 */
export function slice(
  parent: ProgressReporter,
  from: number,
  to: number,
): ProgressReporter {
  const span = to - from;
  return (event) => {
    parent({
      ...event,
      value: from + Math.min(1, Math.max(0, event.value)) * span,
    });
  };
}

/** A no-op reporter — useful as a default in code paths where the caller
 * doesn't subscribe. */
export const noopProgress: ProgressReporter = () => {};
