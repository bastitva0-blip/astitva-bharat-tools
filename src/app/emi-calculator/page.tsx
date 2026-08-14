import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { EmiCalculatorForm } from "./emi-calculator-form";

const PAGE_TITLE = "EMI Calculator — Home, Car & Personal Loans";
const PAGE_DESCRIPTION =
  "Calculate your monthly EMI for home loans, car loans, and personal loans instantly. See total interest, total payment, and a full amortization schedule. Free, browser-only.";
const PAGE_KEYWORDS = [
  "EMI calculator",
  "loan EMI",
  "home loan EMI",
  "car loan EMI",
  "personal loan EMI",
  "amortization table",
  "interest calculator India",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/emi-calculator",
    languages: {
      "en-IN": "/emi-calculator",
      "hi-IN": "/emi-calculator",
      "x-default": "/emi-calculator",
    },
  },
  openGraph: {
    type: "website",
    url: "/emi-calculator",
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

export default async function EmiCalculatorPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  void dict;
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "EMI Calculator",
          description: PAGE_DESCRIPTION,
          path: "/emi-calculator",
          breadcrumbs: [
            { label: "Home", href: "/" },
            { label: "EMI Calculator" },
          ],
          steps: [
            { name: "Enter loan details", text: "Input the loan amount, annual interest rate, and tenure in months or years." },
            { name: "Click Calculate", text: "The tool instantly computes your monthly EMI, total interest, and total payable amount." },
            { name: "Review amortization", text: "Expand the month-by-month table to see how each payment splits between principal and interest." },
          ],
          featureList: [
            "Instant EMI calculation using standard formula",
            "Principal vs interest pie chart",
            "Full amortization schedule",
            "Indian number formatting (lakhs/crores)",
            "Toggle tenure between months and years",
          ],
          applicationSubCategory: "FinanceApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "What is EMI?",
              answer:
                "EMI (Equated Monthly Instalment) is a fixed payment you make to your lender every month to repay a loan. Each EMI covers a portion of the principal and the interest accrued.",
            },
            {
              question: "How is EMI calculated?",
              answer:
                "EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of months.",
            },
            {
              question: "Does this calculator work for home, car, and personal loans?",
              answer:
                "Yes. The EMI formula is the same for all loan types. Simply enter the correct loan amount, rate, and tenure for your specific loan.",
            },
            {
              question: "Is my data stored anywhere?",
              answer:
                "No. All calculations happen locally in your browser. Nothing is sent to any server.",
            },
          ],
        })}
      />
      <PageHeader
        title="EMI Calculator"
        subtitle="Home, car, or personal loan — get your monthly EMI, total interest, and full amortization table."
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: "EMI Calculator" }]}
      />
      <div className="mt-8">
        <EmiCalculatorForm />
      </div>
    </main>
  );
}
