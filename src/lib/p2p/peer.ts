import type { Socket } from "socket.io-client";
import { BUFFERED_AMOUNT_HIGH, BUFFERED_AMOUNT_LOW, STUN_URL } from "./constants";

/**
 * WebRTC offerer / answerer designation for SDP negotiation.
 *
 * "sender" creates the DataChannel and issues the SDP offer; "receiver"
 * waits for `ondatachannel` and answers. The names are historical — they
 * refer to **who starts the negotiation**, NOT to file-transfer direction.
 * Once the channel is open, files can flow in either direction.
 */
export type PeerRole = "receiver" | "sender";

export interface PeerEvents {
  open: () => void;
  control: (text: string) => void;
  binary: (buf: ArrayBuffer) => void;
  close: () => void;
  error: (err: Error) => void;
}

const ICE_DISCONNECT_GRACE_MS = 30000;

export class Peer {
  private readonly pc: RTCPeerConnection;
  private channel: RTCDataChannel | null = null;
  private readonly listeners: { [K in keyof PeerEvents]?: PeerEvents[K] } = {};
  private opened = false;
  private closed = false;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly socket: Socket,
    private readonly role: PeerRole,
  ) {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: STUN_URL }],
    });

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", { data: { type: "ice", candidate: e.candidate } });
      }
    };
    // ICE state semantics:
    // - "failed" / "closed": terminal, tear down immediately.
    // - "disconnected": transient. Mobile browsers freeze the JS loop while
    //   the OS file picker is open, which stops ICE consent pings and flips
    //   the state to disconnected within ~15-30 s. It usually recovers on
    //   its own when the tab resumes. Give it a grace window before declaring
    //   the peer dead.
    this.pc.oniceconnectionstatechange = () => {
      const s = this.pc.iceConnectionState;
      if (s === "failed" || s === "closed") {
        this.clearDisconnectTimer();
        this.fireClose();
      } else if (s === "disconnected") {
        if (this.disconnectTimer) return;
        this.disconnectTimer = setTimeout(() => {
          this.disconnectTimer = null;
          if (this.pc.iceConnectionState === "disconnected") {
            this.fireClose();
          }
        }, ICE_DISCONNECT_GRACE_MS);
      } else {
        this.clearDisconnectTimer();
      }
    };

    if (role === "sender") {
      this.attachChannel(
        this.pc.createDataChannel("bharattools-files", { ordered: true }),
      );
    } else {
      this.pc.ondatachannel = (e) => this.attachChannel(e.channel);
    }

    socket.on("signal", (msg: { data: { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit } }) => {
      void this.onSignal(msg.data);
    });
  }

  on<K extends keyof PeerEvents>(event: K, handler: PeerEvents[K]) {
    this.listeners[event] = handler;
  }

  async start() {
    if (this.role !== "sender") return;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.socket.emit("signal", { data: { type: "sdp", sdp: offer } });
  }

  sendControl(text: string) {
    this.channel?.send(text);
  }

  sendBinary(buf: ArrayBuffer) {
    this.channel?.send(buf);
  }

  /** Resolve when the channel's bufferedAmount drops below the low watermark. */
  drain(): Promise<void> {
    const ch = this.channel;
    if (!ch) return Promise.resolve();
    if (ch.bufferedAmount < BUFFERED_AMOUNT_LOW) return Promise.resolve();
    return new Promise((resolve) => {
      const handler = () => {
        ch.removeEventListener("bufferedamountlow", handler);
        resolve();
      };
      ch.addEventListener("bufferedamountlow", handler);
    });
  }

  shouldThrottle(): boolean {
    return (this.channel?.bufferedAmount ?? 0) > BUFFERED_AMOUNT_HIGH;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.clearDisconnectTimer();
    try {
      this.channel?.close();
    } catch {
      // ignore
    }
    try {
      this.pc.close();
    } catch {
      // ignore
    }
    this.fireClose();
  }

  private clearDisconnectTimer() {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
  }

  private attachChannel(channel: RTCDataChannel) {
    this.channel = channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = BUFFERED_AMOUNT_LOW;
    channel.onopen = () => {
      if (this.opened) return;
      this.opened = true;
      this.listeners.open?.();
    };
    channel.onclose = () => this.fireClose();
    channel.onerror = (e) => {
      const err = (e as RTCErrorEvent).error;
      this.listeners.error?.(err ?? new Error("datachannel error"));
    };
    channel.onmessage = (e) => {
      if (typeof e.data === "string") {
        this.listeners.control?.(e.data);
      } else if (e.data instanceof ArrayBuffer) {
        this.listeners.binary?.(e.data);
      } else if (e.data instanceof Blob) {
        void e.data.arrayBuffer().then((buf) => this.listeners.binary?.(buf));
      }
    };
  }

  private async onSignal(data: {
    type: string;
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  }) {
    if (data.type === "sdp" && data.sdp) {
      await this.pc.setRemoteDescription(data.sdp);
      if (data.sdp.type === "offer") {
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        this.socket.emit("signal", { data: { type: "sdp", sdp: answer } });
      }
    } else if (data.type === "ice" && data.candidate) {
      try {
        await this.pc.addIceCandidate(data.candidate);
      } catch {
        // ignore late ICE
      }
    }
  }

  private fireClose() {
    if (!this.listeners.close) return;
    const fn = this.listeners.close;
    this.listeners.close = undefined;
    fn();
  }
}
