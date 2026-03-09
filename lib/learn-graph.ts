import type {
  CurriculumNode,
  GraphEdge,
  KnowledgeGraph,
  RelationType,
  StarterPath,
  StarterPathId,
} from "@/lib/schema";

export type LearnVisibleNodeRole =
  | "current"
  | "prerequisite"
  | "dependent"
  | "related"
  | "supplemental";

export interface LearnVisibleNode {
  id: string;
  node: CurriculumNode;
  role: LearnVisibleNodeRole;
  position: { x: number; y: number };
  isDimmed: boolean;
}

export interface LearnVisibleEdge {
  id: string;
  edge: GraphEdge;
  isDirectToCurrent: boolean;
  isDimmed: boolean;
}

export interface LearnRecommendation {
  node: CurriculumNode;
  whyNext: string;
}

export interface LearnNeighborhood {
  currentNode: CurriculumNode;
  starterPath: StarterPath;
  visibleNodeIds: string[];
  visibleNodes: LearnVisibleNode[];
  visibleEdges: LearnVisibleEdge[];
  nodeOrder: string[];
  recommendations: LearnRecommendation[];
}

export type GraphDirection = "left" | "right" | "up" | "down";

const MIN_VISIBLE_NODES = 7;
const MAX_VISIBLE_NODES = 15;
const MAX_RECOMMENDATIONS = 3;

const relatedRelationPriority: Record<RelationType, number> = {
  prerequisite_of: 0,
  extension_of: 1,
  example_of: 2,
  uses: 3,
  evaluates: 4,
  optimizes: 5,
  regularizes: 6,
  contrasts_with: 7,
};

function getNode(graph: KnowledgeGraph, nodeId: string) {
  const node = graph.nodes.find((item) => item.id === nodeId);

  if (!node) {
    throw new Error(`Unknown node id: ${nodeId}`);
  }

  return node;
}

function sortNodeIdsByTitle(graph: KnowledgeGraph, nodeIds: string[]) {
  return Array.from(new Set(nodeIds)).sort((left, right) =>
    getNode(graph, left).title.localeCompare(getNode(graph, right).title),
  );
}

function getDirectPrerequisiteIds(graph: KnowledgeGraph, nodeId: string) {
  return sortNodeIdsByTitle(
    graph,
    graph.edges
      .filter(
        (edge) =>
          edge.relationType === "prerequisite_of" && edge.target === nodeId,
      )
      .map((edge) => edge.source),
  );
}

function getDirectDependentIds(graph: KnowledgeGraph, nodeId: string) {
  return sortNodeIdsByTitle(
    graph,
    graph.edges
      .filter(
        (edge) =>
          edge.relationType === "prerequisite_of" && edge.source === nodeId,
      )
      .map((edge) => edge.target),
  );
}

function getDirectRelatedIds(graph: KnowledgeGraph, nodeId: string) {
  const candidateEdges = graph.edges.filter(
    (edge) =>
      edge.relationType !== "prerequisite_of" &&
      (edge.source === nodeId || edge.target === nodeId),
  );

  const uniqueRelatedIds = Array.from(
    new Set(
      candidateEdges.map((edge) =>
        edge.source === nodeId ? edge.target : edge.source,
      ),
    ),
  );

  return uniqueRelatedIds.sort((left, right) => {
    const leftEdgePriority = Math.min(
      ...candidateEdges
        .filter((edge) => edge.source === left || edge.target === left)
        .map((edge) => relatedRelationPriority[edge.relationType]),
    );
    const rightEdgePriority = Math.min(
      ...candidateEdges
        .filter((edge) => edge.source === right || edge.target === right)
        .map((edge) => relatedRelationPriority[edge.relationType]),
    );

    if (leftEdgePriority !== rightEdgePriority) {
      return leftEdgePriority - rightEdgePriority;
    }

    return getNode(graph, left).title.localeCompare(getNode(graph, right).title);
  });
}

