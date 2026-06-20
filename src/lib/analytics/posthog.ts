// PostHog client — product analytics, cookieless & anonymous.
//
// Honors the BharatTools privacy promise (no cookies, no personal data):
//   - persistence "memory"        → no cookie / localStorage identifier
//   - autocapture off             → explicit events only, no blind DOM capture
//   - session recording off       → no replay = no PII
//   - person_profiles identified  → no profiles for anonymous visitors
//   - history_change pageviews    → initial + App Router route changes, no
//                                   racing a manual tracker against init
//   - exceptions + performance    → bug + Web-Vitals signal, no PII
//
// This module statically imports posthog-js, so it must only be reached from
// client components (the provider, opt-out controls). The analytics event bus
// (events.ts) does NOT import this file — instead `initPostHog()` registers a
// sink via events.ts `registerSink`, keeping posthog-js out of the server
// bundle.
import posthog from "posthog-js";
import { registerSink } from "./events";

// phc_ project keys are client-side by design (write-only ingest, rate-limited)
// — safe to ship in the bundle, same as the GA measurement ID.
const POSTHOG_KEY = "phc_kn63MeZXuQEDgvDfD43QJ7gNNRvU9ef68LTwcQLhagKh";
const POSTHOG_HOST = "https://eu.i.posthog.com";

let started = false;

/**
 * Initialise PostHog and wire it as an analytics sink. Idempotent. Call once,
 * client-side, only when the visitor has not opted out. No-op on the server.
 */
export function initPostHog(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: "memory",
    autocapture: false,
    disable_session_recording: true,
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_exceptions: true,
    capture_performance: true,
    capture_heatmaps: true,
  });
  // Fan-out: every fire() event also reaches PostHog.
  registerSink((name, payload) =>
    posthog.capture(name, payload as Record<string, unknown>),
  );
}

/** Stop capturing for this session (paired with the GA kill switch on opt-out). */
export function posthogOptOut(): void {
  if (typeof window === "undefined") return;
  posthog.opt_out_capturing();
}

/** Resume capturing (re-enable from the footer "Analytics preferences" control). */
export function posthogOptIn(): void {
  if (typeof window === "undefined") return;
  posthog.opt_in_capturing();
}
