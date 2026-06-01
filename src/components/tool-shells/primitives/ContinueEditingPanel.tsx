"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics";
import { tools, type Tool } from "@/lib/tools";

interface ContinueEditingPanelProps {
  /** The tool the user just finished using. */
  fromTool: Tool;
}

// Renders `tool.nextSteps` from the registry as click-through cards. Clicking
// fires `cross_tool_click` and navigates — the destination tool's shell
// reads from pipelineStore on mount and skips its DropZone.
//
// Hidden when the tool has no nextSteps or all targets are missing.
export function ContinueEditingPanel({ fromTool }: ContinueEditingPanelProps) {
  const dict = useT();
  if (!fromTool.nextSteps || fromTool.nextSteps.length === 0) return null;

  const targets = fromTool.nextSteps
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t) && t!.buildStatus === "shipped");

  if (targets.length === 0) return null;

  return (
    <Card variant="outline" className="mt-6">
      <CardHeader>
        <CardTitle className="text-body-md">{dict.shell.continueEditing.label}</CardTitle>
        <p className="mt-1 text-body-xs text-surface-fg-muted">
          {dict.shell.continueEditing.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {targets.map((target) => (
            <Link
              key={target.slug}
              href={target.href}
              onClick={() =>
                fire("cross_tool_click", { from_tool: fromTool.slug, to_tool: target.slug })
              }
              className="group flex items-center justify-between gap-3 rounded-md border border-surface-border-subtle p-3 hover:border-surface-fg"
            >
              <div className="min-w-0">
                <div className="truncate text-body-sm font-medium">{target.name}</div>
                <div className="truncate text-body-xs text-surface-fg-muted">
                  {target.tagline}
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 opacity-50 transition group-hover:opacity-100" aria-hidden />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
