"use client";

import { Sparkles } from "lucide-react";
import { useT } from "@/i18n/provider";
import { useToolAnalytics } from "@/lib/analytics";
import type { Tool } from "@/lib/tools";
import { ContinueEditingPanel } from "./ContinueEditingPanel";
import { TrustBadge } from "./TrustBadge";

// Shared chrome wrapping every tool shell (base-infrastructure-plan §3).
//
// Owns the cross-cutting bits — TrustBadge at top, tool_open analytics,
// ContinueEditingPanel below the result. Each typed shell (ResizeToSpec,
// CompressToTarget, Convert, Compose, Generate, Enhance) renders its
// layout-specific UI inside `children` and stays focused on its own
// interaction.
//
// `comingSoon` mode: shows a notice strip + lets the shell render its
// distinct layout (so users feel what the finished tool will be like) while
// the shell itself disables submit. Used for tools with
// `buildStatus: "next" | "later"` that have a route + page but no
// processing implementation yet.

interface ShellChromeProps {
  tool: Tool;
  /** Tool-specific layout content. */
  children: React.ReactNode;
  /** Show a "coming soon" notice and hide ContinueEditingPanel. */
  comingSoon?: boolean;
  /** Custom coming-soon copy. Defaults to a generic message. */
  comingSoonLabel?: string;
}

export function ShellChrome({
  tool,
  children,
  comingSoon = false,
  comingSoonLabel,
}: ShellChromeProps) {
  const dict = useT();
  useToolAnalytics(tool.slug);

  const defaultComingSoon =
    dict.shell.comingSoon?.label ?? "This tool is on the way — preview the layout below.";
  const message = comingSoonLabel ?? defaultComingSoon;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <TrustBadge />
      </div>

      {comingSoon && (
        <div
          className="mb-4 flex items-start gap-3 rounded-md border border-accent-7 bg-accent-3 px-4 py-3 text-body-sm text-accent-11"
          role="status"
        >
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{message}</span>
        </div>
      )}

      {children}

      {!comingSoon && <ContinueEditingPanel fromTool={tool} />}
    </div>
  );
}
