# BharatTools — CLI / MCP / Open-Source Spec

> Extending the privacy architecture into the agent toolchain. Same core code, three surfaces: web (consumers), CLI (devs + power users), MCP (AI agents). All local-execution, all free at the base, all swadeshi by architecture.
> Phase: post-core consumer launch (~Month 3+).
> Last updated: 2026-05-28.

---

## 1. Why this exists

AI agents are becoming a primary interface. When Claude / ChatGPT / a custom workflow needs to compress a PDF, mask an Aadhaar, or resize a photo for an Indian form, the current options are:
- Use a foreign API (iLovePDF, Smallpdf) — files leave the device, breaks Indian privacy
- Run libraries locally and reinvent the wheel
- Manually open a browser tool — defeats the agentic point

**BharatTools CLI + MCP fills that gap.** Same browser-side processing, packaged as a local-execution tool that humans run on the command line and AI agents call as MCP functions. Files stay on the user's machine. Architecture-level privacy preserved.

**Strategic gains:**
1. **Distribution** — embedded in agent toolchains = free top-tier distribution.
2. **Brand authority** — first credible "Indian document tool for agents" wins the mental model.
3. **B2B wedge lowers** — fintechs / professionals can adopt via their AI workflows, no SDK integration.
4. **Defensive** — MCP is the emerging agent standard. First-mover advantage.
5. **Open-source dev brand** — Indian devs champion swadeshi open-source. Earns credibility no marketing can buy.

---

## 2. Architecture

Three surfaces, one core:

```
┌──────────────────────────────────────────────────────────────┐
│  @bharattools/core         (npm, MIT)                        │
│  Pure TypeScript / Node-compatible library.                  │
│  Wraps pdf-lib, canvas (node-canvas), heic2any, ONNX runtime.│
│  Each tool = a named function. Pure I/O, no UI.              │
└──────────────────────────────────────────────────────────────┘
            ↑                ↑                  ↑
            │                │                  │
┌───────────┴─────┐ ┌────────┴───────┐ ┌────────┴─────────┐
│  Web (Next.js)  │ │  @bharattools/ │ │  @bharattools/   │
│  bharattools.app│ │  cli (MIT)     │ │  mcp (MIT)       │
│                 │ │  CLI + npx     │ │  MCP server      │
│  Consumer UX    │ │  power-user UX │ │  Agent toolchain │
└─────────────────┘ └────────────────┘ └──────────────────┘
```

All three import `@bharattools/core`. No duplicated logic. Bug fixes in core flow everywhere.

---

## 3. CLI surface

### Package
`@bharattools/cli` — npm, MIT licensed.

### Invocation
```bash
# One-off, no install
npx @bharattools/cli photo-resize --exam upsc input.jpg output.jpg

# Installed globally
bharattools photo-resize --exam upsc input.jpg output.jpg

# Piped (stdin/stdout)
cat photo.jpg | bharattools photo-resize --exam upsc > output.jpg
```

### Command structure
- `bharattools <tool> [options] <input> [output]`
- Tools mirror the web app (photo-resize, image-compress, pdf-compress, jpg-to-pdf, aadhaar-mask, photo-signature-joiner, etc.)
- Common flags: `--exam <slug>`, `--size <kb>`, `--dimensions <WxH>`, `--format <jpg|png|webp>`, `--quality <0-100>`, `--json` (machine-readable output)

### Output modes
- Default: write to file (or stdout if no output specified)
- `--json` emits structured result with metadata (output path, dimensions, file size, validation result)
- `--quiet` suppresses progress
- `--verbose` adds spec-validation diagnostics

### Auth & limits
- **Free, unlimited, no signup for individual use** — Seva continues at the CLI surface.
- **Optional `--api-key` flag** — for businesses crossing volume threshold. Tied to phone-JWT auth from the web. Same JWT system.
- **Volume threshold for free tier:** 10,000 operations/month per device fingerprint. Above = sign-up prompt with paid options.
- **Operator + Professional subscriptions include unlimited CLI usage.**

