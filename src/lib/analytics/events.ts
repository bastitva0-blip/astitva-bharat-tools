// Typed analytics event bus (base-infrastructure-plan §6.1).
//
// Every event is declared in EventMap with a fixed payload shape. Tools call
// `fire("process_complete", { tool_id, ... })` — never `umami.track(...)`
// directly. Because payloads are typed, fields like `email`/`phone`/`name`
// are structurally rejected at compile time (they aren't in any payload
// type, so the type system refuses them).
//
// Sink behavior:
//   prod  — forward to window.umami.track (the script in layout.tsx)
//   dev   — console.info, no network
//   test  — also captured in a ring buffer (testSinkEvents) for assertions
//
// Bucketed values (size, duration) are exported separately in ./buckets so
// callers can't accidentally send raw bytes/ms.

import type { DurationBucket, SizeBucket } from "./buckets";

type ToolSlug = string;
type Locale = string;

// Triggers and tiers are open-string for now — narrow once the paywall pitch
// resolver lands and we know the exact set.
type UpsellTrigger = "batch_initiated" | "high_cost_op" | "manual";
type UpsellTier = "29" | "499" | "1999";

type Segment = "operator" | "professional" | "individual-paying" | "aspirant" | "unknown";

type SearchSurface = "home" | "nav" | "palette" | "tools_index";

export interface EventMap {
  // --- Tool lifecycle (tool-design-spec §2.16) ----------------------------
  tool_open: { tool_id: ToolSlug; locale: Locale };
  file_added: { tool_id: ToolSlug; file_count: number; file_size_bucket: SizeBucket };
  process_start: { tool_id: ToolSlug; preset?: string };
  process_complete: {
    tool_id: ToolSlug;
    duration_bucket: DurationBucket;
    input_size_bucket: SizeBucket;
    output_size_bucket: SizeBucket;
  };
  process_error: { tool_id: ToolSlug; error_type: string };
  download_click: { tool_id: ToolSlug; output_type: string };
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
}

export type EventName = keyof EventMap;
export type EventPayload<K extends EventName> = EventMap[K];

// --- Sinks ---------------------------------------------------------------

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}

type Sink = <K extends EventName>(name: K, payload: EventPayload<K>) => void;

const umamiSink: Sink = (name, payload) => {
  if (typeof window === "undefined") return;
  window.umami?.track(name, payload as Record<string, unknown>);
};

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
  activeSink = umamiSink;
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
