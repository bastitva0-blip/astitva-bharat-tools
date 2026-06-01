import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { JpgToPdfForm } from "./jpg-to-pdf-form";

export const metadata = {
  title: "JPG / Image to PDF",
  description:
    "Combine one or many images into a single PDF. Reorder, rotate, choose A4 or Letter. Runs in your browser.",
  alternates: { canonical: "/jpg-to-pdf" },
};

export default async function JpgToPdfPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "JPG / Image to PDF",
          description:
            "Combine one or many images into a single PDF - reorder, rotate, choose A4 or Letter, portrait or landscape. Runs in your browser.",
          path: "/jpg-to-pdf",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "JPG / Image to PDF" }],
          steps: [
            { name: "Add images", text: "Drop one or many images (JPG, PNG, WebP)." },
            {
              name: "Reorder and rotate",
              text: "Use the controls to set the page order and rotate as needed.",
            },
            { name: "Pick page size", text: "A4 or Letter, portrait or landscape." },
            { name: "Build PDF", text: "Download the generated PDF." },
          ],
        })}
      />
      <PageHeader
        title={dict.jpgToPdf.title}
        subtitle={dict.jpgToPdf.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.jpgToPdf.breadcrumb }]}
      />
      <div className="mt-8">
        <JpgToPdfForm />
      </div>
    </main>
  );
}
