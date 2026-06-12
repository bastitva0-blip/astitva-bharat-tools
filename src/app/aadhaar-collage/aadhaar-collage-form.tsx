"use client";

import { useState } from "react";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import {
  ComposeShell,
  type ComposeItem,
  type ComposeResult,
} from "@/components/tool-shells";
import {
  buildAadhaarCollage,
  type CollageLayout,
  type CollagePageSize,
  type CollageRotation,
} from "@/lib/processing/aadhaar-collage";
import { getToolBySlug } from "@/lib/tools";

export function AadhaarCollageForm() {
  const tool = getToolBySlug("aadhaar-collage");
  if (!tool) throw new Error("aadhaar-collage tool missing from registry");

  const [pageSize, setPageSize] = useState<CollagePageSize>("a4");
  const [layout, setLayout] = useState<CollageLayout>("vertical");

  const onProcess = async (items: ComposeItem[]): Promise<ComposeResult> => {
    if (items.length !== 2) {
      throw new Error("Add the front and back of the Aadhaar card.");
    }
    const bytes = await buildAadhaarCollage({
      items: [
        { blob: items[0].file, rotation: items[0].rotation as CollageRotation },
        { blob: items[1].file, rotation: items[1].rotation as CollageRotation },
      ],
      pageSize,
      layout,
    });
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    return { blob, bytes: blob.size };
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
      submitLabel={layout === "horizontal" ? "Build side-by-side collage" : "Build A4 collage"}
      outputType="application/pdf"
      outputFilename="bharattools-aadhaar-collage.pdf"
      enableRotation
      configSlot={
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="block">Page size</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "a4", text: "A4" },
                { id: "letter", text: "Letter" },
              ]}
              selectedId={pageSize}
              onSelect={(id) => setPageSize(id as CollagePageSize)}
            />
          </div>
          <div className="space-y-2">
            <Label className="block">Layout</Label>
            <SegmentedControl
              size="md"
              variant="default"
              options={[
                { id: "vertical", text: "Stacked" },
                { id: "horizontal", text: "Side by side" },
              ]}
              selectedId={layout}
              onSelect={(id) => setLayout(id as CollageLayout)}
            />
          </div>
        </div>
      }
      renderResultPreview={(url) => (
        <iframe
          title="Aadhaar collage preview"
          src={url}
          className="h-[60vh] w-full rounded-md border border-surface-fg bg-surface-2"
        />
      )}
      onProcess={onProcess}
    />
  );
}
