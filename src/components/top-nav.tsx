import Link from "next/link";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { LanguageToggle } from "@/components/language-toggle";
import { NavMenu } from "@/components/nav-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentLocale, getDictionary } from "@/i18n/server";

const GITHUB_URL = "https://github.com/devalok-design/bharattools-frontend";

export async function TopNav() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface-base/30 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-base/30">
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

        <div className="ml-auto flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={dict.nav.githubAria}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-surface-fg-muted transition-colors hover:bg-accent-3 hover:text-accent-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-7"
          >
            <FaGithub size={18} aria-hidden />
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
