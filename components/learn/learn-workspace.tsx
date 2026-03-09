"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { LayoutGroup } from "framer-motion";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LearnDetailPanel } from "@/components/learn/learn-detail-panel";
import { LearnGraphCanvas } from "@/components/learn/learn-graph-canvas";
import { LearnLeftRail } from "@/components/learn/learn-left-rail";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mlFundamentalsGraph,
} from "@/data/ml-fundamentals";
import {
  getRecommendedConcepts,
  getUnmetPrerequisiteWarning,
  searchCurriculumNodes,
} from "@/lib/curriculum-navigation";
import { getLearnNeighborhood } from "@/lib/learn-graph";
import { cn } from "@/lib/utils";
import { useLearningProgressStore } from "@/stores/learning-progress";

export function LearnWorkspace({ initialNodeId }: { initialNodeId: string }) {
  const router = useRouter();
  const [activeNodeId, setActiveNodeId] = useState(initialNodeId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
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
  const setNodeStatus = useLearningProgressStore((state) => state.setNodeStatus);

  useEffect(() => {
    setActiveNodeId(initialNodeId);
    setCurrentNodeId(initialNodeId);
    setSelectedRelationId(null);
  }, [initialNodeId, setCurrentNodeId]);

  const neighborhood = useMemo(
    () => getLearnNeighborhood(mlFundamentalsGraph, activeNodeId, currentStarterPathId),
    [activeNodeId, currentStarterPathId],
  );

  useEffect(() => {
    if (currentStarterPathId !== neighborhood.starterPath.id) {
      setCurrentStarterPathId(neighborhood.starterPath.id);
    }
  }, [
    currentStarterPathId,
    neighborhood.starterPath.id,
    setCurrentStarterPathId,
  ]);

  const activeNode = neighborhood.currentNode;
  const deferredQuery = deferredSearchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!deferredQuery) {
      return [];
    }

    return searchCurriculumNodes(mlFundamentalsGraph, deferredQuery).slice(0, 6);
  }, [deferredQuery]);
  const recommendations = useMemo(
    () =>
      getRecommendedConcepts(mlFundamentalsGraph, {
        currentNodeId: activeNode.id,
        nodeStatuses,
        starterPathId: neighborhood.starterPath.id,
      }),
    [activeNode.id, neighborhood.starterPath.id, nodeStatuses],
  );
  const unmetWarning = useMemo(
    () =>
      getUnmetPrerequisiteWarning(
        mlFundamentalsGraph,
        activeNode.id,
        nodeStatuses,
      ),
    [activeNode.id, nodeStatuses],
  );

  function navigateToNode(nodeId: string) {
    setActiveNodeId(nodeId);
    setCurrentNodeId(nodeId);
    setSelectedRelationId(null);

    if (nodeId !== initialNodeId) {
      startTransition(() => {
        router.push(`/learn/${nodeId}` as Route);
      });
    }
  }

  function openStarterPath(starterPathId: (typeof mlFundamentalsGraph.starterPaths)[number]["id"]) {
    const starterPath = mlFundamentalsGraph.starterPaths.find(
      (path) => path.id === starterPathId,
    );

    if (!starterPath) {
      return;
    }

    setCurrentStarterPathId(starterPath.id);
    navigateToNode(
      starterPath.nodeIds.find((nodeId) => nodeStatuses[nodeId] !== "mastered") ??
        starterPath.nodeIds[0],
    );
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!searchResults[0]) {
      return;
    }

    navigateToNode(searchResults[0].id);
    setSearchQuery("");
  }

  const currentPathIndex = neighborhood.starterPath.nodeIds.indexOf(activeNode.id);

  return (
    <LayoutGroup id="learn-workspace">
    <AppShell
      center={
        <LearnGraphCanvas
          neighborhood={neighborhood}
          onNavigate={navigateToNode}
          onSelectRelation={setSelectedRelationId}
          selectedRelationId={selectedRelationId}
        />
      }
      currentSection="learn"
      description={`Study ${activeNode.module} through a deterministic local graph. Direct prerequisites, direct dependents, and a short band of related concepts stay visible while progress and learning state persist locally.`}
      headerTop={
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link className="transition-colors hover:text-foreground" href="/">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>Learn</span>
              <ChevronRight className="h-4 w-4" />
              <span>{activeNode.module}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{activeNode.shortTitle}</span>
            </nav>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{neighborhood.starterPath.title}</Badge>
              {currentPathIndex >= 0 ? (
                <Badge variant="outline">
                  Step {currentPathIndex + 1} of {neighborhood.starterPath.nodeIds.length}
                </Badge>
              ) : (
                <Badge variant="outline">Off the current starter path</Badge>
              )}
            </div>
          </div>

          <form
            aria-label="Quick concept search"
            className="w-full max-w-xl space-y-2"
            onSubmit={submitSearch}
            role="search"
          >
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-primary" htmlFor="learn-search">
              Quick search
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-[1.1rem] border border-border/80 bg-background/90 px-4 py-3 shadow-soft">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
                  id="learn-search"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Jump to a concept, alias, or topic"
                  value={searchQuery}
                />
                <Button size="sm" type="submit" variant="outline">
                  Open
                </Button>
              </div>

              {deferredQuery ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 rounded-[1.1rem] border border-border/80 bg-background/95 p-2 shadow-panel">
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((node) => (
                        <button
                          className={cn(
                            "w-full rounded-xl border border-transparent px-3 py-3 text-left transition-colors duration-fast hover:border-border hover:bg-secondary/40",
                            node.id === activeNode.id && "border-primary/30 bg-primary/10",
                          )}
                          key={node.id}
                          onClick={() => {
                            navigateToNode(node.id);
                            setSearchQuery("");
                          }}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{node.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {node.summary}
                              </p>
                            </div>
                            <Badge variant="outline">{node.module}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-3 text-sm text-muted-foreground">
                      No concept matched that query.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      }
      leftRail={
        <LearnLeftRail
          currentNodeId={activeNode.id}
          currentStarterPath={neighborhood.starterPath}
          graph={mlFundamentalsGraph}
          nodeStatuses={nodeStatuses}
          onNavigate={navigateToNode}
          onOpenStarterPath={openStarterPath}
        />
      }
      rightPanel={
        <LearnDetailPanel
          node={activeNode}
          nodeStatus={nodeStatuses[activeNode.id]}
          onNavigate={navigateToNode}
          onSetNodeStatus={(status) => setNodeStatus(activeNode.id, status)}
          recommendations={recommendations}
          unmetWarning={unmetWarning}
        />
      }
      rightPanelLabel="Concept detail view"
      sectionEyebrow="Core learning experience"
      title={activeNode.title}
    />
    </LayoutGroup>
  );
}
