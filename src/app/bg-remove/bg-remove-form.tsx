"use client";

import { useState } from "react";
import { EnhanceShell, type EnhanceResult } from "@/components/tool-shells";
import { removeBg } from "@/lib/processing/bg-remove";
import { getToolBySlug } from "@/lib/tools";

const BG_OPTIONS = [
  { label: "Transparent (PNG)", value: null },
  { label: "White", value: "#ffffff" },
  { label: "Light grey", value: "#f2f2f2" },
  { label: "Light blue", value: "#e8f4fd" },
];

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function BgRemoveForm() {
  const tool = getToolBySlug("bg-remove");
  if (!tool) throw new Error("bg-remove tool not in registry");

  const [bgColor, setBgColor] = useState<string | null>(null);

  const onProcess = async (file: File): Promise<EnhanceResult> => {
    const r = await removeBg(file, { bgColor });
    return { blob: r.blob, bytes: r.bytes };
  };

  const outputFilename = (source: File) => {
    const base = baseName(source.name);
    return bgColor ? `${base}-nobg.jpg` : `${base}-nobg.png`;
  };

  const configSlot = (
    <div className="flex flex-wrap gap-2">
      {BG_OPTIONS.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => setBgColor(opt.value)}
          className={`rounded-full border px-3 py-1 text-body-xs font-medium transition-colors ${
            bgColor === opt.value
              ? "border-[var(--bt-saffron-ink)] bg-[var(--bt-saffron-ink)] text-white"
              : "border-surface-border-subtle bg-surface-1 text-surface-fg hover:border-[var(--bt-saffron-ink)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <EnhanceShell
      tool={tool}
      accept="image/*"
      maxBytes={20 * 1024 * 1024}
      dropLabel="Drop a photo to remove its background"
      dropSublabel="JPG, PNG, WebP or HEIC up to 20 MB"
      resultTitle="Background removed"
      outputType={bgColor ? "image/jpeg" : "image/png"}
      onProcess={onProcess}
      outputFilename={outputFilename}
      configSlot={configSlot}
    />
  );
}
