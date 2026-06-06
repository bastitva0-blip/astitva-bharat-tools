"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { SearchInput } from "@devalok/shilp-sutra/ui/search-input";
import { ToolIcon } from "@/components/tool-icon";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics/events";
import { resolveDeepLink, searchTools, type SearchOutcome } from "@/lib/search";
import { toolCategories, tools, type Tool } from "@/lib/tools";

const EMPTY_OUTCOME: SearchOutcome = { results: tools, mode: "all" };

export function ToolsBrowser() {
  const dict = useT();
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<SearchOutcome>(EMPTY_OUTCOME);
  const [, startTransition] = useTransition();
  const openedRef = useRef(false);
  const lastFiredQueryRef = useRef<string>("");

  // search_opened: fire once per session when the input is first focused or
  // typed into. (Analytics spec §7.)
  const markOpened = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    fire("search_opened", { surface: "home" });
  };

  // Update results inside a transition so the input stays responsive even
  // when React is re-rendering the grid.
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

  // Fire search_query once the user pauses typing (300 ms). Not a debounce
  // for performance — purely to avoid spamming events per keystroke.
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

  // Fire search_deep_link once per resolved target (not per keystroke).
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
    // "primary" mode: keep the category grouping users are used to.
    // Fallback/fuzzy modes: render a single ranked list — grouping by
    // category in a fallback would be misleading ("here are 9 unrelated
    // tools under Sarkari forms").
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

  return (
    <>
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

      {showFallbackHeading && (
        <h2 className="mb-5 text-heading-sm font-semibold text-surface-fg">
          {outcome.mode === "fuzzy" ? dict.tools.fuzzyHeading : dict.tools.closestHeading}{" "}
          <span className="font-normal text-surface-fg-muted">“{trimmed}”</span>
        </h2>
      )}

      {grouped ? (
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
      ) : (
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
  const live = tool.status === "live";
  const onClick = () => {
    if (!query) return;
    fire("search_result_click", { query, result_slug: tool.slug, rank });
  };
  return (
    <Link href={tool.href} className="block" onClick={onClick}>
      <Card
        variant="elevated"
        interactive={live}
        className={live ? "h-full" : "h-full opacity-60"}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="lg" />
            {!live && <Badge color="neutral">{soonLabel}</Badge>}
          </div>
          <CardTitle className="mt-4 font-semibold">{tool.name}</CardTitle>
          <CardDescription>{tool.tagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-surface-fg-muted">{tool.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
