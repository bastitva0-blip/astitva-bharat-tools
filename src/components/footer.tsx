import { DevalokMark } from "@/components/devalok-mark";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-surface-border-subtle">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-page-x py-8 text-body-sm text-surface-fg-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <DevalokMark size={20} />
          <span className="font-semibold text-surface-fg">BharatTools</span>
          <span aria-hidden>·</span>
          <span>Har Sarkari form ka saathi.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>© {year} BharatTools</span>
          <span aria-hidden>·</span>
          <span>
            Built with{" "}
            <a
              href="https://shilp-sutra.devalok.in"
              target="_blank"
              rel="noreferrer"
              className="text-accent-11 hover:text-accent-12"
            >
              Shilp Sutra
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
