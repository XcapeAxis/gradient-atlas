"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getNextMotionPreference,
  type MotionPreference,
} from "@/lib/motion";

interface UiPreferencesState {
  motionPreference: MotionPreference;
  cycleMotionPreference: () => void;
  setMotionPreference: (motionPreference: MotionPreference) => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set, get) => ({
      motionPreference: "system",
      cycleMotionPreference: () => {
        set({
          motionPreference: getNextMotionPreference(get().motionPreference),
        });
      },
      setMotionPreference: (motionPreference) => set({ motionPreference }),
    }),
    {
      name: "gradient-atlas-ui-preferences",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
