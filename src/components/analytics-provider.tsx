"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fire } from "@/lib/analytics";
import { initSankhya, sankhyaOptOut, trackPageview } from "@/lib/analytics/sankhya";

// Mounts Sankhya (cookieless, self-hosted) — the only analytics sink. Mounted
// prod-only from layout.tsx. Respects the stored opt-out (`bt-analytics === off`)
// by never sending. Pageviews are fired here on App Router route changes
// (usePathname). Also bridges uncaught errors + outbound-link clicks into the
// typed event bus so Sankhya + the signal collector see them.
const OPTOUT_KEY = "bt-analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();

  // One-time init: honor stored opt-out, then register the Sankhya sink.
  useEffect(() => {
    try {
      if (localStorage.getItem(OPTOUT_KEY) === "off") sankhyaOptOut();
    } catch {
      // localStorage blocked — proceed (cookieless, no PII).
    }
    initSankhya();
  }, []);

  // Fire a pageview on initial mount and on every client route change.
  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  // Error + interaction bridges (unchanged from the previous provider).
  useEffect(() => {
    // GA-parity error bridge. Message text is deliberately NOT sent — only the
    // error name + route, so no user data leaks into the bus.
    const onError = (e: ErrorEvent) => {
      fire("client_error", {
        route: window.location.pathname,
        error_type: e.error?.name ?? "Error",
        where: "window.onerror",
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason as { name?: string } | string | undefined;
      const error_type =
        typeof reason === "object" && reason?.name
          ? reason.name
          : typeof reason === "string"
            ? "String"
            : "Rejection";
      fire("client_error", {
        route: window.location.pathname,
        error_type,
        where: "unhandledrejection",
      });
    };
    // Outbound-link clicks — one delegated listener covers every external <a>
    // (no per-link wiring, works for server-rendered links too). target is the
    // destination hostname only.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin && /^https?:$/.test(url.protocol)) {
          fire("outbound_click", { target: url.hostname });
        }
      } catch {
        // non-URL href (mailto:, #anchor, etc.) — ignore
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return null;
}
