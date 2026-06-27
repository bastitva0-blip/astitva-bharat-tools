import { EyeOff, Heart, Landmark, ShieldCheck, Signal } from "lucide-react";
import type { Dictionary } from "@/i18n/server";

const ICONS = [ShieldCheck, Landmark, Heart, Signal, EyeOff] as const;

export function UspStrip({ dict }: { dict: Dictionary }) {
  return (
    <section className="mt-ds-08 grid grid-cols-1 gap-ds-04 sm:grid-cols-2 lg:grid-cols-5">
      {dict.home.uspCards.map((card, i) => {
        const Icon = ICONS[i] ?? ShieldCheck;
        return (
          <div
            key={card.title}
            className="rounded-lg border border-surface-border-subtle bg-surface-1 p-ds-05"
          >
            <Icon className="size-5 text-accent-11" aria-hidden />
            <h3 className="mt-ds-03 text-body-md font-semibold text-surface-fg">
              {card.title}
            </h3>
            <p className="mt-ds-02 text-body-sm text-surface-fg-muted">
              {card.desc}
            </p>
          </div>
        );
      })}
    </section>
  );
}
