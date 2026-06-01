"use client";

import { useEffect } from "react";
import { hydrateFromIdb } from "@/lib/pipeline";

// Triggers a one-time rehydration of the pipeline singleton from IndexedDB
// on mount. Mount once per tree that consumes pipeline state.
//
// Renders nothing.
export function PipelineBootstrap() {
  useEffect(() => {
    void hydrateFromIdb();
  }, []);
  return null;
}
