# BharatTools — Copy & Positioning Spec

> Source of truth for site copy. Devalok voice (AI-RULES + voice-foundation). Confident where needed, always helpful, succinct, zero AI slop. Last updated: 2026-05-28.

---

## Positioning (locked)

- **Homepage** focuses on USPs, not segments. No "Who's it for?" cards. No nav segment switcher.
- **Segment landers exist** as URLs reached via paid ads, direct outreach, SEO buyer-intent, and footer.
- **Background segmentation** happens server-side from signals (UTM, referrer, behavior). User never picks a segment. Pitch is tailored invisibly.
- **Tier 1 landers (build now):** `/for-operators`, `/for-professionals`. Both target paying segments. Individual paying users are already served by the homepage. Aspirants are served by the homepage + Seva commitment baked into copy.

---

## 1. Homepage — [LOCKED 2026-05-28]

### Hero

**Eyebrow badge**
- EN: `Browser-only · Made in India`
- HI: `केवल ब्राउज़र में · भारत में निर्मित`

**Title (3 statements, period-separated; accent on "Privately")**
- EN lead: `India's tools for India's documents.`
- EN accent: `Privately.`
- EN trail: `For free where it matters.`
- HI lead: `भारत के दस्तावेज़ों के लिए, भारतीय टूल्स।`
- HI accent: `निजी रूप से।`
- HI trail: `ज़रूरी काम के लिए मुफ़्त।`

**Rendering note:** `HeroAurora` currently splits into `titleLead + titleAccent` joined by a space + trailing period. Needs extension to support `titleAccent` mid-sentence + `titleTrail` to match the 3-statement structure. Engineering: add `titleTrail` prop OR rewrite the `<>{lead} <span>{accent}</span>{trail}</>` pattern in `page.tsx`.

**Sub-hero (split: main + muted)**
- EN main: `Photo to spec. PDF to size. Document to portal.`
- EN muted: `Your files never leave your device.`
- HI main: `फोटो सही माप में। PDF सही साइज़ में। दस्तावेज़ पोर्टल के लिए तैयार।`
- HI muted: `आपकी फाइलें आपके डिवाइस से बाहर नहीं जातीं।`

**Search input (under sub-hero, full width on mobile, max-w-md on desktop)**
Placeholder rotates real query examples — see `search-spec.md` for the search engine itself. Existing `tools.searchPlaceholder` dict key works.

---

### USP strip (five cards) — NEW SECTION (between Hero and ToolsBrowser)

Engineering: add a new `<UspStrip />` component rendering five cards in a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` layout. Each card = icon + title + one-line description.

**Card 1**
- EN title: `Files stay on your device`
- EN desc: `Browser-only by architecture. Verify it in your network tab.`
- HI title: `फाइलें आपके डिवाइस पर ही रहती हैं`
- HI desc: `आर्किटेक्चर से ही ब्राउज़र-ओनली। नेटवर्क टैब में देख लीजिए।`

**Card 2**
- EN title: `Made for Indian portals`
- EN desc: `Exact specs for UPSC, SSC, NEET, IBPS, Aadhaar — every form that matters.`
- HI title: `भारतीय पोर्टल्स के लिए`
- HI desc: `UPSC, SSC, NEET, IBPS, आधार — हर ज़रूरी फॉर्म की सटीक स्पेक्स।`

**Card 3**
- EN title: `Free for aspirants. Always.`
- EN desc: `Seva. A commitment we hardcode into the product.`
- HI title: `अभ्यर्थियों के लिए मुफ़्त। हमेशा।`
- HI desc: `सेवा। एक प्रतिबद्धता, प्रोडक्ट में ही रखी हुई।`

**Card 4**
- EN title: `Built for slow internet`
- EN desc: `Works on budget Android. Works on 4G. Works in your language.`
- HI title: `धीमे इंटरनेट के लिए बना`
- HI desc: `बजट एंड्रॉइड पर। 4G पर। आपकी भाषा में।`

**Card 5**
- EN title: `No signups, no ads, no tracking`
- EN desc: `Only the tool. Then you're gone.`
- HI title: `साइनअप नहीं, विज्ञापन नहीं, ट्रैकिंग नहीं`
- HI desc: `बस टूल। फिर आप गए।`

