# bharattools-frontend

> **BharatTools — Har Sarkari form ka saathi.**
> Browser-only utilities for Indian government forms. Photo to spec, signature merge, KB compression, print sheet — every step of submitting a Sarkari form, in one place. Files never leave your device.

The Next.js app behind [bharattools.app](https://bharattools.app). Companion repo: [`bharattools-backend`](https://github.com/devalok-design/bharattools-backend).

## Why "browser-only"

Every Phase 1 tool processes images and PDFs on your device — no upload, no server round-trip, no copy of your file on our infrastructure. Privacy isn't a marketing claim here; it's an architectural fact, enforced by the fact that the endpoints simply don't exist.

## Tech

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind 4 (CSS-first) via [Shilp Sutra](https://shilp-sutra.devalok.in) — `@devalok/shilp-sutra` + `@devalok/shilp-sutra-brand` |
| Package manager | **bun** |
| Image processing | HTML Canvas + [`react-image-crop`](https://github.com/sekoyo/react-image-crop) + binary-search JPEG compression |
| PDF generation | [`pdf-lib`](https://pdf-lib.js.org/) |
| Optional bg removal | [`@imgly/background-removal`](https://github.com/imgly/background-removal-js) (lazy-loaded ONNX model) |
| Icons | [`lucide-react`](https://lucide.dev/) |

## Phase 1 tools

| Status | Route | Tool |
|---|---|---|
| ✅ Live | `/photo-resize/[exam]` | **Exam Photo Resizer** — UPSC, SSC, NEET, IBPS, RRB, JEE, State PSC, Police, SBI. Locked-aspect crop, exact pixel size, KB-target JPEG, white background. |
| ✅ Live | `/image-compress/[size]` + `/image-compress/custom` | **Image Compressor** — 20 KB / 50 / 100 / 200 / 500 / 1 MB / 2 MB / custom. Binary-search JPEG with auto-downscale fallback. |
| ✅ Live | `/print-sheet` | **Print Sheet Generator** — A4 or 4×6 inch, passport / Aadhaar / 2×2 inch / custom photo size, optional client-side bg removal. PDF output with cut-line borders. |
| 🟡 Planned | `/document-photo/[doc]` | **Document Photo Maker** — Aadhaar, PAN, Passport (ICAO), Voter ID, OCI. |
| 🟡 Planned | `/photo-signature-joiner` | **Photo + Signature Joiner** — SSC- / IBPS-style merged uploads. |
| 🟡 Planned | `/jpg-to-pdf` | **JPG / Image to PDF** — multi-image PDF with KB target. |

See `bharattools-phase-1-plan.md` (working-tree document, not committed here) for the full Phase 1 plan, presets, and roadmap.

## Local development

```bash
bun install
bun dev          # → http://localhost:3000
```

Optional `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3010   # backend, only used if a server tool is wired in
```

## Scripts

| Command | What it does |
|---|---|
| `bun dev` | Next dev server (Turbopack) |
| `bun run build` | Production build |
| `bun start` | Serve the production build |
| `bun run lint` | ESLint |

## Project layout

```
src/
├── app/                          # App Router routes
│   ├── photo-resize/             # Tool 1 (hub + dynamic [exam] route)
│   ├── image-compress/           # Tool 2 (hub + [size] + custom)
│   ├── print-sheet/              # Tool 5
│   ├── document-photo/           # Tool 4 (placeholder)
│   ├── photo-signature-joiner/   # Tool 3 (placeholder)
│   ├── jpg-to-pdf/               # Tool 6 (placeholder)
│   ├── layout.tsx · page.tsx · globals.css
│   └── ...
├── components/                   # TopNav, Footer, ToolIcon, ToolsBrowser, ComingSoon, ...
├── lib/
│   ├── presets/                  # exams.ts, compress-sizes.ts, print-sheet.ts
│   ├── processing/               # image.ts, print-sheet.ts (Canvas + pdf-lib utilities)
│   └── tools.ts                  # Tool registry → drives nav, search, home page
└── ...
```

Adding a new exam, KB target, or print-sheet preset is usually a one-file change inside `src/lib/presets/` — the route, hub card and SSG generation pick it up automatically.

## Notes for contributors

- **Next.js 16 has breaking changes** vs. older docs. Read the bundled docs in `node_modules/next/dist/docs/` before making routing- or config-level changes.
- **Don't guess Shilp Sutra APIs from shadcn/ui knowledge.** Component APIs differ. Authoritative reference: `node_modules/@devalok/shilp-sutra/llms.txt` (and `llms-full.txt` for per-component detail).
- **Token-driven styling.** Use design-system tokens (`bg-accent-3`, `text-surface-fg-muted`, `text-heading-xl`, `p-ds-04` …), not raw Tailwind primitives, to stay theme-coherent.
- **Light theme is forced site-wide** for Phase 1 (`forcedTheme="light"` on `next-themes`).
