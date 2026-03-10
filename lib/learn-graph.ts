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
  | "related";

export type LearnOverflowLane = Exclude<LearnVisibleNodeRole, "current">;
export type LearnEdgeVisualGroup = "primary" | "secondary";
export type GraphDirection = "left" | "right" | "up" | "down";

export const LEARN_WORLD = {
  height: 600,
  width: 980,
} as const;

const MAX_PREREQUISITES = 2;
const MAX_DEPENDENTS = 2;
const MAX_RELATED = 2;
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

export interface LearnVisibleNode {
  id: string;
  node: CurriculumNode;
  role: LearnVisibleNodeRole;
  position: { x: number; y: number };
}

export interface LearnVisibleEdge {
  id: string;
  edge: GraphEdge;
  isIncidentToCurrent: boolean;
  isRecommended: boolean;
  visualGroup: LearnEdgeVisualGroup;
}

export interface LearnOverflowIndicator {
  count: number;
  hiddenNodeIds: string[];
  id: string;
  label: string;
  lane: LearnOverflowLane;
  position: { x: number; y: number };
}

export interface LearnRecommendation {
  node: CurriculumNode;
  whyNext: string;
}

export interface LearnNeighborhood {
  currentNode: CurriculumNode;
  nodeOrder: string[];
  overflowIndicators: LearnOverflowIndicator[];
  recommendations: LearnRecommendation[];
  starterPath: StarterPath;
  visibleEdgeIds: string[];
  visibleEdges: LearnVisibleEdge[];
  visibleNodeIds: string[];
  visibleNodes: LearnVisibleNode[];
  worldSize: typeof LEARN_WORLD;
}

export interface LearnEdgeVisualStyle {
  dashArray?: string;
  group: LearnEdgeVisualGroup;
  hasArrow: boolean;
  opacity: number;
  strokeWidth: number;
}

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

function getStarterPathIndex(starterPath: StarterPath, nodeId: string) {
  return starterPath.nodeIds.indexOf(nodeId);
}

