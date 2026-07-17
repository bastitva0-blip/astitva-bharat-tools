import { CheckCircle2, FolderOpen, Upload } from "lucide-react";
import type { Dictionary } from "@/i18n/server";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.home.howItWorks;
  // A real, ordered sequence (open, drop, done) so the numbering carries
  // meaning rather than decorating.
  const steps = [
    { n: "1", Icon: FolderOpen, title: h.step1Title, desc: h.step1Desc },
    { n: "2", Icon: Upload, title: h.step2Title, desc: h.step2Desc },
    { n: "3", Icon: CheckCircle2, title: h.step3Title, desc: h.step3Desc },
  ];
  return (
    <section className="mt-20 rounded-2xl border border-surface-border-subtle bg-[var(--bt-paper)] px-ds-06 py-ds-08">
      <div className="grid grid-cols-1 gap-ds-06 sm:grid-cols-3">
        {steps.map(({ n, Icon, title, desc }) => (
          <div key={n} className="flex flex-col items-center text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--bt-marigold)] text-body-sm font-bold text-surface-fg">
              {n}
            </span>
            <Icon className="mt-ds-03 size-6 text-[var(--bt-saffron-ink)]" aria-hidden />
            <h3 className="mt-ds-02 text-heading-sm font-semibold text-surface-fg">{title}</h3>
            <p className="mt-ds-02 text-body-sm text-surface-fg-muted">{desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-ds-06 text-center text-body-sm text-surface-fg-muted">{h.caption}</p>
    </section>
  );
}