export function resolveStarterPathId(
  graph: KnowledgeGraph,
  currentNodeId: string,
  preferredStarterPathId?: StarterPathId,
) {
  const preferredPath = graph.starterPaths.find(
    (path) => path.id === preferredStarterPathId,
  );

  if (preferredPath?.nodeIds.includes(currentNodeId)) {
    return preferredPath.id;
  }

  return (
    graph.starterPaths.find((path) => path.nodeIds.includes(currentNodeId))?.id ??
    graph.starterPaths[0].id
  );
}

function getStarterPathSupplementalIds(
  graph: KnowledgeGraph,
  currentNodeId: string,
  starterPath: StarterPath,
  excludeIds: Set<string>,
) {
  const currentIndex = starterPath.nodeIds.indexOf(currentNodeId);

  if (currentIndex === -1) {
    return starterPath.nodeIds.filter((nodeId) => !excludeIds.has(nodeId));
  }

  return starterPath.nodeIds
    .map((nodeId, index) => ({
      nodeId,
      index,
      distance: Math.abs(index - currentIndex),
    }))
    .filter((item) => item.nodeId !== currentNodeId && !excludeIds.has(item.nodeId))
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return left.index - right.index;
    })
    .map((item) => item.nodeId);
}

function getSameModuleSupplementalIds(
  graph: KnowledgeGraph,
  currentNodeId: string,
  excludeIds: Set<string>,
) {
  const currentNode = getNode(graph, currentNodeId);

  return graph.nodes
    .filter(
      (node) =>
        node.module === currentNode.module &&
        node.id !== currentNodeId &&
        !excludeIds.has(node.id),
    )
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((node) => node.id);
}

function buildVisibleNodeIds(
  graph: KnowledgeGraph,
  currentNodeId: string,
  starterPath: StarterPath,
) {
  const prerequisiteIds = getDirectPrerequisiteIds(graph, currentNodeId);
  const dependentIds = getDirectDependentIds(graph, currentNodeId);
  const relatedIds = getDirectRelatedIds(graph, currentNodeId).filter(
    (nodeId) =>
      nodeId !== currentNodeId &&
      !prerequisiteIds.includes(nodeId) &&
      !dependentIds.includes(nodeId),
  );

  const visibleNodeIds = [
    currentNodeId,
    ...prerequisiteIds,
    ...dependentIds,
  ];
  const includedIds = new Set(visibleNodeIds);

  for (const nodeId of relatedIds) {
    if (visibleNodeIds.length >= MAX_VISIBLE_NODES) {
      break;
    }

    if (!includedIds.has(nodeId)) {
      visibleNodeIds.push(nodeId);
      includedIds.add(nodeId);
    }
  }

  if (visibleNodeIds.length < MIN_VISIBLE_NODES) {
    const supplementalIds = [
      ...getStarterPathSupplementalIds(
        graph,
        currentNodeId,
        starterPath,
        includedIds,
      ),
      ...getSameModuleSupplementalIds(graph, currentNodeId, includedIds),
    ];

    for (const nodeId of supplementalIds) {
      if (visibleNodeIds.length >= MIN_VISIBLE_NODES) {
        break;
      }

      if (!includedIds.has(nodeId)) {
        visibleNodeIds.push(nodeId);
        includedIds.add(nodeId);
      }
    }
  }

  return {
    visibleNodeIds,
    prerequisiteIds,
    dependentIds,
    relatedIds: relatedIds.filter((nodeId) => includedIds.has(nodeId)),
  };
}

function getVerticalPositions(count: number, centerY = 210, step = 92) {
  if (count <= 0) {
    return [];
  }

  const startY = centerY - ((count - 1) * step) / 2;

  return Array.from({ length: count }, (_, index) => startY + index * step);
}

function getHorizontalPositions(count: number, startX: number, endX: number) {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [(startX + endX) / 2];
  }

  const step = (endX - startX) / (count - 1);

  return Array.from({ length: count }, (_, index) => startX + index * step);
}

