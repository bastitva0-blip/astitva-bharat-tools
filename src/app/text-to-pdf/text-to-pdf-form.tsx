"use client";

import { useState } from "react";
import { FileText, Check } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { toast } from "@devalok/shilp-sutra/ui/toast";
import { fire } from "@/lib/analytics/events";

const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
} as const;

type PageSizeKey = keyof typeof PAGE_SIZES;

const MARGIN_PTS: Record<string, number> = {
  Normal: 20 * 2.835,
  Narrow: 10 * 2.835,
  Wide: 30 * 2.835,
};

export function TextToPdfForm() {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [margin, setMargin] = useState("Normal");
  const [filename, setFilename] = useState("document");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const charCount = text.length;
  const lineCount = text === "" ? 0 : text.split("\n").length;

  async function handleConvert() {
    if (!text.trim()) {
      toast.error("Please enter some text before converting.");
      return;
    }

    setLoading(true);
    setDone(false);
    fire("process_start", { tool_id: "text-to-pdf" });

    try {
      const { PDFDocument, StandardFonts } = await import("@cantoo/pdf-lib");

      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      const { width, height } = PAGE_SIZES[pageSize];
      const marginPts = MARGIN_PTS[margin];
      const usableWidth = width - marginPts * 2;
      const lineHeight = fontSize * 1.4;
      const topY = height - marginPts;
      const bottomMargin = marginPts;

      // Split input text into logical lines
      const rawLines = text.split("\n");

      // Word-wrap each logical line to fit usableWidth
      const wrappedLines: string[] = [];
      for (const raw of rawLines) {
        if (raw.trim() === "") {
          wrappedLines.push("");
          continue;
        }
        const words = raw.split(" ");
        let current = "";
        for (const word of words) {
          const candidate = current === "" ? word : `${current} ${word}`;
          const w = font.widthOfTextAtSize(candidate, fontSize);
          if (w > usableWidth && current !== "") {
            wrappedLines.push(current);
            current = word;
          } else {
            current = candidate;
          }
        }
        if (current !== "") wrappedLines.push(current);
      }

      // Paginate
      let page = doc.addPage([width, height]);
      let y = topY;

      for (const line of wrappedLines) {
        if (y - lineHeight < bottomMargin) {
          page = doc.addPage([width, height]);
          y = topY;
        }
        if (line !== "") {
          page.drawText(line, { x: marginPts, y, size: fontSize, font });
        }
        y -= lineHeight;
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      fire("download_click", { tool_id: "text-to-pdf", output_type: "application/pdf" });
      setDone(true);
      toast.success("PDF downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="space-y-2">
        <label className="block text-body-sm font-medium text-surface-fg" htmlFor="text-input">
          Your text
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDone(false);
          }}
          placeholder="Paste or type your text here..."
          className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          style={{ minHeight: 300 }}
        />
        <p className="text-body-xs text-surface-fg-muted">
          {charCount.toLocaleString()} characters &middot; {lineCount.toLocaleString()} lines
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Font size */}
        <div className="space-y-1">
          <label className="block text-body-xs font-medium text-surface-fg" htmlFor="font-size">
            Font size
          </label>
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[10, 12, 14, 16, 18].map((s) => (
              <option key={s} value={s}>
                {s} pt
              </option>
            ))}
          </select>
        </div>

        {/* Page size */}
        <div className="space-y-1">
          <label className="block text-body-xs font-medium text-surface-fg" htmlFor="page-size">
            Page size
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PageSizeKey)}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
          </select>
        </div>

        {/* Margins */}
        <div className="space-y-1">
          <label className="block text-body-xs font-medium text-surface-fg" htmlFor="margin">
            Margins
          </label>
          <select
            id="margin"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Normal">Normal (20 mm)</option>
            <option value="Narrow">Narrow (10 mm)</option>
            <option value="Wide">Wide (30 mm)</option>
          </select>
        </div>

        {/* Filename */}
        <div className="space-y-1">
          <label className="block text-body-xs font-medium text-surface-fg" htmlFor="filename">
            Filename
          </label>
          <input
            id="filename"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="document"
            className="w-full rounded-md border border-surface-border bg-surface-1 px-3 py-2 text-body-sm text-surface-fg placeholder:text-surface-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Convert button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleConvert}
          disabled={loading || !text.trim()}
          size="lg"
        >
          {loading ? (
            "Generating PDF…"
          ) : done ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Downloaded
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Convert to PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
