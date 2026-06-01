"use client";

import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useBlobUrl } from "@/lib/processing/kernel";
import { usePipeline } from "@/lib/pipeline";

// Step C of the pipeline prototype — proves the entry survives two hops
// (A→B→C). Same shape as B; useBlobUrl on each step independently revokes
// its preview URL on unmount, which is the §4.3 checkbox.

export default function PipelineTestC() {
  const { entry, clear } = usePipeline();
  const previewUrl = useBlobUrl(entry?.blob ?? null);

  return (
    <>
      <header>
        <h1 className="text-heading-lg font-semibold">Step C · two hops in</h1>
        <p className="mt-1 text-body-sm text-surface-fg-muted">
          Same entry, no re-upload. Each preview URL is revoked on unmount via
          <code> useBlobUrl</code>.
        </p>
      </header>

      {entry ? (
        <section className="space-y-3 rounded-md border border-surface-border-subtle p-4">
          <div className="text-body-sm">
            <div className="font-medium">{entry.meta.name}</div>
            <div className="text-surface-fg-muted">
              {entry.meta.type || "unknown"} · {entry.blob.size.toLocaleString()} bytes
              {entry.meta.dims ? ` · ${entry.meta.dims.w}×${entry.meta.dims.h}` : ""}
            </div>
            <div className="text-surface-fg-muted">
              from <code>{entry.fromTool}</code> at {new Date(entry.createdAt).toLocaleTimeString()}
            </div>
          </div>
          {previewUrl && entry.meta.type.startsWith("image/") && (
            <img
              src={previewUrl}
              alt="Pipeline preview"
              className="max-h-64 w-auto rounded border border-surface-border-subtle"
            />
          )}
          <div className="flex gap-2">
            <Button asChild variant="soft">
              <Link href="/pipeline-test/b">← Step B</Link>
            </Button>
            <Button asChild variant="soft">
              <Link href="/pipeline-test/a">↩ Step A</Link>
            </Button>
            <Button variant="ghost" onClick={clear}>
              Clear
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-md border border-dashed border-surface-border-subtle p-6 text-body-sm text-surface-fg-muted">
          No entry. <Link href="/pipeline-test/a" className="underline">Start at A</Link>.
        </section>
      )}
    </>
  );
}
