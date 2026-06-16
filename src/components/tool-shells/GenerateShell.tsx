"use client";

import { useCallback, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { useT } from "@/i18n/provider";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { usePipeline } from "@/lib/pipeline";
import { useBlobUrl } from "@/lib/processing/kernel";
import type { Tool } from "@/lib/tools";
import { DownloadBar, PaywallPitch, ShellChrome } from "./primitives";

export interface GenerateResult {
  blob: Blob;
  bytes: number;
}

interface GenerateShellProps<TConfig> {
  tool: Tool;
  /** The config UI — owned by the page, since shape varies per tool. */
  renderConfig: (args: { config: TConfig; setConfig: (next: TConfig) => void }) => React.ReactNode;
  /** Live preview rendered alongside the config — pure render of config. */
  renderLivePreview: (config: TConfig) => React.ReactNode;
  /** Initial config. */
  initialConfig: TConfig;
  /** Submit label, e.g. "Download QR PNG". */
  submitLabel: string;
  /** Build the output. */
  onProcess: (config: TConfig) => Promise<GenerateResult>;
  /** Download filename. */
  outputFilename: (config: TConfig) => string;
  /** Output MIME for analytics. */
  outputType: string;
  /** Disable submit until config is valid. */
  isReady?: (config: TConfig) => boolean;
  /** Hide submit + show coming-soon banner. */
  comingSoon?: boolean;
}

// GenerateShell — base-infrastructure-plan §3.
//
// Distinct UI feel: there is NO file picker. Config is the whole input. We
// split the layout into a config panel (left) + live preview (right), so
// users see the output shape change as they type. Submit is "Download" —
// the user is generating the artefact, not transforming an existing one.
//
// The shell stays generic over the config shape; pages pass typed config +
// renderConfig/renderLivePreview/onProcess closures.
export function GenerateShell<TConfig>({
  tool,
  renderConfig,
  renderLivePreview,
  initialConfig,
  submitLabel,
  onProcess,
  outputFilename,
  outputType,
  isReady,
  comingSoon = false,
}: GenerateShellProps<TConfig>) {
  const dict = useT();
  const { set: setPipeline } = usePipeline();
  const [config, setConfig] = useState<TConfig>(initialConfig);
  const [submitting, setSubmitting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const resultUrl = useBlobUrl(resultBlob);

  const ready = isReady ? isReady(config) : true;

  const submit = useCallback(async () => {
    if (!ready) {
      toast.error(dict.shell.errors.processFailed);
      return;
    }
    setSubmitting(true);
    setResultBlob(null);

    fire("process_start", { tool_id: tool.slug });
    const t0 = performance.now();
    try {
      const r = await onProcess(config);
      setResultBlob(r.blob);

      fire("process_complete", {
        tool_id: tool.slug,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(0),
        output_size_bucket: sizeBucket(r.bytes),
      });

      setPipeline({
        blob: r.blob,
        meta: { name: outputFilename(config), type: r.blob.type || outputType },
        fromTool: tool.slug,
        createdAt: Date.now(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : dict.shell.errors.processFailed;
      toast.error(message);
      fire("process_error", {
        tool_id: tool.slug,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  }, [ready, config, onProcess, tool.slug, setPipeline, outputFilename, outputType, dict.shell.errors]);

  return (
    <ShellChrome tool={tool} comingSoon={comingSoon}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Configure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderConfig({ config, setConfig })}

            <Button
              fullWidth
              size="lg"
              loading={submitting}
              disabled={!ready || submitting || comingSoon}
              onClick={submit}
            >
              {submitLabel}
            </Button>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>{resultBlob ? "Ready · download below" : "Live preview"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex min-h-[260px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle bg-surface-1 p-6">
              {renderLivePreview(config)}
            </div>

            {resultUrl && (
              <>
                <PaywallPitch tool={tool} trigger="post-download" />
                <DownloadBar
                  url={resultUrl}
                  filename={outputFilename(config)}
                  toolSlug={tool.slug}
                  outputType={outputType}
                  fullWidth
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ShellChrome>
  );
}
