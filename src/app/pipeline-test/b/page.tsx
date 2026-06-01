"use client";

import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useBlobUrl } from "@/lib/processing/kernel";
import { usePipeline } from "@/lib/pipeline";

// Step B of the pipeline prototype.
// Reads the entry without re-uploading. If singleton survived soft nav, the
// preview renders immediately on arrival. If we got here via hard nav, the
// PipelineBootstrap in the layout has triggered an IDB rehydrate — the
// preview may flash empty for one frame, then populate.

export default function PipelineTestB() {
  const { entry, clear } = usePipeline();
  const previewUrl = useBlobUrl(entry?.blob ?? null);

  return (
    <>
      <header>
        <h1 className="text-heading-lg font-semibold">Step B · received</h1>
        <p className="mt-1 text-body-sm text-surface-fg-muted">
          Entry pulled from <code>pipelineStore</code> (or rehydrated from IndexedDB).
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
            <Button asChild variant="solid">
              <Link href="/pipeline-test/c">→ Step C</Link>
            </Button>
            <Button asChild variant="soft">
              <Link href="/pipeline-test/a">← Step A</Link>
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
