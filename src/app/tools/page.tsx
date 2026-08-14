import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { ToolsBrowser } from "@/components/tools-browser";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import { tools, toolCategories } from "@/lib/tools";

export const metadata = {
  title: "All tools — every BharatTools workflow on one page",
  description:
    "Browse and search every BharatTools utility — exam photo resizers, KB-target compressors, document photo makers, PDF tools, print-shop tools and more. Browser-only, no signup.",
  alternates: { canonical: "/tools" },
};

export default async function ToolsIndexPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const liveTools = tools.filter((t) => t.status === "live");

  const categoryCounts = toolCategories.map((cat) => ({
    id: cat.id,
    label: (dict.categories as Record<string, string>)[cat.id] ?? cat.label,
    count: liveTools.filter((t) => t.category === cat.id).length,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ label: "Home", href: "/" }, { label: "All Tools" }]),
          collectionPageSchema({
            name: dict.tools.indexTitle,
            description: dict.tools.indexSubtitle,
            path: "/tools",
            items: liveTools.map((t) => ({ name: t.name, path: t.href })),
          }),
        ]}
      />

      {/* Page hero */}
      <div className="border-b border-surface-border-subtle bg-surface-2">
        <div className="mx-auto w-full max-w-6xl px-page-x py-12 md:py-16">
          <p className="text-body-xs font-semibold uppercase tracking-widest text-[var(--bt-saffron-ink,var(--orange-11))]">
            {liveTools.length} tools · browser-only · no upload
          </p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-black tracking-tighter text-surface-fg md:text-6xl">
            Every tool, on your device.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-surface-fg-muted">
            Exam photos, PDFs, Indian docs, design utilities — all run in your browser. Files never leave your device.
          </p>

          {/* Category quick-jump */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categoryCounts.map(({ id, label, count }) => (
              <a
                key={id}
                href={`#cat-${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-surface-border-subtle bg-surface-1 px-4 py-1.5 text-body-sm font-medium text-surface-fg transition-colors hover:border-surface-border hover:bg-surface-base"
              >
                {label}
                <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-body-xs font-semibold tabular-nums text-surface-fg-muted">
                  {count}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-page-x py-10">
        <ToolsBrowser />
      </main>
      <Footer />
    </>
  );
}
