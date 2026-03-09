# Gradient Atlas Content Model

## Purpose

Gradient Atlas stores curriculum packs as strict typed graph JSON. The same content model powers:

- runtime study views
- recommendations and prerequisite checks
- map search and filtering
- local studio authoring
- published viewer and gallery manifests

The schema lives in [`lib/schema.ts`](/D:/MYFILES/MindMap/lib/schema.ts) and is validated with Zod.

## Top-Level Graph Shape

Each graph pack follows this structure:

```ts
type KnowledgeGraph = {
  id: string;
  title: string;
  description: string;
  nodes: CurriculumNode[];
  edges: GraphEdge[];
  starterPaths: StarterPath[];
};
```

### Graph fields

- `id`: stable machine id for the pack
- `title`: human-readable pack title
- `description`: concise pack description used in UI surfaces
- `nodes`: concept inventory
- `edges`: typed concept relationships
- `starterPaths`: recommended onboarding sequences through the graph

## Node Model

```ts
type CurriculumNode = {
  id: string;
  title: string;
  shortTitle: string;
  module: Module;
  summary: string;
  intuition: string;
  formalDefinition: string;
  bodyMarkdown: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  aliases: string[];
  keyQuestions: string[];
  formulas: string[];
  examples: string[];
  exercisePrompts: string[];
};
```

### Authoring guidance

- `summary`: short orientation paragraph used in cards and previews
- `intuition`: plain-language mental model
- `formalDefinition`: textbook-style definition separated from intuition
- `bodyMarkdown`: longer structured study notes for future lesson rendering
- `difficulty`: relative challenge from 1 to 5
- `estimatedMinutes`: expected reading/study time for the concept
- `aliases`: alternate names and abbreviations
- `keyQuestions`: review prompts that should guide attention
- `formulas`: symbolic expressions when relevant
- `examples`: concrete examples, at least one
- `exercisePrompts`: learner prompts, at least one

## Module Enum

Current module values:

- `Foundations`
- `Data Splits and Leakage`
- `Linear Models and Optimization`
- `Evaluation and Generalization`
- `Trees and Ensembles`
- `Unsupervised Learning`
- `Neural Networks (Preview)`

These module labels are used in filtering, layout grouping, and route UI.

## Edge Model

```ts
type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
  label: string;
  rationale: string;
};
```

### Relation types

- `prerequisite_of`
- `uses`
- `optimizes`
- `evaluates`
- `regularizes`
- `contrasts_with`
- `example_of`
- `extension_of`

### Edge semantics

- `source` and `target` reference node ids
- `label` is a short human-readable relation label
- `rationale` explains why the relationship exists

The studio does not allow arbitrary relation types. It reuses the fixed runtime enum.

## Starter Paths

```ts
type StarterPath = {
  id: "absolute-beginner" | "math-refresh" | "interview-oriented";
  title: string;
  summary: string;
  nodeIds: string[];
};
```

Starter paths provide guided entry points through the same graph. They are used in:

- landing-page continuation and orientation
- map highlighting
- recommendation ordering
- learn-route context
- published viewer path emphasis

## Validation Rules

The runtime schema enforces:

- non-empty graph metadata
- valid node shape
- valid edge shape
- valid starter path shape
- unique node ids
- unique edge ids
- edge endpoints must reference existing nodes
- starter path node ids must reference existing nodes
- starter path ids must be unique within a graph

This validation is shared by the app runtime and the local studio.

## Search, Filter, and Recommendation Inputs

### Search index

Current search behavior draws from:

- `title`
- `shortTitle`
- `summary`
- `formalDefinition`
- `aliases`
- `keyQuestions`
- `formulas`
- `examples`

The map route ranks exact title and alias matches before broader text matches.

### Progress-aware recommendation inputs

Recommendations combine:

- current node
- selected starter path
- prerequisite readiness
- current node learning status

Learning status is stored locally per node and currently uses:

- `exploring`
- `understood`
- `mastered`

The recommendation layer also produces unmet-prerequisite warnings when a target concept depends on too many unfinished prerequisites.

## Local Storage and Runtime Alignment

Current local-first state is split across a few stores:

- learning progress and current node
- UI and motion preferences
- studio draft graph

The important constraint is alignment: the studio draft graph uses the same `KnowledgeGraphSchema` as the runtime pack loader and published viewer.

## Import/Export Contract

The studio import/export workflow operates on full graph JSON objects:

1. Import accepts a full `KnowledgeGraph` JSON payload.
2. The payload is parsed and validated with Zod.
3. Validation issues are surfaced in the UI as friendly messages.
4. Export emits the current draft graph as formatted JSON.

This keeps local authoring deterministic and portable without a backend.

## Published Gallery Contract

Published graphs are registered in a local manifest. Each entry supplies:

- `slug`
- `title`
- `summary`
- `description`
- `highlightedStarterPathId`
- `graph`

The gallery route lists these entries, and `/graphs/[slug]` renders the corresponding graph in read-only mode.

## Extension Guidance

When adding a new curriculum pack:

1. Create a new `KnowledgeGraph` object that passes schema validation.
2. Keep module labels and relation types inside the existing enums unless the product intentionally changes.
3. Register the pack in the local manifest for gallery and published-viewer access.
4. Reuse starter paths to make recommendation behavior deterministic from day one.

When the backend arrives, this file-based contract should remain the canonical content shape.
