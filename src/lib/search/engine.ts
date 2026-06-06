// MiniSearch engine — module-scope index (search-spec §3.6).
//
// Built ONCE at module load. NOT in useMemo, NOT in a React effect. Index
// build for ~10 tools is sub-millisecond; the cost is paid in the JS bundle
// parse, not at runtime.
//
// Field boosting (search-spec §3.5):
//   name: 10, keywords: 4, tagline: 2, description: 1
// Combined with light popularity re-rank as a tiebreaker only.

import MiniSearch, { type SearchResult } from "minisearch";

import { tools, type Tool } from "@/lib/tools";

import { normalizeQuery, normalizeTerm } from "./normalize";

interface IndexedTool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  keywords: string;
}

function toIndexed(t: Tool): IndexedTool {
  return {
    id: t.slug,
    name: t.name,
    tagline: t.tagline,
    description: t.description,
    keywords: t.keywords.join(" "),
  };
}

const ms = new MiniSearch<IndexedTool>({
  idField: "id",
  fields: ["name", "keywords", "tagline", "description"],
  storeFields: ["id"],
  processTerm: (term) => {
    const n = normalizeTerm(term);
    return n || null;
  },
  searchOptions: {
    boost: { name: 10, keywords: 4, tagline: 2, description: 1 },
    fuzzy: 0.2,
    prefix: true,
    combineWith: "OR",
    processTerm: (term) => {
      const n = normalizeTerm(term);
      return n || null;
    },
  },
});

ms.addAll(tools.map(toIndexed));

// --- Tool lookup ---------------------------------------------------------

const toolBySlug = new Map<string, Tool>(tools.map((t) => [t.slug, t]));

function hydrate(results: SearchResult[]): Array<{ tool: Tool; score: number }> {
  const out: Array<{ tool: Tool; score: number }> = [];
  for (const r of results) {
    const tool = toolBySlug.get(r.id as string);
    if (tool) out.push({ tool, score: r.score });
  }
  return out;
}

// --- Public API ----------------------------------------------------------

export interface SearchOutcome {
  /** Tools ranked by relevance (+ popularity tiebreaker). */
  results: Tool[];
  /**
   * - "primary"  : direct relevance hits
   * - "fuzzy"    : retry with looser fuzzy threshold
   * - "fallback" : no relevance hits — popular tools / "closest"
   * - "all"      : empty query — show everything in popularity order
   */
  mode: "primary" | "fuzzy" | "fallback" | "all";
}

const POPULARITY_WEIGHT = 0.15;

function rankByPopularity(items: Tool[]): Tool[] {
  return [...items].sort(
    (a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0),
  );
}

function applyPopularityTiebreaker(
  scored: Array<{ tool: Tool; score: number }>,
): Tool[] {
  return scored
    .map(({ tool, score }) => ({
      tool,
      adjusted: score + (tool.popularityScore ?? 0) * POPULARITY_WEIGHT,
    }))
    .sort((a, b) => b.adjusted - a.adjusted)
    .map((x) => x.tool);
}

/**
 * Search the tool catalog. NEVER returns an empty list (search-spec §4 —
 * zero results = brand-damage event in this audience).
 *
 * Fallback chain:
 *   1. primary search (fuzzy 0.2)
 *   2. fuzzy retry (0.4) — catches typos missed by primary
 *   3. popularity fallback — top tools, marked as `mode: "fallback"` so the
 *      UI can render "closest tools" framing instead of pretending these are
 *      matches.
 */
export function searchTools(rawQuery: string): SearchOutcome {
  const query = normalizeQuery(rawQuery);

  if (!query) {
    return { results: rankByPopularity(tools), mode: "all" };
  }

  // 1 char: prefix-only, no fuzzy noise (search-spec §4).
  if (query.length === 1) {
    const prefixHits = ms.search(query, { fuzzy: false, prefix: true });
    if (prefixHits.length > 0) {
      return { results: applyPopularityTiebreaker(hydrate(prefixHits)), mode: "primary" };
    }
    return { results: rankByPopularity(tools), mode: "fallback" };
  }

  const primary = ms.search(query);
  if (primary.length > 0) {
    return { results: applyPopularityTiebreaker(hydrate(primary)), mode: "primary" };
  }

  const fuzzy = ms.search(query, { fuzzy: 0.4 });
  if (fuzzy.length > 0) {
    return { results: applyPopularityTiebreaker(hydrate(fuzzy)), mode: "fuzzy" };
  }

  return { results: rankByPopularity(tools), mode: "fallback" };
}
