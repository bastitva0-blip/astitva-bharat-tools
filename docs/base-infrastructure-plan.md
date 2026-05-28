# BharatTools — Base Infrastructure Plan

> Foundation layers that must exist before the ~32 new tools, the search surface, paywall, and segment landers can be built confidently.
> Cross-references: `tool-design-spec.md`, `tools-list.md`, `search-spec.md`, `copy-spec.md`, `engineering-decisions-for-rudra.md`, `marketing-plan.md`.
> Last updated: 2026-05-28.

**Carve-outs (kept as-is, do NOT refactor in this pass):**
- `@imgly/background-removal` ONNX pipeline — single-thread default, model loaded lazily. COOP/COEP decision deferred (`engineering-decisions #1`).
- Umami analytics — self-hosted Mumbai instance is the analytics sink. We add an event bus in front of it, not a replacement.

---

## 0. Mental model

The codebase today has ~10 hand-built tool pages. The next ~32 tools, plus search, paywall, segmentation, lifecycle, and the eventual CLI/MCP packages, share a small number of cross-cutting primitives. Build those primitives ONCE, well, before scaling tools sideways.

Order of construction (each layer assumes the previous):

1. **Tool registry + spec DB** — the source of truth every other layer reads
2. **Processing kernel** — workers, memory guards, blob lifecycle, "0 bytes" badge
3. **Tool shells** — six type-specific UI shells (Resize/Compress/Convert/Compose/Extract/Generate)
4. **Pipeline store** — cross-tool blob handoff (the load-bearing prototype)
5. **Search + navigation** — MiniSearch + command palette + deep-link router
6. **Analytics + segmentation** — event bus → Umami; localStorage signals → segment scorer
7. **Paywall + auth** — Razorpay + MSG91 + JWT + cross-tab unlock
8. **i18n + content** — dictionary structure for 42 tools, no network calls
9. **Trust + SEO surface** — JSON-LD, OG, sitemap, schema, spec-reference pages

Sections below detail each layer.

---

## 1. Tool registry + Spec DB

**Why first:** every layer below (search, paywall, segment reorder, sitemap, CLI/MCP) reads the same tool list. Today `src/lib/tools.ts` exists but lacks the fields needed downstream.

### 1.1 Extend the `Tool` type

```ts
// src/lib/tools.ts
export type ToolType =
  | "resize-to-spec"
  | "compress-to-target"
  | "convert"
  | "compose"
  | "extract"
  | "generate"
  | "transfer"
  | "enhance"
  | "pipeline"

export type ToolStatus = "shipped" | "next" | "later" | "skip"

export interface Tool {
  slug: string                    // route segment; stable, never renamed
  type: ToolType
  status: ToolStatus
  category: "image" | "pdf" | "sarkari" | "ocr" | "qr" | "utility"

  // copy (keys, NOT strings — strings live in i18n)
  nameKey: string
  taglineKey: string
  descriptionKey: string

  // discovery
  keywords: string[]              // EN + Hinglish + Devanagari + KB + exam (see search-spec §3.3)
  popularityScore?: number        // 0..1, tiebreaker only

  // segment ranking
  segmentAffinity?: Partial<Record<Segment, number>>

  // paywall
  paywall: "always-free" | "batch-gated" | "high-cost"

  // engineering
  inputAccept: string[]           // mime/extensions accepted
  needsWorker: boolean
  needsWasm?: ("pdfjs" | "qpdf" | "onnx" | "heic" | "tesseract")[]
  decodedPixelCap?: number        // per-tool cap, see §2.3

  // routing
  variants?: { param: string; values: string[] }  // /photo-resize/[exam], /image-compress/[size]

  // cross-tool
  nextSteps?: string[]            // slugs of suggested next tools (pipeline)
}
```

### 1.2 Spec DB extraction (`src/lib/presets/` → `src/lib/spec-db/`)

Today `src/lib/presets/` holds exam photo specs hand-coded in TS. Move to a versioned, JSON-shaped data layer designed to be lifted into `@bharattools/spec-db` later (per `cli-mcp-spec §5`).

