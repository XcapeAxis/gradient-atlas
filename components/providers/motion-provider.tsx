"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import {
  resolveMotionMode,
  toFramerReducedMotion,
  type MotionMode,
  type MotionPreference,
} from "@/lib/motion";
import { useUiPreferencesStore } from "@/stores/ui-preferences";

const MotionSettingsContext = createContext<{
  motionMode: MotionMode;
  motionPreference: MotionPreference;
}>({
  motionMode: "full",
  motionPreference: "system",
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const motionPreference = useUiPreferencesStore(
    (state) => state.motionPreference,
  );
  const systemPrefersReducedMotion = useReducedMotion();
  const motionMode = resolveMotionMode(
    motionPreference,
    Boolean(systemPrefersReducedMotion),
  );

  return (
    <MotionSettingsContext.Provider value={{ motionMode, motionPreference }}>
      <MotionConfig reducedMotion={toFramerReducedMotion(motionMode)}>
        {children}
      </MotionConfig>
    </MotionSettingsContext.Provider>
  );
}

export function useMotionSettings() {
  return useContext(MotionSettingsContext);
}
