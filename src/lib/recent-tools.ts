// Recent tools — client-side localStorage, max 5 slugs.

const KEY = "bt-recent-tools";
const MAX = 5;

export function getRecentSlugs(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentSlug(slug: string): void {
  try {
    const prev = getRecentSlugs().filter((s) => s !== slug);
    localStorage.setItem(KEY, JSON.stringify([slug, ...prev].slice(0, MAX)));
  } catch {
    // localStorage unavailable
  }
}
