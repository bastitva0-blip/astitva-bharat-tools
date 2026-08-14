"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "bt-pwa-dismissed";

export function PwaInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setPromptEvent(null);
  };

  const install = async () => {
    await promptEvent.prompt();
    setPromptEvent(null);
  };

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:left-auto sm:right-4 sm:max-w-xs"
    >
      <div className="flex-1">
        <p className="text-body-sm font-semibold text-neutral-900 dark:text-neutral-100">
          📲 Add to home screen
        </p>
        <p className="mt-0.5 text-body-xs text-neutral-500 dark:text-neutral-400">
          Works offline. No data needed.
        </p>
        <button
          onClick={install}
          className="mt-3 rounded-md bg-[var(--bt-saffron-ink)] px-4 py-1.5 text-body-xs font-semibold text-white transition hover:opacity-90"
        >
          Install app
        </button>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
