"use client";

import Link from "next/link";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useBlobUrl } from "@/lib/processing/kernel";
import { usePipeline } from "@/lib/pipeline";

// Step A of the pipeline prototype (engineering-decisions #2).
// Upload a file → write to pipelineStore → soft-nav to B to confirm the
// module-scope singleton survives.

export default function PipelineTestA() {
  const { entry, set, clear } = usePipeline();
  const previewUrl = useBlobUrl(entry?.blob ?? null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    let dims: { w: number; h: number } | undefined;
    const finalize = () =>
      set({
        blob: file,
        meta: { name: file.name, type: file.type, dims },
        fromTool: "pipeline-test-a",
        createdAt: Date.now(),
      });
    if (!isImage) {
      finalize();
      return;
    }
    const img = new Image();
    img.onload = () => {
      dims = { w: img.naturalWidth, h: img.naturalHeight };
      URL.revokeObjectURL(img.src);
      finalize();
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      finalize();
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <>
      <header>
        <h1 className="text-heading-lg font-semibold">Step A · upload</h1>
        <p className="mt-1 text-body-sm text-surface-fg-muted">
          Drop a file. We write it to the pipeline singleton and navigate to step B.
        </p>
      </header>

      <input
        type="file"
        onChange={onFile}
        className="block w-full rounded-md border border-surface-border-subtle p-3 text-body-sm"
      />

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
              <Link href="/pipeline-test/b">→ Step B (soft nav)</Link>
            </Button>
            <Button asChild variant="soft">
              <a href="/pipeline-test/b">→ Step B (hard nav — tests IDB rehydration)</a>
            </Button>
            <Button variant="ghost" onClick={clear}>
              Clear
            </Button>
          </div>
        </section>
      ) : (
        <p className="text-body-sm text-surface-fg-muted">No entry yet.</p>
      )}
    </>
  );
}
