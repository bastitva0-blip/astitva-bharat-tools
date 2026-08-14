import { EyeOff, Heart, Landmark, ShieldCheck, Signal } from "lucide-react";
import type { Dictionary } from "@/i18n/server";

const ICONS = [ShieldCheck, Landmark, Heart, Signal, EyeOff] as const;

const COLORS = [
  { bg: "bg-[var(--teal-3)]", icon: "text-[var(--teal-11)]", bar: "bg-[var(--teal-7)]" },
  { bg: "bg-[var(--amber-3)]", icon: "text-[var(--amber-11)]", bar: "bg-[var(--amber-7)]" },
  { bg: "bg-[var(--green-3)]", icon: "text-[var(--green-11)]", bar: "bg-[var(--green-7)]" },
  { bg: "bg-[var(--blue-3)]", icon: "text-[var(--blue-11)]", bar: "bg-[var(--blue-7)]" },
  { bg: "bg-[var(--neutral-3)]", icon: "text-[var(--neutral-11)]", bar: "bg-[var(--neutral-7)]" },
] as const;

const RISE = ["bt-rise", "bt-rise-2", "bt-rise-3", "bt-rise-4", "bt-rise-5"] as const;

export function UspStrip({ dict }: { dict: Dictionary }) {
  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
      {dict.home.uspCards.map((card, i) => {
        const Icon = ICONS[i] ?? ShieldCheck;
        const { bg, icon, bar } = COLORS[i] ?? COLORS[0];
        return (
          <div key={card.title} className={`flex flex-col gap-3 ${RISE[i]}`}>
            <div className={`flex size-14 items-center justify-center rounded-2xl ${bg}`}>
              <Icon className={`size-7 ${icon}`} aria-hidden />
            </div>
            <div className={`h-0.5 w-8 rounded-full ${bar}`} aria-hidden />
            <h3 className="text-body-md font-bold leading-snug text-surface-fg">{card.title}</h3>
            <p className="text-body-sm leading-relaxed text-surface-fg-muted">{card.desc}</p>
          </div>
        );
      })}
    </section>
  );
}
