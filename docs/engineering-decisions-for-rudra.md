# Engineering Decisions — For Rudra

> Surfaced during the BharatTools plan audit (2026-05-28). These are technical calls that need Rudra's judgment + validation against the actual stack — not product decisions. Each has context, the options considered, and what to verify. Don't build the dependent feature until the relevant item is resolved.

---

## 1. COOP/COEP Cross-Origin Isolation — gates bg-removal

**Problem:** ONNX Runtime Web (used by `@imgly/background-removal`) wants WASM threads for acceptable speed → needs `SharedArrayBuffer` → requires response headers:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```
Setting these breaks every cross-origin resource lacking `Cross-Origin-Resource-Policy: cross-origin`: imgly foreign CDN (the 50MB model), Umami script, socket.io backend, anything third-party.

**Options:**
- A — Enable COOP/COEP, self-host everything (model on Indian storage, Umami self-hosted, socket.io sends CORP). Full sovereignty, but blocks bg-removal on all infra work.
- B — No COOP/COEP, run ONNX single-threaded. ~3–5x slower, but ships now. imgly defaults to single-thread gracefully.
- C — Proxy the model through own domain via service worker. Complex, fragile.

**Leaning B now → A in Phase 2** once Umami + model are self-hosted on Indian storage. Don't block shipping on sovereignty infra.

**Rudra to verify:**
- [ ] Does imgly bg-removal actually run acceptably single-threaded on a ₹8k Android (2GB RAM)? Benchmark it.
- [ ] What's the real speed delta single vs multi-threaded for our image sizes?
- [ ] When we flip to COOP/COEP later, does socket.io WebRTC signaling survive it? (CORP on backend responses)
- [ ] Decision: ship B or bite the bullet on A from day one?

---

## 2. "Continue Editing" Pipeline — blob transport across navigation

**Problem:** The pipeline passes a processed image blob from Tool A to Tool B without re-upload. The originally-specced transport is broken:
- React context resets on Next.js hard navigation
- `sessionStorage` can't store a Blob (strings only)
- `blob:` URLs are revoked on document unload

**Proposed approach (needs validation):**
- Primary: module-level singleton (`pipelineStore.ts`) holding `Blob` at module scope — survives soft (client-side `<Link>`) navigation
- Insurance: async write to IndexedDB for hard-refresh recovery, cleared after load or 30 min idle

```ts
// pipelineStore.ts — sketch, not final
let _blob: Blob | null = null
let _meta: { name: string; type: string; dims?: { w: number; h: number } } | null = null
export const pipelineStore = {
  set(blob: Blob, meta: typeof _meta) { _blob = blob; _meta = meta },
  get() { return _blob ? { blob: _blob, meta: _meta } : null },
  clear() { _blob = null; _meta = null },
}
```

**Rudra to verify (prototype BEFORE any pipeline UI is designed):**
- [ ] Does a module-level singleton actually survive Next.js 16 App Router client navigation between two tool routes? (Confirm — App Router may re-evaluate modules differently than expected.)
- [ ] Build a throwaway prototype: process blob on `/photo-resize`, click "Continue", arrive at `/image-compress` with blob pre-loaded. Prove it works on soft nav AND recovers on refresh.
- [ ] Is IndexedDB the right recovery store, or is the refresh case rare enough to drop entirely?
- [ ] Memory: confirm `URL.revokeObjectURL` is called on every preview blob URL — no leaks across a 5-step pipeline.

**This is the load-bearing assumption of an entire phase. Prototype first, design UI second.**

---

## 3. Razorpay Payment → JWT → localStorage loop

**Problem:** Spec said "webhook fires → token written to localStorage." A server-side webhook cannot reach a browser's localStorage. Loop is broken as written.

**Proposed flow:**
```
Razorpay Checkout (their OTP + payment)
  → handler(response) callback fires IN BROWSER with razorpay_payment_id
  → frontend POSTs to backend /api/verify-payment
  → backend verifies signature, issues our own JWT (tied to phone from payment)
  → frontend writes JWT to localStorage
