import type { LearningStatus } from "@/lib/progress";
import type { StarterPathId } from "@/lib/schema";

export interface LearningProgressSnapshot {
  currentNodeId: string;
  currentStarterPathId?: StarterPathId;
  nodeStatuses: Record<string, LearningStatus>;
}

export const learningProgressStorageKey = "gradient-atlas-learning-progress";

export const demoLearningProgressSeed: LearningProgressSnapshot = {
  currentNodeId: "logistic-regression",
  currentStarterPathId: "absolute-beginner",
  nodeStatuses: {
    dataset: "mastered",
    "features-and-targets": "mastered",
    "supervised-learning": "mastered",
    "train-validation-test-split": "understood",
    "linear-regression": "understood",
    "mean-squared-error": "understood",
    "logistic-regression": "exploring",
  },
};

export function createLearningProgressSeedState(): LearningProgressSnapshot {
  return {
    currentNodeId: demoLearningProgressSeed.currentNodeId,
    currentStarterPathId: demoLearningProgressSeed.currentStarterPathId,
    nodeStatuses: { ...demoLearningProgressSeed.nodeStatuses },
  };
}

export function shouldApplyDemoSeed(rawPersistedValue: string | null) {
  return !rawPersistedValue;
}
