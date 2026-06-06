// Query + index normalizer (search-spec §3.4).
//
// Applied at BOTH index time (MiniSearch `processTerm`) and query time
// (`processTerm` for tokenize). Anything we want to be matchable must be
// reduced to the same canonical form on both sides.
//
// Rules:
//   - lowercase + strip punctuation
//   - unify units: "50 kb" → "50kb"; kilobytes/megabytes → kb/mb
//   - Hinglish phoneme collapse: ph→f, kh→k, ch→c, aa→a, ee→i, oo→u
//     (collapses tasveer/tasvir/tasweir, chhota/chota/chotta, etc.)
//
// Devanagari passes through unchanged — Unicode tokenization handles it.

const PUNCT_RE = /[^\p{L}\p{N}\s]/gu;

const UNIT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/kilobytes?/g, "kb"],
  [/megabytes?/g, "mb"],
  [/gigabytes?/g, "gb"],
  // "50 kb" → "50kb" (number + space + unit)
  [/(\d+)\s+(kb|mb|gb)/g, "$1$2"],
];

const PHONEME_COLLAPSE: Array<[RegExp, string]> = [
  [/ph/g, "f"],
  [/kh/g, "k"],
  [/ch/g, "c"],
  [/aa/g, "a"],
  [/ee/g, "i"],
  [/oo/g, "u"],
];

/**
 * Normalize a single term or query string. Cheap; called per-token.
 * Returns "" for tokens that collapse to nothing (e.g. pure punctuation) —
 * MiniSearch's processTerm contract drops "" tokens from the index.
 */
export function normalizeTerm(input: string): string {
  let s = input.toLowerCase().replace(PUNCT_RE, " ").replace(/\s+/g, " ").trim();
  if (!s) return "";
  for (const [re, sub] of UNIT_REPLACEMENTS) s = s.replace(re, sub);
  for (const [re, sub] of PHONEME_COLLAPSE) s = s.replace(re, sub);
  return s;
}

/**
 * Normalize an entire query string before passing to MiniSearch.search().
 * Same rules as normalizeTerm, but preserves spaces so MiniSearch can
 * tokenize multi-word queries.
 */
export function normalizeQuery(input: string): string {
  if (!input) return "";
  // Cap absurd paste-bomb queries before doing regex work (search-spec §4).
  const capped = input.length > 100 ? input.slice(0, 100) : input;
  return normalizeTerm(capped);
}
