# BharatTools — Master Tools List

> Research-backed. Every tool here has a real use case for the Indian audience.
> Sorted by category, then build complexity within category.
> "Traffic" = estimated India monthly search volume tier.

**Status key:** ✅ Built | 🔨 Build next | 🕐 Later | ❌ Skip (server-side / out of scope)

---

## ⚠️ Research-validated re-tiering (supersedes earlier phase ordering) — May 2026

Per `research-findings.md` Stream 6 (evidence-based). Builds first on validated demand; cuts vanity.

### MUST-HAVE — build before launch (validated by competitive density + documented sarkari pain)
Photo Resize-to-KB · Photo+Signature Joiner · Aadhaar Photo Crop+Compress (50KB) · Document Photo Maker · Print Sheet · JPG/PNG/HEIC→PDF · PDF Compress · PDF Merge · PDF→JPG · QR Generator · Aadhaar Masking · HEIC→JPG · **Background Remover/White Bg (NEW — added)** · **PDF Split/Extract (NEW — added)** · **E-Aadhaar PDF Password Remover (NEW — added; needs qpdf-wasm decrypt, see Rudra doc #5)**

### NICE-TO-HAVE — after Tier 1
WebP→JPG · Format Converter · PDF Reorder · Signature Maker · Crop · OCR English (Hindi later) · PDF Text Extract · PDF Add Password · Affidavit/NOC Generator · QR Scanner · Image Watermark · Remove EXIF · Greyscale · Age Calc (bundled w/ eligibility only)

### SKIP early (Google/global owns; no India angle)
Unit Converter · Date Diff (standalone) · Image Sharpener · Rotate/Flip standalone · Brightness Fix · Document Collage · File Inspector · PDF Watermark · PDF Crop · PDF Page Numbers · Photo Spec Calc (embed in resize tool)

### Three NEW must-have tools to add to category tables below
1. **Background Remover / White Background Maker** — sarkari portals reject non-white bg; multiple competitor clones exist; we have nothing. Add to Image Tools.
2. **PDF Split / Extract Pages** — pairs with PDF Merge; portals need per-cert uploads. Add to PDF Tools.
3. **E-Aadhaar PDF Password Remover** — huge specific pain: e-Aadhaar downloads password-locked; user enters password, decrypt client-side, never uploaded. Add to PDF Tools. **Blocked on qpdf-wasm or equivalent** (pdf-lib can't decrypt — Rudra doc #5).

---

## IMAGE TOOLS

| Tool | What it does | Status | Complexity | Traffic | Notes |
|---|---|---|---|---|---|
| Photo Resize (exam spec) | Resize + crop to exact exam/form photo spec with preset DB | ✅ | — | H | Core product, spec accuracy moat |
| Image Compress | Compress to target KB/MB via binary search | ✅ | — | H | 200k+/mo India |
| Document Photo Maker | Remove background + resize to ID spec | ✅ | — | H | ONNX model, foreign CDN (fix later) |
| Photo + Signature Joiner | Combine photo + signature on form layout | ✅ | — | M | Sarkari-specific, operator stickiness |
| Print Sheet | Arrange N photos on A4 for print | ✅ | — | M | Operator tool |
| PNG to PDF | Convert PNG (single or multi) to PDF | 🔨 | S | H | 100k+/mo India. Reuses jpg-to-pdf logic, handles PNG + WebP + HEIC in one |
| HEIC to JPG | Convert iPhone HEIC photos to JPG | 🔨 | S | M→H | Growing fast. Govt portals reject HEIC. `heic2any` library, pure browser |
| WebP to JPG | Convert WebP to JPG | 🔨 | S | M | Canvas API, trivial. Portals reject WebP |
| Image Format Converter | One tool: JPG↔PNG↔WebP↔BMP (any to any) | 🔨 | S | H | Consolidate format conversions. Canvas API |
| Crop Image | Free crop (no spec), with aspect ratio lock option | 🔨 | S | M | `react-image-crop` already in deps |
| Image Rotate / Flip | Rotate 90°/180°/270°, flip H/V | 🔨 | S | M | Canvas, trivial. People need this after scanning |
| Photo to Greyscale / B&W | Convert colour photo to greyscale | 🔨 | S | M | Some sarkari forms require greyscale. Canvas filter |
| Remove EXIF / Metadata | Strip GPS, device info, author from photo before upload | 🔨 | S | L | Privacy brand play. Unique in India. No competitor has this as a standalone tool |
| Signature Extractor | Crop + clean signature from scanned document | 🔨 | M | M | Crop + threshold + bg removal. Needed before joiner tool. Sarkari workflow step |
| Photo Brightness/Contrast Fix | Lighten dark selfies, fix exposure for ID photos | 🔨 | M | M | Canvas filters. Common problem on budget phone cameras |
| Aadhaar Photo Crop | Crop the photo portion from an Aadhaar card scan | 🔨 | M | M | Niche but high-intent. Unique to India. Manual crop with guide overlay |
| Image Watermark | Add text or image watermark | 🕐 | M | M | Canvas. More useful for operators than aspirants |
| Document Scanner | Camera → detect edges → deskew → PDF | 🕐 | L | H | OpenCV.js WASM. High build effort but massive use case |
| Image Sharpener | Sharpen blurry document scans | 🕐 | M | L | Canvas convolution. Niche |

---

## PDF TOOLS

| Tool | What it does | Status | Complexity | Traffic | Notes |
|---|---|---|---|---|---|
| JPG to PDF | Convert JPG images to PDF | ✅ | — | H | 300k+/mo India |
| PDF Compress | Compress PDF to smaller size | ✅ | — | H | 400k+/mo India |
| PDF Merge + Split | Combine or separate PDFs | ✅ | — | H | 300k+/mo India combined |
| PNG to PDF | Already covered in Image Tools above | 🔨 | S | H | Same tool handles JPG + PNG + WebP |
| PDF to JPG / PNG | Extract each page as an image | 🔨 | M | H | 150k+/mo India. `pdf-lib` + canvas render via `pdfjs-dist` |
| PDF Rotate | Rotate individual pages or all pages | 🔨 | S | M | `pdf-lib` trivial. 50k+/mo India |
| PDF Reorder Pages | Drag pages to new order, save | 🔨 | M | M | `pdf-lib` + drag UI. Page thumbnails via canvas |
| PDF Add Password | Encrypt PDF with user password | 🔨 | S | M | `pdf-lib` supports. Privacy tool, on-brand |
| PDF Remove Password | Decrypt a password-protected PDF | 🔨 | S | M | `pdf-lib` supports if user provides correct password |
| PDF Add Page Numbers | Stamp page numbers on a PDF | 🔨 | S | L | `pdf-lib`. Useful for affidavits, applications |
| PDF Watermark | Add text watermark ("DRAFT", "CONFIDENTIAL") | 🔨 | S | M | `pdf-lib`. Common office need |
| PDF Crop | Crop/trim margins from PDF pages | 🕐 | M | M | `pdf-lib`. Niche but operators need it |
| PDF Repair | Attempt to fix corrupted PDF | ❌ | XL | M | Not reliably doable client-side. Skip. |
| PDF to Word | Extract PDF content to .docx | ❌ | — | H | Requires server. Not browser-processable cleanly. Skip Phase 1. |
| Word to PDF | Convert .docx to PDF | ❌ | — | H | Requires LibreOffice or server. Skip Phase 1. |

---

## SARKARI / DOCUMENT PREP TOOLS

| Tool | What it does | Status | Complexity | Traffic | Notes |
|---|---|---|---|---|---|
| Print Sheet | Arrange photos on A4 for print shop | ✅ | — | M | Operator stickiness |
| Print Job Slip | Generate print job receipt | ✅ | — | L | Operator tool |
| Aadhaar Card Compress | Resize + compress Aadhaar scan to meet portal upload limits | 🔨 | S | H | Very high-intent. Most govt portals: 50KB–200KB Aadhaar limit. Reuses compress logic, dedicated preset |
| Signature Maker | Draw signature on screen → download transparent PNG | 🔨 | S | M | Canvas drawing. Needed for digital form uploads. No scanner needed |
| Document Collage / Composite | Arrange multiple document images on one A4 (e.g., front + back of Aadhaar) | 🔨 | M | M | Variant of Compose type. Common portal requirement |
| Affidavit Generator | Fill name/DOB/address fields → standard affidavit format → PDF | 🕐 | M | M | Template-based. Highly useful for aspirants. Legal disclaimer required |
| NOC Letter Generator | Fill fields → standard NOC format → PDF | 🕐 | M | L | Template-based |
| Form Fill Helper | "What docs do I need for [exam] form?" — spec + checklist per exam | 🕐 | M | H | SEO machine. Each exam = landing page. Not a tool but a resource |

---

## OCR / TEXT TOOLS

| Tool | What it does | Status | Complexity | Traffic | Notes |
|---|---|---|---|---|---|
| Image to Text (OCR) | Extract text from image or scanned PDF | 🕐 | L | H | 150k+/mo India. Tesseract.js WASM — browser-side. Hindi + English support. High build but huge payoff |
| PDF Text Extractor | Extract selectable text from a PDF | 🔨 | S | M | `pdf-lib`/`pdfjs-dist` trivial. Useful for copy-pasting from scanned docs |
| Aadhaar Masking | Blur/mask Aadhaar number on scanned card (show only last 4 digits) | 🔨 | M | M | Privacy brand play. Unique in India. UIDAI recommends this but no free tool exists. Canvas + manual/auto region selection |

---

## QR & UTILITY TOOLS

| Tool | What it does | Status | Complexity | Traffic | Notes |
|---|---|---|---|---|---|
| Quick Send | P2P WebRTC file transfer, no cloud | ✅ | — | M | Acquisition product. "Don't WhatsApp your Aadhaar" |
| QR Code Generator | Generate QR for URL, text, UPI ID, contact | 🔨 | S | H | 200k+/mo India. `qrcode.react` already in deps. Done in <1 day |
| QR Code Scanner | Scan QR from camera or image upload | 🔨 | S | M | `qr-scanner` already in deps. Done in <1 day |
| File Info / Inspector | Show image dimensions, DPI, colour mode, file size, EXIF, PDF page count | 🔨 | S | L | Useful diagnostic tool. Privacy angle: shows what metadata your file exposes |
| Photo Spec Calculator | Enter print size + DPI → required pixel dimensions. Enter pixels + DPI → print size | 🔨 | S | M | Solves "what resolution do I need?" confusion for aspirants and studios |
| Age Calculator | Enter DOB → exact age in years/months/days | 🔨 | S | M | Constantly needed for form filling. Simple, high-utility |
| Date Difference Calculator | Days between two dates | 🔨 | S | M | Leave applications, project deadlines, application validity |
| Unit Converter (photo) | cm ↔ mm ↔ inch ↔ px at given DPI | 🔨 | S | M | Form specs are in mm/cm, tools are in px. Solves a real confusion |

---

## TOOLS TO EXPLICITLY SKIP

| Tool | Why skip |
|---|---|
| Word to PDF | Requires server (LibreOffice/Pandoc). Not browser-processable. |
| PDF to Word | Same — no clean browser solution. |
| Video Compress | Out of scope, different audience |
| PDF to PowerPoint | Server-side. Complex. Tiny India demand. |
| Document Translation | Requires API (Google/DeepL). Not browser-only. Out of scope. |
| Excel to PDF | Server-side. Skip Phase 1. |
| PDF Digital Signature (DSC) | Requires DSC token hardware. Not browser-doable. |
| Background Blur | Canvas-doable but very niche. Not worth the design effort. |
| Image Upscaler (AI) | Requires heavy ML model or API. Not Phase 1. |

---

## SUMMARY — BUILD ORDER

### Phase 1 (already shipped)
10 tools built — photo resize, compress, bg-remove, joiner, print sheet, print slip, jpg-to-pdf, pdf-compress, pdf-merge-split, quick-send.

### Phase 2 — Quick wins (S complexity, high traffic)
These 10 tools are <1–2 days each, most reuse existing lib code:

1. **PNG/WebP/HEIC → PDF + JPG** (consolidate image format conversion — one tool, all formats)
2. **HEIC to JPG** (iPhone users, portals reject HEIC, `heic2any`)
3. **Aadhaar Card Compress** (dedicated preset, reuses compress logic, very high intent)
4. **PDF Rotate** (`pdf-lib`, trivial)
5. **QR Code Generator** (`qrcode.react` already in deps)
6. **QR Code Scanner** (`qr-scanner` already in deps)
7. **PDF Add/Remove Password** (`pdf-lib` supports both)
8. **Signature Maker** (canvas draw → PNG download)
9. **Age Calculator** (pure JS, no lib needed)
10. **PDF Add Page Numbers** (`pdf-lib`, quick)

### Phase 3 — Medium effort, high value
1. PDF to JPG (pdfjs-dist render, moderate effort)
2. PDF Reorder Pages (drag UI + pdf-lib)
3. Signature Extractor (crop + threshold + canvas)
4. Remove EXIF/Metadata (exifr or manual strip)
5. Aadhaar Masking (canvas, unique privacy tool)
6. Photo to Greyscale (canvas filter, trivial but worth dedicated page for SEO)
7. PDF Watermark (pdf-lib text stamp)
8. Image Rotate/Flip (canvas, quick)
9. File Info / Inspector (exifr + pdf-lib stats)
10. Photo Spec Calculator (pure logic, no lib)
11. **"Continue Editing" cross-tool pipeline** (see below — UX upgrade to all existing image tools)

### Phase 4 — Worth building, more effort
1. Image to Text OCR (Tesseract.js WASM, Hindi + English)
2. Document Scanner (camera + edge detection)
3. Affidavit Generator (template system)
4. PDF Crop (pdf-lib)
5. Document Collage / Composite (Compose shell)
6. **Image Editor** (dedicated multi-step editor — see below)

---

## PIPELINE / EDITING TOOLS

Inspired by EZGIF's "upload once, chain operations" model — adapted for browser-only, zero server.

| Tool | What it does | Status | Complexity | Traffic | Notes |
|---|---|---|---|---|---|
| "Continue Editing" pipeline | After every image tool output, show next-step panel — pass processed file to next tool in memory, no re-upload | 🔨 | M | — | Cross-cutting UX upgrade, not a standalone tool. Eliminates the biggest drop-off: download → re-upload → repeat. Every image tool gets this. |
| Image Editor | Dedicated multi-step editor: upload once → apply Crop, Resize, Rotate, Compress, Greyscale, Brightness/Contrast, Remove BG, Strip Metadata → download | 🕐 | L | H | Standalone tool page at `/image-editor`. Targets "online image editor india" (high volume). Power-user tool for studios + operators. Operations applied in sequence to in-memory Blob. |

### "Continue Editing" — How It Works

After any image tool produces output, a panel appears below the download button:

```
[↓ Download]   [Continue editing ▼]
                 ├── Compress to size
                 ├── Crop
                 ├── Rotate / Flip
                 ├── Convert format
                 ├── Resize to spec
                 └── Remove background
```

- Click any option → that tool opens with current output pre-loaded (no file picker needed)
- File passed via React context (`ImagePipelineContext`) or `sessionStorage` blob URL
- No network, no server — blob stays in memory
- "0 bytes sent" badge remains accurate throughout the pipeline
- Works across all tools in the Image and PDF categories
- Privacy advantage over EZGIF: EZGIF must store file on their server between steps. We don't.

### Image Editor — Operations (Phase 4)

Single page, sidebar operations, live canvas preview:
- Crop (free + aspect ratio lock)
- Resize (free dimensions + exam spec presets)
- Rotate / Flip
- Compress to target KB
- Convert format (JPG/PNG/WebP)
- Greyscale
- Brightness + Contrast sliders
- Remove background (ONNX)
- Strip EXIF metadata
- History stack (undo/redo, up to 10 steps)
- Download at any step

---

## TOTAL TARGET: ~42 tools + 2 pipeline features

Currently 10 built. ~32 more tools + "Continue Editing" pipeline + Image Editor.
All browser-processable, no server needed.
Covers every sarkari form, document, and file task an Indian user faces daily.