---

## 4. MCP server surface

### Package
`@bharattools/mcp` — npm, MIT licensed.

### Installation (per the MCP standard)
```json
// Claude Desktop config
{
  "mcpServers": {
    "bharattools": {
      "command": "npx",
      "args": ["@bharattools/mcp"]
    }
  }
}
```

### Tools exposed (each MCP function maps to one BharatTools operation)
- `photo_resize(input_path, exam_slug, output_path)` → applies exam preset
- `image_compress(input_path, target_kb, output_path)` → binary-search compression
- `pdf_compress(input_path, target_kb, output_path)` → image re-encode + structure rewrite
- `pdf_merge(input_paths[], output_path)` → merge PDFs in order
- `pdf_split(input_path, page_ranges, output_dir)` → split by ranges
- `aadhaar_mask(input_path, output_path)` → auto-detect + mask first 8 digits (AI-powered)
- `document_classify(input_path)` → returns detected type (aadhaar / pan / passport / other)
- `validate_against_spec(input_path, exam_slug)` → returns `{pass, reasons[]}` with detailed spec compliance
- `heic_to_jpg(input_path, output_path)` → format conversion
- `quick_send_hold(input_paths[], hours)` → returns shareable encrypted-hold URL (the one server-touching tool — explicit opt-in)

### Tool descriptions
Each MCP tool ships with a precise description so agents pick the right one. The descriptions are documentation; quality here directly affects agent accuracy.

### Local execution
All operations run in the user's local Node process. No file leaves the device.

The single exception is `quick_send_hold` — by design, that one uses the encrypted-hold server (the same one the web tool uses). MCP tool description states this explicitly.

---

## 5. Core library (`@bharattools/core`)

### Package
`@bharattools/core` — npm, MIT licensed.

### Shape
Each tool is a pure async function:
```ts
import { photoResize } from '@bharattools/core'

const result = await photoResize({
  input: Buffer | ReadStream | string,  // path or in-memory
  exam: 'upsc',
  outputFormat: 'jpg',
  targetKB: 100,
})
// → { buffer, dimensions, validation, sizeKB }
```

### Per-tool packages (bundle weight optimization)
```
@bharattools/core            # everything
@bharattools/photo-resize    # only photo resize
@bharattools/pdf-compress    # only pdf compress
@bharattools/aadhaar-mask    # only masking (requires ONNX runtime peer dep)
```

Users / agents install only what they need. ONNX-heavy tools (bg removal, classification, masking) split into their own packages so the lightweight tools stay lightweight.

### Spec DB
Spec presets (UPSC photo dimensions, KB limits, etc.) ship as JSON in `@bharattools/spec-db`. Updated independently of the tools. Users pin a version OR fetch the latest:
- Pinned (default in CLI for reproducibility): uses the version shipped with the CLI
- `--spec-sync` flag fetches the latest from `bharattools.app/api/spec-db` (read-only public endpoint)
- Operator/Professional tier: spec-sync is auto-on, with notification on changes

The spec DB is the moat. It's the one component that's *worth* network access — and only metadata flows, never user files.

---

## 6. Open-source strategy

### What's open-source (MIT)
- `@bharattools/core` and all per-tool packages
- `@bharattools/cli`
- `@bharattools/mcp`
- `@bharattools/spec-db` (the JSON data, not the AI pipeline that maintains it)
- Documentation, examples

### What stays proprietary
- **The spec-validation AI pipeline** (cron + LLM that parses exam notification PDFs) — the engine that keeps `@bharattools/spec-db` accurate. Open-source competitors can fork the data but can't replicate the always-current update mechanism.
- **The hosted Quick Send encrypted-hold backend** — our server, our infra, our operational cost.
- **The Razorpay / payment / JWT auth backend.**
- **Operator/Professional tier features** — server-side validation, premium support (email), priority spec updates, batch quotas above free threshold.