Backend webhook = backup record only, not the auth trigger
```

**Rudra to verify (confirm with Razorpay docs/contract):**
- [ ] Does Razorpay Checkout `handler` callback reliably fire on UPI payments (not just cards)?
- [ ] Does the payment payload/webhook actually give us the verified phone number we can tie a JWT to?
- [ ] Razorpay ToS: are we allowed to treat their Magic Checkout OTP as evidence of phone control for our auth? (Legal-adjacent — flag if unclear, may need MSG91 OTP as the real first-auth instead.)
- [ ] JWT lifetime + signing approach. Where's the secret? (Railway env)
- [ ] What's the verify-payment endpoint's idempotency story (double-fire, retry)?

---

## 4. Next.js 16.2.6 — unvalidated API surface

**Problem:** AGENTS.md explicitly warns Next.js 16 has breaking changes vs training data. `node_modules` not installed. Every routing/metadata/config assumption is currently unverified.

**Action (one-time, before Phase 2 build):**
- [ ] `bun install`
- [ ] Read `node_modules/next/dist/docs/` — App Router, `generateMetadata`, client/server boundaries, config, any migration notes
- [ ] Confirm how `generateMetadata` works for variant routes (`/photo-resize/[exam]`) — server-rendered meta + client tool island split
- [ ] Confirm `"use client"` boundary pattern: server shell (SEO content + meta) wrapping client tool island

---

## 5. PDF tooling — library gaps

**Problems found in tools-list:**

**5a. pdf-lib does NOT do password encryption/decryption.**
- "PDF Add Password" + "PDF Remove Password" listed as "S, pdf-lib supports" — wrong. No encrypt API in pdf-lib.
- [ ] Evaluate alternatives: qpdf compiled to WASM, or pdfcpu-wasm. Bundle weight? Browser viability?
- [ ] Re-estimate both tools as M/L, new dependency.

**5b. pdfjs-dist is NOT in package.json but 3 tools need it.**
- PDF to JPG/PNG, PDF Text Extractor, PDF Reorder (page thumbnails) all need pdfjs render.
- [ ] Add `pdfjs-dist`. Set up its worker. It's ~1MB+ with its own WASM — confirm bundle/load impact.

**5c. PDF Compress capability check.**
- pdf-lib only rewrites object structure — it does NOT recompress/downsample embedded images.
- [ ] Verify what the SHIPPED pdf-compress tool actually does. If it claims meaningful compression of scanned image-heavy PDFs via pdf-lib alone, output barely shrinks. Real compression = re-encode images via canvas + rebuild.

**5d. PDF Crop is visual-only with pdf-lib.**
- pdf-lib crop changes CropBox/MediaBox — content still in the file. For a privacy brand, "cropped" data that's still there is a footgun.
- [ ] Decide: accept visual crop with honest labeling, or actually strip content (harder).

---

## 6. HEIC conversion — crash risk on target device

**Problem:** `heic2any` wraps libheif WASM (~2–3MB). Memory-hungry, OOM-crashes on multi-MB iPhone HEICs on 2GB Android. No native HEIC decode on Android Chrome. This is the single most crash-prone tool on the exact target device.

**Rudra to verify:**
- [ ] Test heic2any on a real ₹8k Android with a real 4–5MB iPhone HEIC. Does the tab survive?
- [ ] Implement hard input-size cap + downscale-before-decode. What caps?
- [ ] Handle failure gracefully (don't white-screen).
- [ ] Re-estimate: this is RISK/M, not S.

---

## 7. Memory & decoded-pixel caps

**Problem:** Spec caps on file bytes ("warn >10MB"). But OOM comes from decoded pixels, not file size — a 10MB HEIC decodes to a 50MP+ RGBA buffer (~200MB).

**Rudra to define:**
- [ ] Per-tool cap on decoded pixel dimensions (e.g., max 4000×4000 before processing), not file bytes.
- [ ] Downscale strategy when input exceeds cap.
- [ ] Explicit teardown: `revokeObjectURL`, release ONNX session arena buffers after each op.

---

## 8. Web Worker reality check

**Problem:** Spec says "all heavy computation in a Web Worker." Not universally achievable:
- Canvas 2D filters + `toBlob` need DOM canvas on main thread unless `OffscreenCanvas`
- `react-image-crop` is main-thread by definition
- pdf-lib worker = fine; pdfjs has own worker; imgly has own worker

**Rudra to decide:**
- [ ] Which tools genuinely run in a worker vs main thread? (Don't gate Definition-of-Done on a literal "every tool uses a worker.")
- [ ] Is `OffscreenCanvas` reliable enough on target Android Chrome to bother?

---

## 9. i18n mechanism (not the content — the plumbing)

**Problem:** Spec mandates language detection order including IP geolocation — which requires a network call, contradicting "browser-only / works offline / 0 bytes sent."

**Rudra to decide:**
- [ ] Drop IP geolocation from detection? (browser/OS locale → localStorage → English default — no network)
- [ ] i18n library choice or minimal custom dictionary? (none in deps yet; existing pdf-compress/pdf-merge use getCurrentLocale/getDictionary — extend that?)

---

## 10. Quick Send — TURN relay vs "0 bytes to server" claim

**Problem:** Indian mobile carriers use CGNAT heavily → P2P WebRTC will fail to connect often without a TURN relay. But TURN relays the bytes through a server — denting the "0 bytes to server" claim for this tool.

**Rudra to decide:**
- [ ] Self-host coturn on Railway Mumbai (already on the to-do). When TURN is used, bytes pass through our server (encrypted, not stored) — how do we phrase the privacy claim honestly? ("Not stored" stays true; "never touches a server" does not when TURN relays.)
- [ ] Measure: what % of connections need TURN on real Indian mobile networks?

---

## Build-Order Gate

Resolve before the dependent feature is built:
- **#1, #6, #7, #8** → before bg-removal / image tools
- **#2** → before any "Continue Editing" pipeline work (prototype first)
- **#3** → before paywall / auth
- **#4** → before ANY new route
- **#5** → before the affected PDF tools (re-scope password tools, add pdfjs-dist)
- **#9** → before i18n rollout
- **#10** → before Quick Send sovereignty messaging is finalized
