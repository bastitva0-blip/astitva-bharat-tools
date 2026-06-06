"use client";

import { ResizeToSpecShell, type ResizeResult } from "@/components/tool-shells";
import type { CropRegionPx } from "@/lib/processing/image";
import { compressWithDownscale } from "@/lib/processing/image";
import type { PhotoSpecPreset } from "@/lib/presets/photo-spec";
import { getToolBySlug } from "@/lib/tools";

interface Props {
  preset: PhotoSpecPreset;
  /** Prefix for the downloaded filename (e.g. "upsc" or "aadhaar"). */
  downloadSlug: string;
}

// Thin adapter: existing pages keep importing PhotoSpecForm with the same
// props; the new ResizeToSpecShell owns layout, analytics, pipeline + crop
// interaction. The per-tool processor (compressWithDownscale) is the only
// thing that varies between pages today.
export function PhotoSpecForm({ preset, downloadSlug }: Props) {
  // Both photo-resize (exam) and document-photo route through this form. The
  // tool registry uses the route's base slug — derive it from the preset's
  // category. spec-db marks each spec as "photo" (exam) or "document".
  const toolSlug = preset.category === "document" ? "document-photo" : "photo-resize";
  const tool = getToolBySlug(toolSlug);
  if (!tool) {
    throw new Error(`${toolSlug} tool missing from registry`);
  }

  const onProcess = async (
    img: HTMLImageElement,
    cropPx: CropRegionPx,
  ): Promise<ResizeResult> => {
    const r = await compressWithDownscale(
      img,
      cropPx,
      preset.dimensions.widthPx,
      preset.dimensions.heightPx,
      "#ffffff",
      {
        minBytes: preset.kbRange.min * 1024,
        maxBytes: preset.kbRange.max * 1024,
      },
    );
    return { blob: r.blob, bytes: r.bytes, hitTarget: r.hitTarget };
  };

  return (
    <ResizeToSpecShell
      tool={tool}
      preset={preset}
      onProcess={onProcess}
      outputFilename={`bharattools-${downloadSlug}.jpg`}
    />
  );
}
