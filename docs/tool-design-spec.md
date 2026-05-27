# BharatTools — Tool Design Spec

> Foundation document. Every tool built for BharatTools must satisfy this spec before shipping.
> Break individual sections into SOPs as needed. Last updated: 2026-05-28.

---

## 1. Tool Type Taxonomy

Six shell types cover all current and planned tools. Design one UI shell per type, instantiate tools from it.

| Type | Pattern | Current Tools | Planned |
|---|---|---|---|
| **Resize-to-Spec** | file + preset/custom dimensions → compliant output | photo-resize, document-photo | passport photo, visa photo |
| **Compress-to-Target** | file + target size/quality → smaller output | image-compress, pdf-compress | — |
| **Convert** | format A → format B, no spec | jpg-to-pdf | png-to-pdf, webp-to-jpg |
| **Compose** | multiple inputs → single arranged output | print-sheet, photo-signature-joiner, pdf-merge | receipt generator, document package |
| **Extract** | one input → multiple outputs | pdf-merge-split (split mode) | — |
| **Generate** | form data → document (no file input) | print-job-slip | price card, customer receipt, form-fill checklist |
| **Transfer** | file → another device via P2P | quick-send | — |
| **Enhance/Process** | file → processed file (same type, content transformed) | document-photo (bg removal) | sharpener, colour correction |
| **Pipeline / Editor** | upload once → chain multiple operations in sequence → download | — (planned) | image-editor |

**Batch is a modifier, not a type.** Any of the above can have a batch layer added. Design single-file first; batch is a paid upgrade skin on the same shell.

**Extract shares the Compose shell** with a split/merge mode toggle — same page, different output direction.

**Pipeline has two forms:**
- *Cross-tool (Option A):* "Continue Editing" panel appended to every image tool's output. Passes processed blob to next tool via context/sessionStorage. Ships in Phase 3.
- *Dedicated editor (Option B):* `/image-editor` — all operations in one page, history stack, live canvas. Ships in Phase 4.

---

## 2. Master Checklist

Applies to every tool regardless of type. Type-specific variations in Section 3.

---

### 2.1 Input

