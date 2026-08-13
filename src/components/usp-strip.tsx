import { EyeOff, Heart, Landmark, ShieldCheck, Signal } from "lucide-react";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import type { Dictionary } from "@/i18n/server";

const ICONS = [ShieldCheck, Landmark, Heart, Signal, EyeOff] as const;

export function UspStrip({ dict }: { dict: Dictionary }) {
  return (
    <section className="grid grid-cols-1 gap-ds-04 sm:grid-cols-2 lg:grid-cols-5">
      {dict.home.uspCards.map((card, i) => {
        const Icon = ICONS[i] ?? ShieldCheck;
        const isPrivacy = i === 0;
        return (
          <Card
            key={card.title}
            variant="elevated"
            className={isPrivacy ? "border-l-2 border-l-[var(--teal-7)]" : ""}
          >
            <CardContent className="pt-ds-05">
              <span className={`bt-tile${isPrivacy ? " bt-tile--teal" : ""}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-ds-03 text-body-md font-semibold text-surface-fg">{card.title}</h3>
              <p className="mt-ds-02 text-body-sm text-surface-fg-muted">{card.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