```
src/lib/spec-db/
  index.ts          # typed loader + version export
  schema.ts         # zod schema for runtime validation
  data/
    photo/
      upsc.json
      ssc.json
      ibps.json
      ...
    document/
      aadhaar.json
      pan.json
  version.json      # { version: "2026.05.28", lastVerified: {...} }
```

Each spec record carries: `{ exam, photoSpec, signatureSpec, fileSizeKB, format, background, officialSource, lastVerifiedAt }`. The `lastVerifiedAt` field surfaces on tool + spec-reference pages — credibility signal (per `marketing-plan §2.1`).

**Do NOT** parse JSON at runtime in client bundles — import statically so Next can tree-shake unused presets.

### 1.3 Migration

Existing 10 shipped tools register themselves into the new shape. No behaviour change, only metadata. Audit step: every shipped tool walks through master checklist in `tool-design-spec §2` against its registry entry.

---

## 2. Processing kernel

The piece every tool's processing step shares. Pull duplicated logic out of individual tool pages into `src/lib/processing/kernel/`.

### 2.1 Worker plumbing

Not every tool can use a worker (`engineering-decisions #8`). Provide both paths cleanly:

```
src/lib/processing/
  kernel/
    runInWorker.ts      # generic Worker spawner + Comlink-style RPC
    runOnMain.ts        # for canvas 2D + react-image-crop main-thread ops
    progress.ts         # determinate progress event shape
    cancel.ts           # AbortController plumbing
    teardown.ts         # revokeObjectURL, releaseDecoder, releaseOnnxArena
  workers/
    pdf.worker.ts       # pdf-lib operations
    image.worker.ts     # canvas/OffscreenCanvas operations (where supported)
    pdfjs.worker.ts     # pdfjs-dist's bundled worker, registered once
```

Each tool declares `needsWorker: true` in the registry; the shell picks the runner.

### 2.2 Blob & URL lifecycle

A single `useBlobUrl(blob)` hook that creates an object URL on mount and revokes it on unmount. Eliminates the leak class flagged in `engineering-decisions #7` ("confirm `URL.revokeObjectURL` called on every preview blob URL — no leaks across a 5-step pipeline").

### 2.3 Memory caps

Per-tool decoded-pixel cap, NOT file-byte cap (`engineering-decisions #7`):

```ts
// src/lib/processing/kernel/decodedPixelGuard.ts
export async function loadImageBoundedBySize(
  file: File,
  maxPixels = 16_000_000  // 4000x4000 default
): Promise<{ bitmap: ImageBitmap; downscaled: boolean }>
```

Downscales before decode if input would blow the cap. Returns `downscaled: true` so the UI can surface "We resized your image to fit your device's memory" — honest message, not a silent quality loss.

HEIC gets the strictest cap (`engineering-decisions #6`).

### 2.4 "0 bytes sent" badge — architectural

The badge in `tool-design-spec §2.4` is a CLAIM. Make it architecturally true via a single helper that runs in dev mode and asserts no `fetch`/`XHR` calls occur during processing. Throws in dev; logs in prod. Pair with CI check that greps for `fetch(` inside `src/lib/processing/`.

### 2.5 Output validators

`validateAgainstSpec(output, spec)` → `{ pass, reasons[] }`. Same shape as the eventual MCP `validate_against_spec` tool (`cli-mcp-spec §4`). Built once, reused by web shell + future CLI.

---

## 3. Tool shells

One UI shell per tool type from `tool-design-spec §1`. Today each tool is a bespoke page; standardise so adding a new tool = registry entry + thin variant component + spec, not a fresh page.

