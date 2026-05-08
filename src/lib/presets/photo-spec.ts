export interface PhotoSpecPreset {
  slug: string;
  name: string;
  fullName: string;
  dimensions: { widthPx: number; heightPx: number; widthCm?: number; heightCm?: number };
  kbRange: { min: number; max: number };
  format: "jpg";
  background: "white";
  notes?: string[];
  portalUrl?: string;
  lastVerified: string;
}
