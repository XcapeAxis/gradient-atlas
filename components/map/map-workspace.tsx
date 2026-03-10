"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ModuleOverviewCanvas } from "@/components/graph/module-overview-canvas";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ML_NODE_ID,
  mlFundamentalsGraph,
  mlFundamentalsModuleOrder,
} from "@/data/ml-fundamentals";
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
    description: "Should come first.",
  },
  {
    value: "uses",
    label: "Uses",
    description: "Used in practice.",
  },
  {
    value: "optimizes",
    label: "Optimizes",
    description: "Improves an objective.",
  },
  {
    value: "evaluates",
    label: "Evaluates",
    description: "Judges model behavior.",
  },
  {
    value: "regularizes",
    label: "Regularizes",
    description: "Controls complexity.",
  },
  {
    value: "contrasts_with",
    label: "Contrasts",
    description: "Useful direct comparison.",
  },
  {
    value: "example_of",
    label: "Example",
    description: "Concrete case.",
  },
  {
    value: "extension_of",
    label: "Extension",
    description: "Builds on an earlier idea.",
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
    <div className="space-y-2">
      <p className="quiet-label">{title}</p>
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
        "rounded-full border px-3 py-2 text-sm transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-border/70 bg-background/70 text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ProgressLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
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
          activeStarterPathNodeIds={activeStarterPath.nodeIds}
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
      description="See the full curriculum as deterministic module lanes, then narrow it with just enough search and filtering to stay readable."
      headerTop={
        <div className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                From Foundations to Unsupervised Learning.
              </p>
              <p className="text-sm text-muted-foreground">
                Current path: <span className="text-foreground">{activeStarterPath.title}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {mlFundamentalsGraph.starterPaths.map((starterPath) => (
                <ToggleChip
                  active={starterPath.id === activeStarterPath.id}
                  key={starterPath.id}
                  onClick={() => setCurrentStarterPathId(starterPath.id)}
                >
                  {starterPath.title}
                </ToggleChip>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-background/82 px-4 py-3 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, alias, or key term"
              value={query}
            />
          </div>
        </div>
      }
      leftRail={
        <div className="surface-panel space-y-5 p-5">
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

          <div className="soft-divider space-y-3 pt-4">
            <p className="quiet-label">Progress</p>
            <ProgressLine
              label="Overall"
              value={`${overallProgress.touched}/${overallProgress.total}`}
            />
            {mlFundamentalsModuleOrder.map((module) => {
              const progress = getModuleProgressSummary(
                mlFundamentalsGraph,
                module,
                nodeStatuses,
              );

              return (
                <ProgressLine
                  key={module}
                  label={module}
                  value={`${progress.ready}/${progress.total}`}
                />
              );
            })}
          </div>
        </div>
      }
      rightPanel={
        <div className="surface-panel space-y-5 p-5">
          <div className="space-y-2">
            <p className="quiet-label">Snapshot</p>
            {previewNode ? (
              <>
                <h2 className="font-display text-2xl text-foreground">{previewNode.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {previewNode.summary}
                </p>
                <p className="text-sm text-muted-foreground">
                  {previewNode.module} · {previewNode.estimatedMinutes} min ·{" "}
                  {getUnmetPrerequisiteIds(
                    mlFundamentalsGraph,
                    previewNode.id,
                    nodeStatuses,
                  ).length} unmet prerequisites
                </p>
                {previewWarning ? (
                  <div className="rounded-[1rem] border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-950/80">
                    {previewWarning}
                  </div>
                ) : null}
                <Button onClick={() => navigateToLearn(previewNode.id)} size="sm" type="button">
                  Open in learn
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No concept matches the current filter set.
              </p>
            )}
          </div>

          {recommendations[0] ? (
            <div className="soft-divider space-y-2 pt-4">
              <p className="quiet-label">Recommended next</p>
              <p className="font-medium text-foreground">{recommendations[0].node.title}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {recommendations[0].whyRecommended}
              </p>
              {recommendations[0].warning ? (
                <p className="text-sm leading-6 text-amber-900/85">
                  {recommendations[0].warning}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="soft-divider space-y-2 pt-4">
            <p className="quiet-label">Relation legend</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {relationTypeOptions.map((relationType) => (
                <div className="flex items-start justify-between gap-3" key={relationType.value}>
                  <span className="text-foreground">{relationType.label}</span>
                  <span className="max-w-[11rem] text-right">{relationType.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      rightPanelLabel="Overview snapshot"
      sectionEyebrow="Overview"
      title="ML fundamentals map"
    />
  );
}
