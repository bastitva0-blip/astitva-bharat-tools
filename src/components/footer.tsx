import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { AnalyticsPrefsButton } from "@/components/analytics-prefs-button";
import { DevalokMark } from "@/components/devalok-mark";
import { getCurrentLocale, getDictionary } from "@/i18n/server";

const GITHUB_URL = "https://github.com/devalok-design/bharattools-frontend";

const LINK_CLASS = "block py-1 text-body-sm text-surface-fg-muted transition-colors hover:text-surface-fg";

export async function Footer() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-surface-border-subtle">
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
            </ul>
          </div>

          <div>
            <h3 className="text-body-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
              {dict.footer.headings.resources}
            </h3>
            <ul className="mt-3 space-y-1">
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
                <AnalyticsPrefsButton
                  label={dict.footer.analyticsPrefs}
                  className={`${LINK_CLASS} text-left`}
                />
              </li>
            </ul>
          </div>
        </div>

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
