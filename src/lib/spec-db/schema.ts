// Spec DB schema (base-infrastructure-plan §1.2).
//
// This is the data layer for portal-required photo/document specs. Shape is
// designed to be lifted into `@bharattools/spec-db` (per cli-mcp-spec §5) so
// CLI/MCP can reuse it. Until then it lives in-app.
//
// Runtime validation is a hand-rolled assert — intentionally avoiding a `zod`
// dependency until that call is greenlit (cf. engineering-decisions-for-rudra.md).

export type SpecCategory = "photo" | "document";

export type SpecFormat = "jpg" | "png";

export type SpecBackground = "white" | "light-blue" | "off-white";

export interface SpecDimensions {
  widthPx: number;
  heightPx: number;
  widthCm?: number;
  heightCm?: number;
}

export interface SpecKbRange {
  min: number;
  max: number;
}

export interface PhotoSpec {
  slug: string;
  name: string;
  fullName: string;
  category: SpecCategory;
  dimensions: SpecDimensions;
  kbRange: SpecKbRange;
  format: SpecFormat;
  background: SpecBackground;
  notes?: string[];
  portalUrl?: string;
  officialSource?: string;
  lastVerifiedAt: string;
}

export interface SpecDbVersion {
  version: string;
  lastVerified: Record<string, string>;
}

const REQUIRED_KEYS = [
  "slug",
  "name",
  "fullName",
  "category",
  "dimensions",
  "kbRange",
  "format",
  "background",
  "lastVerifiedAt",
] as const;

export function assertPhotoSpec(input: unknown, source: string): asserts input is PhotoSpec {
  if (!input || typeof input !== "object") {
    throw new Error(`spec-db: ${source} is not an object`);
  }
  const r = input as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (!(key in r)) throw new Error(`spec-db: ${source} missing required key "${key}"`);
  }
  const dim = r.dimensions as Record<string, unknown>;
  if (typeof dim.widthPx !== "number" || typeof dim.heightPx !== "number") {
    throw new Error(`spec-db: ${source} dimensions.widthPx/heightPx must be numbers`);
  }
  const kb = r.kbRange as Record<string, unknown>;
  if (typeof kb.min !== "number" || typeof kb.max !== "number" || kb.min > kb.max) {
    throw new Error(`spec-db: ${source} kbRange invalid`);
  }
  if (r.category !== "photo" && r.category !== "document") {
    throw new Error(`spec-db: ${source} category must be "photo" | "document"`);
  }
}
