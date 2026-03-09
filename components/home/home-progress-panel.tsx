"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEFAULT_ML_NODE_ID,
  mlFundamentalsGraph,
  mlFundamentalsModuleOrder,
} from "@/data/ml-fundamentals";
import { getModuleProgressSummary, getOverallProgressSummary } from "@/lib/progress";
import { useLearningProgressStore } from "@/stores/learning-progress";

function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value}%</p>
      </div>
      <div className="h-2 rounded-full bg-secondary/80">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-fast"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function HomeProgressPanel() {
  const currentNodeId = useLearningProgressStore((state) => state.currentNodeId);
  const currentStarterPathId = useLearningProgressStore(
    (state) => state.currentStarterPathId,
  );
  const nodeStatuses = useLearningProgressStore((state) => state.nodeStatuses);
  const currentNode =
    mlFundamentalsGraph.nodes.find((node) => node.id === currentNodeId) ??
    mlFundamentalsGraph.nodes.find((node) => node.id === DEFAULT_ML_NODE_ID) ??
    mlFundamentalsGraph.nodes[0];
  const activeStarterPath =
    mlFundamentalsGraph.starterPaths.find(
      (path) => path.id === currentStarterPathId,
    ) ?? mlFundamentalsGraph.starterPaths[0];
  const overallProgress = getOverallProgressSummary(mlFundamentalsGraph, nodeStatuses);

  return (
    <>
      <Card className="surface-panel">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Continue where you left off</CardTitle>
            <Badge variant="secondary">{activeStarterPath.title}</Badge>
          </div>
          <CardDescription>
            Resume the current atlas position or jump back into the recommended
            starter path.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-display text-xl text-foreground">{currentNode.title}</p>
            <p>{currentNode.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{currentNode.module}</Badge>
            <Badge variant="outline">
              {nodeStatuses[currentNode.id] ?? "not started"}
            </Badge>
          </div>
          <Button asChild size="sm">
            <Link href={`/learn/${currentNode.id}`}>Resume learning</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardHeader>
          <CardTitle className="text-base">Progress snapshot</CardTitle>
          <CardDescription>
            Local-first progress stays in this browser and updates the atlas views.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{overallProgress.touched}/{overallProgress.total} touched</Badge>
            <Badge variant="outline">{overallProgress.understood} understood</Badge>
            <Badge variant="outline">{overallProgress.mastered} mastered</Badge>
          </div>
          <ProgressBar label="Overall mastery" value={overallProgress.percentComplete} />
          {mlFundamentalsModuleOrder.slice(0, 4).map((module) => (
            <ProgressBar
              key={module}
              label={module}
              value={getModuleProgressSummary(
                mlFundamentalsGraph,
                module,
                nodeStatuses,
              ).percentReady}
            />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
