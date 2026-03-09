import type { KnowledgeGraph, Module } from "@/lib/schema";

export type LearningStatus = "exploring" | "understood" | "mastered";
export type CompletionState =
  | "not-started"
  | "exploring"
  | "understood"
  | "mastered";

export function getCompletionState(status?: LearningStatus): CompletionState {
  return status ?? "not-started";
}

export function isReadyPrerequisiteStatus(status?: LearningStatus) {
  return status === "understood" || status === "mastered";
}

export function isCompletedStatus(status?: LearningStatus) {
  return status === "mastered";
}

export function getOverallProgressSummary(
  graph: KnowledgeGraph,
  nodeStatuses: Record<string, LearningStatus>,
) {
  const total = graph.nodes.length;
  const counts = {
    exploring: 0,
    mastered: 0,
    notStarted: 0,
    understood: 0,
  };

  for (const node of graph.nodes) {
    const completionState = getCompletionState(nodeStatuses[node.id]);

    switch (completionState) {
      case "exploring":
        counts.exploring += 1;
        break;
      case "understood":
        counts.understood += 1;
        break;
      case "mastered":
        counts.mastered += 1;
        break;
      default:
        counts.notStarted += 1;
    }
  }

  return {
    ...counts,
    percentComplete: total === 0 ? 0 : Math.round((counts.mastered / total) * 100),
    total,
    touched: total - counts.notStarted,
  };
}

export function getModuleProgressSummary(
  graph: KnowledgeGraph,
  module: Module,
  nodeStatuses: Record<string, LearningStatus>,
) {
  const moduleNodes = graph.nodes.filter((node) => node.module === module);
  const total = moduleNodes.length;
  let mastered = 0;
  let ready = 0;

  for (const node of moduleNodes) {
    if (isReadyPrerequisiteStatus(nodeStatuses[node.id])) {
      ready += 1;
    }

    if (isCompletedStatus(nodeStatuses[node.id])) {
      mastered += 1;
    }
  }

  return {
    mastered,
    module,
    percentReady: total === 0 ? 0 : Math.round((ready / total) * 100),
    ready,
    total,
  };
}
