import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { PhotoSignatureJoinerForm } from "./photo-signature-joiner-form";

export const metadata = {
  title: "Photo + Signature Joiner · BharatTools",
  description:
    "Combine a photo and signature into one image at portal-standard dimensions. Side-by-side or stacked, with auto signature trimming.",
};

export default function PhotoSignatureJoinerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="Photo + Signature Joiner"
        subtitle="Merge a photo and a signature image into a single file in the layout SSC, IBPS and similar portals require."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Photo + Signature Joiner" }]}
      />
      <div className="mt-8">
        <PhotoSignatureJoinerForm />
      </div>
    </main>
  );
}
