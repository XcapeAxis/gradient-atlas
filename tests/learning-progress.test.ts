import {
  createLearningProgressSeedState,
  demoLearningProgressSeed,
  learningProgressStorageKey,
  shouldApplyDemoSeed,
} from "@/lib/demo-seed";
import { useLearningProgressStore } from "@/stores/learning-progress";

describe("learning progress demo seed", () => {
  beforeEach(() => {
    localStorage.clear();
    useLearningProgressStore.setState({
      ...createLearningProgressSeedState(),
    });
  });

  it("detects when an empty browser state should receive the demo seed", () => {
    expect(shouldApplyDemoSeed(null)).toBe(true);
    expect(
      shouldApplyDemoSeed(
        JSON.stringify({
          state: {
            currentNodeId: "decision-tree",
            currentStarterPathId: "interview-oriented",
            nodeStatuses: {
              "decision-tree": "understood",
            },
          },
          version: 0,
        }),
      ),
    ).toBe(false);
  });

  it("writes the demo seed to local storage when the store is empty in this browser", () => {
    useLearningProgressStore.getState().ensureDemoSeed();

    expect(useLearningProgressStore.getState().currentNodeId).toBe(
      demoLearningProgressSeed.currentNodeId,
    );

    const persisted = localStorage.getItem(learningProgressStorageKey);

    expect(persisted).toContain(demoLearningProgressSeed.currentNodeId);
    expect(persisted).toContain("absolute-beginner");
  });
});
