"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useMotionSettings } from "@/components/providers/motion-provider";
import { Badge } from "@/components/ui/badge";
import {
  getPathHighlightTransition,
  getNodeHoverAnimation,
  getNodePressAnimation,
  getNodeSelectionTransition,
} from "@/lib/motion";
import { getModuleOverviewLayout } from "@/lib/module-overview-layout";
import { getCompletionState, type LearningStatus } from "@/lib/progress";
import type { KnowledgeGraph, Module } from "@/lib/schema";
import { cn } from "@/lib/utils";

function getNodeTone(
  isSelected: boolean,
  isPreview: boolean,
  completionState: ReturnType<typeof getCompletionState>,
) {
  if (isSelected) {
    return "border-primary/40 bg-primary text-primary-foreground shadow-panel";
  }

  if (isPreview) {
    return "border-primary/25 bg-primary/10 text-foreground shadow-soft";
  }

  if (completionState === "mastered") {
    return "border-primary/20 bg-background/95 text-foreground";
  }

  if (completionState === "understood") {
    return "border-border/80 bg-secondary/70 text-foreground";
  }

  if (completionState === "exploring") {
    return "border-border/80 bg-background/90 text-foreground";
  }

  return "border-border/75 bg-background/82 text-foreground";
}

function getStatusDotTone(completionState: ReturnType<typeof getCompletionState>) {
  switch (completionState) {
    case "mastered":
      return "bg-primary";
    case "understood":
      return "bg-emerald-600";
    case "exploring":
      return "bg-amber-500";
    default:
      return "bg-border";
  }
}

