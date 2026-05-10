import { ogImageForTool, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-template";

export const alt = "Quick Send — BharatTools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogImageForTool("quick-send");
}
