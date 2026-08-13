import Link from "next/link";
import { Crop, FileText, Gauge, PenLine, ScanText } from "lucide-react";
import type { Dictionary } from "@/i18n/server";
import { HeroSearch } from "./hero-search";

const QUICK_TASKS = [
  { href: "/photo-resize", Icon: Crop },
  { href: "/image-compress/50kb", Icon: Gauge },
  { href: "/photo-signature-joiner", Icon: PenLine },
  { href: "/jpg-to-pdf", Icon: FileText },
  { href: "/image-to-text", Icon: ScanText },
];

const USP_PILLS = [
  "🛡️ Files stay on device",
  "🏛️ Made for Indian portals",
  "💙 Free for aspirants. Always.",
  "📶 Built for slow internet",
  "🚫 No signups, no ads",
];

export function BharatHero({ dict }: { dict: Dictionary }) {
  const hero = dict.home.hero;
  return (
    <section className="bt-hero-band -mt-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-page-x pt-[7rem] pb-ds-12 text-center lg:pt-[9rem] lg:pb-[6rem]">
        {/* Trust breadcrumb */}
        <div className="bt-rise flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border-subtle bg-surface-1 px-3 py-1 text-body-xs font-medium text-surface-fg-muted">
            <span className="size-1.5 rounded-full bg-[var(--green-9)]" aria-hidden />
            Browser-only · Offline
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border-subtle bg-surface-1 px-3 py-1 text-body-xs font-medium text-surface-fg-muted">
            🇮🇳 Made in India
          </span>
        </div>

        {/* Heading */}
        <h1 className="bt-rise mt-ds-04 max-w-2xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-surface-fg md:text-6xl">
          {hero.title}
        </h1>

        <p className="bt-rise-2 mt-ds-04 max-w-lg text-body-lg text-surface-fg-muted">
          {hero.subtitle}
        </p>

        {/* Search */}
        <div className="bt-rise-2 relative z-10 mt-ds-06 w-full max-w-xl">
          <HeroSearch
            placeholder={dict.tools.searchPlaceholder}
            searchAria={dict.tools.searchAria}
          />
        </div>

        {/* Quick task chips */}
        <div className="bt-rise-3 mt-ds-05 flex flex-wrap justify-center gap-2">
          {hero.tasks.map((label, i) => {
            const { href, Icon } = QUICK_TASKS[i];
            return (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-surface-border-subtle bg-surface-1 px-4 py-2 text-body-sm font-medium text-surface-fg transition-colors hover:border-[var(--bt-line)] hover:bg-[var(--bt-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bt-saffron-ink)]"
              >
                <Icon className="size-4 text-[var(--bt-saffron-ink)]" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>

        {/* USP trust pills */}
        <div className="bt-rise-3 mt-ds-05 flex flex-wrap justify-center gap-2">
          {USP_PILLS.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-surface-border-subtle bg-surface-1 px-3 py-1 text-body-xs text-surface-fg-muted"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
