import { io, Socket } from "socket.io-client";
import { SIGNALING_URL } from "./constants";

export interface SignalingClient {
  socket: Socket;
  close: () => void;
}

export function connect(): SignalingClient {
  const socket = io(`${SIGNALING_URL}/p2p`, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: false,
  });
  return {
    socket,
    close: () => {
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
}

export function createRoom(client: SignalingClient): Promise<string> {
  return new Promise((resolve, reject) => {
    const onConnectError = (err: Error) => reject(err);
    client.socket.once("connect_error", onConnectError);
    const finish = () => {
      client.socket.off("connect_error", onConnectError);
    };
    const send = () => {
      client.socket.emit("create-room", null, (res: { roomId: string }) => {
        finish();
        resolve(res.roomId);
      });
    };
    if (client.socket.connected) send();
    else client.socket.once("connect", send);
  });
}

export function joinRoom(
  client: SignalingClient,
  roomId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const onConnectError = (err: Error) => reject(err);
    client.socket.once("connect_error", onConnectError);
    const send = () => {
      client.socket.emit(
        "join-room",
        { roomId },
        (res: { ok: boolean; reason?: string }) => {
          client.socket.off("connect_error", onConnectError);
          if (res?.ok) resolve();
          else reject(new Error(res?.reason ?? "join-failed"));
        },
      );
    };
    if (client.socket.connected) send();
    else client.socket.once("connect", send);
  });
}
