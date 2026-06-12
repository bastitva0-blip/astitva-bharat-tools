"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { CHUNK_BYTES, MAX_FILE_BYTES } from "@/lib/p2p/constants";
import { Peer, type PeerRole } from "@/lib/p2p/peer";
import {
  decodeControl,
  encodeControl,
  type FileMeta,
  newFileId,
  packChunk,
  unpackChunk,
} from "@/lib/p2p/protocol";
import {
  connect,
  createRoom,
  joinRoom,
  type SignalingClient,
} from "@/lib/p2p/signaling";

export type SessionPhase = "connecting" | "waiting" | "paired" | "error" | "ended";

export interface IncomingFile {
  meta: FileMeta;
  bytesReceived: number;
  /** Buffered chunks (cleared once the blob is assembled). */
  chunks: Uint8Array[];
  /** Set once "file-end" arrives — file ready to download. */
  blob?: Blob;
}

export interface OutgoingFile {
  fileId: string;
  name: string;
  size: number;
  mime: string;
  bytesSent: number;
  done: boolean;
}

interface UseQuickSendSessionOptions {
  mode: "host" | "guest";
  /** Required when mode === "guest". */
  roomId?: string;
}

interface UseQuickSendSessionResult {
  phase: SessionPhase;
  /** Room ID — created by the host, supplied by the guest. */
  roomId: string | null;
  /** Files we are sending (each call to sendFiles enqueues here). */
  outgoing: OutgoingFile[];
  /** Files arriving from the paired device. */
  incoming: IncomingFile[];
  /** Error message when phase === "error". */
  errorMsg: string | null;
  /** Enqueue files for transmission to the paired device. */
  sendFiles: (files: File[]) => void;
  /** Tear down + reload to start over. */
  reset: () => void;
}

// Shared bidirectional Quick Send session. Owns the signaling lifecycle,
// the WebRTC peer, and the file-transfer state in both directions.
//
// "host" mode creates a room and waits for someone to join via QR or URL.
// "guest" mode joins an existing room. Once the data channel is open, both
// sides can drop files into the same session — there's no fixed "sender"
// or "receiver" role at the file layer.
export function useQuickSendSession({
  mode,
  roomId: paramRoomId,
}: UseQuickSendSessionOptions): UseQuickSendSessionResult {
  const [phase, setPhase] = useState<SessionPhase>("connecting");
  const [roomId, setRoomId] = useState<string | null>(
    mode === "guest" ? (paramRoomId ?? null) : null,
  );
  const [incoming, setIncoming] = useState<Record<string, IncomingFile>>({});
  const [outgoing, setOutgoing] = useState<OutgoingFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);
  const sendingRef = useRef(false);
  const queueRef = useRef<File[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let peer: Peer | null = null;
    let signaling: SignalingClient | null = null;
    let channelOpen = false;

    const handleControl = (text: string) => {
      const frame = decodeControl(text);
      if (!frame) return;
      if (frame.kind === "file-meta") {
        setIncoming((cur) => ({
          ...cur,
          [frame.meta.fileId]: {
            meta: frame.meta,
            bytesReceived: 0,
            chunks: [],
          },
        }));
      } else if (frame.kind === "file-end") {
        setIncoming((cur) => {
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
      setIncoming((cur) => {
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

    const attachPeer = (role: PeerRole) => {
      if (!signaling) return;
      // A previous guest may have joined and dropped before WebRTC opened —
      // tear that half-built peer down before standing up a fresh one for the
      // new guest, otherwise stale ICE/SDP handlers stack up on the socket.
      if (peer) {
        peer.close();
        peer = null;
        peerRef.current = null;
      }
      peer = new Peer(signaling.socket, role);
      peerRef.current = peer;
      peer.on("open", () => {
        channelOpen = true;
        setPhase("paired");
      });
      peer.on("close", () => setPhase((p) => (p === "ended" ? p : "ended")));
      peer.on("error", (e) => toast.error(e.message));
      peer.on("control", handleControl);
      peer.on("binary", handleBinary);
    };

    const teardown = () => {
      if (peer) peer.close();
      if (signaling) signaling.close();
      peer = null;
      signaling = null;
      peerRef.current = null;
      signalingRef.current = null;
    };
    cleanupRef.current = teardown;

    (async () => {
      try {
        signaling = connect();
        signalingRef.current = signaling;

        if (mode === "host") {
          const id = await createRoom(signaling);
          if (cancelled) return;
          setRoomId(id);
          setPhase("waiting");

          signaling.socket.on("peer-joined", () => {
            // Host is the SDP answerer — the joining guest issues the offer.
            attachPeer("receiver");
          });
        } else {
          if (!paramRoomId) {
            throw new Error("Missing room ID for guest mode.");
          }
          await joinRoom(signaling, paramRoomId);
          if (cancelled) return;
          // Guest is the SDP offerer.
          attachPeer("sender");
          await peerRef.current?.start();
        }

        // Once the data channel is open, signaling is no longer load-bearing.
        // Ignore signaling-level disconnects after that — WebRTC keeps the
        // peer alive independently. Trust peer.close() for the real signal.
        signaling.socket.on("peer-left", () => {
          if (channelOpen) return;
          // Host case: a guest scanned the QR / typed the code but dropped
          // before WebRTC paired. Backend keeps the room alive, so tear down
          // the half-built peer and slide back to "waiting" — another scan
          // will trigger peer-joined again and re-attach.
          if (mode === "host") {
            if (peer) {
              peer.close();
              peer = null;
              peerRef.current = null;
            }
            setPhase((p) => (p === "ended" ? p : "waiting"));
            return;
          }
          setPhase("ended");
          peer?.close();
        });
        signaling.socket.on("disconnect", () => {
          if (channelOpen) return;
          setPhase((p) => (p === "ended" ? p : "ended"));
        });
      } catch (err) {
        if (cancelled) return;
        const msg = friendlyError(err);
        setErrorMsg(msg);
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [mode, paramRoomId]);

  const pump = useCallback(async () => {
    if (sendingRef.current) return;
    const peer = peerRef.current;
    if (!peer) return;
    sendingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const file = queueRef.current.shift()!;
        await sendOne(peer, file, setOutgoing);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed.");
    } finally {
      sendingRef.current = false;
    }
  }, []);

  const sendFiles = useCallback(
    (files: File[]) => {
      const valid: File[] = [];
      for (const f of files) {
        if (f.size > MAX_FILE_BYTES) {
          toast.error(
            `${f.name} is over ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB. Skipped.`,
          );
          continue;
        }
        valid.push(f);
      }
      if (valid.length === 0) return;
      queueRef.current.push(...valid);
      void pump();
    },
    [pump],
  );

  const reset = useCallback(() => {
    cleanupRef.current?.();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const incomingList = Object.values(incoming);

  return {
    phase,
    roomId,
    outgoing,
    incoming: incomingList,
    errorMsg,
    sendFiles,
    reset,
  };
}

async function sendOne(
  peer: Peer,
  file: File,
  setOutgoing: React.Dispatch<React.SetStateAction<OutgoingFile[]>>,
) {
  const fileId = newFileId();
  const meta: FileMeta = {
    fileId,
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
  };
  setOutgoing((cur) => [
    ...cur,
    {
      fileId,
      name: meta.name,
      size: meta.size,
      mime: meta.mime,
      bytesSent: 0,
      done: false,
    },
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
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "not-found") {
      return "Session expired or wrong code. Ask the other device to start a new session.";
    }
    if (err.message === "full") {
      return "Another device is already paired with this session.";
    }
    return err.message;
  }
  return "Could not connect.";
}
