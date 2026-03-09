"use client";

import { useMemo, useState } from "react";
import { ModuleOverviewCanvas } from "@/components/graph/module-overview-canvas";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mlFundamentalsModuleOrder } from "@/data/ml-fundamentals";
import { KnowledgeGraphSchema, RelationTypeSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  getEdgeLabelForRelationType,
  useStudioDraftStore,
} from "@/stores/studio-draft";

function listToText(items: string[]) {
  return items.join("\n");
}

function textToList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      className="text-xs font-semibold uppercase tracking-[0.18em] text-primary"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function ValidationCard({ issues }: { issues: string[] }) {
  return (
    <Card className="surface-panel">
      <CardHeader>
        <CardTitle className="text-base">Validation</CardTitle>
        <CardDescription>
          The studio and runtime share the same strict schema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {issues.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3 text-emerald-950/80">
            Draft graph is valid.
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-destructive">
            {issues.map((issue) => (
              <p key={issue}>{issue}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StudioWorkspace() {
  const createEdge = useStudioDraftStore((state) => state.createEdge);
  const createNode = useStudioDraftStore((state) => state.createNode);
  const deleteSelectedEdge = useStudioDraftStore(
    (state) => state.deleteSelectedEdge,
  );
  const deleteSelectedNode = useStudioDraftStore(
    (state) => state.deleteSelectedNode,
  );
  const draftGraph = useStudioDraftStore((state) => state.draftGraph);
  const importGraph = useStudioDraftStore((state) => state.importGraph);
  const resetToMlFundamentals = useStudioDraftStore(
    (state) => state.resetToMlFundamentals,
  );
  const selected = useStudioDraftStore((state) => state.selected);
  const selectEdge = useStudioDraftStore((state) => state.selectEdge);
  const selectGraph = useStudioDraftStore((state) => state.selectGraph);
  const selectNode = useStudioDraftStore((state) => state.selectNode);
  const updateEdge = useStudioDraftStore((state) => state.updateEdge);
  const updateGraph = useStudioDraftStore((state) => state.updateGraph);
  const updateNode = useStudioDraftStore((state) => state.updateNode);
  const updateStarterPath = useStudioDraftStore((state) => state.updateStarterPath);
  const [importBuffer, setImportBuffer] = useState("");
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const validationResult = useMemo(
    () => KnowledgeGraphSchema.safeParse(draftGraph),
    [draftGraph],
  );
  const validationIssues = validationResult.success
    ? []
    : validationResult.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";

        return `${path}${issue.message}`;
      });
  const selectedNode =
    selected.kind === "node"
      ? draftGraph.nodes.find((node) => node.id === selected.nodeId) ?? null
      : null;
  const selectedEdge =
    selected.kind === "edge"
      ? draftGraph.edges.find((edge) => edge.id === selected.edgeId) ?? null
      : null;
  const previewNodeId =
    selectedNode?.id ??
    selectedEdge?.source ??
    draftGraph.nodes[0]?.id ??
    null;
  const starterPathEdgeIds = draftGraph.starterPaths[0]
    ? draftGraph.starterPaths[0].nodeIds.flatMap((nodeId, index) => {
        const nextNodeId = draftGraph.starterPaths[0]?.nodeIds[index + 1];

        if (!nextNodeId) {
          return [];
        }

        const edge = draftGraph.edges.find(
          (edgeItem) =>
            (edgeItem.source === nodeId && edgeItem.target === nextNodeId) ||
            (edgeItem.source === nextNodeId && edgeItem.target === nodeId),
        );

        return edge ? [edge.id] : [];
      })
    : [];
  const activeEdgeIds = selectedEdge
    ? [selectedEdge.id]
    : previewNodeId
      ? draftGraph.edges
          .filter(
            (edge) => edge.source === previewNodeId || edge.target === previewNodeId,
          )
          .map((edge) => edge.id)
      : [];
  const exportPreview = JSON.stringify(
    validationResult.success ? validationResult.data : draftGraph,
    null,
    2,
  );

  function importFromBuffer() {
    setImportFeedback(null);

    try {
      const parsedJson = JSON.parse(importBuffer);
      const parsedGraph = KnowledgeGraphSchema.safeParse(parsedJson);

      if (!parsedGraph.success) {
        setImportFeedback(
          parsedGraph.error.issues
            .map((issue) => issue.message)
            .join(" "),
        );
        return;
      }

      importGraph(parsedGraph.data);
      setImportFeedback("Imported graph JSON into the local studio draft.");
    } catch (error) {
      setImportFeedback(
        error instanceof Error ? error.message : "Could not parse the JSON input.",
      );
    }
  }

  return (
    <AppShell
      center={
        <ModuleOverviewCanvas
          activeEdgeIds={activeEdgeIds}
          activeStarterPathEdgeIds={starterPathEdgeIds}
          activeStarterPathTitle="Studio preview"
          canvasLabel="Local studio graph preview"
          graph={draftGraph}
          moduleOrder={mlFundamentalsModuleOrder}
          onActivateNode={selectNode}
          onPreviewNode={(nodeId) => {
            if (nodeId) {
              selectNode(nodeId);
            }
          }}
          previewNodeId={previewNodeId}
          selectedNodeId={previewNodeId}
          visibleNodeIds={draftGraph.nodes.map((node) => node.id)}
        />
      }
      currentSection="studio"
      description="Author a local graph pack, preview it on the shared deterministic canvas, validate it against the runtime schema, and import or export JSON without adding a backend."
      leftRail={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Draft actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button onClick={selectGraph} size="sm" type="button" variant="outline">
                  Edit graph meta
                </Button>
                <Button
                  onClick={resetToMlFundamentals}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Reset to ML Fundamentals
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studio-import">Import graph JSON</Label>
                <Textarea
                  id="studio-import"
                  onChange={(event) => setImportBuffer(event.target.value)}
                  placeholder='Paste a full graph JSON object here, then choose "Import draft".'
                  rows={10}
                  value={importBuffer}
                />
                <Button onClick={importFromBuffer} size="sm" type="button">
                  Import draft
                </Button>
                {importFeedback ? (
                  <p className="text-sm text-muted-foreground">{importFeedback}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studio-export">Export preview</Label>
                <Textarea
                  id="studio-export"
                  readOnly
                  rows={12}
                  value={exportPreview}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Nodes</CardTitle>
                <Button onClick={createNode} size="sm" type="button" variant="outline">
                  New node
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {draftGraph.nodes.map((node) => (
                <button
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors duration-fast",
                    selected.kind === "node" && selected.nodeId === node.id
                      ? "border-primary/30 bg-primary/10 shadow-soft"
                      : "border-border/70 bg-background/80 hover:bg-secondary/50",
                  )}
                  key={node.id}
                  onClick={() => selectNode(node.id)}
                  type="button"
                >
                  <p className="font-medium text-foreground">{node.shortTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{node.module}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Edges</CardTitle>
                <Button onClick={createEdge} size="sm" type="button" variant="outline">
                  New edge
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {draftGraph.edges.map((edge) => (
                <button
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors duration-fast",
                    selected.kind === "edge" && selected.edgeId === edge.id
                      ? "border-primary/30 bg-primary/10 shadow-soft"
                      : "border-border/70 bg-background/80 hover:bg-secondary/50",
                  )}
                  key={edge.id}
                  onClick={() => selectEdge(edge.id)}
                  type="button"
                >
                  <p className="font-medium text-foreground">{edge.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {edge.source} to {edge.target}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      }
      rightPanel={
        <>
          <ValidationCard issues={validationIssues} />

          {selected.kind === "graph" ? (
            <Card className="surface-panel">
              <CardHeader>
                <CardTitle className="text-base">Graph metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="graph-id">Graph id</Label>
                  <Input
                    id="graph-id"
                    onChange={(event) => updateGraph({ id: event.target.value })}
                    value={draftGraph.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graph-title">Title</Label>
                  <Input
                    id="graph-title"
                    onChange={(event) => updateGraph({ title: event.target.value })}
                    value={draftGraph.title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graph-description">Description</Label>
                  <Textarea
                    id="graph-description"
                    onChange={(event) =>
                      updateGraph({ description: event.target.value })
                    }
                    rows={4}
                    value={draftGraph.description}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Starter paths
                  </p>
                  {draftGraph.starterPaths.map((starterPath) => (
                    <div
                      className="rounded-xl border border-border/70 bg-background/70 p-3"
                      key={starterPath.id}
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`${starterPath.id}-title`}>{starterPath.id}</Label>
                        <Input
                          id={`${starterPath.id}-title`}
                          onChange={(event) =>
                            updateStarterPath(starterPath.id, {
                              title: event.target.value,
                            })
                          }
                          value={starterPath.title}
                        />
                        <Textarea
                          onChange={(event) =>
                            updateStarterPath(starterPath.id, {
                              summary: event.target.value,
                            })
                          }
                          rows={3}
                          value={starterPath.summary}
                        />
                        <Textarea
                          onChange={(event) =>
                            updateStarterPath(starterPath.id, {
                              nodeIds: textToList(event.target.value),
                            })
                          }
                          rows={5}
                          value={listToText(starterPath.nodeIds)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {selectedNode ? (
            <Card className="surface-panel">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Node editor</CardTitle>
                  <Button
                    onClick={deleteSelectedNode}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    Delete node
                  </Button>
                </div>
                <CardDescription>
                  Edit one concept directly against the runtime curriculum schema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="node-id">Node id</Label>
                    <Input
                      id="node-id"
                      onChange={(event) =>
                        updateNode(selectedNode.id, { id: event.target.value })
                      }
                      value={selectedNode.id}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-short-title">Short title</Label>
                    <Input
                      id="node-short-title"
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          shortTitle: event.target.value,
                        })
                      }
                      value={selectedNode.shortTitle}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="node-title">Title</Label>
                  <Input
                    id="node-title"
                    onChange={(event) =>
                      updateNode(selectedNode.id, { title: event.target.value })
                    }
                    value={selectedNode.title}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="node-module">Module</Label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-border/80 bg-background/85 px-3 py-2 text-sm text-foreground shadow-soft"
                      id="node-module"
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          module: event.target.value as (typeof selectedNode)["module"],
                        })
                      }
                      value={selectedNode.module}
                    >
                      {mlFundamentalsModuleOrder.map((module) => (
                        <option key={module} value={module}>
                          {module}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-difficulty">Difficulty</Label>
                    <Input
                      id="node-difficulty"
                      min={1}
                      max={5}
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          difficulty: Number(event.target.value),
                        })
                      }
                      type="number"
                      value={selectedNode.difficulty}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-minutes">Minutes</Label>
                    <Input
                      id="node-minutes"
                      min={1}
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          estimatedMinutes: Number(event.target.value),
                        })
                      }
                      type="number"
                      value={selectedNode.estimatedMinutes}
                    />
                  </div>
                </div>

                {[
                  { field: "summary", value: selectedNode.summary },
                  { field: "intuition", value: selectedNode.intuition },
                  {
                    field: "formalDefinition",
                    value: selectedNode.formalDefinition,
                  },
                  { field: "bodyMarkdown", value: selectedNode.bodyMarkdown },
                ].map(({ field, value }) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{field}</Label>
                    <Textarea
                      id={field}
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          [field]: event.target.value,
                        })
                      }
                      rows={field === "bodyMarkdown" ? 6 : 3}
                      value={value}
                    />
                  </div>
                ))}

                {[
                  { field: "aliases", items: selectedNode.aliases },
                  { field: "keyQuestions", items: selectedNode.keyQuestions },
                  { field: "formulas", items: selectedNode.formulas },
                  { field: "examples", items: selectedNode.examples },
                  {
                    field: "exercisePrompts",
                    items: selectedNode.exercisePrompts,
                  },
                ].map(({ field, items }) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{field}</Label>
                    <Textarea
                      id={field}
                      onChange={(event) =>
                        updateNode(selectedNode.id, {
                          [field]: textToList(event.target.value),
                        })
                      }
                      rows={5}
                      value={listToText(items)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {selectedEdge ? (
            <Card className="surface-panel">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Edge editor</CardTitle>
                  <Button
                    onClick={deleteSelectedEdge}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    Delete edge
                  </Button>
                </div>
                <CardDescription>
                  Fixed typed relations only. The studio stays aligned with the runtime
                  schema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edge-id">Edge id</Label>
                  <Input
                    id="edge-id"
                    onChange={(event) =>
                      updateEdge(selectedEdge.id, { id: event.target.value })
                    }
                    value={selectedEdge.id}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edge-source">Source</Label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-border/80 bg-background/85 px-3 py-2 text-sm text-foreground shadow-soft"
                      id="edge-source"
                      onChange={(event) =>
                        updateEdge(selectedEdge.id, { source: event.target.value })
                      }
                      value={selectedEdge.source}
                    >
                      {draftGraph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.shortTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edge-target">Target</Label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-border/80 bg-background/85 px-3 py-2 text-sm text-foreground shadow-soft"
                      id="edge-target"
                      onChange={(event) =>
                        updateEdge(selectedEdge.id, { target: event.target.value })
                      }
                      value={selectedEdge.target}
                    >
                      {draftGraph.nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.shortTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edge-type">Relation type</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-border/80 bg-background/85 px-3 py-2 text-sm text-foreground shadow-soft"
                    id="edge-type"
                    onChange={(event) => {
                      const relationType = RelationTypeSchema.parse(event.target.value);

                      updateEdge(selectedEdge.id, {
                        label: getEdgeLabelForRelationType(relationType),
                        relationType,
                      });
                    }}
                    value={selectedEdge.relationType}
                  >
                    {RelationTypeSchema.options.map((relationType) => (
                      <option key={relationType} value={relationType}>
                        {relationType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edge-label">Label</Label>
                  <Input
                    id="edge-label"
                    onChange={(event) =>
                      updateEdge(selectedEdge.id, { label: event.target.value })
                    }
                    value={selectedEdge.label}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edge-rationale">Rationale</Label>
                  <Textarea
                    id="edge-rationale"
                    onChange={(event) =>
                      updateEdge(selectedEdge.id, { rationale: event.target.value })
                    }
                    rows={4}
                    value={selectedEdge.rationale}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      }
      rightPanelLabel="Studio editor"
      sectionEyebrow="Local studio"
      title="Author and validate a local graph pack"
    />
  );
}
