"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useT } from "@/i18n/provider";
import { fire } from "@/lib/analytics";

const CONFIRMATION_MS = 2500;

interface DownloadBarProps {
  url: string;
  filename: string;
  toolSlug: string;
  outputType: string;
  label?: string;
  secondaryActions?: ReactNode;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
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
  size = "lg",
}: DownloadBarProps) {
  const dict = useT();
  const text = label ?? dict.common.download;
  const [downloaded, setDownloaded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // A fresh result (new url) should show the plain CTA again, not a stale
  // "Downloaded" confirmation from a previous run. Reset during render
  // (React's recommended pattern) rather than in an effect.
  const [prevUrl, setPrevUrl] = useState(url);
  if (url !== prevUrl) {
    setPrevUrl(url);
    setDownloaded(false);
  }

  const onClick = () => {
    fire("download_click", { tool_id: toolSlug, output_type: outputType });
    setDownloaded(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDownloaded(false), CONFIRMATION_MS);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="solid" size={size} fullWidth={fullWidth}>
        <a href={url} download={filename} onClick={onClick}>
          {downloaded ? (
            <>
              <Check className="mr-1.5 size-4" aria-hidden />
              Downloaded
            </>
          ) : (
            text
          )}
        </a>
      </Button>
      {secondaryActions}
    </div>
  );
}
