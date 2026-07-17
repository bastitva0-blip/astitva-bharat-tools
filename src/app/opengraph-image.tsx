import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-template";

export const alt = "BharatTools · Har Sarkari form ka saathi";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogImage({
    title: "Har Sarkari form ka saathi",
    tagline:
      "Browser-only utilities for Indian government forms — exam photos, signatures, KB compression, print sheets, PDF tools.",
    iconColor: "accent",
  });
}
