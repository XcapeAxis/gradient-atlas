"use client";

import { useEffect } from "react";
import { useLearningProgressStore } from "@/stores/learning-progress";

export function LearningProgressBootstrap() {
  const ensureDemoSeed = useLearningProgressStore((state) => state.ensureDemoSeed);

  useEffect(() => {
    ensureDemoSeed();
  }, [ensureDemoSeed]);

  return null;
}
