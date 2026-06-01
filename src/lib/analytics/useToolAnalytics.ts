"use client";

import { useEffect } from "react";
import { useLocale } from "@/i18n/provider";
import { fire } from "./events";

// Drop-in hook for tool pages — fires `tool_open` on mount.
//
// Usage from a client tool form (or thin client wrapper in a server page):
//
//   "use client";
//   export function FooForm() {
//     useToolAnalytics("photo-resize");
//     ...
//   }
//
// Process events (`process_start`, `process_complete`, `process_error`,
// `download_click`) fire at the relevant call sites in the form itself —
// the hook only owns the lifecycle event a page can't miss.
export function useToolAnalytics(toolId: string): void {
  const { locale } = useLocale();
  useEffect(() => {
    fire("tool_open", { tool_id: toolId, locale });
  }, [toolId, locale]);
}
