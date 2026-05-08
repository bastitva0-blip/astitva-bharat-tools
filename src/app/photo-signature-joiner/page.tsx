import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { ComingSoon } from "@/components/coming-soon";

export const metadata = {
  title: "Photo + Signature Joiner · BharatTools",
  description: "Combine a photo and signature into one image at portal-standard dimensions.",
};

export default function PhotoSignatureJoinerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="Photo + Signature Joiner"
        subtitle="Merge a photo and a signature image into a single file in the layout SSC, IBPS and similar portals require."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Photo + Signature Joiner" }]}
      />
      <ComingSoon
        description="Upload your photo and signature, pick a layout, and get a ready-to-upload image at portal-standard dimensions."
        highlights={[
          "Side-by-side or stacked layouts",
          "Auto-trims signature to content",
          "Optional KB target",
        ]}
      />
    </main>
  );
}
