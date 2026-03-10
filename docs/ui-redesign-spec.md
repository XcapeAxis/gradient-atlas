# Gradient Atlas UI Redesign Spec

## Context

Figma MCP is not available in this workspace. This document replaces the Figma-first step with a local redesign artifact that locks the information architecture, layout hierarchy, and subtraction rules before implementation.

## Diagnosis Of The Current UI

- The product reads like a dashboard instead of a learning tool.
- Too many bordered regions compete for attention on the same screen.
- The learn route gives persistent weight to side rails instead of the graph.
- Home tries to explain the product, the current state, the demo narrative, and route structure at the same time.
- Map mixes overview, recommendation, preview, legend, and progress into parallel cards that flatten hierarchy.
- Bilingual copy is often duplicated line by line, which increases scan cost.
- Motion is mostly calm already, but too many surfaces still animate or look interactive.

## Redesign Principles

1. One screen, one main job.
2. The graph is the main character on Learn.
3. Home is orientation, not a dashboard.
4. Use spacing and type scale before borders and badges.
5. Show each piece of state once per screen.
6. Keep bilingual support light: English first, brief Chinese subtitle only where it helps orientation.
7. Motion must explain focus, selection, and handoff. Everything else should quiet down.

## Reduced Information Architecture

### Home

Keep:
- product positioning
- one primary CTA
- one starter-path chooser
- one small concept spotlight / graph preview
- one compact continue-learning surface

Remove:
- repeated progress summaries
- repeated recommendation surfaces
- route explanation blocks
- milestone or feature inventory cards
- multiple parallel hero support cards

### Learn

Keep:
- minimal top framing
- large graph canvas
- compact study controls
- detail panel only when a node is selected

Reduce:
- always-open left rail
- duplicate recommendation/progress/path summaries
- explanatory blocks around the graph

### Map

Keep:
- readable module overview
- search
- a small filter set
- lightweight preview
- one recommendation area

Reduce:
- parallel story cards
- oversized legends
- persistent dense side content

### Studio

Keep:
- graph preview
- clear forms
- validation
- import/export

Reduce:
- marketing-style framing
- extra explanatory cards
- visually heavy lists

### Gallery

Keep:
- minimal pack list
- simple read-only viewer

Reduce:
- multiple metadata panels
- redundant publication explanation

## Preferred Direction

### Home

```text
+--------------------------------------------------------------+
| Top bar                                                      |
+--------------------------------------------------------------+
| Gradient Atlas                                               |
| Learn machine learning as a calm, navigable concept graph.   |
| 以可导航的概念图谱学习机器学习基础。                              |
| [Start learning]                                             |
|                                                              |
| Starter path: [Absolute beginner] [Math refresh] [Interview] |
|                                                              |
| +----------------------------+  +--------------------------+ |
| | Graph spotlight            |  | Continue learning        | |
| | one selected concept       |  | current node            | |
| | 3-5 nearby concepts max    |  | next recommended step   | |
| +----------------------------+  +--------------------------+ |
+--------------------------------------------------------------+
```

### Learn

```text
+--------------------------------------------------------------+
| Minimal top bar                    search   path   motion    |
+--------------------------------------------------------------+
| Breadcrumb / module / current concept                         |
|                                                              |
| +----------------------------------------------------------+ |
| |                                                          | |
| |               LARGE LOCAL GRAPH CANVAS                   | |
| |                                                          | |
| +----------------------------------------------------------+ |
|                                                              |
| Optional detail drawer / right panel when a node is active   |
| title, summary, intuition, formal definition, exercises      |
| next recommendation shown once at the end                    |
+--------------------------------------------------------------+
```

### Map

```text
+--------------------------------------------------------------+
| Title + concise framing                                      |
| search [..................]  starter path [chooser]          |
+--------------------------------------------------------------+
| filters: module / difficulty / completion / relation         |
+--------------------------------------------------------------+
| module overview canvas                                       |
| deterministic clusters with gentle muting for non-focus      |
+--------------------------------------------------------------+
| preview strip: hovered concept + one recommendation reason   |
+--------------------------------------------------------------+
```

### Studio

```text
+--------------------------------------------------------------+
| Studio title + short tool framing                            |
+--------------------------------------------------------------+
| left: entities list | center: live preview | right: editor   |
| secondary actions stay compact at the top of the editor      |
+--------------------------------------------------------------+
```

### Gallery

```text
+--------------------------------------------------------------+
| Simple gallery list                                          |
| cover/title/summary -> open viewer                           |
+--------------------------------------------------------------+
```

## Motion Simplification

- Keep node hover, press, relation highlight, detail handoff, and gentle recentering.
- Remove decorative motion from cards and non-critical regions.
- Reduce translate distance and simultaneous animation count.
- In reduced-motion mode, disable camera motion and large shifts, keep opacity, border, and shadow changes.

## Implementation Notes

- Reuse the existing routes and content model.
- Make the shared shell more flexible so Learn can become graph-first.
- Use the demo seed only for continuity, not as a new visible feature surface.
- Keep English as the primary language. Use a single short Chinese subtitle only in orientation-level surfaces.
