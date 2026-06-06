// Main-thread runner (base-infrastructure-plan §2.1).
//
// Composes the cross-cutting kernel primitives — zero-bytes assert, abort
// signal, progress reporter, disposable bag — so individual main-thread
// processing functions don't each re-wire the same boilerplate.
//
// The processing fn receives a single context object so additions over time
// (cancel-on-page-leave, telemetry hooks, memory pressure events) can land
// without changing every callsite.

import { throwIfAborted } from "./cancel";
import { noopProgress, type ProgressReporter } from "./progress";
import { DisposableBag } from "./teardown";
import { runWithZeroBytesAssert } from "./zeroBytesAssert";

export interface ProcessingContext {
  signal?: AbortSignal;
  progress: ProgressReporter;
  bag: DisposableBag;
  /** Throws CancellationError if the signal has been aborted. */
  throwIfAborted: () => void;
}

export interface RunOnMainOptions {
  /** Tool slug — feeds zero-bytes assertion and downstream telemetry. */
  toolId: string;
  /** Abort signal from the shell — typically tied to a Cancel button. */
  signal?: AbortSignal;
  /** Progress reporter — defaults to a no-op when the shell doesn't care. */
  progress?: ProgressReporter;
  /**
   * If true, skip the zero-bytes assertion. Default false. Set to true only
   * for tools that legitimately make network calls (Quick Send signaling,
   * spec-db sync) — and in that case, prefer NOT running inside this runner
   * at all.
   */
  allowNetwork?: boolean;
}

/**
 * Run a main-thread processing fn with the kernel guarantees attached:
 *
 *   - zero-bytes assertion (fetch/XHR throws in dev, warns in prod)
 *   - cancel via AbortSignal — fn must call ctx.throwIfAborted() in loops
 *   - progress reporter — fn calls ctx.progress({ value, phase })
 *   - DisposableBag — register ImageBitmaps, object URLs, decoders for
 *     guaranteed teardown on success, failure, or cancel
 *
 * Returns the fn's result; throws CancellationError on cancel, the fn's
 * thrown error on failure. Cleanup runs in all three exit paths.
 */
export async function runOnMain<T>(
  options: RunOnMainOptions,
  fn: (ctx: ProcessingContext) => Promise<T>,
): Promise<T> {
  const progress = options.progress ?? noopProgress;
  const bag = new DisposableBag();
  const ctx: ProcessingContext = {
    signal: options.signal,
    progress,
    bag,
    throwIfAborted: () => throwIfAborted(options.signal),
  };

  try {
    ctx.throwIfAborted();
    if (options.allowNetwork) {
      return await fn(ctx);
    }
    return await runWithZeroBytesAssert(options.toolId, () => fn(ctx));
  } finally {
    bag.dispose();
  }
}
