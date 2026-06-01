"use client";

import { useSyncExternalStore } from "react";
import { hydrateFromIdb, pipelineStore } from "./store";
import type { PipelineEntry } from "./types";

// React binding for the pipeline singleton.
//
// Uses useSyncExternalStore for correct concurrent-rendering semantics. SSR
// fallback is `null` — server output never contains pipeline state (it's a
// browser-only privacy primitive).
//
// `hydrate` triggers a one-time IDB rehydration. Tool shells should call it
// on mount; subsequent mounts are no-ops.
export function usePipeline(): {
  entry: PipelineEntry | null;
  set: typeof pipelineStore.set;
  clear: typeof pipelineStore.clear;
  hydrate: () => Promise<void>;
} {
  const entry = useSyncExternalStore(
    pipelineStore.subscribe,
    () => pipelineStore.get(),
    () => null,
  );
  return {
    entry,
    set: pipelineStore.set,
    clear: pipelineStore.clear,
    hydrate: hydrateFromIdb,
  };
}
