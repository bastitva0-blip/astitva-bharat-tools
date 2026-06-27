import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { ToolsBrowser } from "@/components/tools-browser";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import { tools } from "@/lib/tools";

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
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ label: "Home", href: "/" }, { label: dict.tools.indexTitle }]),
          collectionPageSchema({
            name: dict.tools.indexTitle,
            description: dict.tools.indexSubtitle,
            path: "/tools",
            items: liveTools.map((t) => ({ name: t.name, path: t.href })),
          }),
        ]}
      />
      <main className="mx-auto w-full max-w-6xl px-page-x py-10">
        <PageHeader
          title={dict.tools.indexTitle}
          subtitle={dict.tools.indexSubtitle}
          breadcrumbs={[{ label: "Home", href: "/" }, { label: dict.tools.indexTitle }]}
        />
        <div className="mt-ds-08">
          <ToolsBrowser />
        </div>
      </main>
      <Footer />
    </>
  );
}
