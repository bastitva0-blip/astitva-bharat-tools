import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { ComingSoon } from "@/components/coming-soon";

export const metadata = {
  title: "JPG / Image to PDF · BharatTools",
  description: "Combine images into a PDF with optional KB compression.",
};

export default function JpgToPdfPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="JPG / Image to PDF"
        subtitle="Combine one or many images into a single PDF, with optional KB compression to fit portal upload limits."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "JPG / Image to PDF" }]}
      />
      <ComingSoon
        description="Drop images, reorder by drag-and-drop, pick page size and orientation, and target a specific KB if you need to."
        highlights={[
          "Drag-and-drop reordering",
          "A4 or Letter, portrait or landscape",
          "KB targets: 200 KB · 500 KB · 1 MB · 2 MB",
        ]}
      />
    </main>
  );
}
