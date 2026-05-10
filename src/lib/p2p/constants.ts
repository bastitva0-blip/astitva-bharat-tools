export const MAX_FILE_BYTES = 500 * 1024 * 1024;
export const CHUNK_BYTES = 64 * 1024;
export const BUFFERED_AMOUNT_LOW = 256 * 1024;
export const BUFFERED_AMOUNT_HIGH = 1024 * 1024;
export const STUN_URL = "stun:stun.l.google.com:19302";

export const SIGNALING_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

export const PRINTABLE_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
