"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ModuleOverviewCanvas } from "@/components/graph/module-overview-canvas";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
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
    <label className="quiet-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function SectionTitle({
  action,
  title,
}: {
  action?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="quiet-label">{title}</p>
      {action}
    </div>
  );
}

function SegmentedButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Disclosure({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="soft-divider pt-5">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-foreground"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
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
  const [editorTab, setEditorTab] = useState<"basic" | "content" | "relations">(
    "basic",
  );
  const [graphTab, setGraphTab] = useState<"meta" | "paths">("meta");
  const [leftView, setLeftView] = useState<"edges" | "nodes" | "pack">("nodes");
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
  const connectedEdges = selectedNode
    ? draftGraph.edges.filter(
        (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
      )
    : [];
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
    : selectedNode
      ? draftGraph.edges
          .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
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
          activeStarterPathNodeIds={draftGraph.starterPaths[0]?.nodeIds ?? []}
          activeStarterPathTitle="Studio preview"
          canvasLabel="Local studio graph preview"
          graph={draftGraph}
          moduleOrder={mlFundamentalsModuleOrder}
          onActivateNode={selectNode}
          selectedNodeId={previewNodeId}
          visibleNodeIds={draftGraph.nodes.map((node) => node.id)}
        />
      }
      currentSection="studio"
      description="Choose one object, edit it on the right, and keep the graph preview stable in the middle."
      leftRail={
        <div className="surface-panel space-y-5 p-5">
          <div className="rounded-full border border-border/70 bg-background/72 p-1">
            <div className="flex items-center justify-between gap-1">
              <SegmentedButton
                active={leftView === "pack"}
                onClick={() => setLeftView("pack")}
              >
                Pack
              </SegmentedButton>
              <SegmentedButton
                active={leftView === "nodes"}
                onClick={() => setLeftView("nodes")}
              >
                Nodes
              </SegmentedButton>
              <SegmentedButton
                active={leftView === "edges"}
                onClick={() => setLeftView("edges")}
              >
                Edges
              </SegmentedButton>
            </div>
          </div>

          {leftView === "pack" ? (
            <div className="space-y-4">
              <SectionTitle title="Pack" />
              <button
                className={cn(
                  "w-full rounded-[1rem] border px-4 py-4 text-left transition-colors",
                  selected.kind === "graph"
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border/70 bg-background/72 text-muted-foreground hover:text-foreground",
                )}
                onClick={selectGraph}
                type="button"
              >
                <p className="font-medium text-foreground">{draftGraph.title}</p>
                <p className="mt-1 text-sm">{draftGraph.description}</p>
              </button>
            </div>
          ) : null}

          {leftView === "nodes" ? (
            <div className="space-y-4">
              <SectionTitle
                action={
                  <Button onClick={createNode} size="sm" type="button" variant="outline">
                    New node
                  </Button>
                }
                title="Nodes"
              />
              <div className="space-y-2">
                {draftGraph.nodes.map((node) => (
                  <button
                    className={cn(
                      "w-full rounded-[1rem] border px-3 py-3 text-left transition-colors",
                      selected.kind === "node" && selected.nodeId === node.id
                        ? "border-primary/30 bg-primary/10 text-foreground"
                        : "border-border/70 bg-background/72 text-muted-foreground hover:text-foreground",
                    )}
                    key={node.id}
                    onClick={() => selectNode(node.id)}
                    type="button"
                  >
                    <p className="font-medium text-foreground">{node.shortTitle}</p>
                    <p className="mt-1 text-sm">{node.module}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {leftView === "edges" ? (
            <div className="space-y-4">
              <SectionTitle
                action={
                  <Button onClick={createEdge} size="sm" type="button" variant="outline">
                    New edge
                  </Button>
                }
                title="Edges"
              />
              <div className="space-y-2">
                {draftGraph.edges.map((edge) => (
                  <button
                    className={cn(
                      "w-full rounded-[1rem] border px-3 py-3 text-left transition-colors",
                      selected.kind === "edge" && selected.edgeId === edge.id
                        ? "border-primary/30 bg-primary/10 text-foreground"
                        : "border-border/70 bg-background/72 text-muted-foreground hover:text-foreground",
                    )}
                    key={edge.id}
                    onClick={() => selectEdge(edge.id)}
                    type="button"
                  >
                    <p className="font-medium text-foreground">{edge.label}</p>
                    <p className="mt-1 text-sm">
                      {edge.source} to {edge.target}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      }
      rightPanel={
        <div className="surface-panel space-y-5 p-5">
          <div className="space-y-3">
            <SectionTitle title="Editor" />
            {validationIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">Schema valid.</p>
            ) : (
              <div className="rounded-[1rem] border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <p className="font-medium">{validationIssues.length} validation issues</p>
                <div className="mt-2 space-y-1">
                  {validationIssues.slice(0, 4).map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selected.kind === "graph" ? (
            <div className="soft-divider space-y-4 pt-5">
              <div className="rounded-full border border-border/70 bg-background/72 p-1">
                <div className="flex items-center justify-between gap-1">
                  <SegmentedButton
                    active={graphTab === "meta"}
                    onClick={() => setGraphTab("meta")}
                  >
                    Meta
                  </SegmentedButton>
                  <SegmentedButton
                    active={graphTab === "paths"}
                    onClick={() => setGraphTab("paths")}
                  >
                    Paths
                  </SegmentedButton>
                </div>
              </div>

              {graphTab === "meta" ? (
                <div className="space-y-4">
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
                </div>
              ) : (
                <div className="space-y-4">
                  {draftGraph.starterPaths.map((starterPath) => (
                    <div
                      className="space-y-3 rounded-[1rem] border border-border/70 bg-background/72 p-4"
                      key={starterPath.id}
                    >
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
                  ))}
                </div>
              )}

              <Disclosure title="Advanced tools">
                <div className="space-y-2">
                  <Label htmlFor="studio-import">Import graph JSON</Label>
                  <Textarea
                    id="studio-import"
                    onChange={(event) => setImportBuffer(event.target.value)}
                    placeholder='Paste a full graph JSON object here, then choose "Import draft".'
                    rows={8}
                    value={importBuffer}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={importFromBuffer} size="sm" type="button">
                      Import draft
                    </Button>
                    <Button
                      onClick={resetToMlFundamentals}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Reset pack
                    </Button>
                  </div>
                  {importFeedback ? (
                    <p className="text-sm text-muted-foreground">{importFeedback}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studio-export">Export preview</Label>
                  <Textarea id="studio-export" readOnly rows={10} value={exportPreview} />
                </div>
              </Disclosure>
            </div>
          ) : null}

          {selectedNode ? (
            <div className="soft-divider space-y-4 pt-5">
              <div className="rounded-full border border-border/70 bg-background/72 p-1">
                <div className="flex items-center justify-between gap-1">
                  <SegmentedButton
                    active={editorTab === "basic"}
                    onClick={() => setEditorTab("basic")}
                  >
                    Basic
                  </SegmentedButton>
                  <SegmentedButton
                    active={editorTab === "content"}
                    onClick={() => setEditorTab("content")}
                  >
                    Content
                  </SegmentedButton>
                  <SegmentedButton
                    active={editorTab === "relations"}
                    onClick={() => setEditorTab("relations")}
                  >
                    Relations
                  </SegmentedButton>
                </div>
              </div>

              {editorTab === "basic" ? (
                <div className="space-y-4">
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
                        max={5}
                        min={1}
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

                  <div className="space-y-2">
                    <Label htmlFor="node-summary">Summary</Label>
                    <Textarea
                      id="node-summary"
                      onChange={(event) =>
                        updateNode(selectedNode.id, { summary: event.target.value })
                      }
                      rows={3}
                      value={selectedNode.summary}
                    />
                  </div>
                </div>
              ) : null}

              {editorTab === "content" ? (
                <div className="space-y-4">
                  {[
                    { field: "intuition", value: selectedNode.intuition, rows: 3 },
                    {
                      field: "formalDefinition",
                      value: selectedNode.formalDefinition,
                      rows: 3,
                    },
                    { field: "bodyMarkdown", value: selectedNode.bodyMarkdown, rows: 6 },
                  ].map(({ field, rows, value }) => (
                    <div className="space-y-2" key={field}>
                      <Label htmlFor={field}>{field}</Label>
                      <Textarea
                        id={field}
                        onChange={(event) =>
                          updateNode(selectedNode.id, {
                            [field]: event.target.value,
                          })
                        }
                        rows={rows}
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
                </div>
              ) : null}

              {editorTab === "relations" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="quiet-label">Connected edges</p>
                    {connectedEdges.length > 0 ? (
                      <div className="space-y-2">
                        {connectedEdges.map((edge) => (
                          <button
                            className="w-full rounded-[1rem] border border-border/70 bg-background/72 px-4 py-3 text-left transition-colors hover:bg-secondary/32"
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
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No edges connect to this node yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              <Disclosure title="Danger zone">
                <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    Delete only after checking starter paths and connected edges.
                  </p>
                  <Button
                    className="mt-3"
                    onClick={deleteSelectedNode}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    Delete node
                  </Button>
                </div>
              </Disclosure>
            </div>
          ) : null}

          {selectedEdge ? (
            <div className="soft-divider space-y-4 pt-5">
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

              <Disclosure title="Danger zone">
                <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    Deleting this edge removes one explicit relation from the pack.
                  </p>
                  <Button
                    className="mt-3"
                    onClick={deleteSelectedEdge}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    Delete edge
                  </Button>
                </div>
              </Disclosure>
            </div>
          ) : null}
        </div>
      }
      rightPanelLabel="Studio editor"
      sectionEyebrow="Local studio"
      title="Author a local graph pack"
    />
  );
}
