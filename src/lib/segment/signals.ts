// Continuous signal collector — listens to the analytics bus and tallies the
// signals the scorer reads (copy-spec §5, base-infrastructure-plan §6.2).
//
// Storage shape is rolling: per-day buckets keyed by UTC YYYY-MM-DD, GC'd on
// read past 30 days. This keeps the localStorage payload bounded (~30 small
// objects) regardless of how long a user has been around.
//
// Privacy: per engineering-decisions #12 item 1, signals stay in localStorage
// until the user pays — no server shadow.

import { deviceClass } from "@/lib/analytics/buckets";
import { subscribe } from "@/lib/analytics/events";
import {
  SESSION_IDLE_MS,
  SIGNALS_KEY,
  type ResolvedSignals,
  type SignalState,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function todayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function defaultState(): SignalState {
  return {
    sessionStartedAt: 0,
    lastEventAt: 0,
    sessionFilesProcessed: 0,
    history: {},
    device_class: deviceClass(),
  };
}

function read(): SignalState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(SIGNALS_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<SignalState>;
    return { ...defaultState(), ...parsed, history: parsed.history ?? {} };
  } catch {
    return defaultState();
  }
}

function write(state: SignalState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIGNALS_KEY, JSON.stringify(state));
  } catch {
    // Storage full / blocked — segmentation degrades gracefully.
  }
}

function pruneHistory(history: SignalState["history"], now: number): SignalState["history"] {
  const cutoff = todayKey(now - 30 * DAY_MS);
  const out: SignalState["history"] = {};
  for (const [day, entry] of Object.entries(history)) {
    if (day >= cutoff) out[day] = entry;
  }
  return out;
}

function isBusinessHour(date: Date): boolean {
  // 9 AM – 7 PM IST = 03:30 – 13:30 UTC. We use UTC hours to keep the check
  // server/client consistent; users outside IST get a slightly skewed signal,
  // acceptable for v1.
  const utc = date.getUTCHours() + date.getUTCMinutes() / 60;
  return utc >= 3.5 && utc < 13.5;
}

function touchSession(state: SignalState, now: number): { state: SignalState; isNewSession: boolean } {
  const idle = now - state.lastEventAt;
  const isNewSession = state.sessionStartedAt === 0 || idle > SESSION_IDLE_MS;
  if (isNewSession) {
    state = { ...state, sessionStartedAt: now, sessionFilesProcessed: 0 };
    const key = todayKey(now);
    const entry = state.history[key] ?? {
      filesProcessed: 0,
      sessions: 0,
      businessHoursSessions: 0,
      toolsUsed: [],
    };
    state.history[key] = {
      ...entry,
      sessions: entry.sessions + 1,
      businessHoursSessions: entry.businessHoursSessions + (isBusinessHour(new Date(now)) ? 1 : 0),
    };
  }
  return { state: { ...state, lastEventAt: now }, isNewSession };
}

function recordToolUsed(state: SignalState, toolId: string, now: number): SignalState {
  const key = todayKey(now);
  const entry = state.history[key] ?? {
    filesProcessed: 0,
    sessions: 0,
    businessHoursSessions: 0,
    toolsUsed: [],
  };
  if (!entry.toolsUsed.includes(toolId)) {
    entry.toolsUsed = [...entry.toolsUsed, toolId];
  }
  return { ...state, history: { ...state.history, [key]: entry } };
}

function recordFileProcessed(state: SignalState, now: number): SignalState {
  const key = todayKey(now);
  const entry = state.history[key] ?? {
    filesProcessed: 0,
    sessions: 0,
    businessHoursSessions: 0,
    toolsUsed: [],
  };
  entry.filesProcessed += 1;
  return {
    ...state,
    sessionFilesProcessed: state.sessionFilesProcessed + 1,
    history: { ...state.history, [key]: entry },
  };
}

let unsubscribe: (() => void) | null = null;

/**
 * Start listening to the analytics bus and updating signals. Idempotent —
 * safe to call multiple times. Returns the unsubscribe function.
 *
 * Called from SegmentBootstrap on layout mount.
 */
export function startSignalCollection(): () => void {
  if (unsubscribe || typeof window === "undefined") return () => {};

  unsubscribe = subscribe((name, payload) => {
    const now = Date.now();
    let state = read();
    state = { ...state, history: pruneHistory(state.history, now) };

    const touched = touchSession(state, now);
    state = touched.state;

    if (name === "tool_open") {
      const p = payload as { tool_id: string };
      state = recordToolUsed(state, p.tool_id, now);
    }
    if (name === "process_complete") {
      state = recordFileProcessed(state, now);
    }

    write(state);
  });

  return () => {
    unsubscribe?.();
    unsubscribe = null;
  };
}

/** Resolve current signals (called by the scorer + at paywall gate time). */
export function getSignals(): ResolvedSignals {
  const now = Date.now();
  const state = { ...read(), history: pruneHistory(read().history, now) };

  let files30d = 0;
  let sessions7d = 0;
  let businessHoursSessions30d = 0;
  let totalSessions30d = 0;
  const activeDays30d = new Set<string>();
  const tools30d = new Set<string>();

  const cutoff7d = todayKey(now - 7 * DAY_MS);
  for (const [day, entry] of Object.entries(state.history)) {
    files30d += entry.filesProcessed;
    totalSessions30d += entry.sessions;
    businessHoursSessions30d += entry.businessHoursSessions;
    if (entry.sessions > 0) activeDays30d.add(day);
    for (const t of entry.toolsUsed) tools30d.add(t);
    if (day >= cutoff7d) sessions7d += entry.sessions;
  }

  return {
    files_processed_session: state.sessionFilesProcessed,
    files_processed_30d: files30d,
    session_count_7d: sessions7d,
    days_active_30d: activeDays30d.size,
    business_hours_session_pct:
      totalSessions30d > 0 ? businessHoursSessions30d / totalSessions30d : 0,
    tools_used_30d: Array.from(tools30d),
    device_class: state.device_class,
  };
}

/** Clear signals — used by the footer "Reset preferences" link. */
export function resetSignals(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SIGNALS_KEY);
  } catch {
    // ignore
  }
}
