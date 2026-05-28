# BharatTools — Tool Search Product Spec

> Research-backed spec for in-app tool discovery. With ~42 tools coming, search IS the front door — users won't browse a grid, they'll type their problem. Last updated: 2026-05-28.
> Research basis: Indian search-behaviour study + client-side search-tech evaluation + codebase touchpoint map (3 parallel research passes, May 2026).

---

## 1. Why this matters

At 10 tools, a grid works and search is a nice-to-have. At 42 tools, **search is primary navigation.** And the audience makes it harder than a typical Western SaaS search:

- They search by **problem, not tool name** ("photo ka size kam karna hai", not "image compressor")
- They search in **Hinglish** (romanized Hindi has no canonical spelling — "chota"/"chhota"/"chotta" all coexist)
- They search by **KB number** ("50kb photo", copied verbatim from the exam notification PDF)
- They **misspell** constantly ("aadhar" is more common than the official "aadhaar"; "compres", "signeture")
- They are **the most zero-result-intolerant audience in the world**

> **The single most important finding:** Google Cloud retail research — Indian users hit 5 failed searches/month (highest globally), **63% abandon a session after a failed search, 91% view the brand worse afterward.** A zero-results page is not a UX gap here; it is a brand-damage event. **Hard rule: search never returns nothing.**

The current implementation (`tools-browser.tsx`) is naive substring match on name/tagline/description. It fails on every pattern above. This spec replaces it.

---

## 2. User research findings (what to design for)

### 2.1 Query patterns
- **Problem-first for first-timers, tool-name for returners.** Mapping problem-language → tool must be internal; never make the user learn tool names.
- Real query shapes: "photo ka size kaise kam kare", "20kb ka photo kaise banaye", "background hatao photo se", "jpg ko pdf banana", "SSC photo resize", "signature 10kb se kam".

### 2.2 Hinglish / code-mixing
- ~52% romanized Hindi, ~46% English, ~1% Devanagari in the relevant audience. Most type Roman script on Gboard, not Devanagari keyboard.
- Common pattern: English noun + Hindi verb ("photo resize karna hai").
- **Spelling is chaotic and must be treated as equivalent.** Core terms + variants to index:

| Concept | Romanized variants to index |
|---|---|
| reduce/small | kam, kum, chota, chhota, chotta, ghatao |
| photo | photo, foto, fhoto, photu |
| compress | compress, compres, kompress, comprees |
| convert | convert, konvert, convart |
| join/merge | jodna, join, merge |
| send | bhejna, send, bhej |
| document | document, dacument, docs, dastavej |
| signature | signature, signeture, sign, signchar |
| size | size, saiz, siz |
| make | banana, banao, banaye |

### 2.3 Sarkari/exam vocabulary
- Three query modes: **spec-first** ("20kb photo"), **exam-name + problem** ("IBPS photo 50kb"), **portal-specific** ("uidai photo upload size").
- KB number is the primary hook. Real specs aspirants copy verbatim: SSC photo 12–20KB / sig 10–20KB; IBPS/SBI/RRB photo 50KB; NEET 200KB; UPSC 300KB.

### 2.4 Typo reality
- "aadhar" (one a) > "aadhaar" (official) in real searches. Also "adhar", "adhaar". Do NOT make the official spelling the only recognised form.
- Edit-distance-2 fuzzy tolerance is **load-bearing**, not optional, for this audience.

### 2.5 Number/unit queries
- "20kb", "20 kb", "20KB", "20 KB" must all be one query. Strip spaces, unify case.
- "200kb to 50kb", "photo under 50kb", "50kb se niche" are real phrasings.
- **The number is a tool parameter.** "50kb" should ideally open the compressor pre-set to 50KB (see §5.4 deep-link).

### 2.6 Behaviour & expectations
- Voice search is large and growing (Hindi voice +400% YoY, concentrated in Tier 2/3). Voice queries are conversational and verb-rich — must extract intent, not exact-match the sentence.
- Autocomplete is expected (Google-trained). With no query history at launch, seed suggestions from a curated static list of real Hinglish patterns.
- First-timers **leave** on zero results; experienced aspirants retry. Either way: do the translation work for them.

---

## 3. Technical approach (decided, pending Rudra sign-off on the dependency)

### 3.1 Library: MiniSearch (recommended)
Evaluated Fuse.js, MiniSearch, FlexSearch, uFuzzy, Orama. **MiniSearch wins for this use case.**