function sortNodeIdsByLearningPriority(
  graph: KnowledgeGraph,
  nodeIds: string[],
  starterPath: StarterPath,
) {
  return Array.from(new Set(nodeIds)).sort((left, right) => {
    const leftIndex = getStarterPathIndex(starterPath, left);
    const rightIndex = getStarterPathIndex(starterPath, right);

    if (leftIndex !== -1 && rightIndex !== -1 && leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    if (leftIndex !== -1 && rightIndex === -1) {
      return -1;
    }

    if (leftIndex === -1 && rightIndex !== -1) {
      return 1;
    }

    return getNode(graph, left).title.localeCompare(getNode(graph, right).title);
  });
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

function getDirectRelatedIds(
  graph: KnowledgeGraph,
  nodeId: string,
  starterPath: StarterPath,
) {
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

    const leftIndex = getStarterPathIndex(starterPath, left);
    const rightIndex = getStarterPathIndex(starterPath, right);

    if (leftIndex !== -1 && rightIndex !== -1 && leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
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

function getLaneYPositions(count: number, centerY: number, gap: number) {
  if (count <= 0) {
    return [];
  }

  const startY = centerY - ((count - 1) * gap) / 2;

  return Array.from({ length: count }, (_, index) => startY + index * gap);
}

function getBottomStripXPositions(count: number) {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [LEARN_WORLD.width / 2];
  }

  return [395, 585];
}

function getLaneOverflowPosition(lane: LearnOverflowLane) {
  switch (lane) {
    case "prerequisite":
      return { x: 180, y: 430 };
    case "dependent":
      return { x: 800, y: 430 };
    case "related":
      return { x: LEARN_WORLD.width / 2, y: 515 };
    default:
      return { x: LEARN_WORLD.width / 2, y: LEARN_WORLD.height / 2 };
  }
}

function buildNodePositions(
  currentNodeId: string,
  prerequisiteIds: string[],
  dependentIds: string[],
  relatedIds: string[],
) {
  const positions = new Map<string, { x: number; y: number }>();

  positions.set(currentNodeId, { x: LEARN_WORLD.width / 2, y: 225 });

  getLaneYPositions(prerequisiteIds.length, 225, 112).forEach((y, index) => {
    positions.set(prerequisiteIds[index], { x: 180, y });
  });

  getLaneYPositions(dependentIds.length, 225, 112).forEach((y, index) => {
    positions.set(dependentIds[index], { x: 800, y });
  });

  getBottomStripXPositions(relatedIds.length).forEach((x, index) => {
    positions.set(relatedIds[index], { x, y: 455 });
  });

  return positions;
}

function getVisibleEdges(
  graph: KnowledgeGraph,
  currentNodeId: string,
  visibleNodeIds: Set<string>,
  recommendedNodeIds: Set<string>,
) {
  return graph.edges
    .filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
    )
    .map((edge) => ({
      edge,
      id: edge.id,
      isIncidentToCurrent:
        edge.source === currentNodeId || edge.target === currentNodeId,
      isRecommended:
        edge.relationType === "prerequisite_of" &&
        edge.source === currentNodeId &&
        recommendedNodeIds.has(edge.target),
      visualGroup: getLearnEdgeVisualStyle(edge).group,
    }));
}

export function getLearnEdgeVisualStyle(
  edge: Pick<GraphEdge, "relationType">,
  state: {
    isHighlighted?: boolean;
    isRecommended?: boolean;
    isSelected?: boolean;
  } = {},
): LearnEdgeVisualStyle {
  const isPrimary = edge.relationType === "prerequisite_of";

  if (isPrimary) {
    return {
      group: "primary",
      hasArrow: true,
      opacity: state.isSelected
        ? 0.96
        : state.isHighlighted || state.isRecommended
          ? 0.82
          : 0.54,
      strokeWidth: state.isSelected || state.isRecommended ? 2.6 : 2.1,
    };
  }

  return {
    dashArray: "8 10",
    group: "secondary",
    hasArrow: false,
    opacity: state.isSelected ? 0.74 : state.isHighlighted ? 0.42 : 0.2,
    strokeWidth: state.isSelected ? 1.8 : 1.3,
  };
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

      const leftNodeId = left.source === currentNodeId ? left.target : left.source;
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

  const directPrerequisiteIds = sortNodeIdsByLearningPriority(
    graph,
    getDirectPrerequisiteIds(graph, currentNodeId),
    starterPath,
  );
  const directDependentIds = sortNodeIdsByLearningPriority(
    graph,
    getDirectDependentIds(graph, currentNodeId),
    starterPath,
  );
  const directRelatedIds = getDirectRelatedIds(graph, currentNodeId, starterPath).filter(
    (nodeId) =>
      nodeId !== currentNodeId &&
      !directPrerequisiteIds.includes(nodeId) &&
      !directDependentIds.includes(nodeId),
  );

  const prerequisiteIds = directPrerequisiteIds.slice(0, MAX_PREREQUISITES);
  const dependentIds = directDependentIds.slice(0, MAX_DEPENDENTS);
  const relatedIds = directRelatedIds.slice(0, MAX_RELATED);

  const positions = buildNodePositions(
    currentNodeId,
    prerequisiteIds,
    dependentIds,
    relatedIds,
  );
  const visibleNodeIds = [
    currentNodeId,
    ...prerequisiteIds,
    ...dependentIds,
    ...relatedIds,
  ];
  const visibleNodeIdSet = new Set(visibleNodeIds);
  const recommendations = getNextRecommendedNodes(graph, currentNodeId, starterPath);
  const recommendedNodeIds = new Set(recommendations.map((recommendation) => recommendation.node.id));

  const visibleNodes = visibleNodeIds.map((nodeId) => {
    const role: LearnVisibleNodeRole =
      nodeId === currentNodeId
        ? "current"
        : prerequisiteIds.includes(nodeId)
          ? "prerequisite"
          : dependentIds.includes(nodeId)
            ? "dependent"
            : "related";

    return {
      id: nodeId,
      node: getNode(graph, nodeId),
      position: positions.get(nodeId) ?? {
        x: LEARN_WORLD.width / 2,
        y: LEARN_WORLD.height / 2,
      },
      role,
    };
  });

  const overflowIndicators = [
    {
      count: Math.max(0, directPrerequisiteIds.length - prerequisiteIds.length),
      hiddenNodeIds: directPrerequisiteIds.slice(prerequisiteIds.length),
      id: "overflow-prerequisite",
      label: "More before",
      lane: "prerequisite" as const,
      position: getLaneOverflowPosition("prerequisite"),
    },
    {
      count: Math.max(0, directDependentIds.length - dependentIds.length),
      hiddenNodeIds: directDependentIds.slice(dependentIds.length),
      id: "overflow-dependent",
      label: "More next",
      lane: "dependent" as const,
      position: getLaneOverflowPosition("dependent"),
    },
    {
      count: Math.max(0, directRelatedIds.length - relatedIds.length),
      hiddenNodeIds: directRelatedIds.slice(relatedIds.length),
      id: "overflow-related",
      label: "More context",
      lane: "related" as const,
      position: getLaneOverflowPosition("related"),
    },
  ].filter((indicator) => indicator.count > 0) satisfies LearnOverflowIndicator[];

  const visibleEdges = getVisibleEdges(
    graph,
    currentNodeId,
    visibleNodeIdSet,
    recommendedNodeIds,
  );

  return {
    currentNode,
    nodeOrder: [
      ...prerequisiteIds,
      currentNodeId,
      ...dependentIds,
      ...relatedIds,
    ],
    overflowIndicators,
    recommendations,
    starterPath,
    visibleEdgeIds: visibleEdges.map((edge) => edge.id),
    visibleEdges,
    visibleNodeIds,
    visibleNodes,
    worldSize: LEARN_WORLD,
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

  const directionalCandidates = visibleNodes
    .filter((node) => node.id !== currentNodeId)
    .map((node) => {
      const deltaX = node.position.x - currentNode.position.x;
      const deltaY = node.position.y - currentNode.position.y;

      return {
        deltaX,
        deltaY,
        node,
      };
    })
    .filter(({ deltaX, deltaY }) => {
      switch (direction) {
        case "left":
          return deltaX < 0;
        case "right":
          return deltaX > 0;
        case "up":
          return deltaY < 0;
        case "down":
          return deltaY > 0;
        default:
          return false;
      }
    })
    .sort((left, right) => {
      const leftRolePriority =
        direction === "left"
          ? left.node.role === "prerequisite"
            ? 0
            : left.node.role === "related"
              ? 1
              : 2
          : direction === "right"
            ? left.node.role === "dependent"
              ? 0
              : left.node.role === "related"
                ? 1
                : 2
            : direction === "down"
              ? left.node.role === "related"
                ? 0
                : 1
              : 0;
      const rightRolePriority =
        direction === "left"
          ? right.node.role === "prerequisite"
            ? 0
            : right.node.role === "related"
              ? 1
              : 2
          : direction === "right"
            ? right.node.role === "dependent"
              ? 0
              : right.node.role === "related"
                ? 1
                : 2
            : direction === "down"
              ? right.node.role === "related"
                ? 0
                : 1
              : 0;

      if (leftRolePriority !== rightRolePriority) {
        return leftRolePriority - rightRolePriority;
      }

      const leftPrimaryDistance =
        direction === "left" || direction === "right"
          ? Math.abs(left.deltaX)
          : Math.abs(left.deltaY);
      const rightPrimaryDistance =
        direction === "left" || direction === "right"
          ? Math.abs(right.deltaX)
          : Math.abs(right.deltaY);

      if (leftPrimaryDistance !== rightPrimaryDistance) {
        return leftPrimaryDistance - rightPrimaryDistance;
      }

      const leftSecondaryDistance =
        direction === "left" || direction === "right"
          ? Math.abs(left.deltaY)
          : Math.abs(left.deltaX);
      const rightSecondaryDistance =
        direction === "left" || direction === "right"
          ? Math.abs(right.deltaY)
          : Math.abs(right.deltaX);

      const leftScore = leftPrimaryDistance + leftSecondaryDistance * 2;
      const rightScore = rightPrimaryDistance + rightSecondaryDistance * 2;

      if (leftScore !== rightScore) {
        return leftScore - rightScore;
      }

      return leftSecondaryDistance - rightSecondaryDistance;
    });

  return directionalCandidates[0]?.node.id ?? null;
}
