// Module-scope pipeline singleton (base-infrastructure-plan §4.1,
// engineering-decisions #2).
//
// Stored at module scope so a soft <Link> navigation between two tool routes
// preserves the entry — the JS module isn't re-evaluated by App Router on
// client-side nav. For hard refresh, the IndexedDB mirror in ./indexeddb
// rehydrates via `hydrateFromIdb()` (call from PipelineBootstrap on layout
// mount).
//
// Idle policy (PIPELINE_IDLE_MS = 30 min): on read, if the entry is older
// than the window, it is cleared. This is the only privacy guarantee —
// blobs don't loiter in IDB indefinitely.

import { idbClear, idbRead, idbWrite } from "./indexeddb";
import { PIPELINE_IDLE_MS, type PipelineEntry } from "./types";

let _entry: PipelineEntry | null = null;
const _subscribers = new Set<() => void>();

function notify(): void {
  for (const fn of _subscribers) fn();
}

function isStale(entry: PipelineEntry, now = Date.now()): boolean {
  return now - entry.createdAt > PIPELINE_IDLE_MS;
}

export const pipelineStore = {
  set(entry: PipelineEntry): void {
    _entry = entry;
    notify();
    // Fire-and-forget IDB mirror; never await from a write path.
    void idbWrite(entry);
  },

  get(): PipelineEntry | null {
    if (_entry && isStale(_entry)) {
      _entry = null;
      void idbClear();
      notify();
    }
    return _entry;
  },

  clear(): void {
    _entry = null;
    void idbClear();
    notify();
  },

  subscribe(fn: () => void): () => void {
    _subscribers.add(fn);
    return () => {
      _subscribers.delete(fn);
    };
  },
};

let hydratePromise: Promise<void> | null = null;

/**
 * Rehydrate the in-memory singleton from IndexedDB. Idempotent — repeated
 * calls return the same in-flight promise. Call once from a top-of-tree
 * client component (PipelineBootstrap) on layout mount.
 *
 * If IDB holds a stale entry it is cleared and the singleton stays empty.
 */
export function hydrateFromIdb(): Promise<void> {
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    if (_entry) return; // already populated this session
    const stored = await idbRead();
    if (!stored) return;
    if (isStale(stored)) {
      await idbClear();
      return;
    }
    _entry = stored;
    notify();
  })();
  return hydratePromise;
}