```
src/components/tool-shells/
  ResizeToSpecShell.tsx
  CompressToTargetShell.tsx
  ConvertShell.tsx
  ComposeShell.tsx       # also serves Extract (mode toggle, per spec §1)
  GenerateShell.tsx
  EnhanceShell.tsx       # for bg-removal (imgly stays)
  TransferShell.tsx      # quick-send only
  PipelineShell.tsx      # phase 4, image editor
  primitives/
    DropZone.tsx
    PreviewPane.tsx
    DownloadBar.tsx
    ContinueEditingPanel.tsx
    TrustBadge.tsx
    SpecCompliancePill.tsx
    PaywallPitch.tsx     # inline + bottom-sheet variants
```

Each shell wires the master checklist by default: drag/drop, mobile picker, processing-state UI, progress, cancel, output preview, descriptive filename, trust badge, error states, undo, analytics events. A tool page becomes:

```tsx
export default function PhotoResizePage({ params }) {
  return (
    <ResizeToSpecShell
      tool={tools["photo-resize"]}
      preset={resolvePreset(params.exam)}
    />
  )
}
```

**The shell owns the checklist.** Definition-of-Done (`tool-design-spec §6`) collapses from "audit 60 items per tool" to "audit the shell once; per-tool audit only the tool-specific bits."

---

## 4. Pipeline store ("Continue Editing")

`engineering-decisions #2` flags this as load-bearing and demands a prototype before UI. Build the store FIRST as standalone infra, ship behind a feature flag, only then attach UI.

### 4.1 Module-scope singleton

```ts
// src/lib/pipeline/pipelineStore.ts
type PipelineEntry = {
  blob: Blob
  meta: { name: string; type: string; dims?: { w: number; h: number } }
  fromTool: string
  createdAt: number
}

let _entry: PipelineEntry | null = null
const _subscribers = new Set<() => void>()

export const pipelineStore = {
  set(entry: PipelineEntry) { _entry = entry; _notify() },
  get() { return _entry },
  clear() { _entry = null; _notify() },
  subscribe(fn: () => void) { _subscribers.add(fn); return () => _subscribers.delete(fn) },
}
```

### 4.2 IndexedDB recovery layer

Async mirror to IndexedDB (`bt-pipeline` DB, one `current` row). Rehydrates on hard refresh; cleared after 30 min idle (privacy + memory).

### 4.3 Prototype contract — before any pipeline UI

Per `engineering-decisions #2`:
- [ ] Throwaway route `/_pipeline-test/a` writes blob; `/_pipeline-test/b` reads blob.
- [ ] Confirm survives Next.js 16 App Router client `<Link>` navigation.
- [ ] Confirm IndexedDB recovers across hard refresh.
- [ ] Confirm `URL.revokeObjectURL` is called for every intermediate preview URL across a 5-step chain.

**Until this prototype passes, do NOT design UI for the "Continue Editing" panel.**

### 4.4 React hook

```ts
// src/lib/pipeline/usePipeline.ts
export function usePipeline() {
  const entry = useSyncExternalStore(
    pipelineStore.subscribe,
    pipelineStore.get,
    () => null  // SSR fallback
  )
  return { entry, set: pipelineStore.set, clear: pipelineStore.clear }
}
```

Every shell mounts → checks `usePipeline()` → if entry present, skips DropZone and pre-loads. On output, writes to store. Shell-level — not per-tool wiring.

---

## 5. Search + navigation

Per `search-spec.md`.

### 5.1 Library + module-scope index

```
src/lib/search/
  index.ts          # builds MiniSearch at module load, NOT useMemo
  normalize.ts      # phoneme collapse + KB normalization (search-spec §3.4)
  searchTools.ts    # query → ranked Tool[] with zero-result fallback
  deepLink.ts       # "50kb" → /image-compress/50kb mapping
```

**Block on:** Rudra approval of `minisearch` dependency (`engineering-decisions #11`).

### 5.2 Command palette

Built on Shilp Sutra `Dialog` (already used in `qr-scan-button.tsx`). Cmd/Ctrl+K opens; mobile = full-screen sheet. Single component reused from:
- Homepage `ToolsBrowser` search input (upgrade existing)
- `TopNav` search trigger (new — every page)
- `/tools` index page (new)

### 5.3 Deep-link router

