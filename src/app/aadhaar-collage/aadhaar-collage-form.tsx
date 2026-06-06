"use client";

import { ComposeShell, type ComposeResult } from "@/components/tool-shells";
import { getToolBySlug } from "@/lib/tools";

export function AadhaarCollageForm() {
  const tool = getToolBySlug("aadhaar-collage");
  if (!tool) throw new Error("aadhaar-collage tool missing from registry");

  // Placeholder until the real compose logic lands. The shell renders fully
  // (drop zone, ordered list of inputs, reorder controls) so the FEEL is
  // present today — submit is disabled by `comingSoon`.
  const onProcess = async (): Promise<ComposeResult> => {
    throw new Error("Coming soon");
  };

  return (
    <ComposeShell
      tool={tool}
      accept="image/jpeg,image/png"
      maxBytes={15 * 1024 * 1024}
      multiple
      dropLabel="Drop the Aadhaar front, then the back"
      dropSublabel="JPG or PNG, up to 15 MB each"
      minItems={2}
      maxItems={2}
      submitLabel="Build A4 collage"
      outputType="application/pdf"
      outputFilename="bharattools-aadhaar-collage.pdf"
      renderResultPreview={(url) => (
        <iframe
          title="Aadhaar collage preview"
          src={url}
          className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
        />
      )}
      onProcess={onProcess}
      comingSoon
    />
  );
}
