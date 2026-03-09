"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useMotionSettings } from "@/components/providers/motion-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDirectionalNeighborId,
  type GraphDirection,
  type LearnNeighborhood,
} from "@/lib/learn-graph";
import {
  getNodeHoverAnimation,
  getNodePressAnimation,
  getNodeSelectionTransition,
  getPanelTransition,
  getPathHighlightTransition,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const GRAPH_WIDTH = 640;
const GRAPH_HEIGHT = 420;

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function getNodeRoleLabel(role: LearnNeighborhood["visibleNodes"][number]["role"]) {
  switch (role) {
    case "current":
      return "Current";
    case "prerequisite":
      return "Prerequisite";
    case "dependent":
      return "Builds next";
    case "related":
      return "Related";
    case "supplemental":
      return "Context";
    default:
      return "Concept";
  }
}

function getDirectionFromKey(key: string): GraphDirection | null {
  switch (key) {
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    default:
      return null;
  }
}

export function LearnGraphCanvas({
  neighborhood,
  onNavigate,
  onSelectRelation,
  selectedRelationId,
}: {
  neighborhood: LearnNeighborhood;
  onNavigate: (nodeId: string) => void;
  onSelectRelation: (edgeId: string | null) => void;
  selectedRelationId: string | null;
}) {
  const { motionMode } = useMotionSettings();
  const nodeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const nodeMap = useMemo(
    () => new Map(neighborhood.visibleNodes.map((node) => [node.id, node])),
    [neighborhood.visibleNodes],
  );
  const selectedRelation =
    neighborhood.visibleEdges.find((edge) => edge.id === selectedRelationId) ?? null;

  function handleNodeKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, nodeId: string) {
    const direction = getDirectionFromKey(event.key);

    if (!direction) {
      return;
    }

    const nextNodeId = getDirectionalNeighborId(
      neighborhood.visibleNodes,
      nodeId,
      direction,
    );

    if (!nextNodeId) {
      return;
    }

    event.preventDefault();
    nodeButtonRefs.current[nextNodeId]?.focus();
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="surface-panel overflow-hidden"
      initial={{ opacity: 0, y: motionMode === "reduced" ? 0 : 10 }}
      transition={getPanelTransition(motionMode)}
    >
      <div className="flex flex-col gap-3 border-b border-border/80 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="font-display text-2xl text-foreground">Focused local graph</p>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            The canvas stays intentionally small: the current concept, direct
            prerequisites, direct dependents, and a short band of high-value related
            concepts remain visible at the same time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{neighborhood.visibleNodes.length} visible nodes</Badge>
          <Badge variant="outline">Arrow keys move focus</Badge>
          <Badge variant="outline">Enter opens focused node</Badge>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="canvas-surface relative aspect-[4/3] min-h-[360px] overflow-hidden rounded-[1.35rem] border border-border/80">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          >
            <defs>
              <marker
                id="learn-graph-arrow"
                markerHeight="8"
                markerWidth="8"
                orient="auto-start-reverse"
                refX="7"
                refY="4"
              >
                <path
                  d="M0,0 L8,4 L0,8 z"
                  fill="hsla(191, 41%, 28%, 0.75)"
                />
              </marker>
            </defs>

            {neighborhood.visibleEdges.map((visibleEdge) => {
              const sourceNode = nodeMap.get(visibleEdge.edge.source);
              const targetNode = nodeMap.get(visibleEdge.edge.target);

              if (!sourceNode || !targetNode) {
                return null;
              }

              const isSelected = visibleEdge.id === selectedRelationId;
              const strokeOpacity = isSelected
                ? 0.95
                : visibleEdge.isDirectToCurrent
                  ? 0.8
                  : visibleEdge.isDimmed
                    ? 0.22
                    : 0.46;

              return (
                <motion.line
                  animate={{
                    strokeOpacity,
                    strokeWidth: isSelected || visibleEdge.isDirectToCurrent ? 2.8 : 2,
                  }}
                  initial={false}
                  key={visibleEdge.id}
                  markerEnd="url(#learn-graph-arrow)"
                  stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  transition={getPathHighlightTransition(motionMode)}
                  x1={sourceNode.position.x}
                  x2={targetNode.position.x}
                  y1={sourceNode.position.y}
                  y2={targetNode.position.y}
                />
              );
            })}
          </svg>

          {neighborhood.visibleEdges.map((visibleEdge) => {
            const sourceNode = nodeMap.get(visibleEdge.edge.source);
            const targetNode = nodeMap.get(visibleEdge.edge.target);

            if (!sourceNode || !targetNode) {
              return null;
            }

            const isSelected = visibleEdge.id === selectedRelationId;
            const midpointX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midpointY = (sourceNode.position.y + targetNode.position.y) / 2;

            return (
              <motion.button
                aria-label={`${visibleEdge.edge.label}: ${visibleEdge.edge.rationale}`}
                className={cn(
                  "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-opacity",
                  isSelected
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-soft"
                    : visibleEdge.isDimmed
                      ? "border-border/60 bg-background/90 text-muted-foreground opacity-60"
                      : "border-border/80 bg-background/95 text-foreground",
                )}
                key={visibleEdge.id}
                onClick={() =>
                  onSelectRelation(isSelected ? null : visibleEdge.id)
                }
                onFocus={() => onSelectRelation(visibleEdge.id)}
                style={{
                  left: toPercent(midpointX, GRAPH_WIDTH),
                  top: toPercent(midpointY, GRAPH_HEIGHT),
                }}
                transition={getPathHighlightTransition(motionMode)}
                type="button"
                whileHover={getNodeHoverAnimation(motionMode)}
                whileTap={getNodePressAnimation(motionMode)}
              >
                {visibleEdge.edge.label}
              </motion.button>
            );
          })}

          {neighborhood.visibleNodes.map((visibleNode) => {
            const isCurrent = visibleNode.role === "current";

            return (
              <motion.button
                animate={{
                  boxShadow: isCurrent
                    ? "0 26px 60px -34px rgba(31, 68, 79, 0.62)"
                    : visibleNode.isDimmed
                      ? "0 12px 22px -20px rgba(58, 76, 88, 0.2)"
                      : "0 18px 38px -26px rgba(58, 76, 88, 0.38)",
                }}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`${visibleNode.node.title}. ${getNodeRoleLabel(visibleNode.role)} concept.`}
                className={cn(
                  "absolute z-20 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border px-4 py-3 text-left",
                  isCurrent
                    ? "border-primary/35 bg-primary text-primary-foreground shadow-panel"
                    : visibleNode.isDimmed
                      ? "border-border/70 bg-background/80 text-muted-foreground opacity-65 hover:opacity-90"
                      : "border-border/80 bg-background/95 text-foreground",
                )}
                initial={false}
                key={visibleNode.id}
                onClick={() => onNavigate(visibleNode.id)}
                onFocus={() => onSelectRelation(null)}
                onKeyDown={(event) => handleNodeKeyDown(event, visibleNode.id)}
                ref={(element) => {
                  nodeButtonRefs.current[visibleNode.id] = element;
                }}
                style={{
                  left: toPercent(visibleNode.position.x, GRAPH_WIDTH),
                  top: toPercent(visibleNode.position.y, GRAPH_HEIGHT),
                }}
                transition={getNodeSelectionTransition(motionMode)}
                type="button"
                whileHover={!isCurrent ? getNodeHoverAnimation(motionMode) : undefined}
                whileTap={!isCurrent ? getNodePressAnimation(motionMode) : undefined}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">
                  {getNodeRoleLabel(visibleNode.role)}
                </p>
                {isCurrent ? (
                  <motion.div
                    className="mt-2 font-display text-sm leading-5"
                    layoutId={`learn-node-chip-${visibleNode.id}`}
                    transition={getPanelTransition(motionMode)}
                  >
                    {visibleNode.node.shortTitle}
                  </motion.div>
                ) : (
                  <p className="mt-2 font-display text-sm leading-5">
                    {visibleNode.node.shortTitle}
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/80 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Relation focus
          </p>
          {selectedRelation ? (
            <>
              <p className="font-medium text-foreground">{selectedRelation.edge.label}</p>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {selectedRelation.edge.rationale}
              </p>
            </>
          ) : (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Focus or select a relation pill to inspect the typed connection between
              two visible concepts.
            </p>
          )}
        </div>
        <Button
          onClick={() => onNavigate(neighborhood.currentNode.id)}
          size="sm"
          type="button"
          variant="outline"
        >
          Recenter on {neighborhood.currentNode.shortTitle}
        </Button>
      </div>
    </motion.section>
  );
}
