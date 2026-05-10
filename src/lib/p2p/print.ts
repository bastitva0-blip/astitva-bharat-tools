import { PRINTABLE_MIME } from "./constants";

export function canPrint(mime: string): boolean {
  return PRINTABLE_MIME.has(mime);
}

/**
 * Open a hidden iframe with the file, then trigger the system print dialog.
 * Resolves once print() has been called; the iframe is left mounted briefly so
 * the dialog has a live document to render.
 */
export function printBlob(blob: Blob, mime: string, name: string): boolean {
  if (!canPrint(mime)) return false;

  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.title = name;

  const cleanup = () => {
    URL.revokeObjectURL(url);
    iframe.remove();
  };

  if (mime.startsWith("image/")) {
    // Image MIME types - wrap in a minimal HTML doc so print fits the page.
    const html = `<!doctype html><html><head><title>${escapeHtml(name)}</title>
<style>html,body{margin:0;padding:0}img{max-width:100%;display:block;margin:auto}
@media print{@page{margin:8mm}}</style></head>
<body><img src="${url}" alt=""/></body></html>`;
    iframe.srcdoc = html;
  } else {
    iframe.src = url;
  }

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // popup-blocked or cross-origin; let cleanup happen
    }
    setTimeout(cleanup, 60_000);
  };

  document.body.appendChild(iframe);
  return true;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  );
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
