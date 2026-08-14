"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { SearchInput } from "@devalok/shilp-sutra/ui/search-input";
import { ToolIcon } from "@/components/tool-icon";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics/events";
import { resolveDeepLink, searchTools, type SearchOutcome } from "@/lib/search";
import { getToolText } from "@/lib/tool-text";
import { toolCategories, tools, type Tool, type ToolCategory } from "@/lib/tools";

const EMPTY_OUTCOME: SearchOutcome = { results: tools, mode: "all" };

const categoryDescriptions: Record<ToolCategory, string> = {
  forms: "Exact pixel, KB, and format specs for UPSC, SSC, NEET, IBPS, RRB, and banking portals. No guesswork.",
  sharing: "Send files to a print shop, generate QR, combine docs for submission.",
  utility: "Format conversions, OCR, and quick jobs — all on-device, offline-ready.",
};

function sortByPopularity(items: Tool[]): Tool[] {
  return [...items].sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
}

export function ToolsBrowser({
  showDefaultHeading = true,
  showSearch = true,
}: {
  showDefaultHeading?: boolean;
  showSearch?: boolean;
} = {}) {
  const dict = useT();
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<SearchOutcome>(EMPTY_OUTCOME);
  const [, startTransition] = useTransition();
  const openedRef = useRef(false);
  const lastFiredQueryRef = useRef<string>("");

  const markOpened = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    fire("search_opened", { surface: "home" });
  };

  const onChange = (value: string) => {
    setQuery(value);
    markOpened();
    startTransition(() => {
      setOutcome(searchTools(value));
    });
  };

  const onClear = () => {
    setQuery("");
    startTransition(() => setOutcome(EMPTY_OUTCOME));
  };

  useEffect(() => {
    if (!query) return;
    const trimmed = query.trim();
    if (!trimmed || trimmed === lastFiredQueryRef.current) return;
    const id = window.setTimeout(() => {
      lastFiredQueryRef.current = trimmed;
      const hadResults = outcome.mode === "primary" || outcome.mode === "fuzzy";
      fire("search_query", { query_length: trimmed.length, had_results: hadResults });
      if (!hadResults) {
        fire("search_zero_result", { query: trimmed });
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [query, outcome.mode]);

  const deepLink = useMemo(() => resolveDeepLink(query), [query]);

  const lastDeepLinkRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLink) {
      lastDeepLinkRef.current = null;
      return;
    }
    if (lastDeepLinkRef.current === deepLink.href) return;
    lastDeepLinkRef.current = deepLink.href;
    fire("search_deep_link", { query: query.trim(), target: deepLink.href });
  }, [deepLink, query]);

  const grouped = useMemo(() => {
    if (outcome.mode === "all" || outcome.mode === "primary") {
      return toolCategories
        .map((cat) => ({
          cat,
          items: outcome.results.filter((t) => t.category === cat.id),
        }))
        .filter((g) => g.items.length > 0);
    }
    return null;
  }, [outcome]);

  const trimmed = query.trim();
  const showFallbackHeading = trimmed.length > 0 && (outcome.mode === "fuzzy" || outcome.mode === "fallback");
  // Editorial split only on landing (where search is hidden). /tools always shows full grid.
  const isEditorialView = !showSearch && outcome.mode === "all" && !trimmed;

  return (
    <>
      {showSearch && (
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-md">
            <SearchInput
              size="lg"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              onClear={onClear}
              onFocus={markOpened}
              placeholder={dict.tools.searchPlaceholder}
              aria-label={dict.tools.searchAria}
            />
          </div>
        </div>
      )}

      {deepLink && (
        <div className="mb-8 flex justify-center">
          <Link
            href={deepLink.href}
            className="inline-flex items-center gap-2 rounded-full border border-accent-7 bg-accent-3 px-4 py-2 text-body-sm text-accent-11 transition hover:bg-accent-4"
            onClick={() => {
              fire("search_result_click", {
                query: trimmed,
                result_slug: deepLink.toolSlug,
                rank: 0,
              });
            }}
          >
            <span className="text-surface-fg-muted">{dict.tools.deepLinkPrefix}</span>
            <span className="font-medium">{deepLink.label}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      {showFallbackHeading ? (
        <h2 className="mb-5 text-heading-sm font-semibold text-surface-fg">
          {outcome.mode === "fuzzy" ? dict.tools.fuzzyHeading : dict.tools.closestHeading}{" "}
          <span className="font-normal text-surface-fg-muted">"{trimmed}"</span>
        </h2>
      ) : (
        !trimmed &&
        showDefaultHeading &&
        !isEditorialView && (
          <h2 className="mb-6 text-heading-md font-semibold text-surface-fg">
            {dict.home.gridHeading}
          </h2>
        )
      )}

      {grouped ? (
        isEditorialView ? (
          /* Editorial split layout — no active search */
          <div className="space-y-16">
            {grouped.map(({ cat, items }) => {
              const catLabel = dict.categories[cat.id] ?? cat.label;
              const topTools = sortByPopularity(items).slice(0, 4);
              return (
                <div key={cat.id} className="grid gap-8 lg:grid-cols-[280px_1fr]">
                  <div className="lg:pt-1">
                    <span className="text-body-xs font-semibold uppercase tracking-widest text-[var(--bt-saffron-ink)]">
                      {catLabel}
                    </span>
                    <h2 className="mt-2 text-heading-md font-semibold text-surface-fg">
                      {catLabel}
                    </h2>
                    <p className="mt-2 text-body-sm text-surface-fg-muted">
                      {categoryDescriptions[cat.id]}
                    </p>
                    <Link
                      href={`/tools?cat=${cat.id}`}
                      className="mt-4 inline-flex items-center gap-1 text-body-sm font-medium text-accent-11 hover:underline"
                    >
                      View all <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {topTools.map((tool, i) => (
                      <ToolCard
                        key={tool.slug}
                        tool={tool}
                        rank={i}
                        query={trimmed}
                        soonLabel={dict.tools.soon}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Primary search — category grouping */
          <div className="space-y-12">
            {grouped.map(({ cat, items }) => (
              <section key={cat.id}>
                <h2 className="mb-5 text-heading-sm font-semibold text-surface-fg">
                  {dict.categories[cat.id] ?? cat.label}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((tool, i) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      rank={i}
                      query={trimmed}
                      soonLabel={dict.tools.soon}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        /* Fuzzy / fallback flat grid */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {outcome.results.map((tool, i) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
              rank={i}
              query={trimmed}
              soonLabel={dict.tools.soon}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ToolCard({
  tool,
  rank,
  query,
  soonLabel,
}: {
  tool: Tool;
  rank: number;
  query: string;
  soonLabel: string;
}) {
  const dict = useT();
  const text = getToolText(tool, dict);
  const live = tool.status === "live";
  const onClick = () => {
    if (!query) return;
    fire("search_result_click", { query, result_slug: tool.slug, rank });
  };
  return (
    <Link href={tool.href} className="block bt-card-lift bt-pressable" onClick={onClick}>
      <Card
        variant="outline"
        interactive={live}
        className={live ? "h-full" : "h-full opacity-60"}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
            {!live && <Badge color="neutral">{soonLabel}</Badge>}
          </div>
          <CardTitle className="mt-4 font-semibold">{text.name}</CardTitle>
          <CardDescription>{text.tagline}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
