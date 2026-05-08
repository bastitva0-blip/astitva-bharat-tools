export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bharattools.devalok.dev"
).replace(/\/$/, "");

export const SITE_NAME = "BharatTools";
export const SITE_TAGLINE = "Har Sarkari form ka saathi";
export const SITE_DESCRIPTION =
  "Browser-only utilities for Indian government forms — exam photos at exact KB, signature merge, KB compression, print sheets, PDF tools. Files never leave your device.";
export const ORG_NAME = "BharatTools";

export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}
