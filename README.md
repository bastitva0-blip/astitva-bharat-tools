# bharattools-frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-purple)](./CODE_OF_CONDUCT.md)

> **BharatTools - Har Sarkari form ka saathi.**
> Browser-only utilities for Indian government forms. Photo to spec, signature merge, KB compression, print sheet - every step of submitting a Sarkari form, in one place. Files never leave your device.

The Next.js app behind [bharattools.app](https://bharattools.app). Companion repo: [`bharattools-backend`](https://github.com/devalok-design/bharattools-backend).

Built by [Devalok](https://devalok.in). Licensed under the [MIT License](./LICENSE).

## Why "browser-only"

Every tool processes images and PDFs on your device - no upload, no server round-trip, no copy of your file on our infrastructure. Privacy isn't a marketing claim here; it's an architectural fact, enforced by the fact that the endpoints simply don't exist.

For the live list of tools and what each does, visit [bharattools.app](https://bharattools.app).

## Tech

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind 4 (CSS-first) via [Shilp Sutra](https://shilp-sutra.devalok.in) - `@devalok/shilp-sutra` + `@devalok/shilp-sutra-brand` |
| Package manager | **bun** |
| Image processing | HTML Canvas + [`react-image-crop`](https://github.com/sekoyo/react-image-crop) + binary-search JPEG compression |
| PDF generation | [`pdf-lib`](https://pdf-lib.js.org/) |
| Optional bg removal | [`@imgly/background-removal`](https://github.com/imgly/background-removal-js) (lazy-loaded ONNX model) |
| Icons | [`lucide-react`](https://lucide.dev/) |

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
├── app/          # App Router routes (one folder per tool)
├── components/   # Shared UI: TopNav, Footer, ToolIcon, ToolsBrowser, ...
└── lib/
    ├── presets/    # exams.ts, compress-sizes.ts, print-sheet.ts
    ├── processing/ # Canvas + pdf-lib utilities
    └── tools.ts    # Tool registry → drives nav, search, home page
```

Adding a new exam, KB target, or print-sheet preset is usually a one-file change inside `src/lib/presets/` - the route, hub card and SSG generation pick it up automatically. See `docs/` for the tool design spec and engineering notes.

## Contributing

We welcome issues and PRs. Before contributing, please read:

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — setup, branch/PR workflow, project conventions, how to add a new tool or preset.
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** — community standards.
- **[SECURITY.md](./SECURITY.md)** — how to report vulnerabilities privately.

Quick start for contributors:

```bash
bun install
sh setup-hooks.sh   # one-time: enables pre-push hook that blocks direct pushes to main
bun dev
```

Direct pushes to `main` are blocked — all changes go through a Pull Request.

## Notes for contributors

- **Next.js 16 has breaking changes** vs. older docs. Read the bundled docs in `node_modules/next/dist/docs/` before making routing- or config-level changes.
- **Don't guess Shilp Sutra APIs from shadcn/ui knowledge.** Component APIs differ. Authoritative reference: `node_modules/@devalok/shilp-sutra/llms.txt` (and `llms-full.txt` for per-component detail).
- **Token-driven styling.** Use design-system tokens (`bg-accent-3`, `text-surface-fg-muted`, `text-heading-xl`, `p-ds-04` …), not raw Tailwind primitives, to stay theme-coherent.
- **Light theme is forced site-wide** for Phase 1 (`forcedTheme="light"` on `next-themes`).
