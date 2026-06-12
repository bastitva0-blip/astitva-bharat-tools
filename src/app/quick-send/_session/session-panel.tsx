"use client";

import { Check, Download, FileIcon, Printer, RefreshCw } from "lucide-react";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Progress } from "@devalok/shilp-sutra/ui/progress";
import { MAX_FILE_BYTES } from "@/lib/p2p/constants";
import { canPrint, downloadBlob, printBlob } from "@/lib/p2p/print";
import type {
  IncomingFile,
  OutgoingFile,
  SessionPhase,
} from "./use-quick-send-session";

interface SessionPanelProps {
  phase: SessionPhase;
  incoming: IncomingFile[];
  outgoing: OutgoingFile[];
  errorMsg: string | null;
  onSendFiles: (files: File[]) => void;
  onReset: () => void;
}

// Shared post-pairing UI used by both the host and the guest. Drag-and-drop
// is symmetric: either side can pick files, and incoming files from the
// paired device appear in the same panel.
export function SessionPanel({
  phase,
  incoming,
  outgoing,
  errorMsg,
  onSendFiles,
  onReset,
}: SessionPanelProps) {
  const ready = phase === "paired";
  const hasIncoming = incoming.length > 0;
  const hasOutgoing = outgoing.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline" className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Send to the paired device</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              color={
                phase === "paired"
                  ? "success"
                  : phase === "error" || phase === "ended"
                    ? "error"
                    : "accent"
              }
            >
              {statusLabel(phase)}
            </Badge>
          </div>

          {phase === "error" && errorMsg && (
            <div className="space-y-3">
              <p className="text-body-sm text-error-11">{errorMsg}</p>
              <Button variant="soft" onClick={onReset}>
                <RefreshCw size={16} /> Try again
              </Button>
            </div>
          )}

          {phase === "ended" && (
            <div className="space-y-3">
              <p className="text-body-sm text-surface-fg-muted">
                The session has ended. Start a new one to share again.
              </p>
              <Button variant="soft" onClick={onReset}>
                <RefreshCw size={16} /> New session
              </Button>
            </div>
          )}

          {ready && (
            <>
              <FileUpload
                multiple
                maxSize={MAX_FILE_BYTES}
                onFiles={onSendFiles}
                label="Tap or drop files to send"
                sublabel={`Anything up to ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB each. Goes straight to the paired device.`}
              />

              {hasOutgoing && (
                <ul className="space-y-3">
                  {outgoing.map((o) => {
                    const pct =
                      o.size === 0
                        ? 100
                        : Math.min(100, Math.round((o.bytesSent / o.size) * 100));
                    return (
                      <li
                        key={o.fileId}
                        className="min-w-0 overflow-hidden rounded-md border border-surface-border-subtle p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileIcon size={16} className="shrink-0 text-surface-fg-muted" />
                          <div className="min-w-0 flex-1 truncate text-body-sm">{o.name}</div>
                          {o.done && <Check size={16} className="shrink-0 text-success-11" />}
                        </div>
                        <div className="mt-2 min-w-0">
                          <Progress
                            value={pct}
                            size="sm"
                            color={o.done ? "success" : "default"}
                            showLabel
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card variant="outline" className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Received files</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasIncoming ? (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              {ready
                ? "Files from the paired device will appear here."
                : "Waiting for the pairing to complete…"}
            </div>
          ) : (
            <ul className="space-y-3">
              {incoming.map((f) => {
                const pct =
                  f.meta.size === 0
                    ? 100
                    : Math.min(
                        100,
                        Math.round((f.bytesReceived / f.meta.size) * 100),
                      );
                const fileReady = !!f.blob;
                return (
                  <li
                    key={f.meta.fileId}
                    className="min-w-0 overflow-hidden rounded-md border border-surface-border-subtle p-3"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap">
                      <FileIcon size={18} className="shrink-0 text-surface-fg-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-body-sm font-medium">
                          {f.meta.name}
                        </div>
                        <div className="truncate text-body-xs text-surface-fg-muted">
                          {formatBytes(f.meta.size)} · {f.meta.mime || "unknown"}
                        </div>
                      </div>
                      {fileReady && (
                        <div className="flex shrink-0 flex-wrap gap-2">
                          {canPrint(f.meta.mime) && (
                            <Button
                              size="sm"
                              variant="solid"
                              onClick={() =>
                                f.blob && printBlob(f.blob, f.meta.mime, f.meta.name)
                              }
                            >
                              <Printer size={14} /> Print
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="soft"
                            onClick={() => f.blob && downloadBlob(f.blob, f.meta.name)}
                          >
                            <Download size={14} /> Download
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 min-w-0">
                      <Progress
                        value={pct}
                        size="sm"
                        color={fileReady ? "success" : "default"}
                        showLabel
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function statusLabel(phase: SessionPhase): string {
  switch (phase) {
    case "connecting":
      return "Connecting…";
    case "waiting":
      return "Waiting for the other device";
    case "paired":
      return "Paired · ready to send both ways";
    case "ended":
      return "Disconnected";
    case "error":
      return "Error";
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
