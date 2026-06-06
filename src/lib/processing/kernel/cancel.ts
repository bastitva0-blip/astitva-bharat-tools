// Cancellation primitives for processing operations
// (base-infrastructure-plan §2.1 — "AbortController plumbing").
//
// We standardise on the platform AbortController/AbortSignal. Tools never
// invent their own cancel flags — they accept `signal?: AbortSignal` and
// throw CancellationError when the user aborts.
//
// CancellationError is distinct from a generic Error so UIs can distinguish
// "user clicked Cancel" from "the codec exploded" — shells render a quiet
// rollback for the first and an error toast for the second.

export class CancellationError extends Error {
  constructor(message = "Operation cancelled") {
    super(message);
    this.name = "CancellationError";
  }
}

export function isCancellation(err: unknown): boolean {
  if (err instanceof CancellationError) return true;
  // DOMException("AbortError") is what fetch/AbortSignal-aware APIs throw.
  if (err instanceof DOMException && err.name === "AbortError") return true;
  return false;
}

/**
 * Throws CancellationError if the signal has fired. Sprinkle inside long
 * loops between non-trivial chunks — e.g. between pages of a PDF, between
 * binary-search iterations of the compressor.
 */
export function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new CancellationError();
  }
}

/**
 * Wraps a promise so it rejects with CancellationError as soon as the signal
 * fires — even if the underlying work hasn't reached its next throwIfAborted
 * checkpoint. The underlying work continues running in the background; this
 * is intentional. Truly stopping in-flight work needs cooperation from the
 * worker/codec, which most browser APIs don't offer.
 */
export function abortable<T>(
  promise: Promise<T>,
  signal: AbortSignal | undefined,
): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new CancellationError());
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(new CancellationError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      },
    );
  });
}
