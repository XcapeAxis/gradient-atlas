"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ML_NODE_ID,
  mlFundamentalsGraph,
} from "@/data/ml-fundamentals";
import { getRecommendedConcepts } from "@/lib/curriculum-navigation";
import { getOverallProgressSummary } from "@/lib/progress";
import { useLearningProgressStore } from "@/stores/learning-progress";

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
  const recommendation = getRecommendedConcepts(mlFundamentalsGraph, {
    currentNodeId: currentNode.id,
    limit: 1,
    nodeStatuses,
    starterPathId: activeStarterPath.id,
  })[0];

  return (
    <aside className="surface-panel space-y-5 p-6 xl:sticky xl:top-24">
      <div className="space-y-2">
        <p className="quiet-label">Continue learning</p>
        <h2 className="font-display text-2xl text-foreground">{currentNode.title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{currentNode.summary}</p>
      </div>

      <dl className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <dt>Starter path</dt>
          <dd className="text-foreground">{activeStarterPath.title}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Learning state</dt>
          <dd className="capitalize text-foreground">
            {nodeStatuses[currentNode.id] ?? "not started"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>Progress</dt>
          <dd className="text-foreground">
            {overallProgress.touched}/{overallProgress.total} touched
          </dd>
        </div>
      </dl>

      {recommendation ? (
        <div className="soft-divider space-y-2 pt-4">
          <p className="quiet-label">Why next</p>
          <p className="font-medium text-foreground">{recommendation.node.title}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {recommendation.whyRecommended}
          </p>
        </div>
      ) : null}

      <Button asChild className="w-full" size="lg">
        <Link href={`/learn/${currentNode.id}`}>Resume {currentNode.shortTitle}</Link>
      </Button>
    </aside>
  );
}
