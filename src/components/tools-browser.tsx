"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { SearchInput } from "@devalok/shilp-sutra/ui/search-input";
import { ToolIcon } from "@/components/tool-icon";
import { toolCategories, tools, type Tool } from "@/lib/tools";

export function ToolsBrowser() {
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
          placeholder="Search tools — try 'UPSC', '50 KB', 'passport'…"
          aria-label="Search tools"
          className="w-full max-w-md"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-md border border-dashed border-surface-border-subtle p-12 text-center text-body-md text-surface-fg-muted">
          No tools match <span className="font-medium text-surface-fg">“{query}”</span>. Try{" "}
          <span className="font-medium text-surface-fg">photo</span>,{" "}
          <span className="font-medium text-surface-fg">compress</span> or{" "}
          <span className="font-medium text-surface-fg">PDF</span>.
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(({ cat, items }) => (
            <section key={cat.id}>
              <h2 className="mb-5 text-heading-sm font-semibold text-surface-fg">
                {cat.label}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
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
            {!live && <Badge color="neutral">soon</Badge>}
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
