"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_ML_NODE_ID } from "@/data/ml-fundamentals";
import type { LearningStatus } from "@/lib/progress";
import type { StarterPathId } from "@/lib/schema";

interface LearningProgressState {
  currentNodeId: string;
  currentStarterPathId?: StarterPathId;
  nodeStatuses: Record<string, LearningStatus>;
  setCurrentNodeId: (nodeId: string) => void;
  setCurrentStarterPathId: (starterPathId: StarterPathId) => void;
  setNodeStatus: (nodeId: string, status: LearningStatus) => void;
}

export const initialLearningProgressState = {
  currentNodeId: DEFAULT_ML_NODE_ID,
  currentStarterPathId: undefined,
  nodeStatuses: {},
} satisfies Pick<
  LearningProgressState,
  "currentNodeId" | "currentStarterPathId" | "nodeStatuses"
>;

export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set) => ({
      ...initialLearningProgressState,
      setCurrentNodeId: (currentNodeId) => set({ currentNodeId }),
      setCurrentStarterPathId: (currentStarterPathId) =>
        set({ currentStarterPathId }),
      setNodeStatus: (nodeId, status) =>
        set((state) => ({
          nodeStatuses: {
            ...state.nodeStatuses,
            [nodeId]: status,
          },
        })),
    }),
    {
      name: "gradient-atlas-learning-progress",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
