"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const AuroraBloom = dynamic(
  () => import("@devalok/shilp-sutra-brand/aurora").then((m) => m.AuroraBloom),
  { ssr: false },
);

interface HeroAuroraProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

export function HeroAurora({ eyebrow, title, subtitle, children }: HeroAuroraProps) {
  return (
    <section className="relative isolate -mt-16 overflow-hidden">
      <AuroraBloom intensity="strong" shape="curtain" position="top" layers={3} />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-ds-06 px-page-x pt-[8rem] pb-ds-12 text-center text-surface-fg md:gap-ds-08 md:pt-[10rem] md:pb-[7rem] lg:pt-[13rem] lg:pb-[10rem]">
        {eyebrow && (
          <span className="text-ds-xs font-semibold uppercase tracking-wider text-accent-11">
            {eyebrow}
          </span>
        )}
        <h1 className="max-w-3xl text-balance text-5xl font-bold tracking-tight text-surface-fg md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-balance text-body-lg font-medium text-surface-fg-muted">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
