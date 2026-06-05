"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileIcon, Printer, RefreshCw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { Progress } from "@devalok/shilp-sutra/ui/progress";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { QrScanButton } from "@/components/qr-scan-button";
import { SITE_URL } from "@/lib/seo/site";
import { Peer } from "@/lib/p2p/peer";
import {
  decodeControl,
  type FileMeta,
  unpackChunk,
} from "@/lib/p2p/protocol";
import { connect, createRoom, type SignalingClient } from "@/lib/p2p/signaling";
import { canPrint, downloadBlob, printBlob } from "@/lib/p2p/print";

type Phase = "connecting" | "waiting" | "paired" | "error" | "ended";

interface ReceivedFile {
  meta: FileMeta;
  bytesReceived: number;
  blob?: Blob;
  chunks: Uint8Array[];
}

export function QuickSendReceiver() {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, ReceivedFile>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let signaling: SignalingClient | null = null;
    let peer: Peer | null = null;
    let cancelled = false;

    const handleControl = (text: string) => {
      const frame = decodeControl(text);
      if (!frame) return;
      if (frame.kind === "file-meta") {
        setFiles((cur) => ({
          ...cur,
          [frame.meta.fileId]: {
            meta: frame.meta,
            bytesReceived: 0,
            chunks: [],
          },
        }));
      } else if (frame.kind === "file-end") {
        setFiles((cur) => {
          const f = cur[frame.fileId];
          if (!f) return cur;
          const blob = new Blob(f.chunks as BlobPart[], { type: f.meta.mime });
          return {
            ...cur,
            [frame.fileId]: { ...f, blob, chunks: [] },
          };
        });
      }
    };

    const handleBinary = (buf: ArrayBuffer) => {
      const unpacked = unpackChunk(buf);
      if (!unpacked) return;
      setFiles((cur) => {
        const f = cur[unpacked.fileId];
        if (!f || f.blob) return cur;
        return {
          ...cur,
          [unpacked.fileId]: {
            ...f,
            bytesReceived: f.bytesReceived + unpacked.bytes.byteLength,
            chunks: [...f.chunks, unpacked.bytes],
          },
        };
      });
    };

    const teardown = () => {
      if (peer) peer.close();
      if (signaling) signaling.close();
      peer = null;
      signaling = null;
    };
    cleanupRef.current = teardown;

    (async () => {
      try {
        signaling = connect();
        const id = await createRoom(signaling);
        if (cancelled) return;
        setRoomId(id);
        setPhase("waiting");

        let channelOpen = false;

        signaling.socket.on("peer-joined", () => {
          if (!signaling) return;
          peer = new Peer(signaling.socket, "receiver");
          peer.on("open", () => {
            channelOpen = true;
            setPhase("paired");
          });
          peer.on("close", () => setPhase((p) => (p === "ended" ? p : "ended")));
          peer.on("error", (e) => toast.error(e.message));
          peer.on("control", handleControl);
          peer.on("binary", handleBinary);
        });

        // Once the data channel is open the signaling socket is no longer
        // load-bearing — WebRTC keeps the peer connection alive on its own.
        // A signaling-level "peer-left" or socket disconnect after that point
        // usually means the customer's tab briefly went inactive while picking
        // a file, not that the actual transfer was lost. Trust peer.close()
        // (driven by RTCPeerConnection state) instead.
        signaling.socket.on("peer-left", () => {
          if (channelOpen) return;
          setPhase("ended");
          if (peer) peer.close();
        });

        signaling.socket.on("disconnect", () => {
          if (channelOpen) return;
          setPhase((p) => (p === "ended" ? p : "ended"));
        });
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "Could not connect.");
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  const reset = () => {
    cleanupRef.current?.();
    location.reload();
  };

  const senderUrl = useMemo(
    () => (roomId ? `${SITE_URL}/quick-send/s/${roomId}` : ""),
    [roomId],
  );

  useEffect(() => () => {
    if (copyResetRef.current) clearTimeout(copyResetRef.current);
  }, []);

  const copySenderUrl = async () => {
    if (!senderUrl) return;
    try {
      await navigator.clipboard.writeText(senderUrl);
      setCopied(true);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy. Long-press the link to copy manually.");
    }
  };

  const fileList = Object.values(files);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>1. Show this QR to the customer</CardTitle>
        </CardHeader>
        <CardContent>
          {phase === "connecting" && (
            <p className="text-body-md text-surface-fg-muted">Connecting…</p>
          )}
          {phase === "error" && (
            <div className="space-y-3">
              <p className="text-body-md text-error-11">{errorMsg}</p>
              <Button onClick={reset} variant="soft">
                <RefreshCw size={16} /> Try again
              </Button>
            </div>
          )}
          {(phase === "waiting" || phase === "paired" || phase === "ended") && roomId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge color={phase === "paired" ? "success" : phase === "ended" ? "neutral" : "accent"}>
                  {phase === "paired"
                    ? "Customer connected"
                    : phase === "ended"
                      ? "Disconnected"
                      : "Waiting for customer"}
                </Badge>
                <span className="text-body-xs text-surface-fg-muted">Room {roomId}</span>
              </div>

              {phase === "waiting" && (
                <>
                  <div className="relative isolate flex justify-center rounded-md border border-surface-border-subtle bg-white p-6">
                    <QRCodeCanvas value={senderUrl} size={224} level="M" includeMargin={false} />
                  </div>
                  <p className="text-body-sm text-surface-fg-muted">
                    Ask the customer to open their phone camera and point it at this QR. Or share this link:
                  </p>
                  <div className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={copySenderUrl}
                      aria-label={copied ? "Link copied" : "Copy link"}
                      className="flex flex-1 items-center gap-2 break-all rounded bg-surface-2 px-2 py-1 text-left text-body-xs hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8"
                    >
                      {copied ? (
                        <Check className="size-3.5 shrink-0 text-success-11" />
                      ) : (
                        <Copy className="size-3.5 shrink-0 text-surface-fg-muted" />
                      )}
                      <code className="min-w-0 flex-1 break-all">{senderUrl}</code>
                    </button>
                    <Button
                      type="button"
                      variant="soft"
                      size="sm"
                      asChild
                      aria-label="Open link in new tab"
                      className="shrink-0"
                    >
                      <a href={senderUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                        <span className="ml-1">Open</span>
                      </a>
                    </Button>
                  </div>
                  <div className="border-t border-surface-border-subtle pt-3">
                    <p className="mb-2 text-body-xs text-surface-fg-muted">
                      Got a QR from another device? Scan it with this device&apos;s camera to send files instead.
                    </p>
                    <QrScanButton label="Scan a QR" />
                  </div>
                </>
              )}

              {phase === "paired" && (
                <p className="text-body-md text-surface-fg">
                  Connected. Waiting for the customer to send files…
                </p>
              )}

              {phase === "ended" && (
                <div className="space-y-3">
                  <p className="text-body-md text-surface-fg-muted">
                    The session has ended. Refresh the page to start a new one.
                  </p>
                  <Button onClick={reset} variant="soft">
                    <RefreshCw size={16} /> New session
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>2. Received files</CardTitle>
        </CardHeader>
        <CardContent>
          {fileList.length === 0 ? (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle text-body-sm text-surface-fg-muted">
              Files will appear here as the customer sends them.
            </div>
          ) : (
            <ul className="space-y-3">
              {fileList.map((f) => {
                const pct =
                  f.meta.size === 0
                    ? 100
                    : Math.min(100, Math.round((f.bytesReceived / f.meta.size) * 100));
                const ready = !!f.blob;
                return (
                  <li
                    key={f.meta.fileId}
                    className="rounded-md border border-surface-border-subtle p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileIcon size={18} className="shrink-0 text-surface-fg-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-body-sm font-medium">{f.meta.name}</div>
                        <div className="text-body-xs text-surface-fg-muted">
                          {formatBytes(f.meta.size)} · {f.meta.mime || "unknown"}
                        </div>
                      </div>
                      {ready && (
                        <div className="flex shrink-0 gap-2">
                          {canPrint(f.meta.mime) && (
                            <Button
                              size="sm"
                              variant="solid"
                              onClick={() => f.blob && printBlob(f.blob, f.meta.mime, f.meta.name)}
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
                    <div className="mt-2">
                      <Progress
                        value={pct}
                        size="sm"
                        color={ready ? "success" : "default"}
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

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
