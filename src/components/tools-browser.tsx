"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { SearchInput } from "@devalok/shilp-sutra/ui/search-input";
import { ToolIcon } from "@/components/tool-icon";
import { useT } from "@/i18n/provider";
import { toolCategories, tools, type Tool } from "@/lib/tools";

export function ToolsBrowser() {
  const dict = useT();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) =>
      [t.name, t.tagline, t.description].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  const grouped = useMemo(() => {
    return toolCategories
      .map((cat) => ({
        cat,
        items: filtered.filter((t) => t.category === cat.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <>
      <div className="mb-8 flex justify-center">
        <SearchInput
          size="lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          placeholder={dict.tools.searchPlaceholder}
          aria-label={dict.tools.searchAria}
          className="w-full max-w-md"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-md border border-dashed border-surface-border-subtle p-12 text-center text-body-md text-surface-fg-muted">
          {dict.tools.noResultsLead}{" "}
          <span className="font-medium text-surface-fg">“{query}”</span>
          {dict.tools.noResultsTrailing}{" "}
          {dict.tools.noResultsHints.map((hint, i) => (
            <span key={hint}>
              <span className="font-medium text-surface-fg">{hint}</span>
              {i < dict.tools.noResultsHints.length - 1 ? ", " : "."}
            </span>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(({ cat, items }) => (
            <section key={cat.id}>
              <h2 className="mb-5 text-heading-sm font-semibold text-surface-fg">
                {dict.categories[cat.id] ?? cat.label}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} soonLabel={dict.tools.soon} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function ToolCard({ tool, soonLabel }: { tool: Tool; soonLabel: string }) {
  const live = tool.status === "live";
  return (
    <Link href={tool.href} className="block">
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
