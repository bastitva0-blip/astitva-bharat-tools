import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JpgToPdfForm } from "./jpg-to-pdf-form";

export const metadata = {
  title: "JPG / Image to PDF · BharatTools",
  description:
    "Combine one or many images into a single PDF. Reorder, rotate, choose A4 or Letter. Runs in your browser.",
};

export default function JpgToPdfPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="JPG / Image to PDF"
        subtitle="Combine images into one PDF, in the order you want. Files never leave your browser."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "JPG / Image to PDF" }]}
      />
      <div className="mt-8">
        <JpgToPdfForm />
      </div>
    </main>
  );
}
