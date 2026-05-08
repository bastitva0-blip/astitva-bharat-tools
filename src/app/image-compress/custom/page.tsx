import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { ImageCompressForm } from "../image-compress-form";

export const metadata = {
  title: "Compress Image to Custom KB · BharatTools",
  description: "Enter any KB target and compress your image to it. Runs in your browser.",
};

export default function ImageCompressCustomPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="Compress Image to Custom KB"
        subtitle="Enter any kilobyte target — we'll get within ±5% of it. JPG output, runs in your browser."
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
