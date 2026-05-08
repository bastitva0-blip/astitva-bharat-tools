import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { PhotoSignatureJoinerForm } from "./photo-signature-joiner-form";

export const metadata = {
  title: "Photo + Signature Joiner",
  description:
    "Combine a photo and signature into one image at portal-standard dimensions. Side-by-side or stacked, with auto signature trimming.",
  alternates: { canonical: "/photo-signature-joiner" },
};

export default function PhotoSignatureJoinerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Photo + Signature Joiner",
          description:
            "Merge a photo and signature image into a single file at portal-standard dimensions, side-by-side or stacked. Auto-trims the white border around the signature. Runs in your browser.",
          path: "/photo-signature-joiner",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Photo + Signature Joiner" }],
          steps: [
            {
              name: "Upload your photo and signature",
              text: "JPG or PNG; signature should be on white paper.",
            },
            {
              name: "Pick layout and size",
              text: "Side-by-side or stacked, with a portal-standard size or custom dimensions.",
            },
            {
              name: "Combine",
              text: "Auto-trim removes the white border around the signature so both fit cleanly.",
            },
            { name: "Download", text: "Save the merged JPG ready to upload." },
          ],
        })}
      />
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
