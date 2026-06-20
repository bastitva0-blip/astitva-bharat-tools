"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fire } from "@/lib/analytics";
import { initPostHog, posthogPageview } from "@/lib/analytics/posthog";

// Mounts PostHog (cookieless) and SPA pageview tracking. Mounted prod-only from
// layout.tsx alongside GA. Respects the stored opt-out (`bt-analytics === off`)
// by simply never initialising PostHog. Also bridges uncaught errors into the
// typed event bus so GA + the signal collector see them (PostHog captures its
// own $exception via capture_exceptions).
const OPTOUT_KEY = "bt-analytics";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    posthogPageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);
  return null;
}

export function PostHogProvider() {
  useEffect(() => {
    let optedOut = false;
    try {
      optedOut = localStorage.getItem(OPTOUT_KEY) === "off";
    } catch {
      // localStorage blocked — proceed (cookieless, no PII).
    }
    if (!optedOut) initPostHog();

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
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
