export interface CompressPreset {
  slug: string;
  label: string;
  targetKb: number;
  toleranceKb: number;
}

export const compressPresets: CompressPreset[] = [
  { slug: "20kb", label: "20 KB", targetKb: 20, toleranceKb: 2 },
  { slug: "50kb", label: "50 KB", targetKb: 50, toleranceKb: 5 },
  { slug: "100kb", label: "100 KB", targetKb: 100, toleranceKb: 5 },
  { slug: "200kb", label: "200 KB", targetKb: 200, toleranceKb: 10 },
  { slug: "500kb", label: "500 KB", targetKb: 500, toleranceKb: 25 },
  { slug: "1mb", label: "1 MB", targetKb: 1024, toleranceKb: 50 },
  { slug: "2mb", label: "2 MB", targetKb: 2048, toleranceKb: 100 },
];

export function getCompressPreset(slug: string): CompressPreset | undefined {
  return compressPresets.find((p) => p.slug === slug);
}