| Library | gzipped | Verdict |
|---|---|---|
| uFuzzy | 4.0 KB | Smallest, but NO scoring layer — we'd hand-build ranking. Bad trade. |
| **MiniSearch** | **5.8 KB** | **Field boosting + BM25 ranking + fuzzy + prefix, clean TS API. Pick this.** |
| Fuse.js | 8.3 KB | Fine, but Bitap ranks oddly on short queries; v7 stabilising. |
| FlexSearch | 16.8 KB | Overkill features for 42 items. |
| Orama | 24.4 KB | Heaviest despite marketing; no. |

Browser-only, no server call — fits the privacy architecture. Index build for 42 items ≈ 0–1ms. Performance is a non-issue; quality and bundle are what matter.

> **New dependency — Rudra to green-light `minisearch` before adding.** Cross-ref `engineering-decisions-for-rudra.md`.

### 3.2 The real work: the keyword index
The library is the easy 5%. The other 95% is **authoring a rich `keywords` array per tool** — every way a human might ask for it, in English + romanized Hindi + Devanagari + problem-phrasing + KB numbers + exam names. This is content work, done alongside i18n. Without it, no library helps.

### 3.3 Data schema
Extend the `Tool` type in `src/lib/tools.ts`:

```ts
interface Tool {
  // ...existing fields...
  keywords: string[]       // EN + romanized Hindi + Devanagari + problem phrases + KB + exam names
  popularityScore?: number // 0–1, tiebreaker only
}
```

Example for image-compress:
```ts
keywords: [
  // English
  "image compressor", "compress image", "reduce photo size", "shrink image", "photo size reducer",
  // Hinglish
  "photo ka size kam karna", "photo chota karo", "foto compress", "image size kam", "photo size ghatao",
  // Devanagari
  "इमेज कम्प्रेस", "फोटो साइज कम",
  // KB targets (this tool handles size)
  "20kb", "50kb", "100kb", "200kb photo", "photo under 50kb",
  // exam context
  "ssc photo size", "ibps 50kb", "neet 200kb photo"
]
```

### 3.4 Query + index normalization
Apply the same normalizer at index time (`processTerm`) and query time:
- Unit/number: `"50 kb"` → `"50kb"`, `kilobytes`→`kb`, `megabytes`→`mb`
- Hinglish phoneme collapse: `ph→f`, `kh→k`, `ch→c`, `aa→a`, `ee→i`, `oo→u` (collapses "tasveer"/"tasvir"/"tasweir")
- Strip punctuation, lowercase, collapse whitespace

### 3.5 Ranking
MiniSearch field boost: `name: 10, keywords: 4, tagline: 2, description: 1`, `fuzzy: 0.2`, `prefix: true`, `combineWith: 'OR'`. Then a light popularity re-rank (`weight 0.15`, tiebreaker only — never hijacks relevance).

### 3.6 React 19 / Next 16 integration
- Build the MiniSearch index at **module scope** (built once), NOT in `useMemo` (rebuilds on every dep change / hot reload).
- Use `useTransition` for the result update (keeps input snappy), **not** a timeout debounce — pointless at 42 items.
- Mark the search component `"use client"`. Keep MiniSearch out of server components.

### 3.7 Reference implementation
A working `searchTools()` sketch (normalizer + module-scope index + zero-result fuzzy fallback + popularity re-rank) is in the search-tech research output. Rudra to adapt into `src/lib/search.ts`.

---

## 4. Edge cases (must all be handled)

| Case | Handling |
|---|---|
| Empty query | Show all tools, sorted by popularity/category. Never blank. |
| Single char | Show all tools, or prefix-only matches. Avoid noisy fuzzy on 1 char. |
| **No results** | **HARD RULE: never blank.** Retry with `fuzzy: 0.4`; if still nothing, show "Closest tools" + popular tools + category fallback ("We don't have that — here are our photo tools"). |
| Special characters | Strip to alphanumeric in normalizer. "image/png" = "image png". |
| Very long query / paste | Cap at 100 chars before searching. |
| Devanagari input | Works natively (Unicode tokenization). Test "इमेज", "पीडीएफ". |
| KB number query | Normalize spacing/case → map to size-handling tools → ideally deep-link pre-filled (§5.4). |
| Typo'd brand term | Fuzzy + alias index catches "aadhar", "compres", "signeture". |
| Voice/conversational | Token extraction via OR-combine + fuzzy handles verb-rich sentences. |

---

## 5. Where search lives (placement map)

Codebase reality today: search exists ONLY in `ToolsBrowser` on the homepage. No global search, no command palette, no `/tools` page, no mobile search, no dedicated `/search` route.

### 5.1 Homepage tools browser — UPGRADE (exists)
`src/components/tools-browser.tsx` (the `SearchInput` at lines 36–44). Replace substring filter with the MiniSearch engine. This is the baseline win.

