import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { navTools } from "@/lib/tools";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border-subtle bg-surface-base/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-page-x">
        <Link
          href="/"
          aria-label="BharatTools home"
          className="flex items-center gap-2 shrink-0"
        >
          <Image src="/logo.avif" alt="logo" width={28} height={28} />
          <span className="text-heading-sm font-bold tracking-tight bg-linear-to-r from-accent-11 to-accent-9 bg-clip-text text-transparent">
            BharatTools
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {navTools.map((t) => {
            const live = t.status === "live";
            return (
              <Link
                key={t.slug}
                href={t.href}
                className={`rounded-md px-3 py-2 text-body-sm font-semibold uppercase tracking-wide transition-colors ${
                  live
                    ? "text-surface-fg hover:bg-accent-3 hover:text-accent-11"
                    : "text-surface-fg-subtle hover:bg-surface-raised-hover hover:text-surface-fg"
                }`}
              >
                {t.name}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
