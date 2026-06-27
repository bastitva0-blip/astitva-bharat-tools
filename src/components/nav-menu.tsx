"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@devalok/shilp-sutra/ui/dropdown-menu";
import { useT } from "@/i18n/provider";
import { toolCategories, tools } from "@/lib/tools";

const ITEM_CLASS =
  "rounded-md px-3 py-2 text-body-sm font-medium text-surface-fg transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7";

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
        <DropdownMenuContent align="start" sideOffset={6} className="min-w-[320px]">
          {toolCategories.map((cat, ci) => {
            const items = tools.filter((t) => t.category === cat.id && t.status === "live");
            if (items.length === 0) return null;
            return (
              <div key={cat.id}>
                {ci > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-body-xs uppercase tracking-wider text-surface-fg-subtle">
                  {dict.categories[cat.id] ?? cat.label}
                </DropdownMenuLabel>
                {items.map((t) => (
                  <DropdownMenuItem key={t.slug} asChild>
                    <Link
                      href={t.href}
                      className="block cursor-pointer rounded-md px-2 py-2 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none data-[highlighted]:bg-accent-3"
                    >
                      <div className="text-body-sm font-medium text-surface-fg">{t.name}</div>
                      <div className="text-body-xs text-surface-fg-muted">{t.tagline}</div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="/tools"
              className="block cursor-pointer rounded-md px-2 py-2 text-body-sm font-medium text-accent-11 transition-colors hover:bg-accent-3 focus:bg-accent-3 focus:outline-none data-[highlighted]:bg-accent-3"
            >
              {dict.tools.seeAll} →
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/pricing" className={ITEM_CLASS}>
        {dict.nav.pricing}
      </Link>
      <Link href="/form-guides" className={ITEM_CLASS}>
        {dict.nav.formGuides}
      </Link>
    </nav>
  );
}
