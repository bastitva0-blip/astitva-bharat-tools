# Contributing to BharatTools Frontend

Thanks for your interest in improving BharatTools. This document covers how to set up the project locally, the contribution workflow, and the conventions we follow.

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting started

### Prerequisites

- **[Bun](https://bun.sh/)** — package manager and runtime for this app. `npm`/`yarn`/`pnpm` lockfiles are not committed; do not switch package managers in a PR.
- **Node.js 20+** — required by some build tooling.
- **Git** with hooks enabled (see below).

### Setup

```bash
git clone https://github.com/devalok-design/bharattools-frontend.git
cd bharattools-frontend
bun install
sh setup-hooks.sh   # one-time: enables pre-push hook that blocks direct pushes to main
bun dev             # → http://localhost:3000
```

Optional `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3010
```

## Workflow

**Direct pushes to `main` are blocked.** All changes go through a Pull Request.

1. Create a branch off `main`:
   ```bash
   git checkout -b feat/<short-name>      # feature
   git checkout -b fix/<short-name>       # bug fix
   git checkout -b docs/<short-name>      # docs only
   git checkout -b chore/<short-name>     # tooling / deps
   ```
2. Make your changes. Keep commits focused; write commit messages in the imperative ("Add Aadhaar photo preset", not "Added…").
3. Run checks locally:
   ```bash
   bun run lint
   bun run build
   ```
4. Push your branch and open a PR against `main`. Fill out the PR template.
5. At least one review from a code owner is required before merge. Use the GitHub UI to merge (squash preferred).

A GitHub Actions workflow auto-reverts any push to `main` that doesn't come from a PR merge — please don't try to bypass it.

## What to work on

- **Bugs** — open or pick an [issue](https://github.com/devalok-design/bharattools-frontend/issues) labeled `bug`.
- **New tools / presets** — please open a `New tool` issue first so we can discuss scope and the privacy model before you build. We're picky about adding anything that isn't browser-only.
- **Docs, accessibility, performance** — usually accepted; just open an issue first if the change is non-trivial.

If you're not sure whether something is in scope, open an issue and ask. We'd rather have a 5-minute conversation than send a PR back.

## Project conventions

### The two non-negotiables

1. **Browser-only processing.** Every tool must run entirely on the user's device. No file uploads to a server, no third-party APIs that see user files. If a feature genuinely cannot work client-side, raise it in an issue first.
2. **Privacy by architecture, not policy.** The endpoints to receive user files simply must not exist. Don't add "optional upload" toggles.

### Next.js 16

This project runs on Next.js 16, which has **breaking changes vs. older docs and most LLM training data**. Before changing routing, config, or anything App Router-related:

- Read the relevant guide in `node_modules/next/dist/docs/`.
- Heed deprecation notices.
- Don't rely on memorized Next.js patterns from earlier versions.

Notable rename: request-time logic that used to live in `middleware.ts` now lives in `src/proxy.ts`, exporting a function named `proxy`.

### Shilp Sutra (design system)

UI is built with [`@devalok/shilp-sutra`](https://shilp-sutra.devalok.in) — Radix + Tailwind 4 + CVA. **Component APIs differ from shadcn/ui**; don't guess.

- Authoritative reference: `node_modules/@devalok/shilp-sutra/llms.txt` (and `llms-full.txt` for per-component detail). Read it before adding or modifying UI.
- Import via subpath: `import { Button } from "@devalok/shilp-sutra/ui/button"` — not from the package root.
- Tokens come from the single CSS import in `src/app/globals.css`. There is no `tailwind.config.ts`.
- Use design-system tokens (`bg-accent-3`, `text-surface-fg-muted`, `text-heading-xl`, `p-ds-04` …) — not raw Tailwind primitives like `bg-blue-500`, `p-3`, `text-base`.
- For non-primary actions, prefer `<Button variant="soft">` over `outline`.
- Light theme is forced site-wide for Phase 1 (`forcedTheme="light"` on `next-themes`). Don't add dark-mode-only styles.

### Code style

- **TypeScript strict.** No `any` unless there's a comment explaining why.
- **ESLint** — `bun run lint` must pass.
- **Naming** — `kebab-case` for file names, `PascalCase` for components, `camelCase` for functions/variables.
- **No comments that explain *what* the code does** — names should carry that. Comments are for the *why*: hidden constraints, workarounds, non-obvious invariants.
- **Don't introduce abstractions on speculation.** Three similar lines beats a premature helper.

### Adding a tool, exam, or KB-target preset

Most additions are a one-file change:

- New exam photo preset → `src/lib/presets/exams.ts`
- New compress KB target → `src/lib/presets/compress-sizes.ts`
- New print-sheet preset → `src/lib/presets/print-sheet.ts`
- New whole tool → register in `src/lib/tools.ts` so it appears in nav, search, and the home page.

Routes, hub cards, and SSG generation pick up presets automatically. Please don't bypass the registry.

## Testing changes

There is no unit test suite yet. Until there is, test the golden path in a browser before opening a PR:

- Run `bun dev` and exercise the feature end-to-end.
- Try at least one edge case (e.g., a very small image, a multi-page PDF, an unusual aspect ratio).
- Check that nothing in the network tab is uploading user files.
- Run `bun run build` — a successful build is part of the bar.

## Reporting bugs

Use the [bug report template](https://github.com/devalok-design/bharattools-frontend/issues/new?template=bug_report.yml). Include browser, OS, the exact tool, and — if relevant — a sample file (or describe one).

## Reporting security issues

**Do not** open a public issue for security vulnerabilities. See [SECURITY.md](./SECURITY.md) for disclosure instructions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
