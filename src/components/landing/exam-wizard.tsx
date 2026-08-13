"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

interface ExamConfig {
  label: string;
  emoji: string;
  guide: string;
  tools: { href: string; name: string; reason: string }[];
}

const EXAMS: ExamConfig[] = [
  {
    label: "UPSC CSE",
    emoji: "🏛️",
    guide: "/form-guides/upsc",
    tools: [
      { href: "/photo-resize/upsc", name: "UPSC Photo Resizer", reason: "20–200 KB, white bg, square" },
      { href: "/image-compress/100kb", name: "Compress to 100 KB", reason: "Triple-signature scan" },
      { href: "/jpg-to-pdf", name: "JPG to PDF", reason: "ID proof as PDF" },
      { href: "/pdf-compress", name: "PDF Compressor", reason: "ID PDF under 300 KB" },
    ],
  },
  {
    label: "SSC CGL",
    emoji: "📋",
    guide: "/form-guides/ssc-cgl",
    tools: [
      { href: "/image-compress/20kb", name: "Compress to 20 KB", reason: "SSC signature (10–20 KB)" },
      { href: "/jpg-to-pdf", name: "JPG to PDF", reason: "Category certificate as PDF" },
    ],
  },
  {
    label: "NEET UG",
    emoji: "🏥",
    guide: "/form-guides/neet",
    tools: [
      { href: "/photo-resize/neet", name: "NEET Photo Resizer", reason: "10–200 KB, 200×230 px" },
      { href: "/image-compress/50kb", name: "Compress to 50 KB", reason: "Signature within 4–30 KB" },
      { href: "/image-compress/100kb", name: "Compress to 100 KB", reason: "Postcard photo (50–300 KB)" },
    ],
  },
  {
    label: "JEE Main",
    emoji: "🔬",
    guide: "/form-guides/jee-main",
    tools: [
      { href: "/photo-resize/jee", name: "JEE Photo Resizer", reason: "10–200 KB, 200×230 px" },
      { href: "/image-compress/20kb", name: "Compress to 20 KB", reason: "Signature within 4–30 KB" },
    ],
  },
  {
    label: "IBPS PO/Clerk",
    emoji: "🏦",
    guide: "/form-guides/ibps-po",
    tools: [
      { href: "/photo-resize/ibps", name: "IBPS Photo Resizer", reason: "200×230 px, 20–50 KB" },
      { href: "/image-compress/20kb", name: "Compress to 20 KB", reason: "Signature (10–20 KB)" },
      { href: "/image-compress/50kb", name: "Compress to 50 KB", reason: "Thumb impression (20–50 KB)" },
    ],
  },
  {
    label: "RRB ALP",
    emoji: "🚂",
    guide: "/form-guides/rrb-alp",
    tools: [
      { href: "/photo-resize/railway", name: "Railway Photo Resizer", reason: "20–50 KB, portal spec" },
      { href: "/image-compress/50kb", name: "Compress to 50 KB", reason: "Signature (20–50 KB)" },
    ],
  },
  {
    label: "GATE",
    emoji: "⚙️",
    guide: "/form-guides/gate",
    tools: [
      { href: "/photo-resize", name: "Exam Photo Resizer", reason: "5–200 KB, 240×320 px" },
      { href: "/image-compress/20kb", name: "Compress to 20 KB", reason: "Signature (4–30 KB)" },
    ],
  },
  {
    label: "Passport",
    emoji: "🛂",
    guide: "/form-guides/passport",
    tools: [
      { href: "/photo-resize", name: "Exam Photo Resizer", reason: "2×2 in, white bg" },
      { href: "/bg-remove", name: "Background Remover", reason: "Replace bg with white" },
      { href: "/image-compress/50kb", name: "Compress to 50 KB", reason: "Portal upload limit" },
    ],
  },
];

export function ExamWizard() {
  const [selected, setSelected] = useState<ExamConfig | null>(null);

  if (selected) {
    return (
      <section className="rounded-xl border border-surface-border-subtle bg-surface-2 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-body-xs font-semibold uppercase tracking-widest text-[var(--bt-saffron-ink)]">
              {selected.emoji} {selected.label} — tools you need
            </p>
            <h2 className="mt-1 text-body-md font-semibold text-surface-fg">
              Use these in order. Form guide has the exact specs.
            </h2>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="shrink-0 rounded p-1 text-surface-fg-muted hover:text-surface-fg"
            aria-label="Back to exam list"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {selected.tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group flex items-start gap-3 rounded-lg border border-surface-border-subtle bg-surface-1 px-4 py-3 transition-colors hover:border-[var(--bt-saffron-ink)]"
            >
              <div className="flex-1">
                <p className="text-body-sm font-semibold text-surface-fg group-hover:text-[var(--bt-saffron-ink)]">
                  {t.name}
                </p>
                <p className="text-body-xs text-surface-fg-muted">{t.reason}</p>
              </div>
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-surface-fg-muted group-hover:text-[var(--bt-saffron-ink)]" aria-hidden />
            </Link>
          ))}
        </div>

        <Link
          href={selected.guide}
          className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-medium text-[var(--bt-saffron-ink)] hover:underline"
        >
          Full {selected.label} form guide
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-surface-border-subtle bg-surface-2 px-5 py-5">
      <p className="text-body-xs font-semibold uppercase tracking-widest text-[var(--bt-saffron-ink)]">
        For My Exam
      </p>
      <p className="mt-1 text-body-md font-semibold text-surface-fg">
        Which exam are you filling a form for?
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMS.map((exam) => (
          <button
            key={exam.label}
            type="button"
            onClick={() => setSelected(exam)}
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border-subtle bg-surface-1 px-3.5 py-1.5 text-body-sm font-medium text-surface-fg transition-colors hover:border-[var(--bt-saffron-ink)] hover:text-[var(--bt-saffron-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bt-saffron-ink)]"
          >
            <span aria-hidden>{exam.emoji}</span>
            {exam.label}
          </button>
        ))}
      </div>
    </section>
  );
}
