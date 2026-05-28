# BharatTools — Marketing Plan

> Comprehensive marketing system. Companion to `copy-spec.md` (positioning), `research-findings.md` (evidence), `tools-list.md` (product), `search-spec.md` (discovery). This doc covers funnel + channels + assets the others don't.
> Last updated: 2026-05-28.

---

## 0. Marketing-eye flags on existing decisions

Before adding plans, three things a marketing lens spots in what's already locked:

1. **"No ads ever" + free-where-it-matters cuts paid acquisition options.** The entire category survives on ads. We've ruled them out for revenue, but we still need paid acquisition to compete with iLovePDF's organic dominance. Net: paid spend goes to *us* placing ads on Meta/Google, not to us *running* ads on our site. That distinction matters — budget the spend.

2. **The operator tier has no referral mechanic.** Operators talk to other operators constantly (CSC Telegram, café WhatsApp groups). That's free distribution we're not capturing. Build it.

3. **The Don't-WhatsApp-your-Aadhaar campaign is gold but underdeveloped.** It's one line in the strategy doc. Needs a full creative brief, asset list, channel plan, landing page, follow-up sequence. Treat it as a campaign, not a tagline.

---

## 1. Funnel map

| Stage | Goal | Surfaces |
|---|---|---|
| Awareness | Land BharatTools in the mental model | SEO long-tail, PR (DPDP / Don't-WhatsApp), coaching channel mentions, Meta ads |
| Consideration | First tool use, no friction | Homepage, tool pages, search |
| Activation | Successful first task | Tool UX, "Continue Editing" pipeline, success state |
| Conversion | Hit pay tier or stay loyal free | Paywall pitch (segment-aware), pricing page, segment landers |
| Retention | Return next time they have a doc task | Lifecycle comms, PWA install, spec-change emails, new-tool launches |
| Advocacy | Tell another operator / aspirant | Quick Send virality, operator referral, organic word-of-mouth |

Every channel and asset below maps to one or more stages.

---

## 2. Acquisition channels

### 2.1 SEO (primary — slow but compounding)

The single most important long-term lever. Tools-suite competition is won here.

**Three layers of SEO pages to build:**

| Layer | What | Target query intent | Examples |
|---|---|---|---|
| Tool pages | Direct utility | "compress photo to 50kb" | `/image-compress/50kb`, `/photo-resize/upsc` |
| **Spec reference pages (NEW)** | Authority + long-tail | "UPSC 2026 photo requirements" | `/exam-photo-specs`, `/exam-photo-specs/upsc-2026`, `/aadhaar-photo-requirements` |
| Segment landers | Buyer intent | "cyber cafe document tools india" | `/for-operators`, `/for-professionals` |
| Comparison pages | Late-funnel | "ilovepdf alternative india" | `/vs/ilovepdf`, `/vs/smallpdf` |

**Spec reference pages = the SEO + authority play we keep flagging.** Each exam gets a sortable, citable, regularly-updated spec table (photo size, signature size, format, background, file type, official notification link, last-verified date). These rank for the long-tail queries aspirants and operators copy verbatim from notification PDFs. Also: the most credible "we know what we're talking about" signal. Build these as the spec DB matures (Phase 1, 10 exams minimum).

**On-page SEO checklist per page type** is already in `tool-design-spec.md §2.15`. Extend the same checklist to landers + spec pages.

**Internal linking strategy:**
- Spec reference page → links to the relevant tool (with preset deep-link)
- Tool page → links to spec reference for context
- Homepage → links to top 5 spec reference pages in a "Spec library" footer block

### 2.2 Paid ads (Meta primary, Google search for high-intent terms)

**Meta — 3 campaign types:**

1. **"Don't WhatsApp your Aadhaar"** (broad reach, brand + Quick Send)
   - Target: people who recently took loans, changed jobs, applied for insurance (Meta interest categories cover all of these)
   - Creative: "You just sent your Aadhaar on WhatsApp. It's on Meta's servers. Here's what you should've used."
   - Lands on: dedicated `/quick-send` page with full privacy story + "Hold for 24 hours" mode for async cases
   - Outcome metric: Quick Send sessions, suite discovery rate from those sessions

2. **Operator pitch** (narrow, conversion-focused)
   - Target: small business owners running cyber café / CSC / photo studio profiles
   - Creative: "Process 50 forms a day. Without iLovePDF's monthly bill. ₹5.50/day."
   - Lands on: `/for-operators`
   - Outcome metric: operator-tier purchases

3. **Aspirant Seva** (awareness, NOT conversion — free segment by design)
   - Run during exam notification windows (high-volume seasonal spikes)
   - Creative: "Free, always, for every aspirant. UPSC, SSC, NEET, IBPS. No signups."
   - Lands on: a Seva-framed page (could be homepage with `?utm_campaign=seva-aspirant` triggering segment-aware messaging via segmentation infra)
   - Outcome metric: aspirant traffic + Seva brand mentions

**Google search ads:**
- Bid only on high-intent transactional terms ("photo resize for ssc cgl", "compress aadhaar photo to 50kb")
- Never bid on brand terms (ours) or generic head terms (too expensive, low return)
- Lands on: deep-linked tool page with the parameter pre-filled

### 2.3 Coaching channel partnerships (untapped scale)

Big YouTube coaching channels (Unacademy creators, PW Pathshala, Adda247 instructors, regional channels) routinely tell aspirants which tool to use for photo resize. **Get on that recommendation list.**

**Approach:**
1. Identify 50 channels by exam vertical (UPSC, SSC, banking, NEET, JEE, state PSCs).
2. Outreach with: free-forever-for-aspirants commitment, browser-only privacy angle, sample preset-based deep link they can paste in their description.
3. Offer: a per-channel referral URL (`?utm_source=channel-name`) so they can track traffic they sent (and we can credit them in our Trust page).
4. Zero monetary payment. The value to them is: a fast, free, swadeshi tool they can confidently recommend.

This is the highest-leverage cheapest distribution play available. **Embedded mention = years of evergreen traffic.**

### 2.4 Community presence

**Operator side:**
- CSC operator Telegram groups (state-wise, 100s exist). Identify 5–10 most-active.
- Café-owner WhatsApp groups (regional).
- Don't spam. Present at one launch moment ("BharatTools — Indian operators built it for you. Free to try, ₹1,999/yr if it pays for itself."). Lurk after.

**Aspirant side:**
- Reddit `r/UPSC`, `r/SSCgl`, `r/IndianAspirants`, vertical exam subs.
- Quora answers in long-tail "how to compress photo to 50kb" threads.
- Discord servers for major exam prep communities.

**Comms tone:** founder-led, named (Mudit), zero corporate, never spammy. Show up when relevant. Vanish when not.

### 2.5 PR moments (3 named hooks)

1. **DPDP enforcement angle** (Nov 2026 / May 2027 milestones)
   Pitch: "Indian-built privacy-by-architecture document tool ready for DPDP Act enforcement." Outlets: YourStory, Inc42, Medianama, ETtech, MoneyControl Tech. Tied to specific compliance dates = newsworthy moment.

2. **"Don't WhatsApp your Aadhaar"** as a campaign launch
   Pitch: a campaign + product launch story. Provocative angle, founder-led. Get one big publication, then ride the social wave.

3. **Aadhaar Masking standalone tool**
   Pitch: "First free browser-side Aadhaar masking tool — UIDAI mandates it, until now nobody made it easy." This is the unique-in-India tool nobody else has. Lead with it. The Privacy Insider / Indian Express / The Hindu Tech.

**PR readiness checklist:**
- Founder bio (Mudit + Devalok backstory) on `/about`
- Press kit page (`/press`): logo, brand assets, screenshots, contact, fact sheet
- 1-page founder note ready to send when journalists ask "why did you build this?"

### 2.6 Referral mechanics (NEW — was missing)

**Quick Send is already inherently viral.** Sender uses tool → receiver gets a link → receiver hits BharatTools, processes the file they just received, becomes a user. Free virality, no incentive needed. Make sure:
- Quick Send received-file landing page has a clean "Process this further" prompt linking to relevant tools.
- Receivers see the privacy framing too (it's why their sender chose us).

**Operator referral (NEW — paid program):**
- Refer another operator → they buy → you get 3 months added to your annual.
- Tracked via referrer's account (their phone-JWT) + new operator's first purchase.
- Cap: 3 referrals/year per operator = 9 months bonus max.
- Pitch in the operator dashboard, operator-pitch emails, segment lander footer.
- Why this works: operators talk to operators constantly. Free spread to a high-LTV segment.

**Coaching institute referral (lighter):**
- Coaching brand gets a co-branded subdomain (Phase 2 / Year 2 — already noted in hidden gems).
- Earlier-stage: give them a tracking URL and credit on the Trust page.

---

## 3. Content marketing

### 3.1 Spec library (`/exam-photo-specs`)

(Detailed in §2.1.) **Primary SEO + authority asset.** Build first.

### 3.2 Tutorial content (low-effort, high-clarity)

For each top 10 tool: a 30–60 sec tutorial GIF/video showing the flow. Embedded on tool page + shareable on WhatsApp/Telegram (the actual distribution channel for Tier-2 users).

No fancy editing. Screen-rec on mobile, captioned in Hindi + English. Total cost: a weekend.

### 3.3 Blog (deferred)

Blog content is high-cost / low-yield until tool pages and spec library are ranking. Defer to Year 2. The spec library doubles as the content moat in the meantime.

### 3.4 FAQ page (`/faq`)

NEW. Covers:
- "Are my files really not uploaded? How do I verify?" (with network-tab screenshot)
- "Why ₹19 if iLovePDF is free?" (the honest answer: free elsewhere = ad-monetized; we sell speed/no-ads/no-uploads)
- "What if my exam form gets rejected? Will you refund?" (yes — points to refund policy)
- "What payment methods?" (UPI; no card storage)
- "Are you DPDP-compliant?" (yes, by architecture)
- "Where's my data hosted?" (Mumbai; no client doc ever sent)
- "Hindi mein hai?" (yes + roadmap)

FAQ ranks for long-tail "is bharattools safe" type queries. Also: reduces support load.

---

## 4. Lifecycle comms (NEW — was missing)

The user pays via UPI → webhook captures email (optional, opt-in at checkout) and phone. Use both sparingly.

### 4.1 Email/WhatsApp sequences

**Post-purchase (within 1 hour):**
- Receipt + invoice (GST-ready)
- One-line confirmation: "Pro until [date]. No subscription. No renewal.")
- Quick link to most-used tools for their segment

**3 days after first purchase (annual buyers):**
- "How's it going? Top 3 tools other [aspirants/operators/professionals] use most."
- Soft introduction to a tool they haven't tried

**14 days before annual expiry:**
- "Your annual pass expires on [date]. One-click renew. Or let it lapse — no auto-charge."

**Spec change alert (operator + professional only):**
- "UPSC just updated photo spec for 2027 notifications. We've updated our preset. Confirm your saved preset still works."
- Builds trust, justifies the operator tier (we maintain accuracy).

**Quarterly stats (operator only):**
- "You processed X forms this quarter. Saved Y hours vs single-file processing." (Optional — opt-in.)
- Reinforces value, reduces churn.

**Tool launch (all paid):**
- "New tool: PDF Split. Already included in your plan."

### 4.2 Channel choice

**WhatsApp Business** (for India, this beats email 5:1 on engagement):
- All transactional + lifecycle goes via WhatsApp where possible.
- Renewal nudges, receipts, spec updates.
- Requires DLT-cleared template messages (same DLT setup as MSG91).

**Email** as backup + for users who explicitly prefer it. Use a sober transactional template (no marketing fluff).

**No newsletter.** Newsletters die. Use targeted spec alerts + tool launches instead.

---

## 5. Social proof

We have none today. Capture it from day one.

### 5.1 Capture mechanism

- After 5th successful tool use in a session, soft prompt: "Was this useful? Tap a face." (3 emoji scale — no text required.) Anonymous, locally-stored, aggregate counter displayed on tool pages.
- After a paid user's 10th processed file: "Mind if we share that as a usage proof? (Anonymous.)" Opt-in.
- Pay-confirmation page: "Tell other operators why you bought BharatTools." Single field. Anonymous if they want. Pulled into the operator lander.

### 5.2 Display

- Homepage trust strip: "X photos processed today" (live counter, anonymous, no PII).
- Operator lander: "200+ shops use BharatTools" (once true). Logo wall optional later.
- Tool page corner: "8,432 used this tool this month."
- Press page: any media mentions, in chronological order with publication logos.

### 5.3 Don't fake numbers

Real metrics or none. Inflated counters destroy trust the day someone screen-records the page reloading and the number staying suspiciously rounded.

---

## 6. About / brand-story page (`/about`)

Exists but unspec'd as a marketing surface. It should carry:

- **The founder story** — Mudit, Devalok, why a design studio is building tools for sarkari forms. The honest "I watched my cousin upload her Aadhaar to a foreign PDF site to compress a passport photo for UPSC — and I wondered why there isn't an Indian-built, Indian-private alternative." (Replace with your real moment.)
- **Why "BharatTools"** — the name, the commitment, the swadeshi position. The actual reason, stated plainly.
- **What's free, what's paid, why** — transparency = trust. Especially with the Seva commitment.
- **The team** — Mudit + Rudra, named, photo, brief background. Indian customers buy from real people, not from logos.
- **How we make money** — explicit: operators + professionals pay, aspirants don't, no ads, no data sale. The directness IS the differentiator.

Voice: warm-reflective register (per voice-foundation). Founder voice, "I" allowed on this page.

---

## 7. Trust artifacts

Beyond the privacy page:

- **`/how-it-works`** — diagram + verification challenge. "Open devtools → Network tab → process a file → see zero outbound requests for the file itself." Verifiable claim, not a slogan.
- **`/security`** — for buyers asking: TLS, no data at rest, Mumbai hosting, what we *do* log (Umami events, no PII), how we handle support.
- **`/privacy`** — fix the existing contradiction with Umami Cloud first (already in action items).
- **`/transparency`** (Phase 2) — quarterly post: who asked us for data (nobody, ever), what spec changes we made, what tools we shipped, what broke.

---

## 8. Crisis playbook

When (not if) a spec is wrong and an aspirant's form bounces:

1. **Apologize publicly within 24 hours** (Twitter/X, WhatsApp Status, in-app banner).
2. **Identify scope** — which preset, how many users hit it, dates affected.
3. **Refund proactively** — if they paid for that specific tool use, refund without asking. (Brand cost > refund cost.)
4. **Fix the spec + add automated validation step** (so it doesn't happen again).
5. **Public post-mortem** — what happened, why, what we changed. Builds trust *more* than no incident would have.

Trust is built in how mistakes are handled, not in claiming none will happen.

---

## 9. PWA / install lifecycle

PWA install nudge spec already in tool-design-spec.md §2.12. Marketing additions:

- **Trigger** = 3rd session, not 1st (no "install us now" desperation).
- **Copy** = "Install for 2-tap access. Same tool, no app store." Not "Save to home screen for the best experience" (corporate slop).
- **Post-install onboarding** = 1 screen, 3 lines. "Welcome. Files still stay on your device. Always free for aspirants." Then send them to where they were going.

PWA installs correlate strongly with retention. The single highest-leverage Phase 1 retention move.

---

## 10. OG images & sharing

Every shareable page needs an OG image. Existing tool routes have `opengraph-image.tsx` — extend pattern:

- Homepage OG: hero line + small tool icons grid.
- `/for-operators` OG: "₹5.50/day. Pays for itself in 2 customers."
- `/for-professionals` OG: "Your client's Aadhaar shouldn't live on iLovePDF's servers."
- `/quick-send` OG: "Don't WhatsApp your Aadhaar."
- `/exam-photo-specs/[exam]` OG: exam name + spec headline.

WhatsApp link previews = de facto sharing UI for this audience. OG image quality = first impression.

---

## 11. Pricing page (NEW — `/pricing`)

Standalone canonical page, linked from every pitch and footer.

**Structure:**
1. **One sentence on philosophy** — "Free for aspirants, always. ₹19/24hrs or ₹499/yr if you need batch. ₹1,999/yr for shops and offices."
2. **Three tier cards** — clean, ₹/day under each, what unlocks.
3. **What's free forever** — explicit list. Removes "is this a trick?" anxiety.
4. **Refund policy** — the legally-correct version, plus the Grievance Officer name and email.
5. **FAQ** — short. Tax invoice? GST? UPI only? Refund flow?

Voice: confident-utility. No upsell pressure. The pitch is in the segment landers; this page is for users who arrived skeptical.

---

## 12. Business analytics dashboard (NEW)

Umami event spec exists (`tool-design-spec.md §2.16`). What's missing: a single dashboard that surfaces business metrics, not just events.

**Top-of-funnel:**
- WAU, MAU, sessions/user
- Top traffic source (channel attribution from `bt_attribution`)
- Top tools by usage

**Conversion:**
- Free → ₹19 / ₹499 / ₹1,999 conversion rate per segment
- Paywall pitch shown → clicked → converted rate per segment
- Top zero-result search queries (keyword index gaps — from search-spec)

**Retention:**
- 7-day / 30-day / 90-day return rate per segment
- Paid user retention cohorts
- Renewal rate (annual tiers)

**Quality signals:**
- `process_error` rate per tool
- Top error types (worth fixing)
- Spec change events (when an exam-body PDF triggers an update)

Self-host on Railway Mumbai (same Umami instance, custom queries). Founder-readable, not analyst-only.

---

## 13. Build order

Roughly six month-blocks. Items in each block can run in parallel.

**Month 1 (launch readiness):**
- Homepage copy + USP strip + tool grid reorder
- Pricing page (`/pricing`)
- About page rewrite
- FAQ page
- 2 segment landers (`/for-operators`, `/for-professionals`)
- Background segmentation infra (§5 in copy-spec, items 1–4)
- OG images for landers + homepage + Quick Send

**Month 2 (acquisition opens):**
- Spec reference pages — 10 exams minimum (`/exam-photo-specs/[exam]`)
- Coaching channel outreach (50 channels)
- First Meta ad campaign — operator-pitch
- WhatsApp Business onboarding (DLT templates approved)
- Social proof capture mechanism

**Month 3 (PR + Quick Send campaign):**
- "Don't WhatsApp your Aadhaar" full campaign — creative, lander, social cuts
- DPDP-readiness PR pitch
- Aadhaar Masking standalone tool + PR
- Operator referral program launch

**Month 4–6 (compounding):**
- More spec reference pages (target: 30 exams)
- Lifecycle comms sequences live
- Quarterly stats for operators
- Business dashboard built
- Trust + transparency pages
- Crisis playbook tested (run a drill)

---

## 14. Voice rules apply throughout

All copy on every surface follows AI-RULES + voice-foundation. The same banned-word + contrastive-negation + filler-token sweeps that the homepage went through apply to:
- Ad creative
- WhatsApp templates
- Email sequences
- PR pitches
- Press kit
- Founder bio
- Tutorial captions
- FAQ answers

One voice, every surface. Inconsistency = brand damage.

---

## What this plan still doesn't cover (be honest)

- **Pricing experimentation** — A/B testing ₹19 vs ₹29 vs ₹49, ₹499 vs ₹599, etc. Should be done; not spec'd here.
- **International / NRI marketing channels** — flagged as a segment but no channel plan.
- **Offline / regional language video** — Hindi tutorial videos beyond captions.
- **Affiliate / influencer marketplace** — beyond coaching channels, no influencer program spec'd.
- **App store presence** — PWA only at launch; native app deferred.
- **Customer support function** — Grievance Officer is named (you), but no support inbox / response-time SLA / WhatsApp helpline spec.

These are next-iteration items. Don't try to do everything Month 1.
