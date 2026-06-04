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
];

export function getFormGuide(slug: string): FormGuide | undefined {
  return formGuides.find((g) => g.slug === slug);
}
