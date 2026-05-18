import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { toolCategories, tools, type Tool } from "@/lib/tools";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type Palette = { bg: string; fg: string; soft: string; ink: string };

// Hex equivalents of @devalok/shilp-sutra light-mode primitives:
//   accent  → --pink-3/9/11/12
//   info    → --blue-3/9/11/12
//   success → --green-3/9/11/12
//   warning → --amber-bright-3/9/11/12
//   error   → --red-3/9/11/12
//   neutral → --neutral-3/9/11/12
// Sourced from node_modules/@devalok/shilp-sutra/dist/tokens/{primitives,semantic}.css.
// Hardcoded because Satori (the engine behind next/og) renders without our CSS layer.
const PALETTES: Record<Tool["iconColor"], Palette> = {
  accent: { soft: "#fce7f3", bg: "#db2777", fg: "#9d174d", ink: "#831843" },
  info: { soft: "#dbeafe", bg: "#2563eb", fg: "#1e3a8a", ink: "#172554" },
  success: { soft: "#dcfce7", bg: "#16a34a", fg: "#14532d", ink: "#052e16" },
  warning: { soft: "#fef3c7", bg: "#f59e0b", fg: "#92400e", ink: "#451a03" },
  error: { soft: "#fee2e2", bg: "#dc2626", fg: "#991b1b", ink: "#450a0a" },
  neutral: { soft: "#e5e7eb", bg: "#525252", fg: "#262626", ink: "#171717" },
};

const SURFACE = "#fafaf9";
const SURFACE_FG = "#1c2024";
const SURFACE_FG_MUTED = "#5b6168";
const SURFACE_FG_SUBTLE = "#8a9099";

let logoCache: string | null = null;
async function getLogoDataUrl(): Promise<string | null> {
  if (logoCache) return logoCache;
  try {
    const file = await readFile(
      join(process.cwd(), "public", "android-chrome-512x512.png"),
    );
    logoCache = `data:image/png;base64,${file.toString("base64")}`;
    return logoCache;
  } catch {
    return null;
  }
}

interface OgInput {
  title: string;
  tagline: string;
  category?: string;
  iconColor?: Tool["iconColor"];
}

export async function ogImage({
  title,
  tagline,
  category,
  iconColor = "accent",
}: OgInput) {
  const palette = PALETTES[iconColor];
  const logoSrc = await getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${SURFACE} 0%, ${palette.soft} 100%)`,
          padding: 80,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: SURFACE_FG,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- Satori (next/og) renders without next/image
            <img
              src={logoSrc}
              width={64}
              height={64}
              style={{ borderRadius: 14 }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: palette.bg,
              }}
            />
          )}
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: -0.8,
              color: SURFACE_FG,
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
            color: palette.ink,
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
            color: SURFACE_FG_MUTED,
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
            color: SURFACE_FG_SUBTLE,
          }}
        >
          bharattools.app
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

export async function ogImageForTool(slug: string) {
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
