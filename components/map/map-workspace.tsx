"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
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
import {
  defaultMapFilters,
  getFilteredMapNodeIds,
  getRecommendedConcepts,
  getUnmetPrerequisiteIds,
  getUnmetPrerequisiteWarning,
  type MapFilters,
} from "@/lib/curriculum-navigation";
import {
  getModuleProgressSummary,
  getOverallProgressSummary,
  type CompletionState,
} from "@/lib/progress";
import type { RelationType } from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ML_NODE_ID,
  mlFundamentalsGraph,
  mlFundamentalsModuleOrder,
} from "@/data/ml-fundamentals";
import { useLearningProgressStore } from "@/stores/learning-progress";

const completionFilterOptions: Array<{
  label: string;
  value: CompletionState;
}> = [
  { label: "Not started", value: "not-started" },
  { label: "Exploring", value: "exploring" },
  { label: "Understood", value: "understood" },
  { label: "Mastered", value: "mastered" },
];

const relationTypeOptions: Array<{
  description: string;
  label: string;
  value: RelationType;
}> = [
  {
    value: "prerequisite_of",
    label: "Prerequisite",
    description: "One concept should come first.",
  },
  {
    value: "uses",
    label: "Uses",
    description: "A concept depends on another in practice.",
  },
  {
    value: "optimizes",
    label: "Optimizes",
    description: "An optimization method improves an objective.",
  },
  {
    value: "evaluates",
    label: "Evaluates",
    description: "A metric or process judges model behavior.",
  },
  {
    value: "regularizes",
    label: "Regularizes",
    description: "A technique controls complexity or variance.",
  },
  {
    value: "contrasts_with",
    label: "Contrasts",
    description: "Two concepts are useful to compare directly.",
  },
  {
    value: "example_of",
    label: "Example",
    description: "A concept is a concrete case of a broader idea.",
  },
  {
    value: "extension_of",
    label: "Extension",
    description: "A concept extends an earlier one.",
  },
] as const;

function toggleSelection<T extends string | number>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getStarterPathEdgeIds(
  starterPathId: (typeof mlFundamentalsGraph.starterPaths)[number]["id"],
  selectedRelationTypes: RelationType[],
) {
  const starterPath = mlFundamentalsGraph.starterPaths.find(
    (path) => path.id === starterPathId,
  );

  if (!starterPath) {
    return [];
  }

  const relationFilterDisabled = selectedRelationTypes.length === 0;

  return starterPath.nodeIds.flatMap((nodeId, index) => {
    const nextNodeId = starterPath.nodeIds[index + 1];

    if (!nextNodeId) {
      return [];
    }

    const edge = mlFundamentalsGraph.edges.find(
      (edgeItem) =>
        ((edgeItem.source === nodeId && edgeItem.target === nextNodeId) ||
          (edgeItem.source === nextNodeId && edgeItem.target === nodeId)) &&
        (relationFilterDisabled ||
          selectedRelationTypes.includes(edgeItem.relationType)),
    );

    return edge ? [edge.id] : [];
  });
}

function getConnectedVisibleEdgeIds(
  nodeId: string,
  visibleNodeIds: string[],
  selectedRelationTypes: RelationType[],
) {
  const visibleNodeIdSet = new Set(visibleNodeIds);
  const relationFilterDisabled = selectedRelationTypes.length === 0;

  return mlFundamentalsGraph.edges
    .filter(
      (edge) =>
        (edge.source === nodeId || edge.target === nodeId) &&
        visibleNodeIdSet.has(edge.source) &&
        visibleNodeIdSet.has(edge.target) &&
        (relationFilterDisabled ||
          selectedRelationTypes.includes(edge.relationType)),
    )
    .map((edge) => edge.id);
}

function getNodeById(nodeId: string | null) {
  if (!nodeId) {
    return null;
  }

  return mlFundamentalsGraph.nodes.find((node) => node.id === nodeId) ?? null;
}

function FilterSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ToggleChip({
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
        "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-fast",
        active
          ? "border-primary/30 bg-primary text-primary-foreground"
          : "border-border bg-background/90 text-foreground hover:bg-secondary/60",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ProgressRow({
  label,
  progress,
}: {
  label: string;
  progress: { mastered?: number; percentComplete?: number; percentReady?: number; ready?: number; total: number };
}) {
  const percent =
    progress.percentComplete ?? progress.percentReady ?? 0;
  const numerator = progress.mastered ?? progress.ready ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          {numerator}/{progress.total}
        </p>
      </div>
      <div className="h-2 rounded-full bg-secondary/80">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-fast"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function MapWorkspace() {
  const router = useRouter();
  const currentNodeId = useLearningProgressStore((state) => state.currentNodeId);
  const currentStarterPathId = useLearningProgressStore(
    (state) => state.currentStarterPathId,
  );
  const nodeStatuses = useLearningProgressStore((state) => state.nodeStatuses);
  const setCurrentStarterPathId = useLearningProgressStore(
    (state) => state.setCurrentStarterPathId,
  );
  const [filters, setFilters] = useState<MapFilters>(defaultMapFilters);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(currentNodeId);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const activeStarterPath =
    mlFundamentalsGraph.starterPaths.find(
      (path) => path.id === currentStarterPathId,
    ) ?? mlFundamentalsGraph.starterPaths[0];
  const visibleNodeIds = useMemo(
    () =>
      getFilteredMapNodeIds(
        mlFundamentalsGraph,
        filters,
        nodeStatuses,
        deferredQuery,
      ),
    [deferredQuery, filters, nodeStatuses],
  );
  const overallProgress = useMemo(
    () => getOverallProgressSummary(mlFundamentalsGraph, nodeStatuses),
    [nodeStatuses],
  );
  const recommendations = useMemo(
    () =>
      getRecommendedConcepts(mlFundamentalsGraph, {
        currentNodeId: currentNodeId || DEFAULT_ML_NODE_ID,
        nodeStatuses,
        starterPathId: activeStarterPath.id,
      }),
    [activeStarterPath.id, currentNodeId, nodeStatuses],
  );
  const previewNode = getNodeById(
    previewNodeId && visibleNodeIds.includes(previewNodeId)
      ? previewNodeId
      : currentNodeId,
  );
  const previewWarning = previewNode
    ? getUnmetPrerequisiteWarning(mlFundamentalsGraph, previewNode.id, nodeStatuses)
    : null;
  const activeEdgeIds = previewNode
    ? getConnectedVisibleEdgeIds(
        previewNode.id,
        visibleNodeIds,
        filters.relationTypes,
      )
    : [];
  const starterPathEdgeIds = getStarterPathEdgeIds(
    activeStarterPath.id,
    filters.relationTypes,
  );

  function navigateToLearn(nodeId: string) {
    router.push(`/learn/${nodeId}` as Route);
  }

  return (
    <AppShell
      center={
        <ModuleOverviewCanvas
          activeEdgeIds={activeEdgeIds}
          activeStarterPathEdgeIds={starterPathEdgeIds}
          activeStarterPathTitle={activeStarterPath.title}
          canvasLabel="Gradient Atlas module overview"
          graph={mlFundamentalsGraph}
          moduleOrder={mlFundamentalsModuleOrder}
          nodeStatuses={nodeStatuses}
          onActivateNode={navigateToLearn}
          onPreviewNode={setPreviewNodeId}
          previewNodeId={previewNode?.id ?? null}
          selectedNodeId={currentNodeId}
          visibleNodeIds={visibleNodeIds}
        />
      }
      currentSection="map"
      description="Browse the full ML fundamentals atlas by module, narrow the view with search and filter chips, and jump directly into a concept once the prerequisites and recommendation context look right."
      leftRail={
        <div className="space-y-4 lg:sticky lg:top-24">
          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Search and filters</CardTitle>
              <CardDescription>
                Reduce cognitive load before scanning the full atlas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-primary" htmlFor="map-search">
                  Search
                </label>
                <div className="flex items-center gap-3 rounded-[1.05rem] border border-border/80 bg-background/90 px-4 py-3 shadow-soft">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
                    id="map-search"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by title, alias, or key term"
                    value={query}
                  />
                </div>
              </div>

              <FilterSection title="Starter path">
                {mlFundamentalsGraph.starterPaths.map((starterPath) => (
                  <ToggleChip
                    active={starterPath.id === activeStarterPath.id}
                    key={starterPath.id}
                    onClick={() => setCurrentStarterPathId(starterPath.id)}
                  >
                    {starterPath.title}
                  </ToggleChip>
                ))}
              </FilterSection>

              <FilterSection title="Module">
                {mlFundamentalsModuleOrder.map((module) => (
                  <ToggleChip
                    active={filters.modules.includes(module)}
                    key={module}
                    onClick={() =>
                      setFilters((currentFilters) => ({
                        ...currentFilters,
                        modules: toggleSelection(currentFilters.modules, module),
                      }))
                    }
                  >
                    {module}
                  </ToggleChip>
                ))}
              </FilterSection>

              <FilterSection title="Difficulty">
                {[1, 2, 3, 4, 5].map((difficulty) => (
                  <ToggleChip
                    active={filters.difficulties.includes(difficulty)}
                    key={difficulty}
                    onClick={() =>
                      setFilters((currentFilters) => ({
                        ...currentFilters,
                        difficulties: toggleSelection(
                          currentFilters.difficulties,
                          difficulty,
                        ),
                      }))
                    }
                  >
                    Level {difficulty}
                  </ToggleChip>
                ))}
              </FilterSection>

              <FilterSection title="Completion">
                {completionFilterOptions.map((option) => (
                  <ToggleChip
                    active={filters.completionStates.includes(option.value)}
                    key={option.value}
                    onClick={() =>
                      setFilters((currentFilters) => ({
                        ...currentFilters,
                        completionStates: toggleSelection(
                          currentFilters.completionStates,
                          option.value,
                        ),
                      }))
                    }
                  >
                    {option.label}
                  </ToggleChip>
                ))}
              </FilterSection>

              <FilterSection title="Relation type">
                {relationTypeOptions.map((option) => (
                  <ToggleChip
                    active={filters.relationTypes.includes(option.value)}
                    key={option.value}
                    onClick={() =>
                      setFilters((currentFilters) => ({
                        ...currentFilters,
                        relationTypes: toggleSelection(
                          currentFilters.relationTypes,
                          option.value,
                        ),
                      }))
                    }
                  >
                    {option.label}
                  </ToggleChip>
                ))}
              </FilterSection>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ProgressRow
                label="Overall mastered"
                progress={overallProgress}
              />
              {mlFundamentalsModuleOrder.map((module) => (
                <ProgressRow
                  key={module}
                  label={module}
                  progress={getModuleProgressSummary(
                    mlFundamentalsGraph,
                    module,
                    nodeStatuses,
                  )}
                />
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
                <CardTitle className="text-base">Preview</CardTitle>
                {previewNode ? <Badge variant="secondary">{previewNode.module}</Badge> : null}
              </div>
              <CardDescription>
                Hover or focus a concept for a quick read, then click it to open the
                full learn route.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {previewNode ? (
                <>
                  <div className="space-y-2">
                    <p className="font-display text-xl text-foreground">
                      {previewNode.title}
                    </p>
                    <p>{previewNode.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Difficulty {previewNode.difficulty}/5</Badge>
                    <Badge variant="outline">{previewNode.estimatedMinutes} min</Badge>
                    <Badge variant="outline">
                      {getUnmetPrerequisiteIds(
                        mlFundamentalsGraph,
                        previewNode.id,
                        nodeStatuses,
                      ).length} unmet prerequisites
                    </Badge>
                  </div>
                  {previewWarning ? (
                    <div className="rounded-xl bg-amber-50/80 px-3 py-3 text-amber-950/80">
                      {previewWarning}
                    </div>
                  ) : null}
                  <Button
                    onClick={() => navigateToLearn(previewNode.id)}
                    size="sm"
                    type="button"
                  >
                    Open in learn
                  </Button>
                </>
              ) : (
                <p>No concept matches the current filter set.</p>
              )}
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Recommended next</CardTitle>
              <CardDescription>
                Recommendations combine starter-path order, prerequisite readiness,
                and your current progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((recommendation) => (
                <div
                  className="rounded-xl border border-border/70 bg-background/80 p-3"
                  key={recommendation.node.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {recommendation.node.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {recommendation.whyRecommended}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigateToLearn(recommendation.node.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Open
                    </Button>
                  </div>
                  {recommendation.warning ? (
                    <p className="mt-3 text-sm leading-6 text-amber-900/85">
                      {recommendation.warning}
                    </p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Relation legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {relationTypeOptions.map((relationType) => (
                <div key={relationType.value}>
                  <p className="font-medium text-foreground">{relationType.label}</p>
                  <p>{relationType.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      }
      rightPanelLabel="Overview preview"
      sectionEyebrow="Curriculum overview"
      title="ML fundamentals map"
    />
  );
}
