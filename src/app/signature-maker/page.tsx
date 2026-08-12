import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { SignatureMakerForm } from "./signature-maker-form";

export const metadata: Metadata = {
  title: "Signature Maker — Draw and Download a Signature Image",
  description:
    "Draw your signature on screen and download it as a transparent PNG or a white-background JPG, trimmed to the ink. No scanner, no printer, nothing uploaded.",
  alternates: { canonical: "/signature-maker" },
};

export default function SignatureMakerPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Signature Maker",
          description:
            "Draw a signature in the browser and export it as a transparent PNG or white-background JPG for form uploads.",
          path: "/signature-maker",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Signature Maker" }],
          steps: [
            { name: "Sign in the box", text: "Draw with a finger, stylus or mouse." },
            { name: "Pick ink and thickness", text: "Black or blue, fine to bold." },
            { name: "Choose the output", text: "Transparent PNG, or JPG flattened onto white." },
            { name: "Download", text: "The image is trimmed tight to the ink." },
          ],
          faqs: [
            {
              question: "Do I need a scanner to upload a signature to a government form?",
              answer:
                "No. Drawing the signature here produces the same kind of image file a scan would, without the paper step. If the portal specifically asks for a scanned wet signature, scan it instead — but for the common 'upload signature image' field, a drawn signature is a normal, accepted input.",
            },
            {
              question: "Should I download PNG or JPG?",
              answer:
                "Choose JPG for most Indian government portals — they usually accept JPG/JPEG only, and a transparent PNG can render as a black box in their preview. Choose PNG when you want to place the signature over a letterhead or a form you are composing yourself.",
            },
            {
              question: "My portal wants the signature under a specific KB size. What do I do?",
              answer:
                "Download the JPG here, then run it through the BharatTools Image Compressor with the portal's KB target — 20 KB for SSC, 50 KB for many NTA forms. Both steps run in your browser.",
            },
            {
              question: "Is my signature stored anywhere?",
              answer:
                "No. The strokes exist only in the page's memory and the image is created by your own browser. Reloading the page erases everything. Nothing is uploaded, logged, or kept.",
            },
          ],
        })}
      />
      <PageHeader
        title="Signature Maker"
        subtitle="Draw it once, download a clean image — transparent PNG or white-background JPG, trimmed to the ink."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Signature Maker" }]}
      />
      <div className="mt-8">
        <SignatureMakerForm />
      </div>
    </main>
  );
}
