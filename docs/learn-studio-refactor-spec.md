# Learn And Studio Refactor Spec

## Why this pass exists

The simplified UI pass reduced global clutter, but the core interaction contract is still off in two places:

1. Learn does not clearly separate `peek` from `commit`.
2. Studio still exposes too much editing surface at once.

This refactor keeps the current feature set and reduces cognitive load by clarifying state, hierarchy, and viewport behavior.

## Diagnosis

### Learn

- Hover and selection semantics are too close together.
- The local graph reads like a generic neighbor cluster instead of a learning map.
- Edge weight does not explain which relations define learning order.
- The detail panel asks for too much attention before the user has scanned the graph.
- There is no explicit, testable viewport contract for when the canvas should move.

### Studio

- Import/export JSON is visible too early and too often.
- Delete actions are too prominent in the main editing flow.
- The editor exposes full content fields at once instead of grouping them by authoring task.
- The preview canvas should support selection, but should not feel reactive or unstable.

## Chosen direction

### Learn

Make Learn a small, deterministic study map with a real interaction contract:

- `hover = peek`
- `focus = peek`
- `click = commit`
- `double click` is reserved for explicit centering if needed later

The graph becomes a lane-based neighborhood:

- left lane: prerequisites
- center lane: current concept
- right lane: next or dependent concepts
- bottom strip: related or context concepts

The canvas becomes a scrollable viewport over a larger world, so camera behavior is explicit and testable.

### Studio

Make Studio feel like an editor instead of a control room:

- left rail: choose pack / node / edge
- center: stable preview
- right: edit only the selected object

Raw JSON moves into advanced tools. Destructive actions move into a collapsed danger zone.

## Wireframes

### Learn

```text
+--------------------------------------------------------------------------------------+
| Top bar                                                                              |
+--------------------------------------------------------------------------------------+
| Breadcrumbs / search / one compact path line                                         |
+--------------------------------------------------------------------------------------+
|                                                                 | Detail panel       |
|  Local graph viewport                                           | (optional)         |
|                                                                 |                    |
|  [ prereq ]        [ current ]        [ next ]                  | title              |
|  [ prereq ]                           [ next ]                  | summary            |
|                                                                 | why it matters     |
|               [ related ] [ related ] [+N more]                 | prerequisites      |
|                                                                 | next concepts      |
|                                                                 | one formula/example|
|                                                                 | recommendations    |
|                                                                 | disclosures        |
+--------------------------------------------------------------------------------------+
```

### Studio

```text
+--------------------------------------------------------------------------------------+
| Top bar                                                                              |
+--------------------------------------------------------------------------------------+
| Title / pack summary                                                                 |
+--------------------------------------------------------------------------------------+
| Object list              | Preview canvas                         | Editor            |
|                          |                                        |                   |
| [Pack] [Nodes] [Edges]   | stable deterministic map               | tabs              |
|                          |                                        | Basic             |
| node list or edge list   | click selects                          | Content           |
| compact create action    | no hover camera motion                 | Relations         |
|                          |                                        | Advanced tools    |
|                          |                                        | Danger zone       |
+--------------------------------------------------------------------------------------+
```

## Learn interaction contract

### Hover and focus

- highlight the node
- highlight incident edges
- optionally reveal one small edge rationale surface
- fade unrelated nodes and edges slightly
- do not pan, zoom, or recenter the viewport

### Click and selection

- update the current route
- update the detail panel
- update current node state
- only recenter if the selected node sits outside a central safe frame

### Safe-zone rule

- viewport safe frame: central 60 percent of width and 60 percent of height
- if the selected node center stays inside the safe frame, keep the current scroll position
- if it exits the safe frame, scroll just enough to bring it back toward the center
- preserve manual panning by never resetting scroll when the node is already safe

## Learn layout rules

- current node stays visually strongest
- show at most:
  - 2 prerequisites
  - 2 dependents
  - 2 related/context nodes
- extra nodes collapse into `+N more` affordances
- prerequisite edges use the primary visual treatment
- non-prerequisite relations are weaker and differentiated
- only relevant edge labels appear on hover or selection

## Detail panel rules

Show by default:

- title
- one-sentence summary
- why it matters
- prerequisites
- next concepts
- one formula or one example
- next recommended node(s) with one `Why next?` explanation

Hide behind disclosures:

- formal definition
- long notes
- additional formulas
- extended examples
- exercises
- extra related content

## Studio rules

- raw import/export JSON lives under advanced tools
- delete actions live in a collapsed danger zone
- validation stays visible near the editor header, but does not dominate
- editor fields are grouped by task:
  - Basic
  - Content
  - Relations
- preview selection is click-first and stable

## Verification targets

- hover never triggers viewport movement
- selection only recenters when needed
- lane layout stays deterministic
- edge styling cleanly separates prerequisite from secondary relations
- studio advanced JSON stays secondary by default
