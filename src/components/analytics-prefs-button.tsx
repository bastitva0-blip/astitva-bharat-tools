"use client";

import { OPEN_PREFS_EVENT } from "@/components/metrics-notice";

// Footer control that re-opens the analytics notice so a visitor can change a
// prior opt-out / opt-in choice. Styled to match the footer's text links.
export function AnalyticsPrefsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFS_EVENT))}
      className="hover:text-surface-fg"
    >
      {label}
    </button>
  );
}
