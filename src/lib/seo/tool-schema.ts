import {
  breadcrumbSchema,
  howToSchema,
  softwareAppSchema,
  type BreadcrumbCrumb,
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
}

export function toolPageSchema(input: ToolPageSchemaInput): object[] {
  return [
    breadcrumbSchema(input.breadcrumbs),
    softwareAppSchema({
      name: input.name,
      description: input.description,
      path: input.path,
    }),
    howToSchema({
      name: `How to use ${input.name}`,
      description: input.description,
      steps: input.steps,
      totalTimeIso: input.totalTimeIso,
    }),
  ];
}
