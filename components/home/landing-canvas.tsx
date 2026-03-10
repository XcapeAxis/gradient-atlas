"use client";

import Link from "next/link";
import type { Route } from "next";
import { FocusedGraphCanvas } from "@/components/graph/focused-graph";
import { Button } from "@/components/ui/button";
import { mlFundamentalsGraph } from "@/data/ml-fundamentals";
import { getRecommendedConcepts } from "@/lib/curriculum-navigation";
import { cn } from "@/lib/utils";
import { useLearningProgressStore } from "@/stores/learning-progress";

export function LandingCanvas() {
  const currentNodeId = useLearningProgressStore((state) => state.currentNodeId);
  const currentStarterPathId = useLearningProgressStore(
    (state) => state.currentStarterPathId,
  );
  const nodeStatuses = useLearningProgressStore((state) => state.nodeStatuses);
  const setCurrentNodeId = useLearningProgressStore(
    (state) => state.setCurrentNodeId,
  );
  const setCurrentStarterPathId = useLearningProgressStore(
    (state) => state.setCurrentStarterPathId,
  );
  const activeStarterPath =
    mlFundamentalsGraph.starterPaths.find(
      (path) => path.id === currentStarterPathId,
    ) ?? mlFundamentalsGraph.starterPaths[0];
  const currentNode =
    mlFundamentalsGraph.nodes.find((node) => node.id === currentNodeId) ??
    mlFundamentalsGraph.nodes[0];
  const entryNodeId =
    activeStarterPath.nodeIds.find((nodeId) => nodeStatuses[nodeId] !== "mastered") ??
    activeStarterPath.nodeIds[0];
  const entryNode =
    mlFundamentalsGraph.nodes.find((node) => node.id === entryNodeId) ??
    currentNode;
  const recommendation = getRecommendedConcepts(mlFundamentalsGraph, {
    currentNodeId: entryNode.id,
    limit: 1,
    nodeStatuses,
    starterPathId: activeStarterPath.id,
  })[0];

  return (
    <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr),460px]">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="quiet-label">Orientation</p>
          <h1 className="max-w-4xl font-display text-5xl leading-[1.02] text-foreground sm:text-6xl">
            Learn machine learning as a calm, navigable concept graph.
          </h1>
          <p className="max-w-2xl text-sm text-primary/80">
            以可导航的概念图谱学习机器学习基础。
          </p>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Gradient Atlas turns a fundamentals curriculum into a readable local graph,
            so each concept stays connected to prerequisites, next steps, and progress
            without becoming a dense map.
          </p>
          <p className="text-sm text-muted-foreground">
            {mlFundamentalsGraph.nodes.length} concepts, {mlFundamentalsGraph.edges.length} relations,{" "}
            {mlFundamentalsGraph.starterPaths.length} starter paths.
          </p>
        </div>

        <div className="space-y-3">
          <p className="quiet-label">Starter path</p>
          <div className="flex flex-wrap gap-2">
            {mlFundamentalsGraph.starterPaths.map((path) => {
              const pathEntryNodeId =
                path.nodeIds.find((nodeId) => nodeStatuses[nodeId] !== "mastered") ??
                path.nodeIds[0];

              return (
                <button
                  aria-pressed={path.id === activeStarterPath.id}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    path.id === activeStarterPath.id
                      ? "border-primary/30 bg-primary/10 text-foreground"
                      : "border-border/70 bg-background/70 text-muted-foreground hover:text-foreground",
                  )}
                  key={path.id}
                  onClick={() => {
                    setCurrentStarterPathId(path.id);
                    setCurrentNodeId(pathEntryNodeId);
                  }}
                  type="button"
                >
                  {path.title}
                </button>
              );
            })}
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {activeStarterPath.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link href={`/learn/${entryNode.id}` as Route}>
              Start with {entryNode.shortTitle}
            </Link>
          </Button>
          <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/map">
            Browse the full map
          </Link>
        </div>
      </div>

      <div className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <p className="quiet-label">Concept spotlight</p>
          <h2 className="font-display text-3xl text-foreground">{currentNode.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{currentNode.summary}</p>
        </div>

        <FocusedGraphCanvas graph={mlFundamentalsGraph} selectedNodeId={currentNode.id} />

        {recommendation ? (
          <div className="soft-divider pt-4">
            <p className="quiet-label">Next recommendation</p>
            <p className="mt-2 font-medium text-foreground">{recommendation.node.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {recommendation.whyRecommended}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
