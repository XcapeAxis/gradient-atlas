"use client";

import type { CSSProperties } from "react";
import type { Edge, Node } from "@xyflow/react";
import { Background, MarkerType, ReactFlow } from "@xyflow/react";
import { motion } from "framer-motion";
import type { KnowledgeGraph } from "@/lib/schema";

function getVisibleNodeIds(graph: KnowledgeGraph, selectedNodeId?: string) {
  if (!selectedNodeId) {
    return graph.starterPaths[0]?.nodeIds.slice(0, 5) ?? [];
  }

  const neighbors = Array.from(
    new Set(
      graph.edges
        .filter(
          (edge) =>
            edge.source === selectedNodeId || edge.target === selectedNodeId,
        )
        .flatMap((edge) => [edge.source, edge.target]),
    ),
  )
    .filter((nodeId) => nodeId !== selectedNodeId)
    .slice(0, 4);

  return [selectedNodeId, ...neighbors];
}

function getNodePosition(index: number, total: number) {
  if (index === 0) {
    return { x: 320, y: 180 };
  }

  const angle = (-Math.PI / 2) + ((index - 1) / Math.max(total - 1, 1)) * Math.PI * 2;

  return {
    x: 320 + Math.cos(angle) * 190,
    y: 180 + Math.sin(angle) * 118,
  };
}

export function FocusedGraphCanvas({
  graph,
  selectedNodeId,
}: {
  graph: KnowledgeGraph;
  selectedNodeId?: string;
}) {
  const visibleNodeIds = getVisibleNodeIds(graph, selectedNodeId);
  const visibleNodeIdSet = new Set(visibleNodeIds);
  const visibleNodes = visibleNodeIds
    .map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
    .filter((node): node is KnowledgeGraph["nodes"][number] => Boolean(node));

  const nodes: Node[] = visibleNodes.map((node, index) => {
    const isSelected = node.id === selectedNodeId;

    return {
      id: node.id,
      data: { label: node.shortTitle },
      draggable: false,
      position: getNodePosition(index, visibleNodes.length),
      selectable: false,
      style: {
        backgroundColor: isSelected
          ? "hsl(var(--primary))"
          : "hsla(0, 0%, 100%, 0.86)",
        border: isSelected
          ? "1px solid hsla(196, 38%, 22%, 0.46)"
          : "1px solid hsla(197, 20%, 72%, 0.58)",
        borderRadius: "18px",
        boxShadow: isSelected
          ? "0 22px 44px -34px rgba(33, 82, 90, 0.48)"
          : "0 14px 28px -24px rgba(59, 74, 86, 0.22)",
        color: isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 700,
        padding: 16,
        width: isSelected ? 210 : 180,
      } satisfies CSSProperties,
    };
  });

  const edges: Edge[] = graph.edges
    .filter(
      (edge) =>
        visibleNodeIdSet.has(edge.source) && visibleNodeIdSet.has(edge.target),
    )
    .map((edge) => {
      const isSelected =
        edge.source === selectedNodeId || edge.target === selectedNodeId;

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
        },
        style: {
          stroke: isSelected
            ? "hsl(var(--primary))"
            : "hsla(198, 18%, 52%, 0.32)",
          strokeWidth: isSelected ? 2.1 : 1.2,
        },
      };
    });

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="canvas-surface h-[320px] overflow-hidden rounded-[1.4rem] border border-border/70 shadow-canvas"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <ReactFlow
        aria-label="Gradient Atlas concept spotlight preview"
        edges={edges}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        panOnDrag={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        zoomOnScroll={false}
      >
        <Background color="hsla(197, 20%, 78%, 0.42)" gap={44} size={1} />
      </ReactFlow>
    </motion.div>
  );
}
