export interface FileMeta {
  fileId: string;
  name: string;
  mime: string;
  size: number;
}

export type ControlFrame =
  | { kind: "file-meta"; meta: FileMeta }
  | { kind: "file-end"; fileId: string };

const HEADER_BYTES = 4 + 16 + 4;

export function encodeControl(frame: ControlFrame): string {
  return JSON.stringify(frame);
}

export function decodeControl(text: string): ControlFrame | null {
  try {
    const parsed = JSON.parse(text) as ControlFrame;
    if (parsed && (parsed.kind === "file-meta" || parsed.kind === "file-end")) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Pack a binary chunk: [4-byte magic 'CHNK'][16-byte ASCII fileId][4-byte seq BE][bytes...]
 */
export function packChunk(
  fileId: string,
  seq: number,
  bytes: Uint8Array,
): ArrayBuffer {
  if (fileId.length !== 16) throw new Error("fileId must be 16 chars");
  const out = new Uint8Array(HEADER_BYTES + bytes.byteLength);
  const view = new DataView(out.buffer);
  view.setUint8(0, 0x43);
  view.setUint8(1, 0x48);
  view.setUint8(2, 0x4e);
  view.setUint8(3, 0x4b);
  for (let i = 0; i < 16; i++) out[4 + i] = fileId.charCodeAt(i);
  view.setUint32(20, seq, false);
  out.set(bytes, HEADER_BYTES);
  return out.buffer;
}

export function unpackChunk(
  buf: ArrayBuffer,
): { fileId: string; seq: number; bytes: Uint8Array } | null {
  if (buf.byteLength < HEADER_BYTES) return null;
  const view = new DataView(buf);
  if (
    view.getUint8(0) !== 0x43 ||
    view.getUint8(1) !== 0x48 ||
    view.getUint8(2) !== 0x4e ||
    view.getUint8(3) !== 0x4b
  ) {
    return null;
  }
  const idBytes = new Uint8Array(buf, 4, 16);
  let fileId = "";
  for (let i = 0; i < 16; i++) fileId += String.fromCharCode(idBytes[i]);
  const seq = view.getUint32(20, false);
  const bytes = new Uint8Array(buf, HEADER_BYTES);
  return { fileId, seq, bytes };
}

export function newFileId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += arr[i].toString(16).padStart(2, "0");
  }
  return out;
}
