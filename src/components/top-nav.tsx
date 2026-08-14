import Link from "next/link";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { LanguageToggle } from "@/components/language-toggle";
import { NavMenu } from "@/components/nav-menu";
import { NavSearch } from "@/components/nav-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentLocale, getDictionary } from "@/i18n/server";

const GITHUB_URL = "https://github.com/devalok-design/bharattools-frontend";

export async function TopNav() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  // Material, scroll edge and the reduced-transparency/contrast opt-outs all
  // live in the .bt-chrome rule — see globals.css. The inline border this
  // replaced was `border-white/10`: a white hairline on a light surface, which
  // is to say no visible edge at all in the theme most visitors are in. The
  // material is also mostly opaque now rather than the old 30% — over the
  // homepage's shader hero, nav text at 30% was the actual bug; the frost is
  // secondary to reading it.
  return (
    <header className="bt-chrome sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-page-x">
        <Link
          href="/"
          aria-label={dict.nav.homeAria}
          className="flex items-center gap-2 shrink-0"
        >
          <Image src="/logo.avif" alt="logo" width={28} height={28} />
          <span className="text-heading-sm font-bold tracking-tight bg-linear-to-r from-accent-11 to-accent-9 bg-clip-text text-transparent">
            BharatTools
          </span>
        </Link>

        <NavMenu />

        <div className="ml-auto flex items-center gap-3">
          <NavSearch />
          <div className="flex items-center gap-0.5 rounded-xl border border-surface-border-subtle bg-surface-2 p-1">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={dict.nav.githubAria}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-surface-fg-muted transition-colors hover:bg-surface-1 hover:text-surface-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7"
            >
              <FaGithub size={16} aria-hidden />
            </a>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
