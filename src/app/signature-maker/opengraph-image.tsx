import { ogImageForTool, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-template";

export const alt = "Signature Maker — BharatTools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogImageForTool("signature-maker");
}