### Why this split works
- Devs get a credible, useful, MIT-licensed library — wins the community.
- Devalok keeps the operational moat (spec maintenance, AI validation, hosted services) — wins the revenue.
- Open-core pattern (Strapi, Penpot, n8n, Cal.com — all proven Indian/global indie SaaS). It works.

### Repo structure
Public monorepo: `github.com/devalok-design/bharattools` (rename current `bharattools-frontend` or new repo).
- `apps/web` — the Next.js consumer site
- `packages/core` — core library
- `packages/cli` — CLI
- `packages/mcp` — MCP server
- `packages/spec-db` — spec data
- `packages/photo-resize`, `pdf-compress`, etc. — per-tool packages

Some apps (the AI spec-validation pipeline, payment backend) live in private repos.

### Licensing
- MIT for everything public.
- Contributor License Agreement (CLA) optional but recommended — single corporate steward (Devalok) means CLAs avoid future relicensing pain.
- All open-source repos credit Devalok prominently: "Built by [Devalok](https://devalok.in)" in every README + package.json.

---

## 7. LLM-democratic posture (no lock-in)

When the CLI / MCP / library uses an LLM internally (e.g., the optional AI spec-validation feature, AI document classifier), it stays **provider-agnostic.**

### Supported LLM providers (out of the box)
- Anthropic (Claude)
- OpenAI (GPT-4, GPT-5)
- Google (Gemini)
- Sarvam AI (Indian)
- Ola Krutrim (Indian)
- BharatGen (Indian)
- Self-hosted (Ollama, LM Studio — for fully offline workflows)

### Configuration
```bash
bharattools photo-resize --exam upsc --ai-validate \
  --llm-provider anthropic \
  --llm-api-key $ANTHROPIC_API_KEY
```

Or via env var:
```bash
export BHARATTOOLS_LLM_PROVIDER=sarvam
export BHARATTOOLS_LLM_API_KEY=...
```

Or via config file (`~/.bharattools/config.toml`).

### Default: none
If no LLM is configured, AI features degrade gracefully — face detection still works (ONNX, no API), document classification still works (ONNX, no API), but advanced conversational features that need a real LLM say "configure an LLM provider to enable this."

### Why this matters
- **No vendor lock-in** for users — pick whatever LLM fits your privacy / cost / capability budget.
- **Swadeshi-accessible** — Indian LLMs are first-class citizens, equal API treatment.
- **No mandatory foreign-API dependency** — users running fully offline (Ollama) get full functionality minus optional LLM-only features.

This is the right ethical stance and the right strategic stance — neutrality wins more developers than partisanship.

---

## 8. Cross-Devalok awareness plan

BharatTools gets discovery from every Devalok property. Two-way cross-linking.

| Devalok property | How BharatTools appears |
|---|---|
| **devalok.in** (main site) | "Our products" / portfolio section — BharatTools listed with one-liner + link |
| **shilp-sutra.devalok.in** | Footer "Other Devalok products" mentions BharatTools |
| **Karm** (studio tool) | When a project involves doc tasks, contextual nudge: "Process documents in BharatTools →" |
| **Documenso** (self-hosted PDF signing) | Footer link: "Need to prep PDFs first? Try BharatTools." Natural workflow pairing. |
| **Cap** (self-hosted Loom alt) | Lighter cross-link in About / Footer. Less obvious connection but still under the Devalok umbrella. |
| **GitHub orgs** (`devalok-design/*`) | All repos credit Devalok consistently with link to BharatTools |

Reverse: BharatTools' About page mentions other Devalok products in a "More from Devalok" footer block. Builds the Devalok product family story.

**Effort:** one footer block component reused across properties. Days of work, years of compounding distribution.

---

## 9. Distribution channels (open-source + agent toolchain)

Beyond the consumer marketing plan, the open-source / CLI / MCP layer gets its own channels:

