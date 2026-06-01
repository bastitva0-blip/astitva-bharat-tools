import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PrintSheetForm } from "./print-sheet-form";

export const metadata = {
  title: "Print Sheet Generator",
  description:
    "Lay out passport-size photos on a 4×6 inch or A4 sheet with cutting guides. Print at home or any studio.",
  alternates: { canonical: "/print-sheet" },
};

export default async function PrintSheetPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Print Sheet Generator",
          description:
            "Lay out 6 to 8 passport-size photos on a 4×6 inch or A4 sheet with cutting guides. PDF output, optional client-side background removal. Runs in your browser.",
          path: "/print-sheet",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Print Sheet Generator" }],
          steps: [
            {
              name: "Upload a portrait",
              text: "Best with a passport-prepped JPG from the Exam Photo Resizer.",
            },
            {
              name: "Pick sheet and photo size",
              text: "A4 / 4×6 inch and passport / Aadhaar / 2×2 inch / custom.",
            },
            {
              name: "Optional: remove background",
              text: "Cuts the subject out and places it on a clean white tile. Runs on-device.",
            },
            {
              name: "Generate the PDF",
              text: "Download the PDF and print at 100% (Actual size) - do not 'fit to page'.",
            },
          ],
        })}
      />
      <PageHeader
        title={dict.printSheet.title}
        subtitle={dict.printSheet.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.printSheet.breadcrumb }]}
      />
      <div className="mt-8">
        <PrintSheetForm />
      </div>
    </main>
  );
}
