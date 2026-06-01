// Shared types for the segmentation layer (copy-spec §5,
// base-infrastructure-plan §6.2).

import type { DeviceClass } from "@/lib/analytics/buckets";

export type Segment =
  | "operator"
  | "professional"
  | "individual-paying"
  | "aspirant"
  | "unknown";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer_host: string | null;
  landing_path: string;
  first_seen_at: string; // ISO
}

export interface SignalHistoryEntry {
  filesProcessed: number;
  sessions: number;
  businessHoursSessions: number;
  toolsUsed: string[];
}

export interface SignalState {
  // Current session
  sessionStartedAt: number; // epoch ms; 0 = no active session
  lastEventAt: number;      // epoch ms
  sessionFilesProcessed: number;

  // Rolling history keyed by YYYY-MM-DD (UTC). GC'd on read past 30 days.
  history: Record<string, SignalHistoryEntry>;

  device_class: DeviceClass;
}

export interface ResolvedSignals {
  files_processed_session: number;
  files_processed_30d: number;
  session_count_7d: number;
  days_active_30d: number;
  business_hours_session_pct: number;
  tools_used_30d: string[];
  device_class: DeviceClass;
}

export interface SegmentResolution {
  primary: Segment;
  confidence: number;       // 0–1: gap between top score and runner-up
  signals_used: string[];   // human-readable, for analytics + debugging
}

export const ATTRIBUTION_KEY = "bt_attribution";
export const SIGNALS_KEY = "bt_signals";

// Session boundary: 30 min idle starts a new session.
export const SESSION_IDLE_MS = 30 * 60 * 1000;
