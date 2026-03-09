import type { KnowledgeGraph, Module } from "@/lib/schema";

export interface ModuleLaneLayout {
  height: number;
  module: Module;
  nodeIds: string[];
  width: number;
  x: number;
  y: number;
}

export interface PositionedOverviewNode {
  id: string;
  lane: Module;
  position: { x: number; y: number };
}

export interface ModuleOverviewLayout {
  canvasHeight: number;
  canvasWidth: number;
  lanes: ModuleLaneLayout[];
  nodes: PositionedOverviewNode[];
}

const laneWidth = 208;
const laneGap = 52;
const nodeStep = 92;
const topPadding = 132;
const bottomPadding = 96;
const leftPadding = 96;

function sortNodesWithinModule(graph: KnowledgeGraph, module: Module) {
  return graph.nodes
    .filter((node) => node.module === module)
    .sort((left, right) => {
      if (left.difficulty !== right.difficulty) {
        return left.difficulty - right.difficulty;
      }

      return left.title.localeCompare(right.title);
    });
}

export function getModuleOverviewLayout(
  graph: KnowledgeGraph,
  moduleOrder: Module[],
): ModuleOverviewLayout {
  const lanes = moduleOrder.map((module, moduleIndex) => {
    const moduleNodes = sortNodesWithinModule(graph, module);

    return {
      height: Math.max(moduleNodes.length * nodeStep + 96, 260),
      module,
      nodeIds: moduleNodes.map((node) => node.id),
      width: laneWidth,
      x: leftPadding + moduleIndex * (laneWidth + laneGap),
      y: 48,
    } satisfies ModuleLaneLayout;
  });
  const maxNodeCount = Math.max(...lanes.map((lane) => lane.nodeIds.length));
  const canvasWidth =
    leftPadding * 2 + moduleOrder.length * laneWidth + (moduleOrder.length - 1) * laneGap;
  const canvasHeight = topPadding + maxNodeCount * nodeStep + bottomPadding;
  const nodes = lanes.flatMap((lane) =>
    lane.nodeIds.map((nodeId, nodeIndex) => ({
      id: nodeId,
      lane: lane.module,
      position: {
        x: lane.x + lane.width / 2,
        y: topPadding + nodeIndex * nodeStep,
      },
    })),
  );

  return {
    canvasHeight,
    canvasWidth,
    lanes,
    nodes,
  };
}
