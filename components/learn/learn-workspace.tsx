"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ChevronRight, PanelRightClose, PanelRightOpen, Search } from "lucide-react";
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
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import {
  mlFundamentalsGraph,
  mlFundamentalsModuleOrder,
} from "@/data/ml-fundamentals";
import {
  getRecommendedConcepts,
  getUnmetPrerequisiteWarning,
  searchCurriculumNodes,
} from "@/lib/curriculum-navigation";
import { getLearnNeighborhood } from "@/lib/learn-graph";
import { getOverallProgressSummary } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useLearningProgressStore } from "@/stores/learning-progress";

export function LearnWorkspace({ initialNodeId }: { initialNodeId: string }) {
  const router = useRouter();
  const [activeNodeId, setActiveNodeId] = useState(initialNodeId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
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
  const relationshipGroups = useMemo(
    () => ({
      dependents: neighborhood.visibleNodes
        .filter((item) => item.role === "dependent")
        .map((item) => item.node),
      prerequisites: neighborhood.visibleNodes
        .filter((item) => item.role === "prerequisite")
        .map((item) => item.node),
      related: neighborhood.visibleNodes
        .filter((item) => item.role === "related")
        .map((item) => item.node),
    }),
    [neighborhood.visibleNodes],
  );
  const overallProgress = useMemo(
    () => getOverallProgressSummary(mlFundamentalsGraph, nodeStatuses),
    [nodeStatuses],
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
      <div className="min-h-screen">
        <a
          className="sr-only left-4 top-4 z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-soft focus:not-sr-only focus:absolute"
          href="#main-content"
        >
          Skip to content
        </a>

        <TopBar currentSection="learn" />

        <main className="mx-auto max-w-[1480px] px-5 pb-12 pt-8" id="main-content">
          <div className="space-y-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                >
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
                <div>
                  <p className="quiet-label">Focused study</p>
                  <h1 className="mt-2 font-display text-4xl text-foreground sm:text-[3.2rem]">
                    {activeNode.title}
                  </h1>
                </div>
              </div>

              <form
                aria-label="Quick concept search"
                className="w-full max-w-xl"
                onSubmit={submitSearch}
                role="search"
              >
                <label className="quiet-label" htmlFor="learn-search">
                  Quick search
                </label>
                <div className="relative mt-2">
                  <div className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-background/82 px-4 py-3 shadow-soft">
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
                    <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 rounded-[1.1rem] border border-border/70 bg-background/95 p-2 shadow-panel">
                      {searchResults.length > 0 ? (
                        <div className="space-y-1">
                          {searchResults.map((node) => (
                            <button
                              className={cn(
                                "w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-secondary/40",
                                node.id === activeNode.id && "bg-primary/10",
                              )}
                              key={node.id}
                              onClick={() => {
                                navigateToNode(node.id);
                                setSearchQuery("");
                              }}
                              type="button"
                            >
                              <p className="font-medium text-foreground">{node.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {node.summary}
                              </p>
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

            <section className="surface-panel flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-3">
                <p className="quiet-label">Study strip</p>
                <div className="flex flex-wrap gap-2">
                  {mlFundamentalsModuleOrder.map((module) => (
                    <span
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm",
                        module === activeNode.module
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground",
                      )}
                      key={module}
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    {neighborhood.starterPath.title}
                    {currentPathIndex >= 0
                      ? ` · Step ${currentPathIndex + 1} of ${neighborhood.starterPath.nodeIds.length}`
                      : " · Off the current path"}
                  </p>
                  <p>
                    {overallProgress.touched}/{overallProgress.total} touched
                  </p>
                </div>
                <Button
                  onClick={() => setIsDetailOpen((currentValue) => !currentValue)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isDetailOpen ? (
                    <PanelRightClose className="mr-2 h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="mr-2 h-4 w-4" />
                  )}
                  {isDetailOpen ? "Hide details" : "Show details"}
                </Button>
              </div>
            </section>

            <div
              className={cn(
                "grid gap-6",
                isDetailOpen && "xl:grid-cols-[minmax(0,1fr),360px]",
              )}
            >
              <LearnGraphCanvas
                neighborhood={neighborhood}
                onNavigate={navigateToNode}
                onSelectRelation={setSelectedRelationId}
                selectedRelationId={selectedRelationId}
              />

              {isDetailOpen ? (
                <aside
                  aria-label="Concept detail view"
                  className="space-y-4 xl:sticky xl:top-24 xl:h-fit"
                >
                  <LearnDetailPanel
                    node={activeNode}
                    nodeStatus={nodeStatuses[activeNode.id]}
                    onNavigate={navigateToNode}
                    onSetNodeStatus={(status) => setNodeStatus(activeNode.id, status)}
                    recommendations={recommendations}
                    relationshipGroups={relationshipGroups}
                    unmetWarning={unmetWarning}
                  />
                </aside>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </LayoutGroup>
  );
}
