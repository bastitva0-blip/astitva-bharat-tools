import { CheckCircle2, FolderOpen, Upload } from "lucide-react";
import type { Dictionary } from "@/i18n/server";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.home.howItWorks;
  const steps = [
    { Icon: FolderOpen, title: h.step1Title, desc: h.step1Desc },
    { Icon: Upload, title: h.step2Title, desc: h.step2Desc },
    { Icon: CheckCircle2, title: h.step3Title, desc: h.step3Desc },
  ];
  return (
    <section className="mt-20">
      <div className="grid grid-cols-1 gap-ds-06 sm:grid-cols-3">
        {steps.map(({ Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <Icon className="size-7 text-accent-11" aria-hidden />
            <h3 className="mt-ds-03 text-heading-sm font-semibold text-surface-fg">
              {title}
            </h3>
            <p className="mt-ds-02 text-body-sm text-surface-fg-muted">{desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-ds-06 text-center text-body-sm text-surface-fg-muted">
        {h.caption}
      </p>
    </section>
  );
}
