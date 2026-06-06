"use client";

import { EnhanceShell, type EnhanceResult } from "@/components/tool-shells";
import { convertToGrayscale } from "@/lib/processing/grayscale";
import { getToolBySlug } from "@/lib/tools";

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function PhotoGrayscaleForm() {
  const tool = getToolBySlug("photo-grayscale");
  if (!tool) throw new Error("photo-grayscale tool missing from registry");

  const onProcess = async (file: File): Promise<EnhanceResult> => {
    const r = await convertToGrayscale(file);
    return { blob: r.blob, bytes: r.bytes };
  };

  return (
    <EnhanceShell
      tool={tool}
      accept="image/*"
      maxBytes={25 * 1024 * 1024}
      dropLabel="Drop a colour photo"
      dropSublabel="JPG, PNG or HEIC up to 25 MB"
      resultTitle="Grayscale photo"
      outputType="image/jpeg"
      onProcess={onProcess}
      outputFilename={(source) => `${baseName(source.name)}-bw.jpg`}
    />
  );
}