`src/lib/search/deepLink.ts` exposes pure functions that map recognized tokens to routes:
- KB number → `/image-compress/[size]` if route accepts arbitrary KB
- Exam slug → `/photo-resize/[exam]` if slug present in spec-db
- Tool name → tool route

Confirms covered by `engineering-decisions #11` checklist before shipping.

---

## 6. Analytics + segmentation

### 6.1 Event bus in front of Umami

Umami stays as-is. Add a thin event bus (`src/lib/analytics/events.ts`) so:
- Events declared once with typed payloads (`tool_open`, `file_added`, `process_complete`, etc. from `tool-design-spec §2.16`).
- No tool calls `umami.track()` directly — they call `events.fire("process_complete", { tool_id, duration_ms, ... })`.
- Test-mode swap: events log to console instead of Umami in dev/test.
- PII linter: payload type forbids fields named like `email`, `phone`, `name`, etc. at compile time.

### 6.2 Segmentation layer

Per `copy-spec §5` and `engineering-decisions #12`. Build now — paywall pitch resolver depends on it.

```
src/lib/segment/
  attribution.ts    # captures UTM + referrer once → localStorage bt_attribution
  signals.ts        # writes bt_signals continuously from analytics events
  scorer.ts         # pure function: bt_attribution + bt_signals → SegmentResolution
  resolver.ts       # paywall + empty-state consumer
```

Layers 1–4 from `engineering-decisions #12` ship in this infra pass; layers 5–6 (empty-state reorder, segment events) are polish that ride on top.