- **npm registry** — `@bharattools/*` packages discoverable via search
- **GitHub** — public repos, README quality matters most
- **MCP marketplaces / registries** — Anthropic's MCP registry, third-party indexes (mcp.run, etc.)
- **Awesome-MCP / Awesome-CLI lists** — submit PRs to the curated lists devs read
- **Indian dev communities** — IndianDevs Discord, Reddit r/india_dev, Telegram channels, HasGeek events
- **Show HN / Reddit r/sideproject** — launch posts for the OSS release
- **Hacker News** — strategic launch post when CLI hits 1.0 ("Show HN: BharatTools — open-source document utilities for India, runs locally, no upload")

---

## 10. Build order

This is **Phase 2 (post-core)**, starting after the consumer web product stabilizes (~Month 3+).

1. **`@bharattools/core` library** — extract the existing tool logic from the web codebase into the standalone package. Refactor to be I/O-flexible (Buffer / stream / path). Test in Node.
2. **`@bharattools/spec-db`** — extract preset JSON into its own package. Versioned. Public CDN endpoint for spec-sync.
3. **Per-tool packages** — split out for bundle-size optimization. Most-used tools first (photo-resize, pdf-compress, image-compress, jpg-to-pdf).
4. **`@bharattools/cli`** — wraps core. Commander.js or similar. Tests, docs, examples.
5. **`@bharattools/mcp`** — wraps core. MCP server scaffold. Tool descriptions written carefully (this is where agent accuracy lives or dies).
6. **Open-source release** — public GitHub repo, MIT licence, README, contributing guide, code of conduct.
7. **Launch beat** — Show HN, Reddit, Indian dev community posts, MCP registry submission. PR-able moment.
8. **Cross-Devalok cross-linking** — footer block component shipped on every Devalok property.

Estimated effort: 3–4 weeks for layers 1–7 (assumes core consumer-side code is reusable, which it is by design).

---

## 11. Risks

- **Maintenance surface** — three surfaces forever. Mitigation: shared core means bugs fix everywhere; per-tool packages let users opt into only the tools they need.
- **Brand dilution if CLI dominates consumer site** — if CLI/MCP eats the consumer web traffic. Mitigation: both free at consumer scale, both reinforce the same Devalok brand. Different segments, not cannibalization.
- **LLM-provider drift** — supporting many providers means tracking many APIs. Mitigation: thin provider interface, community PRs welcome (open-source).
- **MCP standard churn** — MCP is young, the protocol may evolve. Mitigation: version-pin, follow the standard.
- **Open-source forking** — someone forks `@bharattools/core` and ships a closed competitor. Mitigation: the moat is the proprietary spec-validation AI pipeline + accuracy + brand, not the code. Forks help us, not hurt us, if the brand is strong.
- **Foreign-LLM dependency creep in marketing** — if we accidentally lead with "powered by Claude/GPT" in MCP marketing. Mitigation: messaging stays LLM-agnostic, never lock in to one vendor in copy.

---

## 12. Voice & branding for the open-source surface

The CLI / MCP / core-library README and docs use the same Devalok voice rules. Specific notes:
- No corporate API-marketing slop. Devs read README files for substance, not vibes.
- Code examples first, prose second.
- Privacy claim ("files never leave your device") visible in the README's first 200 chars.
- Credit Devalok prominently in every README footer and `package.json` author field.
- Bilingual where it adds value (Hindi tagline in README hero, English everywhere else).

Open-source needs to feel like real engineering, not a marketing project. Devs sniff out the difference instantly.

---

## What's still open (decide closer to build time)

- Exact CLI command syntax conventions (positional args vs all-flags).
- MCP tool-description copy (matters more than people think for agent accuracy).
- Versioning strategy (semver discipline, monorepo with changesets, etc.).
- Telemetry — do we collect anonymous usage from CLI / MCP? Indian dev community is privacy-sensitive. Default: zero telemetry. Opt-in only.
- Karm-native integration depth (how deep does the "BharatTools inside Karm" cross-product link go?).
