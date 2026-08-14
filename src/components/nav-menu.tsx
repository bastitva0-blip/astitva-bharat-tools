"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@devalok/shilp-sutra/ui/dropdown-menu";
import { useT } from "@/i18n/provider";

const ITEM_CLASS =
  "rounded-md px-3 py-2 text-body-sm font-medium text-surface-fg transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7";

export function NavMenu() {
  const dict = useT();
  return (
    <nav className="ml-2 hidden items-center gap-1 md:flex">
      <Link href="/tools" className={ITEM_CLASS}>
        {dict.nav.tools}
      </Link>

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
