// Sankhya client — Devalok's self-hosted, cookieless product analytics.
//
// Replaces the former PostHog sink. Honors the BharatTools privacy promise:
//   - no cookies / no localStorage identifier (visitors are hashed server-side,
//     daily-rotating, from IP+UA which are never stored)
//   - explicit events only (fed by the typed event bus, no blind DOM capture)
//   - no session recording, no profiles, no PII (payloads are typed + bucketed)
//   - pageviews fired on App Router route changes (see analytics-provider.tsx)
//
// Ingestion is proxied first-party through /ingest (next.config rewrites →
// Sankhya) so adblockers that block third-party analytics don't drop events.
//
// This module has no static posthog-js import — it's just a tiny beacon, so it
// stays out of the server bundle and adds ~nothing to client JS.
import { registerSink } from "./events";

// Public site key (write-only ingest, same class as a GA measurement ID).
const SITE_KEY = "bharattools";
// First-party proxied path → Sankhya's /api/collect (see next.config.ts).
const ENDPOINT = "/ingest/collect";

let started = false;
let optedOut = false;

// GA-parity: flatten array fields (e.g. segment_resolved.signals_used) to a
// comma-joined string. The collector already drops nested objects; flattening
// arrays here preserves them as scalars.
function flatten(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = Array.isArray(v) ? v.join(",") : v;
  }
  return out;
}

function send(name: string, props?: Record<string, unknown>, path?: string): void {
  if (typeof window === "undefined" || optedOut) return;
  try {
    const body = JSON.stringify({
      k: SITE_KEY,
      n: name,
      u: path ?? window.location.pathname,
      r: document.referrer || "",
      p: props ? flatten(props) : {},
    });
    if (navigator.sendBeacon) {
      // text/plain Blob → no CORS preflight; beacon survives page unload.
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }));
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch {
    // Analytics must never break the page.
  }
}

let lastPath: string | null = null;

/** Fire a pageview. De-duplicates consecutive identical paths. */
export function trackPageview(path?: string): void {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  if (p === lastPath) return;
  lastPath = p;
  send("$pageview", undefined, p);
}

/**
 * Wire Sankhya as an analytics sink. Idempotent, client-only. Every fired
 * typed event is fanned out to Sankhya as a custom event.
 */
export function initSankhya(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  registerSink((name, payload) => send(name, payload as Record<string, unknown>));
}

/** Stop capturing for this session (set on visitor opt-out). */
export function sankhyaOptOut(): void {
  optedOut = true;
}

/** Resume capturing (re-enable from the footer "Analytics preferences" control). */
export function sankhyaOptIn(): void {
  optedOut = false;
}
