import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { QrScanForm } from "./qr-scan-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "QR Code Scanner — Camera or image, in your browser",
  description:
    "Scan a QR code with your camera or by dropping a photo of one. Decodes UPI, URLs, phone numbers and text — nothing uploaded.",
  alternates: { canonical: "/qr-scan" },
};

export default function QrScanPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "QR Code Scanner",
          description:
            "Decode any QR code from your camera or an image, entirely in your browser.",
          path: "/qr-scan",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "QR Code Scanner" },
          ],
          steps: [
            { name: "Pick a mode", text: "Use the camera, or drop an image with a QR." },
            { name: "Aim or upload", text: "Hold the QR in frame, or drop a saved photo." },
            { name: "Read the result", text: "Decoded text appears below — copy it or open the URL." },
          ],
        })}
      />
      <PageHeader
        title="QR Code Scanner"
        subtitle="Camera or image. Decodes UPI, URLs, phone numbers and text. Nothing uploaded."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "QR Code Scanner" }]}
      />
      <div className="mt-8">
        <QrScanForm />
      </div>
    </main>
  );
}
