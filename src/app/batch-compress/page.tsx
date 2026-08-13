import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { BatchCompressForm } from "./batch-compress-form";

export const metadata: Metadata = {
  title: "Batch Image Compressor — Compress Multiple Photos at Once",
  description:
    "Upload up to 20 images, pick a KB target (20 KB, 50 KB, 100 KB, 200 KB), and compress them all in one go. Download each file. Runs in your browser — nothing uploaded.",
  alternates: { canonical: "/batch-compress" },
  keywords: [
    "batch image compressor", "compress multiple images", "bulk compress photos",
    "compress 10 photos at once", "batch resize photos", "multiple image compress online free",
  ],
};

export default async function BatchCompressPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: dict.common.home, href: "/" },
            { label: "Batch Image Compressor" },
          ]),
        ]}
      />

      <PageHeader
        title="Batch Image Compressor"
        subtitle="Compress up to 20 photos to the same KB target in one go. Pick 20 KB, 50 KB, 100 KB or 200 KB — all files processed in your browser, nothing uploaded."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Batch Image Compressor" },
        ]}
      />

      <div className="mt-8">
        <BatchCompressForm />
      </div>
    </main>
  );
}
