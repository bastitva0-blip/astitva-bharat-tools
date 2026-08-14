"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@devalok/shilp-sutra/ui/dropdown-menu";
import { ToolIcon } from "@/components/tool-icon";
import { useT } from "@/i18n/provider";
import { toolCategories, tools } from "@/lib/tools";

const ITEM_CLASS =
  "rounded-md px-3 py-2 text-body-sm font-medium text-surface-fg transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7";

const TOP_PER_CAT = 4;

function sortByPopularity(items: typeof tools) {
  return [...items].sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
}

export function NavMenu() {
  const dict = useT();
  return (
    <nav className="ml-2 hidden items-center gap-1 md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${ITEM_CLASS} inline-flex items-center gap-1 data-[state=open]:bg-accent-3 data-[state=open]:text-accent-11`}
        >
          {dict.nav.tools}
          <ChevronDown size={14} aria-hidden className="opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="w-[480px] p-2">
          <div className="grid grid-cols-2 gap-x-2">
            {toolCategories.map((cat, ci) => {
              const liveItems = tools.filter((t) => t.category === cat.id && t.status === "live");
              const topItems = sortByPopularity(liveItems).slice(0, TOP_PER_CAT);
              const rest = liveItems.length - TOP_PER_CAT;
              if (topItems.length === 0) return null;
              return (
                <div key={cat.id} className={ci === 0 ? "col-span-2" : "col-span-1"}>
                  {ci > 0 && ci === 1 && <DropdownMenuSeparator className="col-span-2 my-2" />}
                  <div className="mb-1 px-2 pt-1 text-body-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
                    {dict.categories[cat.id] ?? cat.label}
                  </div>
                  {ci === 0 ? (
                    /* Sarkari forms: 2-col mini grid */
                    <div className="grid grid-cols-2 gap-x-1">
                      {topItems.map((t) => (
                        <Link
                          key={t.slug}
                          href={t.href}
                          className="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none"
                        >
                          <ToolIcon kind={t.iconKind} color={t.iconColor} size="sm" />
                          <span className="text-body-sm font-medium text-surface-fg">{t.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    /* Other categories: single col */
                    topItems.map((t) => (
                      <Link
                        key={t.slug}
                        href={t.href}
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none"
                      >
                        <ToolIcon kind={t.iconKind} color={t.iconColor} size="sm" />
                        <span className="text-body-sm font-medium text-surface-fg">{t.name}</span>
                      </Link>
                    ))
                  )}
                  {rest > 0 && (
                    <Link
                      href={`/tools#${cat.id}`}
                      className="mt-0.5 flex items-center gap-1 rounded-md px-2 py-1.5 text-body-xs font-medium text-accent-11 hover:underline"
                    >
                      +{rest} more →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <DropdownMenuSeparator className="my-2" />
          <Link
            href="/tools"
            className="flex items-center justify-between rounded-md px-2 py-2 text-body-sm font-medium text-accent-11 transition-colors hover:bg-accent-3"
          >
            {dict.tools.seeAll}
            <span aria-hidden>→</span>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/pricing" className={ITEM_CLASS}>
        {dict.nav.pricing}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${ITEM_CLASS} inline-flex items-center gap-1 data-[state=open]:bg-accent-3 data-[state=open]:text-accent-11`}
        >
          Solutions
          <ChevronDown size={14} aria-hidden className="opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={6} className="w-56 p-2">
          <Link href="/for-operators" className="flex flex-col rounded-md px-3 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none">
            <span className="text-body-sm font-medium text-surface-fg">For Operators</span>
            <span className="text-body-xs text-surface-fg-muted">Cyber café, CSC, print shops</span>
          </Link>
          <Link href="/for-professionals" className="flex flex-col rounded-md px-3 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none">
            <span className="text-body-sm font-medium text-surface-fg">For Professionals</span>
            <span className="text-body-xs text-surface-fg-muted">CAs, CS firms, travel agents</span>
          </Link>
          <Link href="/for-coaching" className="flex flex-col rounded-md px-3 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none">
            <span className="text-body-sm font-medium text-surface-fg">For Coaching Institutes</span>
            <span className="text-body-xs text-surface-fg-muted">White-label for aspirant batches</span>
          </Link>
          <Link href="/b2b" className="flex flex-col rounded-md px-3 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none">
            <span className="text-body-sm font-medium text-surface-fg">For Businesses</span>
            <span className="text-body-xs text-surface-fg-muted">NBFC, fintech, DPDP embed</span>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link href="/form-guides" className={ITEM_CLASS}>
        {dict.nav.formGuides}
      </Link>
    </nav>
  );
}
