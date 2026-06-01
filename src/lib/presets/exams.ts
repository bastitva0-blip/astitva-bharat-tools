// Legacy re-export — exam presets now live in src/lib/spec-db/data/photo/*.
// Existing consumers (photo-resize page, sitemap, etc.) keep importing from
// here; new code should read from `@/lib/spec-db` directly.

import { getPhotoSpec, photoSpecs, type PhotoSpec } from "@/lib/spec-db";

export type ExamPreset = PhotoSpec;

export const examPresets: ExamPreset[] = photoSpecs;

export function getExamPreset(slug: string): ExamPreset | undefined {
  return getPhotoSpec(slug);
}
