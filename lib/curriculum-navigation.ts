import type {
  CompletionState,
  LearningStatus,
} from "@/lib/progress";
import {
  getCompletionState,
  isReadyPrerequisiteStatus,
} from "@/lib/progress";
import type {
  CurriculumNode,
  KnowledgeGraph,
  Module,
  RelationType,
  StarterPath,
  StarterPathId,
} from "@/lib/schema";

export interface MapFilters {
  completionStates: CompletionState[];
  difficulties: number[];
  modules: Module[];
  relationTypes: RelationType[];
}

export interface ConceptRecommendation {
  node: CurriculumNode;
  unmetPrerequisiteIds: string[];
  warning: string | null;
  whyRecommended: string;
}

export const defaultMapFilters: MapFilters = {
  completionStates: [],
  difficulties: [],
  modules: [],
  relationTypes: [],
};

export const unmetPrerequisiteWarningThreshold = 2;

function resolveStarterPath(
  graph: KnowledgeGraph,
  starterPathId?: StarterPathId,
  currentNodeId?: string,
) {
  if (starterPathId) {
    const explicit = graph.starterPaths.find((path) => path.id === starterPathId);

    if (explicit) {
      return explicit;
    }
  }

  if (currentNodeId) {
    const containingPath = graph.starterPaths.find((path) =>
      path.nodeIds.includes(currentNodeId),
    );

    if (containingPath) {
      return containingPath;
    }
  }

  return graph.starterPaths[0];
}

export function getNodeSearchText(node: CurriculumNode) {
  return [
    node.title,
    node.shortTitle,
    node.summary,
    node.formalDefinition,
    ...node.aliases,
    ...node.keyQuestions,
    ...node.formulas,
    ...node.examples,
  ]
    .join(" ")
    .toLowerCase();
}

export function searchCurriculumNodes(graph: KnowledgeGraph, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return [...graph.nodes]
    .map((node) => {
      const haystack = getNodeSearchText(node);
      const exactTitleMatch = node.title.toLowerCase() === normalizedQuery ? 0 : 1;
      const exactAliasMatch = node.aliases.some(
        (alias) => alias.toLowerCase() === normalizedQuery,
      )
        ? 0
        : 1;
      const startsWithTitle = node.title.toLowerCase().startsWith(normalizedQuery)
        ? 0
        : 1;
      const includesText = haystack.includes(normalizedQuery) ? 0 : 1;

      return {
        includesText,
        node,
        score: [exactTitleMatch, exactAliasMatch, startsWithTitle, node.difficulty],
      };
    })
    .filter((candidate) => candidate.includesText === 0)
    .sort((left, right) => {
      for (let index = 0; index < left.score.length; index += 1) {
        if (left.score[index] !== right.score[index]) {
          return left.score[index] - right.score[index];
        }
      }

      return left.node.title.localeCompare(right.node.title);
    })
    .map((candidate) => candidate.node);
}

export function getPrerequisiteNodeIds(graph: KnowledgeGraph, nodeId: string) {
  return graph.edges
    .filter(
      (edge) => edge.relationType === "prerequisite_of" && edge.target === nodeId,
    )
    .map((edge) => edge.source)
    .sort((left, right) => {
      const leftNode = graph.nodes.find((node) => node.id === left);
      const rightNode = graph.nodes.find((node) => node.id === right);

      return (leftNode?.title ?? left).localeCompare(rightNode?.title ?? right);
    });
}

export function getDependentNodeIds(graph: KnowledgeGraph, nodeId: string) {
  return graph.edges
    .filter(
      (edge) => edge.relationType === "prerequisite_of" && edge.source === nodeId,
    )
    .map((edge) => edge.target)
    .sort((left, right) => {
      const leftNode = graph.nodes.find((node) => node.id === left);
      const rightNode = graph.nodes.find((node) => node.id === right);

      return (leftNode?.title ?? left).localeCompare(rightNode?.title ?? right);
    });
}

