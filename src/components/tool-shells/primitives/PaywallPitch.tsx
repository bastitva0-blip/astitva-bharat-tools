"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics";
import {
  resolvePaywallPitch,
  scoreSegment,
  getAttribution,
  getSignals,
  type PaywallPitchResolution,
  type PaywallTrigger,
} from "@/lib/segment";
import type { Tool } from "@/lib/tools";

interface PaywallPitchProps {
  tool: Tool;
  trigger: PaywallTrigger;
}

// Inline pitch shown alongside (never modal mid-task) — owns the resolver
// call, fires pitch_variant_shown on mount, pitch_variant_clicked on CTA.
// Renders nothing for always-free tools or the aspirant segment (Seva).
export function PaywallPitch({ tool, trigger }: PaywallPitchProps) {
  const dict = useT();
  const [pitch, setPitch] = useState<PaywallPitchResolution | null>(null);

  // Resolution depends on localStorage (signals + attribution) so it must run
  // after hydration. Recomputing on the client matches engineering-decisions
  // #12 item 2 ("recompute on every gate trigger; cheap"). Syncing the
  // resolved external state into React state is exactly the useEffect +
  // setState pattern React docs sanction — same shape as the pipeline-store
  // consumer in CompressToTargetShell.
  useEffect(() => {
    if (tool.paywall === "always-free") return;
    const resolution = scoreSegment(getAttribution(), getSignals());
    const next = resolvePaywallPitch(tool, resolution, trigger);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPitch(next);
    if (next) {
      fire("pitch_variant_shown", { variant: next.segment, tool_id: tool.slug });
      fire("upsell_shown", { tool_id: tool.slug, trigger });
    }
  }, [tool, trigger]);

  const copy = useMemo(() => pickCopy(dict, pitch), [dict, pitch]);

  if (!pitch || !copy) return null;

  const onClick = () => {
    fire("pitch_variant_clicked", { variant: pitch.segment, tier: pitch.tier });
    fire("upsell_clicked", { tool_id: tool.slug, tier: pitch.tier });
  };

  return (
    <aside
      className="flex flex-col gap-2 rounded-md border border-accent-7 bg-accent-3 p-4 text-body-sm text-accent-12 sm:flex-row sm:items-center sm:justify-between"
      role="complementary"
    >
      <span>{copy}</span>
      <Button asChild variant="soft" size="sm">
        <Link href={pitch.ctaHref} onClick={onClick}>
          {dict.paywall.cta.seePlans}
        </Link>
      </Button>
    </aside>
  );
}

type Dict = ReturnType<typeof useT>;

function pickCopy(dict: Dict, pitch: PaywallPitchResolution | null): string | null {
  if (!pitch) return null;
  const bucket = dict.paywall[pitch.variant as keyof typeof dict.paywall];
  if (!bucket || typeof bucket !== "object") return null;
  const value = (bucket as Record<string, string>)[pitch.trigger];
  return typeof value === "string" && value.length > 0 ? value : null;
}
