import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ImageCompressForm } from "../image-compress-form";

export const metadata = {
  title: "Compress Image to Custom KB",
  description: "Enter any KB target and compress your image to it. Runs in your browser.",
  alternates: { canonical: "/image-compress/custom" },
};

export default function ImageCompressCustomPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Compress Image to Custom KB",
          description:
            "Enter any KB target and compress your image to it. Binary-search JPEG with auto-downscale. Runs in your browser.",
          path: "/image-compress/custom",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Image Compressor", href: "/image-compress" },
            { label: "Custom KB" },
          ],
          steps: [
            { name: "Upload an image", text: "JPG, PNG or WebP up to 25 MB." },
            { name: "Set the target", text: "Enter any KB value with the number input." },
            { name: "Compress", text: "We binary-search JPEG quality to land within ±5% of your target." },
            { name: "Download", text: "Save the JPG ready to upload." },
          ],
        })}
      />
      <PageHeader
        title="Compress Image to Custom KB"
        subtitle="Enter any kilobyte target - we'll get within ±5% of it. JPG output, runs in your browser."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Image Compressor", href: "/image-compress" },
          { label: "Custom KB" },
        ]}
      />
      <div className="mt-8">
        <ImageCompressForm slug="custom" />
      </div>
    </main>
  );
}
