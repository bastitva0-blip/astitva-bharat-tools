# BharatTools — Copy & Positioning Spec

> Source of truth for site copy. Devalok voice (AI-RULES + voice-foundation). Confident where needed, always helpful, succinct, zero AI slop. Last updated: 2026-05-28.

---

## Positioning (locked)

- **Homepage** focuses on USPs, not segments. No "Who's it for?" cards. No nav segment switcher.
- **Segment landers exist** as URLs reached via paid ads, direct outreach, SEO buyer-intent, and footer.
- **Background segmentation** happens server-side from signals (UTM, referrer, behavior). User never picks a segment. Pitch is tailored invisibly.
- **Tier 1 landers (build now):** `/for-operators`, `/for-professionals`. Both target paying segments. Individual paying users are already served by the homepage. Aspirants are served by the homepage + Seva commitment baked into copy.

---

## 1. Homepage

### Hero
**Headline**
> India's tools for India's documents. Privately. For free where it matters.

**Sub-hero (one line)**
> Photo to spec, PDF to size, document to portal — your files never leave your device.

**Primary CTA**
> [ Browse all tools → ]

(Secondary: a tools-search input visible right under the hero — search is primary navigation at 40+ tools. See `search-spec.md`.)

---

### USP strip (five cards, scannable)

1. **Files never leave your device** — Browser-only by architecture. Verify it in your network tab.
2. **Made for Indian portals** — Exact specs for UPSC, SSC, NEET, IBPS, Aadhaar, every form that matters.
3. **Free for aspirants. Always.** — Seva. A commitment we hardcode into the product.
4. **Built for slow internet** — Works on budget Android. Works on 4G. Works in your language.
5. **No signups, no ads, no tracking** — Only the tool. Then you're gone.

---

### Tool grid

Existing `ToolsBrowser` keeps its current structure. Categories stay: Sarkari forms, Sharing & print shop. Grid order should put the validated must-haves first.

**Section heading above grid:**
> Pick a tool. Or search above.

---

### How it works (small section below grid)

> Open a tool. Drop your file. Done — locally, in your browser. We don't see it. We don't store it. We don't need to.

(Three icons across: Open · Drop · Done. Each with one-line caption. No spinner-as-server-upload visual fakery.)

---

### Trust strip (above footer)

