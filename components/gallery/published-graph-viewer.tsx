"use client";

import { useMemo, useState } from "react";
import { ModuleOverviewCanvas } from "@/components/graph/module-overview-canvas";
import { AppShell } from "@/components/layout/app-shell";
import type { PublishedGraphManifestEntry } from "@/data/published-graphs";
import {
  DEFAULT_ML_NODE_ID,
  mlFundamentalsModuleOrder,
} from "@/data/ml-fundamentals";

function getNodeById(
  graphEntry: PublishedGraphManifestEntry,
  nodeId: string | null | undefined,
) {
  if (!nodeId) {
    return null;
  }

  return graphEntry.graph.nodes.find((node) => node.id === nodeId) ?? null;
}

export function PublishedGraphViewer({
  graphEntry,
}: {
  graphEntry: PublishedGraphManifestEntry;
}) {
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(DEFAULT_ML_NODE_ID);
  const [starterPathId, setStarterPathId] = useState(graphEntry.highlightedStarterPathId);
  const previewNode = getNodeById(graphEntry, previewNodeId) ?? graphEntry.graph.nodes[0];
  const activeStarterPath =
    graphEntry.graph.starterPaths.find((path) => path.id === starterPathId) ??
    graphEntry.graph.starterPaths[0];
  const starterPathEdgeIds = useMemo(
    () =>
      activeStarterPath.nodeIds.flatMap((nodeId, index) => {
        const nextNodeId = activeStarterPath.nodeIds[index + 1];

        if (!nextNodeId) {
          return [];
        }

        const edge = graphEntry.graph.edges.find(
          (edgeItem) =>
            (edgeItem.source === nodeId && edgeItem.target === nextNodeId) ||
            (edgeItem.source === nextNodeId && edgeItem.target === nodeId),
        );

        return edge ? [edge.id] : [];
      }),
    [activeStarterPath, graphEntry.graph.edges],
  );
  const activeEdgeIds = graphEntry.graph.edges
    .filter(
      (edge) => edge.source === previewNode.id || edge.target === previewNode.id,
    )
    .map((edge) => edge.id);

  return (
    <AppShell
      center={
        <ModuleOverviewCanvas
          activeEdgeIds={activeEdgeIds}
          activeStarterPathEdgeIds={starterPathEdgeIds}
          activeStarterPathNodeIds={activeStarterPath.nodeIds}
          activeStarterPathTitle={activeStarterPath.title}
          canvasLabel={`${graphEntry.title} published viewer`}
          graph={graphEntry.graph}
          moduleOrder={mlFundamentalsModuleOrder}
          onActivateNode={setPreviewNodeId}
          onPreviewNode={setPreviewNodeId}
          previewNodeId={previewNode.id}
          selectedNodeId={previewNode.id}
          visibleNodeIds={graphEntry.graph.nodes.map((node) => node.id)}
        />
      }
      currentSection="gallery"
      description={graphEntry.description}
      headerTop={
        <div className="flex flex-wrap gap-2">
          {graphEntry.graph.starterPaths.map((starterPath) => (
            <button
              className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                starterPath.id === activeStarterPath.id
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/70 text-muted-foreground hover:text-foreground"
              }`}
              key={starterPath.id}
              onClick={() => setStarterPathId(starterPath.id)}
              type="button"
            >
              {starterPath.title}
            </button>
          ))}
        </div>
      }
      rightPanel={
        <div className="surface-panel space-y-5 p-5">
          <div className="space-y-2">
            <p className="quiet-label">Read-only preview</p>
            <h2 className="font-display text-2xl text-foreground">{previewNode.title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{previewNode.summary}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            {previewNode.module} · Difficulty {previewNode.difficulty}/5 ·{" "}
            {previewNode.estimatedMinutes} min
          </p>

          <div className="soft-divider space-y-2 pt-4">
            <p className="quiet-label">Intuition</p>
            <p className="text-sm leading-6 text-muted-foreground">{previewNode.intuition}</p>
          </div>

          <div className="soft-divider space-y-2 pt-4">
            <p className="quiet-label">Viewer note</p>
            <p className="text-sm leading-6 text-muted-foreground">
              This route stays read-only. It shares the same content model and graph
              layout as the study app, without exposing authoring controls.
            </p>
          </div>
        </div>
      }
      rightPanelLabel="Published viewer detail"
      sectionEyebrow="Published viewer"
      title={graphEntry.title}
    />
  );
}
