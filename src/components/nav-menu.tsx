"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@devalok/shilp-sutra/ui/dropdown-menu";
import { toolCategories, tools } from "@/lib/tools";

export function NavMenu() {
  return (
    <nav className="ml-2 hidden items-center gap-1 md:flex">
      {toolCategories.map((cat) => {
        const items = tools.filter((t) => t.category === cat.id && t.status === "live");
        if (items.length === 0) return null;
        return (
          <DropdownMenu key={cat.id}>
            <DropdownMenuTrigger
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-body-sm font-medium text-surface-fg transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7 data-[state=open]:bg-accent-3 data-[state=open]:text-accent-11"
            >
              {cat.label}
              <ChevronDown size={14} aria-hidden className="opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={6} className="min-w-[280px]">
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
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
}
