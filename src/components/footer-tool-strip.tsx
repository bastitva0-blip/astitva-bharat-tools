"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/tool-icon";
import type { tools } from "@/lib/tools";

interface Props {
  items: typeof tools;
}

const SCROLL_BY = 320;

export function FooterToolStrip({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    ref.current?.scrollBy({ left: dir === "left" ? -SCROLL_BY : SCROLL_BY, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Left button */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border border-surface-border bg-surface shadow-sm transition hover:bg-surface-raised sm:-left-4"
      >
        <ChevronLeft className="size-4 text-surface-fg" aria-hidden />
      </button>

      {/* Scrollable strip */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.href}
            className="group flex shrink-0 flex-col items-center gap-2 rounded-xl border border-surface-border-subtle bg-surface-1 px-4 py-3 text-center transition-colors hover:border-[var(--bt-saffron-ink)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bt-saffron-ink)]"
            style={{ minWidth: "7rem" }}
          >
            <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
            <span className="line-clamp-2 text-body-xs font-medium leading-tight text-surface-fg group-hover:text-[var(--bt-saffron-ink)]">
              {tool.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Right button */}
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border border-surface-border bg-surface shadow-sm transition hover:bg-surface-raised sm:-right-4"
      >
        <ChevronRight className="size-4 text-surface-fg" aria-hidden />
      </button>
    </div>
  );
}