- [ ] Drag & drop works on desktop
- [ ] Click-to-browse works on all browsers
- [ ] Mobile: tap triggers native file picker (camera / gallery / files — all three options)
- [ ] Accepted formats listed visibly before interaction, not only on error
- [ ] File rejected with specific error ("JPG or PNG only, you uploaded a HEIC")
- [ ] File size limit shown upfront and enforced with clear message
- [ ] Multi-file: upload order preserved
- [ ] Multi-file: drag-to-reorder where order affects output (Compose, Convert)
- [ ] Duplicate file detected and flagged (don't silently process twice)
- [ ] Large file warning before processing begins (>10MB on mobile)

---

### 2.2 Processing

- [ ] All heavy computation runs in a Web Worker — UI thread never blocks
- [ ] Progress indicator shown: determinate (%) where possible, indeterminate spinner only as fallback
- [ ] Cancel mid-process works cleanly — memory released, UI resets
- [ ] Corrupt or malformed input caught during processing, not silently producing bad output
- [ ] Tested at stress: large file (20MB PDF) on low-RAM device without crash
- [ ] No network requests made during processing — verified in devtools
- [ ] Processing start/end times logged (for performance baseline tracking)

---

### 2.3 Output & Download

- [ ] Preview shown before download — user sees what they're getting
- [ ] Output filename is descriptive: `upsc-photo-300x300.jpg`, not `download.jpg`
- [ ] Single file: direct browser download
- [ ] Batch: ZIP download, filenames preserved inside
- [ ] Re-download without re-processing (output cached in memory until page unload)
- [ ] Output quality validated before serving: 0KB file = error, not silent download
- [ ] EXIF and unnecessary metadata stripped from output (privacy — GPS, author, device info)
- [ ] Output meets the stated spec — automated check where possible (dimensions, file size within range)

---

### 2.4 Trust Signals

- [ ] "Processed on your device — 0 bytes sent" badge visible during and after processing
- [ ] Badge placement consistent across all tools (top of output area, not footer)
- [ ] No spinner that could be mistaken for a server upload (label it: "Processing locally...")
- [ ] No network request during processing (verifiable; this is architectural, badge must be accurate)

---

### 2.5 Responsiveness

- [ ] Mobile-first layout — majority of users on phone
- [ ] Fully functional at 360px viewport width
- [ ] Touch targets minimum 44×44px for all interactive elements
- [ ] Preview pane stacks below controls on mobile (not side-by-side)
- [ ] No horizontal scroll at any breakpoint
- [ ] File drop zone has adequate tap area on mobile (full width, not a small box)
- [ ] Tested on actual budget Android (₹8k range, Chrome, 4G) — not emulator

---

### 2.6 Batch (Freemium Modifier)

> Batch is THE paid product. Single-file is always free. Pitch fires when the user **initiates batch** (the value moment), not at an arbitrary file count. See §3.1.

- [ ] Single file: always free, zero friction, no pitch
- [ ] Initiating a batch (multiple files at once) = the paid trigger → inline pitch, processing does not hard-block until they decline
- [ ] Files already queued remain loaded after pitch dismissal — don't punish browsing
- [ ] Batch queue shows per-file status: queued / processing / done / error
- [ ] Per-file error doesn't stop the batch — continue with remaining files
- [ ] Batch ZIP: one-click download after all files complete
- [ ] Partial batch ZIP: downloadable even if some files failed (with error summary)
- [ ] Heavy/commercial usage signal logged for operator upsell timing (volume + repeat-day pattern), NOT used to block individuals

---

### 2.7 Empty / Error / Edge States

| State | Requirement |
|---|---|
| Empty (no file yet) | Clear CTA, not a blank drop zone. Show what the tool does in 1 line. |
| Wrong format | Specific message. Tell them what IS accepted. |
| File too large | Show the limit. Suggest compress tool if applicable. |
| Processing failed | Specific error type. Retry button. Files not cleared. |
| Output too large to compress further | Honest message: "Already at minimum size." Don't serve bad output. |
| Corrupt input | "File appears damaged. Try another copy." |
| Offline | Tool should still work — processing is local. Test it. |
| Zero-byte output | Never download silently. Surface as error with retry. |

---

### 2.8 Settings & Memory

- [ ] Last-used preset persisted in localStorage per tool (user who does UPSC daily doesn't re-pick)
- [ ] Last-used quality/size setting persisted per tool
- [ ] Preset persistence keyed per exam/variant, not just "last used" globally
- [ ] Session state survives accidental refresh where technically feasible
- [ ] Clear stored preferences option available (settings or footer link)

---

### 2.9 Cross-Tool Journey

- [ ] Post-download "next step" prompt — tool doesn't end at download
  - photo-resize → suggest print-sheet or joiner
  - jpg-to-pdf → suggest pdf-compress
  - image-compress → suggest jpg-to-pdf
- [ ] Tool chaining mirrors the sarkari workflow: resize → bg-remove → joiner → print-sheet → quick-send. No tool is a dead end.
- [ ] Guided spec selector: "Not sure which preset?" → exam picker → category → auto-selects spec
- [ ] Homepage or tool index shows workflow sequences, not just a flat tool list

---

### 2.10 Inline Help

- [ ] Jargon tooltips on technical terms: "300 DPI", "JPEG compression", "aspect ratio", "passport-style background"
- [ ] Spec explanation visible inline: "UPSC requires 40–100KB, white background, passport-style" — not just the preset name
- [ ] "Why was my file rejected?" message is actionable: tell them exactly what to fix
- [ ] Help content is in the detected language, not English-only

---

### 2.11 Before/After & Output Confidence

- [ ] Compress/enhance tools: side-by-side before/after with file sizes shown
- [ ] Resize tools: visual spec compliance indicator after processing ("✓ Meets UPSC requirements — 45×35mm, 72KB")
- [ ] Spec mismatch: surface it clearly before download, not after
- [ ] Output dimensions/size shown numerically alongside the preview

---

### 2.12 Feedback & Social Trust

- [ ] Anonymous usage counter on tool page: "X photos processed today" (Umami event-based, no PII)
- [ ] First-time user hint: 3-step "how it works" — compact, dismissable, disappears after first use. Not a tour.
- [ ] PWA install nudge shown on 3rd+ visit (not first visit): "Add to home screen for quick access"
- [ ] No ratings/reviews prompt (not enough users at launch; add when >1k MAU)

---

### 2.13 Undo & Recovery

- [ ] One-step undo: wrong crop, wrong preset → go back without re-uploading
- [ ] "Start over" always visible and one click — never buried
- [ ] Clearing a file doesn't clear all settings (preserve preset selection)

---

### 2.14 i18n

- [ ] All UI strings routed through i18n layer (no hardcoded English in JSX)
- [ ] Exam/preset names handled correctly: "UPSC" stays, surrounding labels translate
- [ ] Date and number formats respect locale
- [ ] Language switch doesn't lose tool state or uploaded files
- [ ] Fallback to English for any string without a translation (never empty string)
- [ ] Language detection order: localStorage → browser locale → IP geolocation → English default
- [ ] Language switcher always visible in nav, one click

---

### 2.15 SEO

- [ ] Tool-specific `<title>` and `<meta description>` (not generic site title)
- [ ] `toolPageSchema` structured data wired and valid
- [ ] Breadcrumb schema present
- [ ] Canonical URL set via `NEXT_PUBLIC_SITE_URL`
- [ ] Exam/variant-specific routes (`/photo-resize/upsc`) have unique meta per variant
- [ ] Tool page has ≥150 words of indexable content beyond the UI (spec table, how-to, FAQ)
- [ ] No duplicate content between variant routes

---

### 2.16 Analytics Events

All events fire to Umami (self-hosted, Railway Mumbai). No PII in event payloads.

| Event | Fires when | Properties |
|---|---|---|
| `tool_open` | User lands on tool page | `tool_id`, `locale` |
| `file_added` | File dropped or selected | `tool_id`, `file_count`, `file_size_bucket` |
| `process_start` | Processing begins | `tool_id`, `preset` |
| `process_complete` | Output ready | `tool_id`, `duration_ms`, `input_size_bucket`, `output_size_bucket` |
| `download_click` | User clicks download | `tool_id`, `output_type` |
| `batch_initiated` | User starts a batch (multi-file) | `tool_id`, `file_count` |
| `upsell_shown` | Pitch rendered | `tool_id`, `trigger` |
| `upsell_clicked` | User clicks pitch CTA | `tool_id`, `tier` |
| `upsell_dismissed` | User dismisses pitch | `tool_id` |
| `process_error` | Processing fails | `tool_id`, `error_type` |
| `preset_selected` | User picks a preset | `tool_id`, `preset_id` |
| `cross_tool_click` | User clicks "next step" prompt | `from_tool`, `to_tool` |

---

### 2.17 Accessibility

- [ ] Keyboard navigable — tab order is logical top-to-bottom
- [ ] File drop zone has keyboard trigger (Enter/Space to open picker)
- [ ] Processing state announced to screen reader (`aria-live`)
- [ ] Error messages linked to input with `aria-describedby`
- [ ] Focus returns to sensible element after download (not lost)
- [ ] Colour contrast AA minimum on all text
- [ ] Icons with meaning have `aria-label` or visible label

---

### 2.18 Performance (Budget Device Baseline)

Baseline: ₹8k Android, Chrome, 4G, 2GB RAM.

- [ ] First meaningful interaction < 3s on 4G
- [ ] Tool UI interactive before any heavy library loads (lazy load WASM/ONNX)
- [ ] Processing does not cause scroll jank
- [ ] Memory released after download — no accumulation across multiple files in same session
- [ ] bg-removal ONNX model (50MB) loaded lazily, only when tool is used
- [ ] Lighthouse score ≥ 85 on mobile

---

## 3. Paywall Checklist

> **Gate on USAGE PATTERN, not identity. Never ask "are you an aspirant?" — everyone lies.**
> Free zone = light/occasional use of any tool. Aspirants and casual users live here permanently and automatically (their real usage never crosses the paid trigger), so the Seva promise needs zero verification.
> The ONE real paid product is **batch / volume**. Don't build a feature matrix. Indian users do NOT pay for branding, vanity, or "professional image" — they pay to get unblocked (individual) or save time = money (operator).
> Traffic tools (JPG to PDF, PDF Compress, PDF Merge, Image Compress) **never** gate — see Hard Boundaries.

---

### 3.1 What's Free vs What's Paid

**Free zone — every tool, forever:**
- Single-file / one-off processing
- Light, occasional use (the genuine personal task)
- No artificial cap on what one person doing their own work needs

**Paid trigger = value moment (NOT an arbitrary file count):**
- **Batch** — processing many files at once (the real product)
- **High frequency** — repeat heavy use across days (usage-pattern signal)
- **High-cost operations** — bg-removal (50MB model, slow, real compute cost) is its own small gate regardless of batch

**Tiers:**
| Tier | Price | For | Unlocks |
|---|---|---|---|
| Free | ₹0 | Everyone doing their own light task | All tools, single-file, occasional |
| ₹29 | one-time, 24hr | Individual hitting a busy day | Batch for 24hr |
| ₹499 | per year | Frequent individual | Batch all year (₹1.37/day) |
| ₹1,999 | per year | Operator / professional running a business on it | Unlimited batch + commercial-use licence |

> The commercial-use licence on the ₹1,999 tier is honest tiering for someone earning off the tool — it is NOT a feature. Do not invent "branded output / ZIP / multi-device" as paid features; Indian buyers don't value them.

---

### 3.2 Pitch Design

- [ ] Pitch fires at the **value moment** (user initiates batch / heavy op), not at a file count
- [ ] Pitch is **inline**, not a modal blocking work in progress
- [ ] Files already loaded remain after pitch dismissal — never punish browsing
- [ ] Pitch copy = outcome-framed: "Process all these at once — ₹29" / "₹1.37/day, less than chai" (₹499)
- [ ] Operator-signal variant: if heavy/commercial usage detected, show ₹1,999/yr "saves half your time, pays for itself in 2 customers"
- [ ] No "premium feature" language — frame as "you're past the free one-off use case now"
- [ ] Mobile (360px): pitch is a bottom sheet, not a below-the-fold inline banner that gets scroll-blindness
- [ ] "Always free" traffic tools: zero pitch, zero lock icon, zero mention of paid plans
- [ ] Test the pitch is actually SEEN on mobile mid-task (audit flagged inline-banner blindness risk)

---

### 3.3 Payment Flow

> Auth/payment loop has technical + contract risks — see `engineering-decisions-for-rudra.md` #3. Build to that resolution.

- [ ] Razorpay Checkout opens in a sheet/drawer (not full navigation away)
- [ ] Payment success → Razorpay **`handler` callback fires in the browser** → frontend POSTs to backend → backend verifies signature + issues our JWT → frontend writes JWT to localStorage. (NOT "webhook writes localStorage" — impossible.)
- [ ] Backend webhook = backup payment record only, not the unlock trigger
- [ ] Tool remains loaded during payment — files not lost
- [ ] On return from payment: no page reload required, batch resumes automatically
- [ ] Payment failure: graceful message, retry option, files not cleared
- [ ] Payment abandoned: no penalty, files still loaded, pitch re-shown on next trigger (not immediately)
- [ ] UPI only at launch — no card mandate, no auto-renew

---

### 3.4 Post-Payment & Token

- [ ] JWT written to localStorage on `handler` callback confirm (short-poll backend if needed; no waiting screen)
- [ ] No "wait for confirmation" screen — unlock is instant
- [ ] Subtle "Pro" indicator visible post-unlock
- [ ] ₹29 = 24hr. Expiry time shown ("Valid until 11:59 PM today")
- [ ] ₹499 = 1yr. Expiry date shown in account/settings area
- [ ] Token expiry warning: banner 7 days before annual pass expires
- [ ] **Individual tier = phone-JWT-bound** (follows user across devices; re-auth via MSG91 SMS OTP on new device / cleared storage)
- [ ] **Operator tier = device-bound by design** (shop machine stays unlocked for every customer they serve — this is correct, not a leak)
- [ ] **Commercial/operator gating enforced server-side** — localStorage is clearable; do not rely on it for the ₹1,999 tier
- [ ] Budget ~30% re-auth rate in café/shared-device environments (not 5–10%)
- [ ] Cross-tab unlock: localStorage event propagates to other open tabs

---

### 3.5 Upgrade Path

- [ ] ₹29 buyer: a few days later → nudge to ₹499 ("you've paid ₹29 a few times — annual = ₹1.37/day")
- [ ] ₹499 buyer: if commercial/heavy signals detected → operator (₹1,999) upsell shown once
- [ ] Upgrade nudge is a dismissable banner, not a modal — shown once per period
- [ ] Never pitch while the user is actively processing

---

### 3.6 Pitch Fatigue Rules

- [ ] **First dismiss**: pitch suppressed for rest of session
- [ ] **Second session**: re-pitch once at the value moment
- [ ] **Hard cap**: max 1 pitch per session
- [ ] **Paying user**: zero pitches, ever — token check before render
- [ ] Dismissal stored in localStorage (`upsell_dismissed_at`)
- [ ] Don't re-pitch within 24 hours of dismissal

---

### 3.7 Free vs Paid Visibility

- [ ] Traffic tools display "Always Free" badge in tool header (permanent, unconditional)
- [ ] Batch entry point visible to free users (they see the capability before they're gated — no surprise)
- [ ] Pricing page exists, linked from every pitch and from nav
- [ ] Free zone capabilities listed explicitly on pricing page — no ambiguity
- [ ] "Free for all aspirants, always" visible on aspirant/sarkari tool pages (Seva pillar — one segment, not the whole model)

---

## 4. Type-Specific Variations

Additions/overrides on top of the master checklist for each tool type.

---

### 4.1 Resize-to-Spec

- [ ] Spec selector is the primary UI element — most prominent on page
- [ ] Presets grouped by category (Exam → Sarkari Forms → Visa → Custom)
- [ ] Custom input: width × height (px or mm), DPI, max file size — with unit selector
- [ ] Crop tool available after spec selection — constrained to correct aspect ratio
- [ ] Spec compliance check runs after processing: output dimensions + file size validated against spec
- [ ] "✓ Meets [exam] requirements" shown before download
- [ ] If output fails spec (edge case): explain why and offer retry with adjusted settings
- [ ] Exam spec DB is the source of truth — no hardcoded specs in component

---

### 4.2 Compress-to-Target

- [ ] Target selector: preset sizes (under 100KB, under 200KB, under 500KB) + custom KB input
- [ ] Binary search compression algorithm — don't just use a fixed quality
- [ ] Live estimate shown: "Currently ~180KB — compressing to under 100KB"
- [ ] Before/after: original size vs output size, prominently shown
- [ ] If target is impossible (file already at minimum): honest message, don't serve degraded output
- [ ] Quality floor: never compress below a quality that makes the photo unusable for forms

---

### 4.3 Convert (A→B)

- [ ] Simplest flow — minimal UI, maximum speed
- [ ] Multi-file ordering: drag-to-reorder for JPG→PDF (page order matters)
- [ ] Page count shown for PDF output before download
- [ ] Orientation detection: landscape photos handled correctly in PDF

---

### 4.4 Compose

- [ ] Multi-file upload with drag-to-reorder always
- [ ] Live layout preview updates as files are added/reordered
- [ ] For print-sheet: paper size selector (A4, Letter, custom), photos-per-sheet selector
- [ ] For joiner: alignment controls (photo left/right, signature position)
- [ ] For pdf-merge: page thumbnail preview, reorder pages not just files
- [ ] "Remove file" per item in the queue, not just "clear all"
- [ ] Output preview shows final layout before download — what they print is what they see

---

### 4.5 Extract/Split

- [ ] Visual page picker: thumbnails of all pages, tap/click to include/exclude
- [ ] Range input as alternative: "pages 1–5" text input
- [ ] "Split every N pages" option for bulk splitting
- [ ] Output preview: show how many files will be produced and approx size each
- [ ] Batch ZIP of split pages: one download, files named `original-p1.pdf`, `original-p2.pdf` etc.

---

### 4.6 Generate (Form→Doc)

- [ ] Form fields on left, live document preview on right (desktop)
- [ ] Mobile: form stacked above preview, preview updates on blur/change
- [ ] Required fields clearly marked; validation inline (not on submit)
- [ ] Preview is pixel-accurate to what will print
- [ ] Print button in addition to download — opens browser print dialog with correct page setup
- [ ] Field values persisted in localStorage (operator returning to fill slip for next customer)
- [ ] "Clear form" one click, but confirm before clearing (accidental tap risk)

---

### 4.7 Transfer (Quick Send)

- [ ] State machine UI: idle → generating code → waiting for peer → connected → transferring → done
- [ ] Sender: shows QR code + short alphanumeric code (for when camera isn't available)
- [ ] Receiver: scan QR or enter code → auto-connect
- [ ] Transfer progress: per-file progress bar with speed and ETA
- [ ] "0 bytes to server" badge especially prominent here — this is the privacy centrepiece
- [ ] Connection failed: clear error + retry, explain NAT/firewall restriction if coturn not reachable
- [ ] Multiple files: queue with per-file status
- [ ] Session expires after transfer or 10 min idle — clear message
- [ ] No transfer history stored (by design — privacy)
- [ ] Operator use case: "Share your docs with the print shop" — position this on the tool page

---

### 4.8 Enhance/Process

- [ ] Processing indicator explicitly says "Analysing on your device" — not "uploading"
- [ ] For bg-removal: before/after toggle in preview (not side-by-side — same image area, toggle button)
- [ ] ONNX model load progress shown on first use ("Loading AI model — one time only, 50MB")
- [ ] Model cached after first load — don't re-download each session
- [ ] Output background options: white (default), transparent, custom colour
- [ ] If model fails to load: graceful fallback message, don't show broken UI

---

### 4.9 Pipeline / "Continue Editing" (Cross-tool, Phase 3)

This is a UX layer added to every image tool's output — not a standalone page.

**Principle:** file processed in Tool A → user clicks "Continue Editing" → Tool B opens with that file pre-loaded. No re-upload. No server. Blob stays in memory.

**Implementation:**
- `ImagePipelineContext` (React context) holds the current output blob + metadata (dimensions, format, size)
- Every image tool writes its output to context on completion
- Every image tool checks context on mount — if a blob is waiting, pre-loads it instead of showing file picker
- `sessionStorage` fallback for cases where navigation breaks context (Next.js page transitions)
- Context cleared on: explicit "Start fresh", tab close, session timeout (30 min idle)

**UI — "Continue Editing" panel:**
- Appears below the download button after output is ready
- Shows relevant next-step tools only (context-aware: after compress → don't show compress again)
- One click → navigates to next tool with file pre-loaded
- Panel is dismissable — doesn't obscure download

**Checklist:**
- [ ] `ImagePipelineContext` provider wraps all image tool routes
- [ ] Every image tool reads from context on mount; skips file picker if blob present
- [ ] Every image tool writes output to context after processing
- [ ] "Continue Editing" panel shown after every output — relevant tools only
- [ ] "Start fresh" clears context and resets to empty file picker
- [ ] sessionStorage fallback covers Next.js hard navigations
- [ ] Context blob cleared after 30 min idle (memory management)
- [ ] "0 bytes sent" badge remains accurate — context never touches network
- [ ] Pipeline state does NOT persist across browser sessions (privacy by design)
- [ ] Mobile: "Continue Editing" panel is a bottom sheet, not an inline panel

**Context-aware "next step" suggestions by tool:**

| Just completed | Suggest next |
|---|---|
| Photo Resize | Compress to size, Crop, Convert format |
| Image Compress | Convert format, Crop, Resize to spec |
| Crop | Compress to size, Resize to spec, Convert format |
| Convert format | Compress to size, Resize to spec |
| Rotate/Flip | Compress, Crop, Convert |
| Remove background | Resize to spec, Compress, Convert |
| Greyscale | Compress, Resize to spec |

---

### 4.10 Image Editor (Dedicated, Phase 4)

Standalone tool at `/image-editor`. Upload once, apply multiple operations in sequence, download once.

**UI layout:**
- Left sidebar: operation list (tap to apply)
- Centre: live canvas preview (updates after each operation)
- Right panel (desktop): operation controls for the selected operation
- Top bar: undo/redo, step counter ("3 steps applied"), download

**Operations available (in order of sidebar):**
1. Crop (free + aspect ratio lock + spec presets)
2. Resize (free + exam spec presets)
3. Rotate / Flip
4. Compress to target KB
5. Convert format (JPG / PNG / WebP)
6. Greyscale
7. Brightness / Contrast sliders
8. Remove background (ONNX — loads on demand)
9. Strip EXIF metadata

**Checklist:**
- [ ] All operations applied to in-memory canvas/blob — no server
- [ ] History stack: up to 10 steps, undo/redo
- [ ] Step list visible: "Crop → Resize → Compress" breadcrumb
- [ ] Download available at any step, not only at end
- [ ] Heavy operations (bg-removal) show inline progress without blocking other operations
- [ ] Operations are non-destructive until download (original blob preserved in memory)
- [ ] Mobile: sidebar collapses to bottom tab bar; controls slide up as sheet
- [ ] Handles all input formats: JPG, PNG, WebP, HEIC
- [ ] ONNX model lazy-loaded only when bg-removal is selected
- [ ] Output filename reflects applied steps: `photo-cropped-resized-compressed.jpg`

---

## 5. Implementation Priority

Build in this order to validate the most critical patterns first:

1. **Resize-to-Spec** — highest traffic, most critical spec accuracy, defines the brand
2. **Compose** — print-sheet + joiner are operator retention tools
3. **Compress-to-Target** — SEO traffic, simplest to implement correctly
4. **Generate** — print-job-slip, needed for operator workflow
5. **Convert** — JPG to PDF already works; audit against this spec
6. **Transfer** — Quick Send is acquisition; already built, audit against this spec
7. **Enhance/Process** — bg-removal is highest complexity + foreign dep risk

---

## 6. Definition of Done (per tool)

A tool is not done until all of the following pass:

- [ ] Master checklist: all items checked
- [ ] Type-specific checklist: all items checked
- [ ] Paywall checklist: all items checked (if gated)
- [ ] Tested on real ₹8k Android device on 4G
- [ ] Tested offline (processing still works)
- [ ] i18n: Hindi strings present and correct
- [ ] Analytics events firing and appearing in Umami
- [ ] SEO: schema validated, meta unique, page has indexable content
- [ ] Lighthouse mobile ≥ 85
- [ ] No console errors or warnings in production build
