"use client";

import { useState, useSyncExternalStore } from "react";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { NumberInput } from "@devalok/shilp-sutra/ui/number-input";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { CompressToTargetShell } from "@/components/tool-shells";
import { fire } from "@/lib/analytics";
import { fmt } from "@/i18n/format";
import { useT } from "@/i18n/provider";
import { compressVideoToTargetMb, formatMb, isWebCodecsVideoSupported } from "@/lib/processing/video-compress";
import { getToolBySlug } from "@/lib/tools";

interface Props {
  /** Fixed target in MB. If omitted, the form shows a custom NumberInput. */
  targetMb?: number;
  /** Display label for the active target - e.g. "25 MB". */
  targetLabel?: string;
  /** Slug for filename and tracking. */
  slug: string;
}

interface CompressResult {
  blob: Blob;
  bytes: number;
  durationSec: number;
  width: number;
  height: number;
  hitTarget: boolean;
}

export function VideoCompressForm({ targetMb, targetLabel, slug }: Props) {
  const dict = useT();
  const t = dict.forms.videoCompress;

  const [customMb, setCustomMb] = useState<number>(25);

  // VideoEncoder/VideoDecoder don't exist during SSR, so this differs
  // between server and client — useSyncExternalStore is the sanctioned way
  // to read that without a manual effect-then-correct flash or a hydration
  // mismatch (the support flag never changes after mount, so subscribe is a
  // no-op).
  const supported = useSyncExternalStore(subscribeNever, isWebCodecsVideoSupported, () => false);

  const isCustom = targetMb === undefined;
  const activeMb = isCustom ? customMb : targetMb;
  const activeLabel = targetLabel ?? formatTargetLabel(activeMb);

  const tool = getToolBySlug("video-compress");
  if (!tool) {
    throw new Error("video-compress tool missing from registry");
  }

  if (!supported) {
    return <UnsupportedBrowserNotice />;
  }

  const onProcess = async (file: File): Promise<CompressResult> => {
    if (activeMb < 1) {
      toast.error(t.errors.targetTooSmall);
      throw new Error(t.errors.targetTooSmall);
    }
    const r = await compressVideoToTargetMb(file, { targetMb: activeMb });

    if (r.hitTarget) {
      toast.success(fmt(t.toasts.compressedTemplate, { size: formatMb(r.bytes) }));
    } else {
      toast.error(
        fmt(t.errors.missedTargetTemplate, { target: activeLabel, result: formatMb(r.bytes) }),
      );
      fire("spec_missed", { tool_id: tool.slug, preset: slug, reason: "mb_over_target" });
    }

    return r;
  };

  return (
    <CompressToTargetShell<CompressResult>
      tool={tool}
      accept="video/*"
      maxBytes={2 * 1024 * 1024 * 1024}
      dropLabel={t.source.dropLabel}
      dropSublabel={t.source.dropSublabel}
      sourceTitle={t.card1Title}
      resultTitle={t.card2Title}
      emptyState={t.result.emptyState}
      submitLabel={fmt(t.submitTemplate, { target: activeLabel })}
      outputType="video/mp4"
      outputFilename={() => `bharattools-${slug}.mp4`}
      canSubmit={activeMb >= 1}
      onProcess={onProcess}
      renderSourcePreview={(previewUrl) => (
        <video src={previewUrl} muted className="h-20 w-20 rounded object-cover" />
      )}
      configSlot={
        <>
          {isCustom && (
            <div>
              <Label htmlFor="target" className="block mb-2">
                {t.target.label}
              </Label>
              <NumberInput
                id="target"
                value={customMb}
                onValueChange={setCustomMb}
                min={1}
                max={2000}
                step={1}
              />
            </div>
          )}
          {!isCustom && (
            <div className="rounded-md border border-surface-border-subtle bg-surface-2 p-3 text-body-sm">
              <span className="font-semibold">
                {t.target.fixedLabel}: {activeLabel}
              </span>
            </div>
          )}
        </>
      }
      renderPreview={(result) => (
        <div className="rounded-md border border-surface-fg bg-surface-2 p-4">
          <video
            src={result.url}
            controls
            className="mx-auto block max-h-[60vh] max-w-full w-auto"
          />
        </div>
      )}
      renderStats={(result, source) => (
        <ResultStats
          originalBytes={source.bytes}
          resultBytes={result.bytes}
          targetMb={activeMb}
          width={result.width}
          height={result.height}
        />
      )}
    />
  );
}

function UnsupportedBrowserNotice() {
  const dict = useT();
  const t = dict.forms.videoCompress.unsupportedBrowser;
  return (
    <div className="rounded-md border border-dashed border-surface-border-subtle p-6 text-center">
      <h3 className="text-heading-sm font-semibold">{t.title}</h3>
      <p className="mt-2 text-body-sm text-surface-fg-muted">{t.body}</p>
      <p className="mt-4 text-body-xs text-surface-fg-muted">{t.cta}</p>
    </div>
  );
}

function ResultStats({
  originalBytes,
  resultBytes,
  targetMb,
  width,
  height,
}: {
  originalBytes: number;
  resultBytes: number;
  targetMb: number;
  width: number;
  height: number;
}) {
  const dict = useT();
  const t = dict.forms.videoCompress.result;
  const targetBytes = targetMb * 1024 * 1024;
  // Unlike the exam photo tools, video has no minimum floor — anything at or
  // under the target is a plain success.
  const withinTarget = resultBytes <= targetBytes;
  const status = withinTarget
    ? { label: t.withinTarget, cls: "text-success-11" }
    : { label: fmt(t.overLimitTemplate, { mb: targetMb }), cls: "text-error-11" };

  const reduction =
    originalBytes > 0 ? ((1 - resultBytes / originalBytes) * 100).toFixed(0) : null;

  return (
    <div className="space-y-1 text-body-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">
          {width}×{height} px · {formatMb(resultBytes)}
        </span>
        <span className={status.cls}>{status.label}</span>
      </div>
      {originalBytes > 0 && (
        <p className="text-surface-fg-muted">
          {fmt(t.fromTemplate, { size: formatMb(originalBytes) })}
          {reduction && Number(reduction) > 0
            ? fmt(t.reductionTemplate, { pct: reduction })
            : ""}
          .
        </p>
      )}
    </div>
  );
}

function formatTargetLabel(mb: number): string {
  if (mb >= 1024 && mb % 1024 === 0) return `${mb / 1024} GB`;
  return `${mb} MB`;
}

// Support never changes after mount, so useSyncExternalStore's subscribe is
// a permanent no-op — this needs to be a stable reference, not an inline
// closure, so it's hoisted to module scope.
function subscribeNever(): () => void {
  return () => {};
}
