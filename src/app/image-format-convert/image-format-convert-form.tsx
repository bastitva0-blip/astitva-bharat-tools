"use client";

import { ConvertShell, type ConvertResult, type ConvertTargetOption } from "@/components/tool-shells";
import { convertImageFormat } from "@/lib/processing/format-convert";
import { getToolBySlug } from "@/lib/tools";

const TARGETS: ConvertTargetOption[] = [
  { id: "jpg", label: "JPG", sub: "Best for portals — no transparency", mime: "image/jpeg", ext: "jpg" },
  { id: "png", label: "PNG", sub: "Lossless, keeps transparency", mime: "image/png", ext: "png" },
  { id: "webp", label: "WebP", sub: "Smaller file size, modern browsers", mime: "image/webp", ext: "webp" },
];

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function ImageFormatConvertForm() {
  const tool = getToolBySlug("image-format-convert");
  if (!tool) throw new Error("image-format-convert tool missing from registry");

  const onProcess = async (file: File, target: ConvertTargetOption): Promise<ConvertResult> => {
    const r = await convertImageFormat(file, {
      mime: target.mime as "image/jpeg" | "image/png" | "image/webp",
    });
    return { blob: r.blob, bytes: r.bytes };
  };

  return (
    <ConvertShell
      tool={tool}
      accept="image/*"
      maxBytes={25 * 1024 * 1024}
      dropLabel="Drop an image"
      dropSublabel="JPG, PNG, WebP or HEIC, up to 25 MB"
      targets={TARGETS}
      defaultTargetId="jpg"
      onProcess={onProcess}
      outputFilename={(source, target) => `${baseName(source.name)}.${target.ext}`}
      renderSourcePreview={(file, url) => (
        // eslint-disable-next-line @next/next/no-img-element -- blob: URL
        <img src={url} alt={file.name} className="block max-h-[200px] w-auto rounded border border-surface-border-subtle" />
      )}
      renderResultPreview={(url, target) => (
        <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL */}
          <img src={url} alt={`Converted ${target.label}`} className="mx-auto block max-h-[60vh] w-auto" />
        </div>
      )}
    />
  );
}
