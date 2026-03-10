"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LocateFixed } from "lucide-react";
import { useMotionSettings } from "@/components/providers/motion-provider";
import { Button } from "@/components/ui/button";
import {
  getDirectionalNeighborId,
  getLearnEdgeVisualStyle,
  type GraphDirection,
  type LearnNeighborhood,
  type LearnVisibleNodeRole,
} from "@/lib/learn-graph";
import {
  getViewportScrollTarget,
  type LearnViewportIntent,
} from "@/lib/learn-viewport";
import {
  getNodeHoverAnimation,
  getNodePressAnimation,
  getNodeSelectionTransition,
  getPanelTransition,
  getPathHighlightTransition,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function getNodeRoleLabel(role: LearnVisibleNodeRole) {
  switch (role) {
    case "current":
      return "Current";
    case "prerequisite":
      return "Before";
    case "dependent":
      return "Next";
    case "related":
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

function getRelationPillPosition(
  source: { x: number; y: number },
  target: { x: number; y: number },
) {
  return {
    x: source.x + (target.x - source.x) * 0.52,
    y: source.y + (target.y - source.y) * 0.52,
  };
}

export function LearnGraphCanvas({
  neighborhood,
  onNavigate,
}: {
  neighborhood: LearnNeighborhood;
  onNavigate: (nodeId: string) => void;
}) {
  const { motionMode } = useMotionSettings();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const nodeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeRelationId, setActiveRelationId] = useState<string | null>(null);
  const [peekNodeId, setPeekNodeId] = useState<string | null>(null);

  const nodeMap = useMemo(
    () => new Map(neighborhood.visibleNodes.map((node) => [node.id, node])),
    [neighborhood.visibleNodes],
  );
  const activeRelation =
    neighborhood.visibleEdges.find((edge) => edge.id === activeRelationId) ?? null;
  const highlightedNodeId = peekNodeId ?? neighborhood.currentNode.id;
  const highlightedEdgeIds = useMemo(
    () =>
      new Set(
        neighborhood.visibleEdges
          .filter(
            (edge) =>
              edge.edge.source === highlightedNodeId ||
              edge.edge.target === highlightedNodeId,
          )
          .map((edge) => edge.id),
      ),
    [highlightedNodeId, neighborhood.visibleEdges],
  );
  const emphasizedNodeIds = useMemo(() => {
    const ids = new Set<string>([neighborhood.currentNode.id]);

    if (peekNodeId) {
      ids.add(peekNodeId);

      neighborhood.visibleEdges.forEach((edge) => {
        if (edge.edge.source === peekNodeId) {
          ids.add(edge.edge.target);
        }

        if (edge.edge.target === peekNodeId) {
          ids.add(edge.edge.source);
        }
      });
    }

    if (activeRelation) {
      ids.add(activeRelation.edge.source);
      ids.add(activeRelation.edge.target);
    }

    return ids;
  }, [activeRelation, neighborhood.currentNode.id, neighborhood.visibleEdges, peekNodeId]);
  const visibleRelationPills = useMemo(
    () =>
      neighborhood.visibleEdges.filter((edge) => {
        if (edge.id === activeRelationId) {
          return true;
        }

        if (peekNodeId) {
          return highlightedEdgeIds.has(edge.id);
        }

        return edge.isIncidentToCurrent && edge.visualGroup === "primary";
      }),
    [activeRelationId, highlightedEdgeIds, neighborhood.visibleEdges, peekNodeId],
  );

  useEffect(() => {
    setActiveRelationId(null);
    setPeekNodeId(null);
  }, [neighborhood.currentNode.id]);

  function focusNodeInViewport(nodeId: string, intent: LearnViewportIntent) {
    const viewportElement = viewportRef.current;
    const visibleNode = nodeMap.get(nodeId);

    if (!viewportElement || !visibleNode) {
      return;
    }

    const target = getViewportScrollTarget(
      intent,
      visibleNode.position,
      {
        height: viewportElement.clientHeight,
        width: viewportElement.clientWidth,
      },
      {
        left: viewportElement.scrollLeft,
        top: viewportElement.scrollTop,
      },
      neighborhood.worldSize,
    );

    if (!target) {
      return;
    }

    if (typeof viewportElement.scrollTo === "function") {
      viewportElement.scrollTo({
        behavior: motionMode === "reduced" ? "auto" : "smooth",
        left: target.left,
        top: target.top,
      });
      return;
    }

    viewportElement.scrollLeft = target.left;
    viewportElement.scrollTop = target.top;
  }

  useEffect(() => {
    const viewportElement = viewportRef.current;
    const visibleNode = nodeMap.get(neighborhood.currentNode.id);

    if (!viewportElement || !visibleNode) {
      return;
    }

    const target = getViewportScrollTarget(
      "select",
      visibleNode.position,
      {
        height: viewportElement.clientHeight,
        width: viewportElement.clientWidth,
      },
      {
        left: viewportElement.scrollLeft,
        top: viewportElement.scrollTop,
      },
      neighborhood.worldSize,
    );

    if (!target) {
      return;
    }

    if (typeof viewportElement.scrollTo === "function") {
      viewportElement.scrollTo({
        behavior: motionMode === "reduced" ? "auto" : "smooth",
        left: target.left,
        top: target.top,
      });
      return;
    }

    viewportElement.scrollLeft = target.left;
    viewportElement.scrollTop = target.top;
  }, [motionMode, neighborhood.currentNode.id, neighborhood.worldSize, nodeMap]);

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
      animate={{ opacity: 1 }}
      className="surface-panel overflow-hidden p-4 sm:p-5"
      initial={{ opacity: 0 }}
      transition={getPanelTransition(motionMode)}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="quiet-label">Focused local graph</p>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Hover peeks. Click commits. The graph keeps learning order spatially
            explicit without moving the viewport unless the selection leaves the safe
            frame.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{neighborhood.visibleNodes.length} visible nodes</span>
          <Button
            onClick={() => focusNodeInViewport(neighborhood.currentNode.id, "center")}
            size="sm"
            type="button"
            variant="outline"
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            Center view
          </Button>
        </div>
      </div>

      <div
        className="canvas-surface relative min-h-[540px] overflow-auto rounded-[1.45rem] border border-border/70"
        ref={viewportRef}
      >
        <div
          aria-label="Focused learning graph"
          className="relative"
          style={{
            height: neighborhood.worldSize.height,
            minWidth: neighborhood.worldSize.width,
            width: neighborhood.worldSize.width,
          }}
        >
          <div className="pointer-events-none absolute inset-x-[20%] inset-y-[20%] rounded-[1.8rem] border border-dashed border-border/25" />

          {[
            { id: "before", label: "Before", x: 180 },
            { id: "current", label: "Current", x: neighborhood.worldSize.width / 2 },
            { id: "next", label: "Next", x: 800 },
            { id: "context", label: "Context", x: neighborhood.worldSize.width / 2, y: 390 },
          ].map((lane) => (
            <div
              className="pointer-events-none absolute -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-soft"
              key={lane.id}
              style={{
                left: lane.x,
                top: lane.y ?? 28,
              }}
            >
              {lane.label}
            </div>
          ))}

          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${neighborhood.worldSize.width} ${neighborhood.worldSize.height}`}
          >
            <defs>
              <marker
                id="learn-primary-arrow"
                markerHeight="8"
                markerWidth="8"
                orient="auto-start-reverse"
                refX="7"
                refY="4"
              >
                <path d="M0,0 L8,4 L0,8 z" fill="hsla(191, 41%, 28%, 0.75)" />
              </marker>
              <marker
                id="learn-primary-arrow-muted"
                markerHeight="8"
                markerWidth="8"
                orient="auto-start-reverse"
                refX="7"
                refY="4"
              >
                <path d="M0,0 L8,4 L0,8 z" fill="hsla(200, 16%, 48%, 0.42)" />
              </marker>
            </defs>

            {neighborhood.visibleEdges.map((visibleEdge) => {
              const sourceNode = nodeMap.get(visibleEdge.edge.source);
              const targetNode = nodeMap.get(visibleEdge.edge.target);

              if (!sourceNode || !targetNode) {
                return null;
              }

              const isHighlighted =
                highlightedEdgeIds.has(visibleEdge.id) || visibleEdge.isRecommended;
              const isSelected = visibleEdge.id === activeRelationId;
              const edgeStyle = getLearnEdgeVisualStyle(visibleEdge.edge, {
                isHighlighted,
                isRecommended: visibleEdge.isRecommended,
                isSelected,
              });
              const isMuted =
                (peekNodeId !== null || activeRelation !== null) &&
                !isSelected &&
                !isHighlighted;

              return (
                <motion.line
                  animate={{
                    strokeOpacity: isMuted ? edgeStyle.opacity * 0.48 : edgeStyle.opacity,
                    strokeWidth: edgeStyle.strokeWidth,
                  }}
                  initial={false}
                  key={visibleEdge.id}
                  markerEnd={
                    edgeStyle.hasArrow
                      ? isSelected || visibleEdge.isRecommended
                        ? "url(#learn-primary-arrow)"
                        : "url(#learn-primary-arrow-muted)"
                      : undefined
                  }
                  stroke={
                    isSelected || visibleEdge.isRecommended
                      ? "hsl(var(--primary))"
                      : edgeStyle.group === "primary"
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground))"
                  }
                  strokeDasharray={edgeStyle.dashArray}
                  transition={getPathHighlightTransition(motionMode)}
                  x1={sourceNode.position.x}
                  x2={targetNode.position.x}
                  y1={sourceNode.position.y}
                  y2={targetNode.position.y}
                />
              );
            })}
          </svg>

          {activeRelation ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="absolute left-4 top-4 z-30 max-w-xs rounded-[1.05rem] border border-border/70 bg-background/94 px-4 py-3 shadow-soft"
              initial={{ opacity: 0 }}
              transition={getPanelTransition(motionMode)}
            >
              <p className="quiet-label">Relation</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {activeRelation.edge.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {activeRelation.edge.rationale}
              </p>
            </motion.div>
          ) : null}

          {peekNodeId && peekNodeId !== neighborhood.currentNode.id ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="absolute right-4 top-4 z-30 max-w-xs rounded-[1.05rem] border border-border/70 bg-background/94 px-4 py-3 shadow-soft"
              initial={{ opacity: 0 }}
              transition={getPanelTransition(motionMode)}
            >
              <p className="quiet-label">Peek</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {nodeMap.get(peekNodeId)?.node.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {nodeMap.get(peekNodeId)?.node.summary}
              </p>
            </motion.div>
          ) : null}

          {visibleRelationPills.map((visibleEdge) => {
            const sourceNode = nodeMap.get(visibleEdge.edge.source);
            const targetNode = nodeMap.get(visibleEdge.edge.target);

            if (!sourceNode || !targetNode) {
              return null;
            }

            const isSelected = visibleEdge.id === activeRelationId;
            const pillPosition = getRelationPillPosition(
              sourceNode.position,
              targetNode.position,
            );

            return (
              <motion.button
                aria-label={`${visibleEdge.edge.label}: ${visibleEdge.edge.rationale}`}
                className={cn(
                  "absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] transition-colors",
                  isSelected
                    ? "border-primary/30 bg-primary text-primary-foreground shadow-soft"
                    : visibleEdge.visualGroup === "primary"
                      ? "border-border/70 bg-background/94 text-foreground"
                      : "border-border/60 bg-background/88 text-muted-foreground",
                )}
                key={visibleEdge.id}
                onClick={() =>
                  setActiveRelationId((currentValue) =>
                    currentValue === visibleEdge.id ? null : visibleEdge.id,
                  )
                }
                onFocus={() => setActiveRelationId(visibleEdge.id)}
                style={{
                  left: toPercent(pillPosition.x, neighborhood.worldSize.width),
                  top: toPercent(pillPosition.y, neighborhood.worldSize.height),
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

          {neighborhood.overflowIndicators.map((indicator) => (
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70 bg-background/92 px-3 py-2 text-xs text-muted-foreground shadow-soft"
              key={indicator.id}
              style={{
                left: toPercent(indicator.position.x, neighborhood.worldSize.width),
                top: toPercent(indicator.position.y, neighborhood.worldSize.height),
              }}
              title={indicator.hiddenNodeIds.join(", ")}
            >
              +{indicator.count} more
            </div>
          ))}

          {neighborhood.visibleNodes.map((visibleNode) => {
            const isCurrent = visibleNode.role === "current";
            const isPeeked = visibleNode.id === peekNodeId;
            const isEmphasized = emphasizedNodeIds.has(visibleNode.id);
            const isDimmed =
              (peekNodeId !== null || activeRelation !== null) && !isEmphasized;

            return (
              <motion.button
                animate={{
                  boxShadow: isCurrent
                    ? "0 26px 62px -40px rgba(31, 68, 79, 0.46)"
                    : isPeeked
                      ? "0 18px 38px -28px rgba(31, 68, 79, 0.3)"
                      : "0 12px 24px -22px rgba(58, 76, 88, 0.18)",
                  opacity: isDimmed ? 0.42 : 1,
                }}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`${visibleNode.node.title}. ${getNodeRoleLabel(visibleNode.role)} concept.`}
                className={cn(
                  "absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-[1.2rem] border px-4 py-4 text-left",
                  isCurrent
                    ? "w-48 border-primary/30 bg-primary text-primary-foreground"
                    : "w-40 border-border/70 bg-background/92 text-foreground",
                )}
                initial={false}
                key={visibleNode.id}
                onBlur={() => setPeekNodeId((currentValue) => (currentValue === visibleNode.id ? null : currentValue))}
                onClick={() => onNavigate(visibleNode.id)}
                onDoubleClick={() => focusNodeInViewport(visibleNode.id, "center")}
                onFocus={() => {
                  setPeekNodeId(visibleNode.id);
                  setActiveRelationId(null);
                }}
                onKeyDown={(event) => handleNodeKeyDown(event, visibleNode.id)}
                onMouseEnter={() => {
                  setPeekNodeId(visibleNode.id);
                  setActiveRelationId(null);
                }}
                onMouseLeave={() =>
                  setPeekNodeId((currentValue) =>
                    currentValue === visibleNode.id ? null : currentValue,
                  )
                }
                ref={(element) => {
                  nodeButtonRefs.current[visibleNode.id] = element;
                }}
                style={{
                  left: toPercent(visibleNode.position.x, neighborhood.worldSize.width),
                  top: toPercent(visibleNode.position.y, neighborhood.worldSize.height),
                }}
                transition={getNodeSelectionTransition(motionMode)}
                type="button"
                whileHover={!isCurrent ? getNodeHoverAnimation(motionMode) : undefined}
                whileTap={!isCurrent ? getNodePressAnimation(motionMode) : undefined}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                  {getNodeRoleLabel(visibleNode.role)}
                </p>
                <p className="mt-2 font-display text-sm leading-5">
                  {visibleNode.node.shortTitle}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