---

### Tool grid

Existing `ToolsBrowser` keeps its current structure. Categories stay (Sarkari forms, Sharing & print shop). Grid order: validated must-haves first (per `tools-list.md` re-tiering).

**Section heading above grid** (NEW — add to `ToolsBrowser`)
- EN: `Pick a tool. Or search above.`
- HI: `टूल चुनें। या ऊपर खोजें।`

---

### How it works — NEW SECTION (below tool grid)

Three icons across. Each = icon + one-word step + caption.

**Step 1**
- EN: `Open` — `Open a tool.`
- HI: `खोलें` — `कोई टूल खोलें।`

**Step 2**
- EN: `Drop` — `Drop your file.`
- HI: `डालें` — `अपनी फाइल डालें।`

**Step 3**
- EN: `Done` — `Done. In your browser. On your device.`
- HI: `हो गया` — `हो गया। आपके ब्राउज़र में। आपके डिवाइस पर।`

**Caption below the three steps**
- EN: `We don't see it. We don't store it. We don't need to.`
- HI: `हम देखते नहीं। हम स्टोर नहीं करते। हमें ज़रूरत नहीं।`

---

### Trust strip — NEW SECTION (above footer)

Three small items, horizontal, muted:

- EN: `Hosted in Mumbai · Made in India · Built by [Devalok](https://devalok.in)`
- HI: `मुंबई से होस्टेड · भारत में निर्मित · [देवालोक](https://devalok.in) द्वारा`

---

### Footer

Existing structure stays (already updated with "Built by Devalok" attribution). Add a quiet **For** column:
- EN: `For operators` → `/for-operators`, `For professionals` → `/for-professionals`
- HI: `ऑपरेटर्स के लिए`, `प्रोफेशनल्स के लिए`

De-prioritized placement. Reached via ads/outreach/SEO primarily; footer is fallback for organic discovery.

---

### Dictionary mapping (what changes in `en.json` / `hi.json`)

| Existing key | Action |
|---|---|
| `home.badge` | UPDATE — new badge text |
| `home.titleLead` | UPDATE — new lead |
| `home.titleAccent` | UPDATE — new accent |
| `home.titleTrail` | **ADD (new key)** |
| `home.subtitleMain` | UPDATE — new copy |
| `home.subtitleMuted` | UPDATE — new copy |
| `home.uspCards[]` | **ADD (new key)** — array of 5 cards, each `{ title, desc }` |
| `home.gridHeading` | **ADD (new key)** |
| `home.howItWorks.step1Title/desc` etc. | **ADD (new keys)** |
| `home.howItWorks.caption` | **ADD (new key)** |
| `home.trustStrip` | **ADD (new key)** |
| `footer.forOperators` | **ADD (new key)** |
| `footer.forProfessionals` | **ADD (new key)** |

Existing `home.titleLead`/`titleAccent` ("Har Sarkari form ka saathi") moves to where? **The line stays valuable** — it's already in `footer.tagline`. Keep it there. The homepage hero shifts to the broader USP-led headline; the sarkari-saathi line lives on as the footer tagline + becomes the headline on `/for-aspirants` if/when that lander is built.

---

### Code changes summary (for Rudra / dev session)

1. Extend `HeroAurora` → add `titleTrail` prop, or replace title rendering in `page.tsx` with the 3-statement structure.
2. New component: `UspStrip` (5 cards, responsive grid).
3. Update `ToolsBrowser` → add a section heading above the grid.
4. New component: `HowItWorks` (3 steps + caption).
5. New component: `TrustStrip` (3 items, muted, above footer).
6. Update `Footer` → add "For" column.
7. Update `en.json` + `hi.json` with all new keys.
8. Hindi review by a native speaker before shipping (drafts above are workable but not native-edited).

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
