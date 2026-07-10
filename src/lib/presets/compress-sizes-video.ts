export interface VideoCompressPreset {
  slug: string;
  label: string;
  targetMb: number;
}

export const videoCompressPresets: VideoCompressPreset[] = [
  { slug: "10mb", label: "10 MB", targetMb: 10 },
  { slug: "25mb", label: "25 MB", targetMb: 25 },
  { slug: "50mb", label: "50 MB", targetMb: 50 },
  { slug: "100mb", label: "100 MB", targetMb: 100 },
];

export function getVideoCompressPreset(slug: string): VideoCompressPreset | undefined {
  return videoCompressPresets.find((p) => p.slug === slug);
}
