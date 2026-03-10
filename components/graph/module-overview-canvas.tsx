"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useMotionSettings } from "@/components/providers/motion-provider";
import {
  getNodeHoverAnimation,
  getNodePressAnimation,
  getNodeSelectionTransition,
  getPathHighlightTransition,
} from "@/lib/motion";
import { getModuleOverviewLayout } from "@/lib/module-overview-layout";
import { getCompletionState, type LearningStatus } from "@/lib/progress";
import type { KnowledgeGraph, Module } from "@/lib/schema";
import { cn } from "@/lib/utils";

function getNodeTone(
  isSelected: boolean,
  isPreview: boolean,
  isPathNode: boolean,
  isMuted: boolean,
  completionState: ReturnType<typeof getCompletionState>,
) {
  if (isSelected) {
    return "border-primary/30 bg-primary text-primary-foreground";
  }

  if (isPreview) {
    return "border-primary/25 bg-primary/10 text-foreground";
  }

  if (isPathNode) {
    return "border-primary/16 bg-accent/72 text-foreground";
  }

  if (isMuted) {
    return "border-border/55 bg-background/70 text-foreground/80";
  }

  if (completionState === "mastered") {
    return "border-border/70 bg-background/94 text-foreground";
  }

  if (completionState === "understood") {
    return "border-border/70 bg-secondary/62 text-foreground";
  }

  return "border-border/70 bg-background/82 text-foreground";
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
  activeStarterPathNodeIds = [],
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
  activeStarterPathNodeIds?: string[];
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

    if (typeof nodeElement.scrollIntoView !== "function") {
      return;
    }

    nodeElement.scrollIntoView({
      behavior: motionMode === "reduced" ? "auto" : "smooth",
      block: "center",
      inline: "center",
    });
  }, [focusedNodeId, motionMode]);

  return (
    <section className="surface-panel overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="quiet-label">Module overview</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Deterministic module lanes keep the full pack readable without turning the
            overview into a hairball.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {visibleNodeIds.length} visible concepts
          {activeStarterPathTitle ? ` · ${activeStarterPathTitle}` : ""}
        </p>
      </div>

      <div
        className="canvas-surface overflow-auto rounded-[1.45rem] border border-border/70"
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
              className="pointer-events-none absolute bottom-8 top-6 rounded-[1.4rem] bg-background/22"
              key={lane.module}
              style={{
                left: lane.x,
                width: lane.width,
              }}
            >
              <div className="absolute left-5 right-5 top-5">
                <p className="font-display text-lg text-foreground">{lane.module}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {lane.nodeIds.filter((nodeId) => visibleNodeIdSet.has(nodeId)).length} visible
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
                ? 0.76
                : isPathEdge
                  ? 0.34
                  : focusedNodeId
                    ? 0.08
                    : 0.12;

              return (
                <motion.line
                  animate={{
                    strokeOpacity,
                    strokeWidth: isSelectedEdge ? 2.4 : isPathEdge ? 1.6 : 1.1,
                  }}
                  initial={false}
                  key={edge.id}
                  stroke={isSelectedEdge ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeDasharray={isPathEdge && !isSelectedEdge ? "6 10" : undefined}
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
              const isPathNode = activeStarterPathNodeIds.includes(node.id);
              const isMuted = Boolean(focusedNodeId) && !isSelected && !isPreview && !isPathNode;

              return (
                <motion.button
                  animate={{
                    boxShadow: isSelected
                      ? "0 22px 52px -38px rgba(31, 68, 79, 0.5)"
                      : isPreview
                        ? "0 16px 34px -28px rgba(31, 68, 79, 0.26)"
                        : "0 12px 22px -20px rgba(58, 76, 88, 0.16)",
                    opacity: isMuted ? 0.52 : 1,
                  }}
                  aria-current={isSelected ? "page" : undefined}
                  aria-label={`${node.title}. ${node.module}. Difficulty ${node.difficulty}.`}
                  className={cn(
                    "absolute z-10 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[1.1rem] border px-4 py-3 text-left",
                    getNodeTone(
                      isSelected,
                      isPreview,
                      isPathNode,
                      isMuted,
                      completionState,
                    ),
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
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
                      {node.difficulty}/5
                    </span>
                  </div>
                  <p className="mt-3 font-display text-sm leading-5">{node.shortTitle}</p>
                </motion.button>
              );
            })}
        </div>
      </div>
    </section>
  );
}
