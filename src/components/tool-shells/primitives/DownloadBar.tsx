"use client";

import type { ReactNode } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics";

interface DownloadBarProps {
  url: string;
  filename: string;
  toolSlug: string;
  outputType: string;
  label?: string;
  secondaryActions?: ReactNode;
  fullWidth?: boolean;
}

// Standardised primary-download CTA used by every tool shell
// (base-infrastructure-plan §3). Owns the `download_click` analytics fire and
// the `dict.common.download` default label so individual shells don't repeat
// the pattern.
export function DownloadBar({
  url,
  filename,
  toolSlug,
  outputType,
  label,
  secondaryActions,
  fullWidth = false,
}: DownloadBarProps) {
  const dict = useT();
  const text = label ?? dict.common.download;

  const onClick = () => {
    fire("download_click", { tool_id: toolSlug, output_type: outputType });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="solid" size="lg" fullWidth={fullWidth}>
        <a href={url} download={filename} onClick={onClick}>
          {text}
        </a>
      </Button>
      {secondaryActions}
    </div>
  );
}
