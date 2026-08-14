import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { RentAgreementForm } from "./rent-agreement-form";

const PAGE_TITLE = "Rent Agreement Generator — Free Rental Agreement India, Print Ready";
const PAGE_DESCRIPTION =
  "Generate a standard Indian Leave and Licence (rent) agreement instantly. Fill in landlord, tenant, property and term details — get a print-ready 11-month rental agreement. Free, runs in your browser.";
const PAGE_KEYWORDS = [
  "rent agreement format india",
  "rental agreement generator online",
  "leave and licence agreement",
  "kiraya agreement",
  "11 month rent agreement",
  "rental agreement kaise banaye",
  "rent agreement online free",
  "landlord tenant agreement india",
  "rent agreement template india",
  "leave and licence agreement format",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/rent-agreement",
    languages: {
      "en-IN": "/rent-agreement",
      "hi-IN": "/rent-agreement",
      "x-default": "/rent-agreement",
    },
  },
  openGraph: {
    type: "website",
    url: "/rent-agreement",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default async function RentAgreementPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-7xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Rent Agreement Generator",
          description:
            "Generate a standard Indian Leave and Licence (rent) agreement instantly. Fill landlord, tenant, property and term details — get a print-ready 11-month rental agreement in seconds.",
          path: "/rent-agreement",
          breadcrumbs: [
            { label: dict.common.home, href: "/" },
            { label: "Rent Agreement Generator" },
          ],
          steps: [
            {
              name: "Fill party details",
              text: "Enter landlord and tenant names, addresses, Aadhaar and PAN.",
            },
            {
              name: "Set property and terms",
              text: "Add the property address, monthly rent, deposit, duration and maintenance responsibilities.",
            },
            {
              name: "Print or save as PDF",
              text: "Click Print — the form hides and the formatted Leave and Licence agreement is printed or saved.",
            },
          ],
          featureList: [
            "Standard Indian Leave and Licence (11-month) format",
            "Auto-fills security deposit as 2× rent",
            "Calculates agreement end date from start date and duration",
            "Converts rent and deposit amounts to words (Indian numbering)",
            "Maintenance responsibility split: Tenant / Landlord / Shared",
            "Lock-in period and notice period clauses",
            "Witness and signature section with stamp paper note",
            "Print / Save as PDF with one click — no upload, no signup",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is a Leave and Licence agreement the same as a rent agreement?",
              answer:
                "Yes, in most Indian states a Leave and Licence agreement is the standard form of rental agreement for residential and commercial premises. It grants the licensee the right to occupy the property for a fixed term without creating any tenancy rights, making it easier for the licensor to regain possession at the end of the term.",
            },
            {
              question: "Why is the agreement for 11 months and not 12?",
              answer:
                "An agreement of 12 months or more typically requires mandatory registration under the Registration Act and attracts higher stamp duty in most states. An 11-month agreement avoids compulsory registration (though voluntary registration is always advisable), reducing cost and paperwork. It can be renewed at the end of every 11-month period.",
            },
            {
              question: "Do I need to print this on stamp paper?",
              answer:
                "Yes. In India, a rent or Leave and Licence agreement must be executed on stamp paper of the value prescribed by the applicable State Stamp Act. The stamp duty amount varies by state and by the rent or deposit value. Consult a local notary or stamp vendor for the correct stamp paper value in your state.",
            },
            {
              question: "Is this agreement legally valid?",
              answer:
                "This tool generates a standard draft agreement for reference. It is strongly advisable to have the agreement reviewed by a qualified lawyer, executed on appropriate stamp paper, and registered with the local Sub-Registrar's office for full legal enforceability. BharatTools does not provide legal advice.",
            },
          ],
        })}
      />
      <PageHeader
        title="Rent Agreement Generator"
        subtitle="Fill in the details and get a standard Indian Leave and Licence agreement — ready to print or save as PDF."
        breadcrumbs={[
          { label: dict.common.home, href: "/" },
          { label: "Rent Agreement Generator" },
        ]}
      />
      <div className="mt-8">
        <RentAgreementForm />
      </div>
    </main>
  );
}
