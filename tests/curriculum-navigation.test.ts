import {
  getRecommendedConcepts,
  getUnmetPrerequisiteWarning,
  searchCurriculumNodes,
} from "@/lib/curriculum-navigation";
import { mlFundamentalsGraph } from "@/data/ml-fundamentals";

describe("curriculum navigation helpers", () => {
  it("searches by title, alias, and key term", () => {
    expect(searchCurriculumNodes(mlFundamentalsGraph, "logistic")[0]?.id).toBe(
      "logistic-regression",
    );
    expect(searchCurriculumNodes(mlFundamentalsGraph, "OLS")[0]?.id).toBe(
      "linear-regression",
    );
    expect(searchCurriculumNodes(mlFundamentalsGraph, "spam filtering")[0]?.id).toBe(
      "supervised-learning",
    );
  });

  it("recommends explainable next concepts from path order and readiness", () => {
    const recommendations = getRecommendedConcepts(mlFundamentalsGraph, {
      currentNodeId: "linear-regression",
      nodeStatuses: {
        dataset: "mastered",
        "features-and-targets": "mastered",
        "supervised-learning": "understood",
        "train-validation-test-split": "understood",
        "linear-regression": "understood",
      },
      starterPathId: "absolute-beginner",
    });

    expect(recommendations).toHaveLength(3);
    expect(recommendations[0]?.node.id).toBe("mean-squared-error");
    expect(recommendations[0]?.whyRecommended).toContain(
      "Absolute Beginner path",
    );
    expect(
      recommendations.some((recommendation) => recommendation.node.id === "regularization"),
    ).toBe(true);
  });

  it("warns when a concept has too many unmet prerequisites", () => {
    expect(
      getUnmetPrerequisiteWarning(mlFundamentalsGraph, "random-forest", {
        dataset: "mastered",
      }),
    ).toContain("unmet prerequisites");
    expect(
      getUnmetPrerequisiteWarning(mlFundamentalsGraph, "linear-regression", {
        "features-and-targets": "understood",
      }),
    ).toBeNull();
  });
});
