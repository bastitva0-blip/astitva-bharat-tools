// Registry of form-filling guides.
//
// Each entry corresponds to a static page under src/app/form-guides/<slug>/.
// Adding a guide = add the page + append one entry here. The index page and
// the sitemap both read from this list.
//
// Keep `lastUpdatedAt` honest — it surfaces on the index card and matches the
// LAST_UPDATED constant in the guide page.

export interface FormGuide {
  /** URL slug — matches the folder name under src/app/form-guides/. */
  slug: string;
  /** Short display name shown on the card title, e.g. "JEE Main". */
  examName: string;
  /** Long-form name for SEO + accessibility. */
  fullName: string;
  /** One-line description for the index card and OG fallback. */
  description: string;
  /** One-line spec summary, e.g. "Photo 10–200 KB · Signature 4–30 KB". */
  specSummary: string;
  /** ISO date of last verification. */
  lastUpdatedAt: string;
  /** Authority host for the form (linked from the card footer). */
  authority: { name: string; url: string };
  /** Pre-selected sort: lower = earlier on the index. */
  order: number;
}

export const formGuides: FormGuide[] = [
  {
    slug: "jee-main",
    examName: "JEE Main",
    fullName: "Joint Entrance Examination (Main)",
    description:
      "Step-by-step guide to registering on the NTA portal, filling personal and academic details, uploading photo and signature at exact spec, and paying the fee.",
    specSummary: "Photo 10–200 KB · Signature 4–30 KB · 200×230 px",
    lastUpdatedAt: "2026-06-04",
    authority: { name: "NTA", url: "https://jeemain.nta.nic.in/" },
    order: 1,
  },
  {
    slug: "neet",
    examName: "NEET UG",
    fullName: "National Eligibility cum Entrance Test (UG)",
    description:
      "End-to-end walk-through of the NTA NEET application: registration, exam city choices, photo and signature uploads, postcard photo, thumb impressions, and category-specific fee payment.",
    specSummary: "Photo 10–200 KB · Postcard 50–300 KB · Signature 4–30 KB",
    lastUpdatedAt: "2026-06-04",
    authority: { name: "NTA", url: "https://neet.nta.nic.in/" },
    order: 2,
  },
  {
    slug: "upsc",
    examName: "UPSC",
    fullName: "Union Public Service Commission (CSE / IFS / CDS / NDA)",
    description:
      "4-card portal walkthrough on upsconline.nic.in — account creation, Universal Registration Number (URN), Common Application Form with live photo capture, exam-specific centre selection and ₹100 fee.",
    specSummary: "Photo 20–200 KB · Triple signature 20–100 KB · ID PDF 50–300 KB",
    lastUpdatedAt: "2026-06-06",
    authority: { name: "UPSC", url: "https://upsconline.nic.in/" },
    order: 3,
  },
  {
    slug: "rrb-alp",
    examName: "RRB ALP",
    fullName: "Railway Recruitment Board — Assistant Loco Pilot",
    description:
      "Six-phase walkthrough of rrbapply.gov.in — account creation with Aadhaar verification, RRB zone selection, education and CBT-2 trade, photo/signature uploads, fee payment with bank-refund setup, and confirmation page download.",
    specSummary: "Photo 20–50 KB · Signature 20–50 KB · SC/ST cert 50–100 KB",
    lastUpdatedAt: "2026-06-12",
    authority: { name: "RRB", url: "https://www.rrbapply.gov.in/" },
    order: 4,
  },
];

export function getFormGuide(slug: string): FormGuide | undefined {
  return formGuides.find((g) => g.slug === slug);
}
