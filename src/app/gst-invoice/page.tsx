import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { GstInvoiceForm } from "./gst-invoice-form";

const PAGE_TITLE = "GST Invoice Generator — Free GST Bill Maker, No Signup";
const PAGE_DESCRIPTION =
  "Generate GST-compliant tax invoices in your browser. Fill seller & buyer details, add line items with HSN codes, and get a professional A4 invoice with CGST/SGST/IGST split. Print or save as PDF. No signup, no upload, 100% free.";
const PAGE_KEYWORDS = [
  "gst invoice generator",
  "gst bill format",
  "gst invoice online free",
  "gst invoice maker india",
  "gstin invoice",
  "gst bill banana",
  "tax invoice format india",
  "gst bill generator free",
  "gst invoice pdf download",
  "gst billing software free",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/gst-invoice",
    languages: {
      "en-IN": "/gst-invoice",
      "hi-IN": "/gst-invoice",
      "x-default": "/gst-invoice",
    },
  },
  openGraph: {
    type: "website",
    url: "/gst-invoice",
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

export default async function GstInvoicePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict; // locale loaded for future i18n use

  return (
    <main className="mx-auto w-full max-w-7xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "GST Invoice Generator",
          description:
            "Create GST-compliant tax invoices in your browser. Add seller and buyer details, line items with HSN/SAC codes, and instantly get a professional A4 invoice showing CGST/SGST or IGST breakdowns. Print or save as PDF — no signup required.",
          path: "/gst-invoice",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "GST Invoice Generator" },
          ],
          steps: [
            { name: "Fill seller & buyer details", text: "Enter business names, GSTINs, addresses and states for both parties." },
            { name: "Add line items", text: "Add products or services with HSN/SAC codes, quantity, rate and GST rate." },
            { name: "Print or save as PDF", text: "Click Print / Save as PDF to get a professional A4 GST invoice." },
          ],
          featureList: [
            "Live invoice preview updates as you type",
            "CGST + SGST for intra-state, IGST for inter-state supply — automatic",
            "Amount in words in Indian number system",
            "HSN/SAC code fields for every line item",
            "Multiple GST rates (0%, 5%, 12%, 18%, 28%) per line",
            "Print to PDF via browser — no server upload",
            "No signup, no watermark, completely free",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is this GST invoice generator free?",
              answer:
                "Yes, completely free. There is no signup, no watermark and no file upload. Everything runs in your browser.",
            },
            {
              question: "Does it calculate CGST and SGST separately?",
              answer:
                "Yes. If the seller's state and place of supply match, the tool shows CGST + SGST split equally. If they differ, it shows IGST instead.",
            },
            {
              question: "Can I save the invoice as a PDF?",
              answer:
                "Click 'Print / Save as PDF', then in the print dialog choose 'Save as PDF' as the destination. The invoice is formatted for A4 paper with print-optimised styles.",
            },
            {
              question: "What is an HSN or SAC code?",
              answer:
                "HSN (Harmonised System of Nomenclature) codes classify goods and SAC (Services Accounting Code) codes classify services for GST purposes. Both are required on GST invoices above certain turnover thresholds.",
            },
          ],
        })}
      />
      <PageHeader
        title="GST Invoice Generator"
        subtitle="Fill in your details, add items, and get a print-ready GST tax invoice. Runs entirely in your browser — no signup, no upload."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "GST Invoice Generator" }]}
      />
      <div className="mt-8">
        <GstInvoiceForm />
      </div>
    </main>
  );
}
