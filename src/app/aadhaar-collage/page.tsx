import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { AadhaarCollageForm } from "./aadhaar-collage-form";
import { toolPageSchema } from "@/lib/seo/tool-schema";

export const metadata: Metadata = {
  title: "Aadhaar Front + Back Collage — One Page",
  description:
    "Combine the front and back of an Aadhaar card on a single A4 sheet — ready for portals that ask for both sides as one upload. Built in your browser.",
  alternates: { canonical: "/aadhaar-collage" },
};

export default function AadhaarCollagePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Aadhaar Front + Back Collage",
          description:
            "Stack the front and back of an Aadhaar card on a single A4 page for portal uploads.",
          path: "/aadhaar-collage",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "Aadhaar Collage" },
          ],
          steps: [
            { name: "Upload both sides", text: "Front first, then back." },
            { name: "Arrange", text: "We stack them vertically on A4." },
            { name: "Download", text: "Save a single page ready for upload." },
          ],
        })}
      />
      <PageHeader
        title="Aadhaar Front + Back on One Page"
        subtitle="Both sides on a single A4 — ready for portals that ask for one upload."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Aadhaar Collage" }]}
      />
      <div className="mt-8">
        <AadhaarCollageForm />
      </div>
    </main>
  );
}
