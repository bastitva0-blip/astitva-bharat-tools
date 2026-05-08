import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { PrintSheetForm } from "./print-sheet-form";

export const metadata = {
  title: "Print Sheet Generator · BharatTools",
  description:
    "Lay out passport-size photos on a 4×6 inch or A4 sheet with cutting guides. Print at home or any studio.",
};

export default function PrintSheetPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="Print Sheet Generator"
        subtitle="Drop a portrait, pick the sheet and photo size — download a PDF with cut lines, ready to print at 100% scale."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Print Sheet Generator" }]}
      />
      <div className="mt-8">
        <PrintSheetForm />
      </div>
    </main>
  );
}
