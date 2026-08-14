import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { AadhaarMaskForm } from "./aadhaar-mask-form";

export const metadata: Metadata = {
  title: "Aadhaar Masking — Redact Before You Share",
  description:
    "Black out the Aadhaar number on your card before uploading it to any portal. Draw redaction bars directly on the image — nothing leaves your browser.",
  alternates: { canonical: "/aadhaar-mask" },
  keywords: [
    "aadhaar masking",
    "aadhaar redaction",
    "hide aadhaar number",
    "aadhaar card black out",
    "aadhaar privacy",
    "redact aadhaar",
    "aadhaar image editor",
    "uidai masked aadhaar",
  ],
};

export default async function AadhaarMaskPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={[
          breadcrumbSchema([
            { label: dict.common.home, href: "/" },
            { label: "Aadhaar Masking" },
          ]),
          toolPageSchema({
            name: "Aadhaar Masking",
            description:
              "Black out the Aadhaar number on your card before uploading it to any portal. Draw redaction bars directly on the image — nothing leaves your browser.",
            path: "/aadhaar-mask",
            breadcrumbs: [
              { label: "Home", href: "/" },
              { label: "Aadhaar Masking" },
            ],
            steps: [
              {
                name: "Upload your Aadhaar image",
                text: "Front or back, JPG or PNG",
              },
              {
                name: "Draw over the number",
                text: "Drag to draw a black bar over the 12-digit number",
              },
              {
                name: "Download masked copy",
                text: "Save a redacted PNG, nothing uploaded",
              },
            ],
          }),
        ]}
      />

      <PageHeader
        title="Aadhaar Masking — Redact Before You Share"
        subtitle="Draw redaction bars directly on your Aadhaar image to black out the 12-digit number before uploading to any portal."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Aadhaar Masking" },
        ]}
      />

      <p className="mt-2 text-body-xs text-surface-fg-muted">
        Your Aadhaar image never leaves your device.
      </p>

      <div className="mt-8">
        <AadhaarMaskForm />
      </div>
    </main>
  );
}
