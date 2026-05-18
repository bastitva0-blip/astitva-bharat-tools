import {
  breadcrumbSchema,
  faqPageSchema,
  howToSchema,
  softwareAppSchema,
  type BreadcrumbCrumb,
  type FaqEntry,
  type HowToStepInput,
} from "./schema";

export interface ToolPageSchemaInput {
  /** Display name, e.g. "UPSC Photo Resizer". */
  name: string;
  /** One-paragraph description used in SoftwareApplication. */
  description: string;
  /** Path on the site, e.g. "/photo-resize/upsc". */
  path: string;
  breadcrumbs: BreadcrumbCrumb[];
  /** HowTo steps describing the user flow. */
  steps: HowToStepInput[];
  /** ISO 8601 duration estimate; defaults to 1 minute. */
  totalTimeIso?: string;
  /** Bullet-style feature list surfaced to SoftwareApplication.featureList. */
  featureList?: string[];
  /** Finer SoftwareApplication subcategory (e.g. "PhotoEditingApplication"). */
  applicationSubCategory?: string;
  /** Keywords specific to this tool, merged with site-wide keywords elsewhere. */
  keywords?: string[];
  /** Optional FAQ entries surfaced as FAQPage rich result. */
  faqs?: FaqEntry[];
}

export function toolPageSchema(input: ToolPageSchemaInput): object[] {
  const out: object[] = [
    breadcrumbSchema(input.breadcrumbs),
    softwareAppSchema({
      name: input.name,
      description: input.description,
      path: input.path,
      featureList: input.featureList,
      applicationSubCategory: input.applicationSubCategory,
      keywords: input.keywords,
    }),
    howToSchema({
      name: `How to use ${input.name}`,
      description: input.description,
      steps: input.steps,
      totalTimeIso: input.totalTimeIso,
    }),
  ];
  if (input.faqs && input.faqs.length) {
    out.push(faqPageSchema(input.faqs));
  }
  return out;
}
