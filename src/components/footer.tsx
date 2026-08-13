import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { AnalyticsPrefsButton } from "@/components/analytics-prefs-button";
import { DevalokMark } from "@/components/devalok-mark";
import { ToolIcon } from "@/components/tool-icon";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { tools } from "@/lib/tools";

const GITHUB_URL = "https://github.com/devalok-design/bharattools-frontend";

const LINK_CLASS =
  "block py-1 text-body-sm text-surface-fg-muted transition-colors hover:text-surface-fg";

function sortByPopularity(items: typeof tools) {
  return [...items].sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
}

export async function Footer() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();

  const liveTools = tools.filter((t) => t.status === "live");
  const topTools = sortByPopularity(liveTools);

  return (
    <footer className="mt-20 border-t border-surface-border-subtle">
      {/* Discovery band — everything we do, visible at a glance */}
      <div className="border-b border-[#D33163]/20 bg-[#fff0f4]">
        <div className="mx-auto w-full max-w-6xl px-page-x py-10">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-body-xs font-semibold uppercase tracking-widest text-[#D33163]">
                Everything we do
              </p>
              <h2 className="mt-1 text-heading-sm font-bold text-surface-fg">
                {liveTools.length} tools. One tab. No upload.
              </h2>
            </div>
            <Link
              href="/tools"
              className="shrink-0 text-body-sm font-medium text-[#D33163] hover:underline"
            >
              Browse all →
            </Link>
          </div>

          {/* Horizontal scrollable tool strip */}
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topTools.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex shrink-0 flex-col items-center gap-2 rounded-xl border border-[#D33163]/15 bg-white px-4 py-3 text-center transition-colors hover:border-[#D33163]/50 hover:bg-[#fff7f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D33163]"
                style={{ minWidth: "7rem" }}
              >
                <ToolIcon kind={tool.iconKind} color={tool.iconColor} size="md" />
                <span className="line-clamp-2 text-body-xs font-medium leading-tight text-surface-fg group-hover:text-[#D33163]">
                  {tool.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Devalok studio band */}
      <div className="bg-[#0f0f0f] text-white">
        <div className="mx-auto w-full max-w-6xl px-page-x py-14 sm:py-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
            {/* Logo mark */}
            <div className="shrink-0">
              <div className="flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/5">
                <DevalokMark size={36} />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1">
              <h2 className="text-heading-md font-bold text-white">
                A studio that ships its own tools.
              </h2>
              <div className="mt-4 grid gap-4 text-body-sm text-white/60 sm:grid-cols-2">
                <p>
                  Devalok is a design and strategy studio in Bharat, a brand-craft house behind
                  Karm and our other tools. Shilp Sutra is that studio infrastructure, made public.
                </p>
                <p>
                  Designers are builders too. It hands you the base layer, so your hours go to
                  motion, illustration, and voice, not rebuilding the fifth Button this year.
                </p>
              </div>
              <a
                href="https://devalok.in"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white px-5 py-2.5 text-body-sm font-semibold text-[#0f0f0f] transition hover:bg-white/90"
              >
                More about Devalok
                <span aria-hidden className="text-base leading-none">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="mx-auto w-full max-w-6xl px-page-x py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2">
              <DevalokMark size={20} />
              <span className="font-semibold text-surface-fg">BharatTools</span>
            </div>
            <p className="mt-3 max-w-xs text-body-sm text-surface-fg-muted">
              {dict.footer.tagline}
            </p>
            {/* Privacy commitment — always visible */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-surface-border-subtle bg-surface-2 px-3 py-1.5">
              <ShieldCheck className="size-3.5 shrink-0 text-[var(--bt-teal-ink,var(--teal-11))]" aria-hidden />
              <span className="text-body-xs text-surface-fg-muted">
                Files never leave your device
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-body-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
              {dict.footer.headings.tools}
            </h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href="/tools" className={LINK_CLASS}>
                  {dict.footer.allTools}
                </Link>
              </li>
              <li>
                <Link href="/form-guides" className={LINK_CLASS}>
                  {dict.footer.formGuides}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-body-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
              {dict.footer.headings.plans}
            </h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href="/pricing" className={LINK_CLASS}>
                  {dict.footer.pricing}
                </Link>
              </li>
              <li>
                <Link href="/for-operators" className={LINK_CLASS}>
                  {dict.footer.forOperators}
                </Link>
              </li>
              <li>
                <Link href="/for-professionals" className={LINK_CLASS}>
                  {dict.footer.forProfessionals}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-body-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
              {dict.footer.headings.company}
            </h3>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href="/about" className={LINK_CLASS}>
                  {dict.footer.about}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={LINK_CLASS}>
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className={LINK_CLASS}>
                  {dict.footer.terms}
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={`${LINK_CLASS} inline-flex items-center gap-1.5`}
                >
                  <FaGithub size={12} aria-hidden />
                  {dict.footer.github}
                </a>
              </li>
              <li>
                <a
                  href="https://shilp-sutra.devalok.in"
                  target="_blank"
                  rel="noreferrer"
                  className={LINK_CLASS}
                >
                  {dict.footer.shilpSutra}
                </a>
              </li>
              <li>
                <AnalyticsPrefsButton
                  label={dict.footer.analyticsPrefs}
                  className={`${LINK_CLASS} text-left`}
                />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-surface-border-subtle pt-6 text-body-xs text-surface-fg-subtle sm:flex-row sm:items-center">
          <span>© {year} BharatTools</span>
          <span>
            {dict.footer.builtBy}{" "}
            <a
              href="https://devalok.in"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-surface-fg-muted hover:text-surface-fg hover:underline"
            >
              Devalok
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
