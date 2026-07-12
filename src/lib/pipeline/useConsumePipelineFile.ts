"use client";

// Consumer-side hook for the pipeline (base-infrastructure-plan §4.4).
//
// The new tool shells (CompressToTargetShell etc.) already consume the
// pipeline entry on mount. Legacy hand-rolled forms — JpgToPdfForm,
// PhotoSignatureJoinerForm, PrintSheetForm — predate the shell pattern.
// Until they migrate, this hook gives them the same handoff in 3 lines:
//
//   useConsumePipelineFile({
//     accept: "image/*",
//     onFile: (file) => addFiles([file]),
//   });
//
// Semantics match the shell:
//   - one-time consumption per mount (consumedRef guard)
//   - accept-aware: skips MIME/extension mismatches without consuming, so
//     the entry stays in the store for a tool that does accept it
//   - hydrates from IndexedDB on first mount (idempotent)

import { useEffect, useRef } from "react";

import { usePipeline } from "./usePipeline";

interface UseConsumePipelineFileArgs {
  /** Comma-separated MIME accept string, e.g. "image/*" or "application/pdf". */
  accept: string;
  /** Called once when a matching entry is consumed from the pipeline. */
  onFile: (file: File) => void;
  /**
   * True once the shell already has a local file/result. Guards against a
   * shell re-adopting the very entry it just wrote via `setPipeline` after a
   * successful process — without this, the entry change triggers this same
   * hook's effect and the shell "eats its own tail": the freshly generated
   * output gets fed back in as a new input file, silently reverting a
   * just-finished result back to the picker/crop state.
   */
  hasFile: boolean;
}

function matchesAccept(mime: string, name: string, accept: string): boolean {
  const tokens = accept.split(",").map((s) => s.trim()).filter(Boolean);
  if (tokens.length === 0 || tokens.includes("*/*")) return true;
  const lowerName = name.toLowerCase();
  for (const token of tokens) {
    if (token.startsWith(".")) {
      if (lowerName.endsWith(token.toLowerCase())) return true;
      continue;
    }
    if (token.endsWith("/*")) {
      if (mime.startsWith(token.slice(0, -1))) return true;
      continue;
    }
    if (token === mime) return true;
  }
  return false;
}

export function useConsumePipelineFile({ accept, onFile, hasFile }: UseConsumePipelineFileArgs): void {
  const { entry, hydrate } = usePipeline();
  const consumedRef = useRef(false);
  // Keep latest callback in a ref so the consumption effect doesn't depend on
  // it — callers commonly pass an inline closure that changes every render.
  const onFileRef = useRef(onFile);
  useEffect(() => {
    onFileRef.current = onFile;
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (consumedRef.current || !entry || hasFile) return;
    if (!matchesAccept(entry.meta.type, entry.meta.name, accept)) {
      consumedRef.current = true;
      return;
    }
    consumedRef.current = true;
    const file = new File([entry.blob], entry.meta.name, { type: entry.meta.type });
    onFileRef.current(file);
  }, [entry, accept, hasFile]);
}
