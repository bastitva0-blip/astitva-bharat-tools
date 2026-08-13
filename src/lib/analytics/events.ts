// Typed analytics event bus (base-infrastructure-plan §6.1).
//
// Every event is declared in EventMap with a fixed payload shape. Tools call
// `fire("process_complete", { tool_id, ... })` — never a sink directly.
// Because payloads are typed, fields like `email`/`phone`/`name`
// are structurally rejected at compile time (they aren't in any payload
// type, so the type system refuses them).
//
// Sink behavior:
//   prod  — Sankhya (cookieless, self-hosted) via registerSink() in
//           initSankhya() — see ./sankhya.ts. The base sink is a no-op; all
//           real sending happens through the registered extra sink(s).
//   dev   — console.info, no network
//   test  — also captured in a ring buffer (testSinkEvents) for assertions
//
// Bucketed values (size, duration) are exported separately in ./buckets so
// callers can't accidentally send raw bytes/ms.

import type { DurationBucket, SizeBucket } from "./buckets";

type ToolSlug = string;
type Locale = string;

// Mirrors PaywallTrigger / PitchTier from src/lib/segment/paywall.ts (kept in
// sync so PaywallPitch can fire upsell_* with the resolver's own values).
type UpsellTrigger = "tool-open" | "batch-initiated" | "high-cost-feature" | "post-download";
type UpsellTier = "29" | "499" | "1999";

type RejectReason = "too_large" | "wrong_type" | "decode_failed" | "too_many";

type Segment = "operator" | "professional" | "individual-paying" | "aspirant" | "unknown";

type SearchSurface = "home" | "nav" | "palette" | "tools_index";

export interface EventMap {
  // --- Tool lifecycle (tool-design-spec §2.16) ----------------------------
  tool_open: { tool_id: ToolSlug; locale: Locale };
  file_added: {
    tool_id: ToolSlug;
    file_count: number;
    file_size_bucket: SizeBucket;
    file_type?: string;
  };
  process_start: { tool_id: ToolSlug; preset?: string };
  process_complete: {
    tool_id: ToolSlug;
    duration_bucket: DurationBucket;
    input_size_bucket: SizeBucket;
    output_size_bucket: SizeBucket;
  };
  process_error: { tool_id: ToolSlug; error_type: string };
  download_click: { tool_id: ToolSlug; output_type: string };
  whatsapp_share: { tool_id: ToolSlug };
  preset_selected: { tool_id: ToolSlug; preset_id: string };
  cross_tool_click: { from_tool: ToolSlug; to_tool: ToolSlug };
  batch_initiated: { tool_id: ToolSlug; file_count: number };

  // --- Paywall + segment (copy-spec §5) -----------------------------------
  upsell_shown: { tool_id: ToolSlug; trigger: UpsellTrigger };
  upsell_clicked: { tool_id: ToolSlug; tier: UpsellTier };
  upsell_dismissed: { tool_id: ToolSlug };
  segment_resolved: { segment: Segment; confidence: number; signals_used: string[] };
  pitch_variant_shown: { variant: Segment; tool_id: ToolSlug };
  pitch_variant_clicked: { variant: Segment; tier: UpsellTier };

  // --- Search (search-spec §7) --------------------------------------------
  // `query` is user-typed text; the spec accepts this as PII-free in
  // aggregate, used to grow the keyword index. If we ever surface query logs
  // we MUST strip identifiers first.
  search_opened: { surface: SearchSurface };
  search_query: { query_length: number; had_results: boolean };
  search_zero_result: { query: string };
  search_result_click: { query: string; result_slug: ToolSlug; rank: number };
  search_deep_link: { query: string; target: string };

  // --- Reliability + bug-surfacing (Phase A) ------------------------------
  // No filenames / file contents — error_type and scrubbed context only.
  client_error: { route: string; error_type: string; where: string };
  file_rejected: { tool_id: ToolSlug; reason: RejectReason };
  spec_missed: { tool_id: ToolSlug; preset?: string; reason: string };
  process_retry: { tool_id: ToolSlug; after: "error" | "complete" };

