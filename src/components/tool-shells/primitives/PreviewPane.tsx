"use client";

import type { ReactNode } from "react";
import { formatKb } from "@/lib/processing/image";

interface PreviewMetadata {
  dimensions?: string;
  bytes?: number;
  format?: string;
}

interface PreviewPaneProps {
  children: ReactNode | null;
  metadata?: PreviewMetadata;
  emptyState?: string;
  variant?: "default" | "muted";
  className?: string;
}

// Standardised result container used by every tool shell
// (base-infrastructure-plan §3). Pure presentation — shells decide what to put
// inside (an img, a before/after slider, PDF page thumbs, etc.) and pass any
// metadata they want printed in the strip.
export function PreviewPane({
  children,
  metadata,
  emptyState,
  variant = "default",
  className,
}: PreviewPaneProps) {
  const surface =
    variant === "muted"
      ? "bg-surface-1 border-surface-border-subtle"
      : "bg-surface-2 border-surface-fg";

  const baseClass = `rounded-md border p-4 ${surface}${className ? ` ${className}` : ""}`;

  if (!children) {
    return (
      <div
        className={`flex min-h-[240px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted${className ? ` ${className}` : ""}`}
      >
        {emptyState ?? ""}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={baseClass}>{children}</div>
      {metadata && hasAny(metadata) && (
        <div className="text-body-sm text-surface-fg-muted">
          {formatMetadata(metadata)}
        </div>
      )}
    </div>
  );
}

function hasAny(m: PreviewMetadata): boolean {
  return Boolean(m.dimensions || m.format || typeof m.bytes === "number");
}

function formatMetadata(m: PreviewMetadata): string {
  const parts: string[] = [];
  if (m.dimensions) parts.push(m.dimensions);
  if (typeof m.bytes === "number") parts.push(formatKb(m.bytes));
  if (m.format) parts.push(m.format.toUpperCase());
  return parts.join(" · ");
}
