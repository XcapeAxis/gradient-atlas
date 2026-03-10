"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useMotionSettings } from "@/components/providers/motion-provider";
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
      className="surface-panel overflow-hidden p-4 sm:p-5"
      initial={{ opacity: 0, y: motionMode === "reduced" ? 0 : 10 }}
      transition={getPanelTransition(motionMode)}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="quiet-label">Local graph</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep the current concept, its prerequisites, direct dependents, and a few
            useful neighbors in view.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {neighborhood.visibleNodes.length} visible nodes
        </p>
      </div>

      <div className="canvas-surface relative aspect-[4/3] min-h-[420px] overflow-hidden rounded-[1.45rem] border border-border/70">
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
              <path d="M0,0 L8,4 L0,8 z" fill="hsla(191, 41%, 28%, 0.55)" />
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
              ? 0.86
              : visibleEdge.isDirectToCurrent
                ? 0.56
                : visibleEdge.isDimmed
                  ? 0.12
                  : 0.3;

            return (
              <motion.line
                animate={{
                  strokeOpacity,
                  strokeWidth: isSelected || visibleEdge.isDirectToCurrent ? 2.2 : 1.4,
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

        {selectedRelation ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 top-4 z-30 max-w-xs rounded-[1.1rem] border border-border/70 bg-background/92 px-4 py-3 shadow-soft"
            initial={{ opacity: 0, y: motionMode === "reduced" ? 0 : 8 }}
            transition={getPanelTransition(motionMode)}
          >
            <p className="quiet-label">Relation</p>
            <p className="mt-2 font-medium text-foreground">{selectedRelation.edge.label}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {selectedRelation.edge.rationale}
            </p>
          </motion.div>
        ) : null}

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
                "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors",
                isSelected
                  ? "border-primary/30 bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-soft"
                  : "h-3.5 w-3.5 border-border/70 bg-background/92",
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
              {isSelected ? visibleEdge.edge.label : null}
            </motion.button>
          );
        })}

        {neighborhood.visibleNodes.map((visibleNode) => {
          const isCurrent = visibleNode.role === "current";

          return (
            <motion.button
              animate={{
                boxShadow: isCurrent
                  ? "0 24px 56px -36px rgba(31, 68, 79, 0.52)"
                  : visibleNode.isDimmed
                    ? "0 10px 20px -18px rgba(58, 76, 88, 0.12)"
                    : "0 16px 34px -28px rgba(58, 76, 88, 0.24)",
              }}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`${visibleNode.node.title}. ${getNodeRoleLabel(visibleNode.role)} concept.`}
              className={cn(
                "absolute z-20 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border px-4 py-3 text-left",
                isCurrent
                  ? "border-primary/30 bg-primary text-primary-foreground"
                  : visibleNode.isDimmed
                    ? "border-border/60 bg-background/74 text-muted-foreground opacity-60 hover:opacity-90"
                    : "border-border/70 bg-background/90 text-foreground",
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-75">
                {getNodeRoleLabel(visibleNode.role)}
              </p>
              <p className="mt-2 font-display text-sm leading-5">
                {visibleNode.node.shortTitle}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
