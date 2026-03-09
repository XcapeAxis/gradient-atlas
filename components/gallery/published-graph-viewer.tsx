"use client";

import { useMemo, useState } from "react";
import { ModuleOverviewCanvas } from "@/components/graph/module-overview-canvas";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      leftRail={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Pack metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{graphEntry.graph.nodes.length} nodes</Badge>
                <Badge variant="outline">{graphEntry.graph.edges.length} edges</Badge>
                <Badge variant="outline">
                  {graphEntry.graph.starterPaths.length} starter paths
                </Badge>
              </div>
              <p>{graphEntry.summary}</p>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Starter paths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {graphEntry.graph.starterPaths.map((starterPath) => (
                <button
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors duration-fast ${
                    starterPath.id === activeStarterPath.id
                      ? "border-primary/30 bg-primary/10 shadow-soft"
                      : "border-border/70 bg-background/80 hover:bg-secondary/50"
                  }`}
                  key={starterPath.id}
                  onClick={() => setStarterPathId(starterPath.id)}
                  type="button"
                >
                  <p className="font-medium text-foreground">{starterPath.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {starterPath.summary}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      }
      rightPanel={
        <>
          <Card className="surface-panel">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{previewNode.title}</CardTitle>
                <Badge variant="secondary">{previewNode.module}</Badge>
              </div>
              <CardDescription>{previewNode.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{previewNode.intuition}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Difficulty {previewNode.difficulty}/5</Badge>
                <Badge variant="outline">{previewNode.estimatedMinutes} min</Badge>
              </div>
              <p>{previewNode.formalDefinition}</p>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Read-only viewer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                This route is a published-viewer prototype. It shares the runtime schema
                and visual language with the app, but it does not expose any editing
                controls.
              </p>
              <Button size="sm" type="button" variant="outline">
                Viewer only
              </Button>
            </CardContent>
          </Card>
        </>
      }
      rightPanelLabel="Published viewer detail"
      sectionEyebrow="Published viewer"
      title={graphEntry.title}
    />
  );
}
