import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { ComingSoon } from "@/components/coming-soon";

export const metadata = {
  title: "Document Photo Maker · BharatTools",
  description: "Identity-document photos at exact spec for Aadhaar, PAN, Passport, Voter ID, OCI.",
};

export default function DocumentPhotoPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <PageHeader
        title="Document Photo Maker"
        subtitle="Aadhaar, PAN, Indian Passport (ICAO), Voter ID, OCI — exact dimensions, KB and white background."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Document Photo Maker" }]}
      />
      <ComingSoon
        description="Pick the document type, drop a photo, and get a portal-ready image with the right pixel size, KB target and white background."
        highlights={[
          "Auto face-centring with on-device detection",
          "One-click white-background replacement (client-side ML)",
          "Optional print sheet output",
        ]}
      />
    </main>
  );
}
