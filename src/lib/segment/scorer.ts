// Segment scorer — pure function from (attribution, signals) → resolution.
//
// Heuristics from copy-spec §5. Tunable; treat the weights as v1 calibration
// to revisit once we see real distribution data via `segment_resolved`
// analytics events.
//
// Design notes:
// - Each rule contributes a positive score to one or more segments and
//   records the signal name in `signals_used`. The argmax wins.
// - Confidence = (top - runner_up) / max(top, 1). A clear winner gets ~1; a
//   tie gets ~0. The paywall pitch resolver may decide to fall back to
//   neutral copy when confidence < 0.3.
// - When no signals fire at all, primary = "unknown" with confidence 0.
//
// Tools that route exclusively to one segment (operator-only landers, etc.)
// dominate the scoring; behavioral signals are softer.

import type { Attribution, ResolvedSignals, Segment, SegmentResolution } from "./types";

interface Score {
  segment: Segment;
  weight: number;
  signal: string;
}

const SARKARI_REFERRERS = ["sarkariresult.com", "sarkariresult.in", "freejobalert.com", "rojgarresult.com"];

function attributionRules(attr: Attribution | null): Score[] {
  if (!attr) return [];
  const out: Score[] = [];

  if (attr.landing_path === "/for-operators") {
    out.push({ segment: "operator", weight: 5, signal: "landing_for_operators" });
  }
  if (attr.landing_path === "/for-professionals") {
    out.push({ segment: "professional", weight: 5, signal: "landing_for_professionals" });
  }

  const campaign = attr.utm_campaign?.toLowerCase() ?? "";
  if (/operator|cyber|csc|cafe/.test(campaign)) {
    out.push({ segment: "operator", weight: 3, signal: "utm_campaign_operator" });
  }
  if (/professional|ca|legal/.test(campaign)) {
    out.push({ segment: "professional", weight: 3, signal: "utm_campaign_professional" });
  }
  if (/aspirant|exam|upsc|ssc|neet/.test(campaign)) {
    out.push({ segment: "aspirant", weight: 3, signal: "utm_campaign_aspirant" });
  }

  if (attr.referrer_host && SARKARI_REFERRERS.some((h) => attr.referrer_host?.includes(h))) {
    out.push({ segment: "aspirant", weight: 3, signal: "referrer_sarkari" });
  }

  return out;
}

function signalRules(signals: ResolvedSignals): Score[] {
  const out: Score[] = [];

  // Operator behavior: high volume + repeat days + desktop + business hours.
  if (signals.files_processed_30d > 50 && signals.days_active_30d >= 3) {
    out.push({ segment: "operator", weight: 4, signal: "high_volume_repeat_days" });
  }
  if (
    signals.business_hours_session_pct > 0.7 &&
    signals.device_class === "desktop" &&
    signals.session_count_7d >= 3
  ) {
    out.push({ segment: "operator", weight: 2, signal: "business_hours_desktop" });
  }

  // Professional behavior: moderate volume on desktop during business hours,
  // but not the shop-scale volume of an operator.
  if (
    signals.files_processed_30d > 10 &&
    signals.files_processed_30d <= 50 &&
    signals.business_hours_session_pct > 0.6 &&
    signals.device_class === "desktop"
  ) {
    out.push({ segment: "professional", weight: 2, signal: "moderate_business_hours" });
  }

  // Aspirant behavior: single-file, occasional, mobile, sarkari tools.
  const sarkariTools = signals.tools_used_30d.filter((t) =>
    /photo-resize|document-photo|photo-signature-joiner|aadhaar/.test(t),
  );
  if (
    signals.files_processed_30d <= 5 &&
    signals.device_class === "mobile" &&
    sarkariTools.length >= 1
  ) {
    out.push({ segment: "aspirant", weight: 2, signal: "mobile_sarkari_light" });
  }

  // Default fallback — gives "unknown" something to lose to.
  if (signals.files_processed_30d > 0) {
    out.push({ segment: "individual-paying", weight: 0.5, signal: "any_usage" });
  }

  return out;
}

export function scoreSegment(
  attribution: Attribution | null,
  signals: ResolvedSignals,
): SegmentResolution {
  const scores = [...attributionRules(attribution), ...signalRules(signals)];

  if (scores.length === 0) {
    return { primary: "unknown", confidence: 0, signals_used: [] };
  }

  const totals = new Map<Segment, number>();
  for (const s of scores) {
    totals.set(s.segment, (totals.get(s.segment) ?? 0) + s.weight);
  }

  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  const [primary, top] = sorted[0];
  const runnerUp = sorted[1]?.[1] ?? 0;
  const confidence = top > 0 ? (top - runnerUp) / top : 0;

  return {
    primary,
    confidence: Math.max(0, Math.min(1, confidence)),
    signals_used: scores.map((s) => s.signal),
  };
}
