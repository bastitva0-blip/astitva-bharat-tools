// Localized tool card text — name / tagline / description per locale.
// Reads `dict.tools.<slug>` and falls back to the registry's hardcoded
// English strings if the entry is missing (lets tools ship before
// translations land without breaking the card render).

import type { Dictionary } from "@/i18n/server";
import type { Tool } from "@/lib/tools";

export interface ToolText {
  name: string;
  tagline: string;
  description: string;
}

export function getToolText(tool: Tool, dict: Dictionary): ToolText {
  const entry = (dict.toolText as Record<string, ToolText | undefined>)[tool.slug];
  return {
    name: entry?.name ?? tool.name,
    tagline: entry?.tagline ?? tool.tagline,
    description: entry?.description ?? tool.description,
  };
}
