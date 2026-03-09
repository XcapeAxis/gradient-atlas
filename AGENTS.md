# AGENTS.md

## Product
This repo builds "Gradient Atlas", a desktop-first interactive knowledge-graph learning app for machine learning fundamentals.
The MVP is a curated single-user learning experience.
Do not add auth, backend, payments, chat, or social features in phase 1 unless explicitly asked.

## Tech stack
- Next.js App Router
- TypeScript strict mode
- pnpm
- Tailwind CSS
- shadcn/ui
- React Flow
- Framer Motion
- Zustand
- Zod
- Vitest + Testing Library
- Playwright

## UX rules
- The primary study surface is a focused local graph, not a giant force-directed graph.
- Every edge must have a typed relation and a human-readable rationale.
- Selecting a node must preserve spatial continuity.
- Motion is a comprehension aid, not decoration.
- Respect prefers-reduced-motion and provide an in-app reduce-motion override.
- Keyboard access, visible focus states, and accessible semantics are required.

## Content rules
- MVP scope is ML fundamentals only.
- Keep content concise and textbook-level.
- Separate intuition, formal definition, examples, and exercises.
- Validate all graph content with explicit schemas.

## Engineering rules
- Prefer small, reviewable changes.
- Avoid heavy dependencies unless clearly justified.
- Update README when commands, architecture, or behavior changes.
- Before finishing substantial work, run:
  - pnpm lint
  - pnpm typecheck
  - pnpm test
  - pnpm build

## Product boundaries
- Phase 1: local-first curated learning app, motion system, overview/navigation, local studio, import/export, file-based published viewer, and gallery
- Phase 2: richer packaging, multi-pack workflows, and backend-ready abstractions without requiring hosted services yet
- Phase 3: backend, creators, gallery, forks, rankings