**Decisions to surface to Rudra (per #12):**
- [ ] localStorage-only signals at launch (no server shadow until paid)
- [ ] Recompute on every gate trigger (cheap; signals change fast)
- [ ] "Reset preferences" link in footer settings
- [ ] Paid user → resolver short-circuits, never pitches

---

## 7. Paywall + auth

**Block on:** `engineering-decisions #3` items 1–6 verified against Razorpay docs.

### 7.1 Auth surface

```
src/lib/auth/
  msg91.ts         # OTP request + verify via backend proxy
  jwt.ts           # localStorage read/write, expiry parse, cross-tab broadcast
  user.ts          # current tier, expiry, segment-irrelevance check
  useAuth.ts       # React hook, subscribes to localStorage `storage` events
```

JWT stored in `bt_auth_token`. Cross-tab unlock via the `storage` event (`tool-design-spec §3.4`).

### 7.2 Razorpay integration

```
src/lib/payments/
  razorpay.ts      # Checkout open + handler callback wiring
  verify.ts        # POST signed payload to backend /api/verify-payment
  tiers.ts         # ₹29 / ₹499 / ₹1,999 — single source of truth for prices
```

Handler callback fires in browser → POSTs to backend → backend verifies HMAC + issues OUR JWT → frontend writes to localStorage. Webhook is backup only, never the unlock trigger. Idempotency via `x-razorpay-event-id` (`engineering-decisions #3` item 5).

### 7.3 Paywall pitch resolver

`src/components/PaywallPitch.tsx` reads:
- Current tool (paywall: always-free / batch-gated / high-cost)
- Trigger (`batch-initiated`, etc.)
- Resolved segment

Renders the matching variant from `copy-spec §5` (operator / professional / individual-paying / aspirant=never). Always inline (mobile = bottom sheet); never modal mid-task.

### 7.4 Backend contract (already lives in `bharattools-backend/`)

Out of scope of this doc, but the frontend infra expects these endpoints:
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify` → JWT
- `POST /api/payments/verify` → JWT (post-Razorpay handler)
- `POST /api/payments/webhook` (server-only, backup)

Document the contract here so backend work runs in parallel.

---

## 8. i18n + content infrastructure

### 8.1 Detection (no network)

Per `engineering-decisions #9`: drop IP geolocation from the chain in `tool-design-spec §2.14`. Detection order:

```
localStorage(bt_locale) → navigator.language → "en"
```

That's it. Offline-clean, no network call.

### 8.2 Dictionary structure

Current i18n in `src/i18n/` uses dictionary lookup (`getDictionary`). Extend, don't replace.

```
src/i18n/
  en.json
  hi.json
  loader.ts        # already exists (?), extend for nested namespaces
  keys.ts          # codegen'd typed keys from JSON, autocomplete in IDE
```

42 tools × ~10 keys each = ~420 tool strings + ~150 shell strings + ~80 marketing strings ≈ 650 keys total. Manageable as one JSON file per locale.

### 8.3 Keyword index — NOT in dictionaries

The MiniSearch `keywords[]` per tool lives in the registry, not in `en.json`/`hi.json`. All language variants in one array (search-spec §3.3). Otherwise the search index needs to merge locale files at runtime — fragile.

---

## 9. Trust + SEO surface

### 9.1 JSON-LD + schema

Existing `src/components/json-ld.tsx` extended:
- `WebSite` schema on homepage
- `BreadcrumbList` on every tool page
- `SoftwareApplication` schema per tool
- `FAQPage` on `/faq`

### 9.2 OG image pipeline

Existing pattern in `src/app/*/opengraph-image.tsx`. Standardise on a single generator at `src/lib/og/`:

```
src/lib/og/
  generate.tsx     # @vercel/og or built-in next/og, single template
  variants.ts      # tool-page / lander / spec-page templates
```

WhatsApp link previews are the de facto sharing UI for this audience (`marketing-plan §10`) — OG image quality directly drives shares.

### 9.3 Sitemap + robots

Existing `src/app/sitemap.ts` extended to enumerate:
- All shipped tools (from registry, `status === "shipped"`)
- All variant routes (`/photo-resize/[exam]` for every exam in spec-db)
- All spec-reference pages (`/exam-photo-specs/[exam]`)
- Segment landers + pricing + faq + about

Sitemap regenerates at build from the registry — no manual maintenance.

### 9.4 Spec-reference pages (`/exam-photo-specs/[exam]`)

Per `marketing-plan §2.1` — the SEO + authority asset. Pure data render from spec-db. Tied to tool deep-links. Build the route once; one page per exam falls out of the spec-db automatically.

---

## 10. PDF tooling decisions to resolve

Per `engineering-decisions #5`:

- [ ] Add `pdfjs-dist` (needed for PDF→JPG, text extract, page thumbnails) — set up its worker
- [ ] Evaluate qpdf-wasm vs pdfcpu-wasm for password tools + E-Aadhaar unlock; re-estimate S→M/L
- [ ] Audit shipped `pdf-compress` — does it actually re-encode images, or only rewrite structure? If only structure, scope a real image-recompress pass
- [ ] Decide PDF Crop: honest "visual only" label or actual content strip

Resolve before any of those tools moves out of `🔨 Build next` into a sprint.

---

## 11. PWA + install lifecycle

Manifest + service worker for offline tool use (every tool already runs client-side; the only blocker is the initial JS bundle). Install nudge per `marketing-plan §9`:
- Trigger on 3rd session, not 1st
- Custom copy via `beforeinstallprompt` event
- Track installs as an Umami event (no PII)

Service worker scope: cache static assets + JS chunks aggressively; never cache user files (they're not on the network anyway).

---

## 12. Backend contract surface (`bharattools-backend/`)

The frontend infrastructure above assumes these backend endpoints exist. Listing here so they're a single audit target:

- `/api/auth/otp/request` + `/verify` — MSG91 proxy
- `/api/payments/verify` — Razorpay signature verify + JWT issue
- `/api/payments/webhook` — Razorpay backup (idempotent)
- `/api/spec-db` — public read-only spec metadata (for CLI `--spec-sync`)
- `/api/quick-send/signal` — coturn WebRTC signaling (already exists?)

Each endpoint's spec lives in the backend repo; frontend stubs use typed clients in `src/lib/api/`.

---

## 13. Build order & gates

Each gate must pass before the dependent feature starts.

| Order | Layer | Blocks |
|---|---|---|
| 1 | Tool registry + spec-db refactor | Everything downstream |
| 2 | Processing kernel (workers, blob lifecycle, pixel caps) | Any new tool page |
| 3 | Tool shells (6 + primitives) | Phase 2 tool sprint |
| 4 | Pipeline store **prototype** (no UI) | Pipeline UI + Image Editor |
| 5 | Search engine + command palette | Nav-bar search, `/tools` page |
| 6 | Analytics event bus + segment infra (layers 1–4) | Paywall pitch resolver |
| 7 | Auth (MSG91 + JWT + cross-tab) | Any gated tool |
| 8 | Razorpay integration + paywall pitch | Going live with paid tiers |
| 9 | i18n keys + spec-reference page template | Marketing Month 2 SEO push |
| 10 | OG generator + sitemap-from-registry | PR + share campaigns |

**Hard sequencing notes:**
- #1 unblocks #5, #6, #9 — do it first, do it once.
- #4 prototype is a research task — outcome may change downstream design.
- #2 + #3 are the bulk of engineering effort but they collapse per-tool work to a fraction.

---

## 14. What this plan deliberately does NOT do

- **Does not refactor imgly bg-removal.** Stays single-thread until COOP/COEP decision (`engineering-decisions #1`).
- **Does not replace Umami.** Event bus is a typed wrapper, not a new analytics stack.
- **Does not introduce a CSS-in-JS layer.** Shilp Sutra + Tailwind 4 tokens stay authoritative.
- **Does not introduce a state-management library.** React 19 + module-scope singletons + `useSyncExternalStore` cover everything below.
- **Does not introduce server components in tool pages.** Tool islands are `"use client"`; SEO content (meta, breadcrumb, FAQ, spec table) is server-rendered around them. Pattern lives in shells.
- **Does not pre-build the CLI/MCP packages.** Those are Phase 2 (`cli-mcp-spec §10`). But spec-db structure + core processing functions are shaped to be liftable later — that's all the early prep needed.

---

## 15. Open items routed back to Rudra

These need a decision before the dependent layer ships:

- [ ] `minisearch` approval (§5)
- [ ] localStorage-only segmentation signals or server shadow (§6.2)
- [ ] Razorpay payment payload + SSO surface verification (§7.2)
- [ ] qpdf-wasm vs pdfcpu-wasm for password PDF tools (§10)
- [ ] Pipeline prototype outcome — does module-scope singleton survive Next 16 App Router nav? (§4.3)
- [ ] HEIC behaviour on real ₹8k Android (`engineering-decisions #6`)
- [ ] Which tools genuinely need a worker vs main-thread (`engineering-decisions #8`)
- [ ] Quick Send TURN messaging — how do we phrase the privacy claim with coturn relays (`engineering-decisions #10`)

---

## 16. Definition of Done — infrastructure pass

Infrastructure layer is "done" (and the tool sprint can start) when:

- [ ] All 10 shipped tools migrated to registry + shell pattern with no behaviour regressions
- [ ] Processing kernel covers worker spawning, blob lifecycle, decoded-pixel guard, "0 bytes" assertion
- [ ] Pipeline prototype passes the 4 checks in §4.3
- [ ] Search engine returns sensible results for: a tool name, a Hinglish phrase, a KB number, a typo'd exam name
- [ ] Analytics events route through the bus; PII linter rejects bad payloads at compile time
- [ ] Segment scorer returns `{ primary, confidence, signals_used }` for a synthetic operator profile
- [ ] Auth flow: MSG91 OTP → JWT in localStorage → cross-tab unlock works in two browser windows
- [ ] Razorpay sandbox payment → handler → backend verify → JWT issued → unlock visible without page reload
- [ ] i18n: every shipped tool's strings load from JSON, no hardcoded JSX strings, no IP geolocation in the detection chain
- [ ] Sitemap regenerates from registry at build
- [ ] Lighthouse mobile ≥ 85 on the homepage, tools index, and one tool page
- [ ] All `engineering-decisions` items #1–#12 either resolved or explicitly deferred with a written reason
