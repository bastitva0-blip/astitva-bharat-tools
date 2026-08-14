import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { ChequePrintForm } from "./cheque-print-form";

const PAGE_TITLE = "Cheque Print Tool — Fill & Print Indian Bank Cheque Layout Online";
const PAGE_DESCRIPTION =
  "Fill in cheque details — payee name, amount, date — and print a cheque-sized layout to place over a blank cheque. Amount in words auto-computed using Indian number system (lakh/crore). Free, runs in your browser, no signup.";
const PAGE_KEYWORDS = [
  "cheque print online",
  "cheque fill online india",
  "print cheque layout",
  "amount in words indian system",
  "cheque amount in words rupees",
  "how to fill cheque india",
  "cheque writing tool",
  "bank cheque print",
  "cheque lakh crore words",
  "SBI HDFC ICICI cheque print",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/cheque-print",
    languages: {
      "en-IN": "/cheque-print",
      "hi-IN": "/cheque-print",
      "x-default": "/cheque-print",
    },
  },
  openGraph: {
    type: "website",
    url: "/cheque-print",
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

export default async function ChequePrintPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Cheque Print Tool",
          description:
            "Fill in cheque details and print a cheque-sized layout to overlay on a blank cheque. Amount in words auto-computed using Indian number system.",
          path: "/cheque-print",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Cheque Print Tool" }],
          steps: [
            { name: "Enter cheque details", text: "Fill in the payee name, amount in numbers, date, and other fields." },
            { name: "Verify amount in words", text: "The amount in words is auto-computed using the Indian lakh/crore system — verify it before printing." },
            { name: "Print and overlay", text: "Print the cheque layout and align it over your blank cheque to transfer the details neatly." },
          ],
          featureList: [
            "Cheque-sized printable layout matching Indian bank cheque dimensions",
            "Amount in words auto-computed using Indian lakh/crore number system",
            "Date fields in DD / MM / YYYY box format",
            "Supports SBI, HDFC, ICICI, Axis, PNB, BOB, Canara, Kotak and other banks",
            "Live preview — updates as you type",
            "100% on-device — no upload, no signup, no data stored",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "How do I use the printed cheque layout?",
              answer:
                "Print the layout on plain paper. Then align and place it over your blank cheque — the printed text should line up with the cheque fields. You can also use it as a reference to write the cheque by hand.",
            },
            {
              question: "How is the amount in words computed?",
              answer:
                "The tool uses the Indian number system: ones, thousands, lakhs (1,00,000) and crores (1,00,00,000). For example, 1,50,000 becomes 'One Lakh Fifty Thousand Rupees Only'.",
            },
            {
              question: "Can I edit the amount in words manually?",
              answer:
                "Yes. The words field is auto-filled from the number you enter, but you can edit it manually if you need to adjust the text.",
            },
          ],
        })}
      />
      <PageHeader
        title="Cheque Print Tool"
        subtitle="Fill cheque details, auto-compute amount in words, and print a cheque-sized layout to overlay on a blank cheque."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "Cheque Print Tool" }]}
      />
      <div className="mt-8">
        <ChequePrintForm />
      </div>
    </main>
  );
}