### 5.2 Global search in top nav — NEW (highest leverage)
`src/components/top-nav.tsx` has space before the language/theme toggles (~line 27–30). Add a search trigger here so search is reachable from **every page**, not just home. A user mid-tool who needs another tool shouldn't have to go home first.
- Desktop: inline search box OR a button that opens a command palette
- Mounts via `TopNav` which is in `layout.tsx:102` (wraps every page)

### 5.3 Command palette (Cmd/Ctrl+K) — NEW (power users)
Shilp Sutra `Dialog` is already used (`qr-scan-button.tsx`) — build the palette on it. `/` or Cmd+K to focus, arrow-key nav, Enter opens top result. Serves operators who process all day and live on the keyboard. Mobile: the nav search trigger opens the same palette as a full-screen sheet.

### 5.4 Deep-link / pre-filled results — NEW (the magic)
When a query carries a parameter, don't just link to the tool — **pre-fill it**:
- "50kb" → `/image-compress/50kb` (route already exists: `/image-compress/[size]`)
- "upsc photo" → `/photo-resize/upsc` (route exists: `/photo-resize/[exam]`)
This turns search into a one-step answer, matching how ExamMint/photokb.in work. The dynamic routes already exist — search just needs to map recognised tokens to them.

### 5.5 Dedicated `/tools` route — NEW (SEO + canonical browse)
A full searchable index page at `/tools`. Serves as: the "see all tools" destination, an SEO landing page, and the canonical place the nav search "see all results" links to. (Currently tools only live on `/`.)

### 5.6 Mobile — NEW (the majority)
`NavMenu` is desktop-only (`md:flex`); mobile has no tool navigation beyond the homepage grid. Mobile needs a visible search entry point in the top nav that opens a full-screen search sheet (the §5.3 palette in sheet form). This is the majority of users — not an afterthought.

### Placement priority
1. Upgrade homepage browser engine (§5.1) — baseline, unblocks everything
2. Global nav search + mobile sheet (§5.2, §5.6) — reach from every page
3. Deep-link pre-fill (§5.4) — the differentiating "magic"
4. Command palette (§5.3) — power users / operators
5. `/tools` page (§5.5) — SEO + canonical browse

---

## 6. i18n

- Search strings already exist: `tools.searchPlaceholder`, `searchAria`, `noResults*` in `en.json`/`hi.json` (lines ~13–19).
- New strings needed: command-palette labels, "closest tools", category-fallback copy, deep-link confirmation ("Opening compressor at 50KB").
- Placeholder should rotate real example queries in the user's language: EN "try 'UPSC', '50 KB', 'passport'…"; HI equivalent with Devanagari examples.
- The keyword index itself is language-agnostic (all variants in one array) — it is not part of the locale dictionaries.

---

## 7. Analytics (Umami, no PII)

| Event | When | Properties |
|---|---|---|
| `search_opened` | Palette/box focused | `surface` (nav/home/palette) |
| `search_query` | Debounced final query | `query_length`, `had_results` (bool) |
| `search_zero_result` | Fuzzy fallback also empty | `query` (for keyword-index gap analysis) |
| `search_result_click` | User opens a result | `query`, `result_slug`, `rank` |
| `search_deep_link` | Pre-filled tool opened | `query`, `target` |

`search_zero_result` is the most valuable — it is the backlog of keywords to add. Feed it back into the index periodically. (This is the launch substitute for query-history autocomplete.)

---

## 8. Definition of Done

- [ ] `keywords` array authored for every tool (EN + Hinglish + Devanagari + KB + exam) — the real work
- [ ] MiniSearch engine in `src/lib/search.ts`, module-scope index, normalizer applied both sides
- [ ] Homepage browser uses the engine (§5.1)
- [ ] Global nav search reachable from every page (§5.2) + mobile full-screen sheet (§5.6)
- [ ] Zero-result NEVER blank — fuzzy fallback → closest → popular → category (§4)
- [ ] Deep-link pre-fill for KB + exam queries (§5.4)
- [ ] Command palette with keyboard nav (§5.3)
- [ ] `/tools` route (§5.5)
- [ ] i18n strings for new surfaces; placeholder rotates localized examples
- [ ] Analytics events firing, `search_zero_result` captured
- [ ] Tested on real ₹8k Android: Hinglish query, KB query, typo'd query, Devanagari query all resolve correctly
- [ ] Rudra signed off on `minisearch` dependency

---

## 9. Open questions for Rudra
- Approve `minisearch` (5.8 KB) as a dependency? (See `engineering-decisions-for-rudra.md`.)
- Build command palette on Shilp Sutra `Dialog`, or is there a Command component in the design system?
- Deep-link pre-fill: confirm `/image-compress/[size]` accepts arbitrary KB values and `/photo-resize/[exam]` the exam slugs the search maps to.
