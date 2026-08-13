import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crop, FileText, Gauge, PenLine, ScanText } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import type { Dictionary } from "@/i18n/server";

// Icon + destination for each hero quick task, index-matched to
// dict.home.hero.tasks (labels come from the active locale).
const QUICK_TASKS = [
  { href: "/photo-resize", Icon: Crop },
  { href: "/image-compress/50kb", Icon: Gauge },
  { href: "/photo-signature-joiner", Icon: PenLine },
  { href: "/jpg-to-pdf", Icon: FileText },
  { href: "/image-to-text", Icon: ScanText },
];

export function BharatHero({ dict }: { dict: Dictionary }) {
  const hero = dict.home.hero;
  return (
    <section className="bt-hero-band -mt-16">
      <div className="mx-auto grid w-full max-w-6xl gap-ds-08 px-page-x pt-[7rem] pb-ds-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-[9rem] lg:pb-[6rem]">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <h1 className="bt-rise max-w-xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-surface-fg md:text-6xl">
            {hero.title}
          </h1>

          <p className="bt-rise-2 mx-auto mt-ds-05 max-w-lg text-body-lg text-surface-fg-muted lg:mx-0">
            {hero.subtitle}
          </p>

          {/* Quick tasks: the jobs people come for, one tap away */}
          <div className="bt-rise-3 mt-ds-06 flex flex-wrap justify-center gap-2.5 lg:justify-start">
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

          <div className="bt-rise-3 mt-ds-06 flex justify-center lg:justify-start">
            <Button asChild size="lg" color="neutral" variant="solid" shape="pill">
              <a href="#tools">
                {hero.browse}
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
          </div>
        </div>

        {/* Signature: a "portal-ready" document card with a rubber-stamp seal */}
        <div className="bt-rise-3 mx-auto hidden w-full max-w-sm sm:block lg:mx-0 lg:ml-auto">
          <SpecCard card={hero.card} />
        </div>
      </div>
    </section>
  );
}

function SpecCard({ card }: { card: Dictionary["home"]["hero"]["card"] }) {
  return (
    <div className="relative rounded-xl border border-surface-border-subtle bg-surface-1 p-ds-05 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-body-xs font-medium text-surface-fg-muted">{card.label}</span>
        <span className="bt-chip">JPG</span>
      </div>

      <div className="mt-ds-04 flex items-stretch gap-ds-04">
        {/* Photo, at spec, on white */}
        <div className="relative w-24 shrink-0 self-stretch overflow-hidden rounded-md border border-surface-border-subtle bg-white">
          <Image src="/user.avif" alt="" fill sizes="96px" className="object-cover" />
        </div>

        {/* Spec compliance, in the portal's own language */}
        <ul className="flex flex-col justify-center gap-2">
          <li><span className="bt-chip">200 × 230 px</span></li>
          <li><span className="bt-chip">50 KB</span></li>
          <li><span className="bt-chip">{card.bg}</span></li>
        </ul>
      </div>

      <div className="mt-ds-04 border-t border-surface-border-subtle pt-ds-03">
        <span className="text-body-xs text-surface-fg-muted">{card.ready}</span>
      </div>

      {/* Rubber stamp */}
      <div className="bt-seal bt-stamp absolute -right-3 -top-4 size-[4.5rem] -rotate-[8deg]" aria-hidden>
        <span className="text-[0.7rem] font-bold">
          ✓<br />
          {card.seal}
        </span>
      </div>
    </div>
  );
}
