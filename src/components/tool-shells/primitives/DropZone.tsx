"use client";

import { Button } from "@devalok/shilp-sutra/ui/button";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { useT } from "@/i18n/provider";
import { formatKb } from "@/lib/processing/image";

interface DropZoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  accept: string;
  maxBytes: number;
  dropLabel: string;
  dropSublabel: string;
  previewUrl?: string | null;
  /** Render a custom thumbnail (e.g. img tag). Falls back to plain metadata
   *  for non-previewable file types. */
  renderPreview?: () => React.ReactNode;
}

// Drop zone + source preview + remove button. One component, three states:
//   1. empty   — shilp FileUpload only
//   2. loaded  — preview tile + filename + size + remove
//   3. (busy state lives on the parent's submit button, not here)
export function DropZone({
  file,
  onFile,
  accept,
  maxBytes,
  dropLabel,
  dropSublabel,
  previewUrl,
  renderPreview,
}: DropZoneProps) {
  const dict = useT();
  return (
    <div className="space-y-4">
      <FileUpload
        accept={accept}
        maxSize={maxBytes}
        onFiles={(files) => onFile(files[0] ?? null)}
        label={dropLabel}
        sublabel={dropSublabel}
      />

      {file && (
        <div className="flex items-start gap-3 rounded-md border border-surface-border-subtle p-3">
          {renderPreview ? (
            <div className="shrink-0">{renderPreview()}</div>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob: URL, next/image doesn't help
            <img
              src={previewUrl}
              alt={dict.shell.dropZone.sourceLabel}
              className="h-20 w-20 shrink-0 rounded object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 text-body-sm">
            <div className="truncate font-medium">{file.name}</div>
            <div className="text-surface-fg-muted">{formatKb(file.size)}</div>
            <Button
              variant="ghost"
              size="compact-sm"
              className="mt-2"
              onClick={() => onFile(null)}
            >
              {dict.common.remove}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