export function getUnmetPrerequisiteIds(
  graph: KnowledgeGraph,
  nodeId: string,
  nodeStatuses: Record<string, LearningStatus>,
) {
  return getPrerequisiteNodeIds(graph, nodeId).filter(
    (prerequisiteId) => !isReadyPrerequisiteStatus(nodeStatuses[prerequisiteId]),
  );
}

export function getUnmetPrerequisiteWarning(
  graph: KnowledgeGraph,
  nodeId: string,
  nodeStatuses: Record<string, LearningStatus>,
) {
  const unmetPrerequisiteIds = getUnmetPrerequisiteIds(graph, nodeId, nodeStatuses);

  if (unmetPrerequisiteIds.length < unmetPrerequisiteWarningThreshold) {
    return null;
  }

  const unmetTitles = unmetPrerequisiteIds
    .map((prerequisiteId) => graph.nodes.find((node) => node.id === prerequisiteId)?.shortTitle)
    .filter((title): title is string => Boolean(title))
    .slice(0, 3);

  return `This concept still depends on ${unmetPrerequisiteIds.length} unmet prerequisites: ${unmetTitles.join(", ")}.`;
}

function includesMatchingRelationType(
  graph: KnowledgeGraph,
  nodeId: string,
  selectedRelationTypes: RelationType[],
) {
  if (selectedRelationTypes.length === 0) {
    return true;
  }

  return graph.edges.some(
    (edge) =>
      selectedRelationTypes.includes(edge.relationType) &&
      (edge.source === nodeId || edge.target === nodeId),
  );
}

export function getFilteredMapNodeIds(
  graph: KnowledgeGraph,
  filters: MapFilters,
  nodeStatuses: Record<string, LearningStatus>,
  query: string,
) {
  const searchResults = query.trim()
    ? new Set(searchCurriculumNodes(graph, query).map((node) => node.id))
    : null;

  return graph.nodes
    .filter((node) => {
      if (searchResults && !searchResults.has(node.id)) {
        return false;
      }

      if (filters.modules.length > 0 && !filters.modules.includes(node.module)) {
        return false;
      }

      if (
        filters.difficulties.length > 0 &&
        !filters.difficulties.includes(node.difficulty)
      ) {
        return false;
      }

      if (
        filters.completionStates.length > 0 &&
        !filters.completionStates.includes(getCompletionState(nodeStatuses[node.id]))
      ) {
        return false;
      }

      return includesMatchingRelationType(
        graph,
        node.id,
        filters.relationTypes,
      );
    })
    .map((node) => node.id);
}

function buildRecommendation(
  graph: KnowledgeGraph,
  nodeId: string,
  whyRecommended: string,
  nodeStatuses: Record<string, LearningStatus>,
) {
  const node = graph.nodes.find((item) => item.id === nodeId);

  if (!node) {
    return null;
  }

  return {
    node,
    unmetPrerequisiteIds: getUnmetPrerequisiteIds(graph, nodeId, nodeStatuses),
    warning: getUnmetPrerequisiteWarning(graph, nodeId, nodeStatuses),
    whyRecommended,
  } satisfies ConceptRecommendation;
}

function sortRecommendationIds(
  graph: KnowledgeGraph,
  nodeIds: string[],
  starterPath: StarterPath,
  nodeStatuses: Record<string, LearningStatus>,
) {
  return [...new Set(nodeIds)].sort((left, right) => {
    const leftUnmet = getUnmetPrerequisiteIds(graph, left, nodeStatuses).length;
    const rightUnmet = getUnmetPrerequisiteIds(graph, right, nodeStatuses).length;

    if (leftUnmet !== rightUnmet) {
      return leftUnmet - rightUnmet;
    }

    const leftPathIndex = starterPath.nodeIds.indexOf(left);
    const rightPathIndex = starterPath.nodeIds.indexOf(right);

    if (leftPathIndex !== rightPathIndex) {
      if (leftPathIndex === -1) {
        return 1;
      }

      if (rightPathIndex === -1) {
        return -1;
      }

      return leftPathIndex - rightPathIndex;
    }

    const leftNode = graph.nodes.find((node) => node.id === left);
    const rightNode = graph.nodes.find((node) => node.id === right);

    if ((leftNode?.difficulty ?? 0) !== (rightNode?.difficulty ?? 0)) {
      return (leftNode?.difficulty ?? 0) - (rightNode?.difficulty ?? 0);
    }

    return (leftNode?.title ?? left).localeCompare(rightNode?.title ?? right);
  });
}