export function ModuleOverviewCanvas({
  activeEdgeIds = [],
  activeStarterPathEdgeIds = [],
  activeStarterPathTitle,
  canvasLabel,
  graph,
  moduleOrder,
  nodeStatuses = {},
  onActivateNode,
  onPreviewNode,
  previewNodeId,
  selectedNodeId,
  visibleNodeIds,
}: {
  activeEdgeIds?: string[];
  activeStarterPathEdgeIds?: string[];
  activeStarterPathTitle?: string;
  canvasLabel: string;
  graph: KnowledgeGraph;
  moduleOrder: Module[];
  nodeStatuses?: Record<string, LearningStatus>;
  onActivateNode?: (nodeId: string) => void;
  onPreviewNode?: (nodeId: string | null) => void;
  previewNodeId?: string | null;
  selectedNodeId?: string | null;
  visibleNodeIds: string[];
}) {
  const { motionMode } = useMotionSettings();
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const nodeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const layout = useMemo(
    () => getModuleOverviewLayout(graph, moduleOrder),
    [graph, moduleOrder],
  );
  const visibleNodeIdSet = useMemo(() => new Set(visibleNodeIds), [visibleNodeIds]);
  const visibleNodeMap = useMemo(
    () =>
      new Map(
        layout.nodes
          .filter((node) => visibleNodeIdSet.has(node.id))
          .map((node) => [node.id, node]),
      ),
    [layout.nodes, visibleNodeIdSet],
  );
  const visibleEdges = graph.edges.filter(
    (edge) => visibleNodeIdSet.has(edge.source) && visibleNodeIdSet.has(edge.target),
  );
  const focusedNodeId = previewNodeId ?? selectedNodeId ?? null;

  useEffect(() => {
    if (!focusedNodeId) {
      return;
    }

    const nodeElement = nodeButtonRefs.current[focusedNodeId];

    if (!nodeElement) {
      return;
    }

    nodeElement.scrollIntoView({
      behavior: motionMode === "reduced" ? "auto" : "smooth",
      block: "center",
      inline: "center",
    });
  }, [focusedNodeId, motionMode]);

  return (
    <section className="surface-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="font-display text-2xl text-foreground">Module overview</p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Modules stay anchored in left-to-right lanes so the atlas remains
            readable at realistic density. The canvas recenters gently around the
            currently previewed concept without relaying out the rest of the graph.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{visibleNodeIds.length} visible concepts</Badge>
          {activeStarterPathTitle ? (
            <Badge variant="outline">{activeStarterPathTitle}</Badge>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div
          className="canvas-surface overflow-auto rounded-[1.35rem] border border-border/80"
          ref={scrollViewportRef}
        >
          <div
            aria-label={canvasLabel}
            className="relative"
            style={{
              height: layout.canvasHeight,
              minHeight: 520,
              width: layout.canvasWidth,
            }}
          >
            {layout.lanes.map((lane) => (
              <div
                className="pointer-events-none absolute bottom-8 top-6 rounded-[1.35rem] border border-border/60 bg-background/30"
                key={lane.module}
                style={{
                  left: lane.x,
                  width: lane.width,
                }}
              >
                <div className="absolute left-4 right-4 top-4">
                  <p className="font-display text-lg text-foreground">{lane.module}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {lane.nodeIds.filter((nodeId) => visibleNodeIdSet.has(nodeId)).length}
                    {" "}
                    visible
                  </p>
                </div>
              </div>
            ))}

            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
            >
              {visibleEdges.map((edge) => {
                const sourceNode = visibleNodeMap.get(edge.source);
                const targetNode = visibleNodeMap.get(edge.target);

                if (!sourceNode || !targetNode) {
                  return null;
                }

                const isSelectedEdge = activeEdgeIds.includes(edge.id);
                const isPathEdge = activeStarterPathEdgeIds.includes(edge.id);
                const strokeOpacity = isSelectedEdge
                  ? 0.82
                  : isPathEdge
                    ? 0.42
                    : 0.12;

                return (
                  <motion.line
                    animate={{
                      strokeOpacity,
                      strokeWidth: isSelectedEdge ? 2.6 : isPathEdge ? 1.8 : 1.2,
                    }}
                    initial={false}
                    key={edge.id}
                    stroke={isSelectedEdge ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                    strokeDasharray={isPathEdge && !isSelectedEdge ? "6 8" : undefined}
                    transition={
                      isSelectedEdge || isPathEdge
                        ? getPathHighlightTransition(motionMode)
                        : getNodeSelectionTransition(motionMode)
                    }
                    x1={sourceNode.position.x}
                    x2={targetNode.position.x}
                    y1={sourceNode.position.y}
                    y2={targetNode.position.y}
                  />
                );
              })}
            </svg>

            {layout.nodes
              .filter((node) => visibleNodeIdSet.has(node.id))
              .map((positionedNode) => {
                const node = graph.nodes.find((item) => item.id === positionedNode.id);

                if (!node) {
                  return null;
                }

                const completionState = getCompletionState(nodeStatuses[node.id]);
                const isSelected = node.id === selectedNodeId;
                const isPreview = node.id === previewNodeId && !isSelected;

                return (
                  <motion.button
                    animate={{
                      boxShadow: isSelected
                        ? "0 26px 58px -36px rgba(31, 68, 79, 0.62)"
                        : isPreview
                          ? "0 20px 42px -34px rgba(31, 68, 79, 0.4)"
                          : "0 16px 32px -28px rgba(58, 76, 88, 0.36)",
                    }}
                    aria-current={isSelected ? "page" : undefined}
                    aria-label={`${node.title}. ${node.module}. Difficulty ${node.difficulty}.`}
                    className={cn(
                      "absolute z-10 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[1.1rem] border px-4 py-3 text-left",
                      getNodeTone(isSelected, isPreview, completionState),
                    )}
                    initial={false}
                    key={node.id}
                    onBlur={() => onPreviewNode?.(null)}
                    onClick={() => onActivateNode?.(node.id)}
                    onFocus={() => onPreviewNode?.(node.id)}
                    onMouseEnter={() => onPreviewNode?.(node.id)}
                    onMouseLeave={() => onPreviewNode?.(null)}
                    ref={(element) => {
                      nodeButtonRefs.current[node.id] = element;
                    }}
                    style={{
                      left: positionedNode.position.x,
                      top: positionedNode.position.y,
                    }}
                    transition={getNodeSelectionTransition(motionMode)}
                    type="button"
                    whileHover={getNodeHoverAnimation(motionMode)}
                    whileTap={getNodePressAnimation(motionMode)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className={cn("h-2.5 w-2.5 rounded-full", getStatusDotTone(completionState))}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                        {node.difficulty}/5
                      </span>
                    </div>
                    <p className="mt-3 font-display text-sm leading-5">{node.shortTitle}</p>
                  </motion.button>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
