"use client";

import { useEffect, useRef, useState } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@devalok/shilp-sutra/ui/card";
import { Label } from "@devalok/shilp-sutra/ui/label";
import { SegmentedControl } from "@devalok/shilp-sutra/ui/segmented-control";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { durationBucket, fire, sizeBucket } from "@/lib/analytics";
import { usePipeline } from "@/lib/pipeline";
import { formatKb } from "@/lib/processing/image";
import {
  isBlank,
  PAD_HEIGHT,
  PAD_WIDTH,
  PEN_HEX,
  renderSignature,
  strokeToPath,
  type PenColor,
  type Stroke,
  type StrokePoint,
} from "@/lib/processing/signature-maker";
import { getToolBySlug } from "@/lib/tools";
import { DownloadBar, ShellChrome } from "@/components/tool-shells/primitives";

const TOOL = "signature-maker";

type Output = "png" | "jpg";

const PEN_WIDTHS = [
  { id: "2", text: "Fine" },
  { id: "3.5", text: "Medium" },
  { id: "5", text: "Bold" },
];

export function SignatureMakerForm() {
  const tool = getToolBySlug(TOOL)!;
  const { set: setPipeline } = usePipeline();

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [penColor, setPenColor] = useState<PenColor>("black");
  const [penWidth, setPenWidth] = useState(3.5);
  const [output, setOutput] = useState<Output>("png");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ url: string; bytes: number; width: number; height: number } | null>(null);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const blank = isBlank(strokes);

  const clearResult = () => {
    setResult((cur) => {
      if (cur) URL.revokeObjectURL(cur.url);
      return null;
    });
  };

  const run = async () => {
    if (blank) {
      toast.error("Draw your signature in the box first.");
      return;
    }
    setSubmitting(true);
    clearResult();

    fire("process_start", { tool_id: TOOL, preset: output });
    const t0 = performance.now();
    try {
      const rendered = await renderSignature({
        strokes,
        penWidth,
        penColor,
        transparent: output === "png",
      });
      const url = URL.createObjectURL(rendered.blob);
      setResult({ url, bytes: rendered.bytes, width: rendered.width, height: rendered.height });

      fire("process_complete", {
        tool_id: TOOL,
        duration_bucket: durationBucket(performance.now() - t0),
        input_size_bucket: sizeBucket(0),
        output_size_bucket: sizeBucket(rendered.bytes),
      });

      const type = output === "png" ? "image/png" : "image/jpeg";
      setPipeline({
        blob: rendered.blob,
        meta: {
          name: `signature.${output}`,
          type,
          dims: { w: rendered.width, h: rendered.height },
        },
        fromTool: TOOL,
        createdAt: Date.now(),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export the signature.");
      fire("process_error", {
        tool_id: TOOL,
        error_type: err instanceof Error ? err.name : "unknown",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShellChrome tool={tool}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>1. Sign here</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignaturePad
              strokes={strokes}
              penColor={penColor}
              penWidth={penWidth}
              onChange={(next) => {
                setStrokes(next);
                clearResult();
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="soft"
                size="compact-sm"
                disabled={strokes.length === 0}
                onClick={() => {
                  setStrokes((cur) => cur.slice(0, -1));
                  clearResult();
                }}
              >
                <Undo2 className="mr-1.5 size-4" aria-hidden />
                Undo stroke
              </Button>
              <Button
                variant="ghost"
                size="compact-sm"
                disabled={strokes.length === 0}
                onClick={() => {
                  setStrokes([]);
                  clearResult();
                }}
              >
                Clear
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="block">Ink colour</Label>
              <SegmentedControl
                size="md"
                variant="soft"
                options={[
                  { id: "black", text: "Black" },
                  { id: "blue", text: "Blue" },
                ]}
                value={penColor}
                onValueChange={(id) => {
                  setPenColor(id as PenColor);
                  clearResult();
                }}
              />
              <p className="text-body-xs text-surface-fg-muted">
                Most portals ask for black or blue ink. Black scans cleanest.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="block">Pen thickness</Label>
              <SegmentedControl
                size="md"
                variant="soft"
                options={PEN_WIDTHS}
                value={String(penWidth)}
                onValueChange={(id) => {
                  setPenWidth(Number(id));
                  clearResult();
                }}
              />
            </div>

            <div className="space-y-2">
              <Label className="block">Download as</Label>
              <SegmentedControl
                size="md"
                variant="soft"
                options={[
                  { id: "png", text: "PNG · transparent" },
                  { id: "jpg", text: "JPG · white" },
                ]}
                value={output}
                onValueChange={(id) => {
                  setOutput(id as Output);
                  clearResult();
                }}
              />
              <p className="text-body-xs text-surface-fg-muted">
                {output === "png"
                  ? "Transparent background — drops cleanly onto a form or a letterhead."
                  : "Flattened onto white — this is what most government portals accept."}
              </p>
            </div>

            <Button fullWidth size="lg" loading={submitting} disabled={blank || submitting} onClick={run}>
              Create signature
            </Button>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>{result ? "2. Ready to download" : "2. Preview"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-surface-border-subtle p-6 ${
                output === "png" ? "bg-surface-2" : "bg-white"
              }`}
            >
              {result ? (
                /* eslint-disable-next-line @next/next/no-img-element -- blob: URL */
                <img src={result.url} alt="Your signature" className="max-h-40 w-auto" />
              ) : blank ? (
                <p className="text-center text-body-sm text-surface-fg-muted">
                  Your signature appears here, trimmed to the ink.
                </p>
              ) : (
                <SignatureArtwork strokes={strokes} penColor={penColor} penWidth={penWidth} />
              )}
            </div>

            {result && (
              <>
                <p className="text-body-xs text-surface-fg-muted">
                  {result.width}×{result.height} px · {formatKb(result.bytes)} · trimmed to the ink
                </p>
                <DownloadBar
                  url={result.url}
                  filename={`signature.${output}`}
                  toolSlug={TOOL}
                  outputType={output === "png" ? "image/png" : "image/jpeg"}
                  label={`Download ${output.toUpperCase()}`}
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

/** Read-only rendering of the strokes — shared by the pad and the preview. */
function SignatureArtwork({
  strokes,
  penColor,
  penWidth,
}: {
  strokes: Stroke[];
  penColor: PenColor;
  penWidth: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
      className="h-auto w-full max-w-sm"
      role="img"
      aria-label="Signature preview"
    >
      {strokes.map((stroke, i) => (
        <path
          key={i}
          d={strokeToPath(stroke)}
          fill="none"
          stroke={PEN_HEX[penColor]}
          strokeWidth={penWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

function SignaturePad({
  strokes,
  penColor,
  penWidth,
  onChange,
}: {
  strokes: Stroke[];
  penColor: PenColor;
  penWidth: number;
  onChange: (next: Stroke[]) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const drawingRef = useRef(false);

  // Converts a pointer position to pad units. Using the element's own box
  // rather than a fixed pixel size keeps the drawing correct at any width,
  // including after an orientation change on a phone. Points are clamped to
  // the pad because capture lets the pointer wander outside it — the stroke
  // should ride the edge, not fly off into negative space.
  const toPadPoint = (clientX: number, clientY: number): StrokePoint | null => {
    const el = svgRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));
    return {
      x: clamp(((clientX - rect.left) / rect.width) * PAD_WIDTH, PAD_WIDTH),
      y: clamp(((clientY - rect.top) / rect.height) * PAD_HEIGHT, PAD_HEIGHT),
    };
  };

  const start = (e: React.PointerEvent<SVGSVGElement>) => {
    const point = toPadPoint(e.clientX, e.clientY);
    if (!point) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    onChange([...strokes, [point]]);
  };

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current) return;
    const point = toPadPoint(e.clientX, e.clientY);
    if (!point) return;
    const last = strokes[strokes.length - 1];
    if (!last) return;
    onChange([...strokes.slice(0, -1), [...last, point]]);
  };

  const end = () => {
    drawingRef.current = false;
  };

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
        className="block w-full cursor-crosshair rounded-md border-2 border-dashed border-surface-border bg-white"
        style={{ touchAction: "none" }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        // Deliberately no onPointerLeave. The pad has pointer capture, so
        // tracking survives leaving the box — and it has to: a signature with
        // a long tail runs off the edge, and ending the stroke there would
        // chop it mid-flourish. The clamp below keeps stray points inside.
      >
        {/* Baseline, like the ruled line on a bank form. */}
        <line
          x1={20}
          y1={PAD_HEIGHT - 34}
          x2={PAD_WIDTH - 20}
          y2={PAD_HEIGHT - 34}
          stroke="#d4d4d8"
          strokeWidth={1}
          strokeDasharray="6 6"
        />
        {strokes.map((stroke, i) => (
          <path
            key={i}
            d={strokeToPath(stroke)}
            fill="none"
            stroke={PEN_HEX[penColor]}
            strokeWidth={penWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <p className="text-body-xs text-surface-fg-muted">
        Draw with a finger, stylus or mouse. The box is 3.5 cm × 1.5 cm — the signature box most
        Indian forms use.
      </p>
    </div>
  );
}
