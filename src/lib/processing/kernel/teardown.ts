// Teardown helpers (base-infrastructure-plan §2.1 — "revokeObjectURL,
// releaseDecoder, releaseOnnxArena").
//
// Long-running tools accumulate disposables: ImageBitmaps, object URLs,
// VideoDecoders, OffscreenCanvases, OnnxRuntime sessions, etc. A
// DisposableBag collects everything created during one processing call and
// releases it on success, failure, AND cancellation.
//
// Usage pattern (inside runOnMain):
//
//   await using bag = new DisposableBag();
//   const bitmap = bag.keep(await loadImageBoundedBySize(file));
//   bag.keepUrl(URL.createObjectURL(blob));
//
// We polyfill the `[Symbol.dispose]` shape ourselves — Symbol.dispose lands
// in ES2026 and target browsers don't all ship it yet. `dispose()` is
// idempotent and safe to call from both success and failure paths.

import type { BoundedBitmap } from "./decodedPixelGuard";

interface Disposable {
  close?: () => void;
  dispose?: () => void;
  release?: () => void;
  terminate?: () => void;
}

export class DisposableBag {
  private resources: Array<() => void> = [];
  private disposed = false;

  /** Track an ImageBitmap (or any object exposing a close-like method). */
  keep<T extends Disposable>(resource: T): T {
    this.resources.push(() => {
      try {
        if (resource.close) resource.close();
        else if (resource.dispose) resource.dispose();
        else if (resource.release) resource.release();
        else if (resource.terminate) resource.terminate();
      } catch {
        // Disposal must never throw — swallowing is intentional.
      }
    });
    return resource;
  }

  /** Track a BoundedBitmap's underlying ImageBitmap. */
  keepBoundedBitmap(b: BoundedBitmap): BoundedBitmap {
    this.keep(b.bitmap);
    return b;
  }

  /** Track an object URL — revoked on dispose. */
  keepUrl(url: string): string {
    this.resources.push(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    });
    return url;
  }

  /** Register a custom cleanup function (e.g. close an OnnxRuntime arena). */
  onDispose(fn: () => void): void {
    this.resources.push(() => {
      try {
        fn();
      } catch {
        // ignore
      }
    });
  }

  /** Release everything. Idempotent. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    // Iterate in reverse — disposables are typically nested, and last-in /
    // first-out matches construction order intuitively.
    for (let i = this.resources.length - 1; i >= 0; i--) {
      this.resources[i]();
    }
    this.resources = [];
  }
}
