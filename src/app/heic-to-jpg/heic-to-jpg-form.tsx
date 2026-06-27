"use client";

import { ConvertShell, type ConvertResult, type ConvertTargetOption } from "@/components/tool-shells";
import { convertHeicToJpg } from "@/lib/processing/heic-to-jpg";
import { getToolBySlug } from "@/lib/tools";

const TARGETS: ConvertTargetOption[] = [
  { id: "jpg", label: "JPG", sub: "Portal-ready", mime: "image/jpeg", ext: "jpg" },
];

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function HeicToJpgForm() {
  const tool = getToolBySlug("heic-to-jpg");
  if (!tool) throw new Error("heic-to-jpg tool missing from registry");

  const onProcess = async (file: File): Promise<ConvertResult> => {
    const r = await convertHeicToJpg(file);
    return { blob: r.blob, bytes: r.bytes };
  };

  return (
    <ConvertShell
      tool={tool}
      accept=".heic,.heif,image/heic,image/heif"
      maxBytes={50 * 1024 * 1024}
      dropLabel="Drop a HEIC photo"
      dropSublabel="iPhone or Mac Photos export, up to 50 MB"
      targets={TARGETS}
      defaultTargetId="jpg"
      onProcess={onProcess}
      outputFilename={(source) => `${baseName(source.name)}.jpg`}
      renderResultPreview={(url) => (
        <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
          <img
            src={url}
            alt="Converted JPG"
            className="mx-auto block max-h-[60vh] max-w-full w-auto"
          />
        </div>
      )}
    />
  );
}
