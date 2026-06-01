// Legacy re-export — document presets now live in src/lib/spec-db/data/document/*.
// Existing consumers (document-photo page, sitemap, etc.) keep importing from
// here; new code should read from `@/lib/spec-db` directly.

import { documentSpecs, getDocumentSpec, type PhotoSpec } from "@/lib/spec-db";

export type DocumentPreset = PhotoSpec;

export const documentPresets: DocumentPreset[] = documentSpecs;

export function getDocumentPreset(slug: string): DocumentPreset | undefined {
  return getDocumentSpec(slug);
}