function buildNodePositions(
  currentNodeId: string,
  prerequisiteIds: string[],
  dependentIds: string[],
  relatedIds: string[],
  supplementalIds: string[],
) {
  const positions = new Map<string, { x: number; y: number }>();

  positions.set(currentNodeId, { x: 320, y: 210 });

  getVerticalPositions(prerequisiteIds.length).forEach((y, index) => {
    positions.set(prerequisiteIds[index], { x: 72, y });
  });

  getVerticalPositions(dependentIds.length).forEach((y, index) => {
    positions.set(dependentIds[index], { x: 568, y });
  });

  const topRowCount = Math.ceil((relatedIds.length + supplementalIds.length) / 2);
  const topRowIds = [...relatedIds, ...supplementalIds].slice(0, topRowCount);
  const bottomRowIds = [...relatedIds, ...supplementalIds].slice(topRowCount);

  getHorizontalPositions(topRowIds.length, 152, 488).forEach((x, index) => {
    positions.set(topRowIds[index], { x, y: 54 });
  });

  getHorizontalPositions(bottomRowIds.length, 152, 488).forEach((x, index) => {
    positions.set(bottomRowIds[index], { x, y: 348 });
  });

  return positions;
}

function getVisibleEdges(graph: KnowledgeGraph, visibleNodeIds: Set<string>, currentNodeId: string) {
  return graph.edges
    .filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
    )
    .map((edge) => ({
      id: edge.id,
      edge,
      isDirectToCurrent:
        edge.source === currentNodeId || edge.target === currentNodeId,
      isDimmed:
        edge.source !== currentNodeId &&
        edge.target !== currentNodeId &&
        edge.relationType !== "prerequisite_of",
    }));
}

export function getNextRecommendedNodes(
  graph: KnowledgeGraph,
  currentNodeId: string,
  starterPath: StarterPath,
) {
  const currentNode = getNode(graph, currentNodeId);
  const recommendations: LearnRecommendation[] = [];
  const addedNodeIds = new Set<string>();
  const currentPathIndex = starterPath.nodeIds.indexOf(currentNodeId);

  if (currentPathIndex >= 0) {
    starterPath.nodeIds.slice(currentPathIndex + 1).forEach((nodeId) => {
      if (recommendations.length >= 2 || addedNodeIds.has(nodeId)) {
        return;
      }

      const pathEdge = graph.edges.find(
        (edge) =>
          (edge.source === currentNodeId && edge.target === nodeId) ||
          (edge.target === currentNodeId && edge.source === nodeId),
      );

      recommendations.push({
        node: getNode(graph, nodeId),
        whyNext: pathEdge
          ? `Next on the ${starterPath.title} path. ${pathEdge.rationale}`
          : `Next on the ${starterPath.title} path to keep the sequence moving forward.`,
      });
      addedNodeIds.add(nodeId);
    });
  }

  graph.edges
    .filter(
      (edge) =>
        edge.source === currentNodeId &&
        edge.relationType === "prerequisite_of" &&
        !addedNodeIds.has(edge.target),
    )
    .sort((left, right) =>
      getNode(graph, left.target).title.localeCompare(
        getNode(graph, right.target).title,
      ),
    )
    .forEach((edge) => {
      if (recommendations.length >= MAX_RECOMMENDATIONS) {
        return;
      }

      recommendations.push({
        node: getNode(graph, edge.target),
        whyNext: `It directly builds on ${currentNode.shortTitle}. ${edge.rationale}`,
      });
      addedNodeIds.add(edge.target);
    });

  graph.edges
    .filter(
      (edge) =>
        (edge.source === currentNodeId || edge.target === currentNodeId) &&
        edge.relationType !== "prerequisite_of",
    )
    .sort((left, right) => {
      const priorityGap =
        relatedRelationPriority[left.relationType] -
        relatedRelationPriority[right.relationType];

      if (priorityGap !== 0) {
        return priorityGap;
      }

      const leftNodeId =
        left.source === currentNodeId ? left.target : left.source;
      const rightNodeId =
        right.source === currentNodeId ? right.target : right.source;

      return getNode(graph, leftNodeId).title.localeCompare(
        getNode(graph, rightNodeId).title,
      );
    })
    .forEach((edge) => {
      if (recommendations.length >= MAX_RECOMMENDATIONS) {
        return;
      }

      const neighborId = edge.source === currentNodeId ? edge.target : edge.source;

      if (addedNodeIds.has(neighborId)) {
        return;
      }

      recommendations.push({
        node: getNode(graph, neighborId),
        whyNext: `${edge.label} relationship with ${currentNode.shortTitle}. ${edge.rationale}`,
      });
      addedNodeIds.add(neighborId);
    });

  return recommendations;
}

