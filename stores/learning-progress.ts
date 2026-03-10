"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  createLearningProgressSeedState,
  learningProgressStorageKey,
  shouldApplyDemoSeed,
  type LearningProgressSnapshot,
} from "@/lib/demo-seed";
import type { LearningStatus } from "@/lib/progress";
import type { StarterPathId } from "@/lib/schema";

interface LearningProgressState extends LearningProgressSnapshot {
  ensureDemoSeed: () => void;
  setCurrentNodeId: (nodeId: string) => void;
  setCurrentStarterPathId: (starterPathId: StarterPathId) => void;
  setNodeStatus: (nodeId: string, status: LearningStatus) => void;
}

export const initialLearningProgressState = createLearningProgressSeedState();

export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set) => ({
      ...createLearningProgressSeedState(),
      ensureDemoSeed: () => {
        if (
          typeof window === "undefined" ||
          !shouldApplyDemoSeed(localStorage.getItem(learningProgressStorageKey))
        ) {
          return;
        }

        set(() => createLearningProgressSeedState());
      },
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
      name: learningProgressStorageKey,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
