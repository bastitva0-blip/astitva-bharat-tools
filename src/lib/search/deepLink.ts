// Deep-link detection (search-spec §5.4).
//
// Pure functions — no side effects, no React. Takes a raw user query and
// returns a route + label when the query contains a recognized parameter
// (KB target or exam slug). The caller decides whether to surface it.

import { compressPresets } from "@/lib/presets/compress-sizes";
import { photoSpecs } from "@/lib/spec-db";

export interface DeepLink {
  /** Route to navigate to (already pre-filled). */
  href: string;
  /** Short label for the deep-link affordance ("Open 50 KB compressor"). */
  label: string;
  /** Which tool the deep-link targets — used in analytics + UI. */
  toolSlug: string;
  /** Token the matcher latched onto, for analytics + debugging. */
  token: string;
}

// "50 kb", "50kb", "50KB", "0.5mb" → normalized "<n>kb" / "<n>mb"
const SIZE_RE = /(\d+(?:\.\d+)?)\s*(kb|mb|kilobytes?|megabytes?)/i;

function findCompressPreset(query: string): DeepLink | null {
  const m = SIZE_RE.exec(query);
  if (!m) return null;
  const rawValue = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  const kb = unit.startsWith("m") ? Math.round(rawValue * 1024) : Math.round(rawValue);
  // Match shipped variant if exact, otherwise fall back to closest preset.
  const exact = compressPresets.find((p) => p.targetKb === kb);
  if (exact) {
    return {
      href: `/image-compress/${exact.slug}`,
      label: `Open ${exact.label} compressor`,
      toolSlug: "image-compress",
      token: m[0],
    };
  }
  // Closest preset within 2× (otherwise it's clearly out of range).
  const closest = compressPresets.reduce<typeof compressPresets[number] | null>((best, p) => {
    if (!best) return p;
    return Math.abs(p.targetKb - kb) < Math.abs(best.targetKb - kb) ? p : best;
  }, null);
  if (closest && Math.abs(closest.targetKb - kb) <= closest.targetKb) {
    return {
      href: `/image-compress/${closest.slug}`,
      label: `Open ${closest.label} compressor`,
      toolSlug: "image-compress",
      token: m[0],
    };
  }
  return null;
}

// Exam slugs are short tokens ("upsc", "ssc"). Match whole-word against the
// spec-db slug list. We keep aliases inline because phoneme collapse already
// normalises most spelling variants — exam acronyms don't need it.
function findExamPreset(query: string): DeepLink | null {
  const lowered = query.toLowerCase();
  for (const spec of photoSpecs) {
    const slug = spec.slug;
    const re = new RegExp(`\\b${slug.replace(/-/g, "[-\\s]?")}\\b`, "i");
    if (re.test(lowered)) {
      return {
        href: `/photo-resize/${slug}`,
        label: `Open ${spec.name} photo resizer`,
        toolSlug: "photo-resize",
        token: slug,
      };
    }
  }
  return null;
}

/**
 * Resolve a raw user query to a deep-link, or null if no parameterised
 * pre-fill applies. Size match takes precedence over exam match because the
 * KB number is a more specific signal of intent.
 */
export function resolveDeepLink(query: string): DeepLink | null {
  if (!query || query.length > 100) return null;
  return findCompressPreset(query) ?? findExamPreset(query);
}
