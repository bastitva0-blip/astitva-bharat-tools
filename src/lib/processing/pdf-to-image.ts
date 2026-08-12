import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { canvasToBlob } from "./image";

// PDF page rasteriser shared by /pdf-to-jpg (full-resolution export) and
// /pdf-rotate (small thumbnails). pdf-lib can read and rewrite a PDF but it
// cannot draw one, so anything that needs pixels goes through pdfjs.
//
// pdfjs is imported lazily at call time — same reasoning as the tesseract
// import in image-to-text.ts. It is a large chunk and most visitors never
// open a PDF tool, so it must not sit in the shared bundle.

export type PdfImageFormat = "image/jpeg" | "image/png";

/** A PDF user unit is 1/72 inch, so scale is simply dpi / 72. */
const PDF_UNITS_PER_INCH = 72;

// Ceiling on the decoded pixels of a single rendered page. A 300 DPI render of
// an A0 poster is ~100 MP and will either OOM the tab or return a blank canvas
// on mobile Safari. When a page would exceed this we quietly render it at the
// highest scale that fits rather than failing the whole document.
const MAX_PAGE_PIXELS = 40_000_000;

export interface RenderedPage {
  /** 1-based, matching what the user sees in a PDF reader. */
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
}

export interface PdfThumbnail {
  pageNumber: number;
  /** Data URL — small enough to hold in state without object-URL bookkeeping. */
  dataUrl: string;
  width: number;
  height: number;
}

let pdfjsModule: typeof import("pdfjs-dist") | null = null;

async function loadPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (pdfjsModule) return pdfjsModule;
  const pdfjs = await import("pdfjs-dist");

  // `new Worker(new URL(...))` is the form both Turbopack and webpack detect
  // statically, so the worker file gets emitted and fingerprinted with the
  // rest of the build. Setting `workerSrc` to a bare specifier instead would
  // work in dev and 404 in production.
  if (!pdfjs.GlobalWorkerOptions.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(
      new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url),
      { type: "module" },
    );
  }

  pdfjsModule = pdfjs;
  return pdfjs;
}

/**
 * Opens a document and runs `fn` against it, then tears the loading task down.
 *
 * Teardown lives on the loading task, not the document proxy — releasing it is
 * what terminates the pdfjs worker's job and frees the parsed document, so the
 * task has to stay in scope rather than being discarded after `.promise`.
 */
async function withPdf<T>(source: Blob, fn: (doc: PDFDocumentProxy) => Promise<T>): Promise<T> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await source.arrayBuffer());

  let task: PDFDocumentLoadingTask;
  let doc: PDFDocumentProxy;
  try {
    task = pdfjs.getDocument({ data });
    doc = await task.promise;
  } catch {
    throw new Error(
      "This PDF couldn't be opened. It may be corrupted, or password-protected — remove the password and try again.",
    );
  }

  try {
    return await fn(doc);
  } finally {
    await task.destroy();
  }
}

/**
 * Renders one page onto a fresh canvas. `scale` is a pdfjs viewport scale;
 * it gets clamped down if the resulting canvas would exceed MAX_PAGE_PIXELS.
 */
async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  try {
    const base = page.getViewport({ scale: 1 });
    const wanted = base.width * base.height * scale * scale;
    const safeScale = wanted > MAX_PAGE_PIXELS
      ? Math.sqrt(MAX_PAGE_PIXELS / (base.width * base.height))
      : scale;

    const viewport = page.getViewport({ scale: safeScale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error(
        "Your browser couldn't create the canvas needed to draw this PDF. Try updating your browser.",
      );
    }
    // JPEG has no alpha, so an unpainted canvas would export as black. Paint
    // the page white first — which is also what a printed page looks like.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, viewport }).promise;
    return canvas;
  } finally {
    page.cleanup();
  }
}

export interface PdfToImagesOptions {
  dpi: number;
  format: PdfImageFormat;
  /** JPEG quality 0-1. Ignored for PNG. */
  quality?: number;
  /** Called after each page finishes, for progress UI. */
  onPage?: (done: number, total: number) => void;
}

export async function pdfToImages(
  source: Blob,
  opts: PdfToImagesOptions,
): Promise<RenderedPage[]> {
  return withPdf(source, async (doc) => {
    const scale = opts.dpi / PDF_UNITS_PER_INCH;
    const pages: RenderedPage[] = [];

    for (let n = 1; n <= doc.numPages; n += 1) {
      const canvas = await renderPageToCanvas(doc, n, scale);
      const blob = await canvasToBlob(
        canvas,
        opts.format,
        opts.format === "image/jpeg" ? (opts.quality ?? 0.92) : undefined,
      );
      pages.push({ pageNumber: n, blob, width: canvas.width, height: canvas.height });

      // Drop the backing store immediately — a 50-page document at 300 DPI
      // would otherwise hold every canvas alive until the loop ends.
      canvas.width = 0;
      canvas.height = 0;

      opts.onPage?.(n, doc.numPages);
    }

    return pages;
  });
}

/**
 * Low-resolution previews for page-picking UIs. Width is a target, not exact —
 * the aspect ratio of each page is preserved.
 */
export async function renderPdfThumbnails(
  source: Blob,
  targetWidthPx = 180,
): Promise<PdfThumbnail[]> {
  return withPdf(source, async (doc) => {
    const thumbs: PdfThumbnail[] = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      page.cleanup();

      const canvas = await renderPageToCanvas(doc, n, targetWidthPx / base.width);
      thumbs.push({
        pageNumber: n,
        dataUrl: canvas.toDataURL("image/jpeg", 0.7),
        width: canvas.width,
        height: canvas.height,
      });
      canvas.width = 0;
      canvas.height = 0;
    }
    return thumbs;
  });
}
