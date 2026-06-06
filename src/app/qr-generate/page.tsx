import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { QrGenerateForm } from "./qr-generate-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "QR Code Generator — URL, UPI, Contact",
  description:
    "Generate a clean QR code for a URL, UPI ID, phone number or plain text. PNG download. Made in your browser — nothing uploaded.",
  alternates: { canonical: "/qr-generate" },
};

export default function QrGeneratePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "QR Code Generator",
          description: "Create QR codes for URLs, UPI IDs, contacts and plain text in your browser.",
          path: "/qr-generate",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "QR Code Generator" },
          ],
          steps: [
            { name: "Pick a content type", text: "URL, UPI ID, phone, or free text." },
            { name: "Enter the value", text: "Live preview updates as you type." },
            { name: "Download", text: "Save a high-resolution PNG." },
          ],
        })}
      />
      <PageHeader
        title="QR Code Generator"
        subtitle="URL, UPI ID, phone or plain text. PNG download. Made in your browser."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "QR Code Generator" }]}
      />
      <div className="mt-8">
        <QrGenerateForm />
      </div>
    </main>
  );
}
