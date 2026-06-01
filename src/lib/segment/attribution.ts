// UTM + referrer capture — runs once on first visit, then never overwrites.
// Per copy-spec §5: attribution is "set once on first visit, stable for the
// session lifetime."
//
// Why localStorage and not a server cookie: this signal stays on the user's
// device until they pay; we never ship it to a server. (See
// engineering-decisions #12, item 1.)

import { ATTRIBUTION_KEY, type Attribution } from "./types";

function getReferrerHost(): string | null {
  if (typeof document === "undefined") return null;
  if (!document.referrer) return null;
  try {
    const url = new URL(document.referrer);
    // Same-origin referrers carry no segmentation signal — only off-site.
    if (url.host === window.location.host) return null;
    return url.host;
  } catch {
    return null;
  }
}

function read(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function write(value: Attribution): void {
  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
  } catch {
    // localStorage full or blocked — quietly skip; segmentation degrades to
    // "unknown" rather than blowing up the page load.
  }
}

/**
 * Capture UTM params + referrer into localStorage on first visit. Idempotent
 * after the first call — never overwrites. Returns the stored attribution
 * (existing or newly captured), or null when run outside a browser context.
 *
 * Call from SegmentBootstrap on layout mount.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const existing = read();
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const captured: Attribution = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    referrer_host: getReferrerHost(),
    landing_path: window.location.pathname,
    first_seen_at: new Date().toISOString(),
  };
  write(captured);
  return captured;
}

/** Read the stored attribution. Returns null if never captured or on SSR. */
export function getAttribution(): Attribution | null {
  return read();
}

/** Clear attribution — used by the footer "Reset preferences" link. */
export function resetAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ATTRIBUTION_KEY);
  } catch {
    // ignore
  }
}
