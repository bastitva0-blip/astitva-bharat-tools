"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileIcon } from "lucide-react";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { FileUpload } from "@devalok/shilp-sutra/ui/file-upload";
import { Progress } from "@devalok/shilp-sutra/ui/progress";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { CHUNK_BYTES, MAX_FILE_BYTES } from "@/lib/p2p/constants";
import { Peer } from "@/lib/p2p/peer";
import { encodeControl, newFileId, packChunk } from "@/lib/p2p/protocol";
import { connect, joinRoom, type SignalingClient } from "@/lib/p2p/signaling";

type Phase = "connecting" | "ready" | "error" | "ended";

interface OutgoingFile {
  fileId: string;
  name: string;
  size: number;
  mime: string;
  bytesSent: number;
  done: boolean;
}

export function QuickSendSender({ roomId }: { roomId: string }) {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [outgoing, setOutgoing] = useState<OutgoingFile[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const sendingRef = useRef(false);
  const queueRef = useRef<File[]>([]);

  useEffect(() => {
    let signaling: SignalingClient | null = null;
    let peer: Peer | null = null;
    let cancelled = false;

    const teardown = () => {
      if (peer) peer.close();
      if (signaling) signaling.close();
      peer = null;
      signaling = null;
    };

    (async () => {
      try {
        signaling = connect();
        await joinRoom(signaling, roomId);
        if (cancelled) return;

        let channelOpen = false;

        peer = new Peer(signaling.socket, "sender");
        peerRef.current = peer;
        peer.on("open", () => {
          channelOpen = true;
          setPhase("ready");
        });
        peer.on("close", () => {
          setPhase((p) => (p === "ended" ? p : "ended"));
        });
        peer.on("error", (e) => toast.error(e.message));

        // Once the WebRTC channel is open, signaling is no longer required —
        // ignore peer-left / disconnect that fire because the OS file picker
        // briefly stalled this tab. The actual peer state lives in peer.close.
        signaling.socket.on("peer-left", () => {
          if (channelOpen) return;
          setPhase("ended");
          peer?.close();
        });
        signaling.socket.on("disconnect", () => {
          if (channelOpen) return;
          setPhase((p) => (p === "ended" ? p : "ended"));
        });

        await peer.start();
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message === "not-found"
              ? "Session expired or wrong link. Ask the print shop to refresh and rescan."
              : err.message === "full"
                ? "Another customer is already connected to this session."
                : err.message
            : "Could not connect.";
        setErrorMsg(msg);
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [roomId]);

  const accept = (files: File[]) => {
    const valid: File[] = [];
    for (const f of files) {
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`${f.name} is over ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB. Skipped.`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;
    queueRef.current.push(...valid);
    void pump();
  };

  const pump = async () => {
    if (sendingRef.current) return;
    const peer = peerRef.current;
    if (!peer) return;
    sendingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const file = queueRef.current.shift()!;
        await sendOne(peer, file);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed.");
    } finally {
      sendingRef.current = false;
    }
  };

  const sendOne = async (peer: Peer, file: File) => {
    const fileId = newFileId();
    const meta = {
      fileId,
      name: file.name,
      mime: file.type || "application/octet-stream",
      size: file.size,
    };
    setOutgoing((cur) => [
      ...cur,
      { fileId, name: meta.name, size: meta.size, mime: meta.mime, bytesSent: 0, done: false },
    ]);
    peer.sendControl(encodeControl({ kind: "file-meta", meta }));

    let seq = 0;
    let offset = 0;
    while (offset < file.size) {
      if (peer.shouldThrottle()) await peer.drain();
      const end = Math.min(offset + CHUNK_BYTES, file.size);
      const slice = file.slice(offset, end);
      const buf = await slice.arrayBuffer();
      peer.sendBinary(packChunk(fileId, seq, new Uint8Array(buf)));
      seq += 1;
      offset = end;
      const sent = offset;
      setOutgoing((cur) =>
        cur.map((o) => (o.fileId === fileId ? { ...o, bytesSent: sent } : o)),
      );
    }
    peer.sendControl(encodeControl({ kind: "file-end", fileId }));
    setOutgoing((cur) =>
      cur.map((o) => (o.fileId === fileId ? { ...o, done: true } : o)),
    );
  };

  return (
    <div className="space-y-4">
      <Card variant="outline">
        <CardContent className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Badge
              color={
                phase === "ready"
                  ? "success"
                  : phase === "error" || phase === "ended"
                    ? "error"
                    : "accent"
              }
            >
              {phase === "connecting"
                ? "Connecting…"
                : phase === "ready"
                  ? "Connected"
                  : phase === "ended"
                    ? "Disconnected"
                    : "Error"}
            </Badge>
          </div>

          {phase === "error" && (
            <p className="text-body-sm text-error-11">{errorMsg}</p>
          )}

          {phase === "ready" && (
            <FileUpload
              multiple
              maxSize={MAX_FILE_BYTES}
              onFiles={accept}
              label="Tap to pick files"
              sublabel={`Anything up to ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB each.`}
            />
          )}

          {phase === "ended" && (
            <p className="text-body-sm text-surface-fg-muted">
              The print shop closed the session. Ask them to open Quick Send again.
            </p>
          )}
        </CardContent>
      </Card>

      {outgoing.length > 0 && (
        <Card variant="outline">
          <CardContent className="py-4">
            <ul className="space-y-3">
              {outgoing.map((o) => {
                const pct =
                  o.size === 0 ? 100 : Math.min(100, Math.round((o.bytesSent / o.size) * 100));
                return (
                  <li key={o.fileId}>
                    <div className="flex items-center gap-3">
                      <FileIcon size={16} className="shrink-0 text-surface-fg-muted" />
                      <div className="min-w-0 flex-1 truncate text-body-sm">{o.name}</div>
                      {o.done && <Check size={16} className="text-success-11" />}
                    </div>
                    <div className="mt-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
