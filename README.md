# Gradient Atlas

Gradient Atlas is a desktop-first, local-first knowledge-graph learning app for machine learning fundamentals. Phase 1 now includes the interactive study route, the curriculum map, explainable recommendations, a local authoring studio, JSON import/export, a file-backed published viewer, and a local gallery.

## Migration note

The product previously used the working title `GraphML`. It was renamed to Gradient Atlas to avoid confusion with the existing GraphML graph data format.

## Stack

- Next.js App Router
- TypeScript with strict mode
- pnpm
- Tailwind CSS
- shadcn/ui-style primitives
- Framer Motion
- Zustand
- Zod
- React Flow (available for graph-heavy surfaces when needed)
- Vitest + Testing Library
- Playwright

## Setup

```bash
corepack pnpm install
corepack pnpm dev
```

If `pnpm` is already on your PATH, replace `corepack pnpm` with `pnpm`.

## Commands

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e
```

Install Playwright browsers before the first E2E run:

```bash
corepack pnpm exec playwright install
```

## Routes

- `/` landing page with atlas framing, continue-learning card, and progress snapshot
- `/map` curriculum overview with search, filters, module lanes, legend, preview, and recommendations
- `/learn/[nodeId]` focused local study route with graph, detail panel, starter-path guidance, and persistent learning state
- `/studio` local authoring studio with validation, create/edit/delete flows, import, and export preview
- `/gallery` file-backed gallery of published graph packs
- `/graphs/[slug]` read-only published viewer for local manifest entries

## Architecture

- `app/`: Next.js routes and route entry points
- `components/layout/`: shared shell, top bar, and route navigation
- `components/learn/`: focused local-study workspace
- `components/map/`: overview/search/filter/recommendation layer
- `components/studio/`: local authoring workflow
- `components/gallery/`: gallery and published-viewer surfaces
- `components/graph/`: reusable deterministic graph canvases
- `data/`: bundled curriculum packs and published-graph manifest
- `lib/schema.ts`: shared Zod content model for runtime and studio validation
- `lib/motion.ts`: reusable motion tokens and preference logic
- `lib/curriculum-navigation.ts`: search, prerequisite warnings, and explainable recommendations
- `lib/module-overview-layout.ts`: deterministic module-lane layout
- `lib/progress.ts`: progress state helpers and summaries
- `stores/`: persisted local UI, learning-progress, and studio-draft state
- `tests/`: unit/integration coverage
- `tests/e2e/`: Playwright browser flows

## Local-first workflow

1. Study the bundled pack from `/learn/[nodeId]` and `/map`.
2. Persist current node, starter path, motion preference, and learning state in local storage.
3. Open `/studio` to edit the graph pack locally.
4. Validate against the same Zod schema used by runtime routes.
5. Export JSON for manual publishing or future packaging.
6. Register published packs in the local manifest for `/gallery` and `/graphs/[slug]`.

## Current content pack

- `ML Fundamentals`
- 41 nodes total
- 83 typed edges
- 3 starter paths:
  - `absolute-beginner`
  - `math-refresh`
  - `interview-oriented`

## Phase 1 status

- [x] Renamed the product to Gradient Atlas
- [x] Added reusable motion tokens and persisted motion preference handling
- [x] Built the focused learning route with local progress persistence
- [x] Built the map route with search, filters, recommendations, warnings, and progress summaries
- [x] Added a local studio with create/edit/delete flows and JSON import/export preview
- [x] Added a file-backed gallery and read-only published viewer
- [x] Added unit tests for schema integrity, motion logic, navigation logic, learn sync, and studio draft behavior
- [x] Added a Playwright flow covering landing, map, learn, and studio import/export preview

## Docs

- [docs/product-spec.md](/D:/MYFILES/MindMap/docs/product-spec.md)
- [docs/content-model.md](/D:/MYFILES/MindMap/docs/content-model.md)

## Future backend plan

Phase 1 stays fully local-first. A future backend phase should add multi-pack publishing, hosted storage, sync, collaboration, and creator workflows only after the local content model, viewer, and studio contracts are stable enough to preserve.
