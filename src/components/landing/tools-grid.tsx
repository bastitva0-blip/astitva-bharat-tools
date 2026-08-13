"use client";

import { useState } from "react";
import Link from "next/link";
import { ToolIcon } from "@/components/tool-icon";
import { toolCategories, tools, type ToolCategory } from "@/lib/tools";

type Filter = "all" | ToolCategory;

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  forms: "Sarkari Forms",
  sharing: "Sharing & Print",
  utility: "Quick Utilities",
};

export function ToolsGrid() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible =
    filter === "all"
      ? tools.filter((t) => t.status === "live")
      : tools.filter((t) => t.status === "live" && t.category === filter);

  return (
    <section id="tools" className="scroll-mt-24">
      {/* Category filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
          All tools
          <span className="ml-1.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-body-xs font-normal tabular-nums">
            {tools.filter((t) => t.status === "live").length}
          </span>
        </FilterPill>
        {toolCategories.map((cat) => {
          const count = tools.filter(
            (t) => t.status === "live" && t.category === cat.id
          ).length;
          return (
            <FilterPill
              key={cat.id}
              active={filter === cat.id}
              onClick={() => setFilter(cat.id)}
            >
              {CATEGORY_LABELS[cat.id]}
              <span className="ml-1.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-body-xs font-normal tabular-nums">
                {count}
              </span>
            </FilterPill>
          );
        })}
      </div>

      {/* Tool grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.href}
            className="group flex flex-col items-start gap-3 rounded-xl border border-surface-border-subtle bg-surface-1 p-4 transition-colors hover:border-[var(--bt-line)] hover:bg-[var(--bt-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bt-saffron-ink)]"
          >
            <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
            <div className="min-w-0">
              <div className="text-body-sm font-semibold leading-snug text-surface-fg group-hover:text-[var(--bt-saffron-ink)]">
                {tool.name}
              </div>
              <div className="mt-0.5 line-clamp-2 text-body-xs text-surface-fg-muted">
                {tool.tagline}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bt-saffron-ink)] ${
        active
          ? "border-[var(--bt-saffron-ink)] bg-[var(--bt-paper)] text-[var(--bt-saffron-ink)]"
          : "border-surface-border-subtle bg-surface-1 text-surface-fg-muted hover:border-[var(--bt-line)] hover:text-surface-fg"
      }`}
    >
      {children}
    </button>
  );
}