- **Hosted in Mumbai** — Railway India.
- **Open about what we build** — `bharattools.app/about`
- **Made by [Devalok](https://devalok.in)** — Already in footer.

---

### Footer

Existing footer structure stays. Add a quiet **For** section:
- For operators
- For professionals

(De-prioritized placement. Reached via ads/outreach/SEO primarily, footer for organic discovery.)

---

## 2. `/for-operators` — Segment lander

### Hero
**Headline**
> Process 50 forms a day. Without iLovePDF's monthly bill.

**Sub-hero**
> Cyber café, CSC, photo studio — BharatTools costs ₹5.50 a day. Pays for itself in two customers.

**Primary CTA**
> [ See the operator plan → ]

---

### Why operators pick this

Three cards, factual:

1. **Built for shop speed**
   Batch processing. Single click for ten customers worth of photos. Spec-perfect for every Indian exam portal.

2. **One annual payment**
   ₹1,999 a year. No monthly bill. No card mandate. UPI once, done.

3. **No upload, no liability**
   Your customer's Aadhaar never touches a server — not ours, not anyone's. Browser-only by architecture.

---

### What you get

(List of operator-relevant tools — Photo Resize, Photo+Signature Joiner, Document Photo Maker, Print Sheet, Print Job Slip, PDF Compress, PDF Merge, Quick Send, Aadhaar Photo Crop. Each with a one-liner.)

---

### Pricing

> **₹1,999 / year. UPI. One time.**
> Commercial-use licence. Unlimited batch. Tied to this device.

(Single button — Pay via UPI. Receipt emailed. No auto-renew. No card stored.)

---

### Close (research-takeaway shape)

> Three questions if you run a shop:
> Are you charging your customers for forms they could fail?
> Do your tools work when the customer's portal asks for exactly 50 KB?
> If your hard disk gets seized tomorrow, what's on it?
> BharatTools answers the third one for you — nothing.

---

## 3. `/for-professionals` — Segment lander

### Hero
**Headline**
> Your client's Aadhaar shouldn't live on iLovePDF's servers.

**Sub-hero**
> For CAs, CS firms, travel agents, coaching offices — handle client documents without uploading them to anyone. DPDP-friendly by architecture.

**Primary CTA**
> [ See the professional plan → ]

---

### Why professionals pick this

1. **DPDP-friendly, before May 2027**
   India's data protection law enforces in 2027. Storing a client's raw Aadhaar on a foreign PDF tool is a liability you don't need. Browser-only means nothing for the regulator to fine you over.

2. **Built for office workflows**
   Aadhaar masking, PDF compress to portal limits, document photo prep, password-protect a draft, batch a folder. The tools your work actually uses.

3. **One licence, one fee**
   ₹1,999 a year. Commercial-use licence. UPI once. No subscriptions, no auto-renew.

---

### Featured tools

(Aadhaar Masking, PDF Compress, PDF Merge & Split, PDF Add Password, Document Photo Maker, Photo+Signature Joiner, Image Compress, Quick Send. Office-leaning subset.)

---

### Pricing

Same block as `/for-operators` (₹1,999/yr, commercial-use, UPI one-time).

---

### Close (inclusive shape)

> A practice for those who believe their client's documents deserve the same care as the work itself. The tools are free to try. The licence is for the work that pays.

---

## 4. Tool pages (kept task-first)

No segment switching. No "are you a professional?" prompts.

What changes:
- "Always free" badge on traffic tools (JPG to PDF, PDF Compress, PDF Merge, Image Compress) — permanent, visible.
- "Free for aspirants. Always." line on sarkari-specific tool pages — Seva commitment, visible.
- Subtle "Processing for customers? See operator pricing →" link in tool-page footer — single line, no banner.

---

## 5. Background segmentation infra (build now)

The user never picks a segment. The system tags them invisibly and tailors the paywall pitch.

### Data captured (all client-side, localStorage)

**`bt_attribution`** — set once on first visit, stable for the session lifetime.
```json
{
  "utm_source": "meta",
  "utm_medium": "cpc",
  "utm_campaign": "operator-pitch-jan",
  "utm_content": "shop-owner-video-3",
  "referrer_host": "sarkariresult.com",
  "first_seen_at": "2026-05-28T...",
  "landing_path": "/for-operators"
}
```

**`bt_signals`** — updated continuously across sessions.
```json
{
  "files_processed_session": 7,
  "files_processed_30d": 142,
  "session_count_7d": 6,
  "days_active_30d": 11,
  "business_hours_session_pct": 0.83,
  "tools_used_30d": ["photo-resize", "image-compress", "pdf-merge"],
  "device_class": "desktop"
}
```

### Segment scorer

Pure function. Reads `bt_attribution` + `bt_signals`. Returns:
```ts
type Segment = "operator" | "professional" | "individual-paying" | "aspirant" | "unknown"
type SegmentResolution = {
  primary: Segment
  confidence: number     // 0–1
  signals_used: string[] // for analytics, debugging
}
```

**Signal weights (starting heuristics, tune later):**

- UTM campaign hint → strong signal (operator-pitch → operator, etc.)
- Referrer host `sarkariresult.*`, exam portals → aspirant
- Landing path `/for-operators` → operator (strong)
- Files/session > 10 + repeat days > 3 → operator
- Business hours desktop usage > 70% → operator/professional
- Single file, occasional, sarkari tool → aspirant
- Default → individual-paying or unknown

### Where it's used

1. **Paywall pitch resolver** — when the gate fires, pitch variant matches detected segment.
   - operator → "₹5.50/day, pays for itself in two customers"
   - professional → "₹1,999/yr commercial-use licence, DPDP-friendly"
   - individual-paying → "₹19 for the next 24 hours" (impulse) or "₹499/yr — less than chai a day"
   - aspirant → **no pitch ever** (Seva)

2. **Empty-state recommendations** — homepage default tool order subtly reorders based on segment (operator sees Print Sheet + Joiner higher; professional sees PDF tools higher; aspirant sees Photo Resize highest).

3. **Cross-tool prompts** — segment-aware "next step" suggestions in the Continue Editing pipeline.

### Analytics events (Umami, no PII)

| Event | When | Properties |
|---|---|---|
| `segment_resolved` | First resolution + when changes | `segment`, `confidence`, `signals_used` |
| `pitch_variant_shown` | Paywall fires | `variant`, `segment`, `tool_id` |
| `pitch_variant_clicked` | User clicks pitch CTA | `variant`, `segment`, `tier` |

### Privacy guardrails

- All signals stay in localStorage. Nothing sent to server until the user pays (then phone-JWT auth).
- No PII in event payloads. Aggregated counts only.
- "Always free" tools never trigger the resolver — no risk of mis-pitching an aspirant.
- User can clear segmentation via a settings link (Reset preferences).

### Build order

1. UTM + referrer capture on first visit
2. Signal collection (file events already fire in analytics — extend to write `bt_signals`)
3. Segment scorer module (`src/lib/segment.ts`)
4. Paywall pitch resolver reads segment → renders matching variant
5. Empty-state reorder uses segment hint
6. Analytics events wired

Reasonable estimate: 2–3 days for layers 1–4. Layers 5–6 are polish.

---

## 6. Voice rules applied to this spec

For anyone editing the copy later:

- No banned words (synergy, leverage, navigate, robust, transformative, etc. — see AI-RULES).
- No "We at Devalok" openers. No "in today's world." No "the truth is."
- No motivational closers ("go build something great"). No engagement bait ("what do you think?").
- Conjunction-led sentences are fine. Fragments are fine. Read it aloud — if it sounds like an LLM, scrap.
- Hindi/Sanskrit only where it carries meaning. Not decorative.
- Specifics named: UPSC not "exams", iLovePDF not "competitors", ₹5.50/day not "affordable."
- Tone: warm-utility default; confident where the brand is staking ground (privacy, India-built, Seva).
