import Link from "next/link";
import {  FaGithub } from "react-icons/fa";
import { DevalokMark } from "@/components/devalok-mark";
import { getCurrentLocale, getDictionary } from "@/i18n/server";

const GITHUB_URL = "https://github.com/devalok-design/bharattools-frontend";

export async function Footer() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-surface-border-subtle">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-page-x py-10 text-body-sm text-surface-fg-muted lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <DevalokMark size={20} />
          <span className="font-semibold text-surface-fg">BharatTools</span>
          <span aria-hidden>·</span>
          <span>{dict.footer.tagline}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/form-guides" className="hover:text-surface-fg">
            {dict.footer.formGuides}
          </Link>
          <Link href="/about" className="hover:text-surface-fg">
            {dict.footer.about}
          </Link>
          <Link href="/privacy" className="hover:text-surface-fg">
            {dict.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-surface-fg">
            {dict.footer.terms}
          </Link>
          <a
            href="https://shilp-sutra.devalok.in"
            target="_blank"
            rel="noreferrer"
            className="hover:text-surface-fg"
          >
            {dict.footer.shilpSutra}
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-surface-fg"
          >
            <FaGithub size={14} aria-hidden />
            {dict.footer.github}
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <span>© {year} BharatTools</span>
          <span aria-hidden>·</span>
          <span>
            {dict.footer.builtBy}{" "}
            <a
              href="https://devalok.in"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-surface-fg hover:underline"
            >
              Devalok
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
