"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n/provider";
import { posthogOptIn, posthogOptOut } from "@/lib/analytics/posthog";

// Footer "Analytics preferences" dispatches this to re-open the notice so a
// visitor can change their earlier choice.
export const OPEN_PREFS_EVENT = "bt:open-analytics-prefs";

// Notice + opt-out for aggregate improvement metrics. GA runs in cookieless
// mode (analytics_storage stays `denied` — set in layout.tsx) so no cookies or
// Client ID are used and no personal data is processed. That is what makes
// collecting by default lawful under a notice + opt-out model (cookie-based
// tracking would instead require prior opt-in). Opting out flips GA's official
// kill switch (window['ga-disable-<id>']) and persists the choice.
const OPTOUT_KEY = "bt-analytics";
const GA_ID = "G-Q0JW1FJMKT";

function disableGa() {
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
}

function enableGa() {
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = false;
}

export function MetricsNotice() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(OPTOUT_KEY);
    } catch {
      // localStorage blocked — show the notice; metrics stay cookieless.
    }
    if (stored === "off") {
      disableGa();
      posthogOptOut();
    } else if (stored !== "on") {
      // First visit — show the notice once. Metrics are already collecting
      // (cookieless); the notice informs and offers opt-out, it does not gate.
      setVisible(true);
    }

    // Footer "Analytics preferences" re-opens the notice so the choice can change.
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_PREFS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, reopen);
  }, []);

  function optOut() {
    try {
      localStorage.setItem(OPTOUT_KEY, "off");
    } catch {
      // Persistence failed — still disable for this session.
    }
    disableGa();
    posthogOptOut();
    setVisible(false);
  }

  function keepOn() {
    try {
      localStorage.setItem(OPTOUT_KEY, "on");
    } catch {
      // Persistence failed — notice reappears next load, harmless.
    }
    // Re-enable in case this is a reopened notice from a prior opt-out. GA
    // resumes immediately (kill switch cleared); PostHog resumes now if it was
    // started this session, otherwise on next load (provider re-inits).
    enableGa();
    posthogOptIn();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t.metrics.ariaLabel}
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 px-page-x pb-4"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-xl border border-white/10 bg-surface-base/80 p-4 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-surface-base/80 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-surface-fg-muted">
          {t.metrics.message}{" "}
          <Link href="/privacy" className="underline hover:text-accent-11">
            {t.metrics.privacyLink}
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={optOut}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-body-sm font-medium text-surface-fg-muted transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7"
          >
            {t.metrics.optOut}
          </button>
          <button
            type="button"
            onClick={keepOn}
            className="inline-flex h-9 items-center justify-center rounded-md bg-accent-9 px-4 text-body-sm font-medium text-white transition-colors hover:bg-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7"
          >
            {t.metrics.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}