  // --- Phase B: heavy-path reliability + engagement ----------------------
  // Background removal (@imgly/background-removal) — heaviest, most fragile
  // on-device path; dynamic import + WASM model download.
  bg_process_start: { tool_id: ToolSlug };
  bg_process_complete: { tool_id: ToolSlug; duration_bucket: DurationBucket };
  bg_process_error: { tool_id: ToolSlug; error_type: string };
  // Dynamic import() of a heavy lib failed (chunk/network/WASM). Static
  // imports surface as process_error instead.
  library_load_error: { lib: string };
  // User saw the "this downloads a ~50 MB model" confirm and backed out.
  bg_download_declined: { tool_id: ToolSlug };
  // External link click — `target` is the destination hostname only.
  outbound_click: { target: string };

  // --- Phase C: quick-send P2P (most network/WebRTC failure surface) ------
  // No filenames; transfer sizes bucketed. error_type is an Error name or a
  // signaling code (not-found/full), never user data.
  qs_session_created: { role: "host" | "guest" };
  qs_peer_connected: Record<string, never>;
  qs_peer_disconnected: { reason: string };
  qs_connection_error: { stage: "signaling" | "datachannel"; error_type: string };
  qs_file_sent: { file_size_bucket: SizeBucket };
  qs_file_received: { file_size_bucket: SizeBucket };
  qs_transfer_error: { error_type: string };
  qs_camera_permission: { state: "granted" | "denied" | "no_camera" | "error" };
}

export type EventName = keyof EventMap;
export type EventPayload<K extends EventName> = EventMap[K];

// --- Sinks ---------------------------------------------------------------

type Sink = <K extends EventName>(name: K, payload: EventPayload<K>) => void;

// Prod base sink: a no-op. Real sending is done by Sankhya, registered as an
// extra sink via initSankhya() (see ./sankhya.ts) — this keeps the beacon code
// out of the server bundle and off the base path.
const noopSink: Sink = () => {};

const consoleSink: Sink = (name, payload) => {
  console.info(`[analytics] ${name}`, payload);
};

const testRingBuffer: { name: EventName; payload: unknown }[] = [];
const testSink: Sink = (name, payload) => {
  testRingBuffer.push({ name, payload });
  if (testRingBuffer.length > 200) testRingBuffer.shift();
};

/** Test-only: read the captured event ring buffer. Never call in app code. */
export function _testEvents(): ReadonlyArray<{ name: EventName; payload: unknown }> {
  return testRingBuffer;
}

/** Test-only: clear the ring buffer between tests. */
export function _testReset(): void {
  testRingBuffer.length = 0;
}

let activeSink: Sink;
if (process.env.NODE_ENV === "test") {
  activeSink = testSink;
} else if (process.env.NODE_ENV === "development") {
  activeSink = consoleSink;
} else {
  activeSink = noopSink;
}

// Additional sinks registered at runtime (client-only). Sankhya registers
// itself here via initSankhya() so its beacon code stays out of the server
// bundle. Each fired event reaches every extra sink.
const extraSinks: Sink[] = [];

/** Register an extra analytics sink (e.g. Sankhya). Client-side, idempotent caller. */
export function registerSink(sink: Sink): void {
  extraSinks.push(sink);
}

// --- Public API ----------------------------------------------------------

const signalSubscribers = new Set<<K extends EventName>(name: K, payload: EventPayload<K>) => void>();

/**
 * Fire a typed analytics event. Routes to the active sink and notifies any
 * subscribers (used by the segment signals collector — see
 * src/lib/segment/signals.ts).
 *
 * @example
 *   fire("process_complete", {
 *     tool_id: "image-compress",
 *     duration_bucket: durationBucket(elapsed),
 *     input_size_bucket: sizeBucket(file.size),
 *     output_size_bucket: sizeBucket(result.bytes),
 *   });
 */
export function fire<K extends EventName>(name: K, payload: EventPayload<K>): void {
  activeSink(name, payload);
  for (const sink of extraSinks) sink(name, payload);
  for (const sub of signalSubscribers) sub(name, payload);
}

/**
 * Subscribe to every fired event. Used by the segment signals collector to
 * tally tools-used / files-processed without each tool wiring it manually.
 *
 * Returns an unsubscribe function. Most call sites should subscribe ONCE at
 * module load.
 */
export function subscribe<K extends EventName>(
  fn: (name: K, payload: EventPayload<K>) => void,
): () => void {
  const wrapped = fn as (name: EventName, payload: unknown) => void;
  signalSubscribers.add(wrapped as never);
  return () => {
    signalSubscribers.delete(wrapped as never);
  };
}
