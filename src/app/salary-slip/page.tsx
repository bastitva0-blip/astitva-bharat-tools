import type { Metadata } from "next";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { JsonLd } from "@/components/json-ld";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { toolPageSchema } from "@/lib/seo/tool-schema";
import { SalarySlipForm } from "./salary-slip-form";

const PAGE_TITLE = "Salary Slip Generator — Free Payslip Maker, No Signup";
const PAGE_DESCRIPTION =
  "Generate professional salary slips instantly. Fill in company and employee details, earnings and deductions — auto-computes gross pay, deductions and net pay in words. Print or save as PDF free, no signup required.";
const PAGE_KEYWORDS = [
  "salary slip generator",
  "payslip maker online free",
  "salary slip format india",
  "monthly salary slip",
  "payslip generator india",
  "salary slip download",
  "free salary slip maker",
  "payroll slip generator",
  "employee salary slip",
  "salary slip with PF",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: {
    canonical: "/salary-slip",
    languages: {
      "en-IN": "/salary-slip",
      "hi-IN": "/salary-slip",
      "x-default": "/salary-slip",
    },
  },
  openGraph: {
    type: "website",
    url: "/salary-slip",
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

export default async function SalarySlipPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <main className="mx-auto w-full max-w-6xl px-page-x py-10">
      <JsonLd
        data={toolPageSchema({
          name: "Salary Slip Generator",
          description:
            "Generate professional Indian salary slips instantly. Enter company details, employee info, earnings and deductions — the tool auto-computes gross pay, total deductions and net pay (with amount in words). Print or save as PDF, fully browser-side with no upload.",
          path: "/salary-slip",
          breadcrumbs: [{ label: "Home", href: "/" }, { label: "Salary Slip Generator" }],
          steps: [
            { name: "Enter company and employee details", text: "Fill in company name, logo, address and employee information including pay period." },
            { name: "Add earnings and deductions", text: "Enter salary components — Basic, HRA, allowances, PF (auto-computed at 12% of basic), professional tax and income tax." },
            { name: "Print or save as PDF", text: "Review the live preview and click Print / Save as PDF. The browser's print dialog lets you save as PDF directly." },
          ],
          featureList: [
            "Live preview updates as you type",
            "Auto-computes Gross Earnings, Total Deductions and Net Pay",
            "Net Pay in words (Indian number system)",
            "PF auto-calculated at 12% of Basic Salary",
            "Add or remove custom earnings and deductions rows",
            "Company logo upload support",
            "Standard Indian payslip format",
            "Print-optimised layout via window.print()",
            "100% browser-side — no upload, no signup",
          ],
          applicationSubCategory: "UtilitiesApplication",
          keywords: PAGE_KEYWORDS,
          faqs: [
            {
              question: "Is this salary slip legally valid in India?",
              answer:
                "This tool generates a standard payslip format widely used by Indian employers. For legal validity, the slip should be issued on company letterhead and authorised by HR or the employer. The computer-generated slip is accepted by most banks and government offices when stamped or signed by an authorised signatory.",
            },
            {
              question: "How is PF calculated in the salary slip?",
              answer:
                "The tool automatically calculates the Employee Provident Fund (EPF) contribution at 12% of the Basic Salary, which is the standard rate prescribed by the EPFO. You can edit this value manually if your company uses a different basis.",
            },
            {
              question: "Can I save the salary slip as a PDF?",
              answer:
                "Yes. Click 'Print / Save as PDF' and in the browser print dialog choose 'Save as PDF' as the destination. The form is hidden during print so only the slip appears in the PDF.",
            },
          ],
        })}
      />
      <PageHeader
        title={dict.salarySlip.title}
        subtitle={dict.salarySlip.subtitle}
        breadcrumbs={[{ label: dict.common.home, href: "/" }, { label: dict.salarySlip.breadcrumb }]}
      />
      <div className="mt-8">
        <SalarySlipForm />
      </div>
    </main>
  );
}
