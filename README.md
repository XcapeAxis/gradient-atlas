# Gradient Atlas

Gradient Atlas is a desktop-first, local-first knowledge-graph learning app for machine learning fundamentals. Phase 1 includes the focused study route, the curriculum map, explainable recommendations, a local authoring studio, JSON import/export, a file-backed published viewer, and a local gallery. The current UI pass simplifies the product around clear screen roles: Home for orientation, Learn for graph-first study, Map for structure and navigation, Studio for authoring, and Gallery for browsing published packs.

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

- `/` orientation-first landing page with one primary CTA, one starter-path chooser, and one concept spotlight
- `/map` readable curriculum overview with deterministic module lanes, search, filters, preview, and recommendations
- `/learn/[nodeId]` graph-first study route with a large local graph, contextual detail panel, and persistent learning state
- `/studio` local authoring tool with validation, create/edit/delete flows, import, and export preview
- `/gallery` minimal file-backed gallery of published graph packs
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
- `lib/learn-viewport.ts`: safe-zone viewport rules for conditional recentering
- `lib/curriculum-navigation.ts`: search, prerequisite warnings, and explainable recommendations
- `lib/module-overview-layout.ts`: deterministic module-lane layout
- `lib/progress.ts`: progress state helpers and summaries
- `stores/`: persisted local UI, learning-progress, and studio-draft state
- `tests/`: unit/integration coverage
- `tests/e2e/`: Playwright browser flows

## Local-first workflow

1. Study the bundled pack from `/learn/[nodeId]` and `/map`.
2. Persist current node, starter path, motion preference, and learning state in local storage.
3. If local storage is empty, the app seeds a guided demo progress state so the UI opens in a presentation-ready learning flow.
4. Open `/studio` to edit the graph pack locally.
5. Validate against the same Zod schema used by runtime routes.
6. Export JSON for manual publishing or future packaging.
7. Register published packs in the local manifest for `/gallery` and `/graphs/[slug]`.

## UI direction

- Lower-density information architecture over dashboard-style density
- Learn is the flagship route and keeps the graph as the visual focus
- Learn uses a lane-based local graph: hover peeks, click commits, and viewport recentering is conditional
- Studio keeps JSON tools and destructive actions behind secondary disclosures
- Home stays concise: one primary CTA, one starter-path chooser, and one continue-learning surface
- Motion is limited to high-value focus, selection, and handoff states
- English-first UI with only a small amount of supporting Chinese on the landing page

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
- [docs/ui-redesign-spec.md](/D:/MYFILES/MindMap/docs/ui-redesign-spec.md)
- [docs/learn-studio-refactor-spec.md](/D:/MYFILES/MindMap/docs/learn-studio-refactor-spec.md)

## Future backend plan

Phase 1 stays fully local-first. A future backend phase should add multi-pack publishing, hosted storage, sync, collaboration, and creator workflows only after the local content model, viewer, and studio contracts are stable enough to preserve.
