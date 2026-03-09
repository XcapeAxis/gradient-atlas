"use client";

import type { CSSProperties } from "react";
import type { Edge, Node } from "@xyflow/react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { KnowledgeGraph } from "@/lib/schema";

function isHighlighted(selectedNodeId: string | undefined, id: string) {
  return selectedNodeId === id;
}

function getVisibleNodeIds(graph: KnowledgeGraph, selectedNodeId?: string) {
  if (!selectedNodeId) {
    return graph.starterPaths[0]?.nodeIds.slice(0, 8) ?? [];
  }

  const neighborIds = Array.from(
    new Set(
      graph.edges
        .filter(
          (edge) =>
            edge.source === selectedNodeId || edge.target === selectedNodeId,
        )
        .flatMap((edge) => [edge.source, edge.target]),
    ),
  )
    .filter((id) => id !== selectedNodeId)
    .sort((left, right) => {
      const leftNode = graph.nodes.find((node) => node.id === left);
      const rightNode = graph.nodes.find((node) => node.id === right);

      return (leftNode?.title ?? left).localeCompare(rightNode?.title ?? right);
    });

  return [selectedNodeId, ...neighborIds.slice(0, 8)];
}

function getNodePosition(index: number, total: number, selectedNodeId?: string) {
  if (selectedNodeId && index === 0) {
    return { x: 320, y: 210 };
  }

  const neighborIndex = selectedNodeId ? index - 1 : index;
  const neighborTotal = selectedNodeId ? Math.max(total - 1, 1) : Math.max(total, 1);
  const angle = (-Math.PI / 2) + (neighborIndex / neighborTotal) * Math.PI * 2;

  return {
    x: 320 + Math.cos(angle) * 230,
    y: 210 + Math.sin(angle) * 150,
  };
}

export function FocusedGraphCanvas({
  description,
  graph,
  headline,
  selectedNodeId,
  supportingText,
}: {
  description: string;
  graph: KnowledgeGraph;
  headline: string;
  selectedNodeId?: string;
  supportingText: string;
}) {
  const visibleNodeIds = getVisibleNodeIds(graph, selectedNodeId);
  const visibleNodeIdSet = new Set(visibleNodeIds);
  const visibleNodes = visibleNodeIds
    .map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
    .filter((node): node is KnowledgeGraph["nodes"][number] => Boolean(node));

  const nodes: Node[] = visibleNodes.map((node, index) => {
    const highlighted = isHighlighted(selectedNodeId, node.id);

    return {
      id: node.id,
      data: { label: node.shortTitle },
      draggable: false,
      position: getNodePosition(index, visibleNodes.length, selectedNodeId),
      selectable: false,
      style: {
        backgroundColor: highlighted
          ? "hsl(var(--primary))"
          : "hsla(0, 0%, 100%, 0.92)",
        border: highlighted
          ? "1px solid hsla(196, 38%, 22%, 0.6)"
          : "1px solid hsla(197, 20%, 72%, 0.7)",
        borderRadius: "18px",
        boxShadow: highlighted
          ? "0 18px 44px -28px rgba(33, 82, 90, 0.7)"
          : "0 16px 32px -26px rgba(59, 74, 86, 0.45)",
        color: highlighted ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 700,
        padding: 18,
        width: 210,
      } satisfies CSSProperties,
    };
  });

  const edges: Edge[] = graph.edges
    .filter(
      (edge) =>
        visibleNodeIdSet.has(edge.source) && visibleNodeIdSet.has(edge.target),
    )
    .map((edge) => {
    const highlighted =
      edge.source === selectedNodeId || edge.target === selectedNodeId;

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: highlighted,
      label: edge.label,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
      },
      style: {
        stroke: highlighted
          ? "hsl(var(--primary))"
          : "hsla(198, 18%, 52%, 0.8)",
        strokeWidth: highlighted ? 2.6 : 2,
      },
      labelStyle: {
        fill: "hsl(var(--muted-foreground))",
        fontSize: 12,
        fontWeight: 600,
      },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 999,
      labelBgStyle: {
        fill: "hsla(45, 33%, 99%, 0.88)",
      },
    };
  });

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="surface-panel overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 border-b border-border/80 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-display text-xl text-foreground">{headline}</p>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <Badge variant="secondary">
          {visibleNodes.length} visible nodes
        </Badge>
      </div>

      <div className="p-3 sm:p-5">
        <div className="canvas-surface h-[420px] overflow-hidden rounded-xl border border-border/80">
          <ReactFlow
            aria-label="Machine learning fundamentals preview graph"
            edges={edges}
            elementsSelectable={false}
            fitView
            fitViewOptions={{ padding: 0.24 }}
            nodes={nodes}
            nodesConnectable={false}
            nodesDraggable={false}
            panOnDrag
            panOnScroll
            proOptions={{ hideAttribution: true }}
            zoomOnPinch
          >
            <Background color="hsla(197, 20%, 78%, 0.9)" gap={24} size={1} />
            <MiniMap
              maskColor="hsla(45, 20%, 95%, 0.8)"
              nodeBorderRadius={14}
              nodeColor={(node) =>
                node.id === selectedNodeId
                  ? "hsl(var(--primary))"
                  : "hsla(196, 18%, 72%, 0.9)"
              }
              pannable
              position="top-right"
            />
            <Controls position="bottom-right" showInteractive={false} />
          </ReactFlow>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{supportingText}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Tab through the shell</Badge>
          <Badge variant="outline">Pan the graph</Badge>
          <Badge variant="outline">Visible focus states</Badge>
        </div>
      </div>
    </motion.section>
  );
}
