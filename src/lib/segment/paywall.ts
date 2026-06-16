// Paywall pitch resolver (copy-spec §5, base-infrastructure-plan §7.3).
//
// Pure mapping from (tool tier, segment resolution, trigger) → pitch payload.
// Render decisions live in the PaywallPitch component; this file only decides
// WHETHER to pitch and WHICH variant.
//
// Rules (copy-spec §5 lines 333–337):
//   - tool.paywall === "always-free"  → null (never pitch)
//   - resolved segment === "aspirant" → null (Seva)
//   - resolved confidence < 0.3       → "neutral" variant (scorer.ts L11)
//   - else                            → segment-specific variant

import type { Paywall, Tool } from "@/lib/tools";
import type { Segment, SegmentResolution } from "./types";

export type PaywallTrigger =
  | "tool-open"
  | "batch-initiated"
  | "high-cost-feature"
  | "post-download";

export type PitchVariant = Segment | "neutral";

export type PitchTier = "29" | "499" | "1999";

export interface PaywallPitchResolution {
  variant: PitchVariant;
  segment: Segment;
  trigger: PaywallTrigger;
  copyKey: string; // i18n key — paywall.<variant>.<trigger>
  ctaKey: string;  // i18n key — paywall.cta.<key>
  ctaHref: string;
  tier: PitchTier;
}

const CONFIDENCE_THRESHOLD = 0.3;

const TIER_BY_VARIANT: Record<PitchVariant, PitchTier> = {
  operator: "1999",
  professional: "1999",
  "individual-paying": "499",
  neutral: "499",
  unknown: "499",
  aspirant: "499", // unreachable — aspirant short-circuits to null
};

const HREF_BY_VARIANT: Record<PitchVariant, string> = {
  operator: "/pricing#operators",
  professional: "/pricing#professionals",
  "individual-paying": "/pricing",
  neutral: "/pricing",
  unknown: "/pricing",
  aspirant: "/pricing",
};

function shouldSkip(paywall: Paywall, primary: Segment): boolean {
  return paywall === "always-free" || primary === "aspirant";
}

function pickVariant(resolution: SegmentResolution): PitchVariant {
  if (resolution.confidence < CONFIDENCE_THRESHOLD) return "neutral";
  return resolution.primary;
}

export function resolvePaywallPitch(
  tool: Tool,
  resolution: SegmentResolution,
  trigger: PaywallTrigger,
): PaywallPitchResolution | null {
  if (shouldSkip(tool.paywall, resolution.primary)) return null;

  const variant = pickVariant(resolution);

  return {
    variant,
    segment: resolution.primary,
    trigger,
    copyKey: `paywall.${variant}.${trigger}`,
    ctaKey: "paywall.cta.seePlans",
    ctaHref: HREF_BY_VARIANT[variant],
    tier: TIER_BY_VARIANT[variant],
  };
}
