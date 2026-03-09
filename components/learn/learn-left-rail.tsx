"use client";

import { mlFundamentalsModuleOrder } from "@/data/ml-fundamentals";
import type { LearningStatus } from "@/lib/progress";
import type { KnowledgeGraph, Module, StarterPath } from "@/lib/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getNodeCountByStatus(
  nodeIds: string[],
  nodeStatuses: Record<string, LearningStatus>,
  targetStatus: LearningStatus,
) {
  return nodeIds.filter((nodeId) => nodeStatuses[nodeId] === targetStatus).length;
}

function getModuleTargetNodeId(
  graph: KnowledgeGraph,
  module: Module,
  nodeStatuses: Record<string, LearningStatus>,
) {
  const moduleNodeIds = graph.nodes
    .filter((node) => node.module === module)
    .map((node) => node.id);

  return (
    moduleNodeIds.find((nodeId) => nodeStatuses[nodeId] !== "mastered") ??
    moduleNodeIds[0]
  );
}

function getStarterPathTargetNodeId(
  starterPath: StarterPath,
  nodeStatuses: Record<string, LearningStatus>,
) {
  return (
    starterPath.nodeIds.find((nodeId) => nodeStatuses[nodeId] !== "mastered") ??
    starterPath.nodeIds[0]
  );
}

function getStatusTone(status: LearningStatus | undefined) {
  switch (status) {
    case "mastered":
      return "border-primary/30 bg-primary/10 text-foreground";
    case "understood":
      return "border-border bg-secondary/70 text-foreground";
    case "exploring":
      return "border-border bg-background/90 text-muted-foreground";
    default:
      return "border-transparent bg-transparent text-muted-foreground";
  }
}

export function LearnLeftRail({
  currentNodeId,
  currentStarterPath,
  graph,
  nodeStatuses,
  onOpenStarterPath,
  onNavigate,
}: {
  currentNodeId: string;
  currentStarterPath: StarterPath;
  graph: KnowledgeGraph;
  nodeStatuses: Record<string, LearningStatus>;
  onOpenStarterPath: (starterPathId: StarterPath["id"]) => void;
  onNavigate: (nodeId: string) => void;
}) {
  const exploringCount = getNodeCountByStatus(
    graph.nodes.map((node) => node.id),
    nodeStatuses,
    "exploring",
  );
  const understoodCount = getNodeCountByStatus(
    graph.nodes.map((node) => node.id),
    nodeStatuses,
    "understood",
  );
  const masteredCount = getNodeCountByStatus(
    graph.nodes.map((node) => node.id),
    nodeStatuses,
    "mastered",
  );
  const touchedCount = Object.keys(nodeStatuses).length;
  const currentPathCompletedCount = currentStarterPath.nodeIds.filter((nodeId) => {
    const status = nodeStatuses[nodeId];

    return status === "understood" || status === "mastered";
  }).length;
  const currentModule = graph.nodes.find((node) => node.id === currentNodeId)?.module;

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="surface-panel">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Modules</CardTitle>
            <Badge variant="outline">{mlFundamentalsModuleOrder.length} modules</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {mlFundamentalsModuleOrder.map((module) => {
            const moduleNodeIds = graph.nodes
              .filter((node) => node.module === module)
              .map((node) => node.id);
            const masteredInModule = getNodeCountByStatus(
              moduleNodeIds,
              nodeStatuses,
              "mastered",
            );
            const targetNodeId = getModuleTargetNodeId(graph, module, nodeStatuses);

            if (!targetNodeId) {
              return null;
            }

            return (
              <button
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left transition-colors duration-fast",
                  currentModule === module
                    ? "border-primary/30 bg-primary/10 shadow-soft"
                    : "border-transparent bg-transparent hover:border-border hover:bg-secondary/40",
                )}
                key={module}
                onClick={() => onNavigate(targetNodeId)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{module}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {masteredInModule}/{moduleNodeIds.length} mastered
                    </p>
                  </div>
                  {currentModule === module ? <Badge variant="secondary">Current</Badge> : null}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Starter path</CardTitle>
            <Badge variant="secondary">{currentPathCompletedCount}/{currentStarterPath.nodeIds.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{currentStarterPath.summary}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {graph.starterPaths.map((starterPath) => (
              <button
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-fast",
                  starterPath.id === currentStarterPath.id
                    ? "border-primary/30 bg-primary text-primary-foreground"
                    : "border-border bg-background/85 text-foreground hover:bg-secondary/60",
                )}
                key={starterPath.id}
                onClick={() => onOpenStarterPath(starterPath.id)}
                type="button"
              >
                {starterPath.title}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {currentStarterPath.nodeIds.map((nodeId, index) => {
              const node = graph.nodes.find((item) => item.id === nodeId);

              if (!node) {
                return null;
              }

              const status = nodeStatuses[nodeId];

              return (
                <button
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors duration-fast",
                    nodeId === currentNodeId
                      ? "border-primary/30 bg-primary/10 shadow-soft"
                      : "border-border/70 bg-background/70 hover:border-border hover:bg-secondary/40",
                  )}
                  key={nodeId}
                  onClick={() => onNavigate(nodeId)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {index + 1}. {node.shortTitle}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {node.module}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                        getStatusTone(status),
                      )}
                    >
                      {status ?? "queued"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            className="w-full rounded-xl border border-border bg-background/85 px-3 py-3 text-left text-sm text-muted-foreground transition-colors duration-fast hover:bg-secondary/60"
            onClick={() =>
              onNavigate(getStarterPathTargetNodeId(currentStarterPath, nodeStatuses))
            }
            type="button"
          >
            Jump to the next unfinished path node
          </button>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Progress summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{touchedCount}/{graph.nodes.length} touched</Badge>
            <Badge variant="outline">{exploringCount} exploring</Badge>
            <Badge variant="outline">{understoodCount} understood</Badge>
            <Badge variant="outline">{masteredCount} mastered</Badge>
          </div>
          <p>
            Learning state is persisted in local storage for this browser, so your
            current concept and study marks survive a refresh.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
