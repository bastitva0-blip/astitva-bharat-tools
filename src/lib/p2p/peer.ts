import type { Socket } from "socket.io-client";
import { BUFFERED_AMOUNT_HIGH, BUFFERED_AMOUNT_LOW, STUN_URL } from "./constants";

export type PeerRole = "receiver" | "sender";

export interface PeerEvents {
  open: () => void;
  control: (text: string) => void;
  binary: (buf: ArrayBuffer) => void;
  close: () => void;
  error: (err: Error) => void;
}

export class Peer {
  private readonly pc: RTCPeerConnection;
  private channel: RTCDataChannel | null = null;
  private readonly listeners: { [K in keyof PeerEvents]?: PeerEvents[K] } = {};
  private opened = false;
  private closed = false;

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
    this.pc.oniceconnectionstatechange = () => {
      const s = this.pc.iceConnectionState;
      if (s === "failed" || s === "disconnected" || s === "closed") {
        this.fireClose();
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
