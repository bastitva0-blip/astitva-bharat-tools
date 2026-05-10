import { ImageResponse } from "next/og";
import { toolCategories, tools, type Tool } from "@/lib/tools";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type Palette = { bg: string; fg: string; soft: string };

const PALETTES: Record<Tool["iconColor"], Palette> = {
  accent: { bg: "#0090ff", fg: "#003a75", soft: "#e1f0ff" },
  info: { bg: "#0091ff", fg: "#00254d", soft: "#e0f2ff" },
  success: { bg: "#30a46c", fg: "#193b2d", soft: "#dff3e6" },
  warning: { bg: "#f5a524", fg: "#4a2900", soft: "#fff4d5" },
  error: { bg: "#e5484d", fg: "#641723", soft: "#fee4e2" },
  neutral: { bg: "#8b8d98", fg: "#1c2024", soft: "#e4e4e9" },
};

interface OgInput {
  title: string;
  tagline: string;
  category?: string;
  iconColor?: Tool["iconColor"];
}

export function ogImage({ title, tagline, category, iconColor = "accent" }: OgInput) {
  const palette = PALETTES[iconColor];
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, #ffffff 0%, ${palette.soft} 100%)`,
          padding: 80,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: "#1c2024",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: palette.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: -0.8,
              color: "#1c2024",
            }}
          >
            BharatTools
          </span>
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flexGrow: 1 }} />

        {/* Category pill */}
        {category && (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: palette.bg,
              color: "white",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            {category}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2.5,
            marginBottom: 28,
            color: palette.fg,
          }}
        >
          {title}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 36,
            lineHeight: 1.35,
            color: "#4a525a",
            maxWidth: "82%",
          }}
        >
          {tagline}
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            color: "#7e858d",
          }}
        >
          bharattools.devalok.dev
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

export function ogImageForTool(slug: string) {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) {
    throw new Error(`ogImageForTool: tool "${slug}" not found in tools registry`);
  }
  const category = toolCategories.find((c) => c.id === tool.category);
  return ogImage({
    title: tool.name,
    tagline: tool.tagline,
    iconColor: tool.iconColor,
    category: category?.label,
  });
}