export function getRecommendedConcepts(
  graph: KnowledgeGraph,
  {
    currentNodeId,
    limit = 3,
    nodeStatuses,
    starterPathId,
  }: {
    currentNodeId?: string;
    limit?: number;
    nodeStatuses: Record<string, LearningStatus>;
    starterPathId?: StarterPathId;
  },
) {
  const starterPath = resolveStarterPath(graph, starterPathId, currentNodeId);
  const currentPathIndex = currentNodeId
    ? starterPath.nodeIds.indexOf(currentNodeId)
    : -1;
  const recommendations: ConceptRecommendation[] = [];
  const addedIds = new Set<string>();

  const pathCandidates = sortRecommendationIds(
    graph,
    starterPath.nodeIds.filter((nodeId, index) => {
      if (nodeId === currentNodeId || nodeStatuses[nodeId] === "mastered") {
        return false;
      }

      if (currentPathIndex === -1) {
        return true;
      }

      return index > currentPathIndex;
    }),
    starterPath,
    nodeStatuses,
  );

  for (const nodeId of pathCandidates) {
    if (recommendations.length >= Math.min(limit, 2)) {
      break;
    }

    const recommendation = buildRecommendation(
      graph,
      nodeId,
      `Next unfinished step on the ${starterPath.title} path.`,
      nodeStatuses,
    );

    if (recommendation) {
      recommendations.push(recommendation);
      addedIds.add(nodeId);
    }
  }

  if (currentNodeId) {
    const dependentCandidates = sortRecommendationIds(
      graph,
      getDependentNodeIds(graph, currentNodeId).filter(
        (nodeId) => nodeStatuses[nodeId] !== "mastered" && !addedIds.has(nodeId),
      ),
      starterPath,
      nodeStatuses,
    );

    for (const nodeId of dependentCandidates) {
      if (recommendations.length >= limit) {
        break;
      }

      const currentNode = graph.nodes.find((node) => node.id === currentNodeId);
      const recommendation = buildRecommendation(
        graph,
        nodeId,
        `Builds directly on ${currentNode?.shortTitle ?? "the current concept"}.`,
        nodeStatuses,
      );

      if (recommendation) {
        recommendations.push(recommendation);
        addedIds.add(nodeId);
      }
    }
  }

  const readyCandidates = sortRecommendationIds(
    graph,
    graph.nodes
      .map((node) => node.id)
      .filter(
        (nodeId) =>
          nodeId !== currentNodeId &&
          nodeStatuses[nodeId] !== "mastered" &&
          !addedIds.has(nodeId),
      ),
    starterPath,
    nodeStatuses,
  );

  for (const nodeId of readyCandidates) {
    if (recommendations.length >= limit) {
      break;
    }

    const unmetPrerequisites = getUnmetPrerequisiteIds(graph, nodeId, nodeStatuses);

    if (unmetPrerequisites.length > 1) {
      continue;
    }

    const recommendation = buildRecommendation(
      graph,
      nodeId,
      unmetPrerequisites.length === 0
        ? "Its prerequisites are already satisfied, so it is ready for study."
        : "It is nearly ready and only depends on one remaining prerequisite.",
      nodeStatuses,
    );

    if (recommendation) {
      recommendations.push(recommendation);
      addedIds.add(nodeId);
    }
  }

  return recommendations;
}