export function getLearnNeighborhood(
  graph: KnowledgeGraph,
  currentNodeId: string,
  preferredStarterPathId?: StarterPathId,
): LearnNeighborhood {
  const currentNode = getNode(graph, currentNodeId);
  const starterPathId = resolveStarterPathId(
    graph,
    currentNodeId,
    preferredStarterPathId,
  );
  const starterPath =
    graph.starterPaths.find((path) => path.id === starterPathId) ??
    graph.starterPaths[0];

  const { visibleNodeIds, prerequisiteIds, dependentIds, relatedIds } =
    buildVisibleNodeIds(graph, currentNodeId, starterPath);
  const visibleNodeIdSet = new Set(visibleNodeIds);
  const supplementalIds = visibleNodeIds.filter(
    (nodeId) =>
      nodeId !== currentNodeId &&
      !prerequisiteIds.includes(nodeId) &&
      !dependentIds.includes(nodeId) &&
      !relatedIds.includes(nodeId),
  );
  const positions = buildNodePositions(
    currentNodeId,
    prerequisiteIds,
    dependentIds,
    relatedIds,
    supplementalIds,
  );

  const visibleNodes = visibleNodeIds.map((nodeId) => {
    const role: LearnVisibleNodeRole =
      nodeId === currentNodeId
        ? "current"
        : prerequisiteIds.includes(nodeId)
          ? "prerequisite"
          : dependentIds.includes(nodeId)
            ? "dependent"
            : relatedIds.includes(nodeId)
              ? "related"
              : "supplemental";

    return {
      id: nodeId,
      node: getNode(graph, nodeId),
      role,
      position: positions.get(nodeId) ?? { x: 320, y: 210 },
      isDimmed: role === "supplemental",
    };
  });

  return {
    currentNode,
    starterPath,
    visibleNodeIds,
    visibleNodes,
    visibleEdges: getVisibleEdges(graph, visibleNodeIdSet, currentNodeId),
    nodeOrder: [
      currentNodeId,
      ...prerequisiteIds,
      ...dependentIds,
      ...relatedIds,
      ...supplementalIds,
    ],
    recommendations: getNextRecommendedNodes(graph, currentNodeId, starterPath),
  };
}

export function getDirectionalNeighborId(
  visibleNodes: LearnVisibleNode[],
  currentNodeId: string,
  direction: GraphDirection,
) {
  const currentNode = visibleNodes.find((node) => node.id === currentNodeId);

  if (!currentNode) {
    return null;
  }

  const candidates = visibleNodes
    .filter((node) => node.id !== currentNodeId)
    .map((node) => {
      const deltaX = node.position.x - currentNode.position.x;
      const deltaY = node.position.y - currentNode.position.y;

      return {
        axisDistance:
          direction === "left"
            ? -deltaX
            : direction === "right"
              ? deltaX
              : direction === "up"
                ? -deltaY
                : deltaY,
        crossDistance:
          direction === "left" || direction === "right"
            ? Math.abs(deltaY)
            : Math.abs(deltaX),
        node,
      };
    })
    .filter((candidate) => candidate.axisDistance > 0)
    .sort((left, right) => {
      const leftScore = left.axisDistance + left.crossDistance * 3;
      const rightScore = right.axisDistance + right.crossDistance * 3;

      if (leftScore !== rightScore) {
        return leftScore - rightScore;
      }

      return left.node.node.title.localeCompare(right.node.node.title);
    });

  return candidates[0]?.node.id ?? null;
}
