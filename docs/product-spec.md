# Gradient Atlas Product Spec

## Overview

Gradient Atlas is a desktop-first, local-first knowledge-graph learning app for machine learning fundamentals. The current repository ships a single-user prototype centered on a curated ML curriculum, a focused study graph, explainable recommendations, and a local authoring workflow.

The product goal for this stage is comprehension, not scale. The UI should help a learner stay oriented, see prerequisite structure, and move from overview to focused study without a dense graph hairball.

## Product Principles

- Focus the learner on a small readable neighborhood, not the whole graph at once.
- Use motion to clarify state changes and spatial continuity, not to decorate the interface.
- Keep the app fully usable with reduced motion and keyboard input.
- Keep curriculum content deterministic, concise, and easy to review.
- Stay local-first in this phase: no auth, backend, chat, payments, or social features.

## Current Phase-1 Scope

Implemented in this repo:

- Curated ML Fundamentals pack with typed nodes, edges, and starter paths
- Landing page with progress-aware entry points
- Map overview with search, filters, progress, and recommendation context
- Learn workspace with focused graph, node detail, and persistent learning state
- Local studio for editing a graph pack against the runtime schema
- Local JSON import and export
- Local published viewer and gallery backed by files in the repository

Out of scope for the current phase:

- Multi-user collaboration
- Cloud sync
- Server-side content management
- Authentication and permissions
- User-generated public publishing flows

## Route Surface

### `/`

Landing page for Gradient Atlas. It introduces the product, surfaces current progress, and gives the learner a "continue where I left off" path into study.

### `/map`

Curriculum overview route. It shows a deterministic module-cluster layout, search, filters, progress summaries, starter path selection, explainable recommendations, and hover/focus previews before entering the learn route.

### `/learn/[nodeId]`

Primary study surface. The layout combines:

- left rail for module navigation, starter path context, and progress
- top area for breadcrumbs and quick search
- center focused local graph
- right detail panel for the selected concept, relation context, and next recommendations

This route persists current node and concept learning state in local storage.

### `/studio`

Local authoring prototype. It exposes forms for graph metadata, starter paths, nodes, and edges; validates the draft with the same Zod schema used at runtime; and supports local JSON import/export.

### `/gallery`

Local gallery of published graph packs. In the current repo this is a file-backed manifest, not a dynamic remote listing.

### `/graphs/[slug]`

Read-only published viewer for a graph pack listed in the local manifest. It shares the visual language of the main app but does not expose editing controls.

## Experience Architecture

### Shared Shell

The app uses a common shell with:

- a top bar for branding, navigation, and preferences
- an optional left rail for context and controls
- a center canvas for graph views
- an optional right panel for detail and secondary actions

This keeps the route-to-route transition stable while changing only the work surface and supporting panels.

### Focused Graph Strategy

Gradient Atlas does not use a random force layout for study views. The runtime favors deterministic layouts that preserve orientation:

- local neighborhoods in `/learn/[nodeId]`
- module lanes and clustering in `/map`, `/studio`, and `/graphs/[slug]`

The graph should usually expose enough nearby structure to answer "what unlocks this?" and "what comes next?" without overwhelming the learner.

### Motion System

Motion is part of comprehension:

- hover and press confirm interaction
- selection preserves spatial continuity into detail views
- highlight animations explain paths and relations
- camera movement stays gentle and is disabled in reduced-motion mode

An in-app motion preference is persisted locally and can override system preference.

## Local-First State Model

The current app stores user-local state in the browser:

- learning progress and current node
- motion preference and UI preference state
- studio draft graph

This keeps the prototype self-contained and removes backend requirements while the interaction model is still being refined.

## Local Studio Workflow

The studio is intentionally file- and schema-oriented:

1. Start from the bundled ML Fundamentals graph or a previously persisted local draft.
2. Edit graph metadata, starter paths, nodes, and edges through forms.
3. Validate the draft against the runtime schema with friendly issues.
4. Import a full graph JSON object into the draft.
5. Export the current draft as JSON for inspection, handoff, or future publishing.

All relation types are fixed and typed. The studio is not a free-form graph editor.

## Published Viewer and Gallery

Published packs are file-backed in this phase:

- a local manifest defines which graphs appear in `/gallery`
- each graph gets a stable slug for `/graphs/[slug]`
- the published viewer is read-only

`ml-fundamentals` is the first published pack and acts as the reference implementation for future packs.

## Future Backend Plan

The next major architecture step is a backend-backed content system, but not before the local-first model is stable. The likely sequence is:

1. Keep the current schema as the canonical contract.
2. Add pack versioning and content validation in a service layer.
3. Add authenticated creator workflows and remote storage.
4. Add publishing, fork/version history, and collaboration controls.
5. Keep the read-only viewer compatible with file-based packs during migration.

The backend should extend the current content model, not replace it.
