import type { Dictionary } from "@/i18n/server";

export function TrustStrip({ dict }: { dict: Dictionary }) {
  const t = dict.home.trustStrip;
  const [beforeName, afterName] = t.builtByTemplate.split("{devalok}");
  return (
    <section className="mx-auto mt-ds-08 mb-ds-08 w-full max-w-6xl px-page-x">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-body-xs text-surface-fg-subtle">
        <span>{t.hosted}</span>
        <span aria-hidden>·</span>
        <span>{t.made}</span>
        <span aria-hidden>·</span>
        <span>
          {beforeName}
          <a
            href="https://devalok.in"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-surface-fg-muted hover:text-surface-fg hover:underline"
          >
            {t.devalokName}
          </a>
          {afterName}
        </span>
      </div>
    </section>
  );
}
